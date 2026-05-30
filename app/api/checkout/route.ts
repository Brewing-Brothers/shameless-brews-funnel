import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { tier } = await req.json();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
    });

    const PRICE_MAP: Record<string, string> = {
      single: process.env.STRIPE_PRICE_SINGLE!,
      double: process.env.STRIPE_PRICE_DOUBLE!,
      sixpack: process.env.STRIPE_PRICE_SIXPACK!,
    };

    const priceId = PRICE_MAP[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const baseUrl = "https://shameless-brews-funnel-5nkybq6b2.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/thank-you?type=order&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#order`,
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      billing_address_collection: "required",
      metadata: {
        tier,
        product: tier === "single" ? "$13 Single Jar" : tier === "double" ? "$21 Double Mix-and-Match" : "$45 6-Pack",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
