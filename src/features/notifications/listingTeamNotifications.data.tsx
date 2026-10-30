import { FiBriefcase } from "react-icons/fi";
import { routes, subprofileEditPath } from "../../app/routeMap";
import { DEMO_VIEWER_TEAM_PERSONA_ID } from "../marketing/listBusiness/api/listingTeam.demo.data";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { listingTeamEditorHref } from "./api/notificationKindHrefs";
import type { DemoNotificationRow } from "./notificationsListActivity.data";

const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 86_400_000;

/** The Works at pane of the demo viewer's Agulha Lenta persona, where both
 *  demo rows lead. */
const DEMO_WORKS_AT_HREF = `${subprofileEditPath(DEMO_VIEWER_TEAM_PERSONA_ID)}?pane=works-at`;

/** Where the demo member invite leads: the Places section of the profile. */
const DEMO_MEMBER_INVITE_HREF = `${routes.accountProfile}#places`;

/** The Team section of the demo Tinta Viva listing editor (ref QPL-DEMO-0201),
 *  where the demo member acceptance leads. */
const DEMO_MEMBER_ACCEPTED_HREF = listingTeamEditorHref("QPL-DEMO-0201");

/**
 * The demo "Meet the team" rows: an unread invite from Navalha to Agulha Lenta
 * (id 32) and a read confirmation that Agulha Lenta joined Tinta Viva (id 33).
 * They carry personas and listings only, the same as the live
 * rows. Two more rows cover members on the business team: an unread invite
 * from Studio Cabelo to the viewer (id 38) and a read confirmation that a
 * connection joined the Tinta Viva team (id 39). Neither carries an actor and
 * neither names the viewer, so screenshots stay safe.
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
    {
      id: 38,
      type: "community",
      unread: true,
      icon,
      text: t("notifications:type.listing_team_member_invite.text", {
        listingName: "Studio Cabelo",
      }),
      meta: t("notifications:type.listing_team_member_invite.meta"),
      time: fmt.relativeTime(-5, "hour"),
      createdAtIso: new Date(
        Date.now() - 5 * MILLISECONDS_PER_HOUR,
      ).toISOString(),
      sourceHref: DEMO_MEMBER_INVITE_HREF,
      actions: [
        {
          label: t("notifications:actions.reviewTeamInvite"),
          variant: "primary",
          href: DEMO_MEMBER_INVITE_HREF,
        },
      ],
    },
    {
      id: 39,
      type: "community",
      unread: false,
      icon,
      text: t("notifications:type.listing_team_member_accepted.text", {
        listingName: "Tinta Viva",
        memberName: "Rita Varela",
      }),
      meta: t("notifications:type.listing_team_member_accepted.meta"),
      time: fmt.relativeTime(-4, "day"),
      createdAtIso: new Date(
        Date.now() - 4 * MILLISECONDS_PER_DAY,
      ).toISOString(),
      sourceHref: DEMO_MEMBER_ACCEPTED_HREF,
    },
  ];
}
