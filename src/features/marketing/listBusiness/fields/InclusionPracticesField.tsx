import { useState } from "react";
import {
  CheckLine,
  Collapse,
  FormField,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useListingAttributeVocabulary } from "../api/useListingAttributeVocabulary";
import { ANCHOR } from "../listBusiness.data";
import {
  INCLUSION_PRACTICE_HELP_KEYS,
  INCLUSION_PRACTICE_LABEL_KEYS,
  LISTING_INCLUSION_PRACTICES,
  normalizeInclusionPractices,
  offeredInclusionPractices,
  SAFER_SPACE_POLICY_PRACTICE,
  SAFER_SPACE_POLICY_URL_MAX_LENGTH,
} from "../listingFacts.data";
import { isSaferSpacePolicyUrlValid } from "../listingFactsMissing";
import { listingKindOf } from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

const KEY = "marketing:listBusiness.step2.practices";

/**
 * "Inclusion practices": ticks with one line of help each, offered by the
 * listing's kind and categories (harm reduction for nightlife alone). A
 * ticked practice the listing no longer qualifies for stays listed so it
 * can be unticked. Ticking "Published safer-space policy" reveals its
 * required link, checked by the backend's own link rule once the owner
 * leaves the field (a half-typed link is no mistake yet).
 */
export function InclusionPracticesField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, toggleInclusionPractice, setSaferSpacePolicyUrl } = form;
  const vocabulary = useListingAttributeVocabulary();
  const [hasLeftPolicyUrl, setHasLeftPolicyUrl] = useState(false);
  const selected = normalizeInclusionPractices(draft.inclusionPractices);
  const offered = offeredInclusionPractices(
    listingKindOf(draft),
    draft.cats,
    vocabulary.inclusionPractices,
  );
  const shown = LISTING_INCLUSION_PRACTICES.filter(
    (practice) => offered.includes(practice) || selected.includes(practice),
  );
  const hasPolicy = selected.includes(SAFER_SPACE_POLICY_PRACTICE);
  const policyUrl = draft.saferSpacePolicyUrl ?? "";
  const isPolicyUrlInvalid =
    hasLeftPolicyUrl &&
    policyUrl.trim() !== "" &&
    !isSaferSpacePolicyUrlValid(policyUrl);

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.inclusionPractices}
        label={t(`${KEY}.label`)}
        helper={t(`${KEY}.helper`)}
      >
        <div
          role="group"
          aria-label={t(`${KEY}.aria`)}
          className={styles.ownedByChecks}
        >
          {shown.map((practice) => (
            <CheckLine
              key={practice}
              checked={selected.includes(practice)}
              onChange={() => toggleInclusionPractice(practice)}
              title={t(INCLUSION_PRACTICE_LABEL_KEYS[practice])}
              sub={t(INCLUSION_PRACTICE_HELP_KEYS[practice])}
            />
          ))}
        </div>
      </FormField>
      <Collapse isOpen={hasPolicy}>
        <FormField
          className={styles.lbField}
          id={ANCHOR.saferSpacePolicyUrl}
          label={t(`${KEY}.policyUrlLabel`)}
          required
          error={isPolicyUrlInvalid ? t(`${KEY}.policyUrlError`) : undefined}
        >
          <input
            type="url"
            inputMode="url"
            maxLength={SAFER_SPACE_POLICY_URL_MAX_LENGTH}
            placeholder={t(`${KEY}.policyUrlPlaceholder`)}
            value={policyUrl}
            onChange={(event) => setSaferSpacePolicyUrl(event.target.value)}
            onBlur={() => setHasLeftPolicyUrl(true)}
          />
        </FormField>
      </Collapse>
    </>
  );
}
