// Dados de exemplo herdados do protótipo (docs/referencias/prototipo), usados pelo seed.

import type { Caso, Terapeuta } from "@/lib/dados";

type CasoExemplo = Omit<Caso, "termoToken"> & { termoToken?: string };

export const TERAPEUTAS: Terapeuta[] = [
  { id: "ana", name: "Ana Ribeiro", email: "ana.ribeiro@email.com", genero: "Mulher", publico: ["Adultos"], disp: "Seg e Qua, noite", cap: 5, active: true },
  { id: "carlos", name: "Carlos Mendes", email: "carlos.mendes@email.com", genero: "Homem", publico: ["Adolescentes", "Adultos"], disp: "Ter e Qui, manhã", cap: 4, active: true },
  { id: "juliana", name: "Juliana Prado", email: "juliana.prado@email.com", genero: "Mulher", publico: ["Crianças", "Adolescentes"], disp: "Sáb, manhã", cap: 3, active: true },
  { id: "rafael", name: "Rafael Torres", email: "rafael.torres@email.com", genero: "Homem", publico: ["Adultos"], disp: "Seg a Sex, tarde", cap: 4, active: true },
  { id: "beatriz", name: "Beatriz Nogueira", email: "beatriz.nogueira@email.com", genero: "Mulher", publico: ["Adultos"], disp: "Qua e Sex, noite", cap: 3, active: false },
];

const emAtendimento = (id: string, name: string, age: number, ter: string, days: number, publico: Caso["publico"] = "Adulto"): CasoExemplo => ({
  id, name, age, email: `${id}@email.com`, phone: "(11) 90000-0000", motivo: "—", disp: "—", publico,
  status: "atendimento", days, ter, recv: "—", termoOk: true, repasseOk: true, primeiroOk: true,
});

export const CASOS: CasoExemplo[] = [
  { id: "c12", name: "Gabriel Nunes", age: 27, email: "gabriel.nunes@email.com", phone: "(11) 99412-3380", motivo: "Crises de pânico no transporte", disp: "Ter e Qui à noite", publico: "Adulto", status: "acolhimento", days: 1, ter: "", recv: "06/10 · 20:15" },
  { id: "c13", name: "Renata Oliveira", age: 48, email: "renata.o@email.com", phone: "(21) 98733-1029", motivo: "Cuidadora da mãe; exaustão", disp: "Manhãs", publico: "Adulto", status: "acolhimento", days: 0, ter: "", recv: "07/10 · 08:05" },
  { id: "c11", name: "Sofia Martins", age: 19, email: "sofia.m@email.com", phone: "(11) 98812-4410", motivo: "Tristeza constante; menciona pensamentos de se machucar", disp: "Qualquer dia, tarde", publico: "Adulto", status: "pendente", days: 0, ter: "", risk: true, recv: "07/10 · 07:58" },
  { id: "c3", name: "Luiza Fernandes", age: 28, email: "luiza.fernandes@email.com", phone: "(11) 99231-0087", motivo: "Luto recente e dificuldade para dormir", disp: "Seg e Qua à noite; Sex à tarde", publico: "Adulto", status: "escolha", days: 2, ter: "", recv: "05/10 · 14:20" },
  { id: "c1", name: "Mariana Alves", age: 34, email: "mari.alves@email.com", phone: "(21) 98100-2231", motivo: "Ansiedade relacionada ao trabalho", disp: "Seg e Qua à noite", publico: "Adulto", status: "escolha", days: 1, ter: "", recv: "06/10 · 09:12" },
  { id: "c2", name: "Pedro Lima", age: 16, email: "responsavel.lima@email.com", phone: "(11) 97654-0012", motivo: "Dificuldades na escola e isolamento", disp: "Sáb de manhã", publico: "Adolescente", status: "escolha", days: 1, ter: "", recv: "06/10 · 18:40" },
  { id: "c10", name: "J. S.", age: null, email: "js@@email", phone: "", motivo: "Conflitos familiares", disp: "", publico: "Adulto", status: "pendente", days: 3, ter: "", recv: "04/10 · 11:05" },
  { id: "c4", name: "Roberto Silva", age: 52, email: "roberto.s@email.com", phone: "(11) 99001-7788", motivo: "Estresse após perda de emprego", disp: "Ter e Qui de manhã", publico: "Adulto", status: "atendimento", days: 9, ter: "Carlos Mendes", termoOk: false, repasseOk: false, primeiroOk: true, encaminhadoEm: "28/09", recv: "24/09 · 10:00" },
  { id: "c5", name: "Camila Rocha", age: 41, email: "camila.rocha@email.com", phone: "(31) 98777-5520", motivo: "Crises de ansiedade", disp: "Seg à noite", publico: "Adulto", status: "atendimento", termoOk: false, repasseOk: false, days: 2, ter: "Ana Ribeiro", encaminhadoEm: "05/10", recv: "01/10 · 16:30" },
  { id: "c6", name: "Tiago Moura", age: 23, email: "tiago.moura@email.com", phone: "(11) 96543-2109", motivo: "Baixa autoestima", disp: "Tardes", publico: "Adulto", termoOk: true, repasseOk: false, primeiroOk: false, status: "atendimento", days: 8, ter: "Rafael Torres", encaminhadoEm: "29/09", recv: "20/09 · 08:15" },
  { id: "c7", name: "Fernanda Costa", age: 37, email: "fe.costa@email.com", phone: "(11) 98888-1200", motivo: "Relacionamento abusivo encerrado", disp: "Qua à noite", publico: "Adulto", termoOk: true, repasseOk: true, primeiroOk: true, status: "atendimento", days: 41, ter: "Ana Ribeiro", encaminhadoEm: "26/08", recv: "12/08 · 13:00" },
  { id: "c8", name: "Lucas Batista", age: 30, email: "lucas.b@email.com", phone: "(11) 97777-3434", motivo: "Ansiedade social", disp: "Seg à noite", publico: "Adulto", termoOk: true, repasseOk: false, primeiroOk: true, status: "atendimento", days: 22, ter: "Ana Ribeiro", encaminhadoEm: "15/09", recv: "02/09 · 19:45" },
  { id: "c9", name: "Helena Duarte", age: 45, email: "helena.d@email.com", phone: "(21) 96666-9090", motivo: "Burnout", disp: "Manhãs", publico: "Adulto", status: "desligado", days: 15, ter: "Carlos Mendes", recv: "03/06 · 10:30", motivoDeslig: "Alta" },
  emAtendimento("c14", "Marcos Paiva", 39, "Carlos Mendes", 60),
  emAtendimento("c15", "Elisa Dantas", 17, "Carlos Mendes", 33, "Adolescente"),
  emAtendimento("c16", "Rui Campos", 58, "Carlos Mendes", 18),
  emAtendimento("c17", "Davi Reis", 9, "Juliana Prado", 47, "Criança"),
  emAtendimento("c18", "Nina Araújo", 26, "Rafael Torres", 29),
];
