import { useId } from "react";
import { FiCheckSquare, FiSquare } from "react-icons/fi";
import { Collapse, Toggle } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import {
  hasNewItemImages,
  isItemPhotoBlurred,
  itemImageUrls,
} from "../tattooItemImages";
import { withPhotoFlags } from "./tattooItemDraft";
import styles from "./TattooItemFields.module.css";

interface TattooPhotoFieldsProps {
  draft: SubprofileItemView;
  original: SubprofileItemView;
  isNew: boolean;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}

/**
 * The client consent tick and the "Blur until tapped" switch for a body-photo
 * item. The block opens while the item holds any photo.
 */
export function TattooPhotoFields({
  draft,
  original,
  isNew,
  onPatch,
}: TattooPhotoFieldsProps) {
  const { t } = useTranslation();
  const hasConsent = draft.structured?.photo?.hasClientConsent === true;
  const isConsentRequired = hasNewItemImages(draft, original, isNew);
  const isStoredWithoutTick =
    !isNew && original.structured?.photo?.hasClientConsent !== true;
  const isLegacyRow = isStoredWithoutTick && !hasConsent && !isConsentRequired;
  const idBase = useId();
  const consentHelperId = `${idBase}-consent-helper`;
  const blurSwitchId = `${idBase}-blur`;
  const ConsentIndicator = hasConsent ? FiCheckSquare : FiSquare;
  return (
    <Collapse isOpen={itemImageUrls(draft).length > 0}>
      <div className={styles.photoFields}>
        <div className={styles.blurGroup}>
          <label className={styles.consentRow}>
            <input
              type="checkbox"
              className="visuallyHidden"
              checked={hasConsent}
              required={isConsentRequired}
              aria-describedby={consentHelperId}
              onChange={(event) =>
                onPatch(
                  withPhotoFlags(draft, {
                    hasClientConsent: event.target.checked,
                  }),
                )
              }
            />
            <ConsentIndicator aria-hidden className={styles.consentIndicator} />
            <span className={styles.consentText}>
              {t("subprofiles:tattooItem.consent.label")}
              <span
                className={[
                  styles.requiredMark,
                  isConsentRequired && styles.requiredMarkOn,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden
              >
                *
              </span>
            </span>
          </label>
          <p id={consentHelperId} className={styles.helper}>
            {t("subprofiles:tattooItem.consent.helper")}
          </p>
          <Collapse isOpen={isLegacyRow}>
            <p className={styles.legacyLine}>
              {t("subprofiles:tattooItem.consent.legacy")}
            </p>
          </Collapse>
        </div>
        <div className={styles.blurGroup}>
          <div className={styles.blurRow}>
            <Toggle
              id={blurSwitchId}
              checked={isItemPhotoBlurred(draft)}
              label={t("subprofiles:tattooItem.blur.label")}
              onChange={(isBlurred) =>
                onPatch(withPhotoFlags(draft, { isBlurred }))
              }
            />
            <label htmlFor={blurSwitchId}>
              {t("subprofiles:tattooItem.blur.label")}
            </label>
          </div>
          <p className={styles.helper}>
            {t("subprofiles:tattooItem.blur.helper")}
          </p>
        </div>
      </div>
    </Collapse>
  );
}
