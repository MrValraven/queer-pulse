import type { RefObject } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import shell from "./ApplicationModals.module.css";
import styles from "./ReportListingModal.module.css";

/** The free-text detail, the "what is still missing" counter and the
 *  confidentiality note. They fold away while copyright routes to the claim
 *  form, since nothing is filed then. */
export function ReportDetailFields({
  isShown,
  detail,
  onDetailChange,
  detailRef,
  counterText,
  missingHintId,
}: {
  isShown: boolean;
  detail: string;
  onDetailChange: (detail: string) => void;
  detailRef: RefObject<HTMLTextAreaElement | null>;
  counterText: string;
  missingHintId: string;
}) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={isShown}>
      <div className={shell.field}>
        <label htmlFor="report-listing-detail">
          {t("economy:housingListing.reportModal.detailLabel")}
        </label>
        <textarea
          ref={detailRef}
          id="report-listing-detail"
          placeholder={t(
            "economy:housingListing.reportModal.detailPlaceholder",
          )}
          value={detail}
          onChange={(event) => onDetailChange(event.target.value)}
        />
      </div>
      <div id={missingHintId} className={styles.counter}>
        {counterText}
      </div>
      <p className={shell.note}>
        <Translation
          i18nKey="economy:housingListing.reportModal.confidentialNote"
          components={{ strong: <strong /> }}
        />
      </p>
    </Collapse>
  );
}
