import type { Tool, ToolMatcher } from "./types";

const tools = new Map<string, Tool>();
const matchers = new Map<string, ToolMatcher>();

export function registerTool<
  I extends import("zod").ZodTypeAny,
  O extends import("zod").ZodTypeAny,
>(tool: Tool<I, O>, matcher: ToolMatcher) {
  if (tools.has(tool.name)) {
    throw new Error(`Tool already registered: ${tool.name}`);
  }
  tools.set(tool.name, tool);
  matchers.set(tool.name, matcher);
}

export function getTool(name: string): Tool | undefined {
  return tools.get(name);
}

export function listTools(): Tool[] {
  return Array.from(tools.values());
}

export function listMatchers(): Map<string, ToolMatcher> {
  return matchers;
}

/** Test-only: clears the registry so test files can register isolated fake tools. */
export function __resetRegistryForTests() {
  tools.clear();
  matchers.clear();
}
