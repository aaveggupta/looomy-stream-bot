import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@database/prisma";

export async function ensureUserExists(userId: string) {
  // Get Clerk user data for email
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;

  // Use upsert to handle race condition with webhook
  // This is atomic and safe even if webhook creates user simultaneously
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      // Update email if it changed
      email,
    },
    create: {
      id: userId,
      email,
    },
    include: {
      documents: true,
      botConfig: true,
    },
  });

  return user;
}
