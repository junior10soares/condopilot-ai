"use client";

import { useState } from "react";
import type { AgentTurnResult } from "@/agent/types";
import type { ConfirmedCall } from "@/agent/pipeline";
import { Badge } from "@/components/ui/badge";
import { sendAgentMessage } from "./actions";

type Turn = { id: string; userText: string; result: AgentTurnResult | null };

const statusLabel: Record<AgentTurnResult["status"], string> = {
  SUCCESS: "sucesso",
  DENIED: "negado",
  CLARIFY: "esclarecimento",
  ERROR: "erro",
  PENDING_CONFIRMATION: "aguardando confirmação",
  RATE_LIMITED: "muitas solicitações",
};

const statusVariant: Record<
  AgentTurnResult["status"],
  "success" | "danger" | "warning" | "neutral"
> = {
  SUCCESS: "success",
  DENIED: "danger",
  CLARIFY: "warning",
  ERROR: "danger",
  PENDING_CONFIRMATION: "warning",
  RATE_LIMITED: "warning",
};

export function AgentChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function runTurn(userText: string, confirmed?: ConfirmedCall) {
    const id = crypto.randomUUID();
    setBusyId(id);
    setTurns((prev) => [...prev, { id, userText, result: null }]);

    const result = await sendAgentMessage(userText, confirmed);

    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, result } : t)));
    setBusyId(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busyId) return;
    setInput("");
    void runTurn(text);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="border-border bg-surface flex-1 space-y-4 overflow-y-auto rounded-xl border p-4">
        {turns.length === 0 && (
          <p className="text-muted text-sm">
            Experimente: &quot;Quais moradores estão inadimplentes?&quot; ou &quot;Reserve o salão
            para Carlos amanhã às 19h.&quot;
          </p>
        )}
        {turns.map((turn) => (
          <div key={turn.id} className="space-y-2">
            <div className="bg-surface-elevated text-text ml-auto max-w-[80%] rounded-xl rounded-br-sm px-3 py-2 text-sm">
              {turn.userText}
            </div>
            <div className="border-border text-text max-w-[80%] rounded-xl rounded-bl-sm border px-3 py-2 text-sm">
              {turn.result === null ? (
                <p className="text-muted" aria-live="polite">
                  Pensando...
                </p>
              ) : (
                <>
                  <p>{turn.result.message}</p>
                  <div className="text-muted mt-1.5 flex items-center gap-2 text-xs">
                    <span>{"tool" in turn.result ? turn.result.tool : "—"}</span>
                    <Badge variant={statusVariant[turn.result.status]}>
                      {statusLabel[turn.result.status]}
                    </Badge>
                  </div>
                </>
              )}
              {turn.result?.status === "PENDING_CONFIRMATION" && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => {
                      const result = turn.result;
                      if (!result || result.status !== "PENDING_CONFIRMATION") return;
                      void runTurn(turn.userText, { tool: result.tool, args: result.args });
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTurns((prev) =>
                        prev.map((t) =>
                          t.id === turn.id
                            ? { ...t, result: { status: "CLARIFY", message: "Ação cancelada." } }
                            : t,
                        ),
                      )
                    }
                    className="border-border text-muted hover:text-text rounded-lg border px-3 py-1.5 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <label htmlFor="agent-input" className="sr-only">
          Mensagem para o agente
        </label>
        <input
          id="agent-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo ao CondoPilot..."
          disabled={busyId !== null}
          className="border-border bg-surface text-text focus-visible:border-secondary flex-1 rounded-lg border px-3 py-2 outline-none"
        />
        <button
          type="submit"
          disabled={busyId !== null || input.trim() === ""}
          className="rounded-lg px-4 py-2 font-medium text-white disabled:opacity-60"
          style={{ background: "var(--gradient-brand)" }}
        >
          {busyId !== null ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
