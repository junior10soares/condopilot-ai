import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/actor";
import { db } from "@/lib/db";
import { listSecurityEvents } from "@/repositories/security-events";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
}

export default async function SecurityPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;
  if (actor.role !== "MANAGER" && actor.role !== "ADMIN") redirect("/dashboard");

  const events = await listSecurityEvents(db, actor.condominiumId);

  const columns: Column<(typeof events)[number]>[] = [
    { key: "when", header: "Quando", render: (e) => formatDateTime(e.createdAt) },
    { key: "actor", header: "Ator", render: (e) => e.actorName },
    { key: "tool", header: "Ferramenta", render: (e) => e.toolName ?? "—" },
    {
      key: "status",
      header: "Evento",
      render: (e) => (
        <Badge variant="danger">{e.status === "DENIED" ? "Negado" : "Limite de taxa"}</Badge>
      ),
    },
    { key: "input", header: "Entrada", render: (e) => e.input },
  ];

  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Central de Segurança</h1>
      <p className="text-muted mt-1 text-sm">
        Ações negadas e limites de taxa acionados no seu condomínio — auditoria em tempo real do
        agente.
      </p>
      <div className="mt-6">
        {events.length === 0 ? (
          <EmptyState
            title="Nenhum evento de segurança"
            description="Nenhuma ação foi negada ou limitada por taxa até agora."
          />
        ) : (
          <DataTable columns={columns} rows={events} />
        )}
      </div>
    </div>
  );
}
