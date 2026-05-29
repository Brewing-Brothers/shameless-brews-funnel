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

const PRICE_MAP: Record<string, string | undefined> = {
  single: process.env.STRIPE_PRICE_SINGLE,
  double: process.env.STRIPE_PRICE_DOUBLE,
  sixpack: process.env.STRIPE_PRICE_SIXPACK,
};

const PRODUCT_NAMES: Record<string, string> = {
  single: "Single Bottle — $13",
  double: "Double Mix-and-Match — $21",
  sixpack: "6-Pack — $45",
};

export async function POST(req: Request) {
  try {
    const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

    if (!stripeEnabled) {
      return NextResponse.json(
        {
          ok: false,
          error: "Payments not yet enabled. Use pickup reservation for now.",
          blocked: true
        },
        { status: 503 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { ok: false, error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const tier = String(body.tier || "").toLowerCase();
    const email = body.email ? String(body.email).trim() : undefined;

    if (!PRICE_MAP[tier]) {
      return NextResponse.json(
        { ok: false, error: `Invalid tier: ${tier}. Use: single, double, or sixpack` },
        { status: 400 }
      );
    }

    const priceId = PRICE_MAP[tier];
    if (!priceId || priceId.startsWith("price_PLACEHOLDER")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Price ID not configured for this tier. Contact support.",
          blocked: true
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}&type=order`,
      cancel_url: `${baseUrl}/#order`,
      metadata: {
        tier,
        product: PRODUCT_NAMES[tier],
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
