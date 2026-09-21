import { getCurrentActor } from "@/lib/actor";
import { db } from "@/lib/db";
import {
  listNotificationsForCondominium,
  listNotificationsForUser,
} from "@/repositories/notifications";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function NotificationsPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const isManager = actor.role === "MANAGER" || actor.role === "ADMIN";
  const notifications = isManager
    ? await listNotificationsForCondominium(db, actor.condominiumId)
    : await listNotificationsForUser(db, actor.condominiumId, actor.userId);

  const columns: Column<(typeof notifications)[number]>[] = [
    { key: "subject", header: "Assunto", render: (n) => n.subject },
    { key: "body", header: "Mensagem", render: (n) => n.body },
    { key: "sentAt", header: "Enviado em", render: (n) => formatDateTime(n.sentAt) },
  ];

  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Notificações</h1>
      <p className="text-muted mt-1 text-sm">
        {isManager ? "Avisos simulados enviados no condomínio." : "Avisos enviados para você."}
      </p>
      <div className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState title="Nenhuma notificação" />
        ) : (
          <DataTable columns={columns} rows={notifications} />
        )}
      </div>
    </div>
  );
}
