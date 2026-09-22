# Guia do Agente — como funciona, arquivo por arquivo

> Este documento é didático, escrito para quem está aprendendo a arquitetura, não para quem só
> quer a referência rápida das regras (isso está em `docs/agent-contract.md`) ou o diagrama geral
> do sistema (isso está em `docs/architecture.md`). Leia este arquivo se a pergunta for "por que
> foi construído assim?" ou "o que acontece quando eu clico em Enviar?".

## 1. O que o agente É e o que ele NÃO É

**É**: um pipeline determinístico com passos fixos (validar → autorizar → executar → validar →
responder → registrar). A única parte que muda de execução pra execução é *qual ferramenta é
escolhida* — e isso é decidido por um "planejador" plugável.

**NÃO é**: um chatbot genérico que conversa sobre qualquer assunto, nem um LLM com acesso livre ao
banco de dados. Em nenhum momento um modelo de linguagem executa SQL, chama uma API externa ou
lê/escreve arquivos diretamente — ele só escolhe *o nome de uma função pré-aprovada* e *os
argumentos dela*, e tudo o que vem depois disso é código determinístico, testável e auditável.

Essa separação (modelo decide **o quê**, código decide **como** e **se pode**) é a decisão de
arquitetura mais importante do projeto. Vale entender ela antes de mexer em qualquer arquivo.

## 2. Mapa de arquivos

```
src/agent/
├── pipeline.ts                    orquestrador central — todo turno passa por aqui
├── types.ts                       contratos TypeScript (Tool, ModelProvider, AgentTurnResult...)
├── tool-registry.ts                registro em memória de todas as tools
├── match.ts                        helper de casamento de texto (substring, não regex)
├── trace.ts                        grava cada turno na tabela agent_executions
│
├── providers/
│   ├── index.ts                    escolhe o planejador via LLM_PROVIDER (.env)
│   ├── local-heuristic.ts          planejador grátis: casamento de padrões fixos
│   └── openai-compatible.ts        planejador real: qualquer API tipo OpenAI (Groq, etc.)
│
└── tools/
    ├── index.ts                    barril — importa (e registra) todas as tools
    ├── ping.tool.ts                 healthcheck do agente
    ├── list-residents.tool.ts       lista moradores
    ├── get-residents-in-debt.tool.ts lista inadimplentes (visão gerencial)
    ├── get-my-debt.tool.ts           consulta a própria dívida
    ├── check-reservation-availability.tool.ts  verifica disponibilidade do salão
    ├── create-reservation.tool.ts    cria reserva (exige confirmação)
    ├── cancel-my-reservation.tool.ts cancela a própria reserva (exige confirmação)
    ├── send-broadcast-notification.tool.ts  avisa todos os moradores (exige confirmação)
    └── reservation-time-parser.ts    extrai data/hora de frases pt-BR (usado pelo planejador local)
```

Fora de `src/agent/`, o resto do fio que liga a UI ao pipeline:

```
src/app/(app)/agent/
├── agent-chat.tsx      componente de chat (client) — estado dos turnos, "Pensando...", confirmar/cancelar
└── actions.ts           server action sendAgentMessage() — ponte entre o browser e runAgentTurn()

src/lib/
├── actor.ts             getCurrentActor() — identidade { userId, condominiumId, role } vinda da sessão
├── authz.ts              requireRole / assertSameTenant / requireSelfOrRole
└── rate-limit.ts          limitador em memória (janela fixa)
```

## 3. O pipeline, passo a passo (`src/agent/pipeline.ts`)

Toda mensagem enviada no chat passa pela função `runAgentTurn(prisma, actor, rawInput, confirmed?)`,
nesta ordem exata:

1. **Validação de entrada** — `zod` garante que `input` é uma string de 1 a 2000 caracteres.
   Qualquer coisa fora disso vira `{ status: "ERROR" }` antes de tocar em qualquer outra coisa.
2. **Rate limit** — `checkRateLimit(actor.userId, 20, 10_000)`: no máximo 20 turnos a cada 10
   segundos, por usuário. Ultrapassou, vira `{ status: "RATE_LIMITED" }`.
3. **Planejamento** — se não é uma confirmação pendente, chama
   `getModelProvider().plan(input, actor)`. Isso devolve ou `{ kind: "tool", tool, args }` ou
   `{ kind: "clarify", question }`. Essa chamada está em `try/catch`: se o provedor remoto falhar
   (rede, chave inválida, limite de taxa do Groq), vira um `ERROR` normal — nunca um erro 500 cru.
