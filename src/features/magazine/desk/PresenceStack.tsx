import { useMemo } from "react";
import { FiEye } from "react-icons/fi";
import { Avatar } from "../../../shared/components/ui";
import { intlLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Viewer } from "../api/useDeskPresence";
import styles from "./PresenceStack.module.css";

export interface PresenceStackProps {
  viewers: Viewer[];
  /** Avatar diameter in px; rows use the default, the peek panel can go up. */
  size?: number;
  className?: string;
}

/** Past this many faces the stack stops growing and shows "+N". */
const MAX_VISIBLE_VIEWERS = 3;

/**
 * The small overlapping faces on a piece row or in the peek panel that say
 * another editor has this piece open right now, so nobody reworks a draft a
 * colleague is already in. A small eye leads the faces so the mark reads as
 * "someone is looking" without a hover. The faces are neutral (the plum
 * tint, paper-ringed apart): coral is the Write colour and amber the
 * writer's, so colour here would claim a meaning it does not have. The whole
 * stack is one labelled image for screen readers ("Marta Cruz and Sara
 * Pinheiro viewing"); the eye, faces and "+N" are decoration for it. Renders
 * nothing when nobody else is here.
 *
 * Built on `Avatar` directly: the shared `AvatarStack` has a fixed 10px
 * overlap and no "+N" overflow or group label, which this stack needs.
 */
export function PresenceStack({
  viewers,
  size = 22,
  className,
}: PresenceStackProps) {
  const { t, language } = useTranslation();

  const names = useMemo(
    () =>
      new Intl.ListFormat(intlLocale(language), {
        style: "long",
        type: "conjunction",
      }).format(viewers.map((viewer) => viewer.name)),
    [language, viewers],
  );

  if (viewers.length === 0) return null;

  const visibleViewers = viewers.slice(0, MAX_VISIBLE_VIEWERS);
  const hiddenCount = viewers.length - visibleViewers.length;
  const label = t("magazine:desk.presence.viewing", { names });

  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={label}
      title={label}
    >
      <FiEye aria-hidden className={styles.eye} />
      {visibleViewers.map((viewer) => (
        <Avatar
          key={viewer.userId}
          className={styles.face}
          initials={viewer.initials}
          tint="plum"
          size={size}
          aria-hidden
        />
      ))}
      {hiddenCount > 0 && (
        <span className={styles.more} aria-hidden>
          {t("magazine:desk.presence.more", { count: hiddenCount })}
        </span>
      )}
    </div>
  );
}
