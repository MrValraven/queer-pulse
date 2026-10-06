import type { TFunction } from "../../shared/i18n/types";
import type { Community } from "../homepage/data/types";

/** The fields of a community the share message reads. */
export type ShareMessageCommunity = Pick<
  Community,
  "name" | "description" | "count"
>;

/** A tagline fits a line or two. Past this a long description would fill the
 *  whole chat bubble, so it is cut at the last whole word with an ellipsis. */
const DESCRIPTION_MAX_LENGTH = 160;

/** The tagline the hero shows under the name, on one line and capped. */
function descriptionLine(description: string, t: TFunction): string {
  const text = description.trim().replace(/\s+/g, " ");
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  // One character past the cap, so a word ending exactly at the cap is kept.
  const candidate = text.slice(0, DESCRIPTION_MAX_LENGTH + 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const wholeWords =
    lastSpace > 0
      ? candidate.slice(0, lastSpace)
      : text.slice(0, DESCRIPTION_MAX_LENGTH);
  return t("communities:detail.share.message.shortened", {
    text: wholeWords.replace(/[\s,;:.!?-]+$/, ""),
  });
}

/**
 * "128 members", in the sender's language. `count` is the hero's own label:
 * a number for an open roster, "Members only" for a private one, where the
 * hero shows no number and so the line is left out too.
 */
function memberCountLine(count: string, t: TFunction): string {
  const memberCount = parseInt(count, 10);
  if (Number.isNaN(memberCount) || memberCount <= 0) return "";
  return t("communities:common.count.members", { count: memberCount });
}

/**
 * The text a member passes on when they share a community: its name, its
 * tagline and how many members it has, one per line, with the link added
 * after by the share menu. It carries only what the hero shows any visitor,
 * so a forwarded message names nobody on the roster. A line with nothing to
 * say is left out.
 */
export function buildCommunityShareMessage(
  community: ShareMessageCommunity,
  t: TFunction,
): string {
  return [
    community.name.trim(),
    descriptionLine(community.description, t),
    memberCountLine(community.count, t),
  ]
    .filter(Boolean)
    .join("\n");
}
