import type { IconType } from "react-icons";
import {
  FiEye,
  FiFileText,
  FiInfo,
  FiLock,
  FiMousePointer,
  FiSliders,
} from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  LISTING_PREVIEW_IDLE_CAPTION_KEY,
  LISTING_PREVIEW_WILL_SHOW_CAPTION_KEY,
  type ListingFieldPlacement,
} from "./listingPreviewRegions.data";
import styles from "./ListingLivePreview.module.css";

const KIND_ICONS: Record<ListingFieldPlacement["kind"], IconType> = {
  preview: FiEye,
  fullPage: FiFileText,
  private: FiLock,
  // Neutral marks: a listing setting holds no personal data, and a field no
  // public view renders yet makes no claim about who can read it.
  setting: FiSliders,
  notShown: FiInfo,
};

/**
 * The one line above the preview card naming where the current field shows,
 * or who sees it when it never shows publicly. Plain text on purpose: the
 * focused field's own label is already announced, so a live region here would
 * talk over it.
 *
 * A card field whose spot is not drawn yet gets one shared "once it has a
 * name" line: the placeholder card is the only state that hides a preview
 * field's spots (see `highlightedRegionsFor`, which also skips the stand-in
 * text of an `isNamedCardOnly` spot), so a caption saying "shows here" would
 * point at nothing.
 */
export function ListingPreviewFieldCaption({
  placement,
  isDrawn,
}: {
  placement: ListingFieldPlacement | null;
  /** False when the placement is a `preview` one but none of its regions is
   *  on screen right now (e.g. no name yet, so the placeholder card). The
   *  caption then says where it WILL show instead of "shows here". */
  isDrawn: boolean;
}) {
  const { t } = useTranslation();
  const Icon = placement ? KIND_ICONS[placement.kind] : FiMousePointer;
  const isWaitingForCard = placement?.kind === "preview" && !isDrawn;
  const captionKey = isWaitingForCard
    ? LISTING_PREVIEW_WILL_SHOW_CAPTION_KEY
    : (placement?.captionKey ?? LISTING_PREVIEW_IDLE_CAPTION_KEY);

  return (
    <p className={styles.caption} data-kind={placement?.kind ?? "idle"}>
      <Icon className={styles.captionIcon} aria-hidden />
      <span>{t(captionKey)}</span>
    </p>
  );
}
