import { describe, expect, it } from "vitest";
import type { Actor } from "@/lib/actor";
import { AuthorizationError, assertSameTenant, requireRole, requireSelfOrRole } from "@/lib/authz";

function actor(overrides: Partial<Actor> = {}): Actor {
  return { userId: "u1", condominiumId: "c1", role: "RESIDENT", ...overrides };
}

describe("requireRole", () => {
  it("allows a role at or above the minimum", () => {
    expect(() => requireRole(actor({ role: "MANAGER" }), "MANAGER")).not.toThrow();
    expect(() => requireRole(actor({ role: "ADMIN" }), "MANAGER")).not.toThrow();
  });

  it("denies a role below the minimum", () => {
    expect(() => requireRole(actor({ role: "RESIDENT" }), "MANAGER")).toThrow(AuthorizationError);
  });
});

describe("assertSameTenant", () => {
  it("allows access within the same tenant", () => {
    expect(() => assertSameTenant(actor({ condominiumId: "c1" }), "c1")).not.toThrow();
  });

  it("denies cross-tenant access", () => {
    expect(() => assertSameTenant(actor({ condominiumId: "c1" }), "c2")).toThrow(
      AuthorizationError,
    );
  });
});

describe("requireSelfOrRole", () => {
  it("allows the resource owner regardless of role", () => {
    expect(() =>
      requireSelfOrRole(actor({ userId: "u1", role: "RESIDENT" }), "u1", "MANAGER"),
    ).not.toThrow();
  });

  it("denies a non-owner below the minimum role", () => {
    expect(() =>
      requireSelfOrRole(actor({ userId: "u1", role: "RESIDENT" }), "u2", "MANAGER"),
    ).toThrow(AuthorizationError);
  });

  it("allows a non-owner at or above the minimum role", () => {
    expect(() =>
      requireSelfOrRole(actor({ userId: "u1", role: "MANAGER" }), "u2", "MANAGER"),
    ).not.toThrow();
  });
});
