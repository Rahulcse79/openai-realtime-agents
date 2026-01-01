import { NextResponse } from "next/server";
import { loadServerEnvAsync } from "@/app/lib/envSetup";
import { setCorsHeaders } from "@/app/api/utils/cors";

export async function GET() {
  try {
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

    const apiUrl = process.env.OPENAI_API_URL;
    if (!apiUrl) {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Missing OPENAI_API_URL in environment variables" },
          { status: 500 }
        )
      );
    }

    const model = process.env.OPENAI_MODEL;
    if (!model) {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Missing OPENAI_MODEL in environment variables" },
          { status: 500 }
        )
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
      }),
    });

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
          detail: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    );
  }
}

export function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}
