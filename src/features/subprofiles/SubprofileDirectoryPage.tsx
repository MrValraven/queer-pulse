import { useMemo, useState } from "react";
import { FiLayers, FiAlertCircle } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, Reveal, Spinner } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileDirectory } from "./api/useSubprofileDirectory";
import { SubprofileCard } from "./SubprofileCard";
import { SubprofileDirectoryFilters } from "./SubprofileDirectoryFilters";
import type { SubprofileCardDTO, SubprofileKind } from "./api/subprofiles.api";
import styles from "./SubprofileDirectoryPage.module.css";

const AVAILABLE_TAGS_CAP = 20;

/** Union of `card.tags` across the loaded result set, deduped and capped at
 *  `AVAILABLE_TAGS_CAP`, most-frequent tag first. Purely client-side — the
 *  directory endpoint isn't re-queried for this. */
function computeAvailableTags(cards: SubprofileCardDTO[]): string[] {
  const occurrenceCountByTag = new Map<string, number>();
  for (const card of cards) {
    for (const tag of card.tags) {
      occurrenceCountByTag.set(tag, (occurrenceCountByTag.get(tag) ?? 0) + 1);
    }
  }
  return [...occurrenceCountByTag.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, AVAILABLE_TAGS_CAP)
    .map(([tag]) => tag);
}

/**
 * Browse standalone (unlinked + published) personas across the community,
 * filterable by craft and free-text search. Wrapped in `AppShell` (logged-in).
 * Kind + query re-query the directory hook; "open to collabs" and tags are
 * applied client-side over the already-fetched cards.
 */
export function SubprofileDirectoryPage() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<SubprofileKind | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [openToCollabs, setOpenToCollabs] = useState(false);

  const { data, isLoading, isError, refetch } = useSubprofileDirectory({
    kind,
    query,
  });
  const cards = useMemo(() => data ?? [], [data]);

  const availableTags = useMemo(() => computeAvailableTags(cards), [cards]);

  // Client-side only: "open to collabs" narrows to that availability; tag
  // matching is OR (a card is kept if it has ANY selected tag, not all of
  // them) — the two conditions combine with AND.
  const visibleCards = useMemo(() => {
    return cards.filter((card) => {
      if (openToCollabs && card.availability !== "open_to_collabs") {
        return false;
      }
      if (
        activeTags.length > 0 &&
        !card.tags.some((tag) => activeTags.includes(tag))
      ) {
        return false;
      }
      return true;
    });
  }, [cards, activeTags, openToCollabs]);

  const onToggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((activeTag) => activeTag !== tag)
        : [...current, tag],
    );
  };

  const onToggleOpenToCollabs = () => setOpenToCollabs((current) => !current);

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
            availableTags={availableTags}
            activeTags={activeTags}
            onToggleTag={onToggleTag}
            openToCollabs={openToCollabs}
            onToggleOpenToCollabs={onToggleOpenToCollabs}
          />

          {isLoading ? (
            <div className={styles.stateWrap} role="status" aria-live="polite">
              <Spinner />
              <span>{t("subprofiles:directory.loading")}</span>
            </div>
          ) : isError ? (
            // Distinct from the empty state: a failed fetch must not read as
            // "no personas yet" — offer a retry rather than a filter clear.
            <EmptyState
              icon={<FiAlertCircle />}
              title={t("subprofiles:directory.error.title")}
              description={t("subprofiles:directory.error.description")}
              action={{
                label: t("subprofiles:directory.error.retry"),
                onClick: () => void refetch(),
              }}
            />
          ) : visibleCards.length === 0 ? (
            <EmptyState
              icon={<FiLayers />}
              title={t("subprofiles:directory.empty.title")}
              description={t("subprofiles:directory.empty.description")}
              action={{
                label: t("subprofiles:directory.empty.clear"),
                onClick: () => {
                  setKind(undefined);
                  setQuery("");
                  setActiveTags([]);
                  setOpenToCollabs(false);
                },
              }}
            />
          ) : (
            <div className={styles.grid}>
              {visibleCards.map((card, i) => (
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
