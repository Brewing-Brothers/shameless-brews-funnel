"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "pickup";
  const sessionId = searchParams.get("session_id");

  const isOrder = type === "order" && sessionId;

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

        {/* CF-P7: UPSELL SCAFFOLD */}
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

        {isOrder && (
          <div className="bg-green-100 rounded-xl p-4 mb-6 border border-green-200">
            <p className="text-sm text-green-800">
              Order ID: <code className="font-mono text-xs">{sessionId?.slice(-8)}</code>
            </p>
          </div>
        )}

        <a
          href="/"
          className="text-green-700 hover:text-green-800 underline"
        >
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
