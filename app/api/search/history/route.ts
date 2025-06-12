import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return mock search history
    // In a real app, this would come from a database
    const searchHistory = [
      {
        query: "Surah Al-Fatiha",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        resultCount: 25,
        filters: { category: "quran" },
      },
      {
        query: "Beautiful recitation",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        resultCount: 150,
        filters: { type: "audio" },
      },
      {
        query: "Morning duas",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        resultCount: 42,
        filters: { category: "dua" },
      },
      {
        query: "Islamic lectures",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        resultCount: 89,
        filters: { type: "video" },
      },
    ];

    return NextResponse.json(searchHistory);
  } catch (error) {
    console.error("Search history API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    // In a real app, this would clear the user's search history from database
    return NextResponse.json({ message: "Search history cleared" });
  } catch (error) {
    console.error("Clear search history API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
