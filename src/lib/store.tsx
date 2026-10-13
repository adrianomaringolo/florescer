"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { acao, api, ErroApi, type Resultado } from "./api";
import type { Caso, Publico, Terapeuta, Usuario } from "./dados";

// Ponte entre a interface e os endpoints /api: os dados vêm de GET /api/painel
// e cada ação devolve uma mensagem para o aviso.

export type Marcacao = "termoOk" | "repasseOk" | "primeiroOk";

interface Aviso {
  id: number;
  texto: string;
  erro?: boolean;
  link?: string;
}

export interface DadosPainel {
  casos: Caso[];
  terapeutas: Terapeuta[];
  usuarios: Usuario[];
}

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
}

interface Painel extends DadosPainel {
  usuario: UsuarioSessao;
  ocupado: boolean;
  avisos: Aviso[];
  avisar: (texto: string) => void;
  dispensarAviso: (id: number) => void;
  enviarBoasVindas: (id: string, assunto: string, corpo: string) => Promise<boolean>;
  concluirAcolhimento: (id: string) => Promise<boolean>;
  sairDePendente: (id: string) => Promise<boolean>;
  encaminhar: (casoId: string, terapeutaId: string) => Promise<boolean>;
  marcar: (casoId: string, campo: Marcacao, valor: boolean) => Promise<boolean>;
  retornarParaEscolha: (casoId: string, motivo: string, obs: string) => Promise<boolean>;
  desligar: (casoId: string, motivo: string) => Promise<boolean>;
  enviarLembrete: (casoId: string) => Promise<boolean>;
  reenviarFicha: (casoId: string) => Promise<boolean>;
  cadastrarTerapeuta: (t: { name: string; email: string; genero: string; publico: Publico[]; disp: string; cap: number }) => Promise<boolean>;
  editarTerapeuta: (id: string, t: { name: string; email: string; genero: string; publico: Publico[]; disp: string; cap: number; active: boolean }) => Promise<boolean>;
  convidarUsuario: (u: { name: string; email: string }) => Promise<boolean>;
  /** Cadastro manual de caso; devolve o id do caso criado. */
  cadastrarCaso: (c: Record<string, unknown>) => Promise<string | null>;
}

const Ctx = createContext<Painel | null>(null);

export function PainelProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<{ dados: DadosPainel; usuario: UsuarioSessao } | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [ocupado, iniciar] = useTransition();
  const seq = useRef(0);

  const dispensarAviso = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), []);
  const mostrar = useCallback(
    (aviso: Omit<Aviso, "id">) => {
      const id = ++seq.current;
      setAvisos((a) => [...a, { ...aviso, id }]);
      // Avisos com link (convite) ficam até serem fechados.
      if (!aviso.link) setTimeout(() => dispensarAviso(id), aviso.erro ? 8000 : 5000);
    },
    [dispensarAviso],
  );

  const recarregar = useCallback(async () => {
    try {
      setEstado(await api<{ dados: DadosPainel; usuario: UsuarioSessao }>("/api/painel"));
      setFalhou(false);
    } catch (e) {
      if (e instanceof ErroApi && e.status === 401) router.replace("/login");
      else setFalhou(true);
    }
  }, [router]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  /** Roda uma ação, mostra o aviso e recarrega os dados; devolve o Resultado (null se a chamada falhou). */
  const rodar = useCallback(
    (acao: () => Promise<Resultado>) =>
      new Promise<Resultado | null>((resolve) => {
        iniciar(async () => {
          try {
            const r = await acao();
            if (r.ok) {
              if (r.mensagem) mostrar({ texto: r.mensagem, link: r.link });
              await recarregar();
            } else {
              mostrar({ texto: r.erro, erro: true });
            }
            resolve(r);
          } catch {
            mostrar({ texto: "Não foi possível concluir. Tente de novo.", erro: true });
            resolve(null);
          }
        });
      }),
    [mostrar, recarregar],
  );
  const executar = useCallback((acao: () => Promise<Resultado>) => rodar(acao).then((r) => !!r?.ok), [rodar]);

  const value = useMemo<Painel | null>(
    () =>
      estado && {
      ...estado.dados,
      usuario: estado.usuario,
      ocupado,
      avisos,
      avisar: (texto) => mostrar({ texto }),
      dispensarAviso,
      enviarBoasVindas: (id, assunto, corpo) => executar(() => acao(`/api/casos/${id}/boas-vindas`, { assunto, corpo })),
      concluirAcolhimento: (id) => executar(() => acao(`/api/casos/${id}/concluir-acolhimento`)),
      sairDePendente: (id) => executar(() => acao(`/api/casos/${id}/sair-de-pendente`)),
      encaminhar: (casoId, terapeutaId) => executar(() => acao(`/api/casos/${casoId}/encaminhar`, { terapeutaId })),
      marcar: (casoId, campo, valor) => executar(() => acao(`/api/casos/${casoId}/marcacao`, { campo, valor })),
      retornarParaEscolha: (casoId, motivo, obs) => executar(() => acao(`/api/casos/${casoId}/retorno`, { motivo, observacao: obs })),
      desligar: (casoId, motivo) => executar(() => acao(`/api/casos/${casoId}/desligamento`, { motivo })),
      enviarLembrete: (casoId) => executar(() => acao(`/api/casos/${casoId}/lembrete`)),
      reenviarFicha: (casoId) => executar(() => acao(`/api/casos/${casoId}/reenviar-ficha`)),
      cadastrarTerapeuta: (t) => executar(() => acao("/api/terapeutas", t)),
      editarTerapeuta: (id, t) => executar(() => acao(`/api/terapeutas/${id}`, t)),
      cadastrarCaso: async (c) => {
        const r = await rodar(() => acao("/api/casos", c));
        return r?.ok ? (r.id ?? null) : null;
      },
      convidarUsuario: (u) => executar(() => acao("/api/usuarios", u)),
    },
    [estado, ocupado, avisos, mostrar, dispensarAviso, executar, rodar],
  );

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-sm text-tinta-suave" role="status">
        {falhou ? (
          <span>
            Não foi possível carregar o painel.{" "}
            <button type="button" onClick={() => void recarregar()} className="text-vinho underline">Tentar de novo</button>
          </span>
        ) : (
          "Carregando…"
        )}
      </div>
    );
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePainel() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePainel precisa estar dentro de <PainelProvider>");
  return ctx;
}
