import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static local SVG, no optimization needed */}
      <img src="/logo-mark.svg" alt="" width={56} height={56} className="animate-fade-in-up rounded-xl" />
      <div className="animate-fade-in-up [animation-delay:80ms]">
        <p
          className="bg-clip-text text-6xl font-semibold text-transparent"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          404
        </p>
        <h1 className="text-text mt-2 text-xl font-semibold">Página não encontrada</h1>
        <p className="text-muted mt-1 max-w-sm text-sm">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
      </div>
      <Link
        href="/"
        className="animate-fade-in-up rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-[var(--duration-micro)] ease-[var(--ease-standard)] hover:brightness-110 hover:shadow-[0_8px_30px_-8px_rgba(124,92,255,0.6)] active:scale-[0.97] [animation-delay:160ms]"
        style={{ background: "var(--gradient-brand)" }}
      >
        Voltar ao início
      </Link>
    </main>
  );
}
