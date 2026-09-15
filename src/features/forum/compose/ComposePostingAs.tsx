import { useId, useMemo } from "react";
import { Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Language } from "../../../shared/i18n/types";
import { ForumAvatar } from "../ForumAuthor";
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
  const coAuthorLabelId = useId();

  const isCategoryAnonymous =
    category !== null && ANONYMOUS_CATEGORIES.includes(category);
  const isAnonymousOffered = isCategoryAnonymous && !isOfficial;
  const anonymousCategoryNames = useAnonymousCategoryNames(language);
  const person = bylinePerson(author, isOfficial, isAnonymous, t);

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
        <ForumAvatar className={styles.avatar} person={person} />
        <span className={styles.authorText}>
          <span className={styles.authorName}>{person.name}</span>
          <span className={styles.authorSub}>
            {isOfficial
              ? t("forum:composePage.postingAs.officialSub", {
                  name: author.name,
                })
              : isAnonymous
                ? t("forum:composePage.postingAs.anonymousSub")
                : t("forum:composePage.postingAs.yourNameSub")}
          </span>
        </span>
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
          <span className={styles.optionHint}>{anonymousHint}</span>
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

      {!isAnonymous && (
        <div className={styles.coAuthor}>
          <span className={styles.optionText}>
            <span className={styles.optionLabel} id={coAuthorLabelId}>
              {t("forum:composePage.postingAs.coAuthorLabel")}
            </span>
            <span className={styles.optionHint}>
              {t("forum:composePage.postingAs.coAuthorHint")}
            </span>
          </span>
          {coAuthorOptions.length === 0 ? (
            <p className={styles.optionHint}>
              {t("forum:composePage.postingAs.coAuthorEmpty")}
            </p>
          ) : (
            <div
              className={styles.coAuthorPicker}
              aria-labelledby={coAuthorLabelId}
              role="group"
            >
              {coAuthorOptions.map((option) => {
                const isPicked = option.slug === coAuthorSlug;
                return (
                  <button
                    key={option.slug}
                    type="button"
                    className={styles.coAuthorChip}
                    aria-pressed={isPicked}
                    onClick={() =>
                      onCoAuthorChange(isPicked ? null : option.slug)
                    }
                  >
                    <ForumAvatar
                      className={styles.coAuthorAvatar}
                      person={{
                        initials: option.initials,
                        name: option.name,
                        photo: option.photo,
                      }}
                    />
                    {option.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** The identity the row shows: the institutional account, an unnamed member,
 *  or the member themselves. */
function bylinePerson(
  author: ComposePostingAsAuthor,
  isOfficial: boolean,
  isAnonymous: boolean,
  translate: (key: string) => string,
) {
  if (isOfficial)
    return {
      // The institutional account wears the brand mark instead of letters.
      initials: "",
      name: translate("forum:composePage.preview.officialName"),
      official: true,
    };
  if (isAnonymous) {
    const name = translate("forum:composePage.preview.anonymousName");
    return { initials: name.slice(0, 1), name };
  }
  return { initials: author.initials, name: author.name, photo: author.photo };
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
