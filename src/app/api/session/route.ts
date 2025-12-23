import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2025-06-03",
        }),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
