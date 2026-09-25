import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ForumAvatar } from "../ForumAuthor";
import type {
  ComposeCoAuthorOption,
  ComposePostingAsAuthor,
} from "./ComposePostingAs";
import { swapFadeProps } from "./composeSwapFade";
import styles from "./ComposePostingAs.module.css";

// ── Pieces of "Posting as" that move ────────────────────────────────────────
// The identity in the author row fades out and back in when the byline
// changes, and the co-author picker below it is split out so
// `ComposePostingAs` can fold it away while posting anonymously.

/** The avatar and the two lines beside it. Keyed by which identity is
 *  showing, so switching official or anonymous on or off fades the old one
 *  out and the new one in, in the same place. */
export function PostingAsIdentity({
  author,
  isOfficial,
  isAnonymous,
}: {
  author: ComposePostingAsAuthor;
  isOfficial: boolean;
  isAnonymous: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const person = bylinePerson(author, isOfficial, isAnonymous, t);
  const identityKey = isOfficial
    ? "official"
    : isAnonymous
      ? "anonymous"
      : "author";
  return (
    <AnimatePresence initial={false} mode="wait">
      <m.span
        key={identityKey}
        className={styles.identity}
        {...swapFadeProps(reducedMotion)}
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
      </m.span>
    </AnimatePresence>
  );
}

/** Who else the post credits. Hidden while posting anonymously. */
export function CoAuthorPicker({
  coAuthorSlug,
  coAuthorOptions,
  onCoAuthorChange,
}: {
  coAuthorSlug: string | null;
  coAuthorOptions: readonly ComposeCoAuthorOption[];
  onCoAuthorChange: (coAuthorSlug: string | null) => void;
}) {
  const { t } = useTranslation();
  const coAuthorLabelId = useId();
  return (
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
                onClick={() => onCoAuthorChange(isPicked ? null : option.slug)}
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
