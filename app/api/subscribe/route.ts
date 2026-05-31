import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const name = String(body.name || "").trim();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email required" },
        { status: 400 }
      );
    }

    // Google Sheets via Apps Script — source of truth
    const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL;
    if (appsScriptUrl) {
      try {
        await fetch(appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscriber",
            email,
            name,
            source: "shameless-brews-lead",
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Failed to write subscriber to Google Sheets:", err);
      }
    }

    // Klaviyo — dual write, non-blocking (Sheets is source of truth)
    // Note: first_name not valid in bulk-create-jobs endpoint; list via relationships not attributes
    const klaviyoKey = process.env.KLAVIYO_API_KEY;
    const klaviyoListId = process.env.KLAVIYO_LIST_ID;
    if (klaviyoKey && klaviyoListId) {
      try {
        const res = await fetch(
          "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
          {
            method: "POST",
            headers: {
              Authorization: `Klaviyo-API-Key ${klaviyoKey}`,
              revision: "2024-02-15",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                type: "profile-subscription-bulk-create-job",
                attributes: {
                  profiles: {
                    data: [
                      {
                        type: "profile",
                        attributes: {
                          email,
                          subscriptions: {
                            email: { marketing: { consent: "SUBSCRIBED" } },
                          },
                        },
                      },
                    ],
                  },
                },
                relationships: {
                  list: { data: { type: "list", id: klaviyoListId } },
                },
              },
            }),
          }
        );
        if (!res.ok) {
          console.error("Klaviyo subscription failed:", res.status, await res.text());
        }
      } catch (err) {
        console.error("Klaviyo request error:", err);
      }
    } else {
      console.warn("KLAVIYO_API_KEY or KLAVIYO_LIST_ID not set — skipping Klaviyo sync");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
