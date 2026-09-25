import {
  Fragment,
  memo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { IconType } from "react-icons";
import { FiBold, FiItalic, FiLink2, FiList } from "react-icons/fi";
import { LuHeading, LuListOrdered, LuQuote } from "react-icons/lu";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MarkdownLite } from "../../../shared/markdown";
import type { ComposeMarkdownCommandId } from "./composeMarkdownCommands";
import styles from "./ComposeBodyField.module.css";

// ── The chrome around the body: toolbar, preview and footer ────────────────
// Split out of `ComposeBodyField.tsx` to keep that file readable. Both share
// the field's stylesheet, since they only ever render inside it.

interface ToolbarCommand {
  id: ComposeMarkdownCommandId;
  icon: IconType;
  labelKey: string;
}

const TOOLBAR_COMMANDS: readonly ToolbarCommand[] = [
  { id: "bold", icon: FiBold, labelKey: "forum:composePage.toolbar.bold" },
  {
    id: "italic",
    icon: FiItalic,
    labelKey: "forum:composePage.toolbar.italic",
  },
  {
    id: "heading",
    icon: LuHeading,
    labelKey: "forum:composePage.toolbar.heading",
  },
  {
    id: "bulletList",
    icon: FiList,
    labelKey: "forum:composePage.toolbar.bulletList",
  },
  {
    id: "numberedList",
    icon: LuListOrdered,
    labelKey: "forum:composePage.toolbar.numberedList",
  },
  { id: "quote", icon: LuQuote, labelKey: "forum:composePage.toolbar.quote" },
  { id: "link", icon: FiLink2, labelKey: "forum:composePage.toolbar.link" },
];

/** The divider sits after bold/italic/heading, splitting character formatting
 *  from block formatting. */
const TOOLBAR_SEPARATOR_AFTER = 3;

/**
 * The seven formatting commands, as a real `role="toolbar"` with a roving
 * tabindex: one Tab stop for the whole group, arrows to move inside it.
 */
export function ComposeBodyToolbar({
  isDisabled,
  onCommand,
}: {
  isDisabled: boolean;
  onCommand: (commandId: ComposeMarkdownCommandId) => void;
}) {
  const { t } = useTranslation();
  const [focusedIndex, setFocusedIndex] = useState(0);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = TOOLBAR_COMMANDS.length - 1;
    const moves: Record<string, number | undefined> = {
      ArrowRight: focusedIndex === lastIndex ? 0 : focusedIndex + 1,
      ArrowLeft: focusedIndex === 0 ? lastIndex : focusedIndex - 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = moves[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    setFocusedIndex(nextIndex);
    const buttons = event.currentTarget.querySelectorAll("button");
    buttons[nextIndex]?.focus();
  }

  return (
    <div
      className={styles.tools}
      role="toolbar"
      aria-label={t("forum:composePage.toolbar.label")}
      onKeyDown={handleKeyDown}
    >
      {TOOLBAR_COMMANDS.map((command, index) => {
        const Icon = command.icon;
        return (
          <Fragment key={command.id}>
            <button
              type="button"
              className={styles.tool}
              disabled={isDisabled}
              tabIndex={index === focusedIndex ? 0 : -1}
              title={t(command.labelKey)}
              aria-label={t(command.labelKey)}
              onFocus={() => setFocusedIndex(index)}
              onClick={() => onCommand(command.id)}
            >
              <Icon className={styles.toolIcon} aria-hidden />
            </button>
            {index === TOOLBAR_SEPARATOR_AFTER - 1 && (
              <span
                className={styles.toolSeparator}
                role="separator"
                aria-orientation="vertical"
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

/** The attach control, the markdown-lite reminder, and the word count. */
export function ComposeBodyFooter({
  attachSlot,
  wordCount,
}: {
  attachSlot?: ReactNode;
  wordCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      {attachSlot}
      <span className={styles.footerHint}>
        {t("forum:composePage.body.markdownHint")}
      </span>
      <span className={styles.footerCount}>
        {t("forum:composePage.body.wordCount", { count: wordCount })}
      </span>
    </div>
  );
}

/** The rendered preview of the body. Memoised on its text, so the hidden
 *  preview pane stays idle while the member types in the Write pane. */
export const ComposeBodyPreview = memo(function ComposeBodyPreview({
  text,
}: {
  text: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.preview}>
      {text.trim() ? (
        <MarkdownLite text={text} />
      ) : (
        <p className={styles.previewEmpty}>
          {t("forum:composePage.body.previewEmpty")}
        </p>
      )}
    </div>
  );
});
