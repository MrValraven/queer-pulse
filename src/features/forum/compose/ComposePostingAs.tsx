import { useId, useMemo } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse, Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Language } from "../../../shared/i18n/types";
import { swapFadeProps } from "./composeSwapFade";
import { CoAuthorPicker, PostingAsIdentity } from "./ComposePostingAsParts";
import {
  ANONYMOUS_CATEGORIES,
  COMPOSE_CATEGORIES,
} from "./composeCategories.data";
import styles from "./ComposePostingAs.module.css";

// ── "Posting as" ────────────────────────────────────────────────────────────
// The byline, decided before a word is written, because who a post comes from
// changes what it is safe to say in it.
//
// Official and anonymous are mutually exclusive, and `useComposeThreadState`'s
// setters already enforce that: turning one on turns the other off. This block
// REFLECTS that rather than re-deriving it, so there is exactly one place in
// the app where the rule lives.
//
// Every switch here changes the byline, so every switch is shown moving: the
// row's wash eases between tones, the identity fades out and back in, the
// hint fades to its new sentence and the co-author picker folds away and back.

export interface ComposePostingAsAuthor {
  name: string;
  initials: string;
  photo?: string;
}

/** One member who can be credited alongside the author. */
export interface ComposeCoAuthorOption {
  slug: string;
  name: string;
  initials: string;
  photo?: string;
}

export interface ComposePostingAsProps {
  author: ComposePostingAsAuthor;
  /** Staff only. Without it the QueerPulse Official switch is not offered. */
  canPostAsOfficial: boolean;
  isOfficial: boolean;
  onOfficialChange: (isOfficial: boolean) => void;
  isAnonymous: boolean;
  onAnonymousChange: (isAnonymous: boolean) => void;
  /** The chosen category id. Anonymity is offered for some of them only. */
  category: string | null;
  coAuthorSlug: string | null;
  coAuthorOptions: readonly ComposeCoAuthorOption[];
  onCoAuthorChange: (coAuthorSlug: string | null) => void;
  className?: string;
}

export function ComposePostingAs({
  author,
  canPostAsOfficial,
  isOfficial,
  onOfficialChange,
  isAnonymous,
  onAnonymousChange,
  category,
  coAuthorSlug,
  coAuthorOptions,
  onCoAuthorChange,
  className,
}: ComposePostingAsProps) {
  const { t, language } = useTranslation();
  const headingId = useId();
  const { reducedMotion } = useMotionPrefs();

  const isCategoryAnonymous =
    category !== null && ANONYMOUS_CATEGORIES.includes(category);
  const isAnonymousOffered = isCategoryAnonymous && !isOfficial;
  const anonymousCategoryNames = useAnonymousCategoryNames(language);

  const anonymousHint = isOfficial
    ? t("forum:composePage.postingAs.anonymousBlockedByOfficial")
    : isCategoryAnonymous
      ? t("forum:composePage.postingAs.anonymousHint")
      : t("forum:composePage.postingAs.anonymousElsewhere", {
          categories: anonymousCategoryNames,
        });

  return (
    <section
      className={[styles.block, className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2 className={styles.heading} id={headingId}>
        {t("forum:composePage.postingAs.heading")}
      </h2>

      <div
        className={[
          styles.authorRow,
          isOfficial && styles.authorRowOfficial,
          isAnonymous && styles.authorRowAnonymous,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <PostingAsIdentity
          author={author}
          isOfficial={isOfficial}
          isAnonymous={isAnonymous}
        />
        {canPostAsOfficial && (
          <Toggle
            checked={isOfficial}
            onChange={onOfficialChange}
            tone="coral"
            label={t("forum:composePage.postingAs.officialSwitch")}
          />
        )}
      </div>

      <div className={styles.option}>
        <span className={styles.optionText}>
          <span className={styles.optionLabel}>
            {t("forum:composePage.postingAs.anonymousLabel")}
          </span>
          {/* Keyed by the sentence, so the old hint fades out and the new
              one fades in where it stood. */}
          <AnimatePresence initial={false} mode="wait">
            <m.span
              key={anonymousHint}
              className={styles.optionHint}
              {...swapFadeProps(reducedMotion)}
            >
              {anonymousHint}
            </m.span>
          </AnimatePresence>
        </span>
        {/* A real `<fieldset disabled>`, so the switch inside it is natively
            disabled: out of the tab order, deaf to clicks, and announced as
            unavailable. The repo's `Toggle` needs no variant for it, and
            `inert` is off the table here (it breaks `useDismiss`'s trap). */}
        <fieldset className={styles.guard} disabled={!isAnonymousOffered}>
          <Toggle
            checked={isAnonymous}
            onChange={onAnonymousChange}
            tone="coral"
            label={t("forum:composePage.postingAs.anonymousLabel")}
          />
        </fieldset>
      </div>

      {/* Folds away while posting anonymously and grows back when the name
          returns. */}
      <Collapse isOpen={!isAnonymous} className={styles.coAuthorSlot}>
        <CoAuthorPicker
          coAuthorSlug={coAuthorSlug}
          coAuthorOptions={coAuthorOptions}
          onCoAuthorChange={onCoAuthorChange}
        />
      </Collapse>
    </section>
  );
}

/**
 * "Health, Housing and Trans" in the reader's language, with the conjunction
 * `Intl` picks rather than a hardcoded "and". Built from the same
 * `ANONYMOUS_CATEGORIES` the gate reads, so the sentence can never name a
 * category the switch does not actually open.
 */
function useAnonymousCategoryNames(language: Language): string {
  const { t } = useTranslation();
  return useMemo(() => {
    const names = COMPOSE_CATEGORIES.filter((composeCategory) =>
      ANONYMOUS_CATEGORIES.includes(composeCategory.id),
    ).map((composeCategory) => t(composeCategory.nameKey));
    return new Intl.ListFormat(language, {
      style: "long",
      type: "conjunction",
    }).format(names);
  }, [language, t]);
}
