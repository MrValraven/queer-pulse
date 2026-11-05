import { useState } from "react";
import { imagePixelRatio, resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { accentStyle } from "./subprofilePresence.data";
import type {
  CreditFaceView,
  PortraitCreditsView,
} from "./api/directoryCard.adapters";
import styles from "./SubprofilePortraitCard.module.css";

/** The CSS size of a face on a wide card; compact mode draws them smaller. */
const FACE_SIZE = 26;
const MAX_FACES = 3;

export interface SubprofilePortraitCardCreditsProps {
  credits: PortraitCreditsView;
  /** False for an unlinked persona. A member's face never shows on an
   *  unlinked persona's card, whatever the payload carries. */
  isLinked: boolean;
}

/** One face: the avatar, else the initials on the counterpart's accent. */
function CreditFace({ face }: { face: CreditFaceView }) {
  // The src that failed to load, so a broken file falls back to the initials.
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const resolvedSrc = resolveAvatarSrc(
    face.avatarUrl ?? undefined,
    Math.round(FACE_SIZE * imagePixelRatio()),
    { isFaceCrop: true },
  );
  const hasImage = Boolean(resolvedSrc) && face.avatarUrl !== failedAvatarUrl;
  return (
    <span className={styles.face} style={accentStyle(face.accent)}>
      {hasImage ? (
        <img
          className={styles.faceImage}
          src={resolvedSrc}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedAvatarUrl(face.avatarUrl)}
        />
      ) : (
        face.initials
      )}
    </span>
  );
}

/**
 * "Credited with N people" with up to three mini faces before it. The faces
 * are decorative (the line carries the count); nothing renders at 0. Compact
 * mode swaps the line for the short "N credits".
 */
export function SubprofilePortraitCardCredits({
  credits,
  isLinked,
}: SubprofilePortraitCardCreditsProps) {
  const { t } = useTranslation();
  if (credits.count <= 0) return null;
  const visibleFaces = credits.faces
    .filter((face) => isLinked || face.kind !== "member")
    .slice(0, MAX_FACES);

  return (
    <p className={styles.credits}>
      {visibleFaces.length > 0 && (
        <span className={styles.faces} aria-hidden>
          {visibleFaces.map((face) => (
            <CreditFace key={face.key} face={face} />
          ))}
        </span>
      )}
      <span className={`${styles.creditLine} ${styles.creditLong}`}>
        {t("subprofiles:directory.card.creditLine", { count: credits.count })}
      </span>
      <span className={`${styles.creditLine} ${styles.creditShort}`}>
        {t("subprofiles:directory.card.creditShort", { count: credits.count })}
      </span>
    </p>
  );
}
