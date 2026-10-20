import { useRef, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import {
  Collapse,
  ConfirmDialog,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { usePersonaTeamLinks } from "../../marketing/listBusiness/api/usePersonaTeamLinks";
import { usePersonaTeamLinkMutations } from "../../marketing/listBusiness/api/usePersonaTeamLinkMutations";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { WorksAtLinkGroup, type WorksAtLinkActions } from "./WorksAtLinkRow";
import { WorksAtListingPicker } from "./WorksAtListingPicker";
import { useWorksAtAnswers } from "./useWorksAtAnswers";
import { isPersonaTeamEligible } from "./worksAtEditor.data";
import styles from "./WorksAtEditor.module.css";

const KEY = "subprofiles:worksAtEditor";

/** Focus fell out of the pane: onto the body, off the page, or into a row
 *  that is folding away (inert). */
function isFocusLost(): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement === null ||
    activeElement === document.body ||
    !activeElement.isConnected ||
    activeElement.closest("[inert]") !== null
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
 * The "Works at" pane: invites waiting for an answer, requests sent and the
 * businesses this persona works at. Every answer acts when pressed, so the
 * pane saves nothing through the save bar.
 */
export function SubprofileWorksAtEditor({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { links, isLoading, isError, refetch } = usePersonaTeamLinks(
    subprofile.id,
  );
  const mutations = usePersonaTeamLinkMutations(subprofile.id);
  const { busyLinkId, errorByLinkId, leaveTarget, setLeaveTarget, answer } =
    useWorksAtAnswers();
  const invitesHeadingRef = useRef<HTMLHeadingElement>(null);
  const requestsHeadingRef = useRef<HTMLHeadingElement>(null);
  const acceptedHeadingRef = useRef<HTMLHeadingElement>(null);
  const isEligible = isPersonaTeamEligible(subprofile);

  // A leaving row takes the pressed button with it. Its list heading takes
  // focus back, or "Where you work" once that list has folded away too.
  const restoreFocusTo = (headingRef: RefObject<HTMLHeadingElement | null>) => {
    if (!isFocusLost()) return;
    [headingRef.current, acceptedHeadingRef.current]
      .find(isFocusTarget)
      ?.focus();
  };

  const actions: WorksAtLinkActions = {
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
    onCancel: (row) =>
      void answer(
        row.id,
        () => mutations.cancelRequest.mutateAsync({ linkId: row.id }),
        "cancelled",
      ),
    onLeave: (row) => setLeaveTarget(row),
  };

  let body;
  if (isLoading) {
    body = <SkeletonLine width="100%" height={56} />;
  } else if (isError || !links) {
    body = <LoadErrorState compact onRetry={refetch} />;
  } else {
    // What every group shares; the heading refs go straight to each group.
    const sharedGroupProps = {
      isBusy: busyLinkId !== null,
      errorByLinkId,
      isAcceptBlocked: !isEligible,
      actions,
      onRowsExited: restoreFocusTo,
    };
    body = (
      <>
        <WorksAtLinkGroup
          {...sharedGroupProps}
          headingId="works-at-invites"
          heading={t(`${KEY}.invites.heading`)}
          headingRef={invitesHeadingRef}
          rows={links.invitesReceived}
          kind="invite"
        />
        <WorksAtLinkGroup
          {...sharedGroupProps}
          headingId="works-at-requests"
          heading={t(`${KEY}.requests.heading`)}
          headingRef={requestsHeadingRef}
          rows={links.requestsSent}
          kind="request"
        />
        <WorksAtLinkGroup
          {...sharedGroupProps}
          headingId="works-at-accepted"
          heading={t(`${KEY}.accepted.heading`)}
          headingRef={acceptedHeadingRef}
          emptyText={t(`${KEY}.accepted.empty`)}
          rows={links.accepted}
          kind="accepted"
        />
      </>
    );
  }

  return (
    <div className={styles.pane}>
      <Collapse isOpen={!isEligible}>
        <p className={styles.notice} role="status">
          {t(`${KEY}.ineligibleNotice`)}
        </p>
      </Collapse>
      <WorksAtListingPicker
        subprofileId={subprofile.id}
        isPersonaEligible={isEligible}
      />
      {body}
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
    </div>
  );
}
