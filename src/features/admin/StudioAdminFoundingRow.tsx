import { m, useIsPresent } from "motion/react";
import { FiArrowDown, FiArrowUp, FiMenu, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import type { AdminStudioFoundingArtistDTO } from "./api/studioLandingAdmin.api";
import { AdminAvatar, AdminChip } from "./ui";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./StudioAdminFounding.module.css";

/** The id a dragged founding artist carries, kept apart from anything else
 *  dropped. */
const FOUNDING_DRAG_TYPE = "application/x-studio-admin-founding";

const ADDED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/** One founding artist: drag handle, position, avatar, name, the day they
 *  were added, a chip when they cannot appear right now, and Move up, Move
 *  down and Remove. */
export function StudioAdminFoundingRow({
  listed,
  index,
  count,
  isBusy,
  onMove,
  onDropAt,
  onRemove,
}: {
  listed: AdminStudioFoundingArtistDTO;
  index: number;
  count: number;
  isBusy: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedId: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  // Destructured so the compiler sees the two refs apart from the plain
  // values and handlers read during render.
  const {
    moveUpRef,
    moveDownRef,
    moveUp,
    moveDown,
    isFirst,
    isLast,
    handleProps,
    dropProps,
  } = useStudioAdminReorderRow({
    dragType: FOUNDING_DRAG_TYPE,
    itemId: listed.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  const { artist } = listed;

  return (
    <m.li
      layout="position"
      className={css.row}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      inert={!isPresent || undefined}
      {...dropProps}
    >
      <span
        className={css.dragHandle}
        aria-hidden
        title={t("admin:studioAdmin.dragAria", { name: artist.name })}
        {...handleProps}
      >
        <FiMenu />
      </span>
      <span className={css.position} aria-hidden>
        {index + 1}
      </span>
      <div className={css.identity}>
        <AdminAvatar
          size="md"
          src={artist.avatarUrl ?? undefined}
          initials={initialsFromName(artist.name, "?")}
          alt=""
        />
        <div className={css.identityText}>
          <span className={css.name}>{artist.name}</span>
          {artist.handle && <span className={css.meta}>@{artist.handle}</span>}
          <span className={css.meta}>
            {t("admin:studioAdmin.founding.addedOn", {
              date: fmt.date(new Date(listed.createdAt), ADDED_DATE_OPTIONS),
            })}
          </span>
          {!listed.isListed && (
            <span className={css.chips}>
              <AdminChip tone="amber">
                {t("admin:studioAdmin.founding.notListed")}
              </AdminChip>
            </span>
          )}
        </div>
      </div>
      <div className={css.actions}>
        <Button
          ref={moveUpRef}
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.moveUpAria", { name: artist.name })}
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
            name: artist.name,
          })}
          aria-disabled={isBusy || isLast || undefined}
          onClick={moveDown}
        >
          <FiArrowDown aria-hidden /> {t("admin:studioAdmin.moveDownCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.founding.removeLabel", {
            name: artist.name,
          })}
          aria-disabled={isBusy || undefined}
          data-founding-remove
          onClick={() => {
            if (!isBusy) onRemove();
          }}
        >
          <FiX aria-hidden /> {t("admin:studioAdmin.founding.removeCta")}
        </Button>
      </div>
    </m.li>
  );
}
