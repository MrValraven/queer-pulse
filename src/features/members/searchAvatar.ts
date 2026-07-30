import type { AvatarTint } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { tintForSlug } from "./api/members.adapters";
import { memberAvatar } from "./data/members";
import type { SearchItem } from "./search.data";

export interface SearchAvatar {
  initials: string;
  tint: AvatarTint;
  photo?: string;
}

/**
 * Resolve the avatar for a member search row. Prefers the local registry (demo
 * members carry photo/initials/tint), then falls back to the live `avatarUrl`
 * with initials + a deterministic tint derived from the row. Returns undefined
 * for non-member rows so they keep their type icon.
 */
export function memberRowAvatar(item: SearchItem): SearchAvatar | undefined {
  if (item.t !== "member" || !item.slug) return undefined;
  const registryAvatar = memberAvatar(item.slug);
  if (registryAvatar) {
    return { ...registryAvatar, photo: item.avatarUrl ?? registryAvatar.photo };
  }
  return {
    initials: initialsFromName(item.name),
    tint: tintForSlug(item.slug),
    photo: item.avatarUrl,
  };
}
