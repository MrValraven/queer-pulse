import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
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
import { type Region } from "./partnerDetails";
import { usePartners } from "./api/usePartners";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import s from "./PartnersPage.module.css";

const regionClass: Record<Region, string> = {
  pt: s.pt!,
  eu: s.eu!,
  int: s.int!,
};

function PartnerCardSkeleton() {
  // Mirrors the real .card: top row (46px avatar + region badge), name, city, desc, tags, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.top}>
        <SkeletonLine width={46} height={46} style={{ borderRadius: 12 }} />
        <SkeletonLine width={68} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div>
        <SkeletonLine width="60%" height={19} />
        <SkeletonLine width="40%" height={12.5} style={{ marginTop: 6 }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="80%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.tags}>
        <SkeletonLine width={54} height={18} style={{ borderRadius: 6 }} />
        <SkeletonLine width={68} height={18} style={{ borderRadius: 6 }} />
      </div>
      <div className={s.foot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={110} height={13} />
      </div>
    </div>
  );
}

export function PartnersPage() {
  const { t } = useTranslation();
  const {
    items: partners,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePartners();
  // Demo mode keeps the prototype's simulated entrance skeleton; live mode also
  // shows it until the query resolves. Approved partners only (the endpoint and
  // the mock registry both already exclude anything not live).
  const loading = useSimulatedLoad() || isLoading;
  const pageTitle = t("marketing:partners.meta.title");
  const pageDescription = t("marketing:partners.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.partners },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:partners.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:partners.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:partners.hero.sub")}
      />

      <section className={s.interStrip}>
        <div className="wrap">
          <blockquote>
            <Translation
              i18nKey="marketing:partners.interstitial.quote"
              components={{ em: <em /> }}
            />
          </blockquote>
          <p>{t("marketing:partners.interstitial.body")}</p>
        </div>
      </section>

      <section className={s.section}>
        <div className="wrap">
          <div className={s.head}>
            <h2>
              <Translation
                i18nKey="marketing:partners.section.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("marketing:partners.section.sub")}</p>
          </div>
          <div className={s.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <PartnerCardSkeleton key={i} />
                ))
              : partners.map((p, i) => (
                  <FadeIn
                    key={p.slug}
                    delay={Math.min(i, 8) * 60}
                    style={{ height: "100%" }}
                  >
                    <Link
                      to={`${routes.partner}/${p.slug}`}
                      className={s.card}
                      style={{ height: "100%" }}
                    >
                      <div className={s.top}>
                        <span
                          className={s.av}
                          style={{ background: p.background, color: p.color }}
                        >
                          {p.avatar}
                        </span>
                        <span
                          className={`${s.region} ${regionClass[p.region]}`}
                        >
                          {p.regionLabel}
                        </span>
                      </div>
                      <div>
                        <div className={s.name}>{p.name}</div>
                        <div className={s.city}>
                          <FiMapPin /> {p.city}
                        </div>
                      </div>
                      <div className={s.desc}>{p.description}</div>
                      <div className={s.tags}>
                        {p.tags.map((tag) => (
                          <span key={tag} className={s.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className={s.foot}>
                        {t("marketing:partners.card.viewCta")}
                      </div>
                    </Link>
                  </FadeIn>
                ))}
          </div>

          {hasNextPage && (
            <div className={s.loadMore}>
              <Button
                type="button"
                variant="ghost"
                disabled={isFetchingNextPage}
                onClick={fetchNextPage}
              >
                {isFetchingNextPage
                  ? t("marketing:partners.loadingMore")
                  : t("marketing:partners.loadMoreCta")}
              </Button>
            </div>
          )}

          <div className={s.why}>
            <h2>
              <Translation
                i18nKey="marketing:partners.why.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("marketing:partners.why.p1")}</p>
            <p>{t("marketing:partners.why.p2")}</p>
            <p>
              <Translation
                i18nKey="marketing:partners.why.p3"
                components={{ strong: <b /> }}
              />
            </p>
            <p>{t("marketing:partners.why.p4")}</p>
          </div>

          <div className={s.become}>
            <div>
              <h3>
                <Translation
                  i18nKey="marketing:partners.become.title"
                  components={{ em: <em /> }}
                />
              </h3>
              <p>{t("marketing:partners.become.body")}</p>
            </div>
            <div className={s.becomeActions}>
              <Button size="lg" to={routes.partnerApply}>
                {t("marketing:partners.become.applyCta")}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                href="mailto:partners@queerpulse.pt"
              >
                partners@queerpulse.pt
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:partners.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:partners.outro.sub")}
      >
        <Button size="lg" to={routes.requestInvite}>
          {t("common:cta.requestInvite")}
        </Button>
      </Outro>
    </PageShell>
  );
}
