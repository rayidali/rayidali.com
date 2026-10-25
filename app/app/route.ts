import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const APP_STORE = "https://apps.apple.com/us/app/cinechrony/id6792422740";

/** Short link to Cinechrony on the App Store. The QR on the home page points here with ?via=qr; logs the hit, then redirects. */
export async function GET(req: NextRequest) {
  const via = (req.nextUrl.searchParams.get("via") || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20) || "link";
  const h = req.headers;
  const ua = h.get("user-agent") || "";
  const db = adminClient();
  if (db && req.cookies.get("owner")?.value !== "1" && !/bot|crawl|spider|preview|headless/i.test(ua)) {
    try {
      await db.from("events").insert({
        event: "app_store", path: "/app", ref: req.cookies.get("ref")?.value || null, props: { via },
        ua: ua.slice(0, 300), referrer: h.get("referer"), country: h.get("x-vercel-ip-country"), city: h.get("x-vercel-ip-city"),
      });
    } catch (e) { console.error("app", e); }
  }
  return NextResponse.redirect(APP_STORE, 302);
}
