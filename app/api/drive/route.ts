// API route for Google Drive operations
// This handles server-side authentication and file operations

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

// Initialize Google Drive client
function initializeDrive() {
  try {
    const credentialsPath = path.join(process.cwd(), "client_secret.json");
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    return google.drive({ version: "v3", auth });
  } catch (error) {
    console.error("Error initializing Google Drive:", error);
    throw new Error("Failed to initialize Google Drive API");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const fileId = searchParams.get("fileId");
    const folderId = searchParams.get("folderId");

    const drive = initializeDrive();

    // Default folder ID for your Quran audio collection
    const DEFAULT_QURAN_FOLDER_ID = "1MscK-BrHeGaK2Xgvlf0MhVER3r8xh7y6";

    switch (action) {
      case "list-folder":
        const targetFolderId = folderId || DEFAULT_QURAN_FOLDER_ID;

        const folderContents = await drive.files.list({
          q: `'${targetFolderId}' in parents and mimeType contains 'audio/'`,
          fields:
            "files(id, name, size, mimeType, webContentLink, createdTime, modifiedTime)",
        });

        return NextResponse.json({ files: folderContents.data.files });

      case "list-quran-audio":
        // Special endpoint to get all audio files from your Quran folder
        const quranAudio = await drive.files.list({
          q: `'${DEFAULT_QURAN_FOLDER_ID}' in parents and mimeType contains 'audio/'`,
          fields:
            "files(id, name, size, mimeType, webContentLink, createdTime, modifiedTime)",
          pageSize: 1000, // Get up to 1000 files
          orderBy: "name",
        });

        return NextResponse.json({ files: quranAudio.data.files });

      case "get-file-info":
        if (!fileId) {
          return NextResponse.json(
            { error: "File ID required" },
            { status: 400 },
          );
        }

        const fileInfo = await drive.files.get({
          fileId,
          fields:
            "id, name, size, mimeType, webContentLink, createdTime, modifiedTime",
        });

        return NextResponse.json({ file: fileInfo.data });

      case "get-download-url":
        if (!fileId) {
          return NextResponse.json(
            { error: "File ID required" },
            { status: 400 },
          );
        }

        // Generate a direct download URL
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        return NextResponse.json({ downloadUrl });

      case "stream-file":
        if (!fileId) {
          return NextResponse.json(
            { error: "File ID required" },
            { status: 400 },
          );
        }

        // Get file stream for direct serving
        const fileStream = await drive.files.get(
          {
            fileId,
            alt: "media",
          },
          { responseType: "stream" },
        );

        // Return the stream as response
        return new NextResponse(fileStream.data as any, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=31536000",
          },
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Google Drive API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, fileId, folderId } = await request.json();
    const drive = initializeDrive();

    switch (action) {
      case "list-audio-files":
        // List all audio files in the main folder and subfolders
        const query = folderId
          ? `'${folderId}' in parents and mimeType contains 'audio/'`
          : "mimeType contains 'audio/'";

        const audioFiles = await drive.files.list({
          q: query,
          fields:
            "files(id, name, size, mimeType, parents, webContentLink, createdTime, modifiedTime)",
          pageSize: 1000, // Get more files at once
        });

        return NextResponse.json({ files: audioFiles.data.files });

      case "organize-by-reciter":
        // Get all folders (reciters) and their audio files
        const reciters = await drive.files.list({
          q: `'${folderId || "root"}' in parents and mimeType='application/vnd.google-apps.folder'`,
          fields: "files(id, name)",
        });

        const reciterData = await Promise.all(
          reciters.data.files?.map(async (reciter) => {
            const audioFiles = await drive.files.list({
              q: `'${reciter.id}' in parents and mimeType contains 'audio/'`,
              fields: "files(id, name, size, mimeType, webContentLink)",
            });

            return {
              reciterId: reciter.id,
              reciterName: reciter.name,
              audioFiles: audioFiles.data.files,
            };
          }) || [],
        );

        return NextResponse.json({ reciters: reciterData });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Google Drive API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
