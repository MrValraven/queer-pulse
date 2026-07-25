import type { MessageReactionKey } from "../../shared/contracts/contracts";

/** Display order for the reaction picker + summary chips. */
export const REACTION_ORDER: MessageReactionKey[] = [
  "love",
  "laugh",
  "like",
  "wow",
  "sad",
  "thanks",
];

/** Emoji rendered for each reaction key. */
export const REACTION_EMOJI: Record<MessageReactionKey, string> = {
  love: "❤️",
  laugh: "😂",
  like: "👍",
  wow: "😮",
  sad: "😢",
  thanks: "🙏",
};
