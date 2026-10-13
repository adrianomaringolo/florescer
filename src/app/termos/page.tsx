import type { Metadata } from "next";
import Link from "next/link";
import { DocumentoLegal, Email, type SecaoLegal } from "@/components/documento-legal";
import { EMAIL_PROJETO, VALOR_SESSAO } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Regras de uso do site e do atendimento do Projeto Florescer.",
};

const ATUALIZADO_EM = "13 de outubro de 2026";

const SECOES: SecaoLegal[] = [
  {
    id: "sobre",
    titulo: "Sobre estes termos",
    conteudo: (
      <>
        <p>
          Estes termos valem para o site do Projeto Florescer: o formulário de solicitação de atendimento, o termo de compromisso on-line e o
          painel usado pela equipe. Ao usar o site, você concorda com eles e com a nossa{" "}
          <Link href="/privacidade" className="font-medium text-vinho underline underline-offset-2">política de privacidade</Link>.
        </p>
      </>
    ),
  },
  {
    id: "servico",
    titulo: "O que oferecemos",
    conteudo: (
      <>
        <p>
          O Projeto Florescer encaminha pessoas para psicoterapia junguiana <b>on-line</b>, com <b>valor social de {VALOR_SESSAO} por sessão</b>.
          O atendimento é para adultos; não atendemos crianças, adolescentes, famílias e casais.
        </p>
        <p>
          Enviar o formulário é um pedido de atendimento, não a garantia de uma vaga. Depois do envio, entramos em contato em até 5 dias. O
          encaminhamento depende da disponibilidade de terapeutas compatíveis com o seu perfil e os seus horários.
        </p>
      </>
    ),
  },
  {
    id: "emergencia",
    titulo: "Não é um serviço de emergência",
    conteudo: (
      <p>
        O formulário não é lido em tempo real. Se você está em crise ou pensando em tirar a própria vida, ligue agora para o <b>CVV (188)</b>, que
        atende 24 horas e de graça, para o <b>SAMU (192)</b>, ou procure o pronto-socorro mais próximo.
      </p>
    ),
  },
  {
    id: "compromissos",
    titulo: "Seus compromissos",
    conteudo: (
      <ul>
        <li>Informar dados verdadeiros e atualizados, e avisar a gente se algo mudar.</li>
        <li>Preencher o formulário em seu próprio nome e só informar o contato de emergência de alguém que concordou com isso.</li>
        <li>Não usar o site para enviar conteúdo falso, ofensivo ou automatizado.</li>
      </ul>
    ),
  },
  {
    id: "acompanhamento",
    titulo: "O acompanhamento",
    conteudo: (
      <p>
        Quando o encaminhamento acontece, o acompanhamento segue o termo de compromisso enviado a você, que trata de sigilo, duração das sessões,
        faltas e encerramento. O termo é aceito on-line, por um link individual, e você recebe uma cópia por e-mail.
      </p>
    ),
  },
  {
    id: "equipe",
    titulo: "Acesso da equipe",
    conteudo: (
      <ul>
        <li>O painel é restrito a pessoas da equipe, que entram por convite e com senha individual.</li>
        <li>O acesso é pessoal: não compartilhe a sua senha. Se suspeitar de uso indevido, avise a equipe imediatamente.</li>
        <li>As informações de pacientes são sigilosas e só podem ser usadas para o encaminhamento e o acompanhamento.</li>
        <li>Cada acesso e cada alteração ficam registrados.</li>
      </ul>
    ),
  },
  {
    id: "marca",
    titulo: "Marca e conteúdo",
    conteudo: (
      <p>
        O nome Florescer, o logotipo, os padrões gráficos e os textos deste site pertencem ao Projeto Florescer. Não use sem autorização.
      </p>
    ),
  },
  {
    id: "disponibilidade",
    titulo: "Disponibilidade do site",
    conteudo: (
      <p>
        Trabalhamos para manter o site no ar e seguro, mas ele pode ficar indisponível por manutenção ou falhas técnicas. Se não conseguir enviar o
        formulário, escreva para <Email endereco={EMAIL_PROJETO} />.
      </p>
    ),
  },
  {
    id: "alteracoes",
    titulo: "Mudanças e contato",
    conteudo: (
      <p>
        Podemos atualizar estes termos; a data no topo indica a última versão. Eles seguem as leis brasileiras. Dúvidas:{" "}
        <Email endereco={EMAIL_PROJETO} />.
      </p>
    ),
  },
];

export default function Termos() {
  return (
    <DocumentoLegal
      titulo="Termos de uso"
      atualizadoEm={ATUALIZADO_EM}
      resumo={<p>As regras para usar o site e o que você pode esperar do Projeto Florescer.</p>}
      secoes={SECOES}
      outro={{ href: "/privacidade", rotulo: "Política de privacidade" }}
    />
  );
}
