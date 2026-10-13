"use client";

import clsx from "clsx";
import { useState, useTransition } from "react";
import { CLAUSULAS_TERMO, type AceiteTermo } from "@/lib/dados";
import { api, ErroApi } from "@/lib/api";
import { Rosa } from "./marca";
import { botaoPublico, campoPublico } from "./moldura-publica";
import { Caixa } from "./ui";

export function FormularioTermo({
  token,
  primeiroNome,
  menorDeIdade,
  aceite,
  aoAceitar,
}: {
  token: string;
  primeiroNome: string;
  menorDeIdade: boolean;
  aceite: AceiteTermo | null;
  aoAceitar: () => Promise<unknown>;
}) {
  const [nome, setNome] = useState("");
  const [concordo, setConcordo] = useState(false);
  const [menorMarcado, setMenorMarcado] = useState(false);
  const [nomeMenor, setNomeMenor] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviando, iniciar] = useTransition();

  if (aceite) {
    return (
      <main className="flex w-full max-w-[560px] flex-col items-start gap-3.5 rounded-2xl border border-linha bg-superficie px-9 py-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vinho text-areia">
          <Rosa className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-[32px] font-semibold leading-tight text-ameixa">Termo aceito. Obrigado, {aceite.nome.split(" ")[0]}.</h1>
        <p className="text-[15px] leading-relaxed text-tinta-suave text-pretty">
          Enviamos uma cópia para o seu e-mail. Nossa equipe vai entrar em contato em breve para a conversa inicial.
        </p>
        <div className="text-xs text-tinta-suave">
          Aceito em {aceite.quando} por {aceite.nome}
          {aceite.menor && `, responsável por ${aceite.menor}`}
        </div>
      </main>
    );
  }

  // Abaixo de 18 anos o termo exige responsável legal (1.1).
  const menor = menorDeIdade || menorMarcado;
  const ok = nome.trim().split(/\s+/).length >= 2 && concordo && (!menor || nomeMenor.trim().length > 0);

  const enviar = () =>
    iniciar(async () => {
      try {
        await api(`/api/termo/${encodeURIComponent(token)}`, { corpo: { nome, menor: menor ? nomeMenor : undefined } });
        await aoAceitar();
        window.scrollTo(0, 0);
      } catch (e) {
        setErro(e instanceof ErroApi ? e.message : "Não foi possível concluir. Tente de novo.");
      }
    });

  return (
    <main className="flex w-full max-w-[720px] flex-col rounded-2xl border border-linha bg-superficie">
      <div className="flex flex-col gap-2 border-b border-linha-suave px-6 pb-6 pt-8 sm:px-9">
        <div className="text-[13px] text-tinta-suave">Olá, {primeiroNome}</div>
        <h1 className="font-serif text-[38px] font-semibold leading-tight text-ameixa">Termo de compromisso</h1>
        <p className="text-[15px] leading-relaxed text-tinta-suave text-pretty">
          Este termo explica como funciona o acompanhamento terapêutico oferecido pelo Projeto Florescer. Leia com calma — se algo não ficar
          claro, responda ao e-mail que você recebeu e conversamos.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6 sm:px-9">
        {CLAUSULAS_TERMO.map(([titulo, texto], i) => (
          <section key={titulo} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
            <span className="pt-0.5 font-serif text-lg font-semibold text-vinho">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-base font-semibold">{titulo}</h2>
              <p className="text-sm leading-[1.65] text-tinta text-pretty">{texto}</p>
            </div>
          </section>
        ))}
        <div className="flex flex-col gap-1 rounded-[10px] bg-terracota-suave px-4 py-3.5 text-sm text-terracota-tinta">
          <span className="font-semibold">Em caso de emergência</span>
          <span className="leading-normal">
            O projeto não oferece atendimento de urgência. Se precisar de ajuda imediata, ligue para o CVV (188) ou SAMU (192).
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-b-2xl border-t border-linha-suave bg-fundo px-6 pb-8 pt-6 sm:px-9">
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span className="font-medium">Nome completo</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome completo" autoComplete="name" className={campoPublico} />
        </label>
        <button
          type="button"
          role="checkbox"
          aria-checked={menor}
          aria-disabled={menorDeIdade}
          onClick={() => !menorDeIdade && setMenorMarcado(!menorMarcado)}
          className={clsx("flex items-center gap-2.5 text-left text-sm", menorDeIdade && "cursor-default")}
        >
          <Caixa marcado={menor} />
          <span>
            Sou responsável legal por menor de idade
            {menorDeIdade && <span className="block text-xs text-tinta-suave">Obrigatório: o pedido é para uma pessoa com menos de 18 anos.</span>}
          </span>
        </button>
        {menor && (
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium">Nome da criança ou adolescente</span>
            <input value={nomeMenor} onChange={(e) => setNomeMenor(e.target.value)} placeholder="Nome completo" className={campoPublico} />
          </label>
        )}
        <button type="button" role="checkbox" aria-checked={concordo} onClick={() => setConcordo(!concordo)} className="flex items-start gap-2.5 text-left text-sm leading-normal">
          <span className="mt-px"><Caixa marcado={concordo} /></span>
          Li e concordo com o termo de compromisso do Projeto Florescer.
        </button>
        {erro && <p role="alert" className="text-sm font-medium text-terracota-tinta">{erro}</p>}
        <button type="button" disabled={!ok || enviando} onClick={enviar} className={clsx(botaoPublico, "self-start")}>
          {enviando ? "Enviando…" : "Aceitar termo"}
        </button>
      </div>
    </main>
  );
}
