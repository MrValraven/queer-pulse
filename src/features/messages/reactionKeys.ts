import type {
  MessageReactionKey,
  ReactionSummary,
} from "../../shared/contracts/contracts";

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

/**
 * Whether the signed-in member already reacted with `key`, read from a
 * message's current reaction summaries. Every reaction-picker call site must
 * pass the caller the *actual* prior state (not a hardcoded `false`) so
 * `onReactionToggle` can tell add from remove — otherwise re-picking a
 * reaction you already have re-adds it and the count spams upward instead of
 * toggling off. `ReactionChips` gets this for free from its own summaries;
 * this is for the picker surfaces (hover bar, long-press overlay, right-click
 * menu), which only know the key the user tapped.
 */
export function findReactionMine(
  reactions: ReactionSummary[] | undefined,
  key: MessageReactionKey,
): boolean {
  return reactions?.find((reaction) => reaction.key === key)?.mine ?? false;
}
