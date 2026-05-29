import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const url = process.env.APPS_SCRIPT_WEB_APP_URL;
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Missing APPS_SCRIPT_WEB_APP_URL in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const quantity = String(body.quantity || "").trim();

    if (!name || !email || !phone || !quantity) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const forward = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        quantity,
        source: "shameless-brews-pickup",
      }),
    });

    const text = await forward.text();
    let payload: Record<string, unknown> = { raw: text };
    try {
      payload = JSON.parse(text);
    } catch {
      // Keep raw text if not JSON
    }

    if (!forward.ok || payload.ok === false) {
      return NextResponse.json(
        { ok: false, error: (payload.error as string) || "Failed to write reservation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
