import path from "node:path";
import { describe, expect, it } from "vitest";
import { countTests } from "./count-tests";

const repoRoot = path.resolve(__dirname, "../..");

describe("countTests", () => {
  it("finds this project's own unit/integration/component test files", async () => {
    const result = await countTests(path.join(repoRoot, "src"), ".test.ts");
    expect(result.files).toBeGreaterThan(5);
    expect(result.cases).toBeGreaterThan(result.files);
  });

  it("finds this project's own E2E specs", async () => {
    const result = await countTests(path.join(repoRoot, "e2e"), ".spec.ts");
    expect(result.files).toBeGreaterThanOrEqual(7);
  });

  it("returns zero for a suffix nothing matches", async () => {
    const result = await countTests(path.join(repoRoot, "e2e"), ".nonexistent");
    expect(result).toEqual({ files: 0, cases: 0 });
  });
});
