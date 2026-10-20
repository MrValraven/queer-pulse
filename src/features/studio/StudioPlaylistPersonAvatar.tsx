import { Avatar } from "../../shared/components/ui";
import type { StudioPlaylistPersonView } from "./api/studio.adapters";

/** A playlist person's round face: their photo, else their initials on their
 *  tint. Decorative: callers wrap it in an `aria-hidden` span and always
 *  write the name beside it. */
export function StudioPlaylistPersonAvatar({
  person,
  size,
}: {
  person: StudioPlaylistPersonView;
  size: number;
}) {
  return (
    <Avatar
      src={person.avatarUrl ?? undefined}
      tint={person.tint}
      size={size}
      initials={person.initials}
      aria-hidden="true"
    />
  );
}
