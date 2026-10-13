import { FiCheck, FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useListingAttributeVocabulary } from "./api/useListingAttributeVocabulary";
import type { ListingDraft } from "./listBusiness.data";
import {
  attributeGroupLabel,
  attributeLabel,
  groupAttributesForDisplay,
} from "./listingAttributes.data";
import { inclusionPracticeLabel } from "./listingFacts.data";
import {
  factsSourceAsSaved,
  listingFactSummaries,
} from "./listingFactSummaries";
import { listingFactsForPayload } from "./listingFactsPayload";
import { isByAppointmentListing, listingKindOf } from "./listingMobile.data";
import styles from "./ListBusinessPage.module.css";

/** The full preview's "What's here" (grouped, as the detail page groups
 *  it), the inclusion practices with the policy link, and "Getting in".
 *  The draft's categories place a slug two groups share under the
 *  listing's own heading, the same one the owner ticked it under. Every
 *  block reads what a save sends (`factsSourceAsSaved`), and a
 *  by-appointment listing's "Getting in" leaves that way in out, since its
 *  hours block already says "By appointment only". */
export function ListBusinessPreviewFacts({ draft }: { draft: ListingDraft }) {
  const { t } = useTranslation();
  const vocabulary = useListingAttributeVocabulary();
  const facts = listingFactsForPayload(factsSourceAsSaved(draft));
  const summaries = listingFactSummaries(t, draft);
  const groups = groupAttributesForDisplay(
    facts.attributes,
    listingKindOf(draft),
    vocabulary,
    draft.cats,
  );
  const isEntrySaidByHours =
    isByAppointmentListing(draft) && facts.entryMode === "appointmentOnly";
  const gettingIn = [
    isEntrySaidByHours ? "" : summaries.entry,
    summaries.cover,
    summaries.payments,
    summaries.nif
      ? `${t("marketing:directory.detail.gettingIn.nif")} · ${summaries.nif}`
      : "",
    summaries.languages,
  ].filter(Boolean);

  return (
    <>
      {groups.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.whatsHere")}</h4>
          {groups.map((group) => (
            <div key={group.groupId} className={styles.fpGoodFor}>
              <b>{attributeGroupLabel(t, group.groupId)}</b>
              {group.attributes.map((slug) => (
                <span key={slug} className={styles.fpGoodForRow}>
                  <FiCheck size={13} aria-hidden /> {attributeLabel(t, slug)}
                </span>
              ))}
            </div>
          ))}
        </section>
      )}
      {facts.inclusionPractices.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.practices")}</h4>
          <div className={styles.fpGoodFor}>
            {facts.inclusionPractices.map((practice) => (
              <span key={practice} className={styles.fpGoodForRow}>
                <FiCheck size={13} aria-hidden />{" "}
                {inclusionPracticeLabel(t, practice)}
              </span>
            ))}
            {facts.saferSpacePolicyUrl && (
              <span className={styles.fpGoodForRow}>
                <FiExternalLink size={13} aria-hidden />{" "}
                {t("marketing:directory.detail.whatsHere.policyLink")}
              </span>
            )}
          </div>
        </section>
      )}
      {gettingIn.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.gettingIn")}</h4>
          <div className={styles.pdChips}>
            {gettingIn.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
