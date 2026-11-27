import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const handler = toNextJsHandler(getAuth());
  return handler.GET(request);
}

export async function POST(request: Request) {
  const handler = toNextJsHandler(getAuth());
  return handler.POST(request);
}
