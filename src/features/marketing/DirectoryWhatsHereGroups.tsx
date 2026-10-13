import { FiCheck, FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { policyHref } from "./directoryGettingIn.data";
import {
  attributeGroupLabel,
  attributeLabel,
  type DisplayAttributeGroup,
} from "./listBusiness/listingAttributes.data";
import {
  inclusionPracticeLabel,
  type ListingInclusionPractice,
} from "./listBusiness/listingFacts.data";
import s from "./DirectorySpacePage.module.css";

/** Every attribute under its group heading, as `groupAttributesForDisplay`
 *  ordered them. Sensitive attributes read like any other here. */
export function DirectoryWhatsHereGroups({
  groups,
}: {
  groups: readonly DisplayAttributeGroup[];
}) {
  const { t } = useTranslation();
  return (
    <>
      {groups.map((group) => (
        <div key={group.groupId} className={s.whatsHereGroup}>
          <h3 className={s.whatsHereHeading}>
            {attributeGroupLabel(t, group.groupId)}
          </h3>
          <ul className={s.features}>
            {group.attributes.map((slug) => (
              <li key={slug} className={s.feature}>
                <span className={s.featureIc}>
                  <FiCheck aria-hidden />
                </span>
                {attributeLabel(t, slug)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/** The inclusion practices the owner follows, and their published policy.
 *  The link is the owner's own, so it opens in a new tab with no opener and
 *  no referrer, and carries no endorsement for search engines. */
export function DirectoryInclusionPractices({
  practices,
  policyUrl,
}: {
  practices: readonly ListingInclusionPractice[];
  policyUrl: string | null | undefined;
}) {
  const { t } = useTranslation();
  if (practices.length === 0) return null;
  const trimmedPolicyUrl = practices.includes("safer-space-policy")
    ? (policyUrl ?? "").trim()
    : "";
  return (
    <div className={s.whatsHereGroup}>
      <h3 className={s.whatsHereHeading}>
        {t("marketing:directory.detail.whatsHere.practicesTitle")}
      </h3>
      <ul className={s.features}>
        {practices.map((practice) => (
          <li key={practice} className={s.feature}>
            <span className={s.featureIc}>
              <FiCheck aria-hidden />
            </span>
            {inclusionPracticeLabel(t, practice)}
          </li>
        ))}
      </ul>
      {trimmedPolicyUrl !== "" && (
        <a
          className={s.policyLink}
          href={policyHref(trimmedPolicyUrl)}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {t("marketing:directory.detail.whatsHere.policyLink")}
          <FiExternalLink aria-hidden />
          <span className="visuallyHidden">
            {" "}
            {t("marketing:directory.detail.ordering.newTab")}
          </span>
        </a>
      )}
    </div>
  );
}
