import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../../shared/components/ui";
import {
  VJ_COLOR_TOKENS,
  VJ_LIMITS,
  VJ_OVERLAY_POSITIONS,
  VJ_OVERLAY_SIZES,
  VJ_OVERLAY_STYLES,
  type VjColorToken,
  type VjOverlay,
  type VjOverlayPosition,
  type VjOverlaySize,
  type VjOverlayStyle,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjStageCommands } from "../../../live/vjStageCommands";
import { useVjRecentOverlayLines } from "../../useVjRecentOverlayLines";
import styles from "./VjTextSheetV2.module.css";

export type VjOverlayPatch = Parameters<VjStageCommands["setOverlay"]>[0];

/** The auto-hide chips: Keep showing, 10 s, 30 s, 1 min, 5 min (contract range 1 s to 10 min). */
const OVERLAY_HIDE_CHOICES = [null, 10_000, 30_000, 60_000, 300_000] as const;
type VjOverlayHideChoice = (typeof OVERLAY_HIDE_CHOICES)[number];

const OVERLAY_ERROR_VALUES = { max: VJ_LIMITS.overlayTextMax };

/** True for a line break or a control character: C0, DEL, C1 and the two Unicode separators. */
function isControlCharacter(character: string): boolean {
  const codePoint = character.codePointAt(0) ?? 0;
  return (
    codePoint < 0x20 ||
    (codePoint >= 0x7f && codePoint <= 0x9f) ||
    codePoint === 0x2028 ||
    codePoint === 0x2029
  );
}

/** Characters as the server counts them: code points of the trimmed text. */
function textLengthOf(text: string): number {
  return Array.from(text.trim()).length;
}

/**
 * One labelled row of choice chips. Each chip is a toggle button
 * (aria-pressed); a held row stays focusable and sends nothing.
 */
