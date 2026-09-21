"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function signInAction(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Generic message on purpose — never confirm whether the email exists.
      return "Email ou senha inválidos.";
    }
    throw error;
  }
}
