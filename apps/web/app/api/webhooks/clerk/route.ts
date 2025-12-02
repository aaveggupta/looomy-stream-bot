import { Webhook } from "svix";
export const dynamic = "force-dynamic";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@database/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set in environment variables");
    return new Response("Error: Webhook secret not configured", {
      status: 500,
    });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error(`Webhook ${eventType}: No email found for user ${id}`);
      return new Response("Error: No email found", { status: 400 });
    }

    try {
      // First, check if another user with this email exists (different ID)
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });

      // If email exists with a different user ID, delete the old record
      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        console.log(
          `Webhook ${eventType}: Deleting old user record ${existingUserWithEmail.id} for email ${email}`
        );
        await prisma.user.delete({
          where: { id: existingUserWithEmail.id },
        });
      }

      // Now upsert the current user
      await prisma.user.upsert({
        where: { id },
        update: { email },
        create: {
          id,
          email,
        },
      });
      console.log(
        `Webhook ${eventType}: Successfully processed user ${id} (${email})`
      );
    } catch (error) {
      console.error(
        `Webhook ${eventType}: Failed to upsert user ${id}:`,
        error
      );
      return new Response("Error: Database operation failed", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      try {
        await prisma.user.delete({
          where: { id },
        });
        console.log(`Webhook user.deleted: Successfully deleted user ${id}`);
      } catch (error) {
        console.log(
          `Webhook user.deleted: User ${id} not found in database (might not have been created yet)`
        );
      }
    }
  }

  return new Response("Success", { status: 200 });
}
