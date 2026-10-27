import { useId, useRef, useState } from "react";
import { Button, Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { parseTracklist, type ChapterDraft } from "./studioTracklist";
import styles from "./StudioChaptersEditor.module.css";

/** "Paste a tracklist": `00:00 Artist - Title` or `1:02:30 Title` per line. */
export function StudioTracklistPaste({
  onApply,
  toggleKey = "studio:chapters.editor.pasteToggle",
  hintKey = "studio:chapters.editor.pasteHint",
}: {
  onApply: (rows: ChapterDraft[]) => void;
  toggleKey?: string;
  hintKey?: string;
}) {
  const { t } = useTranslation();
  const textId = useId();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [problems, setProblems] = useState<
    { lineNumber: number; text: string }[]
  >([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [status, setStatus] = useState("");

  function apply() {
    const parsed = parseTracklist(text);
    setProblems(parsed.problems);
    setIsEmpty(parsed.rows.length === 0);
    if (parsed.rows.length === 0) return;
    onApply(parsed.rows);
    // Clear first so the same message twice is announced again.
    setStatus("");
    const message = t("studio:chapters.editor.pastedStatus", {
      count: parsed.rows.length,
    });
    window.setTimeout(() => setStatus(message), 60);
    if (parsed.problems.length === 0) {
      setText("");
      setIsOpen(false);
      // The button that was pressed unmounts with the panel.
      toggleRef.current?.focus();
    }
  }

  return (
    <div className={styles.paste}>
      <Button
        variant="quiet"
        ref={toggleRef}
        className={styles.linkButton}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        {t(toggleKey)}
      </Button>
      <Collapse isOpen={isOpen}>
        <div id={panelId} className={styles.pastePanel}>
          <label htmlFor={textId} className={styles.label}>
            {t("studio:chapters.editor.pasteLabel")}
          </label>
          <textarea
            id={textId}
            rows={6}
            spellCheck={false}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <p className={styles.hint}>{t(hintKey)}</p>
          <p className={styles.hint}>
            {t("studio:chapters.editor.pasteReplaceNote")}
          </p>
          <Button variant="ghost" onClick={apply}>
            {t("studio:chapters.editor.pasteApply")}
          </Button>
          <Collapse isOpen={problems.length > 0 || isEmpty}>
            <div role="alert" className={styles.problems}>
              {isEmpty && <p>{t("studio:chapters.editor.pasteEmpty")}</p>}
              {problems.length > 0 && (
                <>
                  <p>{t("studio:chapters.editor.pasteUnparsed")}</p>
                  <ul>
                    {problems.map((problem) => (
                      <li key={problem.lineNumber}>
                        {t("studio:chapters.editor.pasteLine", {
                          number: problem.lineNumber,
                          text: problem.text,
                        })}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Collapse>
        </div>
      </Collapse>
      <p className="visuallyHidden" role="status">
        {status}
      </p>
    </div>
  );
}
