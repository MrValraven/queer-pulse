import { AnimatePresence } from "motion/react";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ShareToChatModal } from "../../messages/share/ShareToChatModal";
import type { ShareMenuOption } from "../../messages/share/shareMenu.types";
import { useShareMenuItems } from "../../messages/share/useShareMenuItems";
import { useShareToChat } from "../../messages/share/useShareToChat";
import { LazyStudioShareCard } from "./LazyStudioShareCard";
import type { StudioLinkTarget } from "./studioLinkTarget";
import { studioIdentityNote, studioShareContent } from "./studioShareContent";
import { useStudioShareRules } from "./useStudioShareRules";
import styles from "./StudioLyricShareDialog.module.css";

function StudioLyricShareOption({ option }: { option: ShareMenuOption }) {
  const { t } = useTranslation();
  const icon = (
    <span className={styles.optionIcon} aria-hidden="true">
      {option.icon}
    </span>
  );
  return (
    <li>
      {option.href ? (
        <Button
          variant="quiet"
          className={styles.option}
          href={option.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon}
          {option.label}
          <span className="visuallyHidden">
            {" "}
            {t("messages:shareMenu.opensInNewTab")}
          </span>
        </Button>
      ) : (
        <Button
          variant="quiet"
          className={styles.option}
          onClick={option.onSelect}
        >
          {icon}
          {option.label}
        </Button>
      )}
    </li>
  );
}

/**
 * "Share lyric" (PRD-13): the card the member is about to send, exactly as
 * a chat or a post will show it, and every way to pass it on. What travels
 * is the lyric link (track, line index and start), never the words: each
 * reader's card reads the line from their own Studio. The title the share
 * sheet and Copy message carry is the track's, so no lyric text leaves in
 * them either. Mount inside `AnimatePresence`.
 */
export function StudioLyricShareDialog({
  target,
  title,
  onClose,
}: {
  target: StudioLinkTarget;
  /** The track's title. */
  title: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const rules = useStudioShareRules(target);
  const content = studioShareContent(target, title);
  const shareToChat = useShareToChat();
  // "Share to a community" is left out of the lyric sheet for now (accepted
  // in review, P3 fix round 1): its lazy modal lives inside ShareMenu, and a
  // lyric link posted to a community reads as its lyric card there anyway
  // once the member pastes it. Every other ShareMenu option is offered.
  const options = useShareMenuItems(content, shareToChat, {
    shouldOfferSendInMessage: rules.canSendToOthers,
  });
  return (
    <>
      <Modal
        title={t("studio:share.lyric.dialogTitle")}
        sub={t("studio:share.lyric.dialogSub")}
        onClose={onClose}
        isStudioPlayerSurface
      >
        <div className={styles.preview}>
          <LazyStudioShareCard target={target} surface="post" />
        </div>
        <ul
          className={styles.options}
          aria-label={t("studio:share.lyric.optionsLabel")}
        >
          {options.map((option) => (
            <StudioLyricShareOption key={option.key} option={option} />
          ))}
        </ul>
      </Modal>
      <AnimatePresence>
        {shareToChat.isOpen && (
          <ShareToChatModal
            key="send-lyric-in-message"
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
