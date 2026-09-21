import { AgentChat } from "./agent-chat";

export default function AgentPage() {
  return (
    <div>
      <h1 className="text-text text-2xl font-semibold">Agente</h1>
      <p className="text-muted mt-1 text-sm">
        Converse com o CondoPilot. Ações sensíveis pedem confirmação.
      </p>
      <div className="mt-6">
        <AgentChat />
      </div>
    </div>
  );
}
