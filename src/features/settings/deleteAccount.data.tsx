export type DeleteOption = "deactivate" | "delete";

// i18n note: `text` used to hold a raw ReactNode with the `<strong>` emphasis
// baked in. It's now a catalog key resolved via `<Translation>` at render
// (Pattern A) so the rich text can be translated at all.
interface WhatItem {
  color: string;
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
        color: "rgba(45,27,61,.3)",
        textKey: "settings:deleteAccount.wh.deactivate.profileHidden",
      },
      {
        color: "var(--jade)",
        textKey: "settings:deleteAccount.wh.deactivate.dataPreserved",
      },
      {
        color: "var(--jade)",
        textKey: "settings:deleteAccount.wh.deactivate.reactivateInstantly",
      },
      {
        color: "rgba(45,27,61,.3)",
        textKey: "settings:deleteAccount.wh.deactivate.nameRemoved",
      },
      {
        color: "rgba(45,27,61,.3)",
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
        color: "var(--accent-ink)",
        textKey: "settings:deleteAccount.wh.delete.queuedForDeletion",
      },
      {
        color: "var(--accent-ink)",
        textKey: "settings:deleteAccount.wh.delete.messagesDeleted",
      },
      {
        color: "var(--accent-ink)",
        textKey: "settings:deleteAccount.wh.delete.postsRemoved",
      },
      {
        color: "rgba(45,27,61,.3)",
        textKey: "settings:deleteAccount.wh.delete.emailSuppressed",
      },
      {
        color: "rgba(45,27,61,.3)",
        textKey: "settings:deleteAccount.wh.delete.exportFirst",
      },
    ],
    phraseKey: "settings:deleteAccount.phrase.delete",
    confirmHintKey: "settings:deleteAccount.confirmHint.delete",
    btnLabelKey: "settings:deleteAccount.btnLabel.delete",
    isDanger: true,
  },
};
