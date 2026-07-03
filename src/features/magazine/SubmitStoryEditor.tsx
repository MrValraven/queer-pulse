import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { SubmitStoryMeta } from "./SubmitStoryMeta";
import { SubmitStoryWriter } from "./SubmitStoryWriter";
import { SubmitStoryCover } from "./SubmitStoryCover";
import { INITIAL_DRAFT, type DraftForm } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

const MIN_WORDS = 50;

export function SubmitStoryEditor({
  onSubmit,
}: {
  onSubmit: (headline: string) => void;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState<DraftForm>(INITIAL_DRAFT);
  const [coverName, setCoverName] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "unsaved">("saved");
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
    showToast("Draft saved.", "success");
  }

  function submit() {
    if (!form.section) {
      showToast("Choose a section for your piece first.", "error");
      return;
    }
    if (!form.headline.trim()) {
      showToast(
        "Your story needs a headline before it goes to editors.",
        "error",
      );
      return;
    }
    if (words < MIN_WORDS) {
      showToast(
        `A little more to go — at least ${MIN_WORDS} words before you submit.`,
        "error",
      );
      return;
    }
    onSubmit(form.headline.trim());
  }

  const statusPill = (
    <span className={`${styles.statusPill} ${styles.statusDraft}`}>Draft</span>
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
          Save draft
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Submit for review
        </Button>
      </div>
    </Reveal>
  );
}
