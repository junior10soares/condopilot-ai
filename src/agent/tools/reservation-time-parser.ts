const RESERVATION_DURATION_HOURS = 3;

/**
 * Extração de data/hora determinística e limitada, só para as frases de demo de
 * reserva ("amanhã às 19h", "hoje às 20h30"). Qualquer coisa que não reconhece
 * retorna null, e o matcher da tool trata isso como "não casou" — o pipeline
 * então cai em `clarify` em vez de chutar uma data (ver docs/agent-contract.md).
 * Só entende "hoje"/"amanhã" de propósito — nomes de dia da semana ("sexta") ou
 * datas explícitas ("15/03") não são suportados por este caminho gratuito; o
 * provedor openai-compatible (src/agent/providers/openai-compatible.ts) resolve
 * isso melhor quando um LLM real está configurado.
 */
export function parseReservationTime(
  input: string,
  now = new Date(),
): { startsAt: Date; endsAt: Date } | null {
  const normalized = input.toLowerCase();

  let dayOffset: number | null = null;
  if (normalized.includes("amanhã") || normalized.includes("amanha")) dayOffset = 1;
  else if (normalized.includes("hoje")) dayOffset = 0;
  if (dayOffset === null) return null;

  const timeMatch = normalized.match(/(\d{1,2})\s*h\s*(\d{2})?/);
  if (!timeMatch) return null;
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2] ?? "0");
  if (hour > 23 || minute > 59) return null;

  const startsAt = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    hour,
    minute,
    0,
    0,
  );
  const endsAt = new Date(startsAt.getTime() + RESERVATION_DURATION_HOURS * 60 * 60 * 1000);

  return { startsAt, endsAt };
}
