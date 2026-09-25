import type { ReactNode } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { MarkdownLite } from "../../../../shared/markdown";
import {
  goodForLabel,
  langLabel,
  type ListingDraft,
} from "../listBusiness.data";
import { ListingLivePreviewOwner } from "./ListingLivePreviewOwner";
import { listingHoursSummary } from "./listingPreviewHours.data";
import type { ListingPreviewRegion } from "./listingPreviewRegions.data";
import previewStyles from "./ListingLivePreview.module.css";
import styles from "../ListBusinessPage.module.css";

const PLACEHOLDER = "marketing:listBusiness.livePreview.placeholder";

/** A titled excerpt block. Hidden while empty, except when its field is the
 *  highlighted one: then it shows a placeholder line, so the outline has
 *  somewhere to land. */
function ExcerptSection({
  region,
  title,
  isHighlighted,
  placeholder,
  children,
}: {
  region: ListingPreviewRegion;
  title: string;
  isHighlighted: boolean;
  placeholder: string;
  /** The block's content, or null while the field is empty. */
  children: ReactNode | null;
}) {
  if (children === null && !isHighlighted) return null;
  return (
    <div className={styles.pdSec} data-preview-region={region}>
      <h3>{title}</h3>
      {children ?? (
        <p className={previewStyles.placeholderLine}>{placeholder}</p>
      )}
    </div>
  );
}

/** The "on your page" excerpt under the preview card: tagline, description,
 *  good for, languages, hours and who runs it. Each block carries the
 *  `data-preview-region` the field highlight outlines. */
export function ListingLivePreviewExcerpt({
  draft,
  ownerPhotoUrl,
  highlightedRegions,
}: {
  draft: ListingDraft;
  /** The signed-in member's photo, already filtered by their photo setting. */
  ownerPhotoUrl: string | null;
  /** The regions being outlined (from `highlightedRegionsFor`). */
  highlightedRegions: readonly ListingPreviewRegion[];
}) {
  const { t, language } = useTranslation();
  const isHighlighted = (region: ListingPreviewRegion) =>
    highlightedRegions.includes(region);
  const description = draft.whatItIs
    .map((paragraph) => paragraph.text)
    .filter((text) => text.trim())
    .join("\n\n");
  const hours = listingHoursSummary(draft.hours, t, language);

  return (
    <div className={styles.pvDetail}>
      <div
        className={[styles.pdTagline, !draft.tagline && styles.pdTaglinePh]
          .filter(Boolean)
          .join(" ")}
        data-preview-region="tagline"
      >
        {draft.tagline ||
          t("marketing:listBusiness.preview.placeholderTagline")}
      </div>

      <ExcerptSection
        region="whatItIs"
        title={t("marketing:listBusiness.preview.whatItIs")}
        isHighlighted={isHighlighted("whatItIs")}
        placeholder={t(`${PLACEHOLDER}.whatItIs`)}
      >
        {description ? (
          <div className={styles.pdDescription}>
            <MarkdownLite text={description} />
          </div>
        ) : null}
      </ExcerptSection>

      <ExcerptSection
        region="goodFor"
        title={t("marketing:listBusiness.preview.goodFor")}
        isHighlighted={isHighlighted("goodFor")}
        placeholder={t(`${PLACEHOLDER}.goodFor`)}
      >
        {draft.goodFor.length > 0 ? (
          <div className={styles.pdChips}>
            {draft.goodFor.map((goodFor) => (
              <span key={goodFor}>{goodForLabel(t, goodFor)}</span>
            ))}
          </div>
        ) : null}
      </ExcerptSection>

      <ExcerptSection
        region="languages"
        title={t("marketing:listBusiness.preview.languages")}
        isHighlighted={isHighlighted("languages")}
        placeholder={t(`${PLACEHOLDER}.languages`)}
      >
        {draft.langs.length > 0 ? (
          <div className={styles.pdChips}>
            {draft.langs.map((languageCode) => (
              <span key={languageCode}>{langLabel(t, languageCode)}</span>
            ))}
          </div>
        ) : null}
      </ExcerptSection>

      {/* The page drops its hours section for an online listing. */}
      {!draft.online && (
        <ExcerptSection
          region="hours"
          title={t("marketing:listBusiness.preview.hours")}
          isHighlighted={isHighlighted("hours")}
          placeholder={t(`${PLACEHOLDER}.hours`)}
        >
          {hours ? <div className={styles.dirMeta}>{hours}</div> : null}
        </ExcerptSection>
      )}

      <ListingLivePreviewOwner
        draft={draft}
        ownerPhotoUrl={ownerPhotoUrl}
        isHighlighted={isHighlighted("owner")}
      />
    </div>
  );
}
