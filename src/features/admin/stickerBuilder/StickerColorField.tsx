import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import { intlLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STICKER_COLOR_PRESETS } from "./stickerColorPresets.data";
import {
  colorToneOf,
  flagsFadingInto,
  normalizeHexColor,
} from "./stickerContrast";
import styles from "./StickerColorField.module.css";

/** How many affected flags the contrast warning names before summarising. */
const NAMED_FLAG_LIMIT = 3;

/** The swatch paint as a custom property, so the hex never lands in a
 *  stylesheet and the module only reads `var(--swatch-color)`. */
function swatchStyle(color: string): CSSProperties {
  return { "--swatch-color": color } as CSSProperties;
}

/**
 * The frame colour: a swatch that opens the native picker, a hex box for an
 * exact value, and quick presets. The hex box keeps a draft while it is being
 * typed; a valid code (`#rgb` or `#rrggbb`) commits as lowercase `#rrggbb`
 * straight away, and an invalid one only shows its error once the box is left
 * or Enter is pressed, so a half-typed code is never flagged mid-keystroke.
 */
export function StickerColorField({
  label,
  value,
  onChange,
  contrastFlagIds,
  resetSignal,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
  /** Flags whose stripes the colour is checked against. */
  contrastFlagIds: string[];
  /** Bumped by the parent on Template defaults and whenever a pack's style
   *  loads (a click on Use this pack's style, or a pack switch), so an
   *  external reset clears a stale draft even when `value` lands on the
   *  same hex the draft was already showing (see the resync below). */
  resetSignal: number;
}) {
  const { t } = useTranslation();
  const colorInputId = useId();
  const errorId = useId();
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  const [isHexInvalid, setIsHexInvalid] = useState(false);
  const [lastSeenValue, setLastSeenValue] = useState(value);
  const [lastSeenResetSignal, setLastSeenResetSignal] = useState(resetSignal);
  const pickerValue = normalizeHexColor(value) ?? "#000000";

  // Render-time resync with the previous prop. When `value` changes and the
  // draft does not describe it (Template defaults, the pack style, a parent
  // update), the change came from outside, so the stale draft and its error
  // go. A valid draft being typed commits its own normalised value, which
  // matches, so a live edit keeps its text.
  if (value !== lastSeenValue) {
    setLastSeenValue(value);
    const isDraftForValue =
      hexDraft !== null &&
      normalizeHexColor(hexDraft) === normalizeHexColor(value);
    if (hexDraft !== null && !isDraftForValue) {
      setHexDraft(null);
      setIsHexInvalid(false);
    }
  }

  // The same resync, keyed on `resetSignal` instead of `value`: Template
  // defaults or a pack's style loading can land the frame colour on the
  // exact hex the draft is already showing, so `value` never changes and the
  // check above never fires. The parent bumps this signal on every such reset regardless
  // of the landing value, so the stale draft and its error still clear.
  if (resetSignal !== lastSeenResetSignal) {
    setLastSeenResetSignal(resetSignal);
    if (hexDraft !== null) {
      setHexDraft(null);
      setIsHexInvalid(false);
    }
  }

  function commitColor(color: string) {
    setHexDraft(null);
    setIsHexInvalid(false);
    onChange(color);
  }

  function handleHexChange(text: string) {
    setHexDraft(text);
    const normalized = normalizeHexColor(text);
    if (normalized !== null) {
      setIsHexInvalid(false);
      onChange(normalized);
    }
  }

  function settleHexDraft() {
    if (hexDraft === null) return;
    const normalized = normalizeHexColor(hexDraft);
    if (normalized === null) {
      setIsHexInvalid(true);
      return;
    }
    commitColor(normalized);
  }

  function handleHexKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      settleHexDraft();
    } else if (event.key === "Escape" && hexDraft !== null) {
      event.preventDefault();
      setHexDraft(null);
      setIsHexInvalid(false);
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={colorInputId}>
        {label}
      </label>
      <div className={styles.row}>
        <span className={styles.swatch} style={swatchStyle(pickerValue)}>
          <input
            id={colorInputId}
            type="color"
            className={styles.colorInput}
            value={pickerValue}
            onChange={(event) => commitColor(event.target.value.toLowerCase())}
          />
        </span>
        <input
          type="text"
          className={styles.hexInput}
          value={hexDraft ?? value}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-label={t("admin:stickerPacks.color.hexLabel", { field: label })}
          aria-invalid={isHexInvalid || undefined}
          aria-describedby={isHexInvalid ? errorId : undefined}
          onChange={(event) => handleHexChange(event.target.value)}
          onBlur={settleHexDraft}
          onKeyDown={handleHexKeyDown}
        />
        <StickerColorPresets value={pickerValue} onPick={commitColor} />
      </div>
      {isHexInvalid && (
        <p id={errorId} className={styles.error} role="alert">
          {t("admin:stickerPacks.color.hexInvalid")}
        </p>
      )}
      <StickerContrastWarning
        frameColor={pickerValue}
        contrastFlagIds={contrastFlagIds}
      />
    </div>
  );
}

