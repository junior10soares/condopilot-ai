"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static local SVG, no optimization needed */}
      <img src="/logo-mark.svg" alt="" width={56} height={56} className="animate-fade-in-up rounded-xl" />
      <div className="animate-fade-in-up [animation-delay:80ms]">
        <h1 className="text-text text-xl font-semibold">Algo deu errado</h1>
        <p className="text-muted mt-1 max-w-sm text-sm">
          Ocorreu um erro inesperado. Você pode tentar novamente ou voltar ao início.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="animate-fade-in-up cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-[var(--duration-micro)] ease-[var(--ease-standard)] hover:brightness-110 hover:shadow-[0_8px_30px_-8px_rgba(124,92,255,0.6)] active:scale-[0.97] [animation-delay:160ms]"
        style={{ background: "var(--gradient-brand)" }}
      >
        Tentar novamente
      </button>
    </main>
  );
}
