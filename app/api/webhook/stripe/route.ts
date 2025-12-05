/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/webhook/stripe/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createOrder } from "@/lib/actions/Order.actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    const stripeId = session.id;
    console.log("stripe id",stripeId)
    const eventId = session.metadata?.eventId;
    const buyerId = session.metadata?.buyerId;
    const totalAmount = (session.amount_total || 0) / 100;

    if (!eventId || !buyerId) {
      console.error("❌ Missing metadata: eventId or buyerId");
      return NextResponse.json({ error: "Missing metadata" });
    }

    try {
      // ✅ Create Order in MongoDB
      const order = await createOrder({
        stripeId,
        totalAmount,
        createdAt: new Date(),
        eventId,
        buyerId,
      });

      if (!order) {
        console.error("❌ Order creation returned null");
        return new NextResponse("Order not created", { status: 500 });
      }

      console.log("✅ Order created successfully in MongoDB", order._id);

    } catch (err) {
      console.error("❌ Failed to create Order:", err);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
