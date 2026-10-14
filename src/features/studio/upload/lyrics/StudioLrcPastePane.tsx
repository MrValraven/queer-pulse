import { useId } from "react";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { LrcParseResult } from "./studioLrc";
import styles from "./StudioLyricTiming.module.css";

export function StudioLrcPastePane({
  text,
  onTextChange,
  result,
}: {
  text: string;
  onTextChange: (text: string) => void;
  result: LrcParseResult;
}) {
  const { t } = useTranslation();
  const textId = useId();
  const hintId = useId();
  return (
    <div className={styles.pane}>
      <label htmlFor={textId} className={styles.label}>
        {t("studio:lyricTiming.paste.label")}
      </label>
      <textarea
        id={textId}
        className={styles.textarea}
        rows={10}
        spellCheck={false}
        value={text}
        aria-describedby={hintId}
        onChange={(event) => onTextChange(event.target.value)}
      />
      <p id={hintId} className={styles.hint}>
        {t("studio:lyricTiming.paste.hint")}
      </p>
      <p className={styles.count}>
        {t("studio:lyricTiming.paste.parsed", { count: result.lines.length })}
      </p>
      <Collapse isOpen={result.isOverLimit}>
        <p className={styles.warning} role="alert">
          {t("studio:lyricTiming.paste.overLimit")}
        </p>
      </Collapse>
      <Collapse isOpen={result.problems.length > 0}>
        <div className={styles.problems}>
          <p>{t("studio:lyricTiming.paste.unparsedHeading")}</p>
          <ul>
            {result.problems.map((problem) => (
              <li key={problem.lineNumber}>
                {problem.reason === "tooLong"
                  ? t("studio:lyricTiming.paste.tooLong", {
                      number: problem.lineNumber,
                    })
                  : t("studio:lyricTiming.paste.noStamp", {
                      number: problem.lineNumber,
                      text: problem.text,
                    })}
              </li>
            ))}
          </ul>
        </div>
      </Collapse>
    </div>
  );
}
