/**
 * Storage simples de feedback do Fernando.
 *
 * V1 = arquivo JSON local em `data/feedback.json` (gitignored).
 * Quando a dashboard for pra produção (Vercel), trocar por DB (Supabase recomendado).
 */
import { promises as fs } from "fs";
import path from "path";

export type FeedbackStatus = "open" | "queued" | "shipped" | "wontfix";

export interface Feedback {
  id: string;
  context: string;
  sentiment: "positive" | "negative" | "suggestion";
  message: string;
  timestamp: string;
  status: FeedbackStatus;
}

export const FEEDBACK_STATUS_VALUES: FeedbackStatus[] = [
  "open",
  "queued",
  "shipped",
  "wontfix",
];

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
    const data = JSON.parse(raw) as Partial<Feedback>[];
    return data
      .map((d) => ({
        id: d.id ?? "",
        context: d.context ?? "",
        sentiment: (d.sentiment ?? "suggestion") as Feedback["sentiment"],
        message: d.message ?? "",
        timestamp: d.timestamp ?? new Date().toISOString(),
        status: (d.status ?? "open") as FeedbackStatus,
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
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
    status: "open",
  };
  await fs.writeFile(FILE, JSON.stringify([entry, ...all], null, 2), "utf-8");
  return entry;
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<Feedback | null> {
  const all = await listFeedback();
  const idx = all.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status };
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf-8");
  return all[idx];
}
