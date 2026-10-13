// Tipos compartilhados entre servidor e interface, e textos padrão (seção 4 das regras).

export type StatusKey = "acolhimento" | "escolha" | "atendimento" | "desligado" | "pendente";

export interface Retorno {
  de: string;
  motivo: string;
  obs: string;
  data: string;
}

export interface AceiteTermo {
  nome: string;
  menor?: string;
  quando: string;
}

/** Respostas do formulário público de solicitação (/solicitar). */
export interface FichaFormulario {
  genero: string;
  /** AAAA-MM-DD */
  nascimento: string;
  estadoCivil: string;
  escolaridade: string;
  trabalho: string;
  endereco: string;
  contatoEmergencia: string;
  rg: string;
  psicoterapiaAnterior: string;
  medicamentos: string;
  diagnostico: string;
  preferenciaTerapeuta: string;
  comentarios: string;
}

const dataBr = (iso: string) => iso.split("-").reverse().join("/");

/**
 * Respostas do formulário público na ordem de exibição. `paraTerapeuta: false`
 * marca o que fica só com a equipe (documento e endereço) e não vai na ficha enviada.
 */
export function camposFicha(f: FichaFormulario): { rotulo: string; valor: string; paraTerapeuta: boolean }[] {
  const c = (rotulo: string, valor: string, paraTerapeuta = true) => ({ rotulo, valor, paraTerapeuta });
  return [
    c("Gênero", f.genero),
    c("Nascimento", dataBr(f.nascimento)),
    c("Estado civil", f.estadoCivil),
    c("Escolaridade", f.escolaridade),
    c("Trabalho", f.trabalho),
    c("Endereço", f.endereco, false),
    c("RG", f.rg, false),
    c("Contato de emergência", f.contatoEmergencia),
    c("Psicoterapia anterior", f.psicoterapiaAnterior),
    c("Medicamentos", f.medicamentos),
    c("Diagnóstico", f.diagnostico),
    c("Preferência de terapeuta", f.preferenciaTerapeuta),
    c("Comentários", f.comentarios),
  ];
}

export const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;
export const PERIODOS_DIA = ["Manhã", "Tarde", "Noite"] as const;
export const VALOR_SESSAO = "R$ 80,00";
export const EMAIL_PROJETO = "projetoflorescer.jung@gmail.com";
export const INSTAGRAM_PROJETO = "@projetoflorescer.jung";

/** Gênero no cadastro de terapeutas — os mesmos termos da preferência no formulário. */
export const GENEROS_TERAPEUTA = ["Mulher", "Homem", "Outro"] as const;
export type GeneroTerapeuta = (typeof GENEROS_TERAPEUTA)[number];

export interface Caso {
  id: string;
  name: string;
  age: number | null;
  email: string;
  phone: string;
  motivo: string;
  disp: string;
  publico: "Adulto" | "Adolescente" | "Criança";
  status: StatusKey;
  /** Dias corridos no status atual. */
  days: number;
  ter: string;
  recv: string;
  risk?: boolean;
  termoOk?: boolean;
  repasseOk?: boolean;
  /** Terapeuta confirmou a data do 1º atendimento. */
  primeiroOk?: boolean;
  encaminhadoEm?: string;
  motivoDeslig?: string;
  retornos?: Retorno[];
  aceite?: AceiteTermo;
  /** Token do link individual do termo (4.3). */
  termoToken: string;
  boasVindasEm?: string;
  /** Presente nos casos que vieram do formulário público. */
  ficha?: FichaFormulario;
  consentimentoEm?: string;
}

export type Publico = "Crianças" | "Adolescentes" | "Adultos";

export interface Terapeuta {
  id: string;
  name: string;
  email: string;
  /** Vazio em cadastros antigos, feitos antes do campo existir. */
  genero: GeneroTerapeuta | "";
  publico: Publico[];
  disp: string;
  cap: number;
  active: boolean;
}

export type UsuarioStatus = "ativo" | "convite" | "inativo";

export interface Usuario {
  id: string;
  name: string;
  email: string;
  last: string;
  status: UsuarioStatus;
  /** Ainda não trocou a senha provisória definida por outra pessoa. */
  senhaProvisoria: boolean;
}

export const MOTIVOS_RETORNO = [
  "Terapeuta sem disponibilidade",
  "Incompatibilidade entre paciente e terapeuta",
  "Paciente pediu troca de terapeuta",
  "Terapeuta deixou o projeto",
  "Outro",
];

export const MOTIVOS_DESLIGAMENTO = ["Alta", "Desistência", "Três faltas seguidas sem aviso", "Encaminhado a outro serviço", "Outro"];

export const ORIENTACOES_TERAPEUTA = [
  "Entre em contato com a pessoa em até 5 dias úteis e combine o primeiro atendimento.",
  "Confirme a data do 1º atendimento respondendo a este e-mail.",
  "Mantenha sigilo sobre todas as informações da ficha e das sessões.",
  "Avise a equipe sobre faltas recorrentes (3 seguidas sem aviso) ou sinais de risco.",
  "Comunique qualquer encerramento — alta, desistência ou outro encaminhamento — para atualizarmos o registro.",
];

export const CLAUSULAS_TERMO: [string, string][] = [
  ["Sobre o acompanhamento", `Os atendimentos são on-line e têm valor social de ${VALOR_SESSAO} por sessão. Cada sessão dura cerca de 50 minutos, com frequência combinada entre você e seu(sua) terapeuta.`],
  ["Sigilo", "Tudo o que for conversado nas sessões é confidencial. O sigilo só pode ser quebrado em situações de risco à vida, conforme o código de ética profissional."],
  ["Seus dados", "As informações do formulário são usadas apenas para organizar seu encaminhamento e ficam acessíveis somente à equipe do projeto e ao(à) terapeuta responsável."],
  ["Presença e faltas", "Se não puder comparecer, avise com pelo menos 24 horas de antecedência. Três faltas seguidas sem aviso podem levar ao encerramento do acompanhamento, para que a vaga seja oferecida a outra pessoa."],
  ["Encerramento", "Você pode encerrar o acompanhamento quando quiser, avisando o(a) terapeuta ou a equipe. O encerramento também pode acontecer por alta ou por indicação de outro tipo de cuidado."],
  ["Compromisso do projeto", "Nos comprometemos a oferecer um espaço respeitoso, sem julgamentos, e a acompanhar seu caso até o encerramento."],
];

export const LINK_TERMO = "[Assinar termo de compromisso]";

export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? "";

export const emailBoasVindas = (c: Caso) => ({
  to: c.email,
  subject: "Bem-vindo(a) ao Projeto Florescer",
  body: `Olá, ${primeiroNome(c.name)}.

Que bom ter você com a gente. Recebemos seu pedido de acompanhamento e queremos que você se sinta acolhido(a) desde já.

Antes de seguirmos para a escolha do(a) terapeuta, pedimos que leia e aceite o nosso termo de compromisso. Ele explica como funcionam os atendimentos, o sigilo e o que esperamos de cada parte. Leva poucos minutos:

${LINK_TERMO}

Em breve entraremos em contato para uma conversa inicial. Se tiver qualquer dúvida, é só responder a este e-mail.

Com carinho,
Equipe Projeto Florescer`,
});
