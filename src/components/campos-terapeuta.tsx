"use client";

import clsx from "clsx";
import { Campo } from "@/components/ui";
import { GENEROS_TERAPEUTA, type Publico, type Terapeuta } from "@/lib/dados";
import { emailValido } from "@/lib/regras";

const PUBLICOS: Publico[] = ["Crianças", "Adolescentes", "Adultos"];

export type FormTerapeuta = { name: string; email: string; genero: string; publico: Publico[]; disp: string; cap: number };

export const FORM_VAZIO: FormTerapeuta = { name: "", email: "", genero: "", publico: [], disp: "", cap: 3 };

export const formDe = (t: Terapeuta): FormTerapeuta => ({ name: t.name, email: t.email, genero: t.genero, publico: t.publico, disp: t.disp, cap: t.cap });

export const formValido = (f: FormTerapeuta) => !!(f.name.trim() && emailValido(f.email) && f.genero && f.publico.length > 0 && f.disp.trim());

/** Campos do cadastro de terapeuta, usados no modal de cadastro e na página de edição. */
export function CamposTerapeuta({ valor: f, aoMudar, minimoVagas = 1 }: { valor: FormTerapeuta; aoMudar: (f: FormTerapeuta) => void; minimoVagas?: number }) {
  const alternarPublico = (p: Publico) =>
    aoMudar({ ...f, publico: PUBLICOS.filter((q) => (q === p ? !f.publico.includes(p) : f.publico.includes(q))) });

  return (
    <>
      <Campo rotulo="Nome completo" value={f.name} onChange={(e) => aoMudar({ ...f, name: e.target.value })} placeholder="Ex.: Paula Mendes" />
      <Campo rotulo="E-mail" type="email" value={f.email} onChange={(e) => aoMudar({ ...f, email: e.target.value })} placeholder="nome@email.com" />
      <div className="flex flex-col gap-2">
        <span className="font-medium" id="rotulo-genero">Gênero</span>
        <div role="radiogroup" aria-labelledby="rotulo-genero" className="flex flex-wrap gap-2">
          {GENEROS_TERAPEUTA.map((g) => (
            <Pilula key={g} role="radio" aria-checked={f.genero === g} ligada={f.genero === g} onClick={() => aoMudar({ ...f, genero: g })}>
              {g}
            </Pilula>
          ))}
        </div>
        <span className="text-xs text-tinta-suave">Usado quando a pessoa pede terapeuta mulher ou homem no formulário.</span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium">Público atendido</span>
        <div className="flex flex-wrap gap-2">
          {PUBLICOS.map((p) => (
            <Pilula key={p} aria-pressed={f.publico.includes(p)} ligada={f.publico.includes(p)} onClick={() => alternarPublico(p)}>
              {p}
            </Pilula>
          ))}
        </div>
      </div>
      <Campo rotulo="Disponibilidade" value={f.disp} onChange={(e) => aoMudar({ ...f, disp: e.target.value })} placeholder="Ex.: Ter e Qui, noite" />
      <div className="flex flex-col gap-1.5">
        <span className="font-medium">Vagas</span>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-label="Menos vagas" disabled={f.cap <= Math.max(1, minimoVagas)} onClick={() => aoMudar({ ...f, cap: Math.max(1, minimoVagas, f.cap - 1) })} className="h-10 w-10 rounded-lg border border-linha-forte bg-superficie text-lg hover:bg-vinho-suave disabled:cursor-not-allowed disabled:opacity-40">−</button>
          <span className="min-w-10 text-center text-base font-semibold">{f.cap}</span>
          <button type="button" aria-label="Mais vagas" disabled={f.cap >= 15} onClick={() => aoMudar({ ...f, cap: Math.min(15, f.cap + 1) })} className="h-10 w-10 rounded-lg border border-linha-forte bg-superficie text-lg hover:bg-vinho-suave disabled:cursor-not-allowed disabled:opacity-40">+</button>
          <span className="text-xs text-tinta-suave">
            {minimoVagas > 1 ? `pessoas atendidas ao mesmo tempo (mínimo ${minimoVagas}, que já estão em atendimento)` : "pessoas atendidas ao mesmo tempo (1 a 15)"}
          </span>
        </div>
      </div>
    </>
  );
}

export function Pilula({ ligada, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { ligada: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "rounded-full border px-3.5 py-[7px] text-[13px] font-medium",
        ligada ? "border-vinho bg-vinho-suave text-vinho-escuro" : "border-linha-forte bg-superficie text-tinta hover:border-vinho/40",
        className,
      )}
    />
  );
}
