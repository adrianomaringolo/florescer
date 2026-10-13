"use client";

import { useState } from "react";
import { Botao, Campo, Cartao, Modal, OpcaoRadio, Selo, TituloPagina, inputClasse, type Tom } from "@/components/ui";
import type { UsuarioStatus } from "@/lib/dados";
import { emailValido } from "@/lib/regras";
import { usePainel } from "@/lib/store";

const SITUACAO: Record<UsuarioStatus, [string, Tom]> = {
  ativo: ["Ativo", "ok"],
  convite: ["Convite enviado", "atencao"],
  inativo: ["Desativado", "neutro"],
};

const SENHA_MINIMA = 8;

/** Senha provisória legível (sem 0/O, 1/l), para ser passada por mensagem. */
function gerarSenha() {
  const letras = "abcdefghjkmnpqrstuvwxyz";
  const digitos = "23456789";
  const sorteio = crypto.getRandomValues(new Uint32Array(10));
  const parte = (de: number, ate: number, base: string) => Array.from(sorteio.slice(de, ate), (n) => base[n % base.length]).join("");
  return `${parte(0, 4, letras)}-${parte(4, 8, letras)}-${parte(8, 10, digitos)}`;
}

type Forma = "convite" | "senha";

function CampoSenhaProvisoria({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5 text-[13px]">
      <label htmlFor="senha-provisoria" className="font-medium">Senha provisória</label>
      <span className="flex gap-2">
        <input
          id="senha-provisoria"
          aria-describedby="senha-provisoria-ajuda"
          className={`${inputClasse} min-w-0 flex-1 font-mono`}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <Botao tamanho="sm" onClick={() => aoMudar(gerarSenha())}>Gerar outra</Botao>
      </span>
      <span id="senha-provisoria-ajuda" className={valor.length >= SENHA_MINIMA ? "text-xs text-tinta-suave" : "text-xs text-terracota-tinta"}>
        Pelo menos {SENHA_MINIMA} caracteres. Anote antes de salvar e passe à pessoa por um canal seguro — ela não vai por e-mail.
      </span>
    </div>
  );
}

const iniciais = (nome: string) => nome.split(" ").map((w) => w[0]).slice(0, 2).join("");

