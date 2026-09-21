import type { ModelProvider } from "@/agent/types";
import { localHeuristicProvider } from "./local-heuristic";

export function getModelProvider(): ModelProvider {
  const provider = process.env.LLM_PROVIDER || "local";

  if (provider === "local") return localHeuristicProvider;

  throw new Error(
    `Unsupported LLM_PROVIDER: "${provider}". Only "local" (free, no API key) is wired up — ` +
      "see docs/architecture.md § Agent Runtime for how to add a real model adapter.",
  );
}
