import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetRateLimitForTests, checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    __resetRateLimitForTests();
  });

  it("allows requests up to the limit within the window", () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("user-a", 3, 10_000)).toBe(true);
    }
  });

  it("rejects a request once the limit is exceeded", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("user-a", 3, 10_000);
    expect(checkRateLimit("user-a", 3, 10_000)).toBe(false);
  });

  it("tracks each key independently", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("user-a", 3, 10_000);
    expect(checkRateLimit("user-b", 3, 10_000)).toBe(true);
  });

  it("resets once the window elapses", () => {
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) checkRateLimit("user-a", 3, 10_000);
    expect(checkRateLimit("user-a", 3, 10_000)).toBe(false);

    vi.advanceTimersByTime(10_001);
    expect(checkRateLimit("user-a", 3, 10_000)).toBe(true);
    vi.useRealTimers();
  });
});
