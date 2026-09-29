import { useMemo, useRef, useState, type KeyboardEvent } from "react";

const MAX_MATCHES = 6;
/** Keys that add in either mode. Tab also commits, in free mode only. */
const COMMIT_KEYS = ["Enter", ","];

/** How typed text and options are compared: trimmed, a leading `#` dropped,
 *  lower case. */
function tagMatchKey(value: string): string {
  return value.trim().replace(/^#+/, "").toLowerCase();
}

/**
 * The entry input's state and keys for `TagPicker`.
 *
 * Closed mode (`options` set): typing filters the options into a listbox,
 * Enter or comma adds the highlighted match or else the first one, and
 * nothing else can be added. Free mode: Enter, comma, Tab with text, and
 * blur commit the trimmed text. In both, Escape with text clears it and stops
 * there, so a page or modal Escape handler does not also fire.
 */
export function useTagEntry({
  tags,
  options,
  onAdd,
}: {
  tags: readonly string[];
  options?: readonly string[];
  onAdd: (tag: string) => void;
}) {
  const [draft, setDraft] = useState("");
  // `draft` mirrored into a ref so `commitDraft` always reads the latest
  // typed text, even from an AnimatePresence-exiting instance that renders
  // once more with a previous, now-stale `draft` closure.
  const draftRef = useRef(draft);
  const [highlight, setHighlight] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  // True from a pick until the next keystroke, so the listbox a pick closes
  // can leave at once and skip fading over the quick-add row.
  const [hasJustPicked, setHasJustPicked] = useState(false);
  const isClosed = options !== undefined;

  const matches = useMemo(() => {
    const query = tagMatchKey(draft);
    if (!options || !query) return [];
    const chosen = new Set(tags.map((tag) => tag.toLowerCase()));
    return options
      .filter(
        (option) =>
          option.toLowerCase().includes(query) &&
          !chosen.has(option.toLowerCase()),
      )
      .slice(0, MAX_MATCHES);
  }, [draft, options, tags]);

  const isListOpen = isClosed && isFocused && tagMatchKey(draft).length > 0;

  function reset() {
    draftRef.current = "";
    setDraft("");
    setHighlight(-1);
  }

  function pick(tag: string) {
    onAdd(tag);
    reset();
    setHasJustPicked(true);
  }

  function commitDraft() {
    const text = draftRef.current.trim();
    if (text) pick(text);
  }

  function pickMatch() {
    const choice = highlight > -1 ? matches[highlight] : matches[0];
    if (choice) pick(choice);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // An IME still composing a character (accents, CJK input) sends its own
    // Enter to confirm the composition; treating that as a commit would add
    // half-typed text. `keyCode === 229` covers browsers that do not set
    // `isComposing` on the key that closes composition.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, matches.length - 1));
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
    } else if (COMMIT_KEYS.includes(event.key)) {
      event.preventDefault();
      if (isClosed) pickMatch();
      else commitDraft();
    } else if (event.key === "Tab" && !isClosed && draft.trim()) {
      // Tab commits only when there is something to commit, so an empty input
      // still moves focus on.
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Escape" && draft) {
      event.stopPropagation();
      reset();
    }
    // Backspace deliberately does not remove the previous chip. Holding it to
    // clear the input would run on into chips already chosen and delete them
    // silently; the × on each chip is the only way to remove one.
  }

  return {
    draft,
    matches,
    highlight,
    isListOpen,
    hasJustPicked,
    pick,
    onKeyDown,
    // An Android virtual keyboard's comma key sends key "Unidentified" and
    // never reaches `onKeyDown`'s COMMIT_KEYS handling, so a comma can land
    // here instead, including a whole "a,b,c" dropped in by a paste. Free
    // mode commits every non-empty trimmed piece but the last through the
    // same `onAdd` a keyboard commit uses, and keeps the last piece as the
    // new draft, so free-mode text can never end up holding a comma. Closed
    // mode just drops every comma, the query has no use for one.
    onChange: (value: string) => {
      setHasJustPicked(false);
      if (!isClosed && value.includes(",")) {
        const pieces = value.split(",");
        const remaining = pieces.pop() ?? "";
        for (const piece of pieces) {
          const text = piece.trim();
          if (text) onAdd(text);
        }
        draftRef.current = remaining;
        setDraft(remaining);
        setHighlight(-1);
        return;
      }
      const nextValue = isClosed ? value.replaceAll(",", "") : value;
      draftRef.current = nextValue;
      setDraft(nextValue);
      setHighlight(-1);
    },
    onFocus: () => setIsFocused(true),
    // `isLeaving` comes from an AnimatePresence-exiting instance, which must
    // still clear the focused flag but must not re-commit a stale draft.
    onBlur: (isLeaving?: boolean) => {
      setIsFocused(false);
      if (!isClosed && !isLeaving) commitDraft();
    },
  };
}

export type TagEntry = ReturnType<typeof useTagEntry>;
