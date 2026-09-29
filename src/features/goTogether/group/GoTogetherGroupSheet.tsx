import { useRef, useState, type RefObject } from "react";
import {
  FiCheckCircle,
  FiLogOut,
  FiMessageCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import {
  Button,
  LoadErrorState,
  ModalSheet,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { gatheringPath } from "../../gatherings/data";
import { ReportSubjectControl } from "../../safety/ReportSubjectControl";
import type {
  GoTogetherGroupDTO,
  GoTogetherGroupMemberDTO,
  GroupBand,
} from "../api/goTogether.types";
import {
  useAcceptGoTogetherMerge,
  useGoTogetherCheckIn,
  useGoTogetherGroup,
} from "../api/useGoTogetherGroup";
import { GoTogetherGroupLeaveAction } from "./GoTogetherGroupLeaveAction";
import { GoTogetherGroupMemberRow } from "./GoTogetherGroupMemberRow";
import { GoTogetherIcebreakers } from "./GoTogetherIcebreakers";
import { GoTogetherReasonList } from "./GoTogetherReasonList";
import { useAfterGroupBlock } from "./useAfterGroupBlock";
import { groupErrorKey, type GroupBlockTiming } from "./groupActionHelpers";
import styles from "./GoTogetherGroup.module.css";

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

interface GroupSheetBodyProps {
  group: GoTogetherGroupDTO;
  eventSlug: string;
  openedFromConversationId: string | undefined;
  onClose: () => void;
  onMerged: (mergedGroupId: string) => void;
  onBlocked: (
    member: GoTogetherGroupMemberDTO,
    timing: GroupBlockTiming,
  ) => void;
  membersHeadingRef: RefObject<HTMLHeadingElement | null>;
}

function GroupSheetBody({
  group,
  eventSlug,
  openedFromConversationId,
  onClose,
  onMerged,
  onBlocked,
  membersHeadingRef,
}: GroupSheetBodyProps) {
  const { t } = useTranslation();
  const isActive = !group.isDissolved;
  // One member's options open at a time.
  const [openActionsMemberRef, setOpenActionsMemberRef] = useState<
    string | null
  >(null);
  const pairPartnerName =
    group.members.find((member) => member.isPairPartner)?.firstName ?? null;
  // Hidden only inside the very chat it would open, and once the member has
  // left that chat. After a merge the group has a new chat, so the member
  // still gets a way into it.
  const chatPath =
    group.conversationId &&
    !group.hasLeftChat &&
    group.conversationId !== openedFromConversationId
      ? `${routes.messages}?c=${encodeURIComponent(group.conversationId)}`
      : null;
  // Before the start Leave takes the member out of the group. From the start
  // it only ends the chat seat, so it needs a chat to leave.
  const isLeaveAvailable =
    isActive &&
    !group.hasLeftChat &&
    (!group.isLeaveChatOnly || Boolean(group.conversationId));

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
        <h3
          ref={membersHeadingRef}
          tabIndex={-1}
          className={styles.sectionHeading}
        >
          {t("goTogether:group.membersHeading")}
        </h3>
        <ul className={styles.memberList}>
          {group.members.map((member) => (
            <GoTogetherGroupMemberRow
              key={member.memberRef}
              member={member}
              groupId={group.id}
              eventStartAt={group.event.startAt}
              isLeaveChatOnly={group.isLeaveChatOnly}
              hasSafetyActions={isActive && !member.isYou}
              pairPartnerName={member.isPairPartner ? null : pairPartnerName}
              isActionsOpen={openActionsMemberRef === member.memberRef}
              onOpenActionsChange={setOpenActionsMemberRef}
              onBlocked={onBlocked}
            />
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
      {isLeaveAvailable && (
        <GoTogetherGroupLeaveAction group={group} onLeft={onClose} />
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
 * and pronouns only, each other member with Block and Report), the host's
 * meeting point, icebreakers, check-in, leave, share plans and report. A
 * successful leave closes the sheet: the leave hook refetches the group,
 * which the member can no longer read. A block that moves the member out
 * closes it too.
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
  const membersHeadingRef = useRef<HTMLHeadingElement>(null);
  const handleBlocked = useAfterGroupBlock(
    groupQuery.refetch,
    membersHeadingRef,
    onClose,
  );

  return (
    <ModalSheet onClose={onClose} ariaLabel={t("goTogether:group.sheetLabel")}>
      {group ? (
        <GroupSheetBody
          group={group}
          eventSlug={eventSlug}
          openedFromConversationId={openedFromConversationId}
          onClose={onClose}
          onMerged={setCurrentGroupId}
          onBlocked={handleBlocked}
          membersHeadingRef={membersHeadingRef}
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
