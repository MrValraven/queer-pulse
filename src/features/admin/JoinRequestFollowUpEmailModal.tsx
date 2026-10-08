import { useId, useState } from "react";
import {
  Button,
  Modal,
  SegmentedControl,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { isLanguage } from "../../shared/i18n/locale";
import type { Language } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  followUpClipboardText,
  followUpMailto,
} from "./joinRequestFollowUpEmail";
import styles from "./JoinRequestFollowUpEmailModal.module.css";

const SUBJECT_KEY = "admin:members.verify.followUp.subject";
const BODY_KEY = "admin:members.verify.followUp.body";
const GREETING_KEY = "admin:members.verify.followUp.greeting";
const GREETING_NO_NAME_KEY = "admin:members.verify.followUp.greetingNoName";

/**
 * The follow-up email preview: pick the applicant's language, read exactly
 * what will be sent, then open it in the reviewer's own mail app or copy it.
 * Text in the chosen language resolves through `translateIn`, which returns
 * undefined while that catalog loads; until the subject, greeting and body resolve the preview
 * shows a loading line and both send buttons stay disabled, so nothing goes
 * out in the wrong language or as a raw key.
 */
export function JoinRequestFollowUpEmailModal({
  applicantName,
  hasApplicantName,
  applicantEmail,
  onWaitlist,
  onClose,
}: {
  applicantName: string;
  /** False when the applicant left the name blank and `applicantName` is the
   *  queue placeholder; the greeting then omits the name. */
  hasApplicantName: boolean;
  applicantEmail: string;
  onWaitlist?: () => void;
  onClose: () => void;
}) {
  const { t, language, translateIn } = useTranslation();
  const { showToast } = useToast();
  const [emailLanguage, setEmailLanguage] = useState<Language>(language);
  const subject = translateIn(emailLanguage, SUBJECT_KEY);
  const firstName = applicantName.trim().split(/\s+/)[0] || applicantName;
  const languageLabelId = useId();
  const greeting = hasApplicantName
    ? translateIn(emailLanguage, GREETING_KEY, { name: firstName })
    : translateIn(emailLanguage, GREETING_NO_NAME_KEY);
  const bodyText = translateIn(emailLanguage, BODY_KEY);
  const body =
    greeting === undefined || bodyText === undefined
      ? undefined
      : `${greeting}\n\n${bodyText}`;
  const isReady =
    subject !== undefined &&
    greeting !== undefined &&
    bodyText !== undefined &&
    body !== undefined;

  async function copyEmail() {
    if (!isReady) return;
    try {
      await navigator.clipboard.writeText(
        followUpClipboardText({ subject, body }),
      );
      showToast(t("admin:members.verify.followUp.copied"), "success");
    } catch {
      showToast(t("admin:members.verify.followUp.copyFailed"), "error");
    }
  }

  function openEmailApp() {
    if (!isReady) return;
    window.location.href = followUpMailto(applicantEmail, { subject, body });
  }

  return (
    <Modal
      wide
      eyebrow={t("admin:members.verify.followUp.eyebrow")}
      title={
        hasApplicantName
          ? t("admin:members.verify.followUp.title", { name: applicantName })
          : t("admin:members.verify.followUp.titleNoName")
      }
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => void copyEmail()}
            disabled={!isReady}
          >
            {t("admin:members.verify.followUp.copy")}
          </Button>
          <Button onClick={openEmailApp} disabled={!isReady}>
            {t("admin:members.verify.followUp.open")}
          </Button>
        </>
      }
    >
      <p id={languageLabelId} className={styles.languageLabel}>
        {t("admin:members.verify.followUp.languageLabel")}
      </p>
      <SegmentedControl
        labelledBy={languageLabelId}
        options={[
          { value: "en", label: t("admin:members.verify.followUp.languageEn") },
          { value: "pt", label: t("admin:members.verify.followUp.languagePt") },
        ]}
        value={emailLanguage}
        onChange={(value) => {
          if (isLanguage(value)) setEmailLanguage(value);
        }}
      />
      <dl className={styles.envelope}>
        <dt>{t("admin:members.verify.followUp.toLabel")}</dt>
        <dd>{applicantEmail}</dd>
        <dt>{t("admin:members.verify.followUp.subjectLabel")}</dt>
        <dd>{subject ?? <SkeletonLine />}</dd>
      </dl>
      {body === undefined ? (
        <div className={styles.previewPlaceholder}>
          <SkeletonLine />
        </div>
      ) : (
        <textarea
          className={styles.preview}
          readOnly
          value={body}
          aria-label={t("admin:members.verify.followUp.bodyLabel")}
          rows={12}
        />
      )}
      {onWaitlist && (
        <p className={styles.waitlist}>
          <span>{t("admin:members.verify.followUp.waitlistHint")}</span>
          <Button
            variant="ghost"
            onClick={() => {
              onWaitlist();
              onClose();
            }}
          >
            {hasApplicantName
              ? t("admin:members.verify.followUp.waitlistAction", {
                  name: applicantName,
                })
              : t("admin:members.verify.followUp.waitlistActionNoName")}
          </Button>
        </p>
      )}
    </Modal>
  );
}
