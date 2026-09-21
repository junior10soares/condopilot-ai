import { describe, expect, it } from "vitest";
import { matchesAny } from "./match";

describe("matchesAny", () => {
  it("matches a phrase with accents regardless of case", () => {
    expect(matchesAny("Quais moradores estão inadimplentes?", ["inadimplent"])).toBe(true);
    expect(matchesAny("ESTÁ AÍ?", ["está aí"])).toBe(true);
  });

  it("returns false when no phrase is present", () => {
    expect(matchesAny("me conte uma piada", ["inadimplent", "devendo"])).toBe(false);
  });
});
