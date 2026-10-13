import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiSettings, FiUsers } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  CollabDecision,
  EventCommunityInviteDetailDTO,
} from "./api/eventCommunities.api";
import { useRespondCollabInvite } from "./api/useCollabInvite";
import {
  CoHostInviteEventCard,
  CoHostInviteFromCard,
} from "./CoHostInviteCards";
import { gatheringPath } from "./data";
import styles from "./CoHostInvitePage.module.css";

/**
 * An open collab invite: who leads, the gathering, who sent it, what
 * accepting does, and the two answers. Only the guest community's owners,
 * co-owners and mods may answer (`canRespond`); anyone else reading it (an
 * organiser checking on it) sees who answers. Accepting opens the
 * gathering; declining goes back to the notifications.
 */
export function CollabInviteOpen({
  invite,
}: {
  invite: EventCommunityInviteDetailDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const respondInvite = useRespondCollabInvite();
  const communityName = invite.community.name;
  const leadName = invite.leadCommunity?.name ?? null;

  const respond = (decision: CollabDecision) => {
    respondInvite.mutate(
      { id: invite.id, decision },
      {
        onSuccess: () => {
          if (decision === "accept") {
            showToast(
              t("gatherings:collabInvite.acceptedToast", {
                community: communityName,
              }),
              "success",
            );
            void navigate(gatheringPath(invite.event.slug));
            return;
          }
          showToast(t("gatherings:collabInvite.declinedToast"), "info");
          void navigate(routes.notifications);
        },
      },
    );
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.notifications} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("gatherings:collabInvite.back")}
        </Link>

        <div className={styles.hero}>
          <span className={styles.eyebrow}>
            {t("gatherings:collabInvite.eyebrow")}
          </span>
          <h1 className={styles.h1}>
            <Translation
              i18nKey={
                leadName
                  ? "gatherings:collabInvite.title"
                  : "gatherings:collabInvite.titleNoLead"
              }
              values={{ lead: leadName ?? "", community: communityName }}
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>
            {t("gatherings:collabInvite.sub", { community: communityName })}
          </p>
        </div>

        {invite.inviter && (
          <CoHostInviteFromCard inviter={invite.inviter} replyByDate={null} />
        )}
        <CoHostInviteEventCard event={invite.event} message={null} />
        <CollabInviteAccepting
          communityName={communityName}
          leadName={leadName}
        />

        {invite.canRespond ? (
          <div className={styles.actions}>
            <div className={styles.actionsRight}>
              <Button
                variant="ghost"
                disabled={respondInvite.isPending}
                onClick={() => respond("decline")}
              >
                {t("gatherings:collabInvite.declineCta")}
              </Button>
              <Button
                variant="primary"
                disabled={respondInvite.isPending}
                onClick={() => respond("accept")}
              >
                {t("gatherings:collabInvite.acceptCta")}
              </Button>
            </div>
          </div>
        ) : (
          <p className={styles.outclause}>
            {t("gatherings:collabInvite.cannotRespond", {
              community: communityName,
            })}
          </p>
        )}
      </div>
    </PageShell>
  );
}

/** What accepting does, in the co-host invite's role card. */
function CollabInviteAccepting({
  communityName,
  leadName,
}: {
  communityName: string;
  leadName: string | null;
}) {
  const { t } = useTranslation();
  const rows = [
    {
      key: "listing",
      Icon: FiCalendar,
      text: t("gatherings:collabInvite.acceptingListing"),
    },
    {
      key: "name",
      Icon: FiUsers,
      text: leadName
        ? t("gatherings:collabInvite.acceptingName", {
            community: communityName,
            lead: leadName,
          })
        : t("gatherings:collabInvite.acceptingNameNoLead", {
            community: communityName,
          }),
    },
    {
      key: "rights",
      Icon: FiSettings,
      text: t("gatherings:collabInvite.acceptingRights"),
    },
  ];
  return (
    <div className={styles.roleCard}>
      <h3>
        <Translation
          i18nKey="gatherings:collabInvite.acceptingTitle"
          components={{ em: <em /> }}
        />
      </h3>
      {rows.map(({ key, Icon, text }) => (
        <div key={key} className={styles.roleRow}>
          <span className={styles.roleIc} aria-hidden>
            <Icon />
          </span>
          <div className={styles.roleText}>
            <span>{text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
