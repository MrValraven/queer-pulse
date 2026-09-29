import { useState } from "react";
import {
  FiCheckCircle,
  FiLogOut,
  FiMessageCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import {
  Avatar,
  Button,
  ConfirmDialog,
  LoadErrorState,
  ModalSheet,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFocusHeadingAfterStateChange } from "../card/goTogetherCardFocus";
import { gatheringPath } from "../../gatherings/data";
import { ReportSubjectControl } from "../../safety/ReportSubjectControl";
import { goTogetherErrorCode } from "../api/goTogether.api";
import type {
  GoTogetherGroupDTO,
  GoTogetherGroupMemberDTO,
  GroupBand,
} from "../api/goTogether.types";
import {
  useAcceptGoTogetherMerge,
  useGoTogetherCheckIn,
  useGoTogetherGroup,
  useLeaveGoTogetherGroup,
} from "../api/useGoTogetherGroup";
import { GoTogetherIcebreakers } from "./GoTogetherIcebreakers";
import { memberInitial } from "./memberInitial";
import { GoTogetherReasonList } from "./GoTogetherReasonList";
import styles from "./GoTogetherGroup.module.css";

/** Plain copy for a failed group action. The server's code picks the line;
 *  anything else reads as a gentle retry. */
function groupErrorKey(error: unknown): string {
  switch (goTogetherErrorCode(error)) {
    case "GO_TOGETHER_CHECKIN_CLOSED":
      return "goTogether:group.error.checkInClosed";
    case "GO_TOGETHER_MERGE_EXPIRED":
      return "goTogether:group.error.mergeExpired";
    default:
      return "goTogether:group.error.generic";
  }
}

const BAND_CLASS: Record<GroupBand, string | undefined> = {
  strong: styles.bandStrong,
  good: styles.bandGood,
};

/** "Strong fit" or "Good fit". The words carry the meaning; the tint only
 *  echoes it. */
export function GoTogetherBandPill({ band }: { band: GroupBand }) {
  const { t } = useTranslation();
  return (
    <span className={[styles.bandPill, BAND_CLASS[band]].join(" ")}>
      {t(`goTogether:band.${band}`)}
    </span>
  );
}

function GroupMemberRow({ member }: { member: GoTogetherGroupMemberDTO }) {
  const { t } = useTranslation();
  return (
    <li className={styles.memberRow}>
      <Avatar
        initials={memberInitial(member.firstName)}
        src={member.avatarUrl ?? undefined}
        size={40}
      />
      <span className={styles.memberText}>
        <span className={styles.memberName}>
          {member.firstName}
          {member.isYou && (
            <span className={styles.memberTag}>
              {t("goTogether:group.you")}
            </span>
          )}
          {member.isPairPartner && (
            <span className={styles.memberTag}>
              {t("goTogether:group.pairPartner")}
            </span>
          )}
        </span>
        {member.pronouns && (
          <span className={styles.memberPronouns}>{member.pronouns}</span>
        )}
      </span>
      {member.hasLeftEvent ? (
        <span className={styles.memberStatus}>
          <FiLogOut aria-hidden="true" /> {t("goTogether:group.status.left")}
        </span>
      ) : member.isHere ? (
        <span className={styles.memberStatus} data-tone="here">
          <FiCheckCircle aria-hidden="true" />{" "}
          {t("goTogether:group.status.here")}
        </span>
      ) : null}
    </li>
  );
}

/** "I'm here" / "I've left": a two-state toggle that only the group sees.
 *  Nothing is posted in the chat. */
function GroupCheckIn({ group }: { group: GoTogetherGroupDTO }) {
  const { t } = useTranslation();
  const checkIn = useGoTogetherCheckIn(group.id);
  if (!group.checkIn.isOpen) return null;
  const isHereNow = group.checkIn.isHere && !group.checkIn.hasLeftEvent;
  const statusKey = isHereNow
    ? "goTogether:group.checkIn.statusHere"
    : group.checkIn.hasLeftEvent
      ? "goTogether:group.checkIn.statusLeft"
      : "goTogether:group.checkIn.hint";

  return (
    <div className={styles.checkIn}>
      <Button
        variant={isHereNow ? "ghost" : "jade"}
        disabled={checkIn.isPending}
        onClick={() => checkIn.mutate(isHereNow ? "left" : "here")}
      >
        {isHereNow ? (
          <>
            <FiLogOut aria-hidden="true" /> {t("goTogether:group.checkIn.left")}
          </>
        ) : (
          <>
            <FiCheckCircle aria-hidden="true" />{" "}
            {t("goTogether:group.checkIn.here")}
          </>
        )}
      </Button>
      <p className={styles.quietNote} role="status">
        {t(statusKey)}
      </p>
      {checkIn.isError && (
        <p className={styles.errorNote} role="alert">
          {t(groupErrorKey(checkIn.error))}
        </p>
      )}
    </div>
  );
}

function GroupMergeOffer({
  group,
  onMerged,
}: {
  group: GoTogetherGroupDTO;
  onMerged: (mergedGroupId: string) => void;
}) {
  const { t } = useTranslation();
  const acceptMerge = useAcceptGoTogetherMerge(group.id);
  return (
    <section className={styles.mergeOffer}>
      <h3 className={styles.sectionHeading}>
        {t("goTogether:group.merge.title")}
      </h3>
      <p className={styles.quietNote}>{t("goTogether:group.merge.body")}</p>
      <Button
        variant="primary"
        disabled={acceptMerge.isPending}
        onClick={() =>
          acceptMerge.mutate(undefined, {
            onSuccess: (mergedGroup) => onMerged(mergedGroup.id),
          })
        }
      >
        <FiUsers aria-hidden="true" /> {t("goTogether:group.merge.accept")}
      </Button>
      {acceptMerge.isError && (
        <p className={styles.errorNote} role="alert">
          {t(groupErrorKey(acceptMerge.error))}
        </p>
      )}
    </section>
  );
}

function GroupLeaveAction({
  groupId,
  onLeft,
}: {
  groupId: string;
  onLeft: () => void;
}) {
  const { t } = useTranslation();
  const leave = useLeaveGoTogetherGroup(groupId);
  const focusHeadingAfterStateChange = useFocusHeadingAfterStateChange();
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <>
      <button
        type="button"
        className={styles.leaveAction}
        onClick={() => setIsConfirming(true)}
      >
        <FiLogOut aria-hidden="true" /> {t("goTogether:group.leave")}
      </button>
      {isConfirming && (
        <ConfirmDialog
          open
          tone="destructive"
          loading={leave.isPending}
          title={t("goTogether:group.leaveConfirm.title")}
          description={t("goTogether:group.leaveConfirm.description")}
          confirmLabel={t("goTogether:group.leaveConfirm.confirm")}
          onClose={() => setIsConfirming(false)}
          onConfirm={() =>
            leave.mutate(undefined, {
              onSuccess: () => {
                setIsConfirming(false);
                // The entry (and this sheet) unmount once the card's state
                // swaps away from grouped: without this, focus would drop to
                // the page body. The card ignores the request if the swap
                // never happens (e.g. this sheet was opened from a chat).
                focusHeadingAfterStateChange();
                onLeft();
              },
            })
          }
        >
          {leave.isError && (
            <p className={styles.errorNote} role="alert">
              {t(groupErrorKey(leave.error))}
            </p>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}

interface GroupSheetBodyProps {
  group: GoTogetherGroupDTO;
  eventSlug: string;
  openedFromConversationId: string | undefined;
  onClose: () => void;
  onMerged: (mergedGroupId: string) => void;
}

function GroupSheetBody({
  group,
  eventSlug,
  openedFromConversationId,
  onClose,
  onMerged,
}: GroupSheetBodyProps) {
  const { t } = useTranslation();
  const isActive = !group.isDissolved;
  // Hidden only inside the very chat it would open. After a merge the group
  // has a new chat, so the member still gets a way into it.
  const chatPath =
    group.conversationId && group.conversationId !== openedFromConversationId
      ? `${routes.messages}?c=${encodeURIComponent(group.conversationId)}`
      : null;

  return (
    <div className={styles.sheetBody}>
      <header className={styles.sheetHead}>
        <p className={styles.eyebrow}>{t("goTogether:product.name")}</p>
        <h2 className={styles.sheetTitle}>{group.event.title}</h2>
        <GoTogetherBandPill band={group.band} />
      </header>

      {group.isDissolved && (
        <p className={styles.quietNote}>{t("goTogether:group.dissolved")}</p>
      )}
      {isActive && group.mergeOffer && (
        <GroupMergeOffer group={group} onMerged={onMerged} />
      )}

      <section className={styles.sheetSection}>
        <h3 className={styles.sectionHeading}>
          {t("goTogether:group.reasonsHeading")}
        </h3>
        <GoTogetherReasonList reasons={group.reasons} />
      </section>

      <section className={styles.sheetSection}>
        <h3 className={styles.sectionHeading}>
          {t("goTogether:group.membersHeading")}
        </h3>
        <ul className={styles.memberList}>
          {group.members.map((member) => (
            <GroupMemberRow key={member.slug} member={member} />
          ))}
        </ul>
      </section>

      {group.meetingPointNote && (
        <section className={styles.sheetSection}>
          <h3 className={styles.sectionHeading}>
            {t("goTogether:group.meetingPoint.heading")}
          </h3>
          <figure className={styles.meetingPoint}>
            <blockquote className={styles.meetingPointNote}>
              {group.meetingPointNote}
            </blockquote>
            <figcaption className={styles.meetingPointLabel}>
              {t("goTogether:group.meetingPoint.label")}
            </figcaption>
          </figure>
        </section>
      )}

      <GoTogetherIcebreakers groupId={group.id} />

      {isActive && <GroupCheckIn group={group} />}

      <div className={styles.actionRow}>
        {chatPath && (
          <Button variant="primary" to={chatPath} onClick={onClose}>
            <FiMessageCircle aria-hidden="true" />{" "}
            {t("goTogether:group.openChat")}
          </Button>
        )}
        <Button
          variant="ghost"
          to={`${gatheringPath(eventSlug)}?share=plans`}
          onClick={onClose}
        >
          <FiShield aria-hidden="true" /> {t("goTogether:group.sharePlans")}
        </Button>
      </div>
      {/* Leave gets its own row, away from the chat/share-plans actions: a
          destructive choice should not share their visual weight (design N2). */}
      {isActive && (
        <div className={styles.leaveRow}>
          <GroupLeaveAction groupId={group.id} onLeft={onClose} />
        </div>
      )}

      {group.conversationId && (
        <ReportSubjectControl
          subjectType="conversation"
          subjectId={group.conversationId}
          subjectName={group.event.title}
          label={t("goTogether:group.report")}
          ariaLabel={t("goTogether:group.reportAria", {
            title: group.event.title,
          })}
        />
      )}
    </div>
  );
}

interface GoTogetherGroupSheetProps {
  groupId: string;
  /** The gathering whose Share plans flow "Tell someone where you'll be"
   *  opens (`?share=plans`, read by `GatheringDetailPanels`). */
  eventSlug: string;
  /** The chat the sheet was opened from. "Open group chat" hides while the
   *  group's chat is this one. */
  openedFromConversationId?: string;
  onClose: () => void;
}

/**
 * The full group card in a bottom sheet: band, reasons, members (first name
 * and pronouns only), the host's meeting point, icebreakers, check-in, leave,
 * share plans and report. A successful leave closes the sheet: the leave hook
 * refetches the group, which the member can no longer read.
 */
export function GoTogetherGroupSheet({
  groupId,
  eventSlug,
  openedFromConversationId,
  onClose,
}: GoTogetherGroupSheetProps) {
  const { t } = useTranslation();
  // A merge moves the member into another group whose id can differ.
  const [currentGroupId, setCurrentGroupId] = useState(groupId);
  const groupQuery = useGoTogetherGroup(currentGroupId);
  const group = groupQuery.data;

  return (
    <ModalSheet onClose={onClose} ariaLabel={t("goTogether:group.sheetLabel")}>
      {group ? (
        <GroupSheetBody
          group={group}
          eventSlug={eventSlug}
          openedFromConversationId={openedFromConversationId}
          onClose={onClose}
          onMerged={setCurrentGroupId}
        />
      ) : groupQuery.isError ? (
        <LoadErrorState
          compact
          title={t("goTogether:group.loadError")}
          onRetry={() => void groupQuery.refetch()}
        />
      ) : (
        <div className={styles.sheetBody} aria-busy="true">
          <SkeletonLine width="40%" />
          <SkeletonLine width="70%" height={24} />
          <SkeletonLine />
          <SkeletonLine width="85%" />
        </div>
      )}
    </ModalSheet>
  );
}
