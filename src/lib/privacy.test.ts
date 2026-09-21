import { describe, expect, it } from "vitest";
import type { Actor } from "@/lib/actor";
import { maskEmail, presentResidentsForActor, type ResidentRow } from "./privacy";

describe("maskEmail", () => {
  it("keeps the first couple characters and masks the rest", () => {
    expect(maskEmail("carlos@condopilot.demo")).toBe("ca****@c*********.demo");
  });

  it("handles very short local parts", () => {
    expect(maskEmail("ab@x.com")).toBe("a***@*.com");
  });
});

const residents: ResidentRow[] = [
  { id: "self", name: "Self", email: "self@condopilot.demo", role: "RESIDENT", unit: "101" },
  { id: "other", name: "Other", email: "other@condopilot.demo", role: "RESIDENT", unit: "102" },
];

describe("presentResidentsForActor", () => {
  it("a resident sees their own email in full but masks everyone else's", () => {
    const actor: Actor = { userId: "self", condominiumId: "c1", role: "RESIDENT" };
    const result = presentResidentsForActor(actor, residents);

    expect(result.find((r) => r.id === "self")?.email).toBe("self@condopilot.demo");
    expect(result.find((r) => r.id === "other")?.email).not.toBe("other@condopilot.demo");
  });

  it("a manager sees every email unmasked", () => {
    const actor: Actor = { userId: "manager", condominiumId: "c1", role: "MANAGER" };
    const result = presentResidentsForActor(actor, residents);

    expect(result.every((r, i) => r.email === residents[i].email)).toBe(true);
  });
});
