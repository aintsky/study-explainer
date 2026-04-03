import { NextResponse } from "next/server";

// Placeholder server OCR route (not used by default). Kept for extensibility.
export async function POST() {
  return NextResponse.json(
    {
      message: "OCR handled client-side via Tesseract.js. Wire server OCR provider here if needed.",
    },
    { status: 501 }
  );
}
