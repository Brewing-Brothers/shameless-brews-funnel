"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const UPSELL_MAP: Record<string, { tier: string; name: string; price: number; pitch: string }> = {
  single:  { tier: "double",   name: "Double Mix-and-Match", price: 21, pitch: "Better value — $10.50/bottle" },
  double:  { tier: "sixpack",  name: "6-Pack",               price: 45, pitch: "Best value — $7.50/bottle" },
  sixpack: { tier: "single",   name: "Single Jar",           price: 13, pitch: "Gift a friend" },
};

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "pickup";
  const sessionId = searchParams.get("session_id");
  const tier = searchParams.get("tier") || "";

  const isOrder = type === "order" && sessionId;
  const upsell = isOrder && tier ? UPSELL_MAP[tier] ?? null : null;

  const [upsellLoading, setUpsellLoading] = useState(false);
  const [upsellError, setUpsellError] = useState<string | null>(null);

  async function handleUpsell() {
    if (!upsell) return;
    setUpsellLoading(true);
    setUpsellError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: upsell.tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setUpsellError(data.error || "Checkout failed. Please try again.");
      }
    } catch {
      setUpsellError("Something went wrong. Please try again.");
    } finally {
      setUpsellLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 shadow-lg border border-green-200 text-center">
        <div className="text-6xl mb-6">{isOrder ? "🧃" : "🎉"}</div>
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          {isOrder ? "Payment Successful!" : "You're In!"}
        </h1>
        <p className="text-slate-600 mb-6">
          {isOrder
            ? "Thank you for your order! You'll receive a confirmation email shortly."
            : "Your juice is reserved. We'll reach out to confirm your pickup time."}
        </p>

        {isOrder ? (
          <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-100">
            <h2 className="font-bold text-green-800 mb-2">What happens next?</h2>
            <ul className="text-left text-slate-600 space-y-2">
              <li>✅ Payment confirmed</li>
              <li>📧 Confirmation email on its way</li>
              <li>🍊 We&apos;ll prepare your fresh juice</li>
              <li>📦 You&apos;ll receive shipping/pickup details</li>
            </ul>
          </div>
        ) : (
          <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-100">
            <h2 className="font-bold text-green-800 mb-2">What happens next?</h2>
            <ul className="text-left text-slate-600 space-y-2">
              <li>✅ We received your reservation</li>
              <li>📞 We&apos;ll contact you to confirm pickup</li>
              <li>🍊 Your fresh juice will be ready!</li>
            </ul>
          </div>
        )}

        {/* CF-P7: TIER-BASED UPSELL — shown only for completed orders */}
        {upsell && (
          <div className="bg-amber-50 rounded-xl p-6 mb-6 border border-amber-200 text-left">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
              Add to your order
            </p>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-amber-900 text-lg">{upsell.name}</h2>
              <span className="text-2xl font-bold text-amber-700">${upsell.price}</span>
            </div>
            <p className="text-amber-700 text-sm mb-4">{upsell.pitch}</p>
            {upsellError && (
              <p className="text-red-600 text-sm mb-3">{upsellError}</p>
            )}
            <button
              onClick={handleUpsell}
              disabled={upsellLoading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors duration-200 disabled:opacity-50"
            >
              {upsellLoading ? "Loading..." : `Add to Order — $${upsell.price}`}
            </button>
          </div>
        )}

        {/* Pickup upsell scaffold (non-order flow only) */}
        {!isOrder && (
          <div className="bg-amber-50 rounded-xl p-6 mb-6 border border-amber-200">
            <h2 className="font-bold text-amber-800 mb-2">Special Offer!</h2>
            <p className="text-amber-700 mb-4">Add a 6-Pack at 15% Off — today only!</p>
            <a
              href="/#order"
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold"
            >
              Add 6-Pack — $38.25
            </a>
          </div>
        )}

        {isOrder && sessionId && (
          <div className="bg-green-100 rounded-xl p-4 mb-6 border border-green-200">
            <p className="text-sm text-green-800">
              Order ID: <code className="font-mono text-xs">{sessionId.slice(-8)}</code>
            </p>
          </div>
        )}

        <a href="/" className="text-green-700 hover:text-green-800 underline">
          ← Back to Shameless Brews
        </a>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-pulse text-green-700">Loading...</div>
      </main>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
