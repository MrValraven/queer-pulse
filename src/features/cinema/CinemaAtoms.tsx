import type { ReactNode } from "react";
import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * A split display title with the coral-italic emphasis word:
 * `pre` + `<em>em</em>` + `post`. Style-agnostic — the emphasis colour comes
 * from each consumer's own `h2/h3 em` rule, so the one atom serves every cinema
 * poster/collection/watch title that follows the `titlePre/titleEm/titlePost`
 * data shape. (Promoted from the shorts-only `ShortTitle`.)
 */
export function SplitTitle({
  pre,
  em,
  post,
}: {
  pre?: ReactNode;
  em?: ReactNode;
  post?: ReactNode;
}) {
  return (
    <>
      {pre}
      {em && <em>{em}</em>}
      {post}
    </>
  );
}

/**
 * The absolute-inset poster image shared by every cinema poster card. The
 * parent element owns the aspect-ratio frame and any sibling badges; this fills
 * it. Style-agnostic — pass `radius` to match each card's corner. Placeholder
 * defaults to the generic poster caption but can be overridden per surface.
 */
export function PosterSlot({
  src,
  tint,
  alt,
  radius = 12,
  placeholder,
  srcSize,
}: {
  src?: string;
  tint?: ImageSlotTint;
  alt?: string;
  radius?: number;
  placeholder?: string;
  srcSize?: number;
}) {
  const { t } = useTranslation();
  return (
    <ImageSlot
      src={src}
      alt={alt}
      tint={tint}
      width="100%"
      height="100%"
      radius={radius}
      srcSize={srcSize}
      placeholder={placeholder ?? t("cinema:slot.poster")}
      style={{ position: "absolute", inset: 0 }}
    />
  );
}
