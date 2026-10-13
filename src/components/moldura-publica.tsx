import { Logo } from "./marca";

/** Fundo creme com logo vinho — usado nas páginas fora do painel. */
export function MolduraPublica({ children, largura = 720 }: { children: React.ReactNode; largura?: number }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-creme px-4 pb-14 pt-10">
      <header className="w-full text-vinho" style={{ maxWidth: largura }}>
        <Logo className="h-14 w-auto" />
      </header>
      {children}
      <footer className="text-xs text-tinta-suave">Projeto Florescer · projetoflorescer.jung@gmail.com</footer>
    </div>
  );
}

export const campoPublico =
  "w-full rounded-lg border border-linha-forte bg-superficie px-3.5 py-3 text-[15px] text-tinta placeholder:text-tinta-apagada focus:border-vinho focus:outline-none focus:ring-2 focus:ring-vinho/20";

export const botaoPublico =
  "rounded-lg bg-vinho px-6 py-3.5 text-[15px] font-semibold text-creme hover:bg-vinho-escuro disabled:cursor-not-allowed disabled:bg-desativado disabled:text-superficie";
