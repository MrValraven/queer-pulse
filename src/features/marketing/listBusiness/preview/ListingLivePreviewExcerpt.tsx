import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { MarkdownLite } from "../../../../shared/markdown";
import type { ListingDraft } from "../listBusiness.data";
import { attributeLabel } from "../listingAttributes.data";
import { languageLabel } from "../listingFacts.data";
import { listingFactsForPayload } from "../listingFactsPayload";
import { factsSourceAsSaved } from "../listingFactSummaries";
import { ListingLivePreviewFacts } from "./ListingLivePreviewFacts";
import { ListingLivePreviewOrdering } from "./ListingLivePreviewOrdering";
import { ListingLivePreviewOwner } from "./ListingLivePreviewOwner";
import { ExcerptSection } from "./ListingLivePreviewSection";
import { isByAppointmentListing } from "../listingMobile.data";
import { listingHoursSummary } from "./listingPreviewHours.data";
import type { ListingPreviewRegion } from "./listingPreviewRegions.data";
import styles from "../ListBusinessPage.module.css";

const PLACEHOLDER = "marketing:listBusiness.livePreview.placeholder";

/** The "on your page" excerpt under the preview card: tagline, description,
 *  what's here, inclusion practices, getting in, languages, hours for a
 *  place, ordering and delivery for anything that sells online, and who
 *  runs it. Each block carries the `data-preview-region` the field
 *  highlight outlines. */
export function ListingLivePreviewExcerpt({
  draft,
  ownerPhotoUrl,
  highlightedRegions,
  isUnclaimed = false,
}: {
  draft: ListingDraft;
  /** The signed-in member's photo, already filtered by their photo setting. */
  ownerPhotoUrl: string | null;
  /** The regions being outlined (from `highlightedRegionsFor`). */
  highlightedRegions: readonly ListingPreviewRegion[];
  /** Nobody owns the listing. The page then prints no "who runs it" byline
   *  (`DirectoryOwnerByline`), so the excerpt leaves its block out too. */
  isUnclaimed?: boolean;
}) {
  const { t, language } = useTranslation();
  const isHighlighted = (region: ListingPreviewRegion) =>
    highlightedRegions.includes(region);
  const description = draft.whatItIs
    .map((paragraph) => paragraph.text)
    .filter((text) => text.trim())
    .join("\n\n");
  // A create drops what falls outside the offer, so the preview does too.
  const facts = listingFactsForPayload(factsSourceAsSaved(draft));
  const languages = [
    ...facts.langs.map((code) => languageLabel(t, code)),
    ...(facts.langsOther ? [facts.langsOther] : []),
  ];
  // "By appointment only" keeps no hours; the block says so, as the page does.
  const hours = isByAppointmentListing(draft)
    ? t("marketing:directory.detail.byAppointmentOnly")
    : listingHoursSummary(draft.hours, t, language);

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
        region="whatsHere"
        title={t("marketing:listBusiness.preview.whatsHere")}
        isHighlighted={isHighlighted("whatsHere")}
        placeholder={t(`${PLACEHOLDER}.whatsHere`)}
      >
        {facts.attributes.length > 0 ? (
          <div className={styles.pdChips}>
            {facts.attributes.map((slug) => (
              <span key={slug}>{attributeLabel(t, slug)}</span>
            ))}
          </div>
        ) : null}
      </ExcerptSection>

      <ListingLivePreviewFacts
        draft={draft}
        highlightedRegions={highlightedRegions}
      />

      <ExcerptSection
        region="languages"
        title={t("marketing:listBusiness.preview.languages")}
        isHighlighted={isHighlighted("languages")}
        placeholder={t(`${PLACEHOLDER}.languages`)}
      >
        {languages.length > 0 ? (
          <div className={styles.pdChips}>
            {languages.map((languageName) => (
              <span key={languageName}>{languageName}</span>
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

      {!isUnclaimed && (
        <ListingLivePreviewOwner
          draft={draft}
          ownerPhotoUrl={ownerPhotoUrl}
          isHighlighted={isHighlighted("owner")}
        />
      )}
    </div>
  );
}