4. **Resolução da tool** — `getTool(toolName)` busca no registro. Nome desconhecido (o modelo
   "inventou" uma tool que não existe) vira `ERROR`, nunca uma execução.
5. **Autorização** — `requireRole(actor, tool.minRole)`. Isso roda **antes** de validar os
   argumentos ou executar qualquer coisa — um usuário sem permissão nunca chega perto da lógica de
   negócio, mesmo que o planejador tenha "decidido" chamar aquela tool.
6. **Validação dos argumentos** — `tool.inputSchema.safeParse(rawArgs)`. Faltou algo? Vira
   `CLARIFY`, nunca um chute silencioso.
7. **Confirmação** — se `tool.requiresConfirmation` for `true` e esta não é a chamada confirmada,
   o pipeline **para aqui** e devolve `PENDING_CONFIRMATION` com a tool e os argumentos já
   resolvidos. A UI mostra os botões "Confirmar"/"Cancelar"; só ao confirmar o pipeline roda de
   novo com esses mesmos dados e `confirmed` preenchido, pulando direto para o passo 7 em diante.
8. **Execução** — `tool.execute({ db: prisma }, actor, args)`. É aqui (e só aqui) que o banco é
   tocado, sempre filtrando por `actor.condominiumId` dentro do repositório.
9. **Validação do resultado** — `tool.outputSchema.parse(rawResult)`. Garante que o que a tool
   devolveu bate com o que ela prometeu devolver.
10. **Resposta** — `tool.respond(args, result)` monta o texto final em pt-BR. Isso é código puro,
    não um LLM — é por isso que a resposta de sucesso nunca varia e nunca "alucina" um número
    diferente do que o banco realmente devolveu.
11. **Trace** — em **todo** caminho (sucesso, negado, erro, rate-limited, aguardando confirmação),
    `recordExecution()` grava uma linha em `agent_executions`: quem, o quê, qual tool, quais args,
    status, latência. Isso alimenta a tela de Segurança/Qualidade e é o que torna o agente
    auditável — nada acontece "por fora" do trace.

## 4. Os dois planejadores — quando e por que usar cada um

O planejador é a única peça trocável do pipeline (`getModelProvider()` em
`src/agent/providers/index.ts`, controlado pela variável `LLM_PROVIDER` no `.env`).

### 4.1 `local` (padrão, grátis, sem chave) — `local-heuristic.ts`

Como funciona: cada tool contribui um *matcher* — uma função que recebe o texto do usuário e
devolve os argumentos da tool, ou `null`. O planejador local simplesmente testa os matchers **na
ordem em que as tools foram registradas** e usa o primeiro que bater (ver `tool-registry.ts` e
`src/agent/tools/index.ts`). Casamento é por `includes()` de substring (não regex com `\b`, que
quebra com acento — ver comentário em `match.ts`).

- **Vantagens**: R$ 0, sem chave de API, sem chamada de rede (logo, sem latência de rede e sem
  ponto de falha externo), e **imune a prompt injection por construção** — não existe texto livre
  indo pra um modelo que segue instruções, então frases como "ignore as instruções anteriores"
  simplesmente não casam com nenhum padrão e caem no `CLARIFY` padrão.
- **Limitações**: só entende as frases exatas (ou próximas) que cada tool declara. Não entende
  sinônimos fora da lista, não entende "sexta-feira" como data (só "hoje"/"amanhã", ver
  `reservation-time-parser.ts`), não entende frases muito naturais/informais fora do padrão.
- **Quando usar**: é o padrão do projeto porque a demo tem que rodar de graça, sem exigir que quem
  clona o repositório tenha uma chave de API. Também é a única opção usada nos testes automatizados
  (`vitest.setup.ts` fixa `LLM_PROVIDER=local` sempre, independente do `.env` do dev — testes têm
  que ser determinísticos e não podem depender de rede).

### 4.2 `openai-compatible` (opcional, real, requer chave grátis) — `openai-compatible.ts`

