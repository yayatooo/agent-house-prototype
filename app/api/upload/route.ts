import { NextRequest, NextResponse } from "next/server";
import { createPresignedUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const { fileName, contentType } = await req.json();

  const key = `properties/${Date.now()}-${fileName}`;
  const { url, publicUrl } = await createPresignedUrl(key, contentType);

  return NextResponse.json({ uploadUrl: url, publicUrl });
}
