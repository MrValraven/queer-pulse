import { ShareMenu } from "../messages/share/ShareMenu";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioShareTrigger } from "./share/StudioShareMenu";
import type { StudioLinkTarget } from "./share/studioLinkTarget";
import {
  studioIdentityNote,
  studioShareContent,
} from "./share/studioShareContent";
import { useStudioShareRules } from "./share/useStudioShareRules";

/**
 * A detail hero's Share: the labelled pill on wider screens, and on a phone
 * the menu's own round icon trigger, whose tooltip names it. Both open the
 * same Studio Share menu with the same picker rules as StudioShareMenu.
 */
export function StudioHeroShare({
  target,
  title,
  isIconOnly,
}: {
  target: StudioLinkTarget;
  title: string;
  isIconOnly: boolean;
}) {
  const { t } = useTranslation();
  const rules = useStudioShareRules(target);
  const label = t("studio:detail.shareCta");
  return (
    <ShareMenu
      content={studioShareContent(target, title)}
      shouldOfferSendInMessage={rules.canSendToOthers}
      identityNote={studioIdentityNote(t, rules.ownPersonaName)}
      triggerLabel={label}
      triggerAriaLabel={t("studio:hero.shareAria", { title })}
      tooltipPlacement="top"
      renderTrigger={isIconOnly ? undefined : studioShareTrigger(label)}
    />
  );
}
