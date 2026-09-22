"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signInAction } from "./actions";

const inputClasses =
  "border-border bg-surface text-text focus-visible:border-secondary rounded-lg border px-3 py-2 outline-none transition-colors duration-[var(--duration-micro)]";

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
          className={inputClasses}
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
          className={inputClasses}
        />
      </div>

      {error ? (
        <p role="alert" className="text-danger animate-fade-in-up text-sm">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={pending} className="mt-2 w-full">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
