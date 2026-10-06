import { useMemo, useState, type ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import {
  ConfirmDialog,
  FadeIn,
  LoadErrorState,
  LoadMoreFooter,
  Tabs,
  type Tab,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { SentInviteCountsDTO } from "./api/invite.api";
import {
  useResendInvite,
  useRevokeInvite,
  useSentInviteCounts,
  useSentInvites,
  type SentInviteStatusFilter,
  type SentInviteView,
} from "./api/useSentInvites";
import { SentInviteRow, SentInviteRowSkeletons } from "./SentInviteRow";
import styles from "./SentInvitesList.module.css";

/** Turn a resend failure into an honest, no-blame line. The backend 403s an
 *  invite that isn't yours, 404s an unknown code, and 409s one that can't be
 *  re-minted (already accepted, revoked, or still valid) — each gets its own
 *  message; anything else falls through to the generic one. */
function resendErrorMessage(error: unknown, t: TFunction): string {
  const status = error instanceof ApiError ? error.status : 0;
  switch (status) {
    case 403:
      return t("auth:invite.sentList.resendError.notYours");
    case 404:
      return t("auth:invite.sentList.resendError.notFound");
    case 409:
      return t("auth:invite.sentList.resendError.notResendable");
    default:
      return t("auth:invite.sentList.resendError.generic");
  }
}

/** The invite lifecycle statuses, in tab display order. */
const STATUS_ORDER: SentInviteView["status"][] = [
  "valid",
  "used",
  "expired",
  "revoked",
];

/** One filter tab per status the member actually has, so an inviter never sees
 *  an empty "Revoked" tab, with "All" leading. The badges are the server's
 *  real totals. Fewer than two statuses means nothing to filter: no tabs. */
function tabsFor(counts: SentInviteCountsDTO | undefined, t: TFunction): Tab[] {
  if (!counts) return [];
  const present = STATUS_ORDER.filter((status) => counts[status] > 0);
  if (present.length < 2) return [];
  return [
    {
      id: "all",
      label: t("auth:invite.sentList.filter.all"),
      count: counts.all,
    },
    ...present.map((status) => ({
      id: status,
      label: t(`auth:invite.sentList.status.${status}`),
      count: counts[status],
    })),
  ];
}

/**
 * The invites the current member has already sent, with live status/expiry.
 * Tabs and their totals come from useSentInviteCounts; each tab's rows come
 * from useSentInvites, 20 at a time with a "Show more" footer (GET /invites in
 * live mode, the mock in demo mode). Renders nothing when the member has never
 * sent an invite, to keep the compose page focused for first-time inviters.
 */
export function SentInvitesList() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const countsQuery = useSentInviteCounts();
  const counts = countsQuery.data;
  const [filter, setFilter] = useState<SentInviteStatusFilter>("all");
  const tabs = useMemo(() => tabsFor(counts, t), [counts, t]);
  // A tab disappears once its total drops to zero (its last invite revoked or
  // sent again), so the list falls back to "All" with it.
  const activeFilter = tabs.some((tab) => tab.id === filter) ? filter : "all";
  const list = useSentInvites(activeFilter);
  const revoke = useRevokeInvite();
  const resend = useResendInvite();
  const [open, setOpen] = useState(true);
  // Revoking kills the link immediately and can never be undone (only an
  // *expired* invite can be re-minted), so the row's button opens this confirm
  // and the mutation waits for a second, deliberate tap.
  const [inviteToRevoke, setInviteToRevoke] = useState<SentInviteView | null>(
    null,
  );

  const handleRevokeConfirmed = () => {
    if (!inviteToRevoke) return;
    const invite = inviteToRevoke;
    setInviteToRevoke(null);
    revoke.mutate(
      { id: invite.id, code: invite.code },
      {
        onSuccess: () =>
          showToast(t("auth:invite.sentList.revokedToast"), "success"),
        // The cache flip is rolled back in `useRevokeInvite`; this tells the
        // member the link is still live so they don't assume it's dead.
        onError: () =>
          showToast(t("auth:invite.sentList.revokeError"), "error"),
      },
    );
  };
  const revokingId =
    revoke.isPending && typeof revoke.variables?.id === "string"
      ? revoke.variables.id
      : null;

  const handleResend = (invite: SentInviteView) => {
    resend.mutate(
      { id: invite.id, code: invite.code },
      {
        onSuccess: () =>
          showToast(t("auth:invite.sentList.resentToast"), "success"),
        onError: (error) => showToast(resendErrorMessage(error, t), "error"),
      },
    );
  };
  const resendingId =
    resend.isPending && typeof resend.variables?.id === "string"
      ? resend.variables.id
      : null;

  // Branch order. 1: the member has never sent an invite.
  if (counts?.all === 0) return null;
  // 2: first load. Hold the skeleton until the counts settle, so the tabs
  // never pop in above rows already on screen.
  if (countsQuery.isPending || (!counts && list.isLoading)) {
    return (
      <section className={styles.wrap}>
        <div className={styles.label}>{t("auth:invite.sentList.label")}</div>
        <SentInviteRowSkeletons />
      </section>
    );
  }
  // 3: the counts failed and the list came back empty: nothing sent to show.
  if (!counts && !list.isError && list.invites.length === 0) return null;

  // 4: the list area. A failed next page also sets `isError`, so only a first
  // page that never landed (no rows at all) may replace the list with the
  // error; once rows exist, the footer alone reports a failed page. A Retry
  // resets the failed first page to pending, which shows the skeleton again.
  const hasFirstPageFailed = list.isError && list.invites.length === 0;
  let listArea: ReactNode;
  if (list.isLoading) {
    listArea = <SentInviteRowSkeletons />;
  } else if (hasFirstPageFailed) {
    listArea = (
      <LoadErrorState
        compact
        title={t("auth:invite.sentList.loadError")}
        description={t("auth:invite.sentList.loadErrorBody")}
        onRetry={list.refetch}
      />
    );
  } else {
    listArea = (
      <>
        {/* A single FadeIn on the list container. Rows change on every filter
            tab switch, so a per-row `delay={index * 60}` stagger replayed the
            whole cascade on each switch, and each wrapper also created its
            own `will-change: transform` stacking context. */}
        <FadeIn className={styles.list}>
          {list.invites.map((invite) => (
            <SentInviteRow
              key={invite.code}
              invite={invite}
              t={t}
              fmt={fmt}
              onRevoke={setInviteToRevoke}
              isRevoking={revokingId === invite.id}
              onResend={handleResend}
              isResending={resendingId === invite.id}
            />
          ))}
        </FadeIn>
        {(list.hasNextPage || list.isFetchNextPageError) && (
          <LoadMoreFooter
            className={styles.loadMore}
            isFetchingNextPage={list.isFetchingNextPage}
            isFetchNextPageError={list.isFetchNextPageError}
            onLoadMore={list.fetchNextPage}
            errorMessage={t("auth:invite.sentList.loadMoreError")}
            label={t("auth:invite.sentList.showMore")}
            loadingLabel={t("auth:invite.sentList.loadingMore")}
          />
        )}
      </>
    );
  }

  return (
    <section className={styles.wrap}>
      <button
        type="button"
        className={styles.label}
        aria-expanded={open}
        aria-controls="sent-invites-list"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span>{t("auth:invite.sentList.label")}</span>
        <span
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden
        >
          <FiChevronDown />
        </span>
      </button>
      {open && (
        <div id="sent-invites-list">
          {tabs.length > 0 && (
            <Tabs
              tabs={tabs}
              active={activeFilter}
              onChange={(id) => setFilter(id as SentInviteStatusFilter)}
              className={styles.filter}
            />
          )}
          {listArea}
        </div>
      )}
      <ConfirmDialog
        open={inviteToRevoke !== null}
        tone="destructive"
        onClose={() => setInviteToRevoke(null)}
        onConfirm={handleRevokeConfirmed}
        title={t("auth:invite.sentList.revokeConfirm.title")}
        description={t("auth:invite.sentList.revokeConfirm.body", {
          code: inviteToRevoke?.code ?? "",
        })}
        confirmLabel={t("auth:invite.sentList.revokeConfirm.confirm")}
        cancelLabel={t("auth:invite.sentList.revokeConfirm.cancel")}
      />
    </section>
  );
}
