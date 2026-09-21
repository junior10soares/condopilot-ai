import { getCurrentActor } from "@/lib/actor";

export default async function DashboardPage() {
  const actor = await getCurrentActor();

  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Bem-vindo</h1>
      <p className="text-muted mt-1 text-sm">
        Papel atual: <span className="text-text">{actor?.role}</span>
      </p>
    </div>
  );
}
