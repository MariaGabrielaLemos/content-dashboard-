-- Metas (Projetado vs Realizado) do WBR Dashboard Fernando.
-- Corre em dropstudios_meta (VPS Drop). Antes vivia em data/goals.json, que não
-- sobrevivia no container standalone (ENOENT → crash de SSR da página). Migrado
-- pra postgres como o feedback (001), pra persistir entre deploys.
create table if not exists wbr_goals_fernando (
  id            text primary key,
  metric        text not null check (metric in ('followers','reach','engagement')),
  target        bigint not null,
  deadline      date not null,
  baseline      bigint not null,
  baseline_date date not null,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists wbr_goals_fernando_deadline_idx on wbr_goals_fernando (deadline);

-- Seed: meta real do Fernando — 40k seguidores até 30/07/2026.
-- baseline = total de seguidores no dia em que a meta foi cravada (02/06/2026).
insert into wbr_goals_fernando (id, metric, target, deadline, baseline, baseline_date, note)
values ('fernando-40k-jul2026', 'followers', 40000, '2026-07-30', 35716, '2026-06-02',
        'Chegar a 40k seguidores até 30/07.')
on conflict (id) do nothing;
