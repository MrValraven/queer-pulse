/**
 * Static copy for `DeskModals`: the pass-note starting points and the
 * keyboard-shortcut reference list. Ported from the DesignSync overlays source
 * (`mag-app-overlays.jsx`). Both tables hold i18n KEYS: a `*.data.ts` file has
 * no `t()` of its own, and `local/no-literal-string` is scoped off in data
 * files, which is how this platform-authored chrome sat here in English only
 * for so long. Each render site resolves the keys through `t()`.
 */

export interface PassTemplate {
  id: string;
  /** i18n key for the chip's name. */
  labelKey: string;
  /** i18n key for the note this template seeds into the textarea. `PassModal`
   *  MUST resolve this before it reaches the field: an editor edits the text
   *  and sends it to a writer, so a raw key would go out as the note. */
  bodyKey: string;
}

/** Starting points for the "Pass on a pitch" note — a human line beats a form rejection. */
export const PASS_TEMPLATES: PassTemplate[] = [
  {
    id: "notus",
    labelKey: "magazine:desk.modals.pass.templates.notForUs.label",
    bodyKey: "magazine:desk.modals.pass.templates.notForUs.body",
  },
  {
    id: "notnow",
    labelKey: "magazine:desk.modals.pass.templates.notNow.label",
    bodyKey: "magazine:desk.modals.pass.templates.notNow.body",
  },
  {
    id: "elsewhere",
    labelKey: "magazine:desk.modals.pass.templates.anotherSection.label",
    bodyKey: "magazine:desk.modals.pass.templates.anotherSection.body",
  },
  {
    // The chip's name is the same verdict the pitch row offers as a button and
    // reads identically, so it points at that key instead of a second copy of
    // the same three words. The note body is this modal's own.
    id: "deck",
    labelKey: "magazine:desk.pitchRow.betterAsDeck",
    bodyKey: "magazine:desk.modals.pass.templates.betterAsDeck.body",
  },
];

/** The two directions the piece record's publish confirm can run in. */
export type PiecePublishIntent = "publish" | "unpublish";

/** One confirm dialog's copy, as i18n keys the modal resolves through `t()`. */
export interface PiecePublishConfirmCopy {
  titleKey: string;
  subKey: string;
  bodyKey: string;
  confirmKey: string;
}

/**
 * Confirm copy for publishing and unpublishing a piece, keyed by intent.
 * Publishing puts a person's writing in front of readers and unpublishing
 * takes it away from them again: both are worth one deliberate click, and the
 * scheduled case reuses the publish copy with its own sub-line (the modal
 * swaps `subKey` when the picked instant is in the future).
 */
export const PIECE_PUBLISH_CONFIRM: Record<
  PiecePublishIntent,
  PiecePublishConfirmCopy
> = {
  publish: {
    titleKey: "magazine:piece.publish.confirmPublishTitle",
    subKey: "magazine:piece.publish.confirmPublishSub",
    bodyKey: "magazine:piece.publish.confirmPublishBody",
    confirmKey: "magazine:piece.publish.confirmPublishCta",
  },
  unpublish: {
    titleKey: "magazine:piece.publish.confirmUnpublishTitle",
    subKey: "magazine:piece.publish.confirmUnpublishSub",
    bodyKey: "magazine:piece.publish.confirmUnpublishBody",
    confirmKey: "magazine:piece.publish.confirmUnpublishCta",
  },
};

export interface ShortcutRow {
  /** The chord as typed, shown verbatim. A key name is the same in every
   *  locale, so this one stays a literal. */
  keys: string;
  /** i18n key for what the chord does. */
  labelKey: string;
}

/** Chord / description pairs for the "Keyboard" reference modal. */
export const SHORTCUTS: ShortcutRow[] = [
  { keys: "j / k", labelKey: "magazine:desk.modals.shortcuts.moveBetween" },
  { keys: "o", labelKey: "magazine:desk.modals.shortcuts.openFocused" },
  { keys: "c", labelKey: "magazine:desk.modals.shortcuts.chaseWriter" },
  { keys: "w", labelKey: "magazine:desk.modals.shortcuts.writeYourself" },
  { keys: "y / n", labelKey: "magazine:desk.modals.shortcuts.triageTopPitch" },
  { keys: "⌘K", labelKey: "magazine:desk.modals.shortcuts.jumpAnywhere" },
  { keys: "?", labelKey: "magazine:desk.modals.shortcuts.thisList" },
];
