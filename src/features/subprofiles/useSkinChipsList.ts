import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePositionalRowKeys } from "./usePositionalRowKeys";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";

const FLASH_DURATION_MS = 1400;
const NO_BREAK_SPACE = String.fromCharCode(0xa0);

/** Case-insensitive, trimmed identity used for the duplicate check. */
function chipIdentity(text: string): string {
  return text.trim().toLocaleLowerCase();
}

/** The stored list, read defensively: only non-blank strings count, so a
 *  blank line left behind by the older line editor never renders as a chip
 *  and is dropped by the first write. */
function readChips(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );
}

/**
 * The data side of `SkinChipsControl`: the chip strings at `path`, their
 * positional React keys, and every write (add, remove, swap, replace). Each
 * write also queues a screen reader announcement, and a rejected duplicate
 * flashes the chip that already holds it and sets a visible notice.
 */
export function useSkinChipsList(
  path: string,
  editor: SubprofileSkinBlocksEditor,
) {
  const { t } = useTranslation();
  const entries = readChips(editor.getValue(path));
  const rowKeys = usePositionalRowKeys(entries.length);
  const [announcement, setAnnouncement] = useState({ message: "", count: 0 });
  const [notice, setNotice] = useState("");
  const [flashingKey, setFlashingKey] = useState<string | null>(null);
  const flashTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(flashTimerRef.current), []);

  const commit = (next: string[]) => editor.setValue(path, next);
  const announce = (message: string) =>
    setAnnouncement((previous) => ({ message, count: previous.count + 1 }));

  const indexOfDuplicate = (text: string, ignoreIndex = -1) =>
    entries.findIndex(
      (entry, index) =>
        index !== ignoreIndex && chipIdentity(entry) === chipIdentity(text),
    );

  const flagDuplicate = (existingIndex: number) => {
    const existing = entries[existingIndex]!;
    const message = t("subprofiles:skinChips.duplicate", { text: existing });
    setNotice(message);
    announce(message);
    setFlashingKey(rowKeys.keys[existingIndex] ?? null);
    window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(
      () => setFlashingKey(null),
      FLASH_DURATION_MS,
    );
  };

  /** Append each non-blank text once. Returns false when any text was
   *  already on the list. */
  const addMany = (texts: string[]): boolean => {
    const next = [...entries];
    let isAllAdded = true;
    const added: string[] = [];
    for (const text of texts.map((candidate) => candidate.trim())) {
      if (!text) continue;
      const existingIndex = next.findIndex(
        (entry) => chipIdentity(entry) === chipIdentity(text),
      );
      // A repeat inside one paste is folded quietly; only a clash with a chip
      // already on the list is worth telling the owner about.
      if (existingIndex >= entries.length) continue;
      if (existingIndex >= 0) {
        isAllAdded = false;
        flagDuplicate(existingIndex);
        continue;
      }
      next.push(text);
      added.push(text);
    }
    if (added.length === 0) return isAllAdded;
    commit(next);
    if (isAllAdded) setNotice("");
    announce(
      added.length === 1
        ? t("subprofiles:skinChips.added", { text: added[0]! })
        : t("subprofiles:skinChips.addedMany", { count: added.length }),
    );
    return isAllAdded;
  };

  const removeAt = (index: number) => {
    const removed = entries[index];
    if (removed === undefined) return;
    rowKeys.removeAt(index);
    commit(entries.filter((_, entryIndex) => entryIndex !== index));
    announce(t("subprofiles:skinChips.removed", { text: removed }));
  };

  /** Swap two neighbours. `shouldAnnounce` is off for the intermediate steps
   *  of a pointer drag, which announces once on drop. */
  const swap = (from: number, to: number, shouldAnnounce = true) => {
    if (to < 0 || to >= entries.length || from === to) return;
    const next = [...entries];
    [next[from], next[to]] = [next[to]!, next[from]!];
    rowKeys.swap(from, to);
    commit(next);
    if (shouldAnnounce) announceMoved(next[to], to);
  };

  const announceMoved = (text: string, index: number) =>
    announce(
      t("subprofiles:skinChips.moved", {
        text,
        position: index + 1,
        total: entries.length,
      }),
    );

  /** Commit an in-place edit. Blank removes the chip; a text another chip
   *  already holds is refused and flags that chip instead. */
  const replaceAt = (index: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return removeAt(index);
    if (trimmed === entries[index]) return;
    const duplicateIndex = indexOfDuplicate(trimmed, index);
    if (duplicateIndex >= 0) return flagDuplicate(duplicateIndex);
    commit(entries.map((entry, at) => (at === index ? trimmed : entry)));
  };

  return {
    entries,
    keys: rowKeys.keys,
    flashingKey,
    notice,
    clearNotice: () => setNotice(""),
    /** Alternates a trailing no-break space so a repeated message is still
     *  a change the live region reads out. */
    announcement:
      announcement.message + (announcement.count % 2 ? NO_BREAK_SPACE : ""),
    addMany,
    removeAt,
    swap,
    announceMoved,
    replaceAt,
  };
}

export type SkinChipsList = ReturnType<typeof useSkinChipsList>;
