import { type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiEye, FiLink2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui";
import type { TFunction } from "../../../shared/i18n/types";
import { ForumCategoryBadge } from "../ForumCategoryBadge";
import { CONTENT_WARNINGS } from "./composeWarnings.data";
import type { ComposePhoto, ComposePoll } from "./composeThread.types";
import { COMPOSE_EASE } from "./composeMotion";
import styles from "./ComposePreviewCard.module.css";

// ── The preview card's optional sections ────────────────────────────────────
// Everything here comes and goes as the draft fills in, so each piece grows
// into place and the card eases taller. Only mounts, unmounts and state flips
// move: the text inside updates in place on every keystroke.

/**
 * A section of the card that can appear and disappear. The card spaces its
 * children with `gap`, which would snap by one gap as a collapsed slot mounts
 * or unmounts, so the slot cancels that gap and carries it inside instead,
 * where it grows and shrinks with the height (see `.slot` in the CSS).
 */
export function PreviewSlot({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  return (
    <Collapse isOpen={isOpen} className={styles.slot}>
      <div className={styles.slotInner}>{children}</div>
    </Collapse>
  );
}

export function PreviewBadges({
  category,
  tags,
  contentWarnings,
  translate,
}: {
  category: string | null;
  tags: readonly string[];
  contentWarnings: readonly string[];
  translate: TFunction;
}) {
  const { reducedMotion } = useMotionPrefs();
  const warningLabels = contentWarnings
    .map(
      (id) =>
        CONTENT_WARNINGS.find((warning) => warning.id === id)?.labelKey ?? null,
    )
    .filter((labelKey): labelKey is string => labelKey !== null)
    .map((labelKey) => translate(labelKey));
  // Each chip scales in where it lands, and a removed chip goes in one
  // frame. No layout animation: the row reflows like text, so a card that
  // moves because something above it changed carries every chip with it.
  const chipMotion = {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: reducedMotion ? 0 : 0.2, ease: COMPOSE_EASE },
  };
  return (
    <div className={styles.badges}>
      <AnimatePresence initial={false}>
        {category && (
          <m.span
            key={`category-${category}`}
            className={styles.badgeHolder}
            {...chipMotion}
          >
            <ForumCategoryBadge category={category} />
          </m.span>
        )}
        {warningLabels.length > 0 && (
          <m.span key="warning" className={styles.warningPill} {...chipMotion}>
            <FiEye aria-hidden="true" />
            {translate("forum:composePage.preview.contentWarningPill", {
              warnings: warningLabels.join(", "),
            })}
          </m.span>
        )}
        {tags.map((tag) => (
          <m.span key={`tag-${tag}`} className={styles.tag} {...chipMotion}>
            #{tag}
          </m.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** The photo strip. A new photo fades up into its place; a removed one
 *  lifts out of the row while the rest take the room back. */
export function PreviewPhotos({ photos }: { photos: readonly ComposePhoto[] }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <ul className={styles.photos}>
      <AnimatePresence initial={false} mode="popLayout">
        {photos.map((photo) => (
          <m.li
            key={photo.key}
            className={styles.photo}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{
              duration: reducedMotion ? 0 : 0.22,
              ease: COMPOSE_EASE,
            }}
          >
            <img src={photo.previewUrl} alt={photo.alt} />
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function PreviewPoll({
  poll,
  translate,
}: {
  poll: ComposePoll;
  translate: TFunction;
}) {
  return (
    <div className={styles.poll}>
      {/* Keyed by the option's position in the list, so typing into an
          option updates its bar in place and only a new or emptied option
          grows or folds. */}
      {poll.options.map((option, optionIndex) => (
        <PreviewSlot key={optionIndex} isOpen={option.trim().length > 0}>
          <p className={styles.pollBar}>
            <span>{option}</span>
          </p>
        </PreviewSlot>
      ))}
      <p className={styles.pollNote}>
        {translate(
          poll.allowMultiple
            ? "forum:composePage.preview.pollPickMany"
            : "forum:composePage.preview.pollPickOne",
        )}
        <span className={styles.metaDot} aria-hidden="true" />
        {translate("forum:composePage.preview.pollNoVotes")}
      </p>
    </div>
  );
}

export function LinkUnfurlPlaceholder({
  host,
  translate,
}: {
  host: string;
  translate: TFunction;
}) {
  return (
    <div className={styles.unfurl}>
      <div className={styles.unfurlThumb} aria-hidden="true" />
      <div className={styles.unfurlBody}>
        <span className={styles.unfurlHost}>
          <FiLink2 aria-hidden="true" />
          {host}
        </span>
        <span className={styles.unfurlNote}>
          {translate("forum:composePage.preview.linkUnfurlPlaceholder")}
        </span>
      </div>
    </div>
  );
}
