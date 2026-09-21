import { describe, expect, it } from "vitest";
import { parseReservationTime } from "./reservation-time-parser";

const now = new Date(2026, 0, 10, 8, 0, 0); // 10 Jan 2026, 08:00 local

describe("parseReservationTime", () => {
  it('parses "amanhã às 19h" into tomorrow at 19:00, 3h duration', () => {
    const result = parseReservationTime("Reserve o salão para Carlos amanhã às 19h.", now);
    expect(result).not.toBeNull();
    expect(result?.startsAt).toEqual(new Date(2026, 0, 11, 19, 0, 0));
    expect(result?.endsAt).toEqual(new Date(2026, 0, 11, 22, 0, 0));
  });

  it('parses "hoje às 20h30"', () => {
    const result = parseReservationTime("disponibilidade hoje às 20h30", now);
    expect(result?.startsAt).toEqual(new Date(2026, 0, 10, 20, 30, 0));
  });

  it("returns null when there is no recognizable day", () => {
    expect(parseReservationTime("quero reservar o salão às 19h", now)).toBeNull();
  });

  it("returns null when there is no recognizable time", () => {
    expect(parseReservationTime("quero reservar o salão amanhã", now)).toBeNull();
  });

  it("never guesses an out-of-range hour", () => {
    expect(parseReservationTime("amanhã às 27h", now)).toBeNull();
  });
});
