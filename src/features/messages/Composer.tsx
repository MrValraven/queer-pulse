// src/features/messages/Composer.tsx
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ComposerProps {
  active: Conversation;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  blocked: boolean;
}

/** Bottom composer: severed into a notice bar for official/blocked threads. */
export function Composer({ active, draft, onDraftChange, onSend, blocked }: ComposerProps) {
  const { t } = useTranslation();
  const firstName = active.name.split(" ")[0]!;

  if (active.official) {
    return <div className={styles.officialBar}>{t("messages:conversation.officialNotice")}</div>;
  }
  if (blocked) {
    return (
      <div className={styles.officialBar}>
        {t("messages:conversation.blockedNotice", { name: firstName })}
      </div>
    );
  }

  return (
    <div className={styles.composer}>
      <textarea
        className={styles.composerTa}
        placeholder={t("messages:conversation.composerPlaceholder", { name: firstName })}
        value={draft}
        rows={1}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
      />
      <button
        type="button"
        className={[styles.sendBtn, draft.trim() && styles.sendBtnActive].filter(Boolean).join(" ")}
        onClick={onSend}
        aria-label={t("messages:conversation.send")}
        disabled={!draft.trim()}
      >
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 8l12-6-4 6 4 6-12-6Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
