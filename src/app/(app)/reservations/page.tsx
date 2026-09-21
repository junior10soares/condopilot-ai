import { getCurrentActor } from "@/lib/actor";
import { db } from "@/lib/db";
import {
  listCommonAreas,
  listReservationsForUser,
  listUpcomingReservations,
} from "@/repositories/reservations";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { cancelReservationAction } from "./actions";

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function StatusBadge({ status }: { status: string }) {
  return status === "CONFIRMED" ? (
    <Badge variant="success">Confirmada</Badge>
  ) : (
    <Badge>Cancelada</Badge>
  );
}

function CancelButton({ reservationId }: { reservationId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await cancelReservationAction(reservationId);
      }}
    >
      <button type="submit" className="text-danger text-sm hover:underline">
        Cancelar
      </button>
    </form>
  );
}

export default async function ReservationsPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const commonAreas = await listCommonAreas(db, actor.condominiumId);
  const isManager = actor.role === "MANAGER" || actor.role === "ADMIN";

  const areasSummary =
    commonAreas.length > 0 ? (
      <p className="text-muted mt-2 text-xs">
        Áreas disponíveis: {commonAreas.map((a) => a.name).join(", ")}
      </p>
    ) : null;

  if (isManager) {
    const reservations = await listUpcomingReservations(db, actor.condominiumId);
    const columns: Column<(typeof reservations)[number]>[] = [
      { key: "area", header: "Área", render: (r) => r.commonArea.name },
      { key: "resident", header: "Morador", render: (r) => r.user?.name ?? "—" },
      { key: "starts", header: "Início", render: (r) => formatDateTime(r.startsAt) },
      { key: "ends", header: "Fim", render: (r) => formatDateTime(r.endsAt) },
      { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      { key: "actions", header: "", render: (r) => <CancelButton reservationId={r.id} /> },
    ];

    return (
      <div>
        <h1 className="text-text text-2xl font-semibold">Reservas</h1>
        <p className="text-muted mt-1 text-sm">Próximas reservas confirmadas no condomínio.</p>
        {areasSummary}
        <div className="mt-6">
          {reservations.length === 0 ? (
            <EmptyState title="Nenhuma reserva futura" />
          ) : (
            <DataTable columns={columns} rows={reservations} />
          )}
        </div>
      </div>
    );
  }

  const reservations = await listReservationsForUser(db, actor.condominiumId, actor.userId);
  const columns: Column<(typeof reservations)[number]>[] = [
    { key: "area", header: "Área", render: (r) => r.commonArea.name },
    { key: "starts", header: "Início", render: (r) => formatDateTime(r.startsAt) },
    { key: "ends", header: "Fim", render: (r) => formatDateTime(r.endsAt) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r) => (r.status === "CONFIRMED" ? <CancelButton reservationId={r.id} /> : null),
    },
  ];

  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Reservas</h1>
      <p className="text-muted mt-1 text-sm">Suas reservas de áreas comuns.</p>
      {areasSummary}
      <div className="mt-6">
        {reservations.length === 0 ? (
          <EmptyState title="Nenhuma reserva encontrada" />
        ) : (
          <DataTable columns={columns} rows={reservations} />
        )}
      </div>
    </div>
  );
}
