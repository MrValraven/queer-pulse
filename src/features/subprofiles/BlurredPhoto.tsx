import { useEffect, useId, useRef, type ReactNode } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePhotoReveal } from "./photoReveal";
import styles from "./BlurredPhoto.module.css";

/**
 * One wrapper for every picture the artist blurs. The blur holds on every
 * render path because each one wraps its image here. Concealed media leaves the
 * accessibility tree (aria-hidden plus inert) and an overlay button uncovers
 * it, announced with aria-expanded like the forum's content warning.
 */
export function BlurredPhoto({
  isBlurred,
  revealKey,
  isRevealable = true,
  children,
  className,
}: {
  isBlurred: boolean;
  revealKey: string;
  /** false: a static blur with no control, for thumbnails inside another link or row. */
  isRevealable?: boolean;
  /** The image node (an ImageSlot). */
  children: ReactNode;
  className?: string;
}) {
  if (!isBlurred) {
    return (
      <span className={[styles.plain, className].filter(Boolean).join(" ")}>
        {children}
      </span>
    );
  }
  // The key remounts the frame for a different photo, so a new photo always
  // paints already concealed with no blur-in transition.
  return (
    <BlurredFrame
      key={revealKey}
      revealKey={revealKey}
      isRevealable={isRevealable}
      className={className}
    >
      {children}
    </BlurredFrame>
  );
}

function BlurredFrame({
  revealKey,
  isRevealable,
  children,
  className,
}: {
  revealKey: string;
  isRevealable: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  const mediaId = useId();
  const noteId = useId();
  const { isRevealed, reveal, conceal } = usePhotoReveal(revealKey);
  const showButtonRef = useRef<HTMLButtonElement>(null);
  const hideButtonRef = useRef<HTMLButtonElement>(null);
  // Set by the click on this copy, so other copies sharing the reveal never
  // steal focus.
  const focusTargetRef = useRef<"show" | "hide" | null>(null);

  const isConcealed = !(isRevealable && isRevealed);

  useEffect(() => {
    const focusTarget = focusTargetRef.current;
    if (!focusTarget) return;
    focusTargetRef.current = null;
    (focusTarget === "hide" ? hideButtonRef : showButtonRef).current?.focus();
  }, [isConcealed]);

  const wrapperClass = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <div className={wrapperClass}>
      <div
        id={mediaId}
        className={styles.media}
        data-concealed={isConcealed ? "" : undefined}
        aria-hidden={isConcealed ? "true" : undefined}
        inert={isConcealed}
      >
        {children}
      </div>
      {isRevealable ? (
        <>
          <div
            className={styles.overlay}
            data-visible={isConcealed ? "" : undefined}
            aria-hidden={isConcealed ? undefined : "true"}
            inert={!isConcealed}
          >
            <span id={noteId} className={styles.note} aria-hidden="true">
              {t("subprofiles:tattoo.photo.blurredNote")}
            </span>
            <button
              ref={showButtonRef}
              type="button"
              className={styles.showButton}
              aria-expanded={false}
              aria-controls={mediaId}
              aria-describedby={noteId}
              onClick={() => {
                focusTargetRef.current = "hide";
                reveal();
              }}
            >
              <FiEye aria-hidden="true" />
              {t("subprofiles:tattoo.photo.show")}
            </button>
          </div>
          <button
            ref={hideButtonRef}
            type="button"
            className={styles.hideButton}
            data-visible={isConcealed ? undefined : ""}
            aria-label={t("subprofiles:tattoo.photo.hide")}
            aria-expanded={!isConcealed}
            aria-controls={mediaId}
            aria-hidden={isConcealed ? "true" : undefined}
            tabIndex={isConcealed ? -1 : undefined}
            inert={isConcealed}
            onClick={() => {
              focusTargetRef.current = "show";
              conceal();
            }}
          >
            <FiEyeOff aria-hidden="true" />
            <span className={styles.hideLabel}>
              {t("subprofiles:tattoo.photo.hide")}
            </span>
          </button>
        </>
      ) : null}
    </div>
  );
}
