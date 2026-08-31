import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalSheet } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import { useCreateReport } from "./api/useCreateReport";
import { useReportSubmissionError } from "./api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "./api/useReportReasons";
import styles from "./CommunityReportModal.module.css";

/**
 * Report a WHOLE community, rather than one post inside it.
 *
 * The backend has carried a `community` report subject end to end for a long
 * time: its own reason set in `reason-catalogue.ts`, a resolver that reads
 * `subjectId` AS the community slug (see `moderation-response.ts`, which
 * needs no lookup for this subject precisely because of that), the takedown
 * read path and the admin freeze. Nothing on the frontend ever filed one, so
 * a community organised around harm could only be reported one post at a
 * time, and the community itself never reached a moderator as the subject.
 *
 * Self-contained, like every other bespoke report modal here: it owns its
 * state and renders through the shared `ModalSheet` (scroll-lock, focus trap,
 * Esc-to-close, and a portal to <body> so the fixed scrim is never trapped by
 * a transformed ancestor). Demo mode resolves locally through
 * `useCreateReport`; live mode POSTs `/reports`. Neither branch reads a mock
 * registry.
 */
export function CommunityReportModal({
  slug,
  communityName,
  onClose,
}: {
  /**
   * The community's slug. For a `community` subject the backend treats
   * `subjectId` as the slug directly, with no id lookup in between.
   */
  slug: string;
  communityName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();
  // Server-owned taxonomy when it answers, the local mirror instantly and
  // silently when it does not. Never a spinner, never an empty reason list.
  const reasons = useReportReasons("community");
  // Nothing is preselected. The list is ordered severity-descending, so a
  // preselected first option would make the most serious reason the one a
  // hurried reporter sends without reading it.
  const [reasonCode, setReasonCode] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState(false);

  const submit = () => {
    if (!reasonCode || createReport.isPending) return;
    createReport.mutate(
      {
        subjectType: "community",
        subjectId: slug,
        reasonCode: asReasonCode(reasonCode),
        detail: detail.trim() || undefined,
      },
      {
        onSuccess: () => setIsDone(true),
        onError: (error) => {
          logError(error, { scope: "safety.reportCommunity" });
          // Never claim "report received" for one that did not land: show an
          // honest error and keep the form filled in so the reporter can retry
          // without re-picking a reason. A rolling flood cap answers with its
          // own member-facing explanation, which `describeReportError` shows
          // in place of the generic line.
          showToast(
            describeReportError(error, t("safety:report.community.error")),
            "error",
          );
        },
      },
    );
  };

  if (isDone) {
    return (
      <ModalSheet
        onClose={onClose}
        ariaLabel={t("safety:report.community.success.title")}
      >
        <header className={styles.head}>
          <h3 className={styles.title}>
            {t("safety:report.community.success.title")}
          </h3>
        </header>
        <p className={styles.sub}>
          {t("safety:report.community.success.body", { name: communityName })}
        </p>
        <div className={styles.foot}>
          <Button variant="ghost" onClick={onClose}>
            {t("safety:report.community.success.doneCta")}
          </Button>
        </div>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("safety:report.community.title", { name: communityName })}
    >
      <header className={styles.head}>
        <h3 className={styles.title}>
          {t("safety:report.community.title", { name: communityName })}
        </h3>
        <p className={styles.sub}>{t("safety:report.community.lead")}</p>
      </header>

      <div className={styles.label}>
        {t("safety:report.community.reasonLabel")}
      </div>
      <div className={styles.reasons}>
        {reasons.map((option) => (
          <label
            key={option.code}
            className={[
              styles.reason,
              reasonCode === option.code && styles.reasonChecked,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name="community-report-reason"
              value={option.code}
              checked={reasonCode === option.code}
              onChange={() => setReasonCode(option.code)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <label className={styles.label} htmlFor="community-report-detail">
        {t("safety:report.community.detailLabel")}
      </label>
      <textarea
        id="community-report-detail"
        className={styles.textarea}
        placeholder={t("safety:report.community.detailPlaceholder")}
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
      />

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose}>
          {t("safety:report.community.cancelCta")}
        </Button>
        <Button
          variant="danger"
          onClick={submit}
          disabled={createReport.isPending || !reasonCode}
        >
          {createReport.isPending
            ? t("safety:report.community.submitting")
            : t("safety:report.community.submitCta")}
        </Button>
      </div>
    </ModalSheet>
  );
}
