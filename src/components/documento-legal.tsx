import Link from "next/link";
import { MolduraPublica } from "./moldura-publica";

export interface SecaoLegal {
  id: string;
  titulo: string;
  conteudo: React.ReactNode;
}

/** Página pública de texto legal (privacidade, termos), com índice e seções numeradas. */
export function DocumentoLegal({
  titulo,
  resumo,
  atualizadoEm,
  secoes,
  outro,
}: {
  titulo: string;
  resumo: React.ReactNode;
  atualizadoEm: string;
  secoes: SecaoLegal[];
  outro: { href: string; rotulo: string };
}) {
  return (
    <MolduraPublica>
      <main className="flex w-full max-w-[720px] flex-col rounded-2xl border border-linha bg-superficie">
        <header className="flex flex-col gap-3 px-6 pb-7 pt-8 sm:px-9">
          <h1 className="font-serif text-[38px] font-semibold leading-tight text-ameixa">{titulo}</h1>
          <p className="text-xs uppercase tracking-[0.08em] text-tinta-suave">Atualizado em {atualizadoEm}</p>
          <div className="text-[15px] leading-relaxed text-tinta-suave text-pretty">{resumo}</div>
          <nav aria-label="Nesta página" className="mt-2 rounded-[10px] bg-fundo px-4 py-3.5">
            <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {secoes.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-2 text-tinta hover:text-vinho">
                    <span className="w-5 flex-none font-medium text-vinho">{i + 1}.</span>
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {secoes.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-6 border-t border-linha-suave px-6 py-7 sm:px-9">
            <h2 className="mb-3 flex items-baseline gap-3 font-serif text-2xl font-semibold text-ameixa">
              <span className="text-lg text-vinho">{String(i + 1).padStart(2, "0")}</span>
              {s.titulo}
            </h2>
            <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-tinta text-pretty [&_li]:pl-1 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5 [&_ul]:marker:text-caramelo">
              {s.conteudo}
            </div>
          </section>
        ))}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-linha-suave px-6 py-5 text-sm sm:px-9">
          <Link href={outro.href} className="font-medium text-vinho hover:text-vinho-escuro">{outro.rotulo} →</Link>
          <Link href="/solicitar" className="text-tinta-suave hover:text-vinho">Solicitar atendimento</Link>
        </footer>
      </main>
    </MolduraPublica>
  );
}

export function Email({ endereco }: { endereco: string }) {
  return (
    <a href={`mailto:${endereco}`} className="font-medium text-vinho underline underline-offset-2 hover:text-vinho-escuro">
      {endereco}
    </a>
  );
}
