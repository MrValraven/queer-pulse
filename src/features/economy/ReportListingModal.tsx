import { useMemo, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import { useCreateReport } from "../safety/api/useCreateReport";
import {
  REASON_LABEL_KEYS,
  SUBJECT_REASONS,
  type ReasonCode,
  type ReportSubjectType,
} from "../safety/reportReasons";
import { ModalShell, SuccessPanel } from "./ModalKit";
import shell from "./ApplicationModals.module.css";
import styles from "./ReportListingModal.module.css";

/**
 * Report an economy "listing"-shaped subject — a housing listing or a
 * flatmate profile (spec 04 taxonomy) — parameterized by `subjectType`. A
 * thin sibling of `safety/FlagModal.tsx` rather than a generalization of it:
 * FlagModal's copy ("flag a safe space", the badge three-flags-to-review
 * language) is written for venues specifically, so reusing it here would
 * mean either distorting that copy or branching it internally on subject
 * type. This mirrors FlagModal's structure/UX (reason radios + detail
 * textarea + plum-panel success) but renders through this feature's own
 * `ModalKit` (`ModalShell`/`SuccessPanel`), matching every other economy
 * report/review flow (e.g. `CompanyReviewModal`).
 */
export function ReportListingModal({
  subjectType,
  subjectId,
  subjectName,
  onClose,
}: {
  subjectType: ReportSubjectType;
  subjectId: string;
  subjectName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reasons = useMemo(
    () =>
      SUBJECT_REASONS[subjectType].map((code) => ({
        code,
        label: t(REASON_LABEL_KEYS[code]),
      })),
    [t, subjectType],
  );
  const [reason, setReason] = useState<ReasonCode>(reasons[0]!.code);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const createReport = useCreateReport();

  const canSubmit = detail.trim().length >= 10;
  const charsLeft = 10 - detail.trim().length;

  const submit = () => {
    if (!canSubmit || createReport.isPending) return;
    createReport.mutate(
      {
        subjectType,
        subjectId,
        reasonCode: reason,
        detail: detail.trim(),
      },
      {
        onSuccess: () => setDone(true),
        onError: (err) => {
          logError(err, { scope: "economy.reportListing" });
          // Never show "report received" for a report that didn't land —
          // surface an honest error and keep the form filled in to retry.
          showToast(t("economy:housingListing.reportModal.error"), "error");
        },
      },
    );
  };

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:housingListing.reportModal.ariaLabel")}
    >
      {done ? (
        <SuccessPanel
          title={t("economy:housingListing.reportModal.success.title")}
          em={t("economy:housingListing.reportModal.success.em")}
          onClose={onClose}
          closeLabel={t("economy:housingListing.reportModal.doneCta")}
        >
          <Translation
            i18nKey="economy:housingListing.reportModal.success.body"
            values={{ title: subjectName }}
          />
          {reason === "discrimination" && (
            <p className={styles.equalityNote}>
              {t("economy:housingListing.reportModal.success.equalityPointer")}
            </p>
          )}
        </SuccessPanel>
      ) : (
        <div>
          <div className={shell.eyebrow}>
            {t("economy:housingListing.reportModal.eyebrow")}
          </div>
          <h2 className={shell.title}>
            <Translation
              i18nKey="economy:housingListing.reportModal.title"
              values={{ title: subjectName }}
              components={{ em: <em /> }}
            />
          </h2>
          <p className={shell.sub}>
            {t("economy:housingListing.reportModal.lead")}
          </p>

          <div className={shell.field}>
            <label>{t("economy:housingListing.reportModal.concernLabel")}</label>
            <div className={styles.reasons}>
              {reasons.map((option) => (
                <label
                  key={option.code}
                  className={[
                    styles.reason,
                    reason === option.code && styles.reasonChecked,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="report-listing-reason"
                    value={option.code}
                    checked={reason === option.code}
                    onChange={() => setReason(option.code)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className={shell.field}>
            <label htmlFor="report-listing-detail">
              {t("economy:housingListing.reportModal.detailLabel")}
            </label>
            <textarea
              id="report-listing-detail"
              placeholder={t(
                "economy:housingListing.reportModal.detailPlaceholder",
              )}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
            />
          </div>
          <div className={styles.counter}>
            {charsLeft > 0
              ? t("economy:housingListing.reportModal.charsRemaining", {
                  count: charsLeft,
                })
              : t("economy:housingListing.reportModal.charsCount", {
                  count: detail.trim().length,
                })}
          </div>

          <p className={shell.note}>
            <Translation
              i18nKey="economy:housingListing.reportModal.confidentialNote"
              components={{ strong: <strong /> }}
            />
          </p>

          <div className={shell.foot}>
            <Button variant="ghost" onClick={onClose}>
              {t("economy:housingListing.reportModal.cancelCta")}
            </Button>
            <Button
              variant="primary"
              onClick={submit}
              disabled={!canSubmit || createReport.isPending}
            >
              {createReport.isPending
                ? t("economy:housingListing.reportModal.submitting")
                : t("economy:housingListing.reportModal.submitCta")}
            </Button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
