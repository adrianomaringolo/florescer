import type { Metadata } from "next";
import Link from "next/link";
import { BotaoSair, FormularioTrocarSenha } from "@/components/formularios-acesso";
import { Logo } from "@/components/marca";
import { exigirUsuario } from "@/server/auth";

export const metadata: Metadata = { title: "Trocar senha", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function TrocarSenha() {
  const u = await exigirUsuario();
  const provisoria = u.trocarSenha;

  return (
    // Mesmo fundo do login: padrão Jardim sob véu vinho-escuro.
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-8 bg-vinho bg-[url(/brand/padrao-jardim.svg)] bg-cover bg-center px-4 py-10">
      <div aria-hidden className="absolute inset-0 -z-10 bg-vinho-escuro/75" />
      <Logo className="h-14 w-auto text-areia drop-shadow-[0_2px_12px_rgb(0_0_0/0.25)]" />

      <main className="flex w-full max-w-[420px] flex-col gap-6 rounded-2xl bg-superficie px-7 py-8 shadow-modal sm:px-9 sm:py-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-[34px] font-semibold leading-tight text-ameixa">
            {provisoria ? `Olá, ${u.nome.split(" ")[0]}` : "Trocar senha"}
          </h1>
          <p className="text-sm text-tinta-suave text-pretty">
            {provisoria
              ? "Você entrou com uma senha provisória. Para continuar, crie uma senha só sua."
              : `Conta ${u.email}. Depois da troca, os outros aparelhos conectados saem do painel.`}
          </p>
        </div>
        <FormularioTrocarSenha pedirAtual={!provisoria} />
        <div className="flex items-center justify-between border-t border-linha-suave pt-5 text-xs text-tinta-suave">
          {provisoria ? (
            <span className="truncate">{u.email}</span>
          ) : (
            <Link href="/" className="font-medium text-vinho underline-offset-2 hover:underline">← Voltar ao painel</Link>
          )}
          <BotaoSair className="font-medium text-vinho underline-offset-2 hover:underline">Sair</BotaoSair>
        </div>
      </main>
    </div>
  );
}
