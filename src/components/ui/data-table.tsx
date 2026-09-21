export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel = "Nenhum registro encontrado.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-muted text-sm">{emptyLabel}</p>;
  }

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-border bg-surface-elevated text-muted border-b">
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-4 py-2.5 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-border border-b last:border-0">
              {columns.map((column) => (
                <td key={column.key} className="text-text px-4 py-2.5">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
