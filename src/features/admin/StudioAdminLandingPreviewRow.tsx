import { m, useIsPresent } from "motion/react";
import { FiArrowDown, FiArrowUp, FiMenu, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { tintForId } from "../studio/api/studio.adapters";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
} from "../studio/studioMotion";
import type { AdminStudioLandingPreviewDTO } from "./api/studioLandingAdmin.api";
import { StudioAdminLandingPreviewInfo } from "./StudioAdminLandingPreviewInfo";
import type { StudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./StudioAdminLanding.module.css";

/** One preview request: cover, text and actions. An open row carries
 *  `reorder` (drag handle, Move up, Move down); an answered row passes
 *  null. */
export function StudioAdminLandingPreviewRow({
  preview,
  reorder,
  isBusy = false,
  onRemove,
}: {
  preview: AdminStudioLandingPreviewDTO;
  reorder: StudioAdminReorderRow | null;
  isBusy?: boolean;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const trackTitle = preview.track.title;
  // Destructured so the React compiler sees the two refs apart from the
  // plain values and handlers it reads during render.
  const {
    moveUpRef,
    moveDownRef,
    moveUp,
    moveDown,
    isFirst,
    isLast,
    handleProps,
    dropProps,
  }: Partial<StudioAdminReorderRow> = reorder ?? {};

  return (
    <m.li
      layout="position"
      className={css.rowItem}
      inert={!isPresent || undefined}
      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
      animate={{
        opacity: 1,
        height: "auto",
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        opacity: 0,
        height: 0,
        overflow: "hidden",
        transition: reducedMotion ? { duration: 0 } : STUDIO_DISCLOSURE_EXIT,
      }}
      transition={reducedMotion ? { duration: 0 } : STUDIO_DISCLOSURE}
      {...dropProps}
    >
      <div className={css.row}>
        {reorder && (
          <>
            <span
              className={css.dragHandle}
              aria-hidden
              title={t("admin:studioAdmin.dragAria", { name: trackTitle })}
              {...handleProps}
            >
              <FiMenu />
            </span>
            <span className={css.position} aria-hidden>
              {preview.position}
            </span>
          </>
        )}
        <span className={css.thumb}>
          <ImageSlot
            src={preview.release.coverUrl ?? undefined}
            tint={tintForId(preview.release.id)}
            width={44}
            height={44}
            radius={8}
            placeholder=""
          />
        </span>
        <StudioAdminLandingPreviewInfo preview={preview} />
        <div className={css.actions}>
          {reorder && (
            <>
              <Button
                ref={moveUpRef}
                variant="ghost"
                size="sm"
                aria-label={t("admin:studioAdmin.moveUpAria", {
                  name: trackTitle,
                })}
                aria-disabled={isBusy || isFirst || undefined}
                onClick={moveUp}
              >
                <FiArrowUp aria-hidden /> {t("admin:studioAdmin.moveUpCta")}
              </Button>
              <Button
                ref={moveDownRef}
                variant="ghost"
                size="sm"
                aria-label={t("admin:studioAdmin.moveDownAria", {
                  name: trackTitle,
                })}
                aria-disabled={isBusy || isLast || undefined}
                onClick={moveDown}
              >
                <FiArrowDown aria-hidden /> {t("admin:studioAdmin.moveDownCta")}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("admin:studioAdmin.landing.previews.removeLabel", {
              track: trackTitle,
            })}
            aria-disabled={isBusy || undefined}
            data-preview-remove
            onClick={onRemove}
          >
            <FiX aria-hidden />{" "}
            {t("admin:studioAdmin.landing.previews.removeCta")}
          </Button>
        </div>
      </div>
    </m.li>
  );
}
