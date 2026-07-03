import { useRef } from "react";
import type { IconType } from "react-icons";
import { FiBold, FiImage, FiItalic, FiLink, FiList } from "react-icons/fi";
import { TbBlockquote } from "react-icons/tb";
import type { DraftForm } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

type Tool =
  | { key: string; label: string; icon: IconType; wrap: [string, string] }
  | { key: string; label: string; icon: IconType; prefix: string }
  | { key: string; label: string; text: string; prefix: string };

const TOOLS: Tool[] = [
  { key: "bold", label: "Bold", icon: FiBold, wrap: ["**", "**"] },
  { key: "italic", label: "Italic", icon: FiItalic, wrap: ["_", "_"] },
  { key: "link", label: "Link", icon: FiLink, wrap: ["[", "](https://)"] },
  { key: "h2", label: "Heading", text: "H2", prefix: "## " },
  { key: "quote", label: "Block quote", icon: TbBlockquote, prefix: "> " },
  { key: "bullet", label: "Bullet list", icon: FiList, prefix: "- " },
  { key: "image", label: "Image", icon: FiImage, wrap: ["![", "](https://)"] },
];

export function SubmitStoryWriter({
  values,
  set,
  wordCount,
  readTime,
  saveState,
}: {
  values: DraftForm;
  set: (patch: Partial<DraftForm>) => void;
  wordCount: number;
  readTime: number;
  saveState: "saved" | "unsaved";
}) {
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
              title={tool.label}
              aria-label={tool.label}
              onClick={() => apply(tool)}
            >
              {"icon" in tool ? <tool.icon /> : tool.text}
            </button>
          </span>
        ))}
        <span className={styles.autosave}>
          {saveState === "saved" ? "Autosaved" : "Unsaved…"}
        </span>
      </div>

      <textarea
        className={styles.headlineInput}
        aria-label="Headline"
        placeholder="Your headline"
        rows={2}
        value={values.headline}
        onChange={(e) => set({ headline: e.target.value })}
      />
      <textarea
        className={styles.deckInput}
        aria-label="Standfirst"
        placeholder="A sentence or two that draws the reader in…"
        rows={2}
        value={values.deck}
        onChange={(e) => set({ deck: e.target.value })}
      />
      <textarea
        ref={bodyRef}
        className={styles.bodyInput}
        aria-label="Story body"
        placeholder="Start writing…"
        value={values.body}
        onChange={(e) => set({ body: e.target.value })}
      />

      <div className={styles.writeFooter}>
        <span className={styles.wordCount}>{wordCount} words</span>
        <span>~ {readTime} min read</span>
      </div>
    </div>
  );
}
