import { NextRequest, NextResponse } from "next/server";
import { loadServerEnvAsync } from "@/app/lib/envSetup";
import { setCorsHeaders } from "@/app/api/utils/cors";

function getBackendOrigin() {
  const origin = process.env.TASK_BACKEND_BASE_URL || "https://192.168.100.249/services/api/v2";
  if (!origin) {
    throw new Error("TASK_BACKEND_BASE_URL is not defined");
  }
  return origin;
}

function getAuthHeader(req: NextRequest): string {
  const incoming = req.headers.get("authorization");
  if (incoming && incoming.trim()) {
    return incoming;
  }

  const token = process.env.TASK_AUTH_TOKEN || "Opaque 192.168.100.249";
  if (!token) {
    throw new Error("TASK_AUTH_TOKEN is not defined");
  }

  return token;
}

async function proxy(req: NextRequest) {
  await loadServerEnvAsync();

  let backendOrigin: string;
  try {
    backendOrigin = getBackendOrigin();
  } catch (err: any) {
    return setCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 500 })
    );
  }

  const url = new URL(req.url);
  const action = url.pathname.replace(/^\/api\/task/, "") || "/";
  const targetUrl = `${backendOrigin}${action}${url.search}`;

  const headers = new Headers();

  try {
    headers.set("Authorization", getAuthHeader(req));
  } catch (err: any) {
    return setCorsHeaders(
      NextResponse.json({ error: err.message }, { status: 500 })
    );
  }

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  let body: BodyInit | undefined;

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await req.formData();
      headers.delete("content-type");
    } else {
      body = await req.text();
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (err: any) {
    return setCorsHeaders(
      NextResponse.json(
        {
          error: "Upstream service unreachable",
          target: targetUrl,
          detail: String(err?.message ?? err),
        },
        { status: 502 }
      )
    );
  }

  const resHeaders = new Headers();
  const upstreamCt = upstream.headers.get("content-type");
  if (upstreamCt) resHeaders.set("content-type", upstreamCt);

  const cd = upstream.headers.get("content-disposition");
  if (cd) resHeaders.set("content-disposition", cd);

  let response: NextResponse;

  if (upstreamCt?.includes("application/json")) {
    const json = await upstream.json();
    response = NextResponse.json(json, { status: upstream.status });
  } else if (upstreamCt?.startsWith("text/")) {
    const text = await upstream.text();
    response = new NextResponse(text, {
      status: upstream.status,
      headers: resHeaders,
    });
  } else {
    const buffer = await upstream.arrayBuffer();
    response = new NextResponse(buffer, {
      status: upstream.status,
      headers: resHeaders,
    });
  }

  return setCorsHeaders(response);
}

export async function GET(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}

export function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}