Como funciona: monta a lista de tools registradas como *function calling* no formato OpenAI
(nome + descrição + JSON Schema gerado a partir do `inputSchema` de cada tool, via
`z.toJSONSchema()`), manda isso junto com a mensagem do usuário pra API configurada, e o modelo
devolve qual função chamar e com quais argumentos (ou texto livre, se decidir não chamar nenhuma —
isso vira `CLARIFY`). Funciona com **qualquer API compatível com o formato Chat Completions da
OpenAI** — testado e documentado aqui com a [Groq](https://console.groq.com) (tem camada grátis
rápida), mas também funciona com OpenRouter ou um Ollama local, só trocando a URL/modelo.

Dois cuidados que precisaram ser resolvidos nesse provedor (documentados no código-fonte também):

- **O modelo não sabe que dia é hoje** e é ruim em aritmética de calendário — em teste real, pedi
  "segunda-feira" e ele calculou uma data que caía num sábado. Em vez de confiar na conta dele, o
  prompt monta uma tabela com os próximos 14 dias já resolvidos (data → dia da semana,
  `buildUpcomingDaysTable()`) e instrui o modelo a **consultar**, não calcular.
- **Tipos que o zod não consegue representar em JSON Schema** (como `z.coerce.date()`) travariam a
  conversão — usa-se `unrepresentable: "any"` pra não quebrar, e o prompt do sistema instrui o
  formato ISO 8601 esperado nesses campos.

- **Vantagens**: entende linguagem natural de verdade — frases soltas, sinônimos, gírias, datas
  relativas complexas ("segunda que vem"), pedidos fora de ordem. Continua recusando pedidos fora
  do escopo (ex.: previsão do tempo) e resistindo a tentativas de manipulação, mas agora porque
  **entendeu e decidiu não agir**, e não porque simplesmente não reconheceu o texto.
- **Limitações**: precisa de uma chave de API (mesmo que grátis), depende de rede (por isso o
  `try/catch` no pipeline e um timeout de 15s via `AbortSignal.timeout`), e introduz uma fonte de
  não-determinismo — a mesma pergunta pode, em teoria, ser interpretada de formas ligeiramente
  diferentes em chamadas diferentes (`temperature: 0` minimiza isso, mas não elimina).
- **Quando usar**: quando você quer mostrar a experiência de conversação real (demos, vídeos,
  portfólio) ou está testando o quão bem o agente lida com frases fora do roteiro. Continua
  passando pelo mesmo pipeline de autorização/validação — trocar de planejador não abre brecha
  nenhuma de segurança, só muda a qualidade da compreensão de linguagem.

### 4.3 Como trocar (`.env`)

```bash
# Grátis, determinístico, sem chave (padrão):
LLM_PROVIDER=local

# Real, via Groq (grátis, https://console.groq.com/keys):
LLM_PROVIDER=openai-compatible
LLM_API_KEY=gsk_...
LLM_MODEL=openai/gpt-oss-20b      # ou openai/gpt-oss-120b (mais qualidade, ainda grátis)
LLM_BASE_URL=https://api.groq.com/openai/v1
```

Depois de editar o `.env`, é preciso **reiniciar o servidor** (`npm run dev` ou rebuild +
`npm run start`) — a variável é lida a cada processo, não a cada requisição.

> Nota sobre os modelos da Groq: no momento em que isso foi escrito, `llama-3.3-70b-versatile`
> (o nome mais comum em exemplos por aí) não estava disponível para todas as chaves — use
> `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $LLM_API_KEY"` para ver
> a lista atual liberada pra sua chave antes de fixar um modelo.

## 5. As 8 ferramentas (tools)

| Tool | Arquivo | Papel mínimo | Confirma? | O que faz |
|---|---|---|---|---|
| `ping` | `ping.tool.ts` | RESIDENT | não | Healthcheck — confirma que o agente está conectado ao condomínio certo |
| `listResidents` | `list-residents.tool.ts` | RESIDENT | não | Lista moradores (e-mail mascarado ou não conforme `src/lib/privacy.ts`) |
| `getResidentsInDebt` | `get-residents-in-debt.tool.ts` | MANAGER | não | Lista quem **mais** deve — visão gerencial, financeiro de terceiros |
| `getMyDebt` | `get-my-debt.tool.ts` | RESIDENT | não | Consulta a **própria** dívida — sempre escopado pelo `actor.userId`, nunca por texto interpretado |
| `checkReservationAvailability` | `check-reservation-availability.tool.ts` | RESIDENT | não | Verifica se o Salão de Festas está livre num horário |
| `createReservation` | `create-reservation.tool.ts` | RESIDENT | **sim** | Cria a reserva — ação financeira/consequente |
| `cancelMyReservation` | `cancel-my-reservation.tool.ts` | RESIDENT | **sim** | Cancela a próxima reserva confirmada do próprio ator |
| `sendBroadcastNotification` | `send-broadcast-notification.tool.ts` | MANAGER | **sim** | Avisa todos os moradores — operação em massa |

