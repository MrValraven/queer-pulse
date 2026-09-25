import { AnimatePresence, m } from "motion/react";
import { FiUsers } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { TFunction } from "../../../shared/i18n/types";
import { ForumAvatar } from "../ForumAuthor";
import type { ComposeAudience } from "./composeThread.types";
import type { ComposePreviewAuthor } from "./ComposePreviewCard";
import { swapStackFadeProps } from "./composeSwapFade";
import styles from "./ComposePreviewCard.module.css";

// ── The preview card's byline and audience line ─────────────────────────────
// Both change when a switch flips (posting as official or
// anonymous, crediting a co-author, cross-posting), so both fade: the old
// identity fades out where it sits, then the new one fades in in its place.
// Old and new share one grid cell, so the cell holds the old one's size until
// it has gone and the meta beside it never jumps into the gap. Only opacity
// moves, so nothing drifts while the card itself is moving.

export function PreviewByline({
  isOfficial,
  isAnonymous,
  author,
  coAuthorName,
  translate,
  replyCount,
}: {
  isOfficial: boolean;
  isAnonymous: boolean;
  author: ComposePreviewAuthor;
  coAuthorName?: string;
  translate: TFunction;
  replyCount: string;
}) {
  const { reducedMotion } = useMotionPrefs();
  // Official and anonymous are mutually exclusive, and the hook's setters are
  // what enforce that; this only reflects whichever one is set.
  const anonymousName = translate("forum:composePage.preview.anonymousName");
  const person = isOfficial
    ? {
        // The institutional account wears the brand mark, so `ForumAvatar`
        // never reaches for initials here.
        initials: "",
        name: translate("forum:composePage.preview.officialName"),
        official: true,
      }
    : isAnonymous
      ? { initials: anonymousName.slice(0, 1), name: anonymousName }
      : { initials: author.initials, name: author.name, photo: author.photo };
  const identityKey = isOfficial
    ? "official"
    : isAnonymous
      ? "anonymous"
      : `author-${coAuthorName ?? ""}`;
  return (
    <p className={styles.byline}>
      <span className={styles.swapStack}>
        <AnimatePresence initial={false}>
          <m.span
            key={identityKey}
            className={styles.bylineWho}
            {...swapStackFadeProps(reducedMotion)}
          >
            <ForumAvatar className={styles.bylineAvatar} person={person} />
            <span className={styles.bylineName}>{person.name}</span>
            {isOfficial && (
              <span className={styles.bylineVia}>
                {translate("forum:composePage.preview.officialVia", {
                  name: author.name,
                })}
              </span>
            )}
            {!isOfficial && !isAnonymous && coAuthorName && (
              <span className={styles.bylineVia}>
                {translate("forum:composePage.preview.withCoAuthor", {
                  name: coAuthorName,
                })}
              </span>
            )}
          </m.span>
        </AnimatePresence>
      </span>
      <span className={styles.bylineMeta}>
        <span className={styles.metaDot} aria-hidden="true" />
        <span>{translate("forum:time.justNow")}</span>
        <span className={styles.metaDot} aria-hidden="true" />
        <span>
          {translate("forum:repliesCount", {
            count: 0,
            formatted: replyCount,
          })}
        </span>
      </span>
    </p>
  );
}

/** Who will be able to read this, said the way the published card says it.
 *  Fades out, then in with the new sentence, when the audience changes; the
 *  old sentence holds the line's height until it has gone. */
export function PreviewAudience({
  community,
  isCrossPosted,
  translate,
  formatNumber,
}: {
  community: ComposeAudience | null;
  isCrossPosted: boolean;
  translate: TFunction;
  formatNumber: (value: number) => string;
}) {
  const { reducedMotion } = useMotionPrefs();
  const line = audienceLine(community, isCrossPosted, translate, formatNumber);
  return (
    <p className={styles.audience}>
      <FiUsers aria-hidden="true" />
      <span className={styles.swapStack}>
        <AnimatePresence initial={false}>
          <m.span key={line} {...swapStackFadeProps(reducedMotion)}>
            {line}
          </m.span>
        </AnimatePresence>
      </span>
    </p>
  );
}

function audienceLine(
  community: ComposeAudience | null,
  isCrossPosted: boolean,
  translate: TFunction,
  formatNumber: (value: number) => string,
): string {
  if (!community) return translate("forum:composePage.preview.seenByEveryone");
  if (isCrossPosted)
    return translate("forum:composePage.preview.seenByEveryoneAndCommunity", {
      community: community.name,
    });
  if (community.memberCount === undefined)
    return translate("forum:composePage.preview.seenByCommunity", {
      community: community.name,
    });
  return translate("forum:composePage.preview.seenByCommunityMembers", {
    count: community.memberCount,
    formatted: formatNumber(community.memberCount),
    community: community.name,
  });
}
