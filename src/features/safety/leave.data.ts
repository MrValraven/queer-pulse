export type LeaveState = "considering" | "pausing" | "paused" | "confirmed";

export const DELETED = [
  "Your profile, bio, and display name",
  "Your connections and message history",
  "Your gathering history and earned badges",
  "Your saved articles and reading history",
  "Your invite history and vouches given",
];

export const PAUSE_EFFECTS = [
  "Your profile becomes invisible to other members",
  "You won't appear in search or the member directory",
  "All notifications are paused",
  "All your data, badges, and connections are preserved",
  "Sign back in at any time to reactivate instantly",
];

export const DURATIONS = [
  { label: "1 month", back: "Back on 6 July 2026" },
  { label: "3 months", back: "Back on 6 September 2026" },
  { label: "6 months", back: "Back on 6 December 2026" },
];
