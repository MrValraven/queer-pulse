import type { Catalog } from "../../types";

/**
 * Encontros — pt-PT inclusivo. Mesmas chaves que `en/gatherings.ts`.
 *
 * Notas de tradução:
 * - "Members" → *pessoas* / *a comunidade*, nunca *Membros* (masculino por
 *   omissão, genderiza toda a comunidade).
 * - Registo `tu`, caloroso, nunca `você`.
 * - Nomes próprios (bairros de Lisboa, ILGA Portugal) e a marca QueerPulse
 *   ficam iguais.
 * - Títulos, descrições e biografias fictícias dos eventos NÃO são traduzidos —
 *   em modo live vêm da API como texto de quem os escreveu.
 */
export const gatherings: Catalog = {
  // ── Página de entrada (GatheringsPage) ────────────────────────────────────
  "landing.hero.eyebrow": "Encontros",
  "landing.hero.title": "A comunidade, <em>na mesma sala.</em>",
  "landing.hero.lead":
    "Jantares partilhados, convívios, visitas a ateliês, sessões de cinema e trocas de saberes — encontros reais por toda a Lisboa, organizados por pessoas da comunidade para a comunidade. É aqui que a plataforma deixa de ser um ecrã.",

  "landing.ways.title": "Descobre por onde <em>entrar.</em>",
  "landing.ways.lead":
    "Se é a tua primeira vez ou se já vais no décimo jantar que organizas, começa por aqui.",
  "landing.ways.browse.title": "Vê o que há",
  "landing.ways.browse.body":
    "Jantares partilhados, convívios, visitas a ateliês, sessões de cinema e trocas de saberes — filtra por bairro, tipo e data.",
  "landing.ways.browse.cta": "Ver todos os eventos",
  "landing.ways.calendar.title": "A vista de calendário",
  "landing.ways.calendar.body":
    "O mês inteiro num relance, com as tuas inscrições e os encontros perto de ti em destaque.",
  "landing.ways.calendar.cta": "Abrir o calendário",
  "landing.ways.host.title": "Organiza o teu",
  "landing.ways.host.body":
    "Um guia passo a passo para organizares um jantar, uma oficina ou uma sessão de cinema — com espaços parceiros e apoio da comunidade.",
  "landing.ways.host.cta": "Organizar um encontro",
  "landing.ways.recap.title": "Revive o último",
  "landing.ways.recap.body":
    "Fotografias, notas e quantas pessoas apareceram nos encontros que já aconteceram.",
  "landing.ways.recap.cta": "Ver retrospetivas",

  "landing.featured.title": "A acontecer <em>em breve.</em>",
  "landing.featured.lead":
    "Uma amostra das próximas semanas. O quadro completo está na página de eventos.",

  "landing.outro.title": "Junta as <em>pessoas.</em>",
  "landing.outro.sub":
    "Cada encontro começou com uma pessoa que decidiu organizar. A plataforma trata do resto — bilhetes, escala móvel e um lugar no quadro.",
  "landing.outro.browseCta": "Ver todos os eventos",
  "landing.outro.hostCta": "Organizar um encontro",

  // ── Bairros de Lisboa ─────────────────────────────────────────────────────
  // Nomes próprios: iguais em ambos os catálogos.
  "hood.principeReal": "Príncipe Real",
  "hood.alfama": "Alfama",
  "hood.marvila": "Marvila",
  "hood.mouraria": "Mouraria",
  "hood.graca": "Graça",
  "hood.caisDoSodre": "Cais do Sodré",
  "hood.arroios": "Arroios",
  "hood.bairroAlto": "Bairro Alto",

  // ── Linha de vagas no cartão do evento ────────────────────────────────────
  // "{count} pessoas vão" evita particípios genderizados ("confirmados").
  "spots.seatsLeft_one": "Resta {count} lugar",
  "spots.seatsLeft_other": "Restam {count} lugares",
  "spots.spotsLeft_one": "Resta {count} vaga",
  "spots.spotsLeft_other": "Restam {count} vagas",
  "spots.going_one": "{count} pessoa vai",
  "spots.going_other": "{count} pessoas vão",
  "spots.goingSoFar_one": "{count} pessoa vai até agora",
  "spots.goingSoFar_other": "{count} pessoas vão até agora",
  "spots.goingWithWaitlist_one":
    "{count} pessoa vai · {waitlist} em lista de espera",
  "spots.goingWithWaitlist_other":
    "{count} pessoas vão · {waitlist} em lista de espera",
  "spots.goingWithPrice_one": "{count} pessoa vai · {price}",
  "spots.goingWithPrice_other": "{count} pessoas vão · {price}",
  "spots.goingPayWhatYouCan_one": "{count} pessoa vai · pagas o que puderes",
  "spots.goingPayWhatYouCan_other": "{count} pessoas vão · pagas o que puderes",
  "spots.goingOnline_one": "{count} pessoa vai · online",
  "spots.goingOnline_other": "{count} pessoas vão · online",
  "spots.casual": "Informal",
  "spots.openToAll": "Aberto a toda a gente",
  "spots.familyFriendly": "Para toda a família",
  "spots.online": "Online",
  "spots.allPaces": "Todos os ritmos",
  "spots.ages1625": "Dos 16 aos 25",
  "spots.byAppointment": "Com marcação",
  "spots.noAudition": "Sem audição",
  "spots.dropIn": "Entra quando quiseres",
  "spots.waitlistOpen": "Lista de espera aberta",

  // ── Ações de inscrição ────────────────────────────────────────────────────
  "cta.reserveSeat": "Reservar lugar",
  "cta.reserveSpot": "Reservar vaga",
  "cta.requestSpot": "Pedir uma vaga",
  "cta.illBeThere": "Eu vou",
  "cta.rsvp": "Confirmar presença",
  "cta.joinOnline": "Entrar online",
  "cta.bookSlot": "Marcar horário",
  "cta.joinWaitlist": "Entrar na lista de espera",

  // ── Linha de detalhe de quem vai (attendeeMeta) ───────────────────────────
  // Os pronomes ao lado são as palavras da própria pessoa — não se traduzem.
  "attendee.rsvpdOn": "Confirmou em {date}",
  "attendee.waitlistedSince": "Em lista de espera desde {date}",
  "attendee.waitlistPosition": "#{position}",

  // ── Legenda do calendário ─────────────────────────────────────────────────
  "calendar.legend.queerpulse": "QueerPulse",
  "calendar.legend.ilga": "ILGA Portugal",
  "calendar.legend.community": "Comunidade",
  "calendar.legend.partners": "Organizações parceiras",
};
