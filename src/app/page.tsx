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

const ctaClasses =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-medium text-white " +
  "transition-all duration-[var(--duration-micro)] ease-[var(--ease-standard)] " +
  "hover:brightness-110 hover:shadow-[0_8px_30px_-8px_rgba(124,92,255,0.6)] active:scale-[0.97]";

export default async function LandingPage() {
  const actor = await getCurrentActor();
  if (actor) redirect("/dashboard");

  return (
    <main className="bg-background">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static local SVG, no optimization needed */}
          <img src="/logo-mark.svg" alt="" width={28} height={28} className="rounded-md" />
          <span className="text-text text-sm font-semibold">CondoPilot AI</span>
        </span>
        <Link
          href="/sign-in"
          className="text-muted hover:text-text text-sm transition-colors duration-[var(--duration-micro)]"
        >
          Entrar
        </Link>
      </nav>

      <section className="bg-hero-glow relative flex flex-col items-center gap-6 overflow-hidden px-6 pt-16 pb-20 text-center">
        <div className="bg-hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
          <h1 className="text-text animate-fade-in-up text-4xl font-semibold text-balance sm:text-5xl">
            Um agente de IA que não só responde.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Ele age.
            </span>
          </h1>
          <p className="text-muted animate-fade-in-up max-w-xl [animation-delay:80ms]">
            CondoPilot AI combina IA conversacional, ferramentas de negócio seguras, execução de
            workflows e observabilidade em uma demonstração de engenharia de agentes aplicada à
            gestão de condomínios.
          </p>
          <Link
            href="/sign-in"
            className={`${ctaClasses} animate-fade-in-up [animation-delay:160ms]`}
            style={{ background: "var(--gradient-brand)" }}
          >
            Entrar na demo
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <p className="text-muted text-center text-xs tracking-wide uppercase">
          Demonstração (exemplo estático)
        </p>
        <div className="border-border bg-surface mt-4 space-y-3 rounded-2xl border p-6 shadow-[0_20px_60px_-30px_rgba(124,92,255,0.35)]">
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
            <div
              key={c.title}
              className="border-border bg-surface hover:border-primary/40 group rounded-xl border p-5 transition-all duration-[var(--duration-panel)] hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(124,92,255,0.45)]"
            >
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
            <div
              key={p.title}
              className="border-border bg-surface-elevated hover:border-secondary/40 rounded-xl border p-5 transition-all duration-[var(--duration-panel)] hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(32,212,255,0.35)]"
            >
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
