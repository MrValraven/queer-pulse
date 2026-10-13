import { Link } from "react-router-dom";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EventCommunityInviteDetailDTO } from "./api/eventCommunities.api";
import type { CollabInviteResolvedKind } from "./collabInviteState";
import { gatheringPath } from "./data";
import styles from "./CoHostInvitePage.module.css";

/**
 * A collab invite that can no longer be answered: gone, closed by a
 * cancelled or past gathering, or answered by someone on the community's
 * team (named when the server knows who). The titles read true for anyone,
 * the person who answered included. The back link above it is the open
 * state's, and the only way back to the notifications here.
 */
export function CollabInviteResolved({
  kind,
  invite,
}: {
  kind: CollabInviteResolvedKind;
  invite: EventCommunityInviteDetailDTO | null;
}) {
  const { t } = useTranslation();
  const { title, description } = resolvedCopy(kind, invite, t);
  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.notifications} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("gatherings:collabInvite.back")}
        </Link>
        <EmptyState
          icon={<FiUsers aria-hidden />}
          title={title}
          description={description}
          action={
            invite
              ? {
                  label: t("gatherings:collabInvite.viewGatheringCta"),
                  to: gatheringPath(invite.event.slug),
                }
              : undefined
          }
        />
      </div>
    </PageShell>
  );
}

function resolvedCopy(
  kind: CollabInviteResolvedKind,
  invite: EventCommunityInviteDetailDTO | null,
  t: TFunction,
): { title: string; description: string } {
  if (kind === "notFound" || !invite) {
    return {
      title: t("gatherings:collabInvite.notFoundTitle"),
      description: t("gatherings:collabInvite.notFoundDescription"),
    };
  }
  const values = {
    title: invite.event.title,
    community: invite.community.name,
  };
  if (kind === "cancelled") {
    return {
      title: t("gatherings:collabInvite.cancelledTitle"),
      description: t("gatherings:collabInvite.cancelledDescription", values),
    };
  }
  if (kind === "past") {
    return {
      title: t("gatherings:collabInvite.pastTitle"),
      description: t("gatherings:collabInvite.pastDescription", values),
    };
  }
  const responderName = invite.respondedByName;
  const titleValues = {
    name: responderName ?? "",
    community: values.community,
  };
  if (kind === "accepted") {
    return {
      title: responderName
        ? t("gatherings:collabInvite.acceptedTitle", titleValues)
        : t("gatherings:collabInvite.acceptedTitleNoName", titleValues),
      description: t("gatherings:collabInvite.acceptedDescription", values),
    };
  }
  return {
    title: responderName
      ? t("gatherings:collabInvite.declinedTitle", titleValues)
      : t("gatherings:collabInvite.declinedTitleNoName", titleValues),
    description: t("gatherings:collabInvite.declinedDescription", values),
  };
}
