import type { CSSProperties } from "react";
import { ImageSlot } from "../../../../shared/components/ui";
import { StudioCoverFallback } from "../../kit/StudioCoverFallback";
import type { StudioQueueItem } from "../studioPlayerContext";
import styles from "../../StudioPlayer.module.css";

type StudioPlayerArtItem = Pick<
  StudioQueueItem,
  "coverUrl" | "tint" | "releaseTitle" | "isEpisode"
>;

/** A player cover: the art, or the kit's fallback in the cover's hue (a
 *  mic for an episode, a note for music) when the item has none, so a
 *  missing cover never reads as a blank square. `size` is a square in px;
 *  `fill` covers the positioned frame around it instead. Decorative: the
 *  titles beside it name the track. */
export function StudioPlayerArt({
  item,
  size,
  fill = false,
  radius,
}: {
  item: StudioPlayerArtItem;
  size?: number;
  fill?: boolean;
  radius: number;
}) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0 }
    : undefined;
  if (!item.coverUrl)
    return (
      <span
        className={styles.artFallback}
        style={{
          ...fillStyle,
          width: fill ? "100%" : size,
          height: fill ? "100%" : size,
          borderRadius: radius,
        }}
      >
        <StudioCoverFallback
          title={item.releaseTitle}
          kind={item.isEpisode === true ? "podcast" : "music"}
          tint={item.tint}
        />
      </span>
    );
  return (
    <ImageSlot
      src={item.coverUrl}
      tint={item.tint}
      width={fill ? "100%" : size}
      height={fill ? "100%" : size}
      radius={radius}
      placeholder=""
      style={fillStyle}
    />
  );
}
