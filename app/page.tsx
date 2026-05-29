"use client";

import { useMemo, useState, useEffect } from "react";
import { getTheme, themeClasses } from "@/lib/themes";

const FLAVORS = [
  { name: "Naval Orange", description: "Classic sweetness, perfectly balanced", color: "bg-orange-500" },
  { name: "Cara Cara Orange", description: "Pink-fleshed, berry-forward notes", color: "bg-orange-400" },
  { name: "Meyer Lemon", description: "Bright, floral, less acidic", color: "bg-yellow-400" },
  { name: "Honey Tangerine", description: "Sweet and fragrant, kid-friendly", color: "bg-orange-300" },
  { name: "Red Ruby Grapefruit", description: "Tart and refreshing, no bitterness", color: "bg-red-400" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Miller",
    location: "Sacramento, CA",
    product: "6-Pack (mix and match)",
    quote: "Best juice I've ever had! No question. You can actually taste how fresh it is, like it was just picked and pressed that day. The taste alone tells you this is pure juice.",
  },
  {
    name: "Daniel Ramirez",
    location: "Rosemont, CA",
    product: "Double (mix and match)",
    quote: "I've tried a lot of 'healthy' juices, but this is on another level. No weird aftertaste, no sugar overload — just clean, refreshing flavor. Literally nothing added, not cut with water. If you do not like pulp I do not recommend. I LOVE PULP",
  },
  {
    name: "Jessica Lee",
    location: "Roseville, CA",
    product: "Weekly Subscription",
    quote: "I didn't think I'd stick with drinking juice regularly, but this made it easy. It's fresh, convenient, and honestly something I look forward to every day. Once I got into the routine it was easy and my body showed the difference! Always arrives on time every delivery.",
  },
];

const FAQS = [
  {
    q: "How fresh is the juice?",
    a: "All juice is cold-pressed fresh in small batches using homegrown and locally sourced fruit. Never mass-produced or sitting on shelves. Fruit is picked and juiced as orders arrive!",
  },
  {
    q: "Do you add sugar, preservatives, or anything artificial?",
    a: "No. Nothing added, nothing fake. Real fruit only. No added sugar, no preservatives, no shortcuts. Simply real 100% juice — we do not even add water.",
  },
  {
    q: "How long does the juice last?",
    a: "Fresh and unprocessed — enjoy within 4–7 days for best taste. Keep refrigerated. Feel free to freeze for longer storage!",
  },
  {
    q: "What sizes do you offer?",
    a: "We offer 24oz glass jars. Perfect for daily use or sharing.",
  },
  {
    q: "Do you use plastic bottles?",
    a: "Never. All juice comes in reusable glass jars to keep your drink clean and reduce environmental waste.",
  },
  {
    q: "How do I order or schedule delivery?",
    a: "Contact us by phone or through our website. We make it easy and flexible — not when we want, but when you need it!",
  },
];

const PRICING = [
  {
    tier: "Single",
    stripeKey: "single",
    price: 13,
    perBottle: 13,
    description: "Best intro — try before committing",
    badge: null,
  },
  {
    tier: "Double Mix-and-Match",
    stripeKey: "double",
    price: 21,
    perBottle: 10.5,
    description: "Better value per bottle",
    badge: "MOST POPULAR",
  },
  {
    tier: "6-Pack",
    stripeKey: "sixpack",
    price: 45,
    perBottle: 7.5,
    description: "Stock up, free delivery",
    badge: "BEST VALUE",
  },
];

const TRUST_BADGES = [
  { icon: "🌿", label: "Homegrown" },
  { icon: "❄️", label: "Cold-Pressed" },
  { icon: "🌱", label: "Organic" },
  { icon: "🫙", label: "Glass Jars" },
  { icon: "✅", label: "No Additives" },
];

const TRUST_BADGES_FULL = [
  { icon: "🌿", label: "USDA Organic" },
  { icon: "❄️", label: "Cold-Pressed" },
  { icon: "🏡", label: "Homegrown" },
  { icon: "🫙", label: "Glass Jars Only" },
  { icon: "🇺🇸", label: "Local CA Farm" },
  { icon: "🔒", label: "Secure Checkout" },
  { icon: "✅", label: "No Additives" },
  { icon: "⏰", label: "Fresh Daily" },
];

