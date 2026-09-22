import { z } from "zod";
import type { ModelProvider } from "@/agent/types";
import { listTools } from "@/agent/tool-registry";

/**
 * Provedor de planejamento usando um modelo real, via qualquer API compatível
 * com o formato OpenAI Chat Completions (Groq, OpenRouter, Ollama local, etc.).
 * Configurado por LLM_API_KEY / LLM_MODEL / LLM_BASE_URL no .env.
 *
 * O modelo só escolhe QUAL ferramenta chamar e COM QUAIS argumentos — nunca
 * executa nada diretamente. A saída dele passa pelo mesmo pipeline de sempre
 * (authz, validação de schema, confirmação, execução), exatamente como a
 * saída do planejador local. Ver docs/agent-contract.md.
 */
// O modelo não tem noção de "agora" e é ruim em aritmética de calendário — testado na prática:
// mesmo informado de que "hoje é terça, 22/09", calculou "segunda-feira" como 26/09 (que é sábado).
// Em vez de pedir pra ele calcular, a gente entrega os próximos 14 dias já resolvidos
// (data + dia da semana) e instrui a só fazer uma busca na tabela, não conta.
function buildUpcomingDaysTable(now: Date): string {
  const lines: string[] = [];
  for (let offset = 0; offset < 14; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const label = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : null;
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const isoDate = date.toISOString().slice(0, 10);
    lines.push(`${isoDate} = ${weekday}${label ? ` (${label})` : ""}`);
  }
  return lines.join("\n");
}

function buildSystemPrompt(now: Date): string {
  const nowLabel = now.toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    "Você é o planejador do agente CondoPilot AI, um sistema de gestão de condomínios. " +
    "Sua única função é escolher, entre as ferramentas disponíveis, a que corresponde ao pedido " +
    "do usuário, extraindo os argumentos necessários. Nunca invente dados que não estejam no " +
    "pedido do usuário. Se o pedido não corresponder a nenhuma ferramenta, ou faltar alguma " +
    "informação necessária, não chame nenhuma ferramenta — apenas responda pedindo esclarecimento " +
    "em português do Brasil, de forma breve e educada. " +
    `Agora é ${nowLabel} (horário de Brasília). Para resolver datas relativas ('amanhã', ` +
    "'segunda-feira', 'semana que vem'), NÃO calcule — apenas procure o dia da semana pedido " +
    `nesta tabela dos próximos 14 dias e use a data correspondente:\n${buildUpcomingDaysTable(now)}\n` +
    "Quando um argumento for uma data/hora, use sempre o formato ISO 8601 " +
    "(ex: 2026-09-23T19:00:00). Reservas do Salão de Festas duram 3 horas por padrão — se o " +
    "usuário não disser a duração, calcule o horário de término somando 3 horas ao início em " +
    "vez de perguntar."
  );
}

const REQUEST_TIMEOUT_MS = 15_000;

export const openaiCompatibleProvider: ModelProvider = {
  name: "openai-compatible",
  async plan(input) {
    const apiKey = process.env.LLM_API_KEY;
    const baseUrl = process.env.LLM_BASE_URL;
    const model = process.env.LLM_MODEL;
    if (!apiKey || !baseUrl || !model) {
      throw new Error(
        "LLM_PROVIDER=openai-compatible requer LLM_API_KEY, LLM_BASE_URL e LLM_MODEL no .env.",
      );
    }

    const tools = listTools().map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        // "any": alguns tipos (ex: z.coerce.date()) não têm equivalente em JSON Schema puro —
        // em vez de travar a conversão, viram campo sem restrição de formato (o prompt do
        // sistema instrui o formato ISO 8601 esperado nesses casos).
        parameters: z.toJSONSchema(tool.inputSchema, { unrepresentable: "any" }),
      },
    }));

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt(new Date()) },
          { role: "user", content: input },
        ],
        tools,
        tool_choice: "auto",
        temperature: 0,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Falha ao consultar o provedor de LLM (HTTP ${response.status}).`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const call = message?.tool_calls?.[0];

    if (!call) {
      const content = typeof message?.content === "string" ? message.content.trim() : "";
      return {
        kind: "clarify",
        question: content || "Não entendi o pedido. Pode reformular?",
      };
    }

    let args: unknown;
    try {
      args = JSON.parse(call.function.arguments);
    } catch {
      return {
        kind: "clarify",
        question: "Não consegui interpretar os detalhes do pedido. Pode reformular?",
      };
    }

    return { kind: "tool", tool: call.function.name, args };
  },
};
