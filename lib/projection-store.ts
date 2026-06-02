/**
 * Storage de metas/projeção do Fernando.
 *
 * V2 (feedback 02/06) — Postgres self-hosted Drop (dropstudios_meta), igual o
 * feedback-store. Antes era data/goals.json, que não sobrevivia no container
 * standalone (ENOENT → crash de SSR da página Projetado vs Realizado) nem entre
 * deploys. Schema: db/migrations/002_wbr_goals.sql.
 *
 * Interface pública mantida (Goal, listGoals, addGoal, deleteGoal). listGoals é
 * tolerante a falha: qualquer erro retorna [] em vez de derrubar o Server Component.
 */
import { Pool } from "pg";

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

const globalForPg = globalThis as unknown as { __wbrPgPool?: Pool };

function getPool(): Pool {
  if (globalForPg.__wbrPgPool) return globalForPg.__wbrPgPool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não está setado — metas precisam do postgres do Drop (dropstudios_meta)."
    );
  }
  const pool = new Pool({ connectionString: url, max: 5 });
  globalForPg.__wbrPgPool = pool;
  return pool;
}

interface GoalRow {
  id: string;
  metric: Goal["metric"];
  target: string | number;
  deadline: Date;
  baseline: string | number;
  baseline_date: Date;
  note: string | null;
}

/** Formata uma Date do pg como YYYY-MM-DD (a coluna é `date`, sem fuso). */
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rowToGoal(r: GoalRow): Goal {
  return {
    id: r.id,
    metric: r.metric,
    target: Number(r.target),
    deadline: ymd(r.deadline),
    baseline: Number(r.baseline),
    baselineDate: ymd(r.baseline_date),
    note: r.note ?? undefined,
  };
}

export async function listGoals(): Promise<Goal[]> {
  // Tolerante a falha total: qualquer erro (DB down, sem env) retorna [] em vez
  // de derrubar a página que consome isto.
  try {
    const { rows } = await getPool().query<GoalRow>(
      `select id, metric, target, deadline, baseline, baseline_date, note
         from wbr_goals_fernando
        order by deadline asc`
    );
    return rows.map(rowToGoal);
  } catch (e) {
    console.warn("[projection-store] listGoals falhou:", e);
    return [];
  }
}

export async function addGoal(input: Omit<Goal, "id">): Promise<Goal> {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const { rows } = await getPool().query<GoalRow>(
    `insert into wbr_goals_fernando
        (id, metric, target, deadline, baseline, baseline_date, note)
      values ($1, $2, $3, $4, $5, $6, $7)
   returning id, metric, target, deadline, baseline, baseline_date, note`,
    [
      id,
      input.metric,
      input.target,
      input.deadline,
      input.baseline,
      input.baselineDate,
      input.note ?? null,
    ]
  );
  return rowToGoal(rows[0]);
}

export async function deleteGoal(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `delete from wbr_goals_fernando where id = $1`,
    [id]
  );
  return (rowCount ?? 0) > 0;
}
