import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["videos", "reciters", "categories"].includes(type)) {
      return NextResponse.json(
        {
          error:
            "Invalid type parameter. Must be videos, reciters, or categories",
        },
        { status: 400 },
      );
    }

    let fileName: string;
    switch (type) {
      case "videos":
        fileName = "youtube-videos.json";
        break;
      // case "reciters":
  
      //   break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "data", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File ${fileName} not found` },
        { status: 404 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    return NextResponse.json(jsonData, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving audio data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
