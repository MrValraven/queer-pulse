import { useEffect, useEffectEvent, useState, type RefObject } from "react";
import { parseKey, resolveEntry } from "../../shared/i18n/translate";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  multiSelectEntry,
  multiSelectValues,
  typedEntryResult,
  type MultiSelectEntry,
  type MultiSelectOption,
} from "./skinMultiSelectValue";
import { useOtherLanguageCatalog } from "./useOtherLanguageCatalog";

const ADDED_KEY = "subprofiles:skinControl.multiSelect.added";
const REMOVED_KEY = "subprofiles:skinControl.multiSelect.removed";
const ALREADY_CHOSEN_KEY = "subprofiles:skinControl.multiSelect.alreadyChosen";

/** The field's elements, owned by the component (the hook only reads them in
 *  effects and handlers): the whole field, the trigger and the open panel. */
export interface SkinMultiSelectRefs {
  rootRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
}

export interface SkinMultiSelect {
  options: MultiSelectOption[];
  /** The chosen entries, in stored (pick) order. */
  entries: MultiSelectEntry[];
  isChosen: (value: string) => boolean;
  isOpen: boolean;
  /** The "Add your own" input's text. */
  draft: string;
  setDraft: (text: string) => void;
  /** The polite live region's latest line ("Added …", "Removed …"). */
  announcement: string;
  /** Opens the panel, or closes it keeping any typed text. */
  toggleOpen: () => void;
  /** Done: adds any typed text, closes, and puts focus on the trigger. */
  finish: () => void;
  /** A checkbox: silent, since the checkbox state already speaks. */
  toggle: (value: string) => void;
  /** A chip's remove button, announced. */
  removeChip: (value: string) => void;
  addDraft: () => void;
}

/**
 * State and edits of one `multiSelect` control. Every edit stores the chosen
 * values as a `string[]` in pick order: ticking appends, unticking removes,
 * and typed text is appended trimmed (or ticks the option its label names).
 * Each write goes through `multiSelectValues`, so an older comma string or a
 * stored label (in either language) is rewritten to option ids on the next
 * change.
 *
 * Closing with Done, the trigger or a pointer down outside adds any typed
 * text first; Escape closes and drops it. While open, Escape is caught on
 * `document` in the capture phase with `stopPropagation`, so it works
 * wherever focus drifted and an enclosing sheet listening on `document`
 * stays open.
 */
export function useSkinMultiSelect(
  control: SkinBlockControl,
  editor: SubprofileSkinBlocksEditor,
  { rootRef, triggerRef, panelRef }: SkinMultiSelectRefs,
): SkinMultiSelect {
  const { t, language } = useTranslation();
  const otherCatalog = useOtherLanguageCatalog(language);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const options: MultiSelectOption[] = (control.options ?? []).map(
    (option) => ({
      value: option.value,
      label: t(option.labelKey),
      otherLabel: resolveEntry(
        otherCatalog ?? undefined,
        parseKey(option.labelKey).path,
        language === "en" ? "pt" : "en",
      ),
    }),
  );
  const chosenValues = multiSelectValues(
    editor.getValue(control.path),
    options,
  );
  const entries = chosenValues.map((value) => multiSelectEntry(value, options));
  const labelOf = (value: string) => multiSelectEntry(value, options).label;

  function store(next: string[]): void {
    editor.setValue(control.path, next);
  }

  function toggle(value: string): void {
    store(
      chosenValues.includes(value)
        ? chosenValues.filter((chosen) => chosen !== value)
        : [...chosenValues, value],
    );
  }

  function removeChip(value: string): void {
    store(chosenValues.filter((chosen) => chosen !== value));
    setAnnouncement(t(REMOVED_KEY, { label: labelOf(value) }));
  }

  function addDraft(): void {
    const result = typedEntryResult(draft, chosenValues, options);
    if (result.kind === "blank") return;
    setDraft("");
    if (result.kind === "alreadyChosen") {
      setAnnouncement(t(ALREADY_CHOSEN_KEY, { label: labelOf(result.value) }));
      return;
    }
    store([...chosenValues, result.value]);
    setAnnouncement(t(ADDED_KEY, { label: labelOf(result.value) }));
  }

  function closeKeepingDraft(): void {
    addDraft();
    setIsOpen(false);
  }

  // Opening moves focus to the first checkbox.
  useEffect(() => {
    if (!isOpen) return;
    panelRef.current
      ?.querySelector<HTMLInputElement>("input[type='checkbox']")
      ?.focus();
  }, [isOpen, panelRef]);

  const onOutsidePointer = useEffectEvent((event: PointerEvent) => {
    const target = event.target;
    if (target instanceof Node && rootRef.current?.contains(target)) return;
    closeKeepingDraft();
  });

  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    const focused = document.activeElement;
    const isFocusInField =
      !focused ||
      focused === document.body ||
      Boolean(rootRef.current?.contains(focused));
    setDraft("");
    setIsOpen(false);
    // Focus goes back to the trigger unless it had moved to another control.
    if (isFocusInField) triggerRef.current?.focus();
  });

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => onOutsidePointer(event);
    const onKeyDown = (event: KeyboardEvent) => onEscape(event);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOpen]);

  return {
    options,
    entries,
    isChosen: (value) => chosenValues.includes(value),
    isOpen,
    draft,
    setDraft,
    announcement,
    toggleOpen: () => (isOpen ? closeKeepingDraft() : setIsOpen(true)),
    finish: () => {
      closeKeepingDraft();
      triggerRef.current?.focus();
    },
    toggle,
    removeChip,
    addDraft,
  };
}
