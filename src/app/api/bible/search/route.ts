import { NextRequest } from "next/server";
import { error, json } from "@/lib/api";
import { searchWholeBible } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limitParam = parseInt(searchParams.get("limit") || "30", 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 30 : limitParam), 100);

    if (!q.trim()) {
      return json({ results: [], query: "" });
    }

    const results = await searchWholeBible(q, limit);
    return json({ results, count: results.length, query: q });
  } catch (err) {
    console.error("GET /api/bible/search failed:", err);
    return error("Search failed", 500);
  }
}
