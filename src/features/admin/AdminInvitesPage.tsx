import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type Ref,
  type ReactNode,
} from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiSliders } from "react-icons/fi";
import {
  Button,
  FadeIn,
  LoadErrorState,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip } from "./ui";
import { AdminArrowSeparator } from "./ui/AdminInlineMarkers";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  isInviteInFilter,
  useAdminInvites,
  useAdminInviteInviters,
  useReconcileAdminInviteMembership,
  type AdminInviteFilter,
} from "./api/useAdminInvites";
import { AdminInviteDrawer } from "./AdminInviteDrawer";
import { AdminInviteQuotaModal } from "./AdminInviteQuotaModal";
import { ADMIN_INVITE_STATUS_TONE } from "./adminInviteStatusTone";
import type { AdminInviteDTO, AdminInviteStatus } from "./api/adminInvites.api";
import styles from "./AdminInvitesPage.module.css";

const FILTERS: AdminInviteFilter[] = [
  "all",
  "valid",
  "used",
  "expired",
  "revoked",
];

/** Day + month + year, locale-aware. */
function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Who the invite was addressed to: the member who accepted, a target email, or
 *  "anyone with the link". */
function recipientLine(invite: AdminInviteDTO, t: TFunction): string {
  if (invite.invitee) {
    return t("admin:adminInvites.row.toMember", { name: invite.invitee.name });
  }
  if (invite.email) {
    return t("admin:adminInvites.row.toEmail", { email: invite.email });
  }
  return t("admin:adminInvites.row.toAnyone");
}

