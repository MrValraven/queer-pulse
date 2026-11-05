import { useState } from "react";
import { m } from "motion/react";
import { FiMonitor } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  PersonaWallPickDTO,
  PersonaWallPublicState,
} from "../../subprofiles/api/personaWall.api";
import { AdminChip } from "../ui";
import { useStudioAdminReorderRow } from "../useStudioAdminReorderRow";
import {
  PERSONA_WALL_ROW_DURATION_S,
  PERSONA_WALL_ROW_SCALE_FROM,
} from "./personaWallAdmin.data";
import {
  PERSONA_WALL_DRAG_TYPE,
  PERSONA_WALL_STATE_CHIP_KEY,
  PERSONA_WALL_STATE_REASON_KEY,
  personaKindLabelKey,
} from "./personaWallAdmin.model";
import { PersonaWallPickRowActions } from "./PersonaWallPickRowActions";
import { PersonaWallThumb } from "./PersonaWallThumb";
import css from "./PersonaWallPicks.module.css";

type HiddenPersonaWallState = Exclude<PersonaWallPublicState, "shown">;

/** One pick: the picture (the drag handle), its position, name and kind, a
 *  state chip with the reason while the public wall skips it, a "Desktop
 *  only" chip when a phone leaves it out, and three icon actions. The whole
 *  row takes the drop. */
export function PersonaWallPickRow({
  pick,
  index,
  count,
  isBusy,
  isDesktopOnly,
  onMove,
  onDropAt,
  onRemove,
}: {
  pick: PersonaWallPickDTO;
  index: number;
  count: number;
  isBusy: boolean;
  isDesktopOnly: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedId: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
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
    dragType: PERSONA_WALL_DRAG_TYPE,
    itemId: pick.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  const { persona, publicState } = pick;
  const name = persona.displayName;
  const kindLabelKey = personaKindLabelKey(persona.kind);
  // The last hidden state stays drawn while its fold closes, so the chip
  // and its reason leave with the fold.
  const hiddenState = publicState === "shown" ? null : publicState;
  const [lastHiddenState, setLastHiddenState] =
    useState<HiddenPersonaWallState | null>(hiddenState);
  if (hiddenState !== null && hiddenState !== lastHiddenState)
    setLastHiddenState(hiddenState);
  const shownHiddenState = hiddenState ?? lastHiddenState;
  const scaleFrom = reducedMotion ? 1 : PERSONA_WALL_ROW_SCALE_FROM;

  return (
    <m.li
      layout="position"
      className={css.row}
      initial={{ opacity: 0, scale: scaleFrom }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: scaleFrom }}
      transition={{ duration: reducedMotion ? 0 : PERSONA_WALL_ROW_DURATION_S }}
      {...dropProps}
    >
      <div
        className={css.thumbWrap}
        aria-hidden
        title={t("admin:personaWall.row.dragTitle", { name })}
        {...handleProps}
      >
        <PersonaWallThumb persona={persona} />
        {/* Always drawn; the CSS fades it in on a draggable picture. */}
        <span className={css.grip}>
          <MdDragIndicator />
        </span>
      </div>
      <div className={css.body}>
        <span className={css.nameLine}>
          <span className={css.position}>{index + 1}</span>
          <span className={css.name} data-pick-name>
            {name}
          </span>
        </span>
        {kindLabelKey ? (
          <span className={css.kind}>{t(kindLabelKey)}</span>
        ) : null}
        <Collapse isOpen={hiddenState !== null} className={css.chipFold}>
          {shownHiddenState ? (
            <span className={css.stateBlock}>
              <AdminChip tone="amber" className={css.chip}>
                {t(PERSONA_WALL_STATE_CHIP_KEY[shownHiddenState])}
              </AdminChip>
              <span className={css.stateReason}>
                {t(PERSONA_WALL_STATE_REASON_KEY[shownHiddenState])}
              </span>
            </span>
          ) : null}
        </Collapse>
        <Collapse isOpen={isDesktopOnly} className={css.chipFold}>
          <AdminChip tone="ghost" className={css.chip}>
            <FiMonitor aria-hidden className={css.chipIcon} />
            {t("admin:personaWall.row.desktopOnly")}
          </AdminChip>
        </Collapse>
      </div>
      <PersonaWallPickRowActions
        name={name}
        isBusy={isBusy}
        isFirst={isFirst}
        isLast={isLast}
        moveUpRef={moveUpRef}
        moveDownRef={moveDownRef}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        onRemove={onRemove}
      />
    </m.li>
  );
}
