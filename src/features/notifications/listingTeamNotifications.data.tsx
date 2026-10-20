import { FiBriefcase } from "react-icons/fi";
import { subprofileEditPath } from "../../app/routeMap";
import { DEMO_VIEWER_TEAM_PERSONA_ID } from "../marketing/listBusiness/api/listingTeam.demo.data";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { DemoNotificationRow } from "./notificationsListActivity.data";

const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 86_400_000;

/** The Works at pane of the demo viewer's Agulha Lenta persona, where both
 *  demo rows lead. */
const DEMO_WORKS_AT_HREF = `${subprofileEditPath(DEMO_VIEWER_TEAM_PERSONA_ID)}?pane=works-at`;

/**
 * The demo "Meet the team" rows: an unread invite from Navalha to Agulha Lenta
 * (id 32) and a read confirmation that Agulha Lenta joined Tinta Viva (id 33).
 * They carry personas and listings only, the same as the live
 * rows.
 */
export function buildListingTeamNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  const icon = {
    Glyph: FiBriefcase,
    background: "rgba(var(--line-rgb), .07)",
  };
  return [
    {
      id: 32,
      type: "community",
      unread: true,
      icon,
      text: t("notifications:type.listing_team_invite.text", {
        listingName: "Navalha",
        personaName: "Agulha Lenta",
      }),
      meta: t("notifications:type.listing_team_invite.meta"),
      time: fmt.relativeTime(-3, "hour"),
      createdAtIso: new Date(
        Date.now() - 3 * MILLISECONDS_PER_HOUR,
      ).toISOString(),
      sourceHref: DEMO_WORKS_AT_HREF,
      actions: [
        {
          label: t("notifications:actions.reviewTeamInvite"),
          variant: "primary",
          href: DEMO_WORKS_AT_HREF,
        },
      ],
    },
    {
      id: 33,
      type: "community",
      unread: false,
      icon,
      text: t("notifications:type.listing_team_accepted.text", {
        listingName: "Tinta Viva",
        personaName: "Agulha Lenta",
      }),
      meta: t("notifications:type.listing_team_accepted.meta"),
      time: fmt.relativeTime(-2, "day"),
      createdAtIso: new Date(
        Date.now() - 2 * MILLISECONDS_PER_DAY,
      ).toISOString(),
      sourceHref: DEMO_WORKS_AT_HREF,
    },
  ];
}
