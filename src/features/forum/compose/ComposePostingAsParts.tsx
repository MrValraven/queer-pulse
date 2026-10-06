import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ForumAvatar } from "../ForumAuthor";
import type { ComposePostingAsAuthor } from "./ComposePostingAs";
import { swapFadeProps } from "./composeSwapFade";
import styles from "./ComposePostingAs.module.css";

// ── Pieces of "Posting as" that move ────────────────────────────────────────
// The identity in the author row fades out and back in when the byline
// changes. The co-author picker below it lives in `ComposeCoAuthorPicker`, so
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
      // The institutional account wears the brand mark in place of letters.
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
