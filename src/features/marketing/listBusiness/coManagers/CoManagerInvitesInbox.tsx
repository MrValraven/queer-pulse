import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import type { ListingCoManagerInviteDTO } from "../api/listingCoManagers.api";
import {
  useAnswerCoManagerInvite,
  useCoManagerInvites,
} from "../api/useListingCoManagers";
import { CoManagerInviteRow } from "./CoManagerInviteRow";
import styles from "./CoManagers.module.css";

/**
 * Invitations to help run somebody's listing, answered where the member's own
 * places live.
 *
 * It sits directly above the places grid on the account profile, because that
 * is the section an accepted invitation lands in: the place appears in the
 * grid below the moment they say yes. The app already answers "what is waiting
 * on me?" beside the thing it concerns (connection requests on the connections
 * page, community join requests inside the community), so a business invite
 * belongs beside businesses rather than in a new inbox of its own.
 *
 * Renders nothing at all when there is nothing waiting, and never in demo
 * mode, where the query is disabled and answers with an empty list.
 */
export function CoManagerInvitesInbox() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { invites } = useCoManagerInvites();
  const answer = useAnswerCoManagerInvite();
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  if (invites.length === 0) return null;

  const respond = (invite: ListingCoManagerInviteDTO, isAccepted: boolean) => {
    setAnsweringId(invite.id);
    answer.mutate(
      { inviteId: invite.id, isAccepted },
      {
        onSuccess: () => {
          setAnsweringId(null);
          if (!isAccepted) {
            showToast(
              t("members:places.coManagerInvites.declinedToast"),
              "info",
            );
            return;
          }
          showToast(
            t("members:places.coManagerInvites.acceptedToast", {
              listing: invite.listingName,
            }),
            "success",
          );
          // Straight into the listing they can now look after.
          void navigate(
            routes.listBusinessEdit.replace(":ref", invite.listingRef),
          );
        },
        onError: () => {
          setAnsweringId(null);
          showToast(t("members:places.coManagerInvites.error"), "error");
        },
      },
    );
  };

  return (
    <section className={styles.inbox} aria-labelledby="co-manager-invites">
      {/* An h2, so it sits level with "Places you run" below it rather than
          reading as a subsection of the previous block. */}
      <h2 className={styles.inboxTitle} id="co-manager-invites">
        {t("members:places.coManagerInvites.title", {
          count: invites.length,
        })}
      </h2>
      <p className={styles.intro}>{t("members:places.coManagerInvites.sub")}</p>
      <ul className={styles.inviteList}>
        {invites.map((invite) => (
          <CoManagerInviteRow
            key={invite.id}
            invite={invite}
            isBusy={answeringId === invite.id}
            onAnswer={respond}
          />
        ))}
      </ul>
    </section>
  );
}
