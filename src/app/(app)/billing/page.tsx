import { getCurrentActor } from "@/lib/actor";
import { db } from "@/lib/db";
import { listChargesForUser, listResidentsInDebt } from "@/repositories/charges";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default async function BillingPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  if (actor.role === "MANAGER" || actor.role === "ADMIN") {
    const residents = await listResidentsInDebt(db, actor.condominiumId);
    const columns: Column<(typeof residents)[number] & { id: string }>[] = [
      { key: "name", header: "Morador", render: (r) => r.name },
      { key: "unit", header: "Unidade", render: (r) => r.unit ?? "—" },
      { key: "owed", header: "Valor em aberto", render: (r) => formatBRL(r.totalOwedCents) },
    ];

    return (
      <div>
        <h1 className="text-text text-2xl font-semibold">Financeiro</h1>
        <p className="text-muted mt-1 text-sm">Moradores com débitos em atraso.</p>
        <div className="mt-6">
          {residents.length === 0 ? (
            <EmptyState
              title="Nenhum morador inadimplente"
              description="Todos os pagamentos estão em dia."
            />
          ) : (
            <DataTable columns={columns} rows={residents.map((r) => ({ ...r, id: r.userId }))} />
          )}
        </div>
      </div>
    );
  }

  const charges = await listChargesForUser(db, actor.condominiumId, actor.userId);
  const columns: Column<(typeof charges)[number]>[] = [
    { key: "description", header: "Descrição", render: (c) => c.description },
    { key: "dueDate", header: "Vencimento", render: (c) => formatDate(c.dueDate) },
    { key: "amount", header: "Valor", render: (c) => formatBRL(c.amountCents) },
    {
      key: "status",
      header: "Status",
      render: (c) =>
        c.paidAt ? (
          <Badge variant="success">Pago</Badge>
        ) : c.dueDate < new Date() ? (
          <Badge variant="danger">Em atraso</Badge>
        ) : (
          <Badge variant="warning">Em aberto</Badge>
        ),
    },
  ];

  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Meu financeiro</h1>
      <p className="text-muted mt-1 text-sm">Seu histórico de cobranças.</p>
      <div className="mt-6">
        {charges.length === 0 ? (
          <EmptyState title="Nenhuma cobrança encontrada" />
        ) : (
          <DataTable columns={columns} rows={charges} />
        )}
      </div>
    </div>
  );
}
