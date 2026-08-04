import { useRef } from "react";
import type { IconType } from "react-icons";
import { FiBold, FiImage, FiItalic, FiLink, FiList } from "react-icons/fi";
import { TbBlockquote } from "react-icons/tb";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { minReadApproxText } from "./magazineFormat";
import type { DraftForm } from "./submitStory.data";
import type { StoryDraftSaveState } from "./useStoryDraft";
import styles from "./SubmitStoryPage.module.css";

type Tool =
  | { key: string; labelKey: string; icon: IconType; wrap: [string, string] }
  | { key: string; labelKey: string; icon: IconType; prefix: string }
  | { key: string; labelKey: string; text: string; prefix: string };

const TOOLS: Tool[] = [
  {
    key: "bold",
    labelKey: "magazine:submitStory.writer.tool.bold",
    icon: FiBold,
    wrap: ["**", "**"],
  },
  {
    key: "italic",
    labelKey: "magazine:submitStory.writer.tool.italic",
    icon: FiItalic,
    wrap: ["_", "_"],
  },
  {
    key: "link",
    labelKey: "magazine:submitStory.writer.tool.link",
    icon: FiLink,
    wrap: ["[", "](https://)"],
  },
  {
    key: "h2",
    labelKey: "magazine:submitStory.writer.tool.heading",
    text: "H2",
    prefix: "## ",
  },
  {
    key: "quote",
    labelKey: "magazine:submitStory.writer.tool.quote",
    icon: TbBlockquote,
    prefix: "> ",
  },
  {
    key: "bullet",
    labelKey: "magazine:submitStory.writer.tool.bullet",
    icon: FiList,
    prefix: "- ",
  },
  {
    key: "image",
    labelKey: "magazine:submitStory.writer.tool.image",
    icon: FiImage,
    wrap: ["![", "](https://)"],
  },
];

export function SubmitStoryWriter({
  values,
  set,
  wordCount,
  readTime,
  saveState,
  hasSavedDraft,
}: {
  values: DraftForm;
  set: (patch: Partial<DraftForm>) => void;
  wordCount: number;
  readTime: number;
  saveState: StoryDraftSaveState;
  /** True once a real write has landed — until then the pristine example draft
   *  shows no status, so "Saved" never appears before anything was persisted. */
  hasSavedDraft: boolean;
}) {
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  function apply(tool: Tool) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const body = values.body;

    let next: string;
    let selStart: number;
    let selEnd: number;

    if ("wrap" in tool) {
      const [before, after] = tool.wrap;
      const chosen = body.slice(s, e) || "text";
      next = body.slice(0, s) + before + chosen + after + body.slice(e);
      selStart = s + before.length;
      selEnd = selStart + chosen.length;
    } else {
      // Prefix the start of the selected line.
      const lineStart = body.lastIndexOf("\n", s - 1) + 1;
      next = body.slice(0, lineStart) + tool.prefix + body.slice(lineStart);
      selStart = s + tool.prefix.length;
      selEnd = e + tool.prefix.length;
    }

    set({ body: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  return (
    <div className={styles.writeCard}>
      <div className={styles.toolbar}>
        {TOOLS.map((tool, i) => (
          <span key={tool.key} className={styles.tbGroup}>
            {(tool.key === "h2" || tool.key === "image") && i !== 0 && (
              <span className={styles.tbSep} aria-hidden="true" />
            )}
            <button
              type="button"
              className={styles.tbBtn}
              title={t(tool.labelKey)}
              aria-label={t(tool.labelKey)}
              onClick={() => apply(tool)}
            >
              {"icon" in tool ? <tool.icon /> : tool.text}
            </button>
          </span>
        ))}
        {(saveState !== "saved" || hasSavedDraft) && (
          <span className={styles.autosave} aria-live="polite">
            {saveState === "saving"
              ? t("magazine:submitStory.writer.saving")
              : saveState === "unsaved"
                ? t("magazine:submitStory.writer.unsaved")
                : t("magazine:submitStory.writer.autosaved")}
          </span>
        )}
      </div>

      <textarea
        className={styles.headlineInput}
        aria-label={t("magazine:submitStory.writer.headlineAria")}
        placeholder={t("magazine:submitStory.writer.headlinePlaceholder")}
        rows={2}
        value={values.headline}
        onChange={(e) => set({ headline: e.target.value })}
      />
      <textarea
        className={styles.deckInput}
        aria-label={t("magazine:submitStory.writer.standfirstAria")}
        placeholder={t("magazine:submitStory.writer.standfirstPlaceholder")}
        rows={2}
        value={values.deck}
        onChange={(e) => set({ deck: e.target.value })}
      />
      <textarea
        ref={bodyRef}
        className={styles.bodyInput}
        aria-label={t("magazine:submitStory.writer.bodyAria")}
        placeholder={t("magazine:submitStory.writer.bodyPlaceholder")}
        value={values.body}
        onChange={(e) => set({ body: e.target.value })}
      />

      <div className={styles.writeFooter}>
        <span className={styles.wordCount}>
          {t("magazine:submitStory.writer.wordCount", { count: wordCount })}
        </span>
        <span>{minReadApproxText(readTime, t)}</span>
      </div>
    </div>
  );
}