export function VjChoiceChips<Value>({
  title,
  options,
  value,
  labelOf,
  onChoose,
  isHeld,
  layout = "wrap",
  isTitleHidden = false,
}: {
  title: string;
  options: readonly Value[];
  /** The pressed chip; null presses none. */
  value: Value | null;
  labelOf: (option: Value) => string;
  onChoose: (option: Value) => void;
  isHeld: boolean;
  layout?: "wrap" | "grid";
  /** The title still names the group for assistive tech, drawn nowhere. */
  isTitleHidden?: boolean;
}) {
  const titleId = useId();
  return (
    <div className={styles.group}>
      <p
        id={titleId}
        className={isTitleHidden ? styles.visuallyHidden : styles.groupTitle}
      >
        {title}
      </p>
      <div
        className={layout === "grid" ? styles.gridChips : styles.wrapChips}
        role="group"
        aria-labelledby={titleId}
      >
        {options.map((option) => (
          <button
            key={String(option)}
            type="button"
            className={styles.chip}
            aria-pressed={option === value}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld) onChoose(option);
            }}
          >
            {labelOf(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A one-line text field with its label above and a live counter under it.
 * Pasted line breaks and control characters become spaces, so the line
 * stays one line; Enter submits.
 */
export function VjOneLineField({
  label,
  value,
  max,
  overLine,
  placeholder,
  isLabelHidden = false,
  onChange,
  onSubmit,
}: {
  label: string;
  value: string;
  max: number;
  /** The line the counter shows once the text runs over `max`. */
  overLine: string;
  placeholder?: string;
  /** The label still names the field for assistive tech, drawn nowhere. */
  isLabelHidden?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const counterId = useId();
  const length = textLengthOf(value);
  const isOver = length > max;
  return (
    <form
      className={styles.group}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label
        htmlFor={inputId}
        className={isLabelHidden ? styles.visuallyHidden : styles.groupTitle}
      >
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="send"
        aria-describedby={counterId}
        aria-invalid={isOver}
        onChange={(event) =>
          onChange(
            Array.from(event.target.value, (character) =>
              isControlCharacter(character) ? " " : character,
            ).join(""),
          )
        }
      />
      <p
        id={counterId}
        className={styles.counter}
        data-is-over={isOver}
        aria-live="polite"
      >
        {isOver
          ? overLine
          : t("vj:text.charactersLeft", { count: max - length })}
      </p>
    </form>
  );
}

/** "Hides in 24 s", counted down on the synced server clock while auto-hide runs. */
function VjOverlayHidesIn({
  hideAt,
  serverNow,
}: {
  hideAt: number | null;
  serverNow: () => number;
}) {
  const { t } = useTranslation();
  const [shownHideAt, setShownHideAt] = useState(hideAt);
  if (hideAt !== null && hideAt !== shownHideAt) setShownHideAt(hideAt);
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    if (hideAt === null) return;
    const readClock = () => setNow(serverNow());
    const firstRead = setTimeout(readClock, 0);
    const interval = setInterval(readClock, 1000);
    return () => {
      clearTimeout(firstRead);
      clearInterval(interval);
    };
  }, [hideAt, serverNow]);

  const seconds =
    shownHideAt === null
      ? 0
      : Math.max(0, Math.ceil((shownHideAt - now) / 1000));
  return (
    <Collapse isOpen={hideAt !== null}>
      <p className={styles.hint}>{t("vj:overlay.hidesIn", { seconds })}</p>
    </Collapse>
  );
}

/** Recent lines as one-tap buttons, arriving and leaving with the list motion. */
function VjRecentLines({
  lines,
  isHeld,
  onShowLine,
  onClear,
}: {
  lines: readonly string[];
  isHeld: boolean;
  onShowLine: (line: string) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <Collapse isOpen={lines.length > 0}>
      <div className={styles.group}>
        <p id={titleId} className={styles.groupTitle}>
          {t("vj:text.recent")}
        </p>
        <ul className={styles.recentList} aria-labelledby={titleId}>
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <CollapseListItem key={line}>
                <button
                  type="button"
                  className={styles.recentButton}
                  aria-label={t("vj:text.recentAria", { text: line })}
                  aria-disabled={isHeld}
                  onClick={() => {
                    if (!isHeld) onShowLine(line);
                  }}
                >
                  {line}
                </button>
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
        <div>
          <Button variant="stage-ghost" size="sm" onClick={onClear}>
            {t("vj:text.clearRecent")}
          </Button>
        </div>
      </div>
    </Collapse>
  );
}

/** The eight palette swatches, each painted with the projector's token and named. */
function VjColorSwatches({
  colorToken,
  isHeld,
  onColor,
}: {
  colorToken: VjColorToken;
  isHeld: boolean;
  onColor: (colorToken: VjColorToken) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <div className={styles.group}>
      <p id={titleId} className={styles.groupTitle}>
        {t("vj:overlay.color")}
      </p>
      <div className={styles.swatches} role="group" aria-labelledby={titleId}>
        {VJ_COLOR_TOKENS.map((token) => (
          <button
            key={token}
            type="button"
            className={styles.swatch}
            aria-pressed={token === colorToken}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld) onColor(token);
            }}
          >
            <span aria-hidden className={styles.swatchDot} data-color={token} />
            {t(`vj:color.${token}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** How the line looks: the draft every Show or Update text sends. */
interface VjOverlayLook {
  style: VjOverlayStyle;
  position: VjOverlayPosition;
  size: VjOverlaySize;
  colorToken: VjColorToken;
  hideAfterMs: VjOverlayHideChoice;
}

/** Style, position, size, colour and auto-hide as chips. */
function VjOverlayLookFields({
  look,
  isHeld,
  onLook,
}: {
  look: VjOverlayLook;
  isHeld: boolean;
  onLook: (patch: Partial<VjOverlayLook>) => void;
}) {
  const { t } = useTranslation();
  const hideLabelOf = (choice: VjOverlayHideChoice): string => {
    if (choice === null) return t("vj:overlay.autoHideNever");
    if (choice < 60_000)
      return t("vj:overlay.autoHideSeconds", { count: choice / 1000 });
    return t("vj:overlay.autoHideMinutes", { count: choice / 60_000 });
  };
  return (
    <>
      <VjChoiceChips
        title={t("vj:text.style")}
        options={VJ_OVERLAY_STYLES}
        value={look.style}
        labelOf={(style) => t(`vj:overlay.style.${style}`)}
        onChoose={(style) => onLook({ style })}
        isHeld={isHeld}
        layout="grid"
      />
      <VjChoiceChips
        title={t("vj:overlay.position")}
        options={VJ_OVERLAY_POSITIONS}
        value={look.position}
        labelOf={(position) => t(`vj:overlay.position.${position}`)}
        onChoose={(position) => onLook({ position })}
        isHeld={isHeld}
      />
      <VjChoiceChips
        title={t("vj:overlay.size")}
        options={VJ_OVERLAY_SIZES}
        value={look.size}
        labelOf={(size) => t(`vj:overlay.size.${size}`)}
        onChoose={(size) => onLook({ size })}
        isHeld={isHeld}
      />
      <VjColorSwatches
        colorToken={look.colorToken}
        isHeld={isHeld}
        onColor={(colorToken) => onLook({ colorToken })}
      />
      <VjChoiceChips
        title={t("vj:overlay.autoHide")}
        options={OVERLAY_HIDE_CHOICES}
        value={look.hideAfterMs}
        labelOf={hideLabelOf}
        onChoose={(hideAfterMs) => onLook({ hideAfterMs })}
        isHeld={isHeld}
      />
    </>
  );
}

/**
 * The Text section: one line of up to 80 characters, how it looks, Show
 * text (Update text while it shows), Hide text, the auto-hide countdown and
 * the recent lines, which stay on this device.
 */
export function VjOverlayFields({
  overlay,
  serverNow,
  isHeld,
  onShow,
  onHide,
  alert,
}: {
  overlay: VjOverlay;
  serverNow: () => number;
  isHeld: boolean;
  /** Sends the patch; true once the server took it. */
  onShow: (patch: VjOverlayPatch) => Promise<boolean>;
  onHide: () => void;
  /** The section's reason line, under the actions. */
  alert: ReactNode;
}) {
  const { t } = useTranslation();
  const recent = useVjRecentOverlayLines();
  const [draft, setDraft] = useState(overlay.text);
  const [look, setLook] = useState<VjOverlayLook>(() => ({
    style: overlay.style,
    position: overlay.position,
    size: overlay.size,
    colorToken: overlay.colorToken,
    hideAfterMs: null,
  }));

  const trimmed = draft.trim();
  const isOver = textLengthOf(draft) > VJ_LIMITS.overlayTextMax;
  const isShowHeld = isHeld || trimmed.length === 0 || isOver;

  const showLine = async (text: string) => {
    const isTaken = await onShow({ text, ...look, isVisible: true });
    if (isTaken) recent.remember(text);
  };

  return (
    <div className={styles.fields} data-vj-text-fields="overlay">
      <VjOneLineField
        label={t("vj:text.label")}
        value={draft}
        max={VJ_LIMITS.overlayTextMax}
        overLine={t("vj:error.socket.overlayTextTooLong", OVERLAY_ERROR_VALUES)}
        isLabelHidden
        onChange={setDraft}
        onSubmit={() => {
          if (!isShowHeld) void showLine(trimmed);
        }}
      />
      <VjOverlayLookFields
        look={look}
        isHeld={isHeld}
        onLook={(patch) => setLook((current) => ({ ...current, ...patch }))}
      />
      <div className={styles.actions}>
        <Button
          variant="stage"
          className={styles.actionButton}
          aria-disabled={isShowHeld}
          onClick={() => {
            if (!isShowHeld) void showLine(trimmed);
          }}
        >
          {t(overlay.isVisible ? "vj:text.update" : "vj:text.show")}
        </Button>
        <Collapse isOpen={overlay.isVisible}>
          <Button
            variant="stage-ghost"
            className={styles.actionButton}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld) onHide();
            }}
          >
            {t("vj:text.hide")}
          </Button>
        </Collapse>
      </div>
      <VjOverlayHidesIn
        hideAt={overlay.isVisible ? overlay.hideAt : null}
        serverNow={serverNow}
      />
      {alert}
      <VjRecentLines
        lines={recent.lines}
        isHeld={isHeld}
        onShowLine={(line) => {
          setDraft(line);
          void showLine(line);
        }}
        onClear={recent.clear}
      />
    </div>
  );
}
