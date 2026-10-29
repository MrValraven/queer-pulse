import { useState } from "react";
import { m } from "motion/react";
import { MdDragIndicator } from "react-icons/md";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCurationShelf } from "../studio/api/studio.types";
import { tintForId } from "../studio/api/studio.adapters";
import { StudioReleaseCoverArt } from "../studio/StudioReleaseCoverArt";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { ageOf } from "./studioAdmin.model";
import { StudioAdminPickTileActions } from "./StudioAdminPickTileActions";
import { StudioAdminAddNoteLink } from "./StudioAdminShelfParts";
import { AdminChip } from "./ui";
import { useStudioAdminCoverReveal } from "./useStudioAdminCoverReveal";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./StudioAdminShelves.module.css";

/** The id a dragged pick carries, one type per shelf, so a sleeve dragged
 *  from Staff picks finds no drop target on New this week. */
function pickDragTypeOf(shelf: Exclude<StudioCurationShelf, "featured">) {
  return `application/x-studio-admin-pick-${shelf}`;
}

/** One pick as a record sleeve: the cover (the drag handle) with its
 *  position, the title, artist, note (or an Add a note link), age, a chip
 *  when members cannot hear it, and a strip of four icon actions. The whole
 *  tile takes the drop. */
export function StudioAdminPickTile({
  pick,
  shelf,
  index,
  count,
  shelfLabel,
  isBusy,
  onMove,
  onDropAt,
  onEditNote,
  onRemove,
}: {
  pick: AdminStudioPickDTO;
  shelf: Exclude<StudioCurationShelf, "featured">;
  index: number;
  count: number;
  shelfLabel: string;
  isBusy: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedPickId: string) => void;
  onEditNote: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
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
  } = useStudioAdminReorderRow({
    dragType: pickDragTypeOf(shelf),
    itemId: pick.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  // Read once on mount: the age is a coarse label, so a render keeps it.
  const [nowMs] = useState(() => Date.now());
  const { release } = pick;
  const title = release.title;
  const age = ageOf(pick.createdAt, nowMs);
  const { isCoverLoaded, onCoverLoad } = useStudioAdminCoverReveal(
    release.coverUrl,
  );

  return (
    <m.li
      layout="position"
      className={css.tileCell}
      initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
      {...dropProps}
    >
      <div className={css.tile}>
        <div
          className={css.tileSleeve}
          aria-hidden
          title={t("admin:studioAdmin.dragAria", { name: title })}
          data-cover-loaded={isCoverLoaded || undefined}
          onLoad={onCoverLoad}
          {...handleProps}
        >
          <StudioReleaseCoverArt
            src={release.coverUrl}
            title={title}
            format={release.format ?? "music"}
            tint={tintForId(release.id)}
            radius={12}
          />
          <span className={css.tilePosition}>{index + 1}</span>
          {/* Always drawn; the CSS fades it in on a draggable sleeve. */}
          <span className={css.tileGrip}>
            <MdDragIndicator />
          </span>
        </div>
        <div className={css.tileBody}>
          <span className={css.tileTitle} title={title}>
            {title}
          </span>
          <span className={css.tileArtist}>{release.artist.name}</span>
          {pick.note ? (
            <span className={css.tileNote}>{pick.note}</span>
          ) : (
            <StudioAdminAddNoteLink
              title={title}
              className={css.tileAddNote}
              onClick={onEditNote}
            />
          )}
          <span className={css.tileAge}>
            {t("admin:studioAdmin.pick.added", {
              age: fmt.relativeTime(-age.value, age.unit),
            })}
          </span>
          <Collapse isOpen={!pick.isListenable} className={css.tileChipFold}>
            <AdminChip tone="amber" className={css.tileChip}>
              {t("admin:studioAdmin.pick.notListenable")}
            </AdminChip>
          </Collapse>
        </div>
        <StudioAdminPickTileActions
          title={title}
          shelfLabel={shelfLabel}
          isBusy={isBusy}
          isFirst={isFirst}
          isLast={isLast}
          hasNote={Boolean(pick.note)}
          moveUpRef={moveUpRef}
          moveDownRef={moveDownRef}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onEditNote={onEditNote}
          onRemove={onRemove}
        />
      </div>
    </m.li>
  );
}
