-- Feedback queue do WBR Dashboard Fernando — corre em dropstudios_meta (VPS Drop).
-- Aplicado manualmente via psql remoto pelo Gabriel após go-live.
create table if not exists wbr_feedback_fernando (
  id text primary key,
  context text not null,
  sentiment text not null check (sentiment in ('positive','negative','suggestion')),
  message text not null,
  timestamp timestamptz not null default now(),
  status text not null default 'open' check (status in ('open','queued','shipped','wontfix'))
);
create index if not exists wbr_feedback_fernando_timestamp_idx on wbr_feedback_fernando (timestamp desc);
