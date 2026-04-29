import { NextRequest, NextResponse } from "next/server";
import { samplePrograms } from "@/data/sample-programs";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ error: "Provide ?ids=1,2,3" }, { status: 400 });
  }

  const ids = idsParam.split(",").map(Number).slice(0, 4);
  const programs = samplePrograms.filter((p) => ids.includes(p.id));

  return NextResponse.json({ data: programs });
}