export default function Home() {
  const theme = useMemo(() => getTheme(process.env.NEXT_PUBLIC_THEME || "organic"), []);
  const t = themeClasses(theme);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadMsg, setLeadMsg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ hours: 8, minutes: 0, seconds: 0 });
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const batchSize = parseInt(process.env.NEXT_PUBLIC_BATCH_SIZE || "47", 10);
  const urgencyHours = parseInt(process.env.NEXT_PUBLIC_URGENCY_HOURS || "8", 10);
  const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

  useEffect(() => {
    const stored = sessionStorage.getItem("sb_countdown_end");
    let endTime: number;
    if (stored) {
      endTime = parseInt(stored, 10);
    } else {
      endTime = Date.now() + urgencyHours * 60 * 60 * 1000;
      sessionStorage.setItem("sb_countdown_end", endTime.toString());
    }

    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [urgencyHours]);

  async function submitPickup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      quantity: selectedTier || String(form.get("quantity") || ""),
    };
    try {
      const res = await fetch("/api/reserve-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Something went wrong. Try again.");
      } else {
        window.location.href = "/thank-you?type=pickup";
      }
    } catch (err) {
      setMsg(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(stripeKey: string) {
    if (!stripeEnabled) {
      setSelectedTier(PRICING.find(p => p.stripeKey === stripeKey)?.tier || stripeKey);
      document.getElementById("pickup-form")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setCheckoutLoading(stripeKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: stripeKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.blocked) {
        setSelectedTier(PRICING.find(p => p.stripeKey === stripeKey)?.tier || stripeKey);
        document.getElementById("pickup-form")?.scrollIntoView({ behavior: "smooth" });
      } else {
        alert(data.error || "Checkout failed. Please try again.");
      }
    } catch (err) {
      alert("Checkout error. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLeadMsg(null);
    setLeadLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      name: String(form.get("name") || ""),
    };
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLeadMsg(data.error || "Something went wrong. Try again.");
      } else {
        setLeadMsg("Success! Check your email for your 20% off code.");
        setTimeout(() => setShowLeadModal(false), 2000);
      }
    } catch (err) {
      setLeadMsg(String(err));
    } finally {
      setLeadLoading(false);
    }
  }

  return (
    <main className={`min-h-screen ${t.pageBg}`}>
      {/* CF-P5: URGENCY BAR */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${t.urgencyBar} text-white py-2 px-4`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-sm font-medium">
          <span>🍊 Seasonal Juices! Order Before They&apos;re Gone!</span>
          <span className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded">
              {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
            </span>
            <span>— Only {batchSize} Jars Left</span>
          </span>
          <a href="#order" className="underline hover:no-underline ml-2">Order Now</a>
        </div>
      </div>

      {/* Spacer for fixed urgency bar */}
      <div className="h-12 sm:h-10" />

      {/* CF-P1: HERO SECTION */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`rounded-3xl p-8 sm:p-12 ${t.card}`}>
            {/* Trust badges row */}
            <div className="flex flex-wrap gap-2 mb-6">
              {TRUST_BADGES.map((badge) => (
                <span key={badge.label} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${t.badge}`}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${t.accent}`}>
              Real juice. Nothing fake.
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 mb-2">
              Homegrown, hand-pressed, organic juice in reusable glass jars.
            </p>
            <p className="text-sm text-slate-600 mb-8">
              Pickup: Carmichael, CA • Delivery: 5 miles • Ships: USA
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#order"
                className={`inline-flex justify-center items-center px-8 py-4 rounded-2xl font-semibold text-lg ${t.button}`}
              >
                Order Now — Local Pickup
              </a>
              <button
                onClick={() => setShowLeadModal(true)}
                className={`inline-flex justify-center items-center px-8 py-4 rounded-2xl font-semibold text-lg ${t.buttonOutline}`}
              >
                Get 20% Off First Order
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🍊</div>
              <h3 className={`text-xl font-bold mb-2 ${t.accent}`}>Fresh Every Time</h3>
              <p className="text-slate-600">Pressed fresh. Never sitting on a shelf. You can taste the difference.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">✅</div>
              <h3 className={`text-xl font-bold mb-2 ${t.accent}`}>Nothing Hidden</h3>
              <p className="text-slate-600">No additives. No sugar. No preservatives. No water added. 100% real juice.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏡</div>
              <h3 className={`text-xl font-bold mb-2 ${t.accent}`}>Built for Real Life</h3>
              <p className="text-slate-600">All the benefits of juicing — none of the work. Ready to drink, consistent quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FLAVORS SECTION */}
      <section className={`py-16 px-4 sm:px-6 ${t.pageBg}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${t.accent}`}>Our Flavors</h2>
          <p className="text-center text-slate-600 mb-12">Homegrown and locally sourced citrus. Small-batch, pressed to order.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {FLAVORS.map((flavor) => (
              <div key={flavor.name} className={`rounded-2xl p-6 text-center ${t.card}`}>
                <div className={`w-16 h-16 ${flavor.color} rounded-full mx-auto mb-4 shadow-lg`} />
                <h3 className="font-bold mb-1">{flavor.name}</h3>
                <p className="text-sm text-slate-600">{flavor.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CF-P12: TRUST BADGES (Second Placement) */}
      <section className="py-12 px-4 sm:px-6 bg-white border-y border-green-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {TRUST_BADGES_FULL.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-slate-700">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CF-P4: TESTIMONIALS (BEFORE PRICING) */}
      <section className={`py-16 px-4 sm:px-6 ${t.pageBg}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${t.accent}`}>What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="border-t border-green-100 pt-4">
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.location}</p>
                  <p className="text-sm text-green-700">{t.product}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">Homegrown | Cold-Pressed | Organic | Since 2026</p>
            <p className="text-sm text-green-700 font-medium mt-1">Quality Guaranteed — Call us if ever an issue! 7 days from order.</p>
          </div>
        </div>
      </section>

      {/* CF-P3: PRICING GRID */}
      <section id="order" className="py-16 px-4 sm:px-6 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${t.accent}`}>Order Your Juice</h2>
          <p className="text-center text-slate-600 mb-12">Glass jars. Real juice. No shortcuts.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING.map((tier) => (
              <div
                key={tier.tier}
                className={`relative rounded-2xl p-6 border-2 ${
                  tier.badge === "MOST POPULAR" ? "border-green-600 shadow-lg" : "border-green-200"
                }`}
              >
                {tier.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold ${t.badgePopular}`}>
                    ★ {tier.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold mt-2 mb-2">{tier.tier}</h3>
                <p className="text-3xl font-bold text-green-700">${tier.price}</p>
                <p className="text-sm text-slate-500 mb-4">${tier.perBottle.toFixed(2)}/bottle</p>
                <p className="text-slate-600 mb-6">{tier.description}</p>
                <button
                  onClick={() => handleCheckout(tier.stripeKey)}
                  disabled={checkoutLoading === tier.stripeKey}
                  className={`w-full py-3 rounded-xl font-semibold ${t.button} disabled:opacity-50`}
                >
                  {checkoutLoading === tier.stripeKey
                    ? "Loading..."
                    : stripeEnabled
                    ? `Order Now — $${tier.price}`
                    : "Reserve — Pay on Pickup"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA REPEAT (After Pricing) */}
      <section className={`py-12 px-4 sm:px-6 ${t.pageBg}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${t.accent}`}>Ready to Try Real Juice?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#order" className={`inline-flex justify-center items-center px-8 py-4 rounded-2xl font-semibold ${t.button}`}>
              Order Now — Local Pickup
            </a>
            <button
              onClick={() => setShowLeadModal(true)}
              className={`inline-flex justify-center items-center px-8 py-4 rounded-2xl font-semibold ${t.buttonOutline}`}
            >
              Get 20% Off First Order
            </button>
          </div>
        </div>
      </section>

      {/* PICKUP FORM */}
      <section id="pickup-form" className="py-16 px-4 sm:px-6 bg-white scroll-mt-16">
        <div className="max-w-xl mx-auto">
          <div className={`rounded-2xl p-8 ${t.card}`}>
            <h2 className={`text-2xl font-bold mb-2 ${t.accent}`}>Reserve Your Pickup</h2>
            <p className="text-slate-600 mb-6">We&apos;ll reach out to confirm your pickup time. Pay on arrival.</p>
            {selectedTier && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-800 font-medium">Selected: {selectedTier}</p>
              </div>
            )}
            <form onSubmit={submitPickup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>
              {!selectedTier && (
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">What would you like?</label>
                  <select
                    id="quantity"
                    name="quantity"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select an option...</option>
                    <option value="Single - $13">Single — $13</option>
                    <option value="Double Mix-and-Match - $21">Double Mix-and-Match — $21</option>
                    <option value="6-Pack - $45">6-Pack — $45</option>
                  </select>
                </div>
              )}
              {msg && (
                <p className={`text-sm ${msg.includes("wrong") ? "text-red-600" : "text-green-600"}`}>{msg}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-lg ${t.button} disabled:opacity-50`}
              >
                {loading ? "Reserving..." : "Reserve My Pickup"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CF-P6: FAQ ACCORDION */}
      <section className={`py-16 px-4 sm:px-6 ${t.pageBg}`}>
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${t.accent}`}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-green-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="font-medium">{faq.q}</span>
                  <span className={`transform transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-slate-600">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CF-P10: FINAL CTA DARK SECTION */}
      <section className="py-16 px-4 sm:px-6 bg-green-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready for Fresh Organic Juice?</h2>
          <p className="text-green-100 text-lg mb-8">Small-batch. Local. Real ingredients. No excuses.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#order"
              className="inline-flex justify-center items-center px-8 py-4 rounded-2xl font-semibold text-lg bg-white text-green-900 hover:bg-green-50"
            >
              Order Now — Local Pickup
            </a>
            <button
              onClick={() => setShowLeadModal(true)}
              className="inline-flex justify-center items-center px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white text-white hover:bg-white/10"
            >
              Get 20% Off First Order
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 sm:px-6 bg-green-900 border-t border-green-800">
        <div className="max-w-5xl mx-auto text-center text-green-100">
          <p className="font-bold text-white mb-2">Shameless Brews</p>
          <p className="text-sm">Carmichael, CA</p>
          <p className="text-sm mt-4">© 2026 Shameless Brews. All rights reserved.</p>
        </div>
      </footer>

      {/* CF-P8: STICKY MOBILE CTA */}
      <div className={`fixed bottom-0 left-0 right-0 md:hidden z-40 ${t.stickyMobile} text-white px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Shameless Brews</p>
            <p className="text-xs opacity-90">Only {batchSize} jars left</p>
          </div>
          <a
            href="#order"
            className="px-6 py-2 bg-white text-green-700 rounded-xl font-semibold text-sm"
          >
            Order Now
          </a>
        </div>
      </div>

      {/* Spacer for sticky mobile CTA */}
      <div className="h-16 md:hidden" />

      {/* CF-P2: LEAD MAGNET MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h2 className={`text-2xl font-bold mb-2 ${t.accent}`}>Get 20% Off Your First Order</h2>
            <p className="text-slate-600 mb-6">For discounts and more</p>
            <form onSubmit={submitLead} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="Your email"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="Your name (optional)"
                />
              </div>
              {leadMsg && (
                <p className={`text-sm ${leadMsg.includes("Success") ? "text-green-600" : "text-red-600"}`}>{leadMsg}</p>
              )}
              <button
                type="submit"
                disabled={leadLoading}
                className={`w-full py-4 rounded-xl font-semibold text-lg ${t.button} disabled:opacity-50`}
              >
                {leadLoading ? "Submitting..." : "Get My 20% Off"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
