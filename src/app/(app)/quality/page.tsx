import path from "node:path";
import { gateGroups, type GateStatus } from "@/quality/gates";
import { countTests } from "@/quality/count-tests";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<GateStatus, "success" | "warning" | "neutral"> = {
  pass: "success",
  pending: "warning",
  na: "neutral",
};

const statusLabel: Record<GateStatus, string> = {
  pass: "ok",
  pending: "pendente",
  na: "n/a",
};

export const dynamic = "force-dynamic";

export default async function QualityPage() {
  // Intentionally scans the whole src/e2e tree for *.test.* / *.spec.* files — not a leftover
  // path that should be narrowed. See specs/09-quality-center/spec.md.
  const repoRoot = path.resolve(/* turbopackIgnore: true */ process.cwd());
  const [ts, tsx, e2e] = await Promise.all([
    countTests(path.join(repoRoot, "src"), ".test.ts"),
    countTests(path.join(repoRoot, "src"), ".test.tsx"),
    countTests(path.join(repoRoot, "e2e"), ".spec.ts"),
  ]);

  const unitFiles = ts.files + tsx.files;
  const unitCases = ts.cases + tsx.cases;

  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Central de Qualidade</h1>
      <p className="text-muted mt-1 text-sm">
        Contagem ao vivo dos arquivos de teste no repositório e status dos release gates.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-surface hover:border-primary/40 rounded-xl border p-4 transition-all duration-[var(--duration-panel)] hover:-translate-y-0.5">
          <p className="text-text text-2xl font-semibold">{unitCases}</p>
          <p className="text-muted text-xs">
            testes unit/component/integration em {unitFiles} arquivos
          </p>
        </div>
        <div className="border-border bg-surface hover:border-primary/40 rounded-xl border p-4 transition-all duration-[var(--duration-panel)] hover:-translate-y-0.5">
          <p className="text-text text-2xl font-semibold">{e2e.cases}</p>
          <p className="text-muted text-xs">cenários E2E em {e2e.files} arquivos</p>
        </div>
        <div className="border-border bg-surface hover:border-primary/40 rounded-xl border p-4 transition-all duration-[var(--duration-panel)] hover:-translate-y-0.5">
          <p className="text-text text-2xl font-semibold">CI</p>
          <p className="text-muted text-xs">execução autoritativa em .github/workflows/ci.yml</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {gateGroups.map((group) => (
          <div key={group.category}>
            <h2 className="text-text text-sm font-semibold">{group.category}</h2>
            <ul className="divide-border border-border mt-2 divide-y rounded-xl border">
              {group.gates.map((gate) => (
                <li
                  key={gate.label}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div>
                    <p className="text-text text-sm">{gate.label}</p>
                    {gate.note && <p className="text-muted text-xs">{gate.note}</p>}
                  </div>
                  <Badge variant={statusVariant[gate.status]}>{statusLabel[gate.status]}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
