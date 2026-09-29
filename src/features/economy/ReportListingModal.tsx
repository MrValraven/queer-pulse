import { useId, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import { focusControl } from "../../shared/lib/focusFirstError";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import type { ReportSubjectType } from "../safety/reportReasons";
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
  // Server-owned taxonomy when it answers, the local one instantly and
  // silently when it does not. Never a spinner, never an empty list.
  const reasons = useReportReasons(subjectType);
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const concernLabelId = useId();
  const missingHintId = useId();
  const firstReasonRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLTextAreaElement>(null);
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();

  const canSubmit = reason !== null && detail.trim().length >= 10;
  const charsLeft = 10 - detail.trim().length;
  // One slot under the textarea says what is still missing: the concern
  // first, then the character count. The blocked submit points at it.
  let counterText = t("economy:housingListing.reportModal.charsCount", {
    count: detail.trim().length,
  });
  if (reason === null) {
    counterText = t("economy:housingListing.reportModal.reasonMissing");
  } else if (charsLeft > 0) {
    counterText = t("economy:housingListing.reportModal.charsRemaining", {
      count: charsLeft,
    });
  }

  const submit = () => {
    if (createReport.isPending) return;
    if (!canSubmit || reason === null) {
      // The submit stays focusable while blocked, so a press lands the
      // reporter on the field that still needs them.
      focusControl(
        reason === null ? firstReasonRef.current : detailRef.current,
      );
      return;
    }
    createReport.mutate(
      {
        subjectType,
        subjectId,
        reasonCode: asReasonCode(reason),
        detail: detail.trim(),
      },
      {
        onSuccess: () => setDone(true),
        onError: (err) => {
          logError(err, { scope: "economy.reportListing" });
          // Never show "report received" for a report that didn't land —
          // surface an honest error and keep the form filled in to retry. A
          // rolling flood cap answers with its own member-facing explanation,
          // which `describeReportError` shows in place of the generic line.
          showToast(
            describeReportError(
              err,
              t("economy:housingListing.reportModal.error"),
            ),
            "error",
          );
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
            <label id={concernLabelId}>
              {t("economy:housingListing.reportModal.concernLabel")}
            </label>
            <div
              className={styles.reasons}
              role="radiogroup"
              aria-labelledby={concernLabelId}
              aria-required="true"
            >
              {reasons.map((option, optionIndex) => (
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
                    ref={optionIndex === 0 ? firstReasonRef : undefined}
                    type="radio"
                    name="report-listing-reason"
                    value={option.code}
                    checked={reason === option.code}
                    onChange={() => setReason(option.code)}
                  />
                  <span className={styles.reasonLabel}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

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
              onChange={(event) => setDetail(event.target.value)}
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

          <div className={shell.foot}>
            <Button variant="ghost" onClick={onClose}>
              {t("economy:housingListing.reportModal.cancelCta")}
            </Button>
            {/* aria-disabled keeps the submit in the tab order, so the hint
                it points at is heard and an early press can move focus. */}
            <Button
              variant="primary"
              onClick={submit}
              aria-disabled={!canSubmit || createReport.isPending}
              aria-describedby={canSubmit ? undefined : missingHintId}
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
