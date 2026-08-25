import { useEffect, useRef, type RefObject } from "react";
import { FiMove } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { useCoverReposition } from "./useCoverReposition";
import styles from "./PersonaCoverReposition.module.css";
import type { SkinData } from "./api/subprofiles.api";

/**
 * The owner's in-page control for where the banner sits vertically — the same
 * gesture Notion gives a page cover.
 *
 * Hovering the banner reveals a "Reposition" pill; taking it turns the band
 * into a drag surface with a Cancel / Save bar. What the owner lands on is a
 * vertical `object-position` percentage, saved to `skinData.coverOffsetY` — an
 * override of the focal point the media crop otherwise supplies, and stored per
 * persona rather than on the image, so it never disturbs the same file used
 * elsewhere.
 *
 * Only mounted for `mode === "owner"` on a persona that actually has a cover;
 * a visitor's page never renders any of it.
 */
export function PersonaCoverReposition({
  subprofileId,
  skinData,
  baseOffsetY,
  coverRef,
}: {
  subprofileId: string;
  /** The persona's whole `skinData` blob. The PATCH replaces the column
   *  wholesale, so the save has to carry every other key back with it. */
  skinData: SkinData | null | undefined;
  /** Where the banner sits today: the saved offset, or the media crop's focal
   *  Y when the owner has never repositioned it. */
  baseOffsetY: number;
  coverRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { update } = useSubprofileMutations();
  const reposition = useCoverReposition(coverRef, baseOffsetY);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const wasActiveRef = useRef(false);

  // Taking the pill with a keyboard has to land somewhere that responds to one,
  // so hand focus to the slider the moment reposition mode opens — and hand it
  // back to the pill on the way out, since the element that had focus is the
  // one being unmounted. `wasActiveRef` keeps the return trip from firing on
  // first mount, which would steal focus from wherever the reader actually is.
  useEffect(() => {
    if (reposition.isActive) {
      wasActiveRef.current = true;
      surfaceRef.current?.focus();
    } else if (wasActiveRef.current) {
      wasActiveRef.current = false;
      pillRef.current?.focus();
    }
  }, [reposition.isActive]);

  async function save() {
    const coverOffsetY = Math.round(reposition.offsetY * 10) / 10;
    try {
      await update.mutateAsync({
        id: subprofileId,
        dto: { skinData: { ...(skinData ?? {}), coverOffsetY } },
      });
      reposition.finish();
      showToast(t("subprofiles:cover.reposition.saved"), "success");
    } catch {
      // The mutation is `silentError`, so this is the only word the owner gets.
      showToast(t("subprofiles:cover.reposition.error"), "error");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      reposition.cancel();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      void save();
      return;
    }
    if (reposition.nudge(event.key)) event.preventDefault();
  }

  if (!reposition.isActive) {
    return (
      <button
        ref={pillRef}
        type="button"
        className={styles.pill}
        onClick={reposition.start}
        disabled={!reposition.canReposition}
        // A banner with no vertical slack has nothing to move, so the control
        // says why rather than sitting there dead.
        aria-label={
          reposition.canReposition
            ? t("subprofiles:cover.reposition.cta")
            : t("subprofiles:cover.reposition.noRoomAria")
        }
      >
        <FiMove aria-hidden />
        <span>{t("subprofiles:cover.reposition.cta")}</span>
      </button>
    );
  }

  const value = Math.round(reposition.offsetY);

  return (
    <div className={styles.overlay}>
      <div
        ref={surfaceRef}
        className={styles.surface}
        data-dragging={reposition.isDragging || undefined}
        role="slider"
        tabIndex={0}
        aria-label={t("subprofiles:cover.reposition.sliderAria")}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={t("subprofiles:cover.reposition.valueText", {
          percent: value,
        })}
        onPointerDown={reposition.onPointerDown}
        onPointerMove={reposition.onPointerMove}
        onPointerUp={reposition.onPointerUp}
        onPointerCancel={reposition.onPointerUp}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.bar}>
        <span className={styles.hint}>
          {t("subprofiles:cover.reposition.hint")}
        </span>
        <Button
          type="button"
          variant="ghost-dark"
          size="sm"
          onClick={reposition.cancel}
          disabled={update.isPending}
        >
          {t("subprofiles:cover.reposition.cancel")}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => void save()}
          disabled={update.isPending}
        >
          {t(
            update.isPending
              ? "subprofiles:cover.reposition.saving"
              : "subprofiles:cover.reposition.save",
          )}
        </Button>
      </div>
    </div>
  );
}