function StickerColorPresets({
  value,
  onPick,
}: {
  value: string;
  onPick: (color: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.presets}
      role="group"
      aria-label={t("admin:stickerPacks.color.presetsLabel")}
    >
      {STICKER_COLOR_PRESETS.map((preset) => {
        const isSelected = preset.color === value;
        const isDarkPreset = colorToneOf(preset.color) === "dark";
        return (
          <button
            key={preset.id}
            type="button"
            data-tap-target
            className={[
              styles.preset,
              isSelected && styles.presetSelected,
              isDarkPreset && styles.presetDark,
            ]
              .filter(Boolean)
              .join(" ")}
            style={swatchStyle(preset.color)}
            aria-label={t(preset.labelKey)}
            title={t(preset.labelKey)}
            aria-pressed={isSelected}
            onClick={() => onPick(preset.color)}
          >
            {isSelected && <FiCheck aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

/** Warning copy per frame tone: a light frame loses the light stripes, a dark
 *  one the dark stripes, and a mid tone the stripes closest to it. */
const FADE_KEY_BY_TONE = {
  light: "admin:stickerPacks.color.fadesLight",
  dark: "admin:stickerPacks.color.fadesDark",
  mid: "admin:stickerPacks.color.fadesMid",
} as const;

function StickerContrastWarning({
  frameColor,
  contrastFlagIds,
}: {
  frameColor: string;
  contrastFlagIds: string[];
}) {
  const { t, language } = useTranslation();
  const fadingFlagIds = useMemo(
    () => flagsFadingInto(frameColor, contrastFlagIds),
    [frameColor, contrastFlagIds],
  );

  const flagList = useMemo(() => {
    if (fadingFlagIds.length === 0) return "";
    const namedFlags = fadingFlagIds
      .slice(0, NAMED_FLAG_LIMIT)
      .map((flagId) => t(`cards:flag.${flagId}`));
    const hiddenCount = fadingFlagIds.length - namedFlags.length;
    const listItems =
      hiddenCount > 0
        ? [
            ...namedFlags,
            t("admin:stickerPacks.color.moreFlags", { count: hiddenCount }),
          ]
        : namedFlags;
    return new Intl.ListFormat(intlLocale(language), {
      style: "long",
      type: "conjunction",
    }).format(listItems);
  }, [fadingFlagIds, language, t]);

  // The live region stays mounted so a warning that appears mid-drag is
  // announced; only its content comes and goes.
  return (
    <div className={styles.warningRegion} aria-live="polite">
      {flagList !== "" && (
        <p className={styles.warning}>
          <FiAlertTriangle className={styles.warningIcon} aria-hidden />
          <span>
            {t(FADE_KEY_BY_TONE[colorToneOf(frameColor)], {
              flags: flagList,
              count: fadingFlagIds.length,
            })}
          </span>
        </p>
      )}
    </div>
  );
}
