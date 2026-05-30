import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { ok: false, error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { ok: false, error: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { ok: false, error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid signature";
      console.error("Webhook signature verification failed:", message);
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { ok: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL;
  if (!appsScriptUrl) {
    console.error("APPS_SCRIPT_WEB_APP_URL not configured — order not logged");
    return;
  }

  const payload = {
    type: "order",
    email: session.customer_details?.email || "",
    name: session.customer_details?.name || "",
    phone: session.customer_details?.phone || "",
    address: JSON.stringify(session.collected_information?.shipping_details?.address || {}),
    amount: (session.amount_total || 0) / 100,
    tier: session.metadata?.tier || "unknown",
    product: session.metadata?.product || "",
  };

  try {
    const res = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Apps Script returned non-OK status:", res.status, await res.text());
    } else {
      console.log("Order logged to Google Sheets:", payload.email, payload.product, `$${payload.amount}`);
    }
  } catch (err) {
    console.error("Failed to POST order to Apps Script:", err);
  }
}
