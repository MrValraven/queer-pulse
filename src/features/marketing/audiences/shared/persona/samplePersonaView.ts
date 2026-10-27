import {
  publicSubprofileToView,
  type PublicSubprofileView,
} from "../../../../subprofiles/api/subprofiles.adapters";
import type { SubprofilePublicDTO } from "../../../../subprofiles/api/subprofiles.api";

/** An invisible word joiner (U+2060). Built from its code point so the
 *  character itself never sits in source. */
const WORD_JOINER = String.fromCharCode(0x2060);

/**
 * Every sigil the persona hero resolves to a name over the network: a member
 * `@`, a community `c/`, a business `b/`, an event `e/`, a thread `t/`. Topic
 * `#` tags keep their own label and are never resolved. Matched wherever it
 * sits, since a markdown span can start a mention flush against `**`.
 */
const RESOLVABLE_SIGIL = /(@|c\/|b\/|e\/|t\/)(?=[a-z0-9])/gi;

/**
 * Text that reads exactly as written and holds no mention token: a word
 * joiner before each sigil takes away the whitespace boundary
 * `parseMentions` needs, so the hero shows plain text and resolves nothing.
 */
export function withoutMentionTokens(text: string): string {
  return text.replace(RESOLVABLE_SIGIL, `${WORD_JOINER}$1`);
}

/**
 * The view a sample persona renders from. Two fields are pinned so the page
 * fires no request whatever the sample DTO says:
 * - `endorsementCount` is 0, which keeps the endorser list (read by the
 *   tattoo layout's affiliations block) switched off;
 * - the bio and tagline carry no mention token, which keeps the hero's
 *   mention-name lookup switched off for a signed-in viewer.
 */
export function toSamplePersonaView(
  dto: SubprofilePublicDTO,
): PublicSubprofileView {
  const view = publicSubprofileToView(dto);
  return {
    ...view,
    endorsementCount: 0,
    bio: withoutMentionTokens(view.bio),
    tagline: withoutMentionTokens(view.tagline),
  };
}
