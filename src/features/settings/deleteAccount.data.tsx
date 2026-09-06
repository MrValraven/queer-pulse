export type DeleteOption = "deactivate" | "delete";

// i18n note: `text` used to hold a raw ReactNode with the `<strong>` emphasis
// baked in. It's now a catalog key resolved via `<Translation>` at render
// (Pattern A) so the rich text can be translated at all.
/**
 * `tone` names the dot beside the line, resolved to a class in
 * `DeleteAccountSection`. It held a colour STRING until 2026-09-06, including a
 * raw `rgba(45,27,61,.3)` that hardcoded the plum channels the design tokens
 * own and does not flip in dark mode (DES-170).
 */
interface WhatItem {
  tone: "muted" | "keeps" | "loses";
  textKey: string;
}

export const DELETE_CONTENT: Record<
  DeleteOption,
  {
    whatHappens: WhatItem[];
    /** Catalog key for the typed-confirmation phrase, or `null` for none.
     * Client-only match target (never sent to an API) — safe to fully
     * translate since display and comparison both resolve from this key. */
    phraseKey: string | null;
    /** Sits under the typed-confirmation box. Must match what actually happens. */
    confirmHintKey: string;
    btnLabelKey: string;
    isDanger: boolean;
  }
> = {
  deactivate: {
    whatHappens: [
      {
        tone: "muted",
        textKey: "settings:deleteAccount.wh.deactivate.profileHidden",
      },
      {
        tone: "keeps",
        textKey: "settings:deleteAccount.wh.deactivate.dataPreserved",
      },
      {
        tone: "keeps",
        textKey: "settings:deleteAccount.wh.deactivate.reactivateInstantly",
      },
      {
        tone: "muted",
        textKey: "settings:deleteAccount.wh.deactivate.nameRemoved",
      },
      {
        tone: "muted",
        textKey: "settings:deleteAccount.wh.deactivate.attributedDeactivated",
      },
    ],
    // Typed confirmation is the real gate on both paths now. It used to be a
    // password box, but auth is OAuth-only and the backend never checked it, so
    // deactivate had no confirmation step at all once that box was removed.
    phraseKey: "settings:deleteAccount.phrase.deactivate",
    confirmHintKey: "settings:deleteAccount.confirmHint.deactivate",
    btnLabelKey: "settings:deleteAccount.btnLabel.deactivate",
    isDanger: false,
  },
  delete: {
    whatHappens: [
      {
        tone: "loses",
        textKey: "settings:deleteAccount.wh.delete.queuedForDeletion",
      },
      {
        tone: "loses",
        textKey: "settings:deleteAccount.wh.delete.messagesDeleted",
      },
      {
        tone: "loses",
        textKey: "settings:deleteAccount.wh.delete.postsRemoved",
      },
      {
        tone: "muted",
        textKey: "settings:deleteAccount.wh.delete.emailSuppressed",
      },
      {
        tone: "muted",
        textKey: "settings:deleteAccount.wh.delete.exportFirst",
      },
    ],
    phraseKey: "settings:deleteAccount.phrase.delete",
    confirmHintKey: "settings:deleteAccount.confirmHint.delete",
    btnLabelKey: "settings:deleteAccount.btnLabel.delete",
    isDanger: true,
  },
};
