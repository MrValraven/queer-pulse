import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  Outro,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import s from "./PlatformsPage.module.css";

interface Platform {
  cat: string;
  name: string;
  icon: string;
  ic: string;
  it: string;
  description: string;
  url: string;
}

// Canonical (English, stored/filter) category ids — never translate the id
// itself, only `CAT_LABEL_KEYS`' resolved value.
const CAT_ORDER = [
  "Dating",
  "Media",
  "Professional",
  "Advocacy",
  "Health",
  "Portugal",
];
const CAT_LABEL_KEYS: Record<string, string> = {
  Dating: "marketing:platforms.filter.dating",
  Media: "marketing:platforms.filter.media",
  Professional: "marketing:platforms.filter.professional",
  Advocacy: "marketing:platforms.filter.advocacy",
  Health: "marketing:platforms.filter.health",
  Portugal: "marketing:platforms.filter.portugal",
};

const PLATFORMS: Platform[] = [
  {
    cat: "Dating",
    name: "Grindr",
    icon: "Gr",
    ic: "rgba(74,140,111,.14)",
    it: "var(--jade)",
    description: "The largest location-based social app for gay, bi, trans, and queer people. Used by millions globally.",
    url: "grindr.com",
  },
  {
    cat: "Dating",
    name: "HER",
    icon: "HER",
    ic: "rgba(232,119,90,.12)",
    it: "var(--accent-ink)",
    description: "Dating and social app for LGBTQ+ women, non-binary, and queer people. Community features beyond dating.",
    url: "weareher.com",
  },
  {
    cat: "Dating",
    name: "Lex",
    icon: "Lex",
    ic: "rgba(45,27,61,.07)",
    it: "var(--plum)",
    description: "A text-based social and personal ads app for queer, lesbian, bi, trans and non-binary people. Community first.",
    url: "www.lex.lgbt",
  },
  {
    cat: "Dating",
    name: "Feeld",
    icon: "Ff",
    ic: "rgba(122,82,184,.1)",
    it: "var(--violet)",
    description: "For open-minded individuals exploring connections beyond traditional dating norms.",
    url: "feeld.co",
  },
  {
    cat: "Media",
    name: "them.",
    icon: "tm",
    ic: "rgba(45,27,61,.07)",
    it: "var(--plum)",
    description: "Condé Nast's LGBTQ+ digital media platform, covering culture, politics, and identity with a progressive lens.",
    url: "them.us",
  },
  {
    cat: "Media",
    name: "PinkNews",
    icon: "PN",
    ic: "rgba(232,119,90,.1)",
    it: "var(--accent-ink)",
    description: "Europe's largest LGBTQ+ news service. Breaking news, analysis, and features on rights and culture.",
    url: "pinknews.co.uk",
  },
  {
    cat: "Media",
    name: "The Advocate",
    icon: "Av",
    ic: "rgba(74,140,111,.12)",
    it: "var(--jade)",
    description: "The world's longest-running LGBTQ+ news magazine, founded in 1967.",
    url: "advocate.com",
  },
  {
    cat: "Professional",
    name: "Out in Tech",
    icon: "OT",
    ic: "rgba(74,140,111,.12)",
    it: "var(--jade)",
    description: "A non-profit community of LGBTQ+ people in tech. Events, mentoring, and job opportunities worldwide.",
    url: "outintech.org",
  },
  {
    cat: "Professional",
    name: "Lesbians Who Tech",
    icon: "LW",
    ic: "rgba(232,119,90,.1)",
    it: "var(--accent-ink)",
    description: "Global community for LGBTQ+ women and allies in tech. One of the largest professional networks.",
    url: "lesbianswhotech.org",
  },
  {
    cat: "Professional",
    name: "Out & Equal",
    icon: "O=",
    ic: "rgba(45,27,61,.07)",
    it: "var(--plum)",
    description: "Global non-profit focused on LGBTQ+ workplace equality. Partnerships, research, and events.",
    url: "outandequal.org",
  },
  {
    cat: "Advocacy",
    name: "ILGA World",
    icon: "IW",
    ic: "rgba(74,140,111,.12)",
    it: "var(--jade)",
    description: "The International LGBTI Association. Rights advocacy and country-by-country legal data.",
    url: "ilga.org",
  },
  {
    cat: "Advocacy",
    name: "Rainbow Railroad",
    icon: "RR",
    ic: "rgba(232,119,90,.1)",
    it: "var(--accent-ink)",
    description: "Helping LGBTQI+ people escape state-sponsored violence in over 80 countries.",
    url: "rainbowrailroad.org",
  },
  {
    cat: "Advocacy",
    name: "Equaldex",
    icon: "Eq",
    ic: "rgba(74,140,111,.1)",
    it: "var(--jade)",
    description: "Collaborative knowledge base mapping LGBTQ+ rights and laws country by country.",
    url: "equaldex.com",
  },
  {
    cat: "Health",
    name: "The Trevor Project",
    icon: "Tv",
    ic: "rgba(232,119,90,.1)",
    it: "var(--accent-ink)",
    description: "Leading suicide prevention organisation for LGBTQ+ youth. Crisis support, research, and education.",
    url: "thetrevorproject.org",
  },
  {
    cat: "Health",
    name: "Trans Lifeline",
    icon: "TL",
    ic: "rgba(74,140,111,.12)",
    it: "var(--jade)",
    description: "Peer support hotline run by and for trans people. A model for trans-led mental health support.",
    url: "translifeline.org",
  },
  {
    cat: "Portugal",
    name: "ILGA Portugal",
    icon: "IL",
    ic: "rgba(74,140,111,.14)",
    it: "var(--jade)",
    description: "Portugal's leading LGBTQ+ rights organisation. Legal support, advocacy, crisis line, programming.",
    url: "ilga-portugal.pt",
  },
  {
    cat: "Portugal",
    name: "Opus Diversus",
    icon: "OD",
    ic: "rgba(232,119,90,.1)",
    it: "var(--accent-ink)",
    description: "Mental health and peer support for LGBTQ+ people in Portugal. Training for allied professionals.",
    url: "opusdiversus.org",
  },
  {
    cat: "Portugal",
    name: "Rede ex aequo",
    icon: "Re",
    ic: "rgba(45,27,61,.08)",
    it: "var(--plum)",
    description: "Youth-focused LGBTQ+ association with peer support and advocacy groups across Portugal.",
    url: "rea.pt",
  },
];

