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

  // Exemplos de interpolação + pluralização ("bem-vinde": forma neutra -e)
  "greeting.welcome": "Bem-vinde de volta, {name}",
  "members.count_one": "{count} pessoa",
  "members.count_other": "{count} pessoas",
};
