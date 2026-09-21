import { getCurrentActor } from "@/lib/actor";
import { db } from "@/lib/db";
import { listUsersForCondominium } from "@/repositories/users";
import { presentResidentsForActor } from "@/lib/privacy";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

const roleLabel: Record<string, string> = {
  RESIDENT: "Morador",
  MANAGER: "Síndico",
  ADMIN: "Administrador",
};

export default async function ResidentsPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const residents = presentResidentsForActor(
    actor,
    await listUsersForCondominium(db, actor.condominiumId),
  );

  const columns: Column<(typeof residents)[number]>[] = [
    { key: "name", header: "Nome", render: (r) => r.name },
    { key: "unit", header: "Unidade", render: (r) => r.unit ?? "—" },
    { key: "role", header: "Papel", render: (r) => roleLabel[r.role] ?? r.role },
    { key: "email", header: "Email", render: (r) => r.email },
  ];

  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Moradores</h1>
      <p className="text-muted mt-1 text-sm">
        Diretório do condomínio. Emails de outros moradores aparecem parcialmente ocultos.
      </p>
      <div className="mt-6">
        {residents.length === 0 ? (
          <EmptyState title="Nenhum morador cadastrado" />
        ) : (
          <DataTable columns={columns} rows={residents} />
        )}
      </div>
    </div>
  );
}
