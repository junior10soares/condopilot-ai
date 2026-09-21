import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable, type Column } from "./data-table";

type Row = { id: string; name: string };
const columns: Column<Row>[] = [{ key: "name", header: "Nome", render: (r) => r.name }];

describe("DataTable", () => {
  it("renders a row per item with the column header", () => {
    render(<DataTable columns={columns} rows={[{ id: "1", name: "Carlos" }]} />);
    expect(screen.getByRole("columnheader", { name: "Nome" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Carlos" })).toBeInTheDocument();
  });

  it("shows the empty label when there are no rows", () => {
    render(<DataTable columns={columns} rows={[]} emptyLabel="Vazio." />);
    expect(screen.getByText("Vazio.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
