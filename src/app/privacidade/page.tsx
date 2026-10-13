import type { Metadata } from "next";
import Link from "next/link";
import { DocumentoLegal, Email, type SecaoLegal } from "@/components/documento-legal";
import { EMAIL_PROJETO } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como o Projeto Florescer coleta, usa, guarda e protege os seus dados pessoais.",
};

const ATUALIZADO_EM = "13 de outubro de 2026";

const SECOES: SecaoLegal[] = [
  {
    id: "quem-somos",
    titulo: "Quem somos",
    conteudo: (
      <>
        <p>
          O Projeto Florescer é um grupo de psicoterapeutas junguianos que oferece atendimento psicoterapêutico on-line a valor social. Somos os
          responsáveis (controladores, nos termos da Lei Geral de Proteção de Dados — Lei nº 13.709/2018) pelos dados tratados neste site.
        </p>
        <p>
          Para qualquer assunto sobre os seus dados, inclusive para exercer os direitos descritos abaixo, fale com a gente em{" "}
          <Email endereco={EMAIL_PROJETO} />.
        </p>
      </>
    ),
  },
  {
    id: "dados",
    titulo: "Quais dados coletamos",
    conteudo: (
      <>
        <p>
          <b>Quando você pede atendimento</b>, pelo formulário de solicitação: nome, data de nascimento, gênero, estado civil, escolaridade,
          trabalho, endereço com cidade e estado, WhatsApp, e-mail, RG e um contato de emergência. Também perguntamos sobre o motivo da busca,
          psicoterapia anterior, uso de medicamentos, diagnósticos, disponibilidade de horários e preferência de terapeuta.
        </p>
        <p>
          Parte dessas informações é sobre a sua saúde — um <b>dado pessoal sensível</b>, que a lei protege de forma especial e que tratamos com
          cuidado redobrado.
        </p>
        <p>
          <b>Quando você aceita o termo de compromisso</b>: o nome informado no aceite (e o do responsável legal, quando houver) e a data e a hora
          do aceite.
        </p>
        <p>
          <b>Quando você informa um contato de emergência</b>, os dados dessa pessoa ficam na sua ficha. Avise-a antes de nos passar o contato.
        </p>
        <p>
          <b>Da equipe e dos terapeutas</b>: nome, e-mail, senha (guardada apenas de forma cifrada, sem possibilidade de leitura) e o registro dos
          acessos ao painel. Dos terapeutas, também guardamos gênero, público atendido, disponibilidade e número de vagas.
        </p>
      </>
    ),
  },
  {
    id: "finalidade",
    titulo: "Para que usamos",
    conteudo: (
      <ul>
        <li>Entrar em contato com você sobre a sua solicitação.</li>
        <li>Fazer o acolhimento e escolher o(a) terapeuta mais compatível com o seu perfil, seus horários e sua preferência.</li>
        <li>Enviar a sua ficha ao(à) terapeuta responsável e acompanhar o andamento do atendimento.</li>
        <li>Enviar mensagens sobre o atendimento, como boas-vindas, o termo de compromisso e lembretes.</li>
        <li>Agir com prioridade quando o formulário indicar algum risco à sua vida ou à de outra pessoa.</li>
        <li>Proteger o site contra uso indevido e manter o registro de quem acessou e alterou cada informação.</li>
      </ul>
    ),
  },
  {
    id: "base-legal",
    titulo: "Base legal",
    conteudo: (
      <>
        <p>
          Tratamos os seus dados com base no <b>consentimento</b> que você dá ao enviar o formulário (art. 7º, I, e art. 11, I, da LGPD). Para os
          dados de saúde, o consentimento é específico e destacado, para as finalidades descritas aqui.
        </p>
        <p>
          Em situações de risco, podemos usar os dados para a <b>proteção da sua vida ou da integridade física</b> sua ou de terceiros (art. 11,
          II, e), por exemplo, acionando o seu contato de emergência.
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    titulo: "Com quem compartilhamos",
    conteudo: (
      <>
        <ul>
          <li>
            <b>Com o(a) terapeuta responsável pelo seu atendimento</b>, que recebe a sua ficha. RG e endereço não vão na ficha: ficam apenas com a
            equipe do projeto.
          </li>
          <li>
            <b>Com a equipe do Projeto Florescer</b>, que acessa o painel com login pessoal. Cada acesso a uma ficha fica registrado.
          </li>
          <li>
            <b>Com fornecedores de tecnologia</b> que hospedam o site e o banco de dados, que tratam os dados apenas em nosso nome e seguindo as
            nossas instruções.
          </li>
          <li>
            <b>Com autoridades</b>, somente quando a lei exigir.
          </li>
        </ul>
        <p>Não vendemos, alugamos nem usamos os seus dados para publicidade.</p>
      </>
    ),
  },
  {
    id: "seguranca",
    titulo: "Onde guardamos e como protegemos",
    conteudo: (
      <>
        <p>
          Os dados ficam em um banco de dados na nuvem, em servidores localizados no Brasil (São Paulo). O tráfego entre o seu navegador e o site é
          criptografado.
        </p>
        <p>
          O painel é restrito à equipe, com senha individual. As senhas são guardadas de forma cifrada, os acessos às fichas ficam registrados e o
          sigilo das informações é um compromisso de toda a equipe e dos terapeutas.
        </p>
        <p>
          Nenhum sistema é totalmente imune a falhas. Se ocorrer um incidente de segurança que possa trazer risco a você, avisaremos você e a
          Autoridade Nacional de Proteção de Dados (ANPD), como determina a lei.
        </p>
      </>
    ),
  },
  {
    id: "prazo",
    titulo: "Por quanto tempo",
    conteudo: (
      <p>
        Guardamos os seus dados enquanto forem necessários para o encaminhamento e o acompanhamento, e depois pelo prazo exigido por obrigações
        legais e éticas da prática clínica. Passado esse período, ou se você pedir a eliminação e não houver obrigação de guardá-los, os dados são
        apagados ou anonimizados.
      </p>
    ),
  },
  {
    id: "direitos",
    titulo: "Seus direitos",
    conteudo: (
      <>
        <p>A qualquer momento, você pode pedir:</p>
        <ul>
          <li>confirmação de que tratamos os seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
          <li>portabilidade dos dados;</li>
          <li>informação sobre com quem compartilhamos os seus dados;</li>
          <li>revogação do consentimento e eliminação dos dados tratados com base nele.</li>
        </ul>
        <p>
          Para isso, escreva para <Email endereco={EMAIL_PROJETO} /> com o seu nome completo e telefone, para que possamos confirmar que o pedido
          é seu. Respondemos em até 15 dias. Se não ficar satisfeito(a), você também pode reclamar à ANPD.
        </p>
        <p>
          Revogar o consentimento interrompe o encaminhamento: sem os dados, não conseguimos seguir com a sua solicitação.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    titulo: "Cookies",
    conteudo: (
      <p>
        As páginas públicas (formulário, termo e estas políticas) não usam cookies de rastreamento nem de publicidade. O painel da equipe usa
        apenas um cookie de sessão, necessário para manter o login. Para limitar envios automáticos do formulário, o endereço IP de quem envia é
        usado por alguns minutos e não fica guardado.
      </p>
    ),
  },
  {
    id: "publico",
    titulo: "Maiores de 18 anos",
    conteudo: (
      <p>
        O formulário de solicitação é destinado a pessoas com 18 anos ou mais. Não atendemos crianças, adolescentes, famílias e casais.
      </p>
    ),
  },
  {
    id: "alteracoes",
    titulo: "Mudanças nesta política",
    conteudo: (
      <p>
        Podemos atualizar esta política. A data no topo da página indica a última versão. Se a mudança afetar a forma como usamos os seus dados,
        avisaremos pelo e-mail informado na solicitação. Veja também os nossos{" "}
        <Link href="/termos" className="font-medium text-vinho underline underline-offset-2">termos de uso</Link>.
      </p>
    ),
  },
];

export default function Privacidade() {
  return (
    <DocumentoLegal
      titulo="Política de privacidade"
      atualizadoEm={ATUALIZADO_EM}
      resumo={
        <p>
          Cuidar da saúde mental começa pela confiança. Aqui explicamos, de forma direta, quais dados pedimos, para que servem, com quem são
          compartilhados e como você controla o que é seu.
        </p>
      }
      secoes={SECOES}
      outro={{ href: "/termos", rotulo: "Termos de uso" }}
    />
  );
}
