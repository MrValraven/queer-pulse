import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { MarkdownLite } from "../../../../shared/markdown";
import {
  goodForLabel,
  langLabel,
  type ListingDraft,
} from "../listBusiness.data";
import { ListingLivePreviewOrdering } from "./ListingLivePreviewOrdering";
import { ListingLivePreviewOwner } from "./ListingLivePreviewOwner";
import { ExcerptSection } from "./ListingLivePreviewSection";
import { listingHoursSummary } from "./listingPreviewHours.data";
import type { ListingPreviewRegion } from "./listingPreviewRegions.data";
import styles from "../ListBusinessPage.module.css";

const PLACEHOLDER = "marketing:listBusiness.livePreview.placeholder";

/** The "on your page" excerpt under the preview card: tagline, description,
 *  good for, languages, hours for a place, ordering and delivery for anything
 *  that sells online, and who runs it. Each block carries the
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

      <ListingLivePreviewOrdering
        draft={draft}
        isHighlighted={isHighlighted("ordering")}
      />

      <ListingLivePreviewOwner
        draft={draft}
        ownerPhotoUrl={ownerPhotoUrl}
        isHighlighted={isHighlighted("owner")}
      />
    </div>
  );
}
