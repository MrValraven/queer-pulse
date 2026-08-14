import type { Catalog } from "../../types";

/**
 * European Portuguese (pt-PT), inclusive/gender-neutral per spec 13.
 * Strategy: neutral rephrasing first, warm second person, and -e/elu neutral
 * forms where the member is addressed directly (e.g. "bem-vinde"). We avoid
 * masculine-default "neutrals" — e.g. "Members" → "Pessoas", "member" →
 * "pessoa" — see docs glossary. Reviewed-authoring workflow: see README.
 */
export const common: Catalog = {
  // Brand
  "brand.name": "QueerPulse",
  "brand.tagline": "Uma rede profissional queer, com raízes em Lisboa.",

  // Primary CTAs (imperativo na segunda pessoa — evita marcação de género)
  "cta.requestInvite": "Pedir um convite",
  "cta.exploreMembers": "Explorar perfis",
  "cta.backHome": "Voltar ao início",
  "cta.signIn": "Entrar",
  "cta.signOut": "Sair",
  "cta.search": "Pesquisar",

  // Seletor de idioma
  "language.label": "Idioma",
  "language.en": "English",
  "language.pt": "Português",

  // Falhas de escrita otimista — mostradas quando um guardar/remover é revertido
  // porque a chamada à API falhou (SavedProvider, DraftsProvider).
  "toast.saveFailed": "Não foi possível guardar. Verifica a ligação e tenta de novo.",
  "toast.removeFailed": "Não foi possível atualizar. Verifica a ligação e tenta de novo.",

  // Estado de erro de carregamento (falha de fetch em modo live) — reutilizável
  // por páginas que trocam todo o conteúdo por um erro com repetição, em vez de
  // um vazio-falso ou um esqueleto eterno (eventos, comunidade, moderação).
  "error.title": "Algo correu mal",
  "error.description":
    "Não foi possível carregar isto agora. Verifica a ligação e tenta de novo.",
  "error.retry": "Tentar de novo",

  // Exemplos de interpolação + pluralização ("bem-vinde": forma neutra -e)
  "greeting.welcome": "Bem-vinde de volta, {name}",
  "members.count_one": "{count} pessoa",
  "members.count_other": "{count} pessoas",
};
