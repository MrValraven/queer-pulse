import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Content for the Studio About page. Platform-authored marketing/editorial
 * copy — chrome per `docs/i18n/extraction-brief.md` §1 (never fetched, ships
 * in the bundle in both demo and live mode). Pattern B: `buildAboutData(t)`
 * is memoized in `StudioAboutPage.tsx` / `StudioAboutSections.tsx`.
 */

export const HERO_KEYS = {
  eyebrow: "studio:about.hero.eyebrow",
  title: "studio:about.hero.title",
  lede: "studio:about.hero.lede",
};

export interface AboutHero {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
}

export function buildHero(t: TFunction): AboutHero {
  return {
    eyebrow: t(HERO_KEYS.eyebrow),
    title: <Translation i18nKey={HERO_KEYS.title} components={{ em: <em /> }} />,
    lede: <Translation i18nKey={HERO_KEYS.lede} components={{ em: <em /> }} />,
  };
}

/** The three cells in the rate band (section 02). */
export interface RateCell {
  value: ReactNode;
  label: string;
  jade?: boolean;
}

export function buildRateCells(t: TFunction): RateCell[] {
  return [
    {
      value: <Translation i18nKey="studio:about.rate.cell.floor.value" components={{ em: <em /> }} />,
      label: t("studio:about.rate.cell.floor.label"),
    },
    {
      value: <Translation i18nKey="studio:about.rate.cell.share.value" components={{ em: <em /> }} />,
      label: t("studio:about.rate.cell.share.label"),
    },
    {
      value: <Translation i18nKey="studio:about.rate.cell.tip.value" components={{ em: <em /> }} />,
      label: t("studio:about.rate.cell.tip.label"),
      jade: true,
    },
  ];
}

/** Earning tiers (section 03). */
export interface Tier {
  label: string;
  value: ReactNode;
  body: ReactNode;
  variant?: "hi" | "ceil";
}

export function buildTiers(t: TFunction): Tier[] {
  const perMonth = t("studio:signin.perMonth");
  return [
    {
      label: t("studio:about.tier.casual.label"),
      value: (
        <>
          &euro;<em>{t("studio:about.tier.casual.value")}</em>
          <span className="mo">{perMonth}</span>
        </>
      ),
      body: <Translation i18nKey="studio:about.tier.casual.body" components={{ em: <em /> }} />,
    },
    {
      label: t("studio:about.tier.building.label"),
      value: (
        <>
          &euro;<em>{t("studio:about.tier.building.value")}</em>
          <span className="mo">{perMonth}</span>
        </>
      ),
      body: <Translation i18nKey="studio:about.tier.building.body" components={{ em: <em /> }} />,
    },
    {
      label: t("studio:about.tier.sustaining.label"),
      value: (
        <>
          &euro;<em>{t("studio:about.tier.sustaining.value")}</em>
          <span className="mo">{perMonth}</span>
        </>
      ),
      body: <Translation i18nKey="studio:about.tier.sustaining.body" components={{ em: <em /> }} />,
      variant: "hi",
    },
    {
      label: t("studio:about.tier.touring.label"),
      value: <em>&mdash;</em>,
      body: <Translation i18nKey="studio:about.tier.touring.body" components={{ em: <em /> }} />,
      variant: "ceil",
    },
  ];
}

export function buildTierFoot(): ReactNode {
  return <Translation i18nKey="studio:about.tierFoot" components={{ em: <em /> }} />;
}

/** The "hard questions" Q&A (section 05). */
export interface Skeptic {
  q: string;
  a: ReactNode;
}

export function buildSkeptics(t: TFunction): Skeptic[] {
  return [
    {
      q: t("studio:about.skeptic.broke.q"),
      a: <Translation i18nKey="studio:about.skeptic.broke.a" components={{ em: <em /> }} />,
    },
    {
      q: t("studio:about.skeptic.clique.q"),
      a: <Translation i18nKey="studio:about.skeptic.clique.a" components={{ em: <em /> }} />,
    },
    {
      q: t("studio:about.skeptic.clone.q"),
      a: <Translation i18nKey="studio:about.skeptic.clone.a" components={{ em: <em /> }} />,
    },
    {
      q: t("studio:about.skeptic.leave.q"),
      a: <Translation i18nKey="studio:about.skeptic.leave.a" components={{ em: <em /> }} />,
    },
  ];
}

export interface AboutCta {
  title: ReactNode;
  body: string;
  join: string;
  ledger: string;
}

export function buildCta(t: TFunction): AboutCta {
  return {
    title: <Translation i18nKey="studio:about.cta.title" components={{ em: <em /> }} />,
    body: t("studio:about.cta.body"),
    join: t("studio:about.cta.join"),
    ledger: t("studio:about.cta.ledger"),
  };
}

export interface AboutData {
  hero: AboutHero;
  rateCells: RateCell[];
  tiers: Tier[];
  tierFoot: ReactNode;
  skeptics: Skeptic[];
  cta: AboutCta;
  sectionNum: {
    whatItIs: string;
    rate: string;
    ceiling: string;
    governance: string;
    hardQuestions: string;
  };
}

export function buildAboutData(t: TFunction): AboutData {
  return {
    hero: buildHero(t),
    rateCells: buildRateCells(t),
    tiers: buildTiers(t),
    tierFoot: buildTierFoot(),
    skeptics: buildSkeptics(t),
    cta: buildCta(t),
    sectionNum: {
      whatItIs: t("studio:about.sec.whatItIs.num"),
      rate: t("studio:about.sec.rate.num"),
      ceiling: t("studio:about.sec.ceiling.num"),
      governance: t("studio:about.sec.governance.num"),
      hardQuestions: t("studio:about.sec.hardQuestions.num"),
    },
  };
}
