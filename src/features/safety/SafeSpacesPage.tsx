import { useRef, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { FiMapPin } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FilterChips,
  Outro,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { type Category } from "./safeSpaces";
import { useSafeSpaces } from "./api/useSafeSpaces";
import { FILTERS } from "./safeSpacesPage.data";
import { FlagModal } from "./FlagModal";
import { SafeSpaceCard } from "./SafeSpaceCard";
import { SafeSpaceCardSkeleton } from "./SafeSpaceCardSkeleton";
import {
  BadgeExplainer,
  HowSection,
  NominateSection,
  RemovedSection,
} from "./SafeSpacesSections";
import styles from "./SafeSpacesPage.module.css";

export function SafeSpacesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { verified, removed, stats, isLoading } = useSafeSpaces();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [flagging, setFlagging] = useState<string | null>(null);
  const nomRef = useRef<HTMLDivElement>(null);

  const items = verified.filter(
    (s) => filter === "all" || s.cat === filter,
  );
  const scrollToNominate = () =>
    nomRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  const pageTitle = t("safety:spaces.meta.title");
  const pageDescription = t("safety:spaces.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.safeSpaces },
        ])}
      />
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("safety:spaces.hero.category")}</div>
          <h1>
            <Translation
              i18nKey="safety:spaces.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lead}>{t("safety:spaces.hero.lead")}</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.n}>{stats.verified}</div>
              <div className={styles.l}>
                {t("safety:spaces.hero.stat.verified")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>{stats.reviews}</div>
              <div className={styles.l}>
                {t("safety:spaces.hero.stat.reviews")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>{stats.removed}</div>
              <div className={styles.l}>
                {t("safety:spaces.hero.stat.removed")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BadgeExplainer />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.dirHead}>
            <div>
              <h2>
                <Translation
                  i18nKey="safety:spaces.dir.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.dirUpdated}>
                {t("safety:spaces.dir.updated")}
              </div>
            </div>
            <button
              type="button"
              className={styles.nominateBtn}
              onClick={scrollToNominate}
            >
              {t("safety:spaces.dir.nominateCta")}
            </button>
          </div>

          <FilterChips
            className={styles.filters}
            label={t("safety:spaces.dir.filterAria")}
            options={FILTERS.map((f) => ({
              value: f.id,
              label: t(f.labelKey),
            }))}
            value={filter}
            onChange={(v) => setFilter(v as Category | "all")}
          />

          <div className={styles.grid} aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SafeSpaceCardSkeleton key={i} />
                ))
              : items.map((s, i) => (
                  <SafeSpaceCard
                    key={s.name}
                    s={s}
                    onFlag={() => setFlagging(s.name)}
                    delay={Math.min(i, 8) * 60}
                  />
                ))}
          </div>

          {!isLoading && items.length === 0 && (
            <EmptyState
              icon={<FiMapPin />}
              title={t("safety:spaces.empty.title")}
              description={t("safety:spaces.empty.description")}
              action={{
                label: t("safety:spaces.empty.clearCta"),
                onClick: () => setFilter("all"),
              }}
              secondaryAction={{
                label: t("safety:spaces.empty.nominateCta"),
                onClick: scrollToNominate,
              }}
            />
          )}
        </div>
      </div>

      <HowSection />
      <RemovedSection removed={removed} />
      <NominateSection sectionRef={nomRef} />

      <Outro
        title={
          <Translation
            i18nKey="safety:spaces.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("safety:spaces.outro.sub")}
      >
        <Button to={routes.safety} variant="primary" size="lg">
          {t("safety:spaces.outro.safetyCta")}
        </Button>
        <Button to={routes.sober} variant="ghost-dark" size="lg">
          {t("safety:spaces.outro.soberCta")}
        </Button>
      </Outro>

      {flagging && (
        <FlagModal
          spaceName={flagging}
          onClose={() => setFlagging(null)}
          onSubmitted={(reason) =>
            showToast(
              t("safety:spaces.flagToast", { reason: reason.toLowerCase() }),
              "success",
            )
          }
        />
      )}
    </PageShell>
  );
}
