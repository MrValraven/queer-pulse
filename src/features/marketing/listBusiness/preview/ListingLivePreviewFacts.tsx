import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingDraft } from "../listBusiness.data";
import { inclusionPracticeLabel } from "../listingFacts.data";
import {
  factsSourceAsSaved,
  listingFactSummaries,
} from "../listingFactSummaries";
import { listingFactsForPayload } from "../listingFactsPayload";
import { isByAppointmentListing } from "../listingMobile.data";
import { ExcerptSection } from "./ListingLivePreviewSection";
import type { ListingPreviewRegion } from "./listingPreviewRegions.data";
import styles from "../ListBusinessPage.module.css";

const PLACEHOLDER = "marketing:listBusiness.livePreview.placeholder";

/** The excerpt's inclusion practices and "Before you go" blocks, read from
 *  what a save would send (`listingFactsForPayload` over
 *  `factsSourceAsSaved`). A by-appointment listing's hours block already
 *  says "By appointment only", so "Before you go" leaves that way in out,
 *  and when it was the block's only answer the block goes too: its
 *  placeholder is for a block with nothing answered at all. */
export function ListingLivePreviewFacts({
  draft,
  highlightedRegions,
}: {
  draft: ListingDraft;
  highlightedRegions: readonly ListingPreviewRegion[];
}) {
  const { t } = useTranslation();
  const facts = listingFactsForPayload(factsSourceAsSaved(draft));
  const summaries = listingFactSummaries(t, draft);
  const isEntrySaidByHours =
    isByAppointmentListing(draft) && facts.entryMode === "appointmentOnly";
  const gettingIn = [
    isEntrySaidByHours ? "" : summaries.entry,
    summaries.cover,
    summaries.payments,
    summaries.nif
      ? `${t("marketing:directory.detail.gettingIn.nif")} · ${summaries.nif}`
      : "",
  ].filter(Boolean);
  const isGettingInSaidByHours = isEntrySaidByHours && gettingIn.length === 0;

  return (
    <>
      <ExcerptSection
        region="practices"
        title={t("marketing:listBusiness.preview.practices")}
        isHighlighted={highlightedRegions.includes("practices")}
        placeholder={t(`${PLACEHOLDER}.practices`)}
      >
        {facts.inclusionPractices.length > 0 ? (
          <div className={styles.pdChips}>
            {facts.inclusionPractices.map((practice) => (
              <span key={practice}>{inclusionPracticeLabel(t, practice)}</span>
            ))}
          </div>
        ) : null}
      </ExcerptSection>

      {isGettingInSaidByHours ? null : (
        <ExcerptSection
          region="gettingIn"
          title={t("marketing:listBusiness.preview.gettingIn")}
          isHighlighted={highlightedRegions.includes("gettingIn")}
          placeholder={t(`${PLACEHOLDER}.gettingIn`)}
        >
          {gettingIn.length > 0 ? (
            <div className={styles.pdChips}>
              {gettingIn.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          ) : null}
        </ExcerptSection>
      )}
    </>
  );
}
