import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://ai-trend-tracker-production.up.railway.app";

async function proxyRequest(request: NextRequest, method: string) {
  const { pathname, search } = request.nextUrl;
  // pathname is /api/v1/huggingface etc. — keep as-is
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Forward API key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    redirect: "follow", // follow FastAPI 307 redirects server-side
  };

  if (method !== "GET" && method !== "HEAD") {
    try {
      fetchOptions.body = await request.text();
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);
    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "DELETE");
}
