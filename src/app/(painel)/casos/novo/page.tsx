"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AreaTexto, Botao, CabecalhoCartao, Caixa, Campo, Cartao, OpcaoRadio, TituloPagina, inputClasse } from "@/components/ui";
import { MOTIVOS_DESLIGAMENTO, type Caso, type Publico } from "@/lib/dados";
import { emailValido, vagasLivres } from "@/lib/regras";
import { usePainel } from "@/lib/store";

type Situacao = "acolhimento" | "escolha" | "atendimento" | "desligado";

const PUBLICOS: Caso["publico"][] = ["Adulto", "Adolescente", "Criança"];
const PUBLICO_TERAPEUTA: Record<Caso["publico"], Publico> = { Adulto: "Adultos", Adolescente: "Adolescentes", "Criança": "Crianças" };

const SITUACOES: { k: Situacao; titulo: string; descricao: string }[] = [
  { k: "acolhimento", titulo: "Em acolhimento", descricao: "Ainda falta a conversa inicial." },
  { k: "escolha", titulo: "Aguardando terapeuta", descricao: "Acolhimento feito; falta escolher quem atende." },
  { k: "atendimento", titulo: "Em atendimento", descricao: "Já está sendo atendido(a) por um terapeuta." },
  { k: "desligado", titulo: "Desligado", descricao: "O acompanhamento já foi encerrado." },
];

// Data local no formato do <input type="date">.
const hoje = () => new Date().toLocaleDateString("en-CA");

