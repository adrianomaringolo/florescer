const FUSO = "America/Sao_Paulo";
const DIA_MS = 24 * 60 * 60 * 1000;

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString("pt-BR", { timeZone: FUSO, ...o });

/** 05/10 */
export const diaMes = (d: Date) => fmt(d, { day: "2-digit", month: "2-digit" });
/** 05/10 · 14:20 */
export const diaMesHora = (d: Date) => `${diaMes(d)} · ${fmt(d, { hour: "2-digit", minute: "2-digit" })}`;
/** 05/10/2026 às 14:20 */
export const dataHoraCompleta = (d: Date) =>
  `${fmt(d, { day: "2-digit", month: "2-digit", year: "numeric" })} às ${fmt(d, { hour: "2-digit", minute: "2-digit" })}`;

/** Dias corridos desde a data. */
export const diasDesde = (d: Date, agora = new Date()) => Math.max(0, Math.floor((agora.getTime() - d.getTime()) / DIA_MS));

/** "Hoje, 08:40" / "Ontem, 17:12" / "05/10" */
export function ultimoAcesso(d: Date | null) {
  if (!d) return "—";
  const dias = diasDesde(d);
  const hora = fmt(d, { hour: "2-digit", minute: "2-digit" });
  return dias === 0 ? `Hoje, ${hora}` : dias === 1 ? `Ontem, ${hora}` : diaMes(d);
}
