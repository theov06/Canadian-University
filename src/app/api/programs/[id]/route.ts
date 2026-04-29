import { NextRequest, NextResponse } from "next/server";
import { samplePrograms } from "@/data/sample-programs";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const program = samplePrograms.find((p) => p.id === id);

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json({ data: program });
}