function AdminInviteRow({
  invite,
  onOpen,
  isLeaving,
}: {
  invite: AdminInviteDTO;
  onOpen: () => void;
  /** On its way out of the grid: no longer a Tab stop. */
  isLeaving: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div
      className={styles.row}
      role="button"
      tabIndex={isLeaving ? -1 : 0}
      aria-label={t("admin:adminInvites.row.open", { code: invite.code })}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{invite.code}</span>
          <AdminChip tone={ADMIN_INVITE_STATUS_TONE[invite.status]} dot>
            {t(`admin:adminInvites.status.${invite.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminInvites.row.from", { name: invite.inviter.name })}
          <AdminArrowSeparator />
          {recipientLine(invite, t)}
        </div>
        <div className={styles.rowDates}>
          {t("admin:adminInvites.row.sent", {
            date: shortDate(fmt, invite.createdAt),
          })}
          {" · "}
          {t("admin:adminInvites.row.expires", {
            date: shortDate(fmt, invite.expiresAt),
          })}
        </div>
      </div>
    </div>
  );
}

function InviteRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={80}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/** Same curve as the `--ease` token, for motion's JS-driven transitions. */
const EASE_CURVE = [0.22, 0.68, 0.16, 1] as const;

/**
 * Hands keyboard focus on from a card that is leaving the grid: to the next
 * card still in it, else the one before, else `onNoRowLeft`. Without this,
 * closing the drawer returns focus to the card that opened it just as that
 * card leaves, and focus drops to <body>.
 */
function handOffFocusFromLeavingCell(
  leavingCell: HTMLElement,
  onNoRowLeft: () => void,
) {
  const remainingCells = Array.from(
    leavingCell.parentElement?.children ?? [],
  ).filter(
    (cell): cell is HTMLElement =>
      cell instanceof HTMLElement &&
      cell !== leavingCell &&
      cell.dataset.inviteCell !== undefined &&
      cell.getAttribute("aria-hidden") !== "true",
  );
  const nextCell =
    remainingCells.find(
      (cell) =>
        (leavingCell.compareDocumentPosition(cell) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
        0,
    ) ?? remainingCells[remainingCells.length - 1];
  const nextRow = nextCell?.querySelector<HTMLElement>('[role="button"]');
  if (nextRow) nextRow.focus();
  else onNoRowLeft();
}

/**
 * One grid cell of the invite list. It leaves with a short fade and shrink
 * while the cards after it glide into its place (`popLayout` on the grid's
 * `AnimatePresence`, `layout="position"` here), and at once with reduced
 * motion. While it leaves it is hidden from assistive tech, ignores the
 * pointer and hands any focus it holds to a neighbour.
 */
function AdminInviteRowCell({
  inviteId,
  onNoRowLeft,
  children,
  ref,
}: {
  inviteId: string;
  onNoRowLeft: () => void;
  children: (isLeaving: boolean) => ReactNode;
  /** The one `AnimatePresence` uses to measure the cell before lifting it
   *  out of the grid (`popLayout`). */
  ref?: Ref<HTMLDivElement>;
}) {
  const isPresent = useIsPresent();
  const { reducedMotion } = useMotionPrefs();
  const onNoRowLeftRef = useRef(onNoRowLeft);
  useLayoutEffect(() => {
    onNoRowLeftRef.current = onNoRowLeft;
  });

  // The drawer's focus restore and this exit can land in either order: the
  // card may already hold focus as it starts leaving (handled here), or the
  // restore may focus it a moment later (handled by `onFocus` below).
  useLayoutEffect(() => {
    if (isPresent) return;
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) return;
    const leavingCell =
      activeElement.closest<HTMLElement>("[data-invite-cell]");
    if (leavingCell?.dataset.inviteCell !== inviteId) return;
    handOffFocusFromLeavingCell(leavingCell, () => onNoRowLeftRef.current());
  }, [isPresent, inviteId]);

  return (
    <m.div
      ref={ref}
      className={styles.rowCell}
      data-invite-cell={inviteId}
      aria-hidden={isPresent ? undefined : true}
      style={{ pointerEvents: isPresent ? undefined : "none" }}
      onFocus={
        isPresent
          ? undefined
          : (event: FocusEvent<HTMLDivElement>) =>
              handOffFocusFromLeavingCell(event.currentTarget, () =>
                onNoRowLeftRef.current(),
              )
      }
      layout="position"
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: EASE_CURVE }}
    >
      {children(!isPresent)}
    </m.div>
  );
}

/**
 * The list area under the filters: skeleton, load error, empty line, or the
 * card grid with its Load more. `isRowLeaving` keeps the grid up while the
 * last card of a list plays its exit, so the empty line only arrives once it
 * has gone.
 */
function AdminInviteResults({
  filter,
  inviterSlug,
  isRowLeaving,
  onRowExitComplete,
  onOpenInvite,
  onNoRowLeft,
}: {
  filter: AdminInviteFilter;
  inviterSlug: string | null;
  isRowLeaving: boolean;
  onRowExitComplete: () => void;
  onOpenInvite: (invite: AdminInviteDTO) => void;
  onNoRowLeft: () => void;
}) {
  const { t } = useTranslation();
  // The sender filter runs server-side: `inviterSlug` is passed to the query so
  // it narrows the whole invite graph, beyond the pages loaded so far.
  const {
    invites,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminInvites(filter, inviterSlug);

  // An outage read as "no invites match this filter", which invites an admin
  // to loosen a filter that was never the problem (DES-22).
  if (isLoading) return <InviteRowsSkeleton />;
  if (isError) {
    return (
      <LoadErrorState
        onRetry={() => void refetch()}
        title={t("admin:adminInvites.loadError.title")}
        description={t("admin:adminInvites.loadError.body")}
      />
    );
  }
  if (invites.length === 0 && !isRowLeaving) {
    return (
      <p className={styles.emptyLine}>
        {inviterSlug
          ? t("admin:adminInvites.emptyForInviter")
          : t("admin:adminInvites.empty")}
      </p>
    );
  }
  return (
    <>
      {/* Keyed by the filters, so switching tab or sender swaps the grid
          outright and only a card leaving its own list plays an exit. */}
      <div key={`${filter}:${inviterSlug ?? ""}`} className={styles.rows}>
        <AnimatePresence
          mode="popLayout"
          initial={false}
          onExitComplete={onRowExitComplete}
        >
          {invites.map((invite, index) => (
            <AdminInviteRowCell
              key={invite.id}
              inviteId={invite.id}
              onNoRowLeft={onNoRowLeft}
            >
              {(isLeaving) => (
                <FadeIn delay={Math.min(index, 8) * 50}>
                  <AdminInviteRow
                    invite={invite}
                    isLeaving={isLeaving}
                    onOpen={() => onOpenInvite(invite)}
                  />
                </FadeIn>
              )}
            </AdminInviteRowCell>
          ))}
        </AnimatePresence>
      </div>
      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="md"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage
              ? t("admin:adminInvites.loadingMore")
              : t("admin:adminInvites.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}

/** The open drawer's invite, plus the status it opened with, so closing it
 *  can tell whether a revoke or refresh happened in between. */
interface InviteDrawerSession {
  invite: AdminInviteDTO;
  openedWithStatus: AdminInviteStatus;
}

/**
 * Admin invite oversight: every invite on the platform, with inviter, recipient
 * (or target email), status, and dates, filterable by status. Demo mode reads the
 * colocated fixture; live mode calls `GET /admin/invites` with pagination.
 */
export function AdminInvitesPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AdminInviteFilter>("all");
  const [inviterSlug, setInviterSlug] = useState<string | null>(null);
  const [drawerSession, setDrawerSession] =
    useState<InviteDrawerSession | null>(null);
  const [isRowLeaving, setIsRowLeaving] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const reconcileMembership = useReconcileAdminInviteMembership();
  // The sender filter's options come from a dedicated inviters list covering
  // every sender platform-wide (not only those already fetched).
  const { inviters } = useAdminInviteInviters();

  const inviterOptions = useMemo(
    () =>
      inviters.map((inviter) => ({
        value: inviter.slug,
        label: `${inviter.name} (${inviter.count})`,
        keywords: inviter.name,
      })),
    [inviters],
  );

  // The drawer holds its own copy of the row (the list hands it the whole
  // DTO), so a confirmed revoke or refresh has to be reflected here too or the
  // chip would keep reading the old status behind the toast.
  const handleInviteChanged = (changedInvite: AdminInviteDTO) =>
    setDrawerSession(
      (session) => session && { ...session, invite: changedInvite },
    );

  // The acted-on row stays in its list for as long as the drawer is open, so
  // it never vanishes mid-read. Once the drawer closes, a row whose status
  // changed leaves every list it no longer belongs to.
  const handleDrawerClose = () => {
    if (!drawerSession) return;
    const { invite, openedWithStatus } = drawerSession;
    setDrawerSession(null);
    if (invite.status === openedWithStatus) return;
    if (!isInviteInFilter(filter, invite.status)) setIsRowLeaving(true);
    reconcileMembership(invite);
  };

  const focusActiveTab = () =>
    tabsRef.current
      ?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      ?.focus();

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminInvites.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminInvites.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminInvites.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminInvites.header.sub")}
          actions={
            inviterOptions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuotaModalOpen(true)}
              >
                <FiSliders aria-hidden />{" "}
                {t("admin:adminInvites.quota.manageCta")}
              </Button>
            )
          }
        />
      </FadeIn>

      <FadeIn delay={60} ref={tabsRef}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:adminInvites.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) => {
            setFilter(value as AdminInviteFilter);
            setIsRowLeaving(false);
          }}
        />
      </FadeIn>

      {inviterOptions.length > 1 && (
        <FadeIn delay={70} className={styles.filterFade}>
          <div className={styles.filterBar}>
            <span className={styles.filterLabel} id="invite-inviter-label">
              {t("admin:adminInvites.filterByInviter")}
            </span>
            <Select
              labelledBy="invite-inviter-label"
              size="sm"
              clearable
              value={inviterSlug}
              placeholder={t("admin:adminInvites.allInviters")}
              options={inviterOptions}
              onChange={(slug) => {
                setInviterSlug(slug);
                setIsRowLeaving(false);
              }}
            />
          </div>
        </FadeIn>
      )}

      <FadeIn delay={80}>
        <AdminInviteResults
          filter={filter}
          inviterSlug={inviterSlug}
          isRowLeaving={isRowLeaving}
          onRowExitComplete={() => setIsRowLeaving(false)}
          onOpenInvite={(invite) =>
            setDrawerSession({ invite, openedWithStatus: invite.status })
          }
          onNoRowLeft={focusActiveTab}
        />
      </FadeIn>

      {drawerSession && (
        <AdminInviteDrawer
          invite={drawerSession.invite}
          onClose={handleDrawerClose}
          onRevoked={handleInviteChanged}
          onRefreshed={handleInviteChanged}
        />
      )}

      {quotaModalOpen && (
        <AdminInviteQuotaModal
          inviters={inviters}
          onClose={() => setQuotaModalOpen(false)}
        />
      )}
    </AdminShell>
  );
}
