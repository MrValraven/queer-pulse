import { useState } from "react";
import { Avatar, ImageSlot } from "../../../../shared/components/ui";
import type { ListingTeamPersonaView } from "../api/listingTeam.types";

interface ListingTeamPersonaAvatarProps {
  persona: Pick<
    ListingTeamPersonaView,
    "avatarUrl" | "avatarCrop" | "initials"
  >;
  size: number;
}

/** Decorative: the persona name always sits beside it as text. A photo keeps
 *  its saved crop through `ImageSlot`; without one (or after a failed load)
 *  the initials come from `Avatar`, which sizes them to the circle. */
export function ListingTeamPersonaAvatar({
  persona,
  size,
}: ListingTeamPersonaAvatarProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const avatarUrl = persona.avatarUrl;

  if (avatarUrl && avatarUrl !== failedAvatarUrl) {
    return (
      <ImageSlot
        src={avatarUrl}
        alt=""
        shape="circle"
        tint="plum"
        width={size}
        height={size}
        style={{ flexShrink: 0 }}
        crop={persona.avatarCrop}
        onLoadError={() => setFailedAvatarUrl(avatarUrl)}
      />
    );
  }

  return (
    <Avatar
      initials={persona.initials}
      tint="plum"
      size={size}
      aria-hidden="true"
    />
  );
}
