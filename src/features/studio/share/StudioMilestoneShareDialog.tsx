import { AnimatePresence } from "motion/react";
import { Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ShareToChatModal } from "../../messages/share/ShareToChatModal";
import { useShareMenuItems } from "../../messages/share/useShareMenuItems";
import { useShareToChat } from "../../messages/share/useShareToChat";
import { LazyStudioShareCard } from "./LazyStudioShareCard";
import type { StudioLinkTarget } from "./studioLinkTarget";
import { StudioLyricShareOption } from "./StudioLyricShareDialog";
import { studioIdentityNote, studioShareContent } from "./studioShareContent";
import { useStudioShareRules } from "./useStudioShareRules";
import styles from "./StudioMilestoneShareDialog.module.css";

/**
 * "Share milestone": the card the member is about to send, exactly as a chat
 * or a post will show it, and every way to pass it on. Members always read
 * their own milestone card, private persona included, so the preview works
 * before anyone else can see it. What travels is the milestone link; the
 * share sheet and Copy message carry the milestone sentence as the title.
 * Mount inside `AnimatePresence`.
 */
export function StudioMilestoneShareDialog({
  target,
  title,
  onClose,
}: {
  target: StudioLinkTarget;
  /** The milestone sentence, for the share sheet and Copy message. */
  title: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const rules = useStudioShareRules(target);
  const content = studioShareContent(target, title);
  const shareToChat = useShareToChat();
  // "Share to a community" stays out for the lyric sheet's reason: its lazy
  // modal lives inside ShareMenu, and a pasted milestone link reads as its card.
  const options = useShareMenuItems(content, shareToChat, {
    shouldOfferSendInMessage: rules.canSendToOthers,
  });
  return (
    <>
      <Modal
        title={t("studio:share.milestone.dialogTitle")}
        sub={t("studio:share.milestone.dialogSub")}
        onClose={onClose}
        isStudioPlayerSurface
      >
        <div className={styles.preview}>
          <LazyStudioShareCard target={target} surface="post" />
        </div>
        <ul
          className={styles.options}
          aria-label={t("studio:share.milestone.optionsLabel")}
        >
          {options.map((option) => (
            <StudioLyricShareOption key={option.key} option={option} />
          ))}
        </ul>
      </Modal>
      <AnimatePresence>
        {shareToChat.isOpen && (
          <ShareToChatModal
            key="send-milestone-in-message"
            url={content.path}
            title={content.title}
            kind={content.kind}
            identityNote={studioIdentityNote(t, rules.ownPersonaName)}
            onClose={shareToChat.close}
          />
        )}
      </AnimatePresence>
    </>
  );
}
