import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_ORIGIN =
  process.env.TASK_BACKEND_BASE_URL ?? "http://localhost:8996/app/v2";

function getAuthHeader(req: NextRequest): string {
  const incoming = req.headers.get("authorization");
  if (incoming && incoming.trim().length > 0) {
    return incoming;
  }

  // const token = process.env.TASK_AUTH_TOKEN;
  const token = "Opaque 00aa5095-4fa4-4816-8381-5792d1dbe24f";
  if (!token) {
    throw new Error("TASK_AUTH_TOKEN is not defined in environment variables");
  }

  return `${token}`;
}

async function proxy(req: NextRequest) {
  const url = new URL(req.url);

  const action = url.pathname.replace(/^\/api\/task/, "") || "/";
  const targetUrl = `${DEFAULT_BACKEND_ORIGIN}${action}${url.search}`;
  const target = new URL(targetUrl);

  const headers = new Headers();
  headers.set("Authorization", getAuthHeader(req));

  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  let body: BodyInit | undefined;

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (ct?.includes("multipart/form-data")) {
      const form = await req.formData();
      body = form;
      headers.delete("content-type");
    } else {
      body = await req.text();
      if (!headers.get("content-type")) {
        headers.set("content-type", "application/json");
      }
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Task proxy upstream fetch failed",
        detail: String(err?.message ?? err),
        target: target.toString(),
        hint: "Verify TASK_BACKEND_BASE_URL and Spring service availability",
      },
      { status: 502 }
    );
  }

  const upstreamCt = upstream.headers.get("content-type") ?? "";
  const resHeaders = new Headers();

  if (upstreamCt) resHeaders.set("content-type", upstreamCt);

  const cd = upstream.headers.get("content-disposition");
  if (cd) resHeaders.set("content-disposition", cd);

  if (upstreamCt.includes("application/json")) {
    const data = await upstream.json();
    return NextResponse.json(data, {
      status: upstream.status,
      headers: resHeaders,
    });
  }

  if (upstreamCt.startsWith("text/")) {
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: resHeaders,
    });
  }

  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest) {
  try {
    return await proxy(req);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Task proxy failed",
        detail: String(e?.message ?? e),
        hint: "Check TASK_BACKEND_BASE_URL and TASK_AUTH_TOKEN configuration",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await proxy(req);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Task proxy failed",
        detail: String(e?.message ?? e),
        hint: "Check TASK_BACKEND_BASE_URL and TASK_AUTH_TOKEN configuration",
      },
      { status: 500 }
    );
  }
}
