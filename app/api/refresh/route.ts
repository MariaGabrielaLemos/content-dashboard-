import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clearMediaCache } from "@/lib/instagram";

export async function POST() {
  try {
    await clearMediaCache();
    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ ok: true, cleared_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "erro" },
      { status: 500 }
    );
  }
}
