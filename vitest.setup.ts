import "@testing-library/jest-dom/vitest";

// Testes precisam ser determinísticos e não depender de rede/chave de API —
// sempre usa o planejador local, independente do que estiver no .env do dev.
process.env.LLM_PROVIDER = "local";
