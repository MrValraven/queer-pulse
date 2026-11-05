import {
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowCodeCells.module.css";

export const QUIZSHOW_CODE_CELL_COUNT = 6;

/** The cells are fixed places in one code, so each place has a fixed key. */
const CELL_KEYS = ["first", "second", "third", "fourth", "fifth", "sixth"];

/** Letters and digits only, uppercased: what a cell can hold. */
function codeCharactersOf(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * What a cell newly received. iOS can ignore the select-on-focus and insert
 * beside the old character, so a filled cell that reports two characters
 * drops the old one once. A paste or an autofill (longer) passes through.
 */
function typedIntoCell(rawValue: string, oldCharacter: string): string {
  const typed = codeCharactersOf(rawValue);
  if (oldCharacter === "" || typed.length !== 2) return typed;
  const oldIndex = typed.indexOf(oldCharacter);
  return oldIndex === -1
    ? typed
    : typed.slice(0, oldIndex) + typed.slice(oldIndex + 1);
}

interface QuizshowCodeCellsProps {
  /** The code typed so far, at most six characters, no gaps. */
  value: string;
  onChange: (nextValue: string) => void;
  /** The catalog-resolved error under the cells, if any. */
  errorText?: string;
  /** Bumped on every refused submit: focus returns to the first empty cell and the error is read again. */
  submitAttempt?: number;
}

/**
 * The join code as six cells. Typing moves on to the next cell, Backspace on an
 * empty cell goes back, and a paste fills every cell from the first. The group
 * carries the field's name and each cell names its place in the code.
 */
export function QuizshowCodeCells({
  value,
  onChange,
  errorText,
  submitAttempt = 0,
}: QuizshowCodeCellsProps) {
  const { t } = useTranslation();
  const firstCellId = useId();
  const hintId = useId();
  const errorId = useId();
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  // The code as the handlers last wrote it, ahead of the parent's next render.
  const latestValueRef = useRef(value);
  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);
  const characters = Array.from(
    { length: QUIZSHOW_CODE_CELL_COUNT },
    (_unused, cellIndex) => value[cellIndex] ?? "",
  );
  const hasError = errorText !== undefined;
  const describedBy = [hintId, hasError ? errorId : null]
    .filter(Boolean)
    .join(" ");

  function focusCell(cellIndex: number) {
    const clamped = Math.max(
      0,
      Math.min(cellIndex, QUIZSHOW_CODE_CELL_COUNT - 1),
    );
    cellRefs.current[clamped]?.focus();
  }

  function commit(nextValue: string, focusIndex: number) {
    latestValueRef.current = nextValue;
    onChange(nextValue);
    focusCell(focusIndex);
  }

  // A refused submit sends the player back to the first empty cell, which reopens the keyboard.
  useEffect(() => {
    if (submitAttempt === 0) return;
    const firstEmptyIndex = Math.min(
      latestValueRef.current.length,
      QUIZSHOW_CODE_CELL_COUNT - 1,
    );
    cellRefs.current[firstEmptyIndex]?.focus();
  }, [submitAttempt]);

  function changeCell(cellIndex: number, rawValue: string) {
    const typed = typedIntoCell(rawValue, characters[cellIndex] ?? "");
    if (typed === "") {
      // The cell was cleared: the characters after it move up one place.
      commit(value.slice(0, cellIndex) + value.slice(cellIndex + 1), cellIndex);
      return;
    }
    // A cell can only be filled in order, so typing always lands on the next free place.
    const startIndex = Math.min(cellIndex, value.length);
    const nextValue = (
      value.slice(0, startIndex) +
      typed +
      value.slice(startIndex + typed.length)
    ).slice(0, QUIZSHOW_CODE_CELL_COUNT);
    commit(nextValue, startIndex + typed.length);
  }

  /** Backspace on an empty cell: step back and clear the one before. */
  function stepBack(cellIndex: number) {
    if (cellIndex === 0) return;
    commit(latestValueRef.current.slice(0, cellIndex - 1), cellIndex - 1);
  }

  // Android keyboards send Backspace as key "Unidentified", so the native
  // beforeinput's inputType is what reports a delete on an empty cell.
  function bindCell(element: HTMLInputElement | null, cellIndex: number) {
    cellRefs.current[cellIndex] = element;
    if (element === null) return undefined;
    const handleBeforeInput = (event: InputEvent) => {
      if (event.inputType !== "deleteContentBackward") return;
      if (element.value !== "") return;
      event.preventDefault();
      stepBack(cellIndex);
    };
    element.addEventListener("beforeinput", handleBeforeInput);
    return () => element.removeEventListener("beforeinput", handleBeforeInput);
  }

  function pasteCode(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = codeCharactersOf(event.clipboardData.getData("text"));
    if (pasted === "") return;
    const nextValue = pasted.slice(0, QUIZSHOW_CODE_CELL_COUNT);
    commit(nextValue, nextValue.length);
  }

  function handleKey(
    event: KeyboardEvent<HTMLInputElement>,
    cellIndex: number,
  ) {
    if (event.key === "Backspace" && characters[cellIndex] === "") {
      event.preventDefault();
      stepBack(cellIndex);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(cellIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(Math.min(cellIndex + 1, value.length));
    }
  }

  /** A tap on a later empty cell (never a Tab stop) lands on the first empty one; a focused cell selects what it holds. */
  function focusOrRedirect(input: HTMLInputElement, cellIndex: number) {
    const firstEmptyIndex = latestValueRef.current.length;
    if (cellIndex > firstEmptyIndex) {
      focusCell(firstEmptyIndex);
      return;
    }
    // iOS drops a select() made inside the focus event, so it waits a frame.
    requestAnimationFrame(() => {
      if (document.activeElement === input) input.select();
    });
  }

  return (
    <fieldset
      className={styles.field}
      aria-describedby={describedBy}
      data-has-error={hasError ? "true" : undefined}
    >
      <legend className={styles.visuallyHidden}>
        {t("quizshow:player.codeLabel")}
      </legend>
      {/* The whole code's name, on the first cell, for anyone who reaches the field by its label. */}
      <label htmlFor={firstCellId} className={styles.visuallyHidden}>
        {t("quizshow:player.codeLabel")}
      </label>
      <div className={styles.cells}>
        {characters.map((character, cellIndex) => (
          <input
            key={CELL_KEYS[cellIndex]}
            id={cellIndex === 0 ? firstCellId : undefined}
            ref={(element) => bindCell(element, cellIndex)}
            className={styles.cell}
            // Roving tab stops: Tab reaches only the filled cells and the next
            // empty one, then leaves for the Join button. The last cell stays
            // reachable once the code is full.
            tabIndex={
              cellIndex <= Math.min(value.length, QUIZSHOW_CODE_CELL_COUNT - 1)
                ? 0
                : -1
            }
            type="text"
            value={character}
            aria-label={t("quizshow:player.codeCellLabel", {
              number: cellIndex + 1,
              total: QUIZSHOW_CODE_CELL_COUNT,
            })}
            aria-describedby={cellIndex === 0 ? describedBy : undefined}
            aria-invalid={hasError ? true : undefined}
            data-filled={character === "" ? undefined : "true"}
            autoCapitalize="characters"
            autoComplete={cellIndex === 0 ? "one-time-code" : "off"}
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            // Enter submits from any cell, so every cell offers Go.
            enterKeyHint="go"
            onFocus={(event) => focusOrRedirect(event.currentTarget, cellIndex)}
            onPointerUp={(event) => {
              const input = event.currentTarget;
              if (document.activeElement === input) input.select();
            }}
            onChange={(event) => changeCell(cellIndex, event.target.value)}
            onKeyDown={(event) => handleKey(event, cellIndex)}
            onPaste={pasteCode}
          />
        ))}
      </div>
      <span id={hintId} className={styles.hint}>
        {t("quizshow:player.codeHint")}
      </span>
      {hasError && (
        // A new key on each refused submit, so the same words are read again.
        <span
          key={submitAttempt}
          id={errorId}
          className={styles.error}
          role="alert"
        >
          {errorText}
        </span>
      )}
    </fieldset>
  );
}
