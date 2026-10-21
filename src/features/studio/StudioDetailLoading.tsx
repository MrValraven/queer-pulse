import { StudioHeroSkeleton, StudioTracklistSkeleton } from "./StudioSkeletons";

/** A detail page while its read is in flight: the hero's shape, then the
 *  tracklist's rows, announced once by `label` ("Loading this release").
 *  The hero that replaces it settles in with its own fade. A page with no
 *  tracklist passes `rows={0}`. */
export function StudioDetailLoading({
  label,
  rows = 6,
}: {
  label: string;
  rows?: number;
}) {
  return (
    <>
      <StudioHeroSkeleton label={label} />
      {rows > 0 && (
        <StudioTracklistSkeleton
          rows={rows}
          showCover={false}
          label={label}
          isDecorative
        />
      )}
    </>
  );
}
