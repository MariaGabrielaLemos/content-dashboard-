-- Snapshots diários de seguidores do Fernando — corre em dropstudios_meta (VPS Drop).
-- Por que existe: o comparativo WBR usava o total de seguidores de HOJE para todas
-- as janelas (7/30/90), então o delta de "Seguidores" sempre dava zero. Com snapshot
-- por dia, conseguimos "seguidores ao final daquele período" e o crescimento aparece.
-- Pedido direto do Fernando (feedback 02/06).
create table if not exists wbr_follower_snapshots_fernando (
  snapshot_date date primary key,
  followers     bigint not null,
  -- 'live' = capturado no load da dashboard (preciso);
  -- 'backfill' = reconstruído da Meta (follower_count diário, aproximado p/ unfollows)
  source        text not null default 'live' check (source in ('live','backfill')),
  created_at    timestamptz not null default now()
);
