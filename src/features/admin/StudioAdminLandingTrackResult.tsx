import { m, useIsPresent } from "motion/react";
import { useId } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { tintForId } from "../studio/api/studio.adapters";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
} from "../studio/studioMotion";
import type { AdminStudioLandingTrackOptionDTO } from "./api/studioLandingAdmin.api";
import { ineligibleLabelKeyOf } from "./studioAdmin.model";
import { AdminChip } from "./ui";
import css from "./StudioAdminLanding.module.css";

/** One search result: the track, why it cannot be asked (an ineligible
 *  reason, or "Already asked"), and Ask the artist. */
export function StudioAdminLandingTrackResult({
  option,
  reason,
  isBusy,
  onAsk,
}: {
  option: AdminStudioLandingTrackOptionDTO;
  reason: string | null;
  isBusy: boolean;
  onAsk: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const chipsId = useId();
  const reasonKey = ineligibleLabelKeyOf(reason);
  const isUnpickable = reasonKey !== null || option.hasOpenPreview;
  return (
    <m.li
      layout="position"
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
    >
      <div className={css.result}>
        <span className={css.thumb}>
          <ImageSlot
            src={option.release.coverUrl ?? undefined}
            tint={tintForId(option.release.id)}
            width={44}
            height={44}
            radius={8}
            placeholder=""
          />
        </span>
        <div className={css.main}>
          <span className={css.rowTitle}>{option.track.title}</span>
          <span className={css.rowMeta}>
            {option.artist.name} · {option.release.title}
          </span>
          <div id={chipsId} className={css.chips}>
            {reasonKey && <AdminChip tone="amber">{t(reasonKey)}</AdminChip>}
            {option.hasOpenPreview && (
              <AdminChip tone="ghost">
                {t("admin:studioAdmin.landing.trackDialog.hasOpen")}
              </AdminChip>
            )}
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          aria-label={t("admin:studioAdmin.landing.trackDialog.askLabel", {
            track: option.track.title,
          })}
          aria-describedby={isUnpickable ? chipsId : undefined}
          aria-disabled={isUnpickable || isBusy || undefined}
          onClick={() => {
            if (!isUnpickable) onAsk();
          }}
        >
          {t("admin:studioAdmin.landing.trackDialog.askCta")}
        </Button>
      </div>
    </m.li>
  );
}