const FILTERS = ["all", ...CAT_ORDER];

function PlatformCardSkeleton() {
  // Mirrors the real .card: 46px icon tile + (category eyebrow, name, two desc lines, url).
  return (
    <div className={s.card} aria-hidden>
      <SkeletonLine
        width={46}
        height={46}
        style={{ borderRadius: 12, flex: "none" }}
      />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="35%" height={11} />
        <SkeletonLine width="55%" height={18} style={{ marginTop: 6 }} />
        <SkeletonLine width="100%" height={13} style={{ marginTop: 8 }} />
        <SkeletonLine width="80%" height={13} style={{ marginTop: 6 }} />
        <SkeletonLine width={90} height={12.5} style={{ marginTop: 10 }} />
      </div>
    </div>
  );
}

export function PlatformsPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");
  const cats = filter === "all" ? CAT_ORDER : [filter];
  const pageTitle = t("marketing:platforms.meta.title");
  const pageDescription = t("marketing:platforms.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.platforms },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:platforms.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:platforms.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:platforms.hero.sub")}
      >
        <div className={s.bar}>
          <div className={s.filters}>
            {FILTERS.map((filterId) => (
              <button
                type="button"
                key={filterId}
                className={[s.chip, filter === filterId && s.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(filterId)}
              >
                {filterId === "all"
                  ? t("marketing:platforms.filter.all")
                  : t(CAT_LABEL_KEYS[filterId]!)}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      <section className={s.body}>
        <div className="wrap">
          <div className={s.note}>
            <span className={s.pnDot} />
            <p>
              <Translation
                i18nKey="marketing:platforms.note.body"
                components={{ b: <b /> }}
              />
            </p>
          </div>

          {loading ? (
            <div>
              <h2 className={s.secTitle} aria-hidden>
                <SkeletonLine width={180} height={26} />
              </h2>
              <div className={s.grid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <PlatformCardSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : (
            (() => {
              let cardPosition = -1;
              return cats.map((cat) => {
                const items = PLATFORMS.filter(
                  (platform) => platform.cat === cat,
                );
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <h2 className={s.secTitle}>{t(CAT_LABEL_KEYS[cat]!)}</h2>
                    <div className={s.grid}>
                      {items.map((platform) => {
                        cardPosition += 1;
                        return (
                          <FadeIn
                            key={platform.name}
                            delay={Math.min(cardPosition, 8) * 60}
                            style={{ height: "100%" }}
                          >
                            <a
                              href={`https://${platform.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className={s.card}
                              style={{ height: "100%" }}
                            >
                              <span
                                className={s.icon}
                                style={{
                                  background: platform.ic,
                                  color: platform.it,
                                }}
                              >
                                {platform.icon}
                              </span>
                              <div>
                                <div className={s.pCat}>
                                  {t(CAT_LABEL_KEYS[platform.cat]!)}
                                </div>
                                <div className={s.pName}>{platform.name}</div>
                                <p className={s.pDesc}>{platform.description}</p>
                                <div className={s.pUrl}>↗ {platform.url}</div>
                              </div>
                            </a>
                          </FadeIn>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:platforms.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:platforms.outro.sub")}
      >
        <Button size="lg" to={routes.forum}>
          {t("marketing:platforms.outro.cta")} <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </PageShell>
  );
}