export default function Usuarios() {
  const { usuarios, usuario, cadastrarUsuario, redefinirSenha, editarUsuario, ocupado } = usePainel();
  const [edicao, setEdicao] = useState<{ id: string; name: string; email: string; emailAntes: string } | null>(null);
  const edicaoValida = !!edicao && !!edicao.name.trim() && emailValido(edicao.email);
  const [redefinir, setRedefinir] = useState<{ id: string; nome: string; senha: string } | null>(null);
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState({ name: "", email: "", forma: "senha" as Forma, senha: "" });
  const senhaOk = f.forma === "convite" || f.senha.length >= SENHA_MINIMA;
  const valido = f.name.trim() && emailValido(f.email) && senhaOk;
  const abrir = () => {
    setF({ name: "", email: "", forma: "senha", senha: gerarSenha() });
    setAberto(true);
  };
  const salvar = async () => {
    const ok = await cadastrarUsuario({ name: f.name.trim(), email: f.email.trim(), ...(f.forma === "senha" && { senha: f.senha }) });
    if (ok) setAberto(false);
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <TituloPagina>Usuários</TituloPagina>
          <span className="text-[13px] text-tinta-suave">Pessoas cadastradas têm acesso completo ao painel.</span>
        </div>
        <Botao variante="primario" onClick={abrir}>Cadastrar usuário</Botao>
      </header>

      <Cartao className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-[minmax(0,1.6fr)_120px_130px_200px] gap-4 border-b border-linha-suave px-[18px] py-3 text-[11px] uppercase tracking-[0.06em] text-tinta-suave">
          <span>Usuário</span><span>Último acesso</span><span>Situação</span><span className="sr-only">Ações</span>
        </div>
        {usuarios.map((u) => {
          const [rotulo, tom]: [string, Tom] = u.status === "ativo" && u.senhaProvisoria ? ["Senha provisória", "atencao"] : SITUACAO[u.status];
          return (
            <div key={u.id} className="grid min-w-[720px] grid-cols-[minmax(0,1.6fr)_120px_130px_200px] items-center gap-4 border-b border-linha-suave px-[18px] py-3 text-[13px] last:border-b-0">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-vinho-suave text-xs font-bold text-vinho">{iniciais(u.name)}</span>
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="text-sm font-medium">{u.name}</span>
                  <span className="truncate text-xs text-tinta-suave">{u.email}</span>
                </span>
              </span>
              <span className="text-tinta-suave">{u.last}</span>
              <Selo tom={tom} className="justify-self-start">{rotulo}</Selo>
              <span className="flex items-center justify-end gap-2">
                <Botao tamanho="sm" onClick={() => setEdicao({ id: u.id, name: u.name, email: u.email, emailAntes: u.email })}>Editar</Botao>
                {u.id === usuario.id ? (
                  <span className="w-[118px] text-center text-xs text-tinta-suave">Você</span>
                ) : u.status !== "inativo" ? (
                  <Botao tamanho="sm" onClick={() => setRedefinir({ id: u.id, nome: u.name, senha: gerarSenha() })}>Redefinir senha</Botao>
                ) : null}
              </span>
            </div>
          );
        })}
      </Cartao>
      <p className="text-xs text-tinta-suave">Todo acesso a dados de pessoas atendidas fica registrado.</p>

      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Cadastrar usuário"
        descricao="Defina como a pessoa vai entrar no painel pela primeira vez."
        rodape={
          <>
            <Botao tamanho="sm" onClick={() => setAberto(false)}>Cancelar</Botao>
            <Botao
              variante="primario"
              tamanho="sm"
              disabled={!valido || ocupado}
              onClick={salvar}
            >
              {f.forma === "senha" ? "Cadastrar" : "Enviar convite"}
            </Botao>
          </>
        }
      >
        <Campo rotulo="Nome completo" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Joana Martins" />
        <Campo rotulo="E-mail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nome@email.com" />
        <div role="radiogroup" aria-label="Primeiro acesso" className="flex flex-col gap-2">
          <OpcaoRadio marcado={f.forma === "senha"} onClick={() => setF({ ...f, forma: "senha" })}>
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Senha provisória</span>
              <span className="text-xs text-tinta-suave">Você passa a senha à pessoa; no primeiro acesso, o painel pede uma senha nova.</span>
            </span>
          </OpcaoRadio>
          <OpcaoRadio marcado={f.forma === "convite"} onClick={() => setF({ ...f, forma: "convite" })}>
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Convite por e-mail</span>
              <span className="text-xs text-tinta-suave">A pessoa recebe um link, válido por 7 dias, para criar a própria senha.</span>
            </span>
          </OpcaoRadio>
        </div>
        {f.forma === "senha" && <CampoSenhaProvisoria valor={f.senha} aoMudar={(senha) => setF({ ...f, senha })} />}
      </Modal>

      <Modal
        aberto={!!edicao}
        aoFechar={() => setEdicao(null)}
        titulo={edicao?.id === usuario.id ? "Editar meus dados" : "Editar usuário"}
        rodape={
          <>
            <Botao tamanho="sm" onClick={() => setEdicao(null)}>Cancelar</Botao>
            <Botao
              variante="primario"
              tamanho="sm"
              disabled={!edicaoValida || ocupado}
              onClick={async () => { if (edicao && (await editarUsuario(edicao.id, { name: edicao.name.trim(), email: edicao.email.trim() }))) setEdicao(null); }}
            >
              Salvar
            </Botao>
          </>
        }
      >
        {edicao && (
          <>
            <Campo rotulo="Nome completo" value={edicao.name} onChange={(e) => setEdicao({ ...edicao, name: e.target.value })} />
            <Campo rotulo="E-mail" type="email" value={edicao.email} onChange={(e) => setEdicao({ ...edicao, email: e.target.value })} />
            {edicao.email.trim().toLowerCase() !== edicao.emailAntes && (
              <p className="rounded-[10px] bg-caramelo-suave px-3.5 py-2.5 text-[13px] text-caramelo-tinta">
                O e-mail é o login: {edicao.id === usuario.id ? "você vai entrar" : "a pessoa vai entrar"} com o endereço novo a partir de agora.
              </p>
            )}
          </>
        )}
      </Modal>

      <Modal
        aberto={!!redefinir}
        aoFechar={() => setRedefinir(null)}
        titulo="Redefinir senha"
        descricao={redefinir ? `${redefinir.nome} sai de todos os aparelhos e, no próximo acesso, entra com esta senha provisória e cria uma nova.` : undefined}
        rodape={
          <>
            <Botao tamanho="sm" onClick={() => setRedefinir(null)}>Cancelar</Botao>
            <Botao
              variante="primario"
              tamanho="sm"
              disabled={!redefinir || redefinir.senha.length < SENHA_MINIMA || ocupado}
              onClick={async () => { if (redefinir && (await redefinirSenha(redefinir.id, redefinir.senha))) setRedefinir(null); }}
            >
              Redefinir senha
            </Botao>
          </>
        }
      >
        {redefinir && <CampoSenhaProvisoria valor={redefinir.senha} aoMudar={(senha) => setRedefinir({ ...redefinir, senha })} />}
      </Modal>
    </>
  );
}
