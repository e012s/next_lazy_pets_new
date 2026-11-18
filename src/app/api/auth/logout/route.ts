import { NextResponse } from "next/server";
import { forbiddenOrigin } from "@/server/csrf";
import { clearAuthCookies } from "@/server/authCookies";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (forbiddenOrigin(request)) {
    return NextResponse.json(
      { status: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
