import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@database/prisma";
import { Prisma } from "@prisma/client";

export async function ensureUserExists(userId: string) {
  // Get Clerk user data for email
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;

  try {
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
  } catch (error) {
    // Handle race condition where webhook created the user between our check and create
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Unique constraint failed - the user was just created by the webhook
      // Fetch the user that was just created
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          documents: true,
          botConfig: true,
        },
      });

      if (user) {
        return user;
      }

      // If still not found, there might be a user with this email but different id
      // This shouldn't happen in normal flow, but handle it gracefully
      const userByEmail = await prisma.user.findUnique({
        where: { email },
        include: {
          documents: true,
          botConfig: true,
        },
      });

      if (userByEmail) {
        // If the ids don't match, this is a different user - throw original error
        if (userByEmail.id !== userId) {
          throw new Error(
            `Email ${email} is already associated with a different user account`
          );
        }
        return userByEmail;
      }
    }

    // Re-throw any other errors
    throw error;
  }
}
