"use client";

import { useActionState } from "react";
import { signInAction } from "./actions";

export function SignInForm() {
  const [error, formAction, pending] = useActionState(signInAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-muted text-sm">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border-border bg-surface text-text focus-visible:border-secondary rounded-lg border px-3 py-2 outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-muted text-sm">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border-border bg-surface text-text focus-visible:border-secondary rounded-lg border px-3 py-2 outline-none"
        />
      </div>

      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg px-4 py-2 font-medium text-white transition-opacity duration-[var(--duration-micro)] disabled:opacity-60"
        style={{ background: "var(--gradient-brand)" }}
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
