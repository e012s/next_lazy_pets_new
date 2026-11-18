import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forbiddenOrigin } from "@/server/csrf";
import {
  WORKSPACE_TOKEN_COOKIE,
  postWorkspaceMultipart,
} from "@/server/lazyWorkspaceApi";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (forbiddenOrigin(request)) {
    return NextResponse.json(
      { status: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "cn";
  const jar = await cookies();
  const token = jar.get(WORKSPACE_TOKEN_COOKIE)?.value ?? null;

  if (!token) {
    return NextResponse.json(
      { status: false, message: "未登入" },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { status: false, message: "請求格式錯誤" },
      { status: 400 },
    );
  }

  const result = await postWorkspaceMultipart("apply_third_parties", {
    locale,
    token,
    formData,
  });

  return NextResponse.json(result);
}