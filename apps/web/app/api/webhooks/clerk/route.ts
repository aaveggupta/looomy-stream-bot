import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@database/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error(
      "Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
    return new Response("Error: Webhook secret not configured", {
      status: 500,
    });
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", { status: 400 });
  }

  // Handle user.created event
  if (evt.type === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error(`Webhook user.created: No email found for user ${id}`);
      return new Response("Error: No email found", { status: 400 });
    }

    try {
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
        },
      });

      console.log(
        `Webhook user.created: Successfully created user ${id} (${email})`
      );
      return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
      console.error("Error: Failed to store event in the database:", error);
      return new Response("Error: Failed to store event in the database", {
        status: 500,
      });
    }
  }

  // Handle user.updated event
  if (evt.type === "user.updated") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error(`Webhook user.updated: No email found for user ${id}`);
      return new Response("Error: No email found", { status: 400 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email,
        },
      });

      console.log(
        `Webhook user.updated: Successfully updated user ${id} (${email})`
      );
      return new Response(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
      // If user doesn't exist, create it
      try {
        const newUser = await prisma.user.create({
          data: {
            id,
            email,
          },
        });
        console.log(`Webhook user.updated: Created new user ${id} (${email})`);
        return new Response(JSON.stringify(newUser), { status: 201 });
      } catch (createError) {
        console.error(
          `Webhook user.updated: Failed to upsert user ${id}:`,
          createError
        );
        return new Response("Error: Database operation failed", {
          status: 500,
        });
      }
    }
  }

  // Handle user.deleted event
  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      try {
        await prisma.user.delete({
          where: { id },
        });
        console.log(`Webhook user.deleted: Successfully deleted user ${id}`);
        return new Response("User deleted successfully", { status: 200 });
      } catch (error) {
        console.log(
          `Webhook user.deleted: User ${id} not found in database (might not have been created yet)`
        );
        return new Response("User not found", { status: 404 });
      }
    }
  }

  return new Response("Webhook received", { status: 200 });
}
