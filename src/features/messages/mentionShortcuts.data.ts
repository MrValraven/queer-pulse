// Static config for the composer's "?" shortcut popover: the six mention
// sigils the chat supports (mirrors src/shared/mentions/detectTrigger.ts).
// `sigil` is what gets dropped into the draft; `labelKey` is a messages-
// namespace i18n key describing what it links.

export interface MentionShortcut {
  /** The sigil inserted into the draft when the row is tapped. */
  sigil: string;
  /** messages-namespace key for the row's description. */
  labelKey: string;
}

export const MENTION_SHORTCUTS: MentionShortcut[] = [
  { sigil: "@", labelKey: "messages:shortcuts.member" },
  { sigil: "c/", labelKey: "messages:shortcuts.community" },
  { sigil: "#", labelKey: "messages:shortcuts.topic" },
  { sigil: "b/", labelKey: "messages:shortcuts.business" },
  { sigil: "e/", labelKey: "messages:shortcuts.event" },
  { sigil: "t/", labelKey: "messages:shortcuts.thread" },
];
