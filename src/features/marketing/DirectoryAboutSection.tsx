import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingAttributeVocabulary } from "./listBusiness/api/useListingAttributeVocabulary";
import { type DirectoryPlace } from "./directoryPlaces";
import { whatsHereGroups } from "./directoryGettingIn.data";
import { DirectoryReportDetailsControl } from "./DirectoryReportDetailsControl";
import {
  DirectoryInclusionPractices,
  DirectoryWhatsHereGroups,
} from "./DirectoryWhatsHereGroups";
import { normalizeInclusionPractices } from "./listBusiness/listingFacts.data";
import { listingKindOf } from "./listBusiness/listingMobile.data";
import s from "./DirectorySpacePage.module.css";

/**
 * "What's here": every attribute the owner ticked, translated and grouped
 * under the heading of its group (the listing's own category heading for a
 * slug two groups share), then the inclusion practices with the published
 * policy, then the member's way to say something here is wrong (an edit
 * suggestion on the "Details and amenities" bucket).
 *
 * First in the main column, directly under the gallery: the description in
 * the header ends right above the photos, and this list continues it.
 * Owner-attributed: the owner set these, so the sub-line names them.
 */
export function DirectoryAboutSection({
  place,
  ownerRef,
  preview = false,
}: {
  place: DirectoryPlace;
  /** Present for the owner, who edits the listing directly. */
  ownerRef?: string;
  /** Moderation preview: read-only, so no suggestion control. */
  preview?: boolean;
}) {
  const { t } = useTranslation();
  const vocabulary = useListingAttributeVocabulary();
  const kind = listingKindOf(place);
  const groups = whatsHereGroups(place, vocabulary);
  const practices = normalizeInclusionPractices(place.inclusionPractices);
  if (groups.length === 0 && practices.length === 0) return null;

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey={
            kind === "place"
              ? "marketing:directory.detail.whatsHere.title"
              : "marketing:directory.detail.whatsHere.titleElsewhere"
          }
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>
        {place.owner.first.trim() === ""
          ? t("marketing:directory.detail.goodForSubBusiness")
          : t("marketing:directory.detail.goodForSub", {
              name: place.owner.first,
            })}
      </p>
      <DirectoryWhatsHereGroups groups={groups} />
      <DirectoryInclusionPractices
        practices={practices}
        policyUrl={place.saferSpacePolicyUrl}
      />
      {!preview && (
        <DirectoryReportDetailsControl place={place} ownerRef={ownerRef} />
      )}
    </section>
  );
}
