import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword") ?? "cloud engineer";

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;

  if (!appId || !appKey) {
    return NextResponse.json({
      error: "Adzuna keys missing",
      ADZUNA_APP_ID: appId ? "SET" : "MISSING",
      ADZUNA_API_KEY: appKey ? "SET" : "MISSING",
    });
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: keyword,
    results_per_page: "10",
  });

  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const text = await res.text();

    // Check if it's HTML (error page)
    if (text.trim().startsWith("<")) {
      return NextResponse.json({
        error: "Adzuna returned HTML — likely invalid credentials",
        http_status: res.status,
        hint: "Check your ADZUNA_APP_ID and ADZUNA_API_KEY at developer.adzuna.com",
        raw_snippet: text.slice(0, 200),
      });
    }

    const data = JSON.parse(text);

    return NextResponse.json({
      http_status: res.status,
      keyword,
      keys_present: { app_id: appId.slice(0, 4) + "****", app_key: "****" },
      total_available: data.count ?? 0,
      total_returned: data.results?.length ?? 0,
      titles: (data.results ?? []).map((j: Record<string, unknown>) => ({
        title: j.title,
        company: (j.company as Record<string, string>)?.display_name,
      })),
      api_error: data.exception ?? data.error ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
