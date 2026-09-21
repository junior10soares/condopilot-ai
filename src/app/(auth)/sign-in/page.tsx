import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Entrar — CondoPilot AI",
};

export default function SignInPage() {
  return (
    <div className="border-border bg-surface-elevated w-full max-w-sm rounded-2xl border p-8 shadow-2xl">
      <h1 className="text-text text-xl font-semibold">Entrar no CondoPilot AI</h1>
      <p className="text-muted mt-1 text-sm">Acesse com as credenciais do seu condomínio.</p>
      <div className="mt-6">
        <SignInForm />
      </div>
    </div>
  );
}
