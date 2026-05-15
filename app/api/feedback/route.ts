import { NextRequest, NextResponse } from "next/server";
import {
  addFeedback,
  listFeedback,
  updateFeedbackStatus,
  FEEDBACK_STATUS_VALUES,
} from "@/lib/feedback-store";

export async function GET() {
  const items = await listFeedback();
  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body ?? {};
    if (!id || !status) {
      return NextResponse.json(
        { error: "Faltam campos: id, status" },
        { status: 400 }
      );
    }
    if (!FEEDBACK_STATUS_VALUES.includes(status)) {
      return NextResponse.json({ error: "status inválido" }, { status: 400 });
    }
    const updated = await updateFeedbackStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "não encontrado" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "erro" },
      { status: 500 }
    );
  }
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
