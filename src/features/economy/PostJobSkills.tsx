import { useMemo, useState, type KeyboardEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SKILL_SUGGESTIONS } from "./postJob.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobSkills({ form }: { form: PostJobForm }) {
  const { t } = useTranslation();
  const { state, toggleIn } = form;
  const [value, setValue] = useState("");
  const [hl, setHl] = useState(-1);

  const matches = useMemo(() => {
    const v = value.trim().toLowerCase();
    if (!v) return [];
    return SKILL_SUGGESTIONS.filter(
      (s) => s.toLowerCase().includes(v) && !state.tags.includes(s),
    ).slice(0, 6);
  }, [value, state.tags]);

  const popular = useMemo(
    () => SKILL_SUGGESTIONS.filter((s) => !state.tags.includes(s)).slice(0, 6),
    [state.tags],
  );

  function add(v: string) {
    const trimmed = v.trim();
    if (trimmed && !state.tags.includes(trimmed)) toggleIn("tags", trimmed);
    setValue("");
    setHl(-1);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && matches.length) {
      e.preventDefault();
      setHl((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp" && matches.length) {
      e.preventDefault();
      setHl((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      add(hl > -1 && matches[hl] ? matches[hl] : value);
    } else if (e.key === "Escape") {
      setHl(-1);
      setValue("");
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        {t("economy:postJob.skills.title")}
      </div>
      <div className={styles.cardSub}>{t("economy:postJob.skills.sub")}</div>

      <div className={styles.tagInputRow}>
        <input
          className={styles.input}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setHl(-1);
          }}
          onKeyDown={onKey}
          aria-label={t("economy:postJob.skills.placeholder")}
          placeholder={t("economy:postJob.skills.placeholder")}
        />
        <button
          type="button"
          className={styles.chipAdd}
          onClick={() => add(value)}
          style={{ whiteSpace: "nowrap" }}
        >
          {t("economy:postJob.skills.addCta")}
        </button>
        {matches.length > 0 && (
          <div className={styles.suggestPop}>
            {matches.map((m, i) => (
              <button
                key={m}
                type="button"
                className={[
                  styles.suggestItem,
                  i === hl && styles.suggestItemHl,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(m)}
              >
                <span aria-hidden>+</span>
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {state.tags.length > 0 && (
        <div className={styles.tagsDisplay}>
          {state.tags.map((tag) => (
            <span key={tag} className={styles.formTag}>
              {tag}
              <button
                type="button"
                aria-label={t("economy:postJob.skills.removeAria", {
                  skill: tag,
                })}
                onClick={() => toggleIn("tags", tag)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {popular.length > 0 && (
        <div className={styles.chipSuggest}>
          <span className={styles.csLbl}>
            {t("economy:postJob.skills.popular")}
          </span>
          {popular.map((s) => (
            <button
              key={s}
              type="button"
              className={styles.chipAdd}
              onClick={() => add(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
