/**
 * Feedback queue do Fernando.
 *
 * V2 (PR #4, 2026-05-25) — Postgres self-hosted Drop Studios (banco `dropstudios_meta`).
 * Antes era JSON em disco; quebrou em Vercel stateless (feedback do Fernando 2026-05-25
 * sumiu). Migrou junto com a dashboard pra Coolify VPS Drop.
 *
 * Schema: `db/migrations/001_wbr_feedback_fernando.sql`.
 * Interface pública mantida — consumers não precisam mudar.
 */
import { Pool } from "pg";

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

// Pool singleton — sobrevive hot-reload do Next.js dev via globalThis.
const globalForPg = globalThis as unknown as { __wbrPgPool?: Pool };

function getPool(): Pool {
  if (globalForPg.__wbrPgPool) return globalForPg.__wbrPgPool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não está setado — feedback queue precisa do postgres do Drop (dropstudios_meta)."
    );
  }
  const pool = new Pool({ connectionString: url, max: 5 });
  globalForPg.__wbrPgPool = pool;
  return pool;
}

interface FeedbackRow {
  id: string;
  context: string;
  sentiment: Feedback["sentiment"];
  message: string;
  timestamp: Date;
  status: FeedbackStatus;
}

function rowToFeedback(r: FeedbackRow): Feedback {
  return {
    id: r.id,
    context: r.context,
    sentiment: r.sentiment,
    message: r.message,
    timestamp: r.timestamp.toISOString(),
    status: r.status,
  };
}

export async function listFeedback(): Promise<Feedback[]> {
  const { rows } = await getPool().query<FeedbackRow>(
    `select id, context, sentiment, message, timestamp, status
       from wbr_feedback_fernando
      order by timestamp desc`
  );
  return rows.map(rowToFeedback);
}

export async function addFeedback(input: {
  context: string;
  sentiment: Feedback["sentiment"];
  message: string;
}): Promise<Feedback> {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const { rows } = await getPool().query<FeedbackRow>(
    `insert into wbr_feedback_fernando (id, context, sentiment, message)
          values ($1, $2, $3, $4)
       returning id, context, sentiment, message, timestamp, status`,
    [id, input.context, input.sentiment, input.message]
  );
  return rowToFeedback(rows[0]);
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<Feedback | null> {
  const { rows } = await getPool().query<FeedbackRow>(
    `update wbr_feedback_fernando
        set status = $2
      where id = $1
   returning id, context, sentiment, message, timestamp, status`,
    [id, status]
  );
  if (rows.length === 0) return null;
  return rowToFeedback(rows[0]);
}
