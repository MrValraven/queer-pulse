import { useEffect, useId, useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  AvatarStack,
  Button,
  Collapse,
  CollapseListItem,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { useInviteRequests } from "./api/useInviteRequests";
import {
  useApproveInviteRequest,
  useDeclineInviteRequest,
} from "./api/useMemberInviteMutations";
import type { InviteRequestView } from "./api/memberInvites.adapters";
import { MANAGE_TAB_PANEL_ID } from "./gatheringPaths";
import styles from "./ManageInviteRequests.module.css";

/**
 * The host's approval queue on an invite-only event: members who are going
 * asked to bring a connection. The area folds open while a request waits and
 * folds away once the last one is answered. Each answered row folds out of
 * the list on its own.
 */
export function ManageInviteRequests({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const headingId = useId();
  const { requests } = useInviteRequests(slug);
  const sectionRef = useRefocusWhenQueueEmpties(requests.length);
  return (
    <Collapse isOpen={requests.length > 0}>
      <div className={styles.spacer}>
        <section
          ref={sectionRef}
          className={styles.root}
          aria-labelledby={headingId}
        >
          <h2 id={headingId} className={styles.heading}>
            {t("gatherings:manage.requests.heading")}
          </h2>
          <p className={styles.sub}>{t("gatherings:manage.requests.sub")}</p>
          <ul className={styles.list}>
            <AnimatePresence initial={false}>
              {requests.map((request) => (
                <CollapseListItem key={request.id}>
                  <InviteRequestRow slug={slug} request={request} />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </div>
    </Collapse>
  );
}

/** When the host answers the last request, the queue folds away and the
 *  button they pressed leaves with it. Focus then lands on the tab panel, the
 *  same target the page uses after its own scrolls, and keeps it off the
 *  document body. Focus that already sits elsewhere stays put. */
function useRefocusWhenQueueEmpties(requestCount: number) {
  const sectionRef = useRef<HTMLElement>(null);
  const previousCountRef = useRef(requestCount);
  useEffect(() => {
    const previousCount = previousCountRef.current;
    previousCountRef.current = requestCount;
    if (previousCount === 0 || requestCount > 0) return;
    const focused = document.activeElement;
    const isFocusLost =
      focused === null ||
      focused === document.body ||
      sectionRef.current?.contains(focused) === true;
    if (!isFocusLost) return;
    document
      .getElementById(MANAGE_TAB_PANEL_ID)
      ?.focus({ preventScroll: true });
  }, [requestCount]);
  return sectionRef;
}

/** One request: the inviter and invitee side by side (in the order the
 *  sentence names them), who wants to bring whom, and the host's two
 *  answers. Both answers point at the sentence, so a screen reader hears
 *  which request a button settles. Each row owns its mutations, so only the
 *  row being answered shows as busy. */
function InviteRequestRow({
  slug,
  request,
}: {
  slug: string;
  request: InviteRequestView;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const rowTextId = useId();
  const approve = useApproveInviteRequest(slug);
  const decline = useDeclineInviteRequest(slug);
  const isAnswering = approve.isPending || decline.isPending;
  const showError = () =>
    showToast(t("gatherings:manage.requests.errorToast"), "error");

  const onApprove = () =>
    approve.mutate(request.id, {
      onSuccess: () =>
        showToast(
          t("gatherings:manage.requests.approvedToast", {
            name: request.inviteeName,
          }),
          "success",
        ),
      onError: showError,
    });
  const onDecline = () =>
    decline.mutate(request.id, {
      onSuccess: () =>
        showToast(t("gatherings:manage.requests.declinedToast"), "success"),
      onError: showError,
    });

  return (
    <div className={styles.row}>
      {/* Decorative: the sentence beside it names both people. */}
      <AvatarStack
        aria-hidden
        size={36}
        avatars={[
          { initials: initialsFromName(request.inviterName), tint: "plum" },
          {
            initials: initialsFromName(request.inviteeName),
            tint: "jade",
            src: request.inviteeAvatarUrl,
          },
        ]}
      />
      <p id={rowTextId} className={styles.rowText}>
        <Translation
          i18nKey="gatherings:manage.requests.row"
          components={{ b: <b className={styles.name} /> }}
          values={{
            inviter: request.inviterName,
            invitee: request.inviteeName,
          }}
        />
      </p>
      <div className={styles.actions}>
        <Button
          variant="jade"
          size="sm"
          className={styles.answer}
          aria-describedby={rowTextId}
          disabled={isAnswering}
          onClick={onApprove}
        >
          {t("gatherings:manage.requests.approveCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={styles.answer}
          aria-describedby={rowTextId}
          disabled={isAnswering}
          onClick={onDecline}
        >
          {t("gatherings:manage.requests.declineCta")}
        </Button>
      </div>
    </div>
  );
}
