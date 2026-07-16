import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { SubmitStoryMeta } from "./SubmitStoryMeta";
import { SubmitStoryWriter } from "./SubmitStoryWriter";
import { SubmitStoryCover } from "./SubmitStoryCover";
import { INITIAL_DRAFT, type DraftForm } from "./submitStory.data";
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
  const [saveState, setSaveState] = useState<"saved" | "unsaved">("saved");
  const [submitting, setSubmitting] = useState(false);
  const firstRun = useRef(true);

  const set = (patch: Partial<DraftForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  const { words, readTime } = useMemo(() => {
    const w = `${form.headline} ${form.body}`
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return { words: w, readTime: Math.max(1, Math.ceil(w / 200)) };
  }, [form.headline, form.body]);

  // Simulated autosave: mark unsaved on edit, settle to saved after a beat.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaveState("unsaved");
    const t = setTimeout(() => setSaveState("saved"), 1500);
    return () => clearTimeout(t);
  }, [form, coverName]);

  function saveDraft() {
    setSaveState("saved");
    showToast(t("magazine:submitStory.editor.draftSaved"), "success");
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

    onSubmit(form.headline.trim());
  }

  const statusPill = (
    <span className={`${styles.statusPill} ${styles.statusDraft}`}>
      {t("magazine:submitStory.meta.statusDraft")}
    </span>
  );

  return (
    <Reveal className={styles.editor} delay={120}>
      <SubmitStoryMeta values={form} set={set} statusPill={statusPill} />
      <SubmitStoryWriter
        values={form}
        set={set}
        wordCount={words}
        readTime={readTime}
        saveState={saveState}
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
