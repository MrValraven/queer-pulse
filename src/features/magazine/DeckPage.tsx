import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FiCheck, FiShare2 } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Avatar, Button, Tag } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MagazineMasthead } from "./MagazineMasthead";
import { AuthorLink } from "./AuthorLink";
import { DeckViewer } from "./DeckViewer";
import { DeckPresentButton } from "./DeckPresentButton";
import { DeckRelatedRail } from "./DeckRelatedRail";
import { useDeck } from "./api/useDeck";
import { MagazineLoadError } from "./MagazineLoadError";
import { clampDescription, nodeToText, nodeToTitleText } from "./nodeText";
import type { SlideDeck } from "./data/decks";
import styles from "./DeckPage.module.css";

/** The curated deck the demo showcase opens on when the URL names none. */
const DEMO_DECK_ID = "ten-years-mouraria";

/**
 * A real description for the share preview (DES-103): the deck's own opening
 * text, falling back to the cover description. Both are the deck's editorial
 * copy, so the preview reads as the piece rather than as the section name.
 */
function deckDescription(deck: SlideDeck): string {
  for (const slide of deck.slides) {
    if (slide.layout !== "text") continue;
    const text =
      nodeToText(slide.body) || nodeToText(slide.heading) || slide.pull || "";
    if (text.trim()) return clampDescription(text);
  }
  return deck.coverDesc ? clampDescription(deck.coverDesc) : "";
}

/**
 * `/magazine/deck` with no `?id=`. Demo mode opens the curated showcase deck;
 * live mode has no such deck, and used to load that same mock slug and show
 * the not-found wall, so it goes to the magazine front instead (PRD-101).
 */
export function DeckPage() {
  const [params] = useSearchParams();
  const { demoMode } = useDemoMode();
  const id = params.get("id") ?? (demoMode ? DEMO_DECK_ID : null);
  if (!id) return <Navigate to={routes.magazine} replace />;
  return <DeckReader id={id} />;
}

function DeckReader({ id }: { id: string }) {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = useDeck(id);
  const deck = data?.deck ?? null;
  const { share, copied } = useShareLink({
    copied: t("magazine:toolbar.linkCopiedToast"),
    failed: t("magazine:toolbar.linkCopyErrorToast"),
  });

  const initial = Math.max(0, Number(params.get("slide") ?? 1) - 1);
  const [index, setIndex] = useState(Number.isFinite(initial) ? initial : 0);

  const goToIndex = (next: number) => {
    setIndex(next);
    const query = new URLSearchParams(params);
    query.set("slide", String(next + 1));
    setParams(query, { replace: true });
  };

  if (isError) {
    // A failed request is NOT a missing deck (FE-CNT-08).
    return (
      <PageShell>
        <PageMeta title={t("magazine:load.errorMetaTitle")} noIndex />
        <div className={`${styles.notFound} wrap`}>
          <MagazineLoadError onRetry={() => void refetch()} />
        </div>
      </PageShell>
    );
  }

  if (!deck) {
    return (
      <PageShell>
        <PageMeta title={t("magazine:article.notFoundMetaTitle")} noIndex />
        <div className={`${styles.notFound} wrap`}>
          {isLoading ? null : (
            <>
              <h2>{t("magazine:article.notFoundTitle")}</h2>
              <Button to={routes.magazine}>
                {t("magazine:deck.backToMagazine")}
              </Button>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const clamped = Math.min(index, deck.slides.length - 1);
  const related = data?.related ?? [];
  // DES-103 — the deck's own headline, so a shared link previews as the piece.
  // It used to be the bare section name ("Photo · QueerPulse").
  const deckTitle = nodeToTitleText(deck.title);

  return (
    <PageShell>
      <PageMeta
        title={`${deckTitle}${t("magazine:article.pageTitleSuffix")}`}
        description={
          deckDescription(deck) ||
          t("magazine:deck.metaDescription", { byline: deck.byline })
        }
        canonical={`${routes.deck}?id=${id}`}
        image={deck.cover}
        type="article"
      />
      <MagazineMasthead />
      <div className={styles.header}>
        <div className="wrap">
          <Link to={routes.magazine} className={styles.back}>
            {t("magazine:deck.backToMagazine")}{" "}
            <span style={{ opacity: 0.5 }}>·</span> {deck.section}
          </Link>
          <div className={styles.kicker}>
            <Tag>{t("magazine:deck.badge")}</Tag> {deck.kicker}
          </div>
          <h1 className={styles.title}>{deck.title}</h1>
          <div className={styles.bylineRow}>
            <Avatar initials={deck.initials} tint={deck.tint} size={36} />
            <div>
              <div className={styles.author}>
                <AuthorLink name={deck.byline} />
              </div>
              {deck.role && <div className={styles.role}>{deck.role}</div>}
            </div>
            <div className={styles.pills}>
              <span className={styles.pill}>{deck.date}</span>
              <span className={styles.pill}>{deck.readTime}</span>
            </div>
            <DeckPresentButton
              title={deck.title}
              label={typeof deck.title === "string" ? deck.title : deck.section}
            >
              <DeckViewer deck={deck} index={clamped} onIndex={goToIndex} />
            </DeckPresentButton>
            {/* DES-103 — a deck was the one magazine reader surface with no
                way to pass it on. Copies the URL of the deck being read. */}
            <Button
              variant="ghost"
              onClick={() => void share(window.location.href)}
            >
              {copied ? <FiCheck aria-hidden /> : <FiShare2 aria-hidden />}
              {copied
                ? t("magazine:deck.shareCopied")
                : t("magazine:deck.share")}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.stageWrap}>
        <DeckViewer deck={deck} index={clamped} onIndex={goToIndex} />
      </div>

      {related.length > 0 && <DeckRelatedRail related={related} />}
    </PageShell>
  );
}
