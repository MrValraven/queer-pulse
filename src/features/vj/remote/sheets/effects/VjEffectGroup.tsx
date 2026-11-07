import { useId } from "react";
import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  vjEffectSettingOf,
  type VjEffectGroup as VjEffectGroupId,
  type VjEffects,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { useVjDockPads } from "../../hooks/useVjDockPads";
import type { VjActionDispatch } from "../../input/vjRemoteAction";
import { VJ_DOCK_PADS_MAX } from "../../rules/vjDockPads";
import {
  VjEffectRow,
  type VjEffectSettingSend,
  type VjPadIsOn,
} from "./VjEffectRow";
import styles from "./VjEffectsLibrary.module.css";

export interface VjEffectGroupProps {
  group: VjEffectGroupId;
  effects: VjEffects;
  dockPads: ReturnType<typeof useVjDockPads>;
  /** The line saying the dock is full, which a blocked Add points at. */
  dockFullId: string;
  isBlocked: boolean;
  stateRevision: number | null;
  dispatch: VjActionDispatch;
  padIsOn?: VjPadIsOn;
  sendSetting: VjEffectSettingSend;
}

/** One catalog group: its heading, then its effects in catalog order. */
export function VjEffectGroup({
  group,
  effects,
  dockPads,
  dockFullId,
  isBlocked,
  stateRevision,
  dispatch,
  padIsOn,
  sendSetting,
}: VjEffectGroupProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const effectIds = VJ_EFFECT_IDS.filter(
    (effectId) => VJ_EFFECT_CATALOG[effectId].group === group,
  );
  const isDockFull = dockPads.pads.length >= VJ_DOCK_PADS_MAX;
  return (
    <section
      className={styles.section}
      aria-labelledby={titleId}
      data-vj-effect-group={group}
    >
      <h4 id={titleId} className={styles.sectionTitle}>
        {t(`vj:effect.group.${group}`)}
      </h4>
      <ul className={styles.groupList}>
        {effectIds.map((effectId) => (
          <li key={effectId}>
            <VjEffectRow
              effectId={effectId}
              setting={vjEffectSettingOf(effects, effectId)}
              dockIndex={dockPads.pads.indexOf(effectId)}
              dockCount={dockPads.pads.length}
              isDockFull={isDockFull}
              dockFullId={dockFullId}
              isBlocked={isBlocked}
              stateRevision={stateRevision}
              dispatch={dispatch}
              padIsOn={padIsOn}
              sendSetting={sendSetting}
              onAddToDock={(addedEffectId) => {
                // A full dock is already held at the row (aria-disabled Add).
                dockPads.add(addedEffectId);
              }}
              onRemoveFromDock={dockPads.remove}
              onMoveInDock={dockPads.move}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
