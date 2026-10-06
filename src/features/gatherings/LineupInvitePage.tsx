import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiStar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { reasonFor } from "../../shared/api/errorMessage";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { KIND_LABEL_KEYS } from "../subprofiles/subprofile-kinds";
import type { LineupEntryStatus } from "./api/events.api";
import { useLineupInvite, useRespondLineupInvite } from "./api/useLineupInvite";
import {
  CoHostInviteEventCard,
  CoHostInviteFromCard,
} from "./CoHostInviteCards";
import { lineupRoleToKind } from "./eventLineup.data";
import { gatheringPath } from "./gatheringPaths";
import styles from "./CoHostInvitePage.module.css";

const NOTIFICATIONS = routes.notifications;

/** The closed state's copy: the answer the viewer gave, a withdrawn invite
 *  (404), or otherwise a failed load (a network or server failure). */
function closedCopyKeys(
  status: LineupEntryStatus | undefined,
  isNotFound: boolean,
) {
  if (status === "accepted") {
    return {
      title: "gatherings:lineupInvite.acceptedTitle",
      description: "gatherings:lineupInvite.acceptedDescription",
    } as const;
  }
  if (status === "declined") {
    return {
      title: "gatherings:lineupInvite.declinedTitle",
      description: "gatherings:lineupInvite.declinedDescription",
    } as const;
  }
  if (isNotFound) {
    return {
      title: "gatherings:lineupInvite.closedTitle",
      description: "gatherings:lineupInvite.notFoundDescription",
    } as const;
  }
  return {
    title: "gatherings:lineupInvite.loadErrorTitle",
    description: "gatherings:lineupInvite.loadErrorDescription",
  } as const;
}

/**
 * Where a lineup invite notification lands: who invited you, the gathering,
 * your craft, and Join or Decline. An answered invite, a withdrawn one (404)
 * or a failed load shows a closed state with its own copy, the way back to
 * notifications, and a link to the gathering. While an answer is in
 * flight or has just landed, the open view holds: the hook marks the cached
 * invite answered before the redirect, and the lazy target route can suspend
 * long enough to flash the closed state otherwise.
 */
export function LineupInvitePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { slug, entryId } = useParams<{ slug: string; entryId: string }>();
  const { data: invite, error, isPending, isError } = useLineupInvite(entryId);
  const respondInvite = useRespondLineupInvite();
  const isAnswerHeld = respondInvite.isPending || respondInvite.isSuccess;

  if (isPending) {
    return (
      <PageShell>
        <div className={styles.page} />
      </PageShell>
    );
  }

  if (isError || !invite || (invite.status !== "pending" && !isAnswerHeld)) {
    const gatheringSlug = invite?.event.slug ?? slug;
    const isNotFound = error instanceof ApiError && error.status === 404;
    const copy = closedCopyKeys(invite?.status, isNotFound);
    return (
      <PageShell>
        <div className={styles.page}>
          <Link to={NOTIFICATIONS} className={styles.back}>
            <FiArrowLeft aria-hidden /> {t("gatherings:lineupInvite.back")}
          </Link>
          <EmptyState
            icon={<FiStar aria-hidden />}
            title={t(copy.title)}
            description={t(copy.description)}
            action={
              gatheringSlug
                ? {
                    label: t("gatherings:lineupInvite.openGathering"),
                    to: gatheringPath(gatheringSlug),
                  }
                : undefined
            }
          />
        </div>
      </PageShell>
    );
  }

  const roleKind = lineupRoleToKind(invite.role);
  const roleLabel = roleKind ? t(KIND_LABEL_KEYS[roleKind]) : invite.role;

  const answer = (outcome: "accepted" | "declined") => {
    respondInvite.mutate(
      { entryId: invite.id, slug: invite.event.slug, outcome },
      {
        onSuccess: () => {
          showToast(
            outcome === "accepted"
              ? t("gatherings:lineupInvite.acceptedToast")
              : t("gatherings:lineupInvite.declinedToast"),
            outcome === "accepted" ? "success" : "info",
          );
          void navigate(
            outcome === "accepted"
              ? gatheringPath(invite.event.slug)
              : NOTIFICATIONS,
          );
        },
        onError: (error) =>
          showToast(
            reasonFor(error) ?? t("gatherings:lineupInvite.errorToast"),
            "error",
          ),
      },
    );
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={NOTIFICATIONS} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("gatherings:lineupInvite.back")}
        </Link>
        <div className={styles.hero}>
          <span className={styles.eyebrow}>
            {t("gatherings:lineupInvite.eyebrow")}
          </span>
          <h1 className={styles.h1}>
            {invite.inviter ? (
              <Translation
                i18nKey="gatherings:lineupInvite.title"
                values={{ host: invite.inviter.firstName }}
                components={{ em: <em /> }}
              />
            ) : (
              t("gatherings:lineupInvite.titleNoInviter")
            )}
          </h1>
          {/* The craft line reads as the hero's subtitle: `.personal` is the
              host's quoted note inside the event card, so it stays there. */}
          <p className={styles.sub}>
            {t("gatherings:lineupInvite.roleLine", { role: roleLabel })}
          </p>
        </div>
        {invite.inviter && (
          <CoHostInviteFromCard inviter={invite.inviter} replyByDate={null} />
        )}
        <CoHostInviteEventCard event={invite.event} message={null} />
        <div className={styles.actions}>
          <div className={styles.actionsRight}>
            <Button
              variant="ghost"
              onClick={() => answer("declined")}
              disabled={isAnswerHeld}
            >
              {t("gatherings:lineupInvite.declineCta")}
            </Button>
            <Button
              variant="primary"
              onClick={() => answer("accepted")}
              disabled={isAnswerHeld}
            >
              {t("gatherings:lineupInvite.acceptCta")}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
