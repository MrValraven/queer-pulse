import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalSheet } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { PERSONA_REPORT_REASONS } from "./subprofileReportModal.data";
import styles from "./SubprofileReportModal.module.css";

/**
 * Report a persona (member subprofile). The design prototype's quiet,
 * mask-icon "Report" affordance opens this. Self-contained: owns its own
 * state, uses the shared `Modal` (scroll-lock + focus-trap + Esc-to-close +
 * portal, see `shared/components/ui/Modal.tsx`), so it needs no extra wiring
 * beyond mounting it while open.
 *
 * A reason list is required, a note is optional. Every submission POSTs a
 * real report through the existing `/reports` endpoint (`useCreateReport`).
 * This is NOT a stub. The chosen reason's own persona-specific label always
 * rides along in `detail` (see subprofileReportModal.data.ts) so moderators
 * see the exact wording the reporter picked even where two options share one
 * underlying `ReasonCode`.
 *
 * Wired from `SubprofilePage` (Task 5): `SubprofileHeroActions`' "Report this
 * persona" button calls `onAction("report")`, which the page host turns into
 * mounting this modal. It replaced the generic `ReportSubjectControl` ->
 * `ReportListingModal` path that used to sit there.
 */
export function SubprofileReportModal({
  subjectId,
  subjectName,
  onClose,
}: {
  /**
   * The persona's stable `id` (the UUID every persona endpoint keys on).
   *
   * NOT its `slug`: a persona slug is unique only PER OWNER, so two members
   * can both run a `drag` persona and a report would name neither of them,
   * while an unlinked persona is reachable by `handle` only and never by slug
   * at all. The backend stores `subjectId` opaquely and de-dupes on
   * `(reporter, subject)`, so a per-owner slug also collided across different
   * owners' personas.
   */
  subjectId: string;
  subjectName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();
  // No option is preselected. The list is ordered severity-descending (see
  // subprofileReportModal.data.ts), so a preselected first option would make
  // the most serious reason the one a hurried reporter sends without reading.
  const [reasonKey, setReasonKey] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const selectedReason = PERSONA_REPORT_REASONS.find(
    (option) => option.key === reasonKey,
  );

  const submit = () => {
    if (!selectedReason || createReport.isPending) return;
    const selectedLabel = t(selectedReason.labelKey);
    const trimmedNote = note.trim();
    createReport.mutate(
      {
        subjectType: "subprofile",
        subjectId,
        reasonCode: selectedReason.reasonCode,
        detail: trimmedNote
          ? `${selectedLabel}: ${trimmedNote}`
          : selectedLabel,
      },
      {
        onSuccess: () => setDone(true),
        onError: (error) => {
          logError(error, { scope: "subprofiles.reportPersona" });
          // Never claim "report received" for one that didn't land: surface
          // an honest error and keep the form filled in so the reporter can
          // retry without re-picking a reason. A rolling flood cap answers
          // with its own member-facing explanation, which
          // `describeReportError` shows in place of the generic line.
          showToast(
            describeReportError(error, t("subprofiles:reportModal.error")),
            "error",
          );
        },
      },
    );
  };

  if (done) {
    return (
      <ModalSheet
        onClose={onClose}
        ariaLabel={t("subprofiles:reportModal.success.title")}
      >
        <header className={styles.head}>
          <h3 className={styles.title}>
            {t("subprofiles:reportModal.success.title")}
          </h3>
        </header>
        <p>{t("subprofiles:reportModal.success.body")}</p>
        <div className={styles.foot}>
          <Button variant="ghost" onClick={onClose}>
            {t("subprofiles:reportModal.success.doneCta")}
          </Button>
        </div>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("subprofiles:reportModal.title", { name: subjectName })}
    >
      <header className={styles.head}>
        <h3 className={styles.title}>
          {t("subprofiles:reportModal.title", { name: subjectName })}
        </h3>
        <p className={styles.sub}>{t("subprofiles:reportModal.lead")}</p>
      </header>

      <div className={styles.label}>
        {t("subprofiles:reportModal.reasonLabel")}
      </div>
      <div className={styles.reasons}>
        {PERSONA_REPORT_REASONS.map((option) => (
          <label
            key={option.key}
            className={[
              styles.reason,
              reasonKey === option.key && styles.reasonChecked,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name="subprofile-report-reason"
              value={option.key}
              checked={reasonKey === option.key}
              onChange={() => setReasonKey(option.key)}
            />
            {t(option.labelKey)}
          </label>
        ))}
      </div>

      <label className={styles.label} htmlFor="subprofile-report-note">
        {t("subprofiles:reportModal.noteLabel")}
      </label>
      <textarea
        id="subprofile-report-note"
        className={styles.textarea}
        placeholder={t("subprofiles:reportModal.notePlaceholder")}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose}>
          {t("subprofiles:reportModal.cancelCta")}
        </Button>
        <Button
          variant="danger"
          onClick={submit}
          disabled={createReport.isPending || !selectedReason}
        >
          {createReport.isPending
            ? t("subprofiles:reportModal.submitting")
            : t("subprofiles:reportModal.submitCta")}
        </Button>
      </div>
    </ModalSheet>
  );
}
