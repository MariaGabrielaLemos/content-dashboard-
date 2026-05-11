/**
 * Storage simples de feedback do Fernando.
 *
 * V1 = arquivo JSON local em `data/feedback.json` (gitignored).
 * Quando a dashboard for pra produção (Vercel), trocar por DB (Supabase recomendado).
 */
import { promises as fs } from "fs";
import path from "path";

export interface Feedback {
  id: string;
  context: string;
  sentiment: "positive" | "negative" | "suggestion";
  message: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "feedback.json");

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf-8");
  }
}

export async function listFeedback(): Promise<Feedback[]> {
  await ensureFile();
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const data = JSON.parse(raw) as Feedback[];
    return data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch {
    return [];
  }
}

export async function addFeedback(input: {
  context: string;
  sentiment: Feedback["sentiment"];
  message: string;
}): Promise<Feedback> {
  await ensureFile();
  const all = await listFeedback();
  const entry: Feedback = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    context: input.context,
    sentiment: input.sentiment,
    message: input.message,
    timestamp: new Date().toISOString(),
  };
  await fs.writeFile(FILE, JSON.stringify([entry, ...all], null, 2), "utf-8");
  return entry;
}
