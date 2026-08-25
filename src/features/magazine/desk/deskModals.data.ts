/**
 * Static copy for `DeskModals`: the pass-note starting points and the
 * keyboard-shortcut reference list. Ported verbatim from the DesignSync
 * overlays source (`mag-app-overlays.jsx`) — values unchanged.
 */

export interface PassTemplate {
  id: string;
  label: string;
  body: string;
}

/** Starting points for the "Pass on a pitch" note — a human line beats a form rejection. */
export const PASS_TEMPLATES: PassTemplate[] = [
  {
    id: "notus",
    label: "Not for us",
    body: "Thank you for trusting us with this. It is not the right fit for QueerPulse. We are not the home this piece deserves, and I would rather say so than sit on it. Please do send us the next one.",
  },
  {
    id: "notnow",
    label: "Not now",
    body: "I like this a lot, but issue 14 is full and the timing works against it. Can I come back to you for issue 16, when the theme is closer? No obligation either way.",
  },
  {
    id: "elsewhere",
    label: "Try another section",
    body: "This does not work as a feature, but it would sit beautifully in Service: shorter, more practical, same reporting. Want me to commission it that way?",
  },
  {
    id: "deck",
    label: "Better as a deck",
    body: "The reporting is strong but the shape is wrong: this is a deck, not an essay. If you are up for it, I would commission it as eight or nine slides.",
  },
];

/** Key / label pairs for the "Keyboard" reference modal. */
export const SHORTCUTS: [string, string][] = [
  ["j / k", "Move between pieces"],
  ["o", "Open the focused piece"],
  ["c", "Chase the writer"],
  ["w", "Write a piece yourself"],
  ["y / n", "Triage the top pitch"],
  ["⌘K", "Jump anywhere, or start a piece"],
  ["?", "This list"],
];
