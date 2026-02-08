import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
const SERVER_API_KEY = process.env.API_KEY;

async function proxyRequest(request: NextRequest, method: string) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "BACKEND_URL not configured" },
      { status: 500 }
    );
  }

  const { pathname, search } = request.nextUrl;
  // pathname is /api/v1/huggingface etc. — keep as-is
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Inject API key from server environment (never exposed to browser)
  if (SERVER_API_KEY) {
    headers["X-API-Key"] = SERVER_API_KEY;
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
