import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "test-results",
  "playwright-report",
]);
const CASE_PATTERN = /\b(it|test)\s*\(/g;

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Counts test files and roughly how many `it(`/`test(` cases they contain, via plain
 * filesystem reads — no process spawning, safe to call from a page request.
 */
export async function countTests(
  rootDir: string,
  fileSuffix: string,
): Promise<{ files: number; cases: number }> {
  const allFiles = await walk(rootDir);
  const matching = allFiles.filter((f) => f.endsWith(fileSuffix));

  let cases = 0;
  for (const file of matching) {
    const content = await readFile(file, "utf8");
    cases += content.match(CASE_PATTERN)?.length ?? 0;
  }

  return { files: matching.length, cases };
}
