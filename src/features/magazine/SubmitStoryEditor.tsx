import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { SubmitStoryMeta } from "./SubmitStoryMeta";
import { SubmitStoryWriter } from "./SubmitStoryWriter";
import { SubmitStoryCover } from "./SubmitStoryCover";
import { INITIAL_DRAFT, type DraftForm } from "./submitStory.data";
import { useStoryDraft } from "./useStoryDraft";
import { createStorySubmission } from "./api/magazine.api";
import { MY_SUBMISSIONS_QUERY_KEY } from "./api/useMySubmissions";
import styles from "./SubmitStoryPage.module.css";

const MIN_WORDS = 50;

export function SubmitStoryEditor({
  onSubmit,
}: {
  onSubmit: (headline: string) => void;
}) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DraftForm>(INITIAL_DRAFT);
  const [coverName, setCoverName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Real, guarded localStorage persistence (mirrors the listing wizard): the
  // draft actually survives navigation, and `saveState` reflects the write.
  const { saved, savedAt, saveState, saveNow, clearDraft } = useStoryDraft(
    form,
    coverName,
  );
  const [showResumeBanner, setShowResumeBanner] = useState(Boolean(saved));

  const set = (patch: Partial<DraftForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  const { words, readTime } = useMemo(() => {
    const w = `${form.headline} ${form.body}`
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return { words: w, readTime: Math.max(1, Math.ceil(w / 200)) };
  }, [form.headline, form.body]);

  const resumeDraft = () => {
    if (saved) {
      setForm(saved.form);
      setCoverName(saved.coverName);
    }
    setShowResumeBanner(false);
  };
  const discardDraft = () => {
    clearDraft();
    setShowResumeBanner(false);
  };

  function saveDraft() {
    if (saveNow()) {
      showToast(t("magazine:submitStory.editor.draftSaved"), "success");
    } else {
      showToast(t("magazine:submitStory.editor.draftSaveError"), "error");
    }
  }

  async function submit() {
    if (!form.section) {
      showToast(t("magazine:submitStory.editor.chooseSectionError"), "error");
      return;
    }
    if (!form.headline.trim()) {
      showToast(t("magazine:submitStory.editor.needHeadlineError"), "error");
      return;
    }
    if (words < MIN_WORDS) {
      showToast(
        t("magazine:submitStory.editor.minWordsError", { min: MIN_WORDS }),
        "error",
      );
      return;
    }

    if (!demoMode) {
      const pitch = [form.deck, form.body]
        .map((part) => part.trim())
        .filter(Boolean)
        .join("\n\n");
      setSubmitting(true);
      try {
        await createStorySubmission({
          format: form.section,
          workingTitle: form.headline.trim(),
          pitch,
        });
        await queryClient.invalidateQueries({
          queryKey: [MY_SUBMISSIONS_QUERY_KEY],
        });
      } catch {
        showToast(t("magazine:submitStory.editor.submitError"), "error");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }

    // The story is now with editors (or, in demo, "sent") — the local draft has
    // served its purpose, so clear the persisted slot to avoid a stale resume.
    clearDraft();
    onSubmit(form.headline.trim());
  }

  const statusPill = (
    <span className={`${styles.statusPill} ${styles.statusDraft}`}>
      {t("magazine:submitStory.meta.statusDraft")}
    </span>
  );

  return (
    <Reveal className={styles.editor} delay={120}>
      {showResumeBanner && saved && (
        <div className={styles.resumeBanner}>
          <p className={styles.resumeText}>
            <Translation
              i18nKey="magazine:submitStory.resume.text"
              components={{ b: <b /> }}
            />
          </p>
          <div className={styles.resumeActions}>
            <Button variant="ghost" onClick={discardDraft}>
              {t("magazine:submitStory.resume.startFresh")}
            </Button>
            <Button variant="primary" onClick={resumeDraft}>
              {t("magazine:submitStory.resume.resume")}
            </Button>
          </div>
        </div>
      )}
      <SubmitStoryMeta values={form} set={set} statusPill={statusPill} />
      <SubmitStoryWriter
        values={form}
        set={set}
        wordCount={words}
        readTime={readTime}
        saveState={saveState}
        hasSavedDraft={savedAt !== null}
      />
      <SubmitStoryCover onChange={setCoverName} />

      <div className={styles.actions}>
        <Button
          variant="ghost"
          onClick={saveDraft}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {t("magazine:submitStory.editor.saveDraftCta")}
        </Button>
        <Button
          variant="primary"
          onClick={() => void submit()}
          disabled={submitting}
          aria-busy={submitting}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {submitting
            ? t("magazine:submitStory.editor.submittingCta")
            : t("magazine:submitStory.editor.submitCta")}
        </Button>
      </div>
    </Reveal>
  );
}
