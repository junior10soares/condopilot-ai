import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/actor";

const capabilities = [
  { title: "Moradores", description: "Diretório com visibilidade controlada por papel." },
  { title: "Financeiro", description: "Consulta de inadimplência com regras de visibilidade." },
  { title: "Reservas", description: "Disponibilidade, conflito e confirmação de áreas comuns." },
  { title: "Notificações", description: "Avisos simulados com trilha de auditoria." },
  { title: "Segurança", description: "Ações negadas e limites de taxa, sempre visíveis." },
  { title: "Qualidade", description: "Status de testes e release gates, ao vivo." },
];

const principles = [
  {
    title: "Spec-driven",
    description: "Cada funcionalidade nasce de uma spec, não de um palpite.",
  },
  {
    title: "Seguro por padrão",
    description: "Autorização no servidor, isolamento por condomínio, tudo testado.",
  },
  {
    title: "Agente com rédeas curtas",
    description: "Ferramentas tipadas, confirmação em ações sensíveis, sem SQL livre.",
  },
  {
    title: "Observável",
    description: "Todo turno do agente vira um registro de execução — sucesso, negado ou erro.",
  },
];

export default async function LandingPage() {
  const actor = await getCurrentActor();
  if (actor) redirect("/dashboard");

  return (
    <main className="bg-background">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-text text-sm font-semibold">CondoPilot AI</span>
        <Link href="/sign-in" className="text-muted hover:text-text text-sm">
          Entrar
        </Link>
      </nav>

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-16 pb-20 text-center">
        <h1 className="text-text text-4xl font-semibold sm:text-5xl">
          Um agente de IA que não só responde.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Ele age.
          </span>
        </h1>
        <p className="text-muted max-w-xl">
          CondoPilot AI combina IA conversacional, ferramentas de negócio seguras, execução de
          workflows e observabilidade em uma demonstração de engenharia de agentes aplicada à gestão
          de condomínios.
        </p>
        <Link
          href="/sign-in"
          className="rounded-lg px-5 py-2.5 font-medium text-white transition-opacity duration-[var(--duration-micro)] hover:opacity-90"
          style={{ background: "var(--gradient-brand)" }}
        >
          Entrar na demo
        </Link>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <p className="text-muted text-center text-xs tracking-wide uppercase">
          Demonstração (exemplo estático)
        </p>
        <div className="border-border bg-surface mt-4 space-y-3 rounded-2xl border p-6">
          <div className="bg-surface-elevated text-text ml-auto max-w-[80%] rounded-xl rounded-br-sm px-3 py-2 text-sm">
            Quais moradores estão inadimplentes?
          </div>
          <div className="border-border text-text max-w-[85%] rounded-xl rounded-bl-sm border px-3 py-2 text-sm">
            <p>2 morador(es) inadimplente(s): Fernanda Costa (Apto 105): R$ 630,00.</p>
            <p className="text-muted mt-1.5 text-xs">
              ferramenta: getResidentsInDebt · autorizado para síndico
            </p>
          </div>
          <div className="bg-surface-elevated text-text ml-auto max-w-[80%] rounded-xl rounded-br-sm px-3 py-2 text-sm">
            Reserve o salão para Carlos amanhã às 19h.
          </div>
          <div className="border-border text-text max-w-[85%] rounded-xl rounded-bl-sm border px-3 py-2 text-sm">
            <p>Confirma esta ação: Reserva o Salão de Festas?</p>
            <p className="text-muted mt-1.5 text-xs">
              ferramenta: createReservation · aguardando confirmação
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-muted text-center text-sm font-semibold tracking-wide uppercase">
          Capacidades
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="border-border bg-surface rounded-xl border p-5">
              <p className="text-text font-medium">{c.title}</p>
              <p className="text-muted mt-1 text-sm">{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-muted text-center text-sm font-semibold tracking-wide uppercase">
          Princípios de engenharia
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title} className="border-border bg-surface-elevated rounded-xl border p-5">
              <p className="text-text font-medium">{p.title}</p>
              <p className="text-muted mt-1 text-sm">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-border text-muted border-t px-6 py-8 text-center text-xs">
        CondoPilot AI — projeto de portfólio. Nenhuma afirmação de &quot;pronto para produção&quot;
        é feita além do que os release gates comprovam (ver Central de Qualidade após entrar).
      </footer>
    </main>
  );
}
