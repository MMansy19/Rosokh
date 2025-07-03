import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return popular search terms
    const popularSearches = [
      "Quran recitation",
      "تلاوة القرآن",
      "Surah Al-Fatiha",
      "الفاتحة",
      "Islamic lectures",
      "محاضرات إسلامية",
      "Nasheed",
      "نشيد",
      "Morning duas",
      "أدعية الصباح",
      "Tafsir",
      "تفسير",
      "Hadith",
      "حديث",
      "Prayer times",
      "أوقات الصلاة",
      "Islamic calendar",
      "التقويم الإسلامي",
      "Quran translation",
      "ترجمة القرآن",
      "Beautiful recitation",
      "تلاوة جميلة",
      "Surah Al-Baqarah",
      "سورة البقرة",
      "Evening adhkar",
      "أذكار المساء",
      "Islamic stories",
      "قصص إسلامية",
      "Prophetic traditions",
      "السنة النبوية",
      "Audio",
      "صوتي",
      "Surahs",
      "سور",
      "Videos",
      "فيديوهات",
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
