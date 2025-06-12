import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return popular search terms
    const popularSearches = [
      "Quran recitation",
      "Surah Al-Fatiha",
      "Islamic lectures",
      "Nasheed",
      "Morning duas",
      "Tafsir",
      "Hadith",
      "Prayer times",
      "Islamic calendar",
      "Quran translation",
      "Beautiful recitation",
      "Surah Al-Baqarah",
      "Evening adhkar",
      "Islamic stories",
      "Prophetic traditions",
    ];

    return NextResponse.json(popularSearches);
  } catch (error) {
    console.error("Popular searches API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
