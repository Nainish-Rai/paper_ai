import { NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { auth } from "@/lib/auth";

// Convert DOCX content to HTML
async function convertDocxToHTML(buffer: Buffer): Promise<string> {
  try {
    // Convert DOCX to HTML with mammoth
    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error converting DOCX:", error);
    throw new Error("Failed to convert document");
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        { error: "Invalid file type. Only .docx files are supported" },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert DOCX to HTML
    const html = await convertDocxToHTML(buffer);

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import document" },
      { status: 500 }
    );
  }
}
