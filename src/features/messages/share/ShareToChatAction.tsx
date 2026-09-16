import { FiSend } from "react-icons/fi";
import { Button, type ButtonVariant } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useShareToChat } from "./useShareToChat";
import { ShareToChatModal } from "./ShareToChatModal";
import type { ShareableKind } from "./shareToChat.helpers";

export interface ShareToChatActionProps {
  /** Absolute or router-relative; `ShareToChatModal` absolute-izes it. */
  url: string;
  /** What's being shared, shown as the modal's eyebrow. */
  title: string;
  kind: ShareableKind;
  variant?: ButtonVariant;
  className?: string;
}

/**
 * Self-contained "Send in a message" drop-in (PRD-347): a trigger button plus
 * the picker modal it opens, owning its own open/close state like every other
 * modal-holding component in the app. Hidden outright for a signed-out
 * visitor: there's no inbox to pick a thread from. For a surface whose
 * action row already has its own bespoke button markup (e.g. `ArticleToolbar`,
 * `DirectoryActionBar`), wire `useShareToChat` + `ShareToChatModal` directly
 * instead so the trigger matches that row's own idiom; this component is for
 * surfaces happy with an ordinary `<Button>`.
 */
export function ShareToChatAction({
  url,
  title,
  kind,
  variant = "ghost",
  className,
}: ShareToChatActionProps) {
  const { t } = useTranslation();
  const { canShare, isOpen, open, close } = useShareToChat();

  if (!canShare) return null;

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={open}
        aria-label={t("messages:share.ariaLabel", { title })}
      >
        <FiSend aria-hidden />
        {t("messages:share.cta")}
      </Button>
      {isOpen && (
        <ShareToChatModal url={url} title={title} kind={kind} onClose={close} />
      )}
    </>
  );
}
