import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-text text-4xl font-semibold">
        Um agente de IA que não só responde.{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          Ele age.
        </span>
      </h1>
      <p className="text-muted max-w-md">
        CondoPilot AI — demonstração de engenharia de agentes segura aplicada à gestão de
        condomínios.
      </p>
      <Link
        href="/sign-in"
        className="rounded-lg px-5 py-2.5 font-medium text-white"
        style={{ background: "var(--gradient-brand)" }}
      >
        Entrar
      </Link>
      <p className="text-muted text-xs">Landing page completa chega no R10.</p>
    </main>
  );
}
