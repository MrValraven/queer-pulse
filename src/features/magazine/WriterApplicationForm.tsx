import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { createWriterApplication } from "./api/writerApplications.api";
import { MY_WRITER_APPLICATION_QUERY_KEY } from "./api/useMyWriterApplication";
import styles from "./SubmitStoryPage.module.css";

export function WriterApplicationForm({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [pitchNote, setPitchNote] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [sampleLink, setSampleLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!sampleText.trim() && !sampleLink.trim()) {
      showToast(t("magazine:applyToWrite.form.sampleRequiredError"), "error");
      return;
    }

    if (!demoMode) {
      setSubmitting(true);
      try {
        await createWriterApplication({
          pitchNote: pitchNote.trim() || undefined,
          sampleText: sampleText.trim() || undefined,
          sampleLink: sampleLink.trim() || undefined,
        });
        await queryClient.invalidateQueries({
          queryKey: [MY_WRITER_APPLICATION_QUERY_KEY],
        });
      } catch {
        showToast(t("magazine:applyToWrite.form.submitError"), "error");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }

    onSubmitted();
  }

  return (
    <div className={styles.metaCard}>
      <label className={styles.fieldLabel} htmlFor="waf-pitch-note">
        {t("magazine:applyToWrite.form.pitchNoteLabel")}
      </label>
      <input
        id="waf-pitch-note"
        className={styles.textInput}
        type="text"
        placeholder={t("magazine:applyToWrite.form.pitchNotePlaceholder")}
        value={pitchNote}
        onChange={(e) => setPitchNote(e.target.value)}
      />

      <label className={styles.fieldLabel} htmlFor="waf-sample-text">
        {t("magazine:applyToWrite.form.sampleTextLabel")}
      </label>
      <textarea
        id="waf-sample-text"
        className={styles.textInput}
        rows={8}
        placeholder={t("magazine:applyToWrite.form.sampleTextPlaceholder")}
        value={sampleText}
        onChange={(e) => setSampleText(e.target.value)}
      />

      <label className={styles.fieldLabel} htmlFor="waf-sample-link">
        {t("magazine:applyToWrite.form.sampleLinkLabel")}
      </label>
      <input
        id="waf-sample-link"
        className={styles.textInput}
        type="url"
        placeholder={t("magazine:applyToWrite.form.sampleLinkPlaceholder")}
        value={sampleLink}
        onChange={(e) => setSampleLink(e.target.value)}
      />

      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={() => void submit()}
          disabled={submitting}
          aria-busy={submitting}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {submitting
            ? t("magazine:applyToWrite.form.submittingCta")
            : t("magazine:applyToWrite.form.submitCta")}
        </Button>
      </div>
    </div>
  );
}
