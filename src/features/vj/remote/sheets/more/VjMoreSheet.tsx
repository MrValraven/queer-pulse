import { useId } from "react";
import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiChevronRight,
  FiLayers,
  FiMonitor,
  FiShuffle,
  FiSliders,
  FiTarget,
  FiType,
  FiXSquare,
  FiZap,
} from "react-icons/fi";
import { LuKeyboard, LuListMusic } from "react-icons/lu";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import styles from "./VjMoreSheet.module.css";

/** Every sheet the remote opens, one at a time (the sheets host keys on it). */
export type VjRemoteSheetId =
  | "more"
  | "text"
  | "shuffle"
  | "mix"
  | "scenes"
  | "screens"
  | "eventCard"
  | "midi"
  | "effects"
  | "shortcuts"
  /** Clips that couldn't load: opened from the grid, mounted by the grid band. */
  | "failures";

/** A sheet the More list opens. */
export type VjMoreSheetTarget = Exclude<VjRemoteSheetId, "more" | "failures">;

interface VjMoreSheetRow {
  sheet: VjMoreSheetTarget;
  labelKey: string;
  Icon: IconType;
  /** Only useful with a keyboard: hidden on touch-only screens. */
  isKeyboardOnly?: boolean;
}

/** The setup sheets in the order the More list shows them. */
const VJ_MORE_SHEET_ROWS: readonly VjMoreSheetRow[] = [
  { sheet: "text", labelKey: "vj:text.title", Icon: FiType },
  { sheet: "shuffle", labelKey: "vj:shuffle.title", Icon: FiShuffle },
  { sheet: "mix", labelKey: "vj:mix.title", Icon: FiLayers },
  { sheet: "scenes", labelKey: "vj:scenes.title", Icon: LuListMusic },
  { sheet: "screens", labelKey: "vj:screensSheet.title", Icon: FiMonitor },
  { sheet: "eventCard", labelKey: "vj:eventCard.title", Icon: FiCalendar },
  { sheet: "midi", labelKey: "vj:midi.title", Icon: FiSliders },
  { sheet: "effects", labelKey: "vj:effect.libraryTitle", Icon: FiZap },
  {
    sheet: "shortcuts",
    labelKey: "vj:keys.title",
    Icon: LuKeyboard,
    isKeyboardOnly: true,
  },
];

/**
 * A row's words: its label, and under it the one line saying what the row
 * does. The button takes its name from the label alone (aria-labelledby)
 * and its description from the line (aria-describedby).
 */
function VjMoreRowText({
  idPrefix,
  label,
  description,
}: {
  idPrefix: string;
  label: string;
  description: string;
}) {
  return (
    <span className={styles.text}>
      <span id={`${idPrefix}-label`} className={styles.label}>
        {label}
      </span>
      <span id={`${idPrefix}-description`} className={styles.description}>
        {description}
      </span>
    </span>
  );
}

export interface VjMoreSheetProps {
  isCueMode: boolean;
  /** Clear the screen holds (aria-disabled) while commands cannot go out. */
  isClearBlocked: boolean;
  onOpen: (sheet: VjMoreSheetTarget) => void;
  onSetCueMode: (isOn: boolean) => void;
  onClearScreen: () => void;
  onClose: () => void;
}

/**
 * More controls: one full-width row per setup sheet, then the two show
 * actions that sit outside the dock (cue mode and Clear the screen), each
 * with a line under its label saying what it does. A row
 * hands its sheet id to the host, which swaps the sheets inside one
 * AnimatePresence so this one plays its exit as the next one opens.
 */
export function VjMoreSheet({
  isCueMode,
  isClearBlocked,
  onOpen,
  onSetCueMode,
  onClearScreen,
  onClose,
}: VjMoreSheetProps) {
  const { t } = useTranslation();
  const cueLabelKey = isCueMode ? "vj:more.cueOff" : "vj:more.cueOn";
  const rowIdPrefix = useId();
  const labelledBy = (rowId: string) => `${rowIdPrefix}-${rowId}-label`;
  const describedBy = (rowId: string) => `${rowIdPrefix}-${rowId}-description`;

  return (
    <VjSheetFrame
      title={t("vj:more.title")}
      intro={t("vj:more.intro")}
      closeLabel={t("vj:more.close")}
      onClose={onClose}
    >
      <div className={styles.groups}>
        <ul className={styles.list}>
          {VJ_MORE_SHEET_ROWS.map(
            ({ sheet, labelKey, Icon, isKeyboardOnly }) => (
              <li
                key={sheet}
                data-vj-keyboard-only={isKeyboardOnly ? "" : undefined}
              >
                <button
                  type="button"
                  className={styles.row}
                  data-vj-more-sheet={sheet}
                  aria-labelledby={labelledBy(sheet)}
                  aria-describedby={describedBy(sheet)}
                  onClick={() => onOpen(sheet)}
                >
                  <span className={styles.iconWell} aria-hidden="true">
                    <Icon fill="none" className={styles.icon} />
                  </span>
                  <VjMoreRowText
                    idPrefix={`${rowIdPrefix}-${sheet}`}
                    label={t(labelKey)}
                    description={t(`vj:more.desc.${sheet}`)}
                  />
                  <FiChevronRight
                    aria-hidden="true"
                    fill="none"
                    className={styles.chevron}
                  />
                </button>
              </li>
            ),
          )}
        </ul>
        <ul className={styles.list}>
          <li>
            <button
              type="button"
              className={styles.row}
              data-is-on={isCueMode}
              aria-labelledby={labelledBy("cueMode")}
              aria-describedby={describedBy("cueMode")}
              onClick={() => onSetCueMode(!isCueMode)}
            >
              <span className={styles.iconWell} aria-hidden="true">
                <FiTarget fill="none" className={styles.icon} />
              </span>
              <VjMoreRowText
                idPrefix={`${rowIdPrefix}-cueMode`}
                label={t(cueLabelKey)}
                description={t("vj:more.desc.cueMode")}
              />
            </button>
          </li>
          <li>
            <button
              type="button"
              className={styles.row}
              aria-disabled={isClearBlocked}
              aria-labelledby={labelledBy("clearScreen")}
              aria-describedby={describedBy("clearScreen")}
              onClick={() => {
                if (!isClearBlocked) onClearScreen();
              }}
            >
              <span className={styles.iconWell} aria-hidden="true">
                <FiXSquare fill="none" className={styles.icon} />
              </span>
              <VjMoreRowText
                idPrefix={`${rowIdPrefix}-clearScreen`}
                label={t("vj:remote.clearScreen")}
                description={t("vj:more.desc.clearScreen")}
              />
            </button>
          </li>
        </ul>
      </div>
    </VjSheetFrame>
  );
}
