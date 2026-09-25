import { useId, useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { toPlainText } from "../../../shared/markdown";
import { firstLinkIn } from "./composeText";
import { PreviewAudience, PreviewByline } from "./ComposePreviewByline";
import {
  LinkUnfurlPlaceholder,
  PreviewBadges,
  PreviewPhotos,
  PreviewPoll,
  PreviewSlot,
} from "./ComposePreviewParts";
import type {
  ComposeAudience,
  ComposePhoto,
  ComposePoll,
} from "./composeThread.types";
import styles from "./ComposePreviewCard.module.css";

// ── "How it will look" ──────────────────────────────────────────────────────
// The same card the forum list draws, built from the draft instead of from a
// published thread: category badge, content-warning pill, tags, title,
// excerpt, photos, poll, byline, audience.
//
// It is deliberately honest about what it does NOT know. A poll shows its
// options with empty bars and says there are no votes yet rather than
// inventing plausible percentages, and a link shows an unfurl PLACEHOLDER
// rather than a fabricated headline. A preview that guesses is a preview
// nobody can trust.
//
// Sections that the draft adds or removes (badges, the reveal button, photos,
// poll, link unfurl) grow and fold through `PreviewSlot`; text that changes on
// every keystroke updates in place, so the card never jitters while typing.

/** Longest excerpt the list shows before it cuts. */
const EXCERPT_MAX_LENGTH = 220;

/** The identity the byline draws. */
export interface ComposePreviewAuthor {
  name: string;
  /** Fallback when there is no photo. */
  initials: string;
  photo?: string;
}

export interface ComposePreviewCardProps {
  title: string;
  /** The body in markdown-lite; the excerpt is cut from its plain text. */
  body: string;
  category: string | null;
  tags: readonly string[];
  /** Ids from `CONTENT_WARNINGS`. */
  contentWarnings: readonly string[];
  photos: readonly ComposePhoto[];
  poll: ComposePoll | null;
  /** Publishing under the QueerPulse Official byline. */
  isOfficial: boolean;
  /** Publishing without the author's name. */
  isAnonymous: boolean;
  author: ComposePreviewAuthor;
  /** The second name on the byline, already resolved. */
  coAuthorName?: string;
  /** The community this posts inside, or null for the town square. */
  community: ComposeAudience | null;
  isCrossPosted: boolean;
  className?: string;
}

export function ComposePreviewCard({
  title,
  body,
  category,
  tags,
  contentWarnings,
  photos,
  poll,
  isOfficial,
  isAnonymous,
  author,
  coAuthorName,
  community,
  isCrossPosted,
  className,
}: ComposePreviewCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const excerptId = useId();
  const [isWarningRevealed, setWarningRevealed] = useState(false);

  const excerpt = toPlainText(body).slice(0, EXCERPT_MAX_LENGTH);
  // Only a written excerpt is covered. Blurring the placeholder would hide a
  // sentence explaining what the excerpt is, which helps nobody.
  const hasCoverableExcerpt = contentWarnings.length > 0 && excerpt.length > 0;
  const isExcerptCovered = hasCoverableExcerpt && !isWarningRevealed;
  const linkHost = hostOf(firstLinkIn(body));
  const hasBadges = !!category || tags.length > 0 || contentWarnings.length > 0;
  const hasPollOptions =
    !!poll && poll.options.some((option) => option.trim().length > 0);

  return (
    <section
      className={[styles.block, className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2 className={styles.heading} id={headingId}>
        {t("forum:composePage.preview.heading")}
      </h2>

      <article className={styles.card}>
        <PreviewSlot isOpen={hasBadges}>
          <PreviewBadges
            category={category}
            tags={tags}
            contentWarnings={contentWarnings}
            translate={t}
          />
        </PreviewSlot>

        <p className={[styles.title, !title && styles.placeholder].join(" ")}>
          {title || t("forum:composePage.preview.titlePlaceholder")}
        </p>

        <p
          id={excerptId}
          aria-hidden={isExcerptCovered}
          className={[
            styles.excerpt,
            !excerpt && styles.placeholder,
            isExcerptCovered && styles.excerptCovered,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {excerpt || t("forum:composePage.preview.excerptPlaceholder")}
        </p>

        <PreviewSlot isOpen={hasCoverableExcerpt}>
          <button
            type="button"
            className={styles.reveal}
            aria-expanded={isWarningRevealed}
            aria-controls={excerptId}
            onClick={() => setWarningRevealed((wasRevealed) => !wasRevealed)}
          >
            {t(
              isWarningRevealed
                ? "forum:composePage.preview.hideAgain"
                : "forum:composePage.preview.showAnyway",
            )}
          </button>
        </PreviewSlot>

        <PreviewSlot isOpen={photos.length > 0}>
          <PreviewPhotos photos={photos} />
        </PreviewSlot>

        <PreviewSlot isOpen={hasPollOptions}>
          {poll && <PreviewPoll poll={poll} translate={t} />}
        </PreviewSlot>

        <PreviewByline
          isOfficial={isOfficial}
          isAnonymous={isAnonymous}
          author={author}
          coAuthorName={coAuthorName}
          translate={t}
          replyCount={format.number(0)}
        />

        <PreviewAudience
          community={community}
          isCrossPosted={isCrossPosted}
          translate={t}
          formatNumber={format.number}
        />
      </article>

      <PreviewSlot isOpen={!!linkHost}>
        {linkHost && <LinkUnfurlPlaceholder host={linkHost} translate={t} />}
      </PreviewSlot>
    </section>
  );
}

/** The hostname of the first link in the body, without `www.`, or null. */
function hostOf(link: string | null): string | null {
  if (!link) return null;
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
