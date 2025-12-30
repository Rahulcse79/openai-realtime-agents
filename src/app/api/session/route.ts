import { NextResponse } from "next/server";
import { loadServerEnvAsync } from "@/app/lib/envSetup";
import { setCorsHeaders } from "@/app/api/utils/cors";

/**
 * POST /api/session
 * Creates an OpenAI Realtime ephemeral session
 */
export async function GET() {
  try {
    // Ensure env vars are loaded (for non-standard runtimes)
    await loadServerEnvAsync();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Missing OPENAI_API_KEY in environment variables" },
          { status: 500 }
        )
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

      return setCorsHeaders(
        NextResponse.json(
          {
            error: "Failed to create OpenAI Realtime session",
            detail: errorText,
          },
          { status: response.status }
        )
      );
    }

    const data = await response.json();

    return setCorsHeaders(NextResponse.json(data));
  } catch (error: unknown) {
    console.error("Error in /api/session:", error);

    return setCorsHeaders(
      NextResponse.json(
        {
          error: "Internal Server Error",
          detail:
            error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    );
  }
}

/**
 * OPTIONS /api/session
 * Handles CORS preflight
 */
export function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}
