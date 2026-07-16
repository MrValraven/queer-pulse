import { useState } from "react";
import { FiLayers } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, Reveal, Spinner } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileDirectory } from "./api/useSubprofileDirectory";
import { SubprofileCard } from "./SubprofileCard";
import { SubprofileDirectoryFilters } from "./SubprofileDirectoryFilters";
import type { SubprofileKind } from "./api/subprofiles.api";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * Browse standalone (unlinked + published) personas across the community,
 * filterable by craft and free-text search. Wrapped in `AppShell` (logged-in).
 * The hook re-queries as the filters change; cards link to `/p/<handle>`.
 */
export function SubprofileDirectoryPage() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<SubprofileKind | undefined>(undefined);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useSubprofileDirectory({ kind, query });
  const cards = data ?? [];

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>
              {t("subprofiles:directory.eyebrow")}
            </span>
            <h1 className={styles.title}>
              <Translation
                i18nKey="subprofiles:directory.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.sub}>{t("subprofiles:directory.subtitle")}</p>
          </header>

          <SubprofileDirectoryFilters
            activeKind={kind}
            onKind={setKind}
            query={query}
            onQuery={setQuery}
          />

          {isLoading ? (
            <div className={styles.stateWrap} role="status" aria-live="polite">
              <Spinner />
              <span>{t("subprofiles:directory.loading")}</span>
            </div>
          ) : cards.length === 0 ? (
            <EmptyState
              icon={<FiLayers />}
              title={t("subprofiles:directory.empty.title")}
              description={t("subprofiles:directory.empty.description")}
              action={{
                label: t("subprofiles:directory.empty.clear"),
                onClick: () => {
                  setKind(undefined);
                  setQuery("");
                },
              }}
            />
          ) : (
            <div className={styles.grid}>
              {cards.map((card, i) => (
                <Reveal key={card.handle} delay={Math.min(i, 8) * 60}>
                  <SubprofileCard card={card} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
