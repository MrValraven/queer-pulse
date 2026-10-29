import type { IconType } from "react-icons";
import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { policyHref } from "./directoryGettingIn.data";
import {
  attributeGroupIcon,
  INCLUSION_PRACTICES_ICON,
} from "./listBusiness/listingAttributeGroupIcons.data";
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

/** One item as a soft pill sized to its label. */
function WhatsHereItem({ label }: { label: string }) {
  return <li className={s.whatsHerePill}>{label}</li>;
}

/** A group's heading in the row's narrow left column, its icon before the
 *  label as a scanning landmark. */
function WhatsHereHeading({
  label,
  icon: Icon,
}: {
  label: string;
  icon: IconType;
}) {
  return (
    <h3 className={s.whatsHereRowLabel}>
      <Icon aria-hidden className={s.whatsHereRowIcon} />
      {label}
    </h3>
  );
}

/** Every attribute under its group heading, as `groupAttributesForDisplay`
 *  ordered them, one tag row per group: the group name in a narrow column and
 *  its items as soft pills beside it. Sensitive attributes read like any
 *  other here. */
export function DirectoryWhatsHereGroups({
  groups,
}: {
  groups: readonly DisplayAttributeGroup[];
}) {
  const { t } = useTranslation();
  return (
    <>
      {groups.map((group) => (
        <div key={group.groupId} className={s.whatsHereRow}>
          <WhatsHereHeading
            label={attributeGroupLabel(t, group.groupId)}
            icon={attributeGroupIcon(group.groupId)}
          />
          <ul className={s.whatsHerePills}>
            {group.attributes.map((slug) => (
              <WhatsHereItem key={slug} label={attributeLabel(t, slug)} />
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
    <div className={s.whatsHereRow}>
      <WhatsHereHeading
        label={t("marketing:directory.detail.whatsHere.practicesTitle")}
        icon={INCLUSION_PRACTICES_ICON}
      />
      <ul className={s.whatsHerePills}>
        {practices.map((practice) => (
          <WhatsHereItem
            key={practice}
            label={inclusionPracticeLabel(t, practice)}
          />
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
