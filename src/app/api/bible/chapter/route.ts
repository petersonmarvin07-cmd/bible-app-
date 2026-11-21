import { NextRequest } from "next/server";
import { error, json } from "@/lib/api";
import { getBibleChapterVerses } from "@/lib/queries";
import { getBookByNameOrOsis } from "@/lib/bible-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookParam = searchParams.get("book");
    const bookIdParam = searchParams.get("bookId");
    const chapterParam = parseInt(searchParams.get("chapter") || "1", 10);

    let bookId = 1; // Default to Genesis
    if (bookIdParam) {
      const parsed = parseInt(bookIdParam, 10);
      if (parsed >= 1 && parsed <= 66) bookId = parsed;
    } else if (bookParam) {
      const meta = getBookByNameOrOsis(bookParam);
      if (meta) bookId = meta.id;
    }

    const data = await getBibleChapterVerses(bookId, isNaN(chapterParam) ? 1 : chapterParam);
    return json(data);
  } catch (err) {
    console.error("GET /api/bible/chapter failed:", err);
    return error("Could not fetch scripture chapter", 500);
  }
}
