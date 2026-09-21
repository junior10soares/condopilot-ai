import type { PrismaClient } from "@prisma/client";

export async function broadcastNotification(
  prisma: PrismaClient,
  params: { condominiumId: string; sentByUserId: string; subject: string; body: string },
) {
  const recipients = await prisma.user.findMany({
    where: { condominiumId: params.condominiumId, role: "RESIDENT" },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: recipients.map((r) => ({
      condominiumId: params.condominiumId,
      recipientUserId: r.id,
      sentByUserId: params.sentByUserId,
      channel: "EMAIL",
      subject: params.subject,
      body: params.body,
    })),
  });

  return { recipientCount: recipients.length };
}

export function listNotificationsForCondominium(prisma: PrismaClient, condominiumId: string) {
  return prisma.notification.findMany({ where: { condominiumId }, orderBy: { sentAt: "desc" } });
}

export function listNotificationsForUser(
  prisma: PrismaClient,
  condominiumId: string,
  recipientUserId: string,
) {
  return prisma.notification.findMany({
    where: { condominiumId, recipientUserId },
    orderBy: { sentAt: "desc" },
  });
}
