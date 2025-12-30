import { NextResponse } from "next/server";
import { loadServerEnvAsync } from "@/app/lib/envSetup";

export async function GET() {
  try {
    await loadServerEnvAsync();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2025-06-03",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Realtime session error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to create OpenAI Realtime session",
          detail: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: error?.message ?? error },
      { status: 500 }
    );
  }
}
