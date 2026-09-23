import type { Conversation } from "../data";

/**
 * Whether a thread may show its counterpart's presence (the avatar's online
 * ring, the header's "Active now"). Spec section 5: nothing may imply a
 * person is sitting behind a business, so a counterpart speaking as a
 * listing, persona or company never shows presence, whatever a demo row or a
 * stale cache says about `online`. A deleted business shows none either,
 * even when its row carries no identity kind. A counterpart with no identity
 * kind, or speaking as their own profile, keeps the ordinary presence rules.
 */
export function shouldShowCounterpartPresence(
  conversation: Pick<
    Conversation,
    "counterpartIdentityKind" | "isCounterpartFormerBusiness"
  >,
): boolean {
  if (conversation.isCounterpartFormerBusiness) return false;
  return (
    !conversation.counterpartIdentityKind ||
    conversation.counterpartIdentityKind === "profile"
  );
}
