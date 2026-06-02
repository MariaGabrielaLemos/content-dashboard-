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

/**
 * Garante o arquivo de metas. Best-effort: se o filesystem não for gravável
 * (ex: container standalone rodando como user sem permissão em /app/data),
 * NUNCA lança — apenas falha silenciosamente. O crash de SSR da página
 * Projetado vs Realizado (ENOENT em /app/data/goals.json) vinha daqui:
 * o writeFile do catch estourava quando o mkdir falhava.
 */
async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE);
  } catch {
    try {
      await fs.writeFile(FILE, "[]", "utf-8");
    } catch {
      /* filesystem read-only / sem permissão — segue com leitura tolerante */
    }
  }
}

export async function listGoals(): Promise<Goal[]> {
  // Tolerante a falha total: qualquer erro de FS retorna lista vazia em vez de
  // derrubar o Server Component que consome isto.
  try {
    await ensureFile();
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Goal[]) : [];
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
