/**
 * Storage simples de metas/projeção do Fernando.
 * V1 = arquivo JSON local. Migrar pra DB junto com feedback-store.
 */
import { promises as fs } from "fs";
import path from "path";

export interface Goal {
  id: string;
  metric: "followers" | "reach" | "engagement";
  target: number;
  /** Data limite (YYYY-MM-DD). */
  deadline: string;
  /** Snapshot inicial (valor de partida quando a meta foi criada). */
  baseline: number;
  baselineDate: string;
  note?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "goals.json");

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf-8");
  }
}

export async function listGoals(): Promise<Goal[]> {
  await ensureFile();
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as Goal[];
  } catch {
    return [];
  }
}

export async function addGoal(input: Omit<Goal, "id">): Promise<Goal> {
  await ensureFile();
  const all = await listGoals();
  const entry: Goal = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ...input,
  };
  await fs.writeFile(FILE, JSON.stringify([entry, ...all], null, 2), "utf-8");
  return entry;
}

export async function deleteGoal(id: string): Promise<boolean> {
  const all = await listGoals();
  const filtered = all.filter((g) => g.id !== id);
  if (filtered.length === all.length) return false;
  await fs.writeFile(FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
