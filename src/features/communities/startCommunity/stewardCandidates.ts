import type { CohostCandidate } from "../../gatherings/manageCohosts.data";
import type { ConnectionView } from "../../connect/connections.data";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { TintKey } from "./startCommunity.data";

/** Map an accepted-connection view onto the shape MemberPicker consumes. */
export function connectionToCandidate(view: ConnectionView): CohostCandidate {
  return {
    slug: view.slug,
    name: view.name,
    role: view.role,
    initials: view.initials,
    tint: view.tint,
    photo: view.photo,
  };
}

const STEWARD_TINTS: readonly TintKey[] = ["coral", "jade", "plum"];

/** Narrow a member's AvatarTint to the community steward tint set (fallback plum). */
export function toStewardTint(tint: AvatarTint): TintKey {
  return (STEWARD_TINTS as readonly string[]).includes(tint)
    ? (tint as TintKey)
    : "plum";
}
