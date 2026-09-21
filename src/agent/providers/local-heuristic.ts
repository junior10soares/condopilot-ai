import type { ModelProvider } from "@/agent/types";
import { listMatchers } from "@/agent/tool-registry";

/**
 * Free, deterministic, no-API-key planner. Matches user text against fixed
 * pattern rules contributed by each registered tool — there is no
 * instruction-following model in this path, so text like "ignore previous
 * instructions" has no special effect: it just fails to match any pattern.
 */
export const localHeuristicProvider: ModelProvider = {
  name: "local-heuristic",
  async plan(input) {
    const normalized = input.trim();

    for (const [toolName, matcher] of listMatchers()) {
      const args = matcher(normalized);
      if (args) {
        return { kind: "tool", tool: toolName, args };
      }
    }

    return {
      kind: "clarify",
      question:
        "Não entendi o pedido. Posso ajudar com consulta de moradores, inadimplência, reservas e notificações — pode reformular?",
    };
  },
};
