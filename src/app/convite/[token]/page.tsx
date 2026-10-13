import type { Metadata } from "next";
import { ConteudoConvite } from "@/components/conteudo-convite";

export const metadata: Metadata = { title: "Criar senha", robots: { index: false } };

export default async function Convite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ConteudoConvite token={token} />;
}
