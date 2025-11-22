import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@database/prisma";

export async function ensureUserExists(userId: string) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      documents: true,
      botConfig: true,
    },
  });

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;

    user = await prisma.user.create({
      data: {
        id: userId,
        email,
      },
      include: {
        documents: true,
        botConfig: true,
      },
    });
  }

  return user;
}
