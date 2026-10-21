import { useState } from "react";
import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import type { StudioFormat } from "./api/studio.types";
import { StudioCoverFallback } from "./kit/StudioCoverFallback";

/**
 * A release, show or episode cover that fills its positioned frame: the art
 * when it loads, else the wordless fallback in the cover's hue (the format
 * icon for spoken formats, the title's first letter for music). A broken
 * link falls back the same way, so no frame ever prints a caption.
 */
export function StudioReleaseCoverArt({
  src,
  title,
  format,
  tint,
  radius = 0,
  isPriority = false,
}: {
  src: string | null;
  title: string;
  format: StudioFormat;
  tint: ImageSlotTint;
  radius?: number;
  /** The page's hero cover: loads first, with high priority. */
  isPriority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc)
    return (
      <StudioCoverFallback
        title={title}
        kind={format === "music" ? undefined : format}
        tint={tint}
      />
    );
  return (
    <ImageSlot
      src={src}
      tint={tint}
      width="100%"
      height="100%"
      radius={radius}
      placeholder=""
      style={{ position: "absolute", inset: 0 }}
      loading={isPriority ? "eager" : undefined}
      fetchPriority={isPriority ? "high" : undefined}
      onLoadError={() => setFailedSrc(src)}
    />
  );
}
