import { useRef, useState, type RefObject } from "react";
import type { IconType } from "react-icons";
import {
  FiClock,
  FiKey,
  FiPauseCircle,
  FiSlash,
  FiUsers,
} from "react-icons/fi";
import { communityPath } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRefusalPanelKind } from "./api/communityJoin.api";
import { useIsWithdrawingJoinRequest } from "./api/useCommunityJoin";
import { useWithdrawJoinRequestWithFeedback } from "./api/useWithdrawJoinRequestWithFeedback";
import { frozenBodyKeyFor, frozenTitleKeyFor } from "./communityFrozenCopy";
import { WithdrawJoinRequestModal } from "./WithdrawJoinRequestModal";
import styles from "./JoinModal.module.css";

interface RefusalCopy {
  Icon: IconType;
  title: string;
  body: string;
}

/** The icon, title and body line for one refusal, every string from a
 *  catalog key. `formatDate` renders the reapply date in the reader's
 *  language. `isOnParentPage` means the wizard is open on the parent's own
 *  page, so "join the parent first" says to join right here. */
function refusalCopyFor(
  refusal: JoinRefusalPanelKind,
  parentName: string | undefined,
  isOnParentPage: boolean,
  t: TFunction,
  formatDate: (value: Date) => string,
): RefusalCopy {
  switch (refusal.kind) {
    case "banned":
      return {
        Icon: FiSlash,
        title: t("communities:join.refusal.banned.title"),
        body: t("communities:join.refusal.banned.body"),
      };
    case "reapplyTooSoon":
      return {
        Icon: FiClock,
        title: t("communities:join.refusal.reapply.title"),
        body: refusal.reapplyAfter
          ? t("communities:join.refusal.reapply.body", {
              date: formatDate(new Date(refusal.reapplyAfter)),
            })
          : t("communities:join.refusal.reapply.bodyNoDate"),
      };
    case "inviteRequired":
      return {
        Icon: FiKey,
        title: t("communities:detail.join.inviteOnly"),
        body: t("communities:detail.join.inviteOnlyHint"),
      };
    case "frozen":
      return {
        Icon: FiPauseCircle,
        title: t(frozenTitleKeyFor(Boolean(parentName))),
        body: t(frozenBodyKeyFor(refusal.frozenReason, Boolean(parentName)), {
          name: parentName,
        }),
      };
    case "alreadyPending":
      return {
        Icon: FiClock,
        title: t("communities:join.refusal.pending.title"),
        body: t("communities:join.refusal.pending.body"),
      };
    case "parentRequired":
      return {
        Icon: FiUsers,
        title: parentName
          ? t("communities:spaces.join.parentFirst", { name: parentName })
          : t("communities:join.refusal.parent.title"),
        body:
          parentName && isOnParentPage
            ? t("communities:join.refusal.parent.bodyOnParentPage", {
                name: parentName,
              })
            : t("communities:join.refusal.parent.body"),
      };
  }
}

/**
 * "Withdraw my request" inside the already-pending panel (PRD-411). It opens
 * the same confirm the gate card and the detail hero use. Once the withdrawal
 * settles the whole wizard closes, because every answer (withdrawn, or a
 * decision that landed first) makes "your request is already in" stale, and
 * the toast says which one happened.
 *
 * The feedback hook is the one place that toasts, in both modes. Demo first
 * takes the request out of the session membership store, then runs the same
 * hook, whose mutation skips the network in demo and settles as a success.
 *
 * While the withdrawal is in flight the trigger is disabled and the confirm
 * stays open (its buttons disabled, Escape and the scrim ignored). The
 * confirm sits on top of the wizard, so the wizard cannot close underneath
 * it either: the panel stays mounted until the request settles, which is
 * what lets the hook's toast and its refresh after a 409 run. The one
 * release is a request parked while offline: then the confirm can close.
 *
 * A withdraw of this slug still in flight from anywhere (a parked one from a
 * wizard that was closed and reopened, or one from the detail hero) keeps
 * the trigger disabled and labelled as withdrawing, so a fresh panel never
 * sends a second request behind the first.
 */
