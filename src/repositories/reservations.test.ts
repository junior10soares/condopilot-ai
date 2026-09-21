import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDb } from "@/test/db";
import { createReservation, isAvailable, ReservationConflictError } from "./reservations";

describe("reservations repository (integration)", () => {
  let condominiumId: string;
  let commonAreaId: string;
  let userId: string;

  beforeAll(async () => {
    const condominium = await testDb.condominium.create({
      data: { name: "Reservation Repo Test Condo" },
    });
    condominiumId = condominium.id;
    const commonArea = await testDb.commonArea.create({
      data: { condominiumId, name: "Salão de Testes" },
    });
    commonAreaId = commonArea.id;
    const user = await testDb.user.create({
      data: {
        condominiumId,
        name: "Tester",
        email: "reservation-repo-test@test.local",
        passwordHash: "x",
        role: "RESIDENT",
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await testDb.reservation.deleteMany({ where: { condominiumId } });
    await testDb.commonArea.deleteMany({ where: { condominiumId } });
    await testDb.user.deleteMany({ where: { condominiumId } });
    await testDb.condominium.delete({ where: { id: condominiumId } });
    await testDb.$disconnect();
  });

  it("reports available before any booking and unavailable after", async () => {
    const startsAt = new Date("2027-01-01T19:00:00");
    const endsAt = new Date("2027-01-01T22:00:00");

    expect(await isAvailable(testDb, condominiumId, commonAreaId, startsAt, endsAt)).toBe(true);
    await createReservation(testDb, { condominiumId, commonAreaId, userId, startsAt, endsAt });
    expect(await isAvailable(testDb, condominiumId, commonAreaId, startsAt, endsAt)).toBe(false);
  });

  it("rejects a second booking that overlaps an existing one", async () => {
    const startsAt = new Date("2027-02-01T19:00:00");
    const endsAt = new Date("2027-02-01T22:00:00");
    await createReservation(testDb, { condominiumId, commonAreaId, userId, startsAt, endsAt });

    const overlapping = {
      startsAt: new Date("2027-02-01T20:00:00"),
      endsAt: new Date("2027-02-01T23:00:00"),
    };
    await expect(
      createReservation(testDb, { condominiumId, commonAreaId, userId, ...overlapping }),
    ).rejects.toThrow(ReservationConflictError);
  });

  it("under concurrent requests for the same slot, exactly one booking succeeds", async () => {
    const startsAt = new Date("2027-03-01T19:00:00");
    const endsAt = new Date("2027-03-01T22:00:00");

    const attempts = await Promise.allSettled([
      createReservation(testDb, { condominiumId, commonAreaId, userId, startsAt, endsAt }),
      createReservation(testDb, { condominiumId, commonAreaId, userId, startsAt, endsAt }),
      createReservation(testDb, { condominiumId, commonAreaId, userId, startsAt, endsAt }),
    ]);

    const fulfilled = attempts.filter((a) => a.status === "fulfilled");
    expect(fulfilled).toHaveLength(1);
  });
});
