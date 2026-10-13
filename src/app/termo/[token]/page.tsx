import type { Metadata } from "next";
import { ConteudoTermo } from "@/components/conteudo-termo";

export const metadata: Metadata = { title: "Termo de compromisso", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ConteudoTermo token={token} />;
}
