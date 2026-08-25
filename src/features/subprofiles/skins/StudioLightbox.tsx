import { useRef } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useScrollLock } from "../../../shared/hooks";
import { ImageSlot } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { workMeta } from "../personaSkinRender";
import { useLightboxDialog } from "../useLightboxDialog";
import { WorkRightsFooter } from "../rights/WorkRightsFooter";
import type { SubprofileItemView } from "../api/subprofiles.adapters";

export interface StudioLightboxProps {
  /** The same flattened work list `StudioChecklist`/the studio `ItemTile`
   *  index into (see `getStudioWorks` in `studioWorks.ts`). */
  items: SubprofileItemView[];
  index: number;
  onClose: () => void;
  /** `-1` for previous, `1` for next — the caller owns/clamps the index. */
  onMove: (delta: number) => void;
  /** The persona's public display name, used as the `WorkRightsFooter`
   *  copyright holder for the item currently shown. */
  authorName: string;
}

/**
 * The studio skin's full-bleed image lightbox: fixed overlay, `role="dialog"`
 * with a focus-trap, Esc to close, ←/→ to move. `prefers-reduced-motion` is
 * handled globally (see `src/styles/base.css`'s `@media (prefers-reduced-
 * motion: reduce)` block, which already collapses `.lightbox`'s `fadeIn`) —
 * this component adds no JS-driven motion of its own, so there's nothing
 * extra to gate here.
 *
 * `items` only ever draws from `VISUAL_SECTIONS` (see `getStudioWorks`),
 * which never includes `"poems"`. The `section !== "poems"` guard on
 * `WorkRightsFooter` below is defensive only.
 *
 * This is one of the two single-work surfaces that still carry their own
 * `WorkRightsFooter` (the other is `PoemReaderModal`): exactly one work is on
 * screen, so the notice is about that work rather than repeated page furniture.
 * The persona page itself shows one `PersonaRightsFooter` at the end instead.
 */
export function StudioLightbox({
  items,
  index,
  onClose,
  onMove,
  authorName,
}: StudioLightboxProps) {
  const { t } = useTranslation();
  useScrollLock();
  const dialogRef = useRef<HTMLDivElement>(null);
  const item = items[index];

  useLightboxDialog(dialogRef, { onClose, onMove });

  if (!item) return null;

  const meta = workMeta(item);
  const plateLabel = t("subprofiles:skinExtras.studio.plateLabel", {
    n: String(index + 1).padStart(2, "0"),
  });

  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <button
        type="button"
        className="lb-x"
        onClick={onClose}
        aria-label={t("shared:modal.close")}
      >
        <FiX />
      </button>
      {items.length > 1 && (
        <button
          type="button"
          className="lb-arrow left"
          onClick={() => onMove(-1)}
          aria-label={t("subprofiles:skinExtras.studio.previous")}
        >
          <FiChevronLeft />
        </button>
      )}
      <figure className="lb-figure">
        <div className="lb-art">
          <ImageSlot
            src={item.imageUrl || undefined}
            alt={item.title}
            radius={0}
            height="100%"
            tint="plum"
          />
        </div>
        <figcaption>
          <span className="plate-n">{plateLabel}</span>
          <b>{item.title}</b>
          {meta && <span>{meta}</span>}
          {item.description && <p>{item.description}</p>}
          {item.section !== "poems" && (
            <WorkRightsFooter authorName={authorName} createdAtISO={item.createdAt} />
          )}
        </figcaption>
      </figure>
      {items.length > 1 && (
        <button
          type="button"
          className="lb-arrow right"
          onClick={() => onMove(1)}
          aria-label={t("subprofiles:skinExtras.studio.next")}
        >
          <FiChevronRight />
        </button>
      )}
      <div className="lb-count">
        {index + 1} / {items.length}
      </div>
    </div>,
    document.body,
  );
}
