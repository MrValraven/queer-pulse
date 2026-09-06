import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import {
  Button,
  EmptyState,
  FadeIn,
  ImageSlot,
  SkeletonCard,
  Tag,
} from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { MagazineSearchLauncher } from "./MagazineSearchField";
import { MagazineSignInWall } from "./MagazineSignInWall";
import { useDecksDirectory } from "./api/useDecksDirectory";
import type { SlideDeck } from "./data/decks";
import styles from "./DecksPage.module.css";

/** Skeleton cards shown while the first page is in flight. */
const SKELETON_COUNT = 6;

/**
 * PRD-105 — every published interactive deck, in one browsable index.
 *
 * Decks had no browse surface at all. The magazine front shows the newest one
 * and stops there, magazine search and the section browse both query
 * ARTICLES, and an issue's run order carries no deck slots, so the only ways
 * back to an older deck were a curated issue panel or the same-tag rail on
 * another deck. The second deck to publish pushed the first out of the
 * magazine for every reader who had not bookmarked it.
 *
 * The states are kept distinct for the same reason `MagazineSearchPage` keeps
 * its five apart: a 401 (every magazine read sits behind `ActiveMemberGuard`)
 * is a members-only wall with a way through, a failed request says so and
 * offers a retry, and only a genuinely empty catalogue reads as "no decks
 * yet". Collapsing them would tell a reader the magazine has never run a deck
 * when the truth is the request never arrived.
 */
export function DecksPage() {
  const { t } = useTranslation();
  const {
    decks,
    total,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useDecksDirectory();
  const isSignedOut = error instanceof ApiError && error.status === 401;
  const hasNoDecks = !isLoading && !isError && decks.length === 0;

  return (
    <PageShell>
      <PageMeta
        title={t("magazine:decks.metaTitle")}
        description={t("magazine:decks.metaDescription")}
        canonical={routes.magazineDecks}
      />
      <MagazineMasthead active="decks" />
      {/* The same launcher the sections and section-drilldown browse pages
          mount: a reader on a magazine index is the reader who may want to
          search the rest of the archive. */}
      <div className="wrap">
        <MagazineSearchLauncher />
      </div>
      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eyebrow}>{t("magazine:decks.eyebrow")}</div>
            <h1 className={styles.h1}>{t("magazine:decks.title")}</h1>
            <p className={styles.sub}>{t("magazine:decks.sub")}</p>
            {!isLoading && !isError && total > 0 && (
              <p className={styles.count}>
                {t("magazine:decks.count", { count: total })}
              </p>
            )}
          </div>

          {isSignedOut ? (
            <MagazineSignInWall />
          ) : isError ? (
            <EmptyState
              title={t("magazine:decks.errorTitle")}
              description={t("magazine:decks.errorBody")}
              action={{ label: t("magazine:decks.retryCta"), onClick: refetch }}
            />
          ) : hasNoDecks ? (
            <EmptyState
              title={t("magazine:decks.emptyTitle")}
              description={t("magazine:decks.emptyBody")}
            />
          ) : (
            <>
              <div className={styles.grid}>
                {isLoading
                  ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))
                  : decks.map((deck, index) => (
                      <DeckCard key={deck.id} deck={deck} index={index} />
                    ))}
              </div>

              {hasNextPage && (
                <div className={styles.loadMore}>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isFetchingNextPage}
                    onClick={fetchNextPage}
                  >
                    {isFetchingNextPage
                      ? t("magazine:decks.loadingMore")
                      : t("magazine:decks.loadMoreCta")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

/**
 * One deck in the index. Links to the reader by slug, the same `?id=` the
 * front's featured-deck CTA and the related rail use.
 */
function DeckCard({ deck, index }: { deck: SlideDeck; index: number }) {
  const { t } = useTranslation();
  // `tintFor` (via the adapter) returns the broader `AvatarTint`; `ImageSlot`
  // accepts the narrower `ImageSlotTint`, so narrow rather than widen it here
  // (same call the front's cards make).
  const imageTint =
    deck.tint === "default" || deck.tint === "auth" ? "plum" : deck.tint;
  return (
    <FadeIn
      as={Link}
      to={`${routes.deck}?id=${deck.id}`}
      className={styles.card}
      delay={Math.min(index, 8) * 60}
    >
      <div className={styles.cardMedia}>
        <ImageSlot
          // A live deck the desk never gave cover art has an empty string
          // here, which is the tinted placeholder frame, not a broken image.
          src={deck.cover || undefined}
          alt={deck.coverDesc}
          placeholder={deck.coverDesc}
          tint={imageTint}
          height="100%"
          radius={14}
        />
      </div>
      <div className={styles.cardBadge}>
        <Tag>{t("magazine:deck.badge")}</Tag>
      </div>
      {deck.kicker && <div className={styles.cardKicker}>{deck.kicker}</div>}
      <div className={styles.cardTitle}>{deck.title}</div>
      <div className={styles.cardMeta}>
        {deck.byline}
        {deck.readTime ? ` · ${deck.readTime}` : ""}
      </div>
    </FadeIn>
  );
}
