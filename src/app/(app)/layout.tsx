import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/actor";
import { db } from "@/lib/db";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { SignOutButton } from "@/components/shell/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/sign-in");

  const condominium = await db.condominium.findUnique({
    where: { id: actor.condominiumId },
    select: { name: true },
  });

  return (
    <div className="bg-background flex min-h-screen">
      <aside className="border-border bg-surface flex w-60 flex-col border-r">
        <div className="flex items-center gap-2 px-4 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static local SVG */}
          <img src="/logo-mark.svg" alt="" width={28} height={28} className="rounded-md" />
          <div>
            <p className="text-text text-sm font-semibold">CondoPilot AI</p>
            <p className="text-muted mt-0.5 text-xs">{condominium?.name}</p>
          </div>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-surface flex items-center justify-between border-b px-6 py-3">
          <span className="text-muted text-sm">{actor.role}</span>
          <SignOutButton />
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
