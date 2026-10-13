"use client";

import { useState } from "react";
import { Botao, Campo, Cartao, Modal, Selo, TituloPagina, type Tom } from "@/components/ui";
import type { UsuarioStatus } from "@/lib/dados";
import { emailValido } from "@/lib/regras";
import { usePainel } from "@/lib/store";

const SITUACAO: Record<UsuarioStatus, [string, Tom]> = {
  ativo: ["Ativo", "ok"],
  convite: ["Convite enviado", "atencao"],
  inativo: ["Desativado", "neutro"],
};

const iniciais = (nome: string) => nome.split(" ").map((w) => w[0]).slice(0, 2).join("");

export default function Usuarios() {
  const { usuarios, convidarUsuario, ocupado } = usePainel();
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState({ name: "", email: "" });
  const valido = f.name.trim() && emailValido(f.email);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <TituloPagina>Usuários</TituloPagina>
          <span className="text-[13px] text-tinta-suave">Pessoas cadastradas têm acesso completo ao painel.</span>
        </div>
        <Botao variante="primario" onClick={() => { setF({ name: "", email: "" }); setAberto(true); }}>Cadastrar usuário</Botao>
      </header>

      <Cartao className="overflow-x-auto">
        <div className="grid min-w-[520px] grid-cols-[minmax(0,1.6fr)_140px_130px] gap-4 border-b border-linha-suave px-[18px] py-3 text-[11px] uppercase tracking-[0.06em] text-tinta-suave">
          <span>Usuário</span><span>Último acesso</span><span>Situação</span>
        </div>
        {usuarios.map((u) => {
          const [rotulo, tom] = SITUACAO[u.status];
          return (
            <div key={u.id} className="grid min-w-[520px] grid-cols-[minmax(0,1.6fr)_140px_130px] items-center gap-4 border-b border-linha-suave px-[18px] py-3 text-[13px] last:border-b-0">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-vinho-suave text-xs font-bold text-vinho">{iniciais(u.name)}</span>
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="text-sm font-medium">{u.name}</span>
                  <span className="truncate text-xs text-tinta-suave">{u.email}</span>
                </span>
              </span>
              <span className="text-tinta-suave">{u.last}</span>
              <Selo tom={tom} className="justify-self-start">{rotulo}</Selo>
            </div>
          );
        })}
      </Cartao>
      <p className="text-xs text-tinta-suave">Todo acesso a dados de pessoas atendidas fica registrado.</p>

      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Cadastrar usuário"
        descricao="A pessoa recebe um convite por e-mail para criar a senha."
        rodape={
          <>
            <Botao tamanho="sm" onClick={() => setAberto(false)}>Cancelar</Botao>
            <Botao
              variante="primario"
              tamanho="sm"
              disabled={!valido || ocupado}
              onClick={async () => { if (await convidarUsuario({ name: f.name.trim(), email: f.email.trim() })) setAberto(false); }}
            >
              Enviar convite
            </Botao>
          </>
        }
      >
        <Campo rotulo="Nome completo" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Joana Martins" />
        <Campo rotulo="E-mail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nome@email.com" />
      </Modal>
    </>
  );
}
