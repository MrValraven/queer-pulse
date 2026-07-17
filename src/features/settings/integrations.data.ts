import type { TFunction } from "../../shared/i18n/types";

export interface Integration {
  id: string;
  /** Provider/app brand name — proper noun, never translated. */
  name: string;
  /** Single-letter glyph used in the tinted logo tile. */
  glyph: string;
  desc: string;
  /** Scope lines shown in the provider-auth modal. */
  scopes: string[];
}

/** Sign-in providers that can be linked via the simulated OAuth modal. */
export function buildLinkProviders(t: TFunction): Record<string, Integration> {
  return {
    apple: {
      id: "apple",
      name: "Apple",
      glyph: "",
      desc: t("settings:integrations.apple.desc"),
      scopes: [
        t("settings:integrations.apple.scope1"),
        t("settings:integrations.apple.scope2"),
        t("settings:integrations.apple.scope3"),
      ],
    },
  };
}

/** Available integrations shown in the "Browse" gallery modal. */
export function buildAvailableIntegrations(t: TFunction): Integration[] {
  return [
    {
      id: "stripe",
      name: "Stripe",
      glyph: "S",
      desc: t("settings:integrations.stripe.desc"),
      scopes: [],
    },
    {
      id: "mastodon",
      name: "Mastodon",
      glyph: "M",
      desc: t("settings:integrations.mastodon.desc"),
      scopes: [],
    },
    {
      id: "spotify",
      name: "Spotify",
      glyph: "S",
      desc: t("settings:integrations.spotify.desc"),
      scopes: [],
    },
    {
      id: "ical",
      name: "iCal export",
      glyph: "C",
      desc: t("settings:integrations.ical.desc"),
      scopes: [],
    },
    {
      id: "notion",
      name: "Notion",
      glyph: "N",
      desc: t("settings:integrations.notion.desc"),
      scopes: [],
    },
    {
      id: "readwise",
      name: "Readwise",
      glyph: "R",
      desc: t("settings:integrations.readwise.desc"),
      scopes: [],
    },
    {
      id: "matrix",
      name: "Matrix",
      glyph: "X",
      desc: t("settings:integrations.matrix.desc"),
      scopes: [],
    },
    {
      id: "pinboard",
      name: "Pinboard",
      glyph: "P",
      desc: t("settings:integrations.pinboard.desc"),
      scopes: [],
    },
  ];
}
