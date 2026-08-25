import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUserPlus } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useCohostInvite } from "./api/useCohostInvite";
import { useRespondCohostInvite } from "./api/useEventMutations";
import { manageGatheringPath } from "./data";
import { CoHostInviteDetails } from "./CoHostInviteDetails";
import {
  CoHostInviteEventCard,
  CoHostInviteFromCard,
} from "./CoHostInviteCards";
import styles from "./CoHostInvitePage.module.css";

const NOTIFICATIONS = routes.notifications;

export function CoHostInvitePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { inviteId } = useParams<{ inviteId: string }>();
  const { data: invite, isPending, isError } = useCohostInvite(inviteId);
  const respondInvite = useRespondCohostInvite();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

  if (isPending) {
    return (
      <PageShell>
        <div className={styles.page} />
      </PageShell>
    );
  }

  if (isError || !invite) {
    return (
      <PageShell>
        <div className={styles.page}>
          <EmptyState
            icon={<FiUserPlus aria-hidden />}
            title={t("gatherings:cohostInvite.notFoundTitle")}
            description={t("gatherings:cohostInvite.notFoundDescription")}
            action={{
              label: t("gatherings:cohostInvite.back"),
              to: NOTIFICATIONS,
            }}
          />
        </div>
      </PageShell>
    );
  }

  const hostName = invite.inviter.firstName;

  if (invite.status !== "pending") {
    return (
      <PageShell>
        <div className={styles.page}>
          <EmptyState
            icon={<FiUserPlus aria-hidden />}
            title={t("gatherings:cohostInvite.alreadyRespondedTitle")}
            description={
              invite.status === "accepted"
                ? t("gatherings:cohostInvite.alreadyAcceptedDescription", {
                    host: hostName,
                  })
                : t("gatherings:cohostInvite.alreadyDeclinedDescription", {
                    host: hostName,
                  })
            }
            action={{
              label: t("gatherings:cohostInvite.back"),
              to: NOTIFICATIONS,
            }}
          />
        </div>
      </PageShell>
    );
  }

  const accept = () => {
    if (!inviteId) return;
    respondInvite.mutate({ id: inviteId, action: "accept" });
    showToast(
      t("gatherings:cohostInvite.acceptedToast", { host: hostName }),
      "success",
      3500,
    );
    redirectTimerRef.current = setTimeout(
      () => void navigate(manageGatheringPath(invite.event.slug)),
      1300,
    );
  };
  const decline = () => {
    if (!inviteId) return;
    respondInvite.mutate({ id: inviteId, action: "decline" });
    showToast(
      t("gatherings:cohostInvite.declinedToast", { host: hostName }),
      "info",
      3000,
    );
    redirectTimerRef.current = setTimeout(
      () => void navigate(NOTIFICATIONS),
      1300,
    );
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={NOTIFICATIONS} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("gatherings:cohostInvite.back")}
        </Link>

        <div className={styles.hero}>
          <span className={styles.eyebrow}>
            {t("gatherings:cohostInvite.eyebrow")}
          </span>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="gatherings:cohostInvite.title"
              values={{ host: hostName }}
              components={{ em: <em /> }}
            />
          </h1>
        </div>

        <CoHostInviteFromCard
          inviter={invite.inviter}
          replyByDate={invite.replyByDate}
        />

        <CoHostInviteEventCard event={invite.event} message={invite.message} />

        <CoHostInviteDetails
          role={invite.role}
          commitment={invite.commitment}
          host={hostName}
        />

        <div className={styles.actions}>
          <div className={styles.actionsRight}>
            <Button variant="ghost" onClick={decline}>
              {t("gatherings:cohostInvite.declineCta")}
            </Button>
            <Button variant="primary" onClick={accept}>
              {t("gatherings:cohostInvite.acceptCta", { host: hostName })}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
