import { useEffect, useId, useRef, type RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import type { ListingPhotoFraming } from "./api/directory.api";
import {
  GALLERY_HERO_PX,
  GALLERY_THUMB_PX,
  type GalleryShot,
} from "./directoryGalleryShots";
import { DirectoryGalleryZoomStrip } from "./DirectoryGalleryZoomStrip";
import { photoFramingStyle } from "./photoFramingGeometry";
import { useRepositionFrameGestures } from "./useRepositionFrameGestures";
import pageStyles from "./DirectorySpacePage.module.css";

export interface DirectoryGalleryFrameProps {
  shot: GalleryShot;
  index: number;
  count: number;
  variant: "hero" | "thumb";
  framing: ListingPhotoFraming;
  isEditing: boolean;
  isLocked: boolean;
  onOpen: () => void;
  onFramingChange: (framing: ListingPhotoFraming) => void;
}

/**
 * The "Reposition photos" button folds away the moment edit mode starts, so
 * the hero frame takes focus on that switch and keyboard users land on the
 * first photo to move. The first render is skipped, so a page that loads
 * straight into edit mode leaves focus where it is, and the focus call keeps
 * the page scroll still.
 */
function useFocusOnEditStart(
  frameRef: RefObject<HTMLDivElement | null>,
  isEditing: boolean,
  shouldFocus: boolean,
) {
  const wasEditingRef = useRef(isEditing);
  useEffect(() => {
    const wasEditing = wasEditingRef.current;
    wasEditingRef.current = isEditing;
    if (shouldFocus && isEditing && !wasEditing)
      frameRef.current?.focus({ preventScroll: true });
  }, [frameRef, isEditing, shouldFocus]);
}

/**
 * One gallery photo drawn with its saved framing. View mode lays a transparent
 * button over the photo that opens the lightbox; edit mode turns the same
 * element into a focusable frame the manager drags, pinches and nudges with
 * the arrow keys, with a zoom slider along its bottom edge. The `<img>` keeps
 * its place in the tree across both modes, so toggling edit mode never
 * reloads it. The photo itself is hidden from assistive tech: its name lives
 * once, on the open button in view mode and on the frame group in edit mode.
 */
export function DirectoryGalleryFrame({
  shot,
  index,
  count,
  variant,
  framing,
  isEditing,
  isLocked,
  onOpen,
  onFramingChange,
}: DirectoryGalleryFrameProps) {
  const { t } = useTranslation();
  const hintId = useId();
  const isHero = variant === "hero";
  const { frameRef, imageRef, isDragging, frameHandlers } =
    useRepositionFrameGestures({
      framing,
      onFramingChange,
      isEnabled: isEditing && !isLocked,
    });
  useFocusOnEditStart(frameRef, isEditing, isHero);

  const position = { index: index + 1, count };
  const frameLabel = shot.alt
    ? t("marketing:directory.detail.reposition.frameAria", {
        ...position,
        alt: shot.alt,
      })
    : t("marketing:directory.detail.reposition.frameAriaNoAlt", position);
  return (
    /* Composite pan and zoom surface, as in ImageReframer: drag is the
       primary gesture and the arrow keys are its keyboard fallback. No ARIA
       widget role models a 2D pan, so the frame keeps a labelled role="group",
       and the labelled zoom range input inside it is the standard keyboard
       control. */
    <div
      ref={frameRef}
      className={[
        isHero ? pageStyles.photoHero : pageStyles.thumb,
        isEditing && pageStyles.frameEditing,
        isDragging && pageStyles.frameDragging,
      ]
        .filter(Boolean)
        .join(" ")}
      role={isEditing ? "group" : undefined}
      tabIndex={isEditing ? 0 : undefined}
      aria-label={isEditing ? frameLabel : undefined}
      aria-describedby={isEditing ? hintId : undefined}
      {...(isEditing ? frameHandlers : {})}
    >
      <div className={pageStyles.frameClip} aria-hidden="true">
        <img
          ref={imageRef}
          src={resolveAvatarSrc(
            shot.url,
            isHero ? GALLERY_HERO_PX : GALLERY_THUMB_PX,
          )}
          alt={shot.alt}
          style={photoFramingStyle(framing)}
          draggable={false}
          loading={isHero ? "eager" : "lazy"}
          {...(isHero ? { fetchPriority: "high" as const } : {})}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
      {/* Both stay mounted in either mode. The open button is a clear
          overlay, so `hidden` takes it out of the tab order, the pointer path
          and the accessibility tree with nothing visible changing. */}
      <button
        type="button"
        className={pageStyles.frameOpen}
        onClick={onOpen}
        hidden={isEditing}
        aria-label={shot.alt || t("marketing:directory.detail.viewPhoto")}
      />
      <span id={hintId} className="visuallyHidden" hidden={!isEditing}>
        {t("marketing:directory.detail.reposition.frameHint")}
      </span>
      <DirectoryGalleryZoomStrip
        isVisible={isEditing}
        isLocked={isLocked}
        index={index}
        framing={framing}
        onFramingChange={onFramingChange}
      />
    </div>
  );
}
