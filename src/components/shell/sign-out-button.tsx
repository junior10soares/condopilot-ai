import { signOut } from "@/lib/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/sign-in" });
      }}
    >
      <button
        type="submit"
        className="border-border text-muted hover:text-text rounded-lg border px-3 py-1.5 text-sm transition-colors duration-[var(--duration-micro)]"
      >
        Sair
      </button>
    </form>
  );
}
