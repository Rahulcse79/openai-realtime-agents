
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { setCorsHeaders } from "@/app/api/utils/cors";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
  return setCorsHeaders(NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return setCorsHeaders(
      NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      )
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    if (body?.text?.format?.type === "json_schema") {
  return await structuredResponse(openai, body);
    } else {
  return await textResponse(openai, body);
    }
  } catch (err: any) {
    console.error("OpenAI proxy error", err);
    return setCorsHeaders(
      NextResponse.json(
        { error: err.message ?? "Unknown error" },
        { status: 500 }
      )
    );
  }
}

async function structuredResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.parse({
      ...(body as any),
      stream: false,
    });
  return setCorsHeaders(NextResponse.json(response));
  } catch (err: any) {
    console.error("Structured response error", err);
    return setCorsHeaders(
      NextResponse.json(
        { error: "Failed to generate structured response" },
        { status: 500 }
      )
    );
  }
}

async function textResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
    });
  return setCorsHeaders(NextResponse.json(response));
  } catch (err: any) {
    console.error("Text response error", err);

    return setCorsHeaders(
      NextResponse.json(
        { error: "Failed to generate text response" },
        { status: 500 }
      )
    );
  }
}

// CORS preflight handler
export function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}