function PendingRequestWithdraw({
  slug,
  communityName,
  onClose,
}: {
  slug: string;
  communityName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { withdrawRequest } = useCommunityMembership();
  const withdrawFlow = useWithdrawJoinRequestWithFeedback(slug);
  const [isConfirming, setIsConfirming] = useState(false);
  const isWithdrawInFlightAnywhere = useIsWithdrawingJoinRequest(slug);
  const isWithdrawing =
    withdrawFlow.mutation.isPending || isWithdrawInFlightAnywhere;
  // Set in the same tick as the press, so a second press or an Escape that
  // lands before `isPending` renders is ignored as well.
  const hasSentWithdrawRef = useRef(false);

  const confirmWithdraw = () => {
    if (hasSentWithdrawRef.current || isWithdrawing) return;
    hasSentWithdrawRef.current = true;
    if (demoMode) withdrawRequest(slug);
    withdrawFlow.withdraw(() => {
      hasSentWithdrawRef.current = false;
      setIsConfirming(false);
      onClose();
    });
  };
  const dismissConfirm = () => {
    // Offline, react-query parks the mutation until the network returns, so
    // `isPending` could hold the confirm shut indefinitely. A parked request
    // lets the confirm close; the ref stays set, so nothing sends twice, and
    // once the request goes out and settles, the callback above still runs.
    if (withdrawFlow.mutation.isPaused) {
      setIsConfirming(false);
      return;
    }
    if (hasSentWithdrawRef.current || isWithdrawing) return;
    setIsConfirming(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsConfirming(true)}
        disabled={isWithdrawing}
      >
        {isWithdrawing
          ? t("communities:join.refusal.pending.withdrawingCta")
          : t("communities:join.refusal.pending.withdrawCta")}
      </Button>
      {isConfirming && (
        <WithdrawJoinRequestModal
          name={communityName}
          pending={isWithdrawing}
          onConfirm={confirmWithdraw}
          onClose={dismissConfirm}
        />
      )}
    </>
  );
}

/**
 * The way forward from "join the main community first". Mounted on a space's
 * own page (`CommunityDetailDialogs`), the wizard knows the parent's slug and
 * links there. Mounted on the parent's own page (its Spaces tab), the member
 * is already where they can join, so `SpacesTab` leaves the slug out and this
 * offers a way back to the page underneath the wizard.
 */
function ParentRequiredAction({
  parentName,
  parentSlug,
  onClose,
}: {
  parentName: string;
  parentSlug?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (parentSlug) {
    return (
      <Button
        variant="primary"
        to={communityPath(parentSlug)}
        onClick={onClose}
      >
        {t("communities:join.refusal.parent.cta", { name: parentName })}
      </Button>
    );
  }
  return (
    <Button variant="primary" onClick={onClose}>
      {t("communities:join.refusal.parent.backCta", { name: parentName })}
    </Button>
  );
}

/**
 * The refusals that are an answer about the community, each worded plainly:
 * this community is closed to you (`BANNED_FROM_COMMUNITY`), you asked recently
 * and were asked to wait (`REAPPLY_TOO_SOON`), this one needs an invitation you
 * do not have (`invite_required`, PRD-141), it is paused (`COMMUNITY_FROZEN`),
 * your request is already with the moderators
 * (`COMMUNITY_JOIN_REQUEST_PENDING`), or this space needs you on its parent's
 * roster first (`PARENT_MEMBERSHIP_REQUIRED`).
 *
 * None carries a reason, a reviewer's name or a judgement. The backend
 * deliberately sends none of that, and the applicant reading this is a person
 * being turned away: the copy's job is to be clear and to leave their dignity
 * intact. A pause reads the same body line as the hub's pause banner
 * (`frozenBodyKeyFor`), so a manual pause never claims a report exists.
 *
 * The invitation case arrives as a successful 201, read off the resolved join
 * result by `isInviteRequiredResult`; the rest arrive as coded errors through
 * `joinRefusalFor`.
 */
export function JoinRefusalPanel({
  headingRef,
  refusal,
  slug,
  communityName = "",
  parentName,
  parentSlug,
  onClose,
}: {
  /** The heading ref `JoinModal` focuses when the refusal replaces the form. */
  headingRef?: RefObject<HTMLHeadingElement | null>;
  refusal: JoinRefusalPanelKind;
  /** The community's slug: the already-pending panel withdraws through it. */
  slug?: string;
  /** Named in the withdraw confirm's title. */
  communityName?: string;
  /** Set when the community is a space: names the parent in a parent pause
   *  and in "join the parent first", and titles a pause as the space's. */
  parentName?: string;
  /** The parent's slug: "join the parent first" links to the parent. Left
   *  out when the wizard is open on the parent's own page (its Spaces tab),
   *  where the panel says to join right here and offers a way back. */
  parentSlug?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  // A known parent without a slug: the wizard is open on the parent's own
  // page (its Spaces tab), the one mount that leaves the slug out.
  const isOnParentPage = Boolean(parentName) && !parentSlug;
  const { Icon, title, body } = refusalCopyFor(
    refusal,
    parentName,
    isOnParentPage,
    t,
    (value) => format.date(value),
  );
  // On the parent's own page the primary action already closes the wizard,
  // so a second button doing the same would only add noise.
  const isBackToParentPage =
    refusal.kind === "parentRequired" && isOnParentPage;

  return (
    <div>
      <div className={styles.refusalIcon}>
        <Icon aria-hidden />
      </div>
      <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
        {title}
      </h2>
      <p className={styles.desc}>{body}</p>
      <div className={styles.actions}>
        {refusal.kind === "parentRequired" && parentName && (
          <ParentRequiredAction
            parentName={parentName}
            parentSlug={parentSlug}
            onClose={onClose}
          />
        )}
        {refusal.kind === "alreadyPending" && slug && (
          <PendingRequestWithdraw
            slug={slug}
            communityName={communityName}
            onClose={onClose}
          />
        )}
        {!isBackToParentPage && (
          <Button variant="ghost" onClick={onClose}>
            {t("communities:join.refusal.closeCta")}
          </Button>
        )}
      </div>
    </div>
  );
}
