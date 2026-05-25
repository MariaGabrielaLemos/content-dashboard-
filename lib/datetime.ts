/**
 * Helpers de data/hora com TZ explícito (America/Sao_Paulo).
 *
 * Por que existe: Vercel server roda em UTC. Quando `format(...)` do date-fns
 * é chamado num server component, ele formata na TZ do server (UTC), gerando
 * timestamps 3h à frente do leitor BRT. Fix: sempre `formatInTimeZone` com
 * `TZ_BR` ao renderizar pro Fernando/Maria.
 *
 * Regra: SEMPRE usar `fmtBR` no lugar de `format(parseISO(...))` em qualquer
 * página/componente que mostre data/hora ao usuário.
 */
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export const TZ_BR = "America/Sao_Paulo";

/**
 * Formata uma data ISO (string ou Date) no fuso de São Paulo.
 *
 * Aceita string ISO 8601, Date, ou timestamp numérico.
 */
export function fmtBR(
  iso: string | Date | number,
  pattern = "dd/MM 'às' HH:mm"
): string {
  return formatInTimeZone(iso, TZ_BR, pattern, { locale: ptBR });
}
