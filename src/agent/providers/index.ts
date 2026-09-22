import type { ModelProvider } from "@/agent/types";
import { localHeuristicProvider } from "./local-heuristic";
import { openaiCompatibleProvider } from "./openai-compatible";

/** Escolhe o planejador do agente com base em LLM_PROVIDER (.env). */
export function getModelProvider(): ModelProvider {
  const provider = process.env.LLM_PROVIDER || "local";

  if (provider === "local") return localHeuristicProvider;
  if (provider === "openai-compatible") return openaiCompatibleProvider;

  throw new Error(
    `LLM_PROVIDER "${provider}" não suportado. Use "local" (grátis, sem API) ou ` +
      '"openai-compatible" (Groq, OpenRouter, Ollama...) — ver docs/architecture.md § Agent Runtime.',
  );
}
