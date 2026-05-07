import { NextRequest, NextResponse } from "next/server";
import { addGoal, listGoals, deleteGoal } from "@/lib/projection-store";

export async function GET() {
  const items = await listGoals();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metric, target, deadline, baseline, baselineDate, note } = body ?? {};
    if (!metric || target == null || !deadline || baseline == null || !baselineDate) {
      return NextResponse.json({ error: "campos obrigatórios faltando" }, { status: 400 });
    }
    if (!["followers", "reach", "engagement"].includes(metric)) {
      return NextResponse.json({ error: "metric inválido" }, { status: 400 });
    }
    const entry = await addGoal({
      metric,
      target: Number(target),
      deadline,
      baseline: Number(baseline),
      baselineDate,
      note,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "erro" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const ok = await deleteGoal(id);
  return NextResponse.json({ ok });
}
