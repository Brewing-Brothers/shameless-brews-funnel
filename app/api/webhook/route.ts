import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-05-27.dahlia",
  });
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
  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerName = session.customer_details?.name || "Customer";
  const tier = session.metadata?.tier || "unknown";
  const product = session.metadata?.product || "Shameless Brews Order";
  const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";

  console.log("Payment successful:", {
    sessionId: session.id,
    email: customerEmail,
    name: customerName,
    tier,
    product,
    amount: amountTotal,
  });

  const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL;
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet: "Orders",
          source: "stripe-webhook",
          sessionId: session.id,
          email: customerEmail,
          name: customerName,
          tier,
          product,
          amount: amountTotal,
          paymentStatus: session.payment_status,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to log order to Google Sheet:", err);
    }
  }

  if (customerEmail && appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendOrderConfirmation",
          email: customerEmail,
          name: customerName,
          product,
          amount: amountTotal,
        }),
      });
    } catch (err) {
      console.error("Failed to send order confirmation:", err);
    }
  }
}
