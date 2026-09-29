import { useState } from "react";
import { FiEdit3, FiMessageCircle } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import {
  AvatarStack,
  Button,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useGoTogetherGroup } from "../api/useGoTogetherGroup";
import {
  GoTogetherBandPill,
  GoTogetherGroupSheet,
} from "./GoTogetherGroupSheet";
import { memberInitial } from "./memberInitial";
import { GoTogetherReasonList } from "./GoTogetherReasonList";
import styles from "./GoTogetherGroup.module.css";

interface GoTogetherGroupEntryProps {
  groupId: string;
  eventSlug: string;
  /** The meet-again window is open, so the entry leads with it. */
  isFeedbackDue: boolean;
}

/**
 * The compact group block inside the gathering's Go together card: band, the
 * first reason, the members' avatars, "Open group chat" and "See your group",
 * which opens the full group sheet.
 */
export function GoTogetherGroupEntry({
  groupId,
  eventSlug,
  isFeedbackDue,
}: GoTogetherGroupEntryProps) {
  const { t } = useTranslation();
  const groupQuery = useGoTogetherGroup(groupId);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const group = groupQuery.data;

  if (!group) {
    return groupQuery.isError ? (
      <LoadErrorState
        compact
        title={t("goTogether:group.loadError")}
        onRetry={() => void groupQuery.refetch()}
      />
    ) : (
      <div className={styles.entry} aria-busy="true">
        <SkeletonLine width="35%" />
        <SkeletonLine width="80%" />
      </div>
    );
  }

  // Once the member has left the chat (from the start, "Leave the chat"
  // keeps them grouped) the card keeps this entry, and the chat is closed
  // to them.
  const chatPath =
    group.conversationId && !group.hasLeftChat
      ? `${routes.messages}?c=${encodeURIComponent(group.conversationId)}`
      : null;

  return (
    <div className={styles.entry}>
      <div className={styles.entryHead}>
        <h3 className={styles.entryTitle}>
          {t("goTogether:group.entryTitle")}
        </h3>
        <GoTogetherBandPill band={group.band} />
      </div>
      <GoTogetherReasonList reasons={group.reasons} limit={1} />
      <div
        role="img"
        aria-label={t("goTogether:group.avatarsLabel", {
          count: group.members.length,
        })}
      >
        <AvatarStack
          avatars={group.members.map((member) => ({
            initials: memberInitial(member.firstName),
            src: member.avatarUrl ?? undefined,
          }))}
        />
      </div>
      <div className={styles.actionRow}>
        {isFeedbackDue && (
          <Button
            variant={group.feedback.hasAnswered ? "ghost" : "primary"}
            to={`${routes.goTogetherFeedback}/${encodeURIComponent(group.id)}`}
          >
            <FiEdit3 aria-hidden="true" />{" "}
            {t(
              group.feedback.hasAnswered
                ? "goTogether:group.feedbackEditCta"
                : "goTogether:group.feedbackCta",
            )}
          </Button>
        )}
        {chatPath && (
          <Button variant={isFeedbackDue ? "ghost" : "primary"} to={chatPath}>
            <FiMessageCircle aria-hidden="true" />{" "}
            {t("goTogether:group.openChat")}
          </Button>
        )}
        <Button variant="ghost" onClick={() => setIsSheetOpen(true)}>
          {t("goTogether:group.seeGroup")}
        </Button>
      </div>
      {isSheetOpen && (
        <GoTogetherGroupSheet
          groupId={group.id}
          eventSlug={eventSlug}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </div>
  );
}
