import type { Catalog } from "../../types";

/** Navegação — pt-PT inclusivo. "Novo em Lisboa?" reformulado na 2.ª pessoa. */
export const nav: Catalog = {
  // Controlos + ações
  notifications: "Notificações",
  toggleTheme: "Alternar o tema de cor",
  search: "Pesquisar (⌘K)",
  searchShort: "Pesquisar",
  signIn: "Entrar",
  requestInvite: "Pedir um convite",
  signOut: "Sair",
  openMenu: "Abrir o menu",
  closeMenu: "Fechar o menu",
  back: "Voltar",
  menu: "Menu",
  more: "Mais",
  you: "Você",
  account: "A sua conta",
  primary: "Principal",
  // Cartão de atualização (PwaUpdateCard). O título tem duas partes: a
  // segunda aparece em itálico coral.
  updateEyebrow: "Atualização pronta",
  updateHeadline: "Andámos ocupados.",
  updateHeadlineAccent: "Vem ver o que há de novo",
  updateHeadlineAccentVersion: "Vem ver o que há de novo na {version}",
  updateBody:
    "Juntámos algumas correções, melhorias e umas quantas novidades desde a última vez que abriste o QueerPulse.",
  updateWhatChanged: "O que mudou",
  updateReload: "Atualizar agora",
  updateLater: "Mais tarde",
  updating: "A atualizar…",
  updateDismiss: "Dispensar atualização",

  // Barra da página inicial (LandingNav). Etiquetas curtas: ficam todas numa
  // linha dentro da barra, ao lado de mais cinco.
  "landing.label": "Secções da página inicial",
  "landing.about": "A ideia",
  "landing.communities": "Comunidades",
  "landing.gatherings": "Encontros",
  "landing.housing": "Habitação",
  "landing.personas": "Personas",
  "landing.why": "Porque construímos isto",
  "landing.stories": "Histórias",

  // Destinos principais. O destino "Members" chama-se "Membros" (decisão do
  // produto); noutros contextos preferimos "Pessoas" (ver docs/i18n/glossary-pt.md).
  members: "Membros",
  forum: "Fórum",
  calendar: "Calendário",
  communities: "Comunidades e Coletivos",
  // Etiqueta do separador na barra de baixo do telemóvel (bottomTabs.ts). O
  // nome completo acima não cabe num quinto da largura sem partir a linha.
  "tab.communities": "Comunidades",
  arriving: "Acabaste de chegar a Lisboa?",
  skills: "Competências",
  feed: "Início",
  events: "Eventos",
  messages: "Mensagens",
  places: "Locais",
  resources: "Recursos",
  about: "Sobre",

  // Messaging inbox and entry points (scan section 5, 2026-09-15)
  messagesUnread_one: "Mensagens, {count} por ler",
  messagesUnread_other: "Mensagens, {count} por ler",
  notificationsUnread_one: "Notificações, {count} por ler",
  notificationsUnread_other: "Notificações, {count} por ler",
};
