import type { ReactNode } from "react";
import { FiShare } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { ShareMenu } from "../../messages/share/ShareMenu";
import type { ShareMenuTriggerRenderProps } from "../../messages/share/shareMenu.types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioLinkTarget } from "./studioLinkTarget";
import { studioIdentityNote, studioShareContent } from "./studioShareContent";
import { useStudioShareRules } from "./useStudioShareRules";

/** The Studio hero's labelled Share trigger: a quiet Button that the hero's
 *  action row restyles (`.heroActions button`, studio.module.css), the share
 *  icon before the label as Shuffle carries its own. */
export function studioShareTrigger(
  label: string,
): (trigger: ShareMenuTriggerRenderProps) => ReactNode {
  return ({ triggerProps }) => (
    <Button variant="quiet" {...triggerProps}>
      <FiShare aria-hidden /> {label}
    </Button>
  );
}

/**
 * Studio's one Share menu for a track, release or playlist: every way to
 * pass it on, with the two picker rules applied (spec rulings). The path is
 * `studioLinkPath(target)`, which Plan 3's "Share to a community" item reads
 * inside `ShareMenu`.
 */
export function StudioShareMenu({
  target,
  title,
  triggerLabel,
}: {
  target: StudioLinkTarget;
  title: string;
  triggerLabel: string;
}) {
  const { t } = useTranslation();
  const rules = useStudioShareRules(target);
  return (
    <ShareMenu
      content={studioShareContent(target, title)}
      shouldOfferSendInMessage={rules.canSendToOthers}
      identityNote={studioIdentityNote(t, rules.ownPersonaName)}
      renderTrigger={studioShareTrigger(triggerLabel)}
    />
  );
}
