import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  Button,
  Collapse,
  CollapseListItem,
  Modal,
} from "../../../shared/components/ui";
import {
  VJ_LIMITS,
  VJ_OVERLAY_STYLES,
  type VjOverlay,
  type VjOverlayStyle,
} from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowDarkDialog } from "../../quizshow/builder/useQuizshowDarkDialog";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import { useVjRecentOverlayLines } from "./useVjRecentOverlayLines";
import { VjSheetAlert } from "./VjSheetAlert";
import styles from "./VjSheets.module.css";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

const STYLE_LABEL_KEY: Record<VjOverlayStyle, string> = {
  big: "vj:text.styleBig",
  ticker: "vj:text.styleTicker",
};

/** The values every overlay refusal line may name. */
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

/** Pasted line breaks and control characters become spaces, so the line stays one line. */
function asOneLine(text: string): string {
  return Array.from(text, (character) =>
    isControlCharacter(character) ? " " : character,
  ).join("");
}

/** Characters as the server counts them: code points of the trimmed text. */
function overlayLengthOf(text: string): number {
  return Array.from(text.trim()).length;
}

/** The Big and Ticker pair. */
function VjTextStylePair({
  style,
  onStyle,
}: {
  style: VjOverlayStyle;
  onStyle: (style: VjOverlayStyle) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:text.style")}
      </h4>
      <div className={styles.pair} role="group" aria-labelledby={titleId}>
        {VJ_OVERLAY_STYLES.map((styleOption) => (
          <button
            key={styleOption}
            type="button"
            className={styles.chip}
            aria-pressed={style === styleOption}
            onClick={() => onStyle(styleOption)}
          >
            {t(STYLE_LABEL_KEY[styleOption])}
          </button>
        ))}
      </div>
    </section>
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
      <section className={styles.section} aria-labelledby={titleId}>
        <h4 id={titleId} className={styles.sectionTitle}>
          {t("vj:text.recent")}
        </h4>
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
      </section>
    </Collapse>
  );
}

/**
 * The Text sheet: one line of up to 80 characters, Big or Ticker, Show text
 * (Update text while it shows), Hide text, and the recent lines.
 */
export function VjTextSheet({
  overlay,
  run,
  isBlocked,
  onClose,
}: {
  overlay: VjOverlay;
  run: VjRun;
  isBlocked: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const inputId = useId();
  const counterId = useId();
  const recent = useVjRecentOverlayLines();
  const [draft, setDraft] = useState(overlay.text);
  const [style, setStyle] = useState<VjOverlayStyle>(overlay.style);
  const [isSending, setIsSending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const trimmed = draft.trim();
  const length = overlayLengthOf(draft);
  const isOver = length > VJ_LIMITS.overlayTextMax;
  const isHeld = isBlocked || isSending;
  const isShowHeld = isHeld || trimmed.length === 0 || isOver;

  const showLine = async (text: string) => {
    setIsSending(true);
    const outcome = await run("setOverlay", { text, style, isVisible: true });
    setIsSending(false);
    setErrorKey(outcome.ok ? null : outcome.errorKey);
    if (outcome.ok) recent.remember(text);
  };

  const hideText = async () => {
    setIsSending(true);
    const outcome = await run("setOverlay", { isVisible: false });
    setIsSending(false);
    setErrorKey(outcome.ok ? null : outcome.errorKey);
  };

  return (
    <Modal
      title={t("vj:text.title")}
      className={styles.sheet}
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          <Button variant="stage-ghost" onClick={onClose}>
            {t("vj:text.close")}
          </Button>
        </div>
      }
    >
      <div className={styles.body} ref={darkDialogRef}>
        <form
          className={styles.section}
          onSubmit={(event) => {
            event.preventDefault();
            if (!isShowHeld) void showLine(trimmed);
          }}
        >
          <label htmlFor={inputId} className={styles.sectionTitle}>
            {t("vj:text.label")}
          </label>
          <input
            id={inputId}
            type="text"
            className={styles.input}
            value={draft}
            autoComplete="off"
            enterKeyHint="send"
            aria-describedby={counterId}
            aria-invalid={isOver}
            onChange={(event) => setDraft(asOneLine(event.target.value))}
          />
          <p
            id={counterId}
            className={styles.counter}
            data-is-over={isOver}
            aria-live="polite"
          >
            {isOver
              ? t("vj:error.socket.overlayTextTooLong", OVERLAY_ERROR_VALUES)
              : t("vj:text.charactersLeft", {
                  count: VJ_LIMITS.overlayTextMax - length,
                })}
          </p>
        </form>
        <VjTextStylePair style={style} onStyle={setStyle} />
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
                if (!isHeld) void hideText();
              }}
            >
              {t("vj:text.hide")}
            </Button>
          </Collapse>
        </div>
        <VjSheetAlert errorKey={errorKey} values={OVERLAY_ERROR_VALUES} />
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
    </Modal>
  );
}
