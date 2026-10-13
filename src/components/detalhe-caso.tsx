"use client";

import clsx from "clsx";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AreaTexto, Botao, Caixa, Cartao, CabecalhoCartao, Modal, OpcaoRadio, Ponto, Radio, TituloPagina, inputClasse } from "@/components/ui";
import { LINK_TERMO, MOTIVOS_DESLIGAMENTO, MOTIVOS_RETORNO, ORIENTACOES_TERAPEUTA, camposFicha, emailBoasVindas, primeiroNome, type Caso } from "@/lib/dados";
import { formatarPublico, haDias, ocupacao, parado, plural, problemaContato, statusInfo, sugerirTerapeutas, ultimoRetorno } from "@/lib/regras";
import { usePainel } from "@/lib/store";

type ModalAberto = null | "gerar" | "ficha" | "boasVindas" | "retorno" | "desligamento";

const NI = "Não informado";

function camposFormulario(c: Caso) {
  return [
    ["Nome", c.name],
    ["Idade", c.age === null ? "" : String(c.age)],
    ["E-mail", c.email],
    ["Telefone", c.phone],
    ["Motivo", c.motivo],
    ["Disponibilidade", c.disp],
    ["Público", c.publico],
    ...(c.ficha ? camposFicha(c.ficha).map((f) => [f.rotulo, f.valor] as const) : []),
    ...(c.consentimentoEm ? [["Consentimento LGPD", `aceito em ${c.consentimentoEm}`] as const] : []),
  ] as const;
}

function TabelaCampos({ caso, larguraRotulo = 140 }: { caso: Caso; larguraRotulo?: number }) {
  return (
    <div className="grid gap-x-4 gap-y-2.5 text-[13px]" style={{ gridTemplateColumns: `${larguraRotulo}px minmax(0,1fr)` }}>
      {camposFormulario(caso).map(([k, v]) => (
        <div key={k} className="contents">
          <span className="text-tinta-suave">{k}</span>
          <span className={clsx("text-pretty", v ? "text-tinta" : "text-terracota-tinta")}>{v || NI}</span>
        </div>
      ))}
    </div>
  );
}

function linhaDoTempo(c: Caso) {
  const fase = ({ acolhimento: 0, escolha: 1, atendimento: c.primeiroOk ? 4 : 3, desligado: 5 } as Record<string, number>)[c.status] ?? -1;
  const passos: [string, string][] = [
    ["Solicitação recebida", c.recv],
    ["Acolhimento", fase > 0 ? "conversa inicial realizada" : "aguardando conversa inicial"],
    ["Terapeuta escolhido", c.ter ? `${c.ter}${c.encaminhadoEm ? ` · em ${c.encaminhadoEm}` : ""}` : "aguardando sua escolha"],
    ["Ficha e termo de orientação enviados", c.ter ? `a ${c.ter} · prazo de contato: 5 dias úteis` : "—"],
    ["1º atendimento", c.primeiroOk ? "confirmado pelo terapeuta" : "—"],
    ["Desligamento", c.motivoDeslig ? `Motivo: ${c.motivoDeslig}` : "—"],
  ];
  type Passo = { label: string; date: string; estado: "feito" | "agora" | "futuro" | "atencao" | "problema" };
  const itens: Passo[] = passos.map(([label, date], i) => ({
    label,
    date,
    estado: fase >= 0 && i <= fase ? "feito" : fase >= 0 && i === fase + 1 ? "agora" : "futuro",
  }));
  // Histórico de retornos (2.3), do mais antigo ao mais recente, logo após o acolhimento.
  (c.retornos ?? []).forEach((r, i) =>
    itens.splice(2 + i, 0, { label: "Retorno à escolha de terapeuta", date: `${r.data} · saiu de ${r.de} · ${r.motivo}`, estado: "atencao" }),
  );
  if (c.status === "pendente")
    itens.splice(1, 0, {
      label: c.risk ? "Menção de risco — fluxo pausado" : "Dados incompletos",
      date: c.risk ? "avise a pessoa responsável imediatamente" : problemaContato(c) ?? "",
      estado: "problema",
    });
  return itens;
}

