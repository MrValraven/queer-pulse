import { useState } from "react";
import { Avatar, ImageSlot } from "../../../../shared/components/ui";
import type { ListingTeamListingView } from "../api/listingTeam.types";

interface ListingTeamListingImageProps {
  listing: Pick<
    ListingTeamListingView,
    "imageUrl" | "imageFocus" | "tint" | "initials"
  >;
  size: number;
}

/** Decorative: the listing name always sits beside it as text. A photo keeps
 *  its saved focus through `ImageSlot`; without one (or after a failed load)
 *  the initials come from `Avatar`, which sizes them to the circle and renders
 *  no `span`, so the "Part of" chip rule `.partof span` never reaches them. */
export function ListingTeamListingImage({
  listing,
  size,
}: ListingTeamListingImageProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = listing.imageUrl;

  if (imageUrl && imageUrl !== failedImageUrl) {
    return (
      <ImageSlot
        src={imageUrl}
        alt=""
        shape="circle"
        tint={listing.tint}
        width={size}
        height={size}
        style={{ flexShrink: 0 }}
        focus={listing.imageFocus}
        onLoadError={() => setFailedImageUrl(imageUrl)}
      />
    );
  }

  return (
    <Avatar
      initials={listing.initials}
      tint={listing.tint}
      size={size}
      aria-hidden="true"
    />
  );
}
