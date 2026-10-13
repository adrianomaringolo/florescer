import type { Metadata } from "next";
import { FormularioSolicitacao } from "@/components/formulario-solicitacao";
import { MolduraPublica } from "@/components/moldura-publica";

export const metadata: Metadata = {
  title: "Solicitação de atendimento",
  description: "Solicite atendimento no Projeto Florescer: psicoterapia junguiana on-line com valor social.",
};

export default function Page() {
  return (
    <MolduraPublica>
      <FormularioSolicitacao />
    </MolduraPublica>
  );
}
