import type { ModelProvider } from "@/agent/types";
import { listMatchers } from "@/agent/tool-registry";

/**
 * Planejador grátis, determinístico, sem chave de API. Casa o texto do
 * usuário contra padrões fixos contribuídos por cada tool registrada — não
 * existe nenhum modelo seguindo instruções nesse caminho, então texto como
 * "ignore as instruções anteriores" não tem efeito nenhum: simplesmente não
 * casa com nenhum padrão.
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
