export type GateStatus = "pass" | "pending" | "na";

export type Gate = { label: string; status: GateStatus; note?: string };
export type GateGroup = { category: string; gates: Gate[] };

/**
 * Mirrors docs/release-gates.md — kept in sync by hand as each phase converges (see the per-phase
 * specs/**\/checklist.md files this is derived from). This is a judgment call, not something the
 * filesystem can tell us; see specs/09-quality-center/spec.md for why.
 */
export const gateGroups: GateGroup[] = [
  {
    category: "Engenharia",
    gates: [
      { label: "Typecheck", status: "pass" },
      { label: "Lint", status: "pass" },
      { label: "Testes unitários", status: "pass" },
      { label: "Testes de componente", status: "pass" },
      { label: "Testes de integração", status: "pass" },
      {
        label: "Testes de API/contrato",
        status: "na",
        note: "sem API pública externa neste estágio",
      },
      {
        label: "Testes de avaliação do agente",
        status: "pass",
        note: "matching de intenção + anti prompt-injection",
      },
      { label: "Testes E2E", status: "pass" },
      { label: "Smoke test", status: "pass", note: "/api/health + sign-in + 1 turno do agente" },
    ],
  },
  {
    category: "Segurança",
    gates: [
      {
        label: "Auditoria de dependências",
        status: "pass",
        note: "0 vulnerabilidades (achado alto anterior corrigido via override)",
      },
      { label: "Varredura de segredos", status: "pass", note: "gitleaks no CI" },
      { label: "Análise estática", status: "pass", note: "ESLint com regras estritas do Next/TS" },
      { label: "Testes de autorização", status: "pass" },
      { label: "Testes de isolamento de tenant", status: "pass" },
      { label: "Testes de injeção de prompt", status: "pass" },
      { label: "Testes de rate limit", status: "pass" },
      { label: "Revisão de logs sensíveis", status: "pass" },
    ],
  },
  {
    category: "UX",
    gates: [
      { label: "Responsivo", status: "pass" },
      { label: "Acessível por teclado", status: "pass" },
      { label: "Reduced motion", status: "pass" },
      { label: "Estados de carregamento", status: "pass" },
      { label: "Estados vazios", status: "pass" },
      { label: "Estados de erro", status: "pass" },
      {
        label: "Checagem manual em mobile",
        status: "pass",
        note: "viewport 390px, sem overflow horizontal",
      },
    ],
  },
  {
    category: "Spec",
    gates: [
      { label: "Checklists revisados", status: "pass" },
      { label: "Analyze limpo", status: "pass" },
      { label: "Tasks completas", status: "pass" },
      { label: "Converge reportado", status: "pass" },
    ],
  },
  {
    category: "Demo",
    gates: [
      { label: "Dados semeados", status: "pass" },
      { label: "Setup limpo (docker compose)", status: "pass" },
      { label: "Landing page", status: "pass" },
      { label: "Agent playground", status: "pass" },
      { label: "Execution trace", status: "pass", note: "inline no chat + Central de Segurança" },
      { label: "Diagrama de arquitetura", status: "pass", note: "Mermaid em docs/architecture.md" },
      { label: "Screenshots", status: "pass", note: "docs/screenshots/" },
      {
        label: "Vídeo final",
        status: "pass",
        note: "docs/demo-video/demo.webm — automatizado, sem narração",
      },
    ],
  },
];
