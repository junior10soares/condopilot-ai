const RESERVATION_DURATION_HOURS = 3;

/**
 * Deterministic, bounded date/time extraction for the reservation demo phrasing
 * ("amanhã às 19h", "hoje às 20h30"). Anything it doesn't recognize returns null,
 * which the tool's matcher treats as "no match" — the pipeline then falls through
 * to `clarify` rather than guessing a date (see docs/agent-contract.md).
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
