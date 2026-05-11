import { NextRequest, NextResponse } from "next/server";
import { addFeedback, listFeedback } from "@/lib/feedback-store";

export async function GET() {
  const items = await listFeedback();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, sentiment, message } = body ?? {};
    if (!context || !sentiment || !message) {
      return NextResponse.json(
        { error: "Faltam campos: context, sentiment, message" },
        { status: 400 }
      );
    }
    if (!["positive", "negative", "suggestion"].includes(sentiment)) {
      return NextResponse.json({ error: "sentiment inválido" }, { status: 400 });
    }
    const entry = await addFeedback({ context, sentiment, message });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "erro" },
      { status: 500 }
    );
  }
}
