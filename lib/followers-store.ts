/**
 * Snapshots diários de seguidores do Fernando (postgres dropstudios_meta).
 *
 * Pedido do Fernando (feedback 02/06): o comparativo WBR precisa do total de
 * seguidores "naquela época" pra mostrar crescimento — antes usava o total de
 * hoje pra todas as janelas, então o delta dava sempre zero.
 *
 * Estratégia:
 *  - `recordTodaySnapshot` grava o total de hoje a cada load (preciso, source 'live').
 *  - `backfillFromDeltas` reconstrói ~30d a partir da métrica Meta follower_count
 *    diária (aproximado: ignora unfollows). Nunca sobrescreve um 'live'.
 *  - `getSnapshotAsOf` devolve o total no fim de um período.
 *
 * Schema: db/migrations/003_wbr_follower_snapshots.sql. Tolerante a falha:
 * erros viram noop/null, nunca derrubam a página.
 */
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __wbrPgPool?: Pool };

function getPool(): Pool | null {
  if (globalForPg.__wbrPgPool) return globalForPg.__wbrPgPool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const pool = new Pool({ connectionString: url, max: 5 });
  globalForPg.__wbrPgPool = pool;
  return pool;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Grava (ou atualiza) o snapshot de hoje. 'live' sempre vence backfill. */
export async function recordTodaySnapshot(followers: number): Promise<void> {
  if (!followers || followers <= 0) return;
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(
      `insert into wbr_follower_snapshots_fernando (snapshot_date, followers, source)
            values (current_date, $1, 'live')
       on conflict (snapshot_date)
       do update set followers = excluded.followers, source = 'live'`,
      [followers]
    );
  } catch (e) {
    console.warn("[followers-store] recordTodaySnapshot falhou:", e);
  }
}

/**
 * Backfill aproximado dos últimos dias a partir do total de hoje e dos deltas
 * diários (novos seguidores por dia) da Meta. Reconstrói de trás pra frente:
 *   total(d-1) = total(d) - novos(d).
 * Não sobrescreve snapshots 'live'. Idempotente.
 */
export async function backfillFromDeltas(
  todayTotal: number,
  dailyNew: { date: string; value: number }[]
): Promise<void> {
  const pool = getPool();
  if (!pool || !todayTotal || dailyNew.length === 0) return;
  // ordena do mais recente pro mais antigo
  const sorted = [...dailyNew].sort((a, b) => b.date.localeCompare(a.date));
  let running = todayTotal;
  const rows: { date: string; total: number }[] = [];
  for (const d of sorted) {
    rows.push({ date: d.date, total: running });
    running -= d.value; // remove os novos daquele dia pra chegar no total do dia anterior
  }
  try {
    for (const r of rows) {
      await pool.query(
        `insert into wbr_follower_snapshots_fernando (snapshot_date, followers, source)
              values ($1, $2, 'backfill')
         on conflict (snapshot_date) do nothing`,
        [r.date, Math.max(0, Math.round(r.total))]
      );
    }
  } catch (e) {
    console.warn("[followers-store] backfillFromDeltas falhou:", e);
  }
}

/** Total de seguidores no fim de um período (snapshot mais recente <= data). */
export async function getSnapshotAsOf(date: Date): Promise<number | null> {
  const pool = getPool();
  if (!pool) return null;
  try {
    const { rows } = await pool.query<{ followers: string | number }>(
      `select followers
         from wbr_follower_snapshots_fernando
        where snapshot_date <= $1
        order by snapshot_date desc
        limit 1`,
      [ymd(date)]
    );
    return rows.length ? Number(rows[0].followers) : null;
  } catch (e) {
    console.warn("[followers-store] getSnapshotAsOf falhou:", e);
    return null;
  }
}