export default function NovoCaso() {
  const p = usePainel();
  const router = useRouter();
  const [f, setF] = useState({
    nome: "",
    idade: "",
    publico: "Adulto" as Caso["publico"],
    email: "",
    telefone: "",
    motivo: "",
    disponibilidade: "",
    recebidoEm: hoje(),
    situacao: "" as Situacao | "",
    risco: false,
    terapeutaId: "",
    desde: hoje(),
    termoOk: false,
    repasseOk: false,
    primeiroOk: false,
    motivoDesligamento: "",
  });
  const mudar = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  // Em atendimento: só terapeutas que atendem o público; quem não tem vaga aparece desabilitado.
  const terapeutasDoPublico = p.terapeutas.filter((t) => t.publico.includes(PUBLICO_TERAPEUTA[f.publico]));
  const terapeutaAtual = p.terapeutas.find((t) => t.id === f.terapeutaId);

  const faltas: string[] = [];
  if (!f.nome.trim()) faltas.push("o nome");
  if (f.email.trim() && !emailValido(f.email)) faltas.push("um e-mail válido");
  if (!f.situacao) faltas.push("a situação atual");
  if (f.situacao === "atendimento" && !terapeutaAtual) faltas.push("o terapeuta");
  if (f.situacao === "desligado" && !f.motivoDesligamento) faltas.push("o motivo do desligamento");
  const semContato = !f.email.trim() && !f.telefone.trim();

  const salvar = async () => {
    if (faltas.length) return;
    const id = await p.cadastrarCaso(f);
    if (id) router.push(`/casos/${id}`);
  };

  return (
    <>
      <Link href="/casos" className="self-start text-[13px] text-vinho hover:text-vinho-escuro">← Casos</Link>
      <header className="flex flex-col gap-1.5">
        <TituloPagina>Cadastrar caso</TituloPagina>
        <span className="max-w-[640px] text-[13px] text-tinta-suave text-pretty">
          Para casos que já existiam antes do painel ou chegaram por outro canal. O caso entra direto na situação em que está hoje, e nenhum
          e-mail é enviado.
        </span>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Cartao>
          <CabecalhoCartao titulo="Pessoa" />
          <div className="flex flex-col gap-4 px-[18px] py-4 text-[13px]">
            <Campo rotulo="Nome completo" value={f.nome} onChange={(e) => mudar("nome", e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
              <Campo rotulo="Idade" inputMode="numeric" value={f.idade} onChange={(e) => mudar("idade", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Opcional" />
              <div className="flex flex-col gap-1.5">
                <span className="font-medium" id="rotulo-publico">Público</span>
                <div role="radiogroup" aria-labelledby="rotulo-publico" className="flex flex-wrap gap-2">
                  {PUBLICOS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={f.publico === o}
                      onClick={() => setF((x) => ({ ...x, publico: o, terapeutaId: "" }))}
                      className={clsx(
                        "rounded-full border px-3.5 py-[7px] text-[13px] font-medium",
                        f.publico === o ? "border-vinho bg-vinho-suave text-vinho-escuro" : "border-linha-forte bg-superficie hover:border-vinho/40",
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="E-mail" type="email" value={f.email} onChange={(e) => mudar("email", e.target.value)} />
              <Campo rotulo="Telefone" type="tel" value={f.telefone} onChange={(e) => mudar("telefone", e.target.value)} placeholder="(11) 90000-0000" />
            </div>
            <AreaTexto rotulo="Motivo da busca" rows={3} value={f.motivo} onChange={(e) => mudar("motivo", e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_170px]">
              <Campo rotulo="Disponibilidade" value={f.disponibilidade} onChange={(e) => mudar("disponibilidade", e.target.value)} placeholder="Ex.: Seg e Qua, noite" />
              <Campo rotulo="Chegou em" type="date" max={hoje()} value={f.recebidoEm} onChange={(e) => mudar("recebidoEm", e.target.value)} />
            </div>
          </div>
        </Cartao>

        <Cartao>
          <CabecalhoCartao titulo="Situação atual" />
          <div className="flex flex-col gap-4 px-[18px] py-4 text-[13px]">
            <div role="radiogroup" aria-label="Situação atual" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {SITUACOES.map((s) => (
                <OpcaoRadio key={s.k} marcado={f.situacao === s.k} onClick={() => mudar("situacao", s.k)}>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{s.titulo}</span>
                    <span className="text-xs text-tinta-suave">{s.descricao}</span>
                  </span>
                </OpcaoRadio>
              ))}
            </div>

            {f.situacao === "acolhimento" && (
              <Marcar marcado={f.risco} aoMudar={(v) => mudar("risco", v)}>
                Há sinal de risco <span className="text-tinta-suave">— o caso entra como pendente, com prioridade.</span>
              </Marcar>
            )}

            {(f.situacao === "acolhimento" || f.situacao === "escolha") && semContato && (
              <p className="rounded-[10px] bg-caramelo-suave px-3.5 py-2.5 text-caramelo-tinta">
                {f.situacao === "acolhimento" ? "Sem e-mail e telefone, o caso entra como pendente até os dados serem completados." : "Sem e-mail e telefone não será possível avisar a pessoa."}
              </p>
            )}

            {f.situacao === "atendimento" && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="font-medium">Terapeuta</span>
                  <select className={inputClasse} value={f.terapeutaId} onChange={(e) => mudar("terapeutaId", e.target.value)}>
                    <option value="">Escolha…</option>
                    {terapeutasDoPublico.map((t) => {
                      const livres = vagasLivres({ ...t, active: true }, p.casos);
                      return (
                        <option key={t.id} value={t.id} disabled={!livres}>
                          {t.name} — {livres ? `${livres} ${livres === 1 ? "vaga livre" : "vagas livres"}` : "sem vaga"}
                          {t.active ? "" : " · pausado"}
                        </option>
                      );
                    })}
                  </select>
                  <span className="text-xs text-tinta-suave">
                    Só aparecem terapeutas que atendem {PUBLICO_TERAPEUTA[f.publico].toLowerCase()}. Sem vaga? Aumente as vagas no cadastro do terapeuta.
                  </span>
                </label>
                <Campo rotulo="Início do atendimento" type="date" min={f.recebidoEm} max={hoje()} value={f.desde} onChange={(e) => mudar("desde", e.target.value)} />
                <div className="flex flex-col gap-2.5">
                  <span className="font-medium">Já feito</span>
                  <Marcar marcado={f.termoOk} aoMudar={(v) => mudar("termoOk", v)}>Paciente assinou o termo de compromisso</Marcar>
                  <Marcar marcado={f.repasseOk} aoMudar={(v) => mudar("repasseOk", v)}>Terapeuta fez o repasse financeiro</Marcar>
                  <Marcar marcado={f.primeiroOk} aoMudar={(v) => mudar("primeiroOk", v)}>1º atendimento confirmado</Marcar>
                  <span className="text-xs text-tinta-suave">O que ficar desmarcado entra como pendência e pode gerar alerta de atraso no painel.</span>
                </div>
              </>
            )}

            {f.situacao === "desligado" && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="font-medium">Terapeuta que atendeu <span className="font-normal text-tinta-suave">(opcional)</span></span>
                  <select className={inputClasse} value={f.terapeutaId} onChange={(e) => mudar("terapeutaId", e.target.value)}>
                    <option value="">Nenhum / não sei</option>
                    {p.terapeutas.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </label>
                <Campo rotulo="Data do desligamento" type="date" min={f.recebidoEm} max={hoje()} value={f.desde} onChange={(e) => mudar("desde", e.target.value)} />
                <label className="flex flex-col gap-1.5">
                  <span className="font-medium">Motivo</span>
                  <select className={inputClasse} value={f.motivoDesligamento} onChange={(e) => mudar("motivoDesligamento", e.target.value)}>
                    <option value="">Escolha…</option>
                    {MOTIVOS_DESLIGAMENTO.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-linha-suave px-[18px] py-3.5">
            {faltas.length > 0 && <span className="mr-auto text-xs text-tinta-suave">Falta {faltas.join(", ")}.</span>}
            <Link href="/casos" className="rounded-lg px-3 py-[7px] text-[13px] text-tinta-suave hover:text-vinho">Cancelar</Link>
            <Botao variante="primario" tamanho="sm" disabled={faltas.length > 0 || p.ocupado} onClick={salvar}>Cadastrar caso</Botao>
          </div>
        </Cartao>
      </div>
    </>
  );
}

function Marcar({ marcado, aoMudar, children }: { marcado: boolean; aoMudar: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" role="checkbox" aria-checked={marcado} onClick={() => aoMudar(!marcado)} className="flex items-start gap-2.5 text-left">
      <span className="mt-px"><Caixa marcado={marcado} /></span>
      <span>{children}</span>
    </button>
  );
}