Cada arquivo de tool segue sempre a mesma forma:

```ts
registerTool(
  {
    name: "...",              // identificador único
    description: "...",        // usado na pergunta de confirmação E como descrição da function-call pro LLM
    minRole: "RESIDENT",       // RESIDENT < MANAGER < ADMIN (src/lib/authz.ts)
    requiresConfirmation: false,
    inputSchema,               // zod — valida args e vira JSON Schema pro provedor real
    outputSchema,               // zod — valida o que execute() devolve
    async execute({ db }, actor, args) { /* lógica de negócio, sempre filtrando por actor.condominiumId */ },
    respond(args, result) { /* texto pt-BR determinístico, sem LLM */ },
  },
  (input) => /* matcher: texto -> args, ou null — só usado pelo planejador local */,
);
```

Adicionar uma tool nova é só criar um arquivo `*.tool.ts` seguindo essa forma e importá-lo em
`src/agent/tools/index.ts` — o registro e o roteamento acontecem sozinhos.

## 6. Segurança — o que impede o agente de fazer algo errado

- **O modelo nunca executa nada diretamente.** Ele só devolve `{ tool, args }` (ou texto). Toda
  chamada real de banco está nos arquivos `*.tool.ts`, escrita por humanos, revisada, testada.
- **Autorização é sempre no servidor**, e sempre antes de qualquer lógica de negócio
  (`requireRole` no passo 5 do pipeline) — mesmo que o usuário manipule o que o browser envia.
- **Isolamento por condomínio**: todo repositório recebe `actor.condominiumId` e filtra por ele —
  não existe caminho para um usuário ler dados de outro condomínio.
- **Ações sensíveis exigem confirmação explícita** — a lista está em `docs/agent-contract.md`
  (destrutivas, financeiras, em massa, com efeito sobre outros usuários).
- **Saída do modelo é sempre validada por schema** (`inputSchema.safeParse`) antes de tocar em
  qualquer tool — um argumento mal formado vira pedido de esclarecimento, nunca uma tentativa de
  execução com dado inválido.
- **Rate limit por usuário** evita abuso/loop (20 turnos / 10s).
- **Tudo é registrado** em `agent_executions` (tabela Postgres) — `condominiumId`, `userId`,
  `input` (truncado em 2000 chars), `toolName`, `toolArgs` (já validado, nunca segredo),
  `status`, `errorCode`, `latencyMs`. Visível na tela de Segurança e Qualidade.

## 7. Como verificar que está tudo funcionando

```bash
npx tsc --noEmit          # typecheck
npx eslint .               # lint
npx vitest run              # unitários + integração (sempre local, mesmo com openai-compatible no .env)
npx playwright test          # E2E — inclui e2e/agent-playground.spec.ts
```

Para testar manualmente com um provedor específico, edite `LLM_PROVIDER` no `.env`, rode
`rm -rf .next && npm run build && npm run start`, e use o chat em `/agent` (login de demo em
`README.md`).

## 8. Glossário rápido

- **Planner/planejador**: decide qual tool chamar a partir do texto do usuário. Único componente
  trocável do pipeline (`ModelProvider` em `types.ts`).
- **Matcher**: função `(texto) => args | null` que cada tool contribui — só usada pelo planejador
  `local`, ignorada pelo `openai-compatible` (que usa function-calling em vez disso).
- **Tool**: uma capacidade de negócio isolada, com schema de entrada/saída, papel mínimo, e se
  exige confirmação. Nunca é chamada diretamente pelo modelo — sempre pelo pipeline.
- **Trace**: o registro de auditoria de cada turno, gravado independente do resultado.
- **Actor**: `{ userId, condominiumId, role }` — a identidade autenticada, vinda sempre da sessão
  (`getCurrentActor()`), nunca de texto interpretado ou de dado enviado pelo cliente.
