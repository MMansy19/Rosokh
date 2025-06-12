import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    // Generate search suggestions based on the query
    const allSuggestions = [
      // Quran related
      "Quran recitation",
      "Quran translation",
      "Surah Al-Fatiha",
      "Surah Al-Baqarah",
      "Surah Al-Ikhlas",
      "Surah An-Nas",
      "Surah Al-Falaq",
      "Ayat al-Kursi",

      // Audio/Recitation related
      "Beautiful recitation",
      "Mishary Alafasy",
      "Abdul Rahman Al-Sudais",
      "Saad Al-Ghamdi",
      "Maher Zain",
      "Islamic nasheed",
      "Quran mp3",

      // Duas and prayers
      "Morning duas",
      "Evening adhkar",
      "Prayer times",
      "Dua for protection",
      "Istighfar",
      "Salawat",

      // Islamic content
      "Islamic lectures",
      "Hadith",
      "Tafsir",
      "Islamic stories",
      "Prophetic traditions",
      "Islamic calendar",
      "Hijri calendar",

      // Topics
      "Ramadan",
      "Hajj",
      "Zakat",
      "Salah",
      "Fasting",
      "Islamic history",
      "Seerah",
    ];

    // Filter suggestions that match the query
    const matchingSuggestions = allSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(query))
      .slice(0, 10);

    // Add query variations if no direct matches
    if (matchingSuggestions.length < 5) {
      const queryVariations = generateQueryVariations(query);
      matchingSuggestions.push(
        ...queryVariations.slice(0, 5 - matchingSuggestions.length),
      );
    }

    return NextResponse.json(matchingSuggestions);
  } catch (error) {
    console.error("Search suggestions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function generateQueryVariations(query: string): string[] {
  const variations = [];

  // Common search patterns
  if (query.includes("quran") || query.includes("qur")) {
    variations.push("Quran recitation", "Quran translation", "Quran tafsir");
  }

  if (query.includes("surah") || query.includes("sur")) {
    variations.push("Surah Al-Fatiha", "Surah Al-Baqarah", "Surah search");
  }

  if (query.includes("dua") || query.includes("du")) {
    variations.push("Daily duas", "Morning duas", "Evening duas");
  }

  if (query.includes("islam") || query.includes("isl")) {
    variations.push("Islamic lectures", "Islamic stories", "Islamic calendar");
  }

  if (query.includes("prayer") || query.includes("pray")) {
    variations.push("Prayer times", "Prayer guide", "How to pray");
  }

  if (query.includes("hadith") || query.includes("had")) {
    variations.push("Hadith collection", "Sahih Bukhari", "Hadith search");
  }

  return variations;
}
