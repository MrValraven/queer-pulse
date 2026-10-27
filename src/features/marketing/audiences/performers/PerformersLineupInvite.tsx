import { useMemo } from "react";
import { Button } from "../../../../shared/components/ui/Button";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { CoHostInviteEventCard } from "../../../gatherings/CoHostInviteCards";
import { KIND_LABEL_KEYS } from "../../../subprofiles/subprofile-kinds";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  buildSampleInviteEvent,
  SAMPLE_INVITER_FIRST_NAME,
} from "./performersSample.data";
import inviteStyles from "../../../gatherings/CoHostInvitePage.module.css";
import styles from "./PerformersWalkthrough.module.css";

/**
 * Step 4: the lineup invite a host sends, drawn the way `LineupInvitePage`
 * draws an open invite, with its own stylesheet and the real event card:
 * who wants you on the lineup, your craft on the bill, the event, and Join
 * or Decline. The page reads the invite from the server, so this composes
 * the same parts from sample data. The frame is inert, so the buttons do
 * nothing.
 */
export function LineupInviteVisual({ today }: { today: Date }) {
  const { t } = useTranslation();
  const inviteEvent = useMemo(() => buildSampleInviteEvent(today), [today]);
  return (
    <ShowcaseFrame
      label={t("forPerformers:walkthrough.lineup.frameLabel")}
      device="browser"
    >
      <div className={styles.invitePage}>
        <div className={inviteStyles.hero}>
          <span className={inviteStyles.eyebrow}>
            {t("gatherings:lineupInvite.eyebrow")}
          </span>
          <p className={inviteStyles.h1}>
            <Translation
              i18nKey="gatherings:lineupInvite.title"
              values={{ host: SAMPLE_INVITER_FIRST_NAME }}
              components={{ em: <em /> }}
            />
          </p>
          <p className={inviteStyles.sub}>
            {t("gatherings:lineupInvite.roleLine", {
              role: t(KIND_LABEL_KEYS.drag),
            })}
          </p>
        </div>
        <CoHostInviteEventCard event={inviteEvent} message={null} />
        <div className={inviteStyles.actions}>
          <div className={inviteStyles.actionsRight}>
            <Button variant="ghost">
              {t("gatherings:lineupInvite.declineCta")}
            </Button>
            <Button variant="primary">
              {t("gatherings:lineupInvite.acceptCta")}
            </Button>
          </div>
        </div>
      </div>
    </ShowcaseFrame>
  );
}
