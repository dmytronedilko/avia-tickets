import { NextRequest } from "next/server";

// Proxy every /api/* request to the backend at request time so BACKEND_URL is
// read from the runtime environment (Render env var), not baked at build time.
export const dynamic = "force-dynamic";

function backendBase(): string {
  return (process.env.BACKEND_URL || "http://localhost:3001").replace(
    /\/$/,
    "",
  );
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const target = `${backendBase()}/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const res = await fetch(target, init);
  const body = await res.arrayBuffer();
  const respHeaders = new Headers();
  const ct = res.headers.get("content-type");
  if (ct) respHeaders.set("content-type", ct);
  return new Response(body, { status: res.status, headers: respHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx): Promise<Response> {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx): Promise<Response> {
  const { path } = await ctx.params;
  return proxy(req, path);
}