export function DetalheCaso({ id }: { id: string }) {
  const p = usePainel();
  const caso = p.casos.find((c) => c.id === id);

  const [modal, setModal] = useState<ModalAberto>(null);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [retorno, setRetorno] = useState({ motivo: "", obs: "" });
  const [desligamento, setDesligamento] = useState("");
  const fechar = useCallback(() => setModal(null), []);

  if (!caso) {
    return (
      <div className="flex flex-col gap-3">
        <Link href="/casos" className="text-[13px] text-vinho hover:text-vinho-escuro">← Casos</Link>
        <TituloPagina>Caso não encontrado</TituloPagina>
      </div>
    );
  }

  const st = statusInfo(caso.status);
  const { sugestoes, fora } = sugerirTerapeutas(caso, p.terapeutas, p.casos);
  const retornoAtual = caso.status === "escolha" ? ultimoRetorno(caso) : undefined;
  const alertaParado = parado(caso);
  const terEscolhido = p.terapeutas.find((t) => t.id === escolhido && sugestoes.some((s) => s.terapeuta.id === t.id));
  const enviouBoasVindas = !!caso.boasVindasEm;
  const terAtual = p.terapeutas.find((t) => t.name === caso.ter);

  const linkPresente = !!email?.body.includes(LINK_TERMO);

  const abrirBoasVindas = () => {
    const tpl = emailBoasVindas(caso);
    setEmail({ subject: tpl.subject, body: tpl.body });
    setModal("boasVindas");
  };

  return (
    <>
      <Link href="/casos" className="self-start text-[13px] text-vinho hover:text-vinho-escuro">← Casos</Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <TituloPagina>{caso.name}</TituloPagina>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-tinta-suave">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-linha bg-superficie px-2.5 py-1 text-tinta">
              <Ponto className={st.dot} />
              {st.label}
            </span>
            <span>{haDias(caso.days)} neste status</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Botao tamanho="sm" onClick={() => setModal("ficha")}>Ver ficha</Botao>
          {caso.status !== "desligado" && (
            <Botao tamanho="sm" onClick={() => { setDesligamento(""); setModal("desligamento"); }}>Registrar desligamento</Botao>
          )}
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          {caso.status === "pendente" && (
            <div className="flex flex-col gap-3 rounded-xl border border-terracota/30 bg-terracota-suave px-4 py-3.5 text-[13px] text-terracota-tinta">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{caso.risk ? "O formulário menciona risco" : "Dados incompletos"}</span>
                <span className="text-pretty">
                  {caso.risk
                    ? "O fluxo normal está pausado. Entre em contato com a pessoa hoje e, se necessário, oriente a procurar o CVV (188) ou o SAMU (192)."
                    : `${problemaContato(caso) ?? "Dados de contato incompletos"}. Corrija os dados com a pessoa antes de seguir para o acolhimento.`}
                </span>
              </div>
              <Botao tamanho="sm" className="self-start" disabled={p.ocupado} onClick={() => p.sairDePendente(caso.id)}>
                {caso.risk ? "Risco tratado · voltar ao acolhimento" : "Dados corrigidos · voltar ao acolhimento"}
              </Botao>
            </div>
          )}

          {caso.status === "acolhimento" && (
            <Cartao className="flex flex-col gap-3 px-[18px] py-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[15px] font-semibold">Acolhimento</h2>
                <span className="text-[13px] text-tinta-suave text-pretty">
                  Dê as boas-vindas e envie o termo de compromisso. Depois da conversa inicial, conclua o acolhimento.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-linha-suave p-3">
                <Ponto tamanho={10} className={enviouBoasVindas ? "bg-ameixa" : "bg-caramelo"} />
                <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">E-mail de boas-vindas + termo de compromisso</span>
                  <span className="text-xs text-tinta-suave">{caso.aceite ? `Termo aceito em ${caso.aceite.quando}` : enviouBoasVindas ? `Enviado em ${caso.boasVindasEm} · aguardando aceite do termo` : "Ainda não enviado"}</span>
                </div>
                <Botao tamanho="sm" onClick={abrirBoasVindas}>{enviouBoasVindas ? "Reenviar" : "Escrever e-mail"}</Botao>
              </div>
              <div className="flex justify-end">
                <Botao variante="primario" disabled={p.ocupado} onClick={() => p.concluirAcolhimento(caso.id)}>Concluir acolhimento</Botao>
              </div>
            </Cartao>
          )}

          {caso.status === "atendimento" && (
            <Cartao className="flex flex-col gap-3 px-[18px] py-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[15px] font-semibold">Acompanhamento</h2>
                <span className="text-[13px] text-tinta-suave">Em atendimento com {caso.ter}{caso.encaminhadoEm && ` desde ${caso.encaminhadoEm}`}.</span>
              </div>
              {alertaParado && (
                <div className="flex flex-wrap items-center gap-3 rounded-[10px] bg-caramelo-suave px-3.5 py-2.5 text-[13px] text-caramelo-tinta">
                  <span className="flex-1 font-medium">{alertaParado.texto}</span>
                  <Botao tamanho="sm" disabled={p.ocupado} onClick={() => p.enviarLembrete(caso.id)}>
                    Enviar lembrete
                  </Botao>
                </div>
              )}
              {(
                [
                  ["termoOk", "Paciente assinou o termo de compromisso", caso.aceite ? `Aceito online por ${caso.aceite.nome} em ${caso.aceite.quando}` : "Assinado", "Aguardando assinatura"],
                  ["repasseOk", "Terapeuta fez o repasse financeiro", "Repasse recebido", "Repasse pendente"],
                  ["primeiroOk", "Terapeuta confirmou o 1º atendimento", "Confirmado", "Aguardando confirmação · prazo de 5 dias úteis"],
                ] as const
              ).map(([k, label, sim, nao]) => {
                const on = !!caso[k];
                return (
                  <button
                    key={k}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    disabled={p.ocupado}
                    onClick={() => p.marcar(caso.id, k, !on)}
                    className={clsx(
                      "flex items-center gap-3 rounded-[10px] border p-3 text-left",
                      on ? "border-ameixa/25 bg-ameixa-suave" : "border-linha-suave bg-superficie hover:border-linha-forte",
                    )}
                  >
                    <Caixa marcado={on} />
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-tinta-suave">{on ? sim : nao}</span>
                    </span>
                  </button>
                );
              })}
              <div className="flex justify-end pt-1">
                <Botao tamanho="sm" onClick={() => { setRetorno({ motivo: "", obs: "" }); setModal("retorno"); }}>
                  Retornar para escolha de terapeuta
                </Botao>
              </div>
            </Cartao>
          )}

          {retornoAtual && (
            <div className="flex flex-col gap-0.5 rounded-[10px] bg-caramelo-suave px-4 py-3 text-[13px] text-caramelo-tinta">
              <span className="font-semibold">Retornou da terapia com {retornoAtual.de} em {retornoAtual.data}</span>
              <span className="text-pretty">
                Motivo: {retornoAtual.motivo}
                {retornoAtual.obs && ` — ${retornoAtual.obs}`}
              </span>
            </div>
          )}

          {caso.status === "escolha" && (
            <Cartao className="overflow-hidden">
              <CabecalhoCartao titulo="Terapeutas sugeridos">Escolha um. Nada é registrado até você confirmar.</CabecalhoCartao>
              <div role="radiogroup" aria-label="Terapeutas sugeridos">
                {sugestoes.map(({ terapeuta: t, porque }) => {
                  const on = escolhido === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setEscolhido(t.id)}
                      className={clsx(
                        "flex w-full items-start gap-3.5 border-b border-linha-suave px-[18px] py-4 text-left",
                        on ? "bg-vinho-suave" : "bg-superficie hover:bg-fundo",
                      )}
                    >
                      <span className="mt-0.5"><Radio marcado={on} /></span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="flex justify-between gap-2">
                          <span className="text-[15px] font-semibold">{t.name}</span>
                          <span className="text-xs text-tinta-suave">{ocupacao(t, p.casos)} de {t.cap}</span>
                        </span>
                        <span className="text-xs text-tinta-suave">{formatarPublico(t.publico)} · {t.disp}</span>
                        <span className="text-[13px] leading-[1.45] text-pretty">{porque}</span>
                      </span>
                    </button>
                  );
                })}
                {!sugestoes.length && (
                  <p className="border-b border-linha-suave px-[18px] py-4 text-[13px] text-tinta-suave">
                    Nenhum terapeuta disponível combina com este caso agora.
                  </p>
                )}
              </div>
              {fora.length > 0 && (
                <div className="bg-fundo px-[18px] py-3 text-xs text-tinta-suave">
                  Fora da sugestão: {fora.map((f) => `${f.terapeuta.name} (${f.motivo})`).join(" · ")}
                </div>
              )}
              <div className="flex justify-end border-t border-linha-suave px-[18px] py-3.5">
                <Botao variante="primario" disabled={!terEscolhido} onClick={() => setModal("gerar")}>
                  {terEscolhido ? "Confirmar e gerar ficha" : "Escolha um terapeuta"}
                </Botao>
              </div>
            </Cartao>
          )}

          <Cartao className="flex flex-col gap-3.5 px-[18px] py-4">
            <h2 className="text-[15px] font-semibold">Dados do formulário</h2>
            <TabelaCampos caso={caso} />
          </Cartao>
        </div>

        <Cartao className="flex flex-col gap-1 px-[18px] py-4">
          <h2 className="mb-2.5 text-[15px] font-semibold">Linha do tempo</h2>
          {linhaDoTempo(caso).map((s, i, arr) => (
            <div key={s.label} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={clsx(
                    "mt-[3px] h-3 w-3 flex-none rounded-full border-2",
                    s.estado === "feito" && "border-vinho bg-vinho",
                    s.estado === "agora" && "border-caramelo bg-superficie",
                    s.estado === "futuro" && "border-linha-forte bg-superficie",
                    s.estado === "atencao" && "border-caramelo bg-caramelo",
                    s.estado === "problema" && "border-terracota bg-terracota",
                  )}
                />
                {i < arr.length - 1 && <span className="min-h-[26px] w-px flex-1 bg-linha" />}
              </div>
              <div className="flex flex-col gap-0.5 pb-4">
                <span
                  className={clsx(
                    "text-sm",
                    s.estado === "agora" || s.estado === "atencao" || s.estado === "problema" ? "font-semibold" : "font-normal",
                    s.estado === "futuro" && "text-tinta-apagada",
                    s.estado === "atencao" && "text-caramelo-tinta",
                    s.estado === "problema" && "text-terracota-tinta",
                  )}
                >
                  {s.label}
                </span>
                <span className="text-xs text-tinta-suave">{s.date}</span>
              </div>
            </div>
          ))}
        </Cartao>
      </div>

      {/* Confirmação do encaminhamento */}
      <Modal
        aberto={modal === "gerar" && !!terEscolhido}
        aoFechar={fechar}
        largura={640}
        sobretitulo="Pré-visualização · confira antes de enviar"
        titulo="Ficha do paciente e termo de orientação"
        rodape={
          <>
            <Botao tamanho="sm" onClick={fechar}>Voltar</Botao>
            <Botao variante="primario" tamanho="sm" disabled={p.ocupado} onClick={async () => { if (await p.encaminhar(caso.id, terEscolhido!.id)) { setEscolhido(null); fechar(); } }}>
              Enviar a {terEscolhido && primeiroNome(terEscolhido.name)}
            </Botao>
          </>
        }
      >
        {terEscolhido && (
          <>
            <Envelope para={`${terEscolhido.name} · ${terEscolhido.email}`} assunto={`Novo encaminhamento: ${caso.name}`} />
            <div className="rounded-[10px] border border-linha-suave p-3.5"><TabelaCampos caso={caso} larguraRotulo={150} /></div>
            <p className="text-xs text-tinta-suave">Campos em vermelho não foram respondidos no formulário. Nada é gravado até você enviar.</p>
            <div className="flex flex-col gap-2.5 rounded-[10px] border border-linha-suave bg-fundo px-4 py-3.5">
              <div className="font-serif text-lg font-semibold text-ameixa">Termo de orientação ao terapeuta</div>
              {ORIENTACOES_TERAPEUTA.map((o, i) => (
                <div key={i} className="grid grid-cols-[20px_minmax(0,1fr)] gap-2 leading-normal">
                  <span className="font-bold text-vinho">{i + 1}</span>
                  <span className="text-pretty">{o}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      {/* Ficha (somente leitura / reenvio) */}
      <Modal
        aberto={modal === "ficha"}
        aoFechar={fechar}
        largura={640}
        sobretitulo={caso.ter ? "Enviada no encaminhamento · reenvie se precisar" : "Pré-visualização"}
        titulo="Ficha de encaminhamento"
        rodape={
          <>
            <Botao tamanho="sm" onClick={fechar}>Fechar</Botao>
            {caso.ter && (
              <Botao variante="primario" tamanho="sm" disabled={p.ocupado} onClick={async () => { if (await p.reenviarFicha(caso.id)) fechar(); }}>
                Reenviar ficha
              </Botao>
            )}
          </>
        }
      >
        <Envelope para={caso.ter ? `${caso.ter} · ${terAtual?.email ?? "—"}` : "— (sem terapeuta definido)"} assunto={`Novo encaminhamento: ${caso.name}`} />
        <div className="rounded-[10px] border border-linha-suave p-3.5"><TabelaCampos caso={caso} larguraRotulo={150} /></div>
        <p className="whitespace-pre-line text-xs leading-relaxed text-tinta-suave">
          {`Por favor, entre em contato com ${primeiroNome(caso.name)} em até 5 dias úteis e confirme a data do primeiro atendimento respondendo a este e-mail.\n\nCampos em vermelho não foram respondidos no formulário.`}
        </p>
      </Modal>

      {/* Boas-vindas */}
      <Modal
        aberto={modal === "boasVindas" && !!email}
        aoFechar={fechar}
        largura={640}
        sobretitulo="Mensagem pré-definida · edite se quiser antes de enviar"
        titulo="Boas-vindas e termo de compromisso"
        rodape={
          <>
            <Botao variante="texto" className="mr-auto" onClick={() => setEmail(emailBoasVindas(caso))}>Restaurar texto padrão</Botao>
            <Botao tamanho="sm" onClick={fechar}>Cancelar</Botao>
            <Botao variante="primario" tamanho="sm" disabled={!linkPresente || p.ocupado} onClick={async () => { if (await p.enviarBoasVindas(caso.id, email!.subject, email!.body)) fechar(); }}>
              Enviar e-mail
            </Botao>
          </>
        }
      >
        {email && (
          <>
            <div className="grid grid-cols-[70px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5">
              <span className="text-tinta-suave">Para</span>
              <span className="text-sm">{caso.email}</span>
              <span className="text-tinta-suave">Assunto</span>
              <input aria-label="Assunto" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} className={inputClasse} />
            </div>
            <AreaTexto aria-label="Mensagem" rows={14} value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} />
            {!linkPresente && (
              <p className="text-xs font-medium text-terracota-tinta">
                O link {LINK_TERMO} é obrigatório. Inclua-o de volta no texto ou restaure o texto padrão.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2.5 rounded-lg bg-fundo px-3 py-2.5">
              <span className="flex-1 text-xs text-tinta-suave">
                O link <strong className="text-tinta">[Assinar termo de compromisso]</strong> é inserido automaticamente e é individual para esta pessoa.
              </span>
              <a href={`/termo/${caso.termoToken}`} target="_blank" rel="noreferrer" className="flex-none text-[13px] font-medium text-vinho hover:text-vinho-escuro">
                Ver termo ↗
              </a>
            </div>
          </>
        )}
      </Modal>

      {/* Retorno à escolha */}
      <Modal
        aberto={modal === "retorno"}
        aoFechar={fechar}
        largura={540}
        titulo="Retornar para escolha de terapeuta"
        descricao={`${caso.name} sai do atendimento com ${caso.ter} e a vaga é liberada.`}
        rodape={
          <>
            <Botao tamanho="sm" onClick={fechar}>Cancelar</Botao>
            <Botao variante="primario" tamanho="sm" disabled={!retorno.motivo || p.ocupado} onClick={async () => { if (await p.retornarParaEscolha(caso.id, retorno.motivo, retorno.obs.trim())) { setEscolhido(null); fechar(); } }}>
              Confirmar retorno
            </Botao>
          </>
        }
      >
        <div role="radiogroup" aria-label="Motivo do retorno" className="flex flex-col gap-2">
          <span className="font-medium">Motivo do retorno</span>
          {MOTIVOS_RETORNO.map((m) => (
            <OpcaoRadio key={m} marcado={retorno.motivo === m} onClick={() => setRetorno({ ...retorno, motivo: m })}>{m}</OpcaoRadio>
          ))}
        </div>
        <AreaTexto rotulo="Observações (opcional)" rows={3} placeholder="Detalhes que ajudem na nova escolha" value={retorno.obs} onChange={(e) => setRetorno({ ...retorno, obs: e.target.value })} />
      </Modal>

      {/* Desligamento */}
      <Modal
        aberto={modal === "desligamento"}
        aoFechar={fechar}
        largura={540}
        titulo="Registrar desligamento"
        descricao={caso.ter ? `${caso.name} deixa o acompanhamento e a vaga de ${caso.ter} é liberada. O histórico fica preservado.` : `O caso de ${caso.name} é encerrado. O histórico fica preservado.`}
        rodape={
          <>
            <Botao tamanho="sm" onClick={fechar}>Cancelar</Botao>
            <Botao variante="primario" tamanho="sm" disabled={!desligamento || p.ocupado} onClick={async () => { if (await p.desligar(caso.id, desligamento)) fechar(); }}>
              Registrar
            </Botao>
          </>
        }
      >
        <div role="radiogroup" aria-label="Motivo do desligamento" className="flex flex-col gap-2">
          <span className="font-medium">Motivo</span>
          {MOTIVOS_DESLIGAMENTO.map((m) => (
            <OpcaoRadio key={m} marcado={desligamento === m} onClick={() => setDesligamento(m)}>{m}</OpcaoRadio>
          ))}
        </div>
      </Modal>
    </>
  );
}

function Envelope({ para, assunto }: { para: string; assunto: string }) {
  return (
    <div className="grid grid-cols-[60px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-tinta-suave">
      <span>Para</span>
      <span className="text-tinta">{para}</span>
      <span>Assunto</span>
      <span className="text-tinta">{assunto}</span>
    </div>
  );
}
