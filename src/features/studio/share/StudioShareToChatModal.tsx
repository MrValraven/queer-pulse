import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ShareToChatModal } from "../../messages/share/ShareToChatModal";
import { studioLinkPath, type StudioLinkTarget } from "./studioLinkTarget";
import { studioIdentityNote } from "./studioShareContent";
import { useStudioShareRules } from "./useStudioShareRules";

/** "Send in a message" opened from outside a ShareMenu (the track menu).
 *  The rules read only while the picker is open, so a list of tracks makes
 *  no read per row. */
export function StudioShareToChatModal({
  target,
  title,
  onClose,
}: {
  target: StudioLinkTarget;
  title: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const rules = useStudioShareRules(target);
  return (
    <ShareToChatModal
      url={studioLinkPath(target)}
      title={title}
      kind="studio"
      identityNote={studioIdentityNote(t, rules.ownPersonaName)}
      onClose={onClose}
    />
  );
}
