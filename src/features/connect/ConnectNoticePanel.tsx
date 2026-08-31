import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useClipboard } from "../../shared/hooks/useClipboard";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ConnectNoticeIcon } from "./connectErrorView";
import styles from "./ConnectModal.module.css";

/** Calm stroke marks for the notice panel — token colours, decorative only. */
function NoticeMark({ icon }: { icon: ConnectNoticeIcon }) {
  if (icon === "reached") {
    // Paper plane — the message is already on its way / already landed.
    return (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 4L3 11l6 2.5L11 20l3.5-6L21 4z"
          stroke="rgba(var(--cream-rgb), 0.95)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // Held — this connection isn't open right now (pause bars in a soft circle).
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx={12}
        cy={12}
        r={9}
        stroke="rgba(var(--cream-rgb), 0.95)"
        strokeWidth={1.8}
      />
      <path
        d="M10 9.5v5M14 9.5v5"
        stroke="rgba(var(--cream-rgb), 0.95)"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Terminal notice shown when a reach-out can't go through and retrying won't
 * help (already connected, blocked, not accepting…). Replaces the form
 * entirely: there is no Send here. Unlike the success panel it never
 * auto-closes, the member reads it and dismisses.
 *
 * KEEPING THE WORDS (PRD-03). A member who typed a message and then hit a
 * terminal refusal used to lose it the instant this panel replaced the form.
 * When there is a draft, this offers to put it on the clipboard, so the
 * sentences they wrote are theirs to take wherever the conversation can
 * actually happen. The draft itself lives in `ConnectModal`, which is why it
 * survives the form unmounting at all.
 */
export function ConnectNoticePanel({
  titleKey,
  bodyKey,
  firstName,
  icon,
  draft,
  onClose,
}: {
  titleKey: string;
  bodyKey: string;
  firstName: string;
  icon: ConnectNoticeIcon;
  /** What the member had composed, when they had composed anything. */
  draft?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { copy } = useClipboard();
  const { showToast } = useToast();
  const keptDraft = draft?.trim() ?? "";

  async function handleCopyDraft() {
    const didCopy = await copy(keptDraft);
    showToast(
      didCopy
        ? t("connect:notice.draftCopied")
        : t("connect:notice.draftCopyFailed"),
      didCopy ? "success" : "info",
    );
  }

  return (
    <div className={styles.sent}>
      <div className={styles.noticeIcon}>
        <NoticeMark icon={icon} />
      </div>
      <h2>
        <Translation
          i18nKey={titleKey}
          components={{ em: <em /> }}
          values={{ name: firstName }}
        />
      </h2>
      <p>{t(bodyKey, { name: firstName })}</p>
      {keptDraft ? <p>{t("connect:notice.draftKept")}</p> : null}
      <div className={styles.panelActions}>
        {keptDraft ? (
          <Button
            size="lg"
            variant="ghost-dark"
            onClick={() => void handleCopyDraft()}
          >
            {t("connect:notice.copyDraft")}
          </Button>
        ) : null}
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {t("connect:notice.close")}
        </Button>
      </div>
    </div>
  );
}
