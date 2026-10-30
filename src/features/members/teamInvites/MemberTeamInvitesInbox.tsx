import { useRef, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse, ConfirmDialog } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMemberTeamLinkMutations } from "../../marketing/listBusiness/api/useMemberTeamLinkMutations";
import { useMemberTeamLinks } from "../../marketing/listBusiness/api/useMemberTeamLinks";
import {
  MemberTeamLinkGroup,
  type MemberTeamLinkActions,
} from "./MemberTeamLinkGroup";
import { useMemberTeamAnswers } from "./useMemberTeamAnswers";
import styles from "./MemberTeamInvites.module.css";

const KEY = "members:places.teamInvites";
const PLACES_SECTION_ID = "places";

/** Focus fell out of the inbox: onto the body, off the page, into a dialog or
 *  into a row that is folding away (inert). */
function isFocusLost(): boolean {
  const activeElement = document.activeElement;
  return (
    !(activeElement instanceof HTMLElement) ||
    activeElement === document.body ||
    !activeElement.isConnected ||
    activeElement.closest("[inert], [role='dialog'], [role='alertdialog']") !==
      null
  );
}

function isFocusTarget(element: HTMLElement | null): element is HTMLElement {
  return (
    element !== null &&
    element.isConnected &&
    element.closest("[inert]") === null
  );
}

/**
 * Businesses that invited this member onto their team, and the teams they are
 * on, answered where the member's own places live. Sits under the co-manager
 * inbox in `PlacesSection` (self view only).
 *
 * Renders nothing at all when there is nothing waiting and no team, and folds
 * away once the last row has left. A failed fetch also renders nothing, the
 * same as the co-manager inbox beside it.
 */
export function MemberTeamInvitesInbox() {
  const { t } = useTranslation();
  const format = useFormat();
  const { links } = useMemberTeamLinks();
  const mutations = useMemberTeamLinkMutations();
  const { busyLinkId, errorByLinkId, leaveTarget, setLeaveTarget, answer } =
    useMemberTeamAnswers();
  const invitesHeadingRef = useRef<HTMLHeadingElement>(null);
  const acceptedHeadingRef = useRef<HTMLHeadingElement>(null);

  const invites = links?.invitesReceived ?? [];
  const accepted = links?.accepted ?? [];
  const hasAnyRow = invites.length > 0 || accepted.length > 0;
  // The count keeps its last non-zero figure while the group folds away, so
  // it never flashes "0" on the way out.
  const [shownInviteCount, setShownInviteCount] = useState(invites.length);
  if (invites.length > 0 && invites.length !== shownInviteCount) {
    setShownInviteCount(invites.length);
  }

  // A leaving row takes the pressed button with it. Its group heading takes
  // focus back, else the other group's heading, else the Places section.
  const restoreFocusTo = (headingRef: RefObject<HTMLHeadingElement | null>) => {
    if (!isFocusLost()) return;
    [
      headingRef.current,
      invitesHeadingRef.current,
      acceptedHeadingRef.current,
      document.getElementById(PLACES_SECTION_ID),
    ]
      .find(isFocusTarget)
      ?.focus({ preventScroll: true });
  };

  const actions: MemberTeamLinkActions = {
    onAccept: (row) =>
      void answer(
        row.id,
        () => mutations.accept.mutateAsync({ linkId: row.id }),
        "accepted",
      ),
    onDecline: (row) =>
      void answer(
        row.id,
        () => mutations.decline.mutateAsync({ linkId: row.id }),
        "declined",
      ),
    onLeave: (row) => setLeaveTarget(row),
  };

  const sharedGroupProps = {
    isBusy: busyLinkId !== null,
    errorByLinkId,
    actions,
    onRowsExited: restoreFocusTo,
  };

  return (
    <>
      <Collapse isOpen={hasAnyRow}>
        <div className={styles.inbox}>
          <MemberTeamLinkGroup
            {...sharedGroupProps}
            headingId="member-team-invites"
            heading={t(`${KEY}.invites.heading`)}
            headingRef={invitesHeadingRef}
            headingAccessory={
              <span className={styles.count}>
                <span aria-hidden="true">
                  {format.number(shownInviteCount)}
                </span>
                <span className="visuallyHidden">
                  {t(`${KEY}.invites.countSpoken`, { count: shownInviteCount })}
                </span>
              </span>
            }
            intro={t(`${KEY}.invites.intro`)}
            rows={invites}
            kind="invite"
          />
          <MemberTeamLinkGroup
            {...sharedGroupProps}
            headingId="member-team-accepted"
            heading={t(`${KEY}.accepted.heading`)}
            headingRef={acceptedHeadingRef}
            rows={accepted}
            kind="accepted"
          />
        </div>
      </Collapse>
      <AnimatePresence>
        {leaveTarget && (
          <ConfirmDialog
            key="leave-team"
            open
            tone="destructive"
            loading={busyLinkId === leaveTarget.id}
            title={t(`${KEY}.leaveConfirm.title`, {
              listing: leaveTarget.listing.name,
            })}
            description={t(`${KEY}.leaveConfirm.body`)}
            confirmLabel={t(`${KEY}.leaveCta`)}
            onClose={() => setLeaveTarget(null)}
            onConfirm={() =>
              void answer(
                leaveTarget.id,
                () => mutations.leave.mutateAsync({ linkId: leaveTarget.id }),
                "left",
              )
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
