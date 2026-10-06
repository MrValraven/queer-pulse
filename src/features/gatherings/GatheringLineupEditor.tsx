import { useEffect, useRef, useState, type RefObject } from "react";
import { FiPlus } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { reasonFor } from "../../shared/api/errorMessage";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EventLineupEntryDTO, LineupEntryStatus } from "./api/events.api";
import {
  useChangeLineupRole,
  useEventLineup,
  useInviteToLineup,
  useRemoveFromLineup,
  type LineupPerson,
} from "./api/useEventLineup";
import { MAX_LINEUP_ENTRIES } from "./eventLineup.data";
import { GatheringLineupRow } from "./GatheringLineupRow";
import { LineupInviteComposerModal } from "./LineupInviteComposerModal";
import styles from "./GatheringLineupEditor.module.css";

/**
 * Host/co-host lineup editor on the Manage page's Attendees tab. Every action
 * saves at once: invite (two-step composer), change a role, remove or
 * withdraw, invite a decliner again. Rows show Invited, Confirmed or
 * Declined; only confirmed performers appear on the public page.
 */
export function GatheringLineupEditor({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { data: lineup } = useEventLineup(slug);
  const inviteToLineup = useInviteToLineup(slug);
  const changeRole = useChangeLineupRole(slug);
  const removeFromLineup = useRemoveFromLineup(slug);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldReclaimFocusRef = useRef(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] =
    useState<EventLineupEntryDTO | null>(null);
  // Slugs whose invite POST is still in flight. Demo keeps the optimistic id
  // for good, so this set follows the request.
  const [creatingSlugs, setCreatingSlugs] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const entries = lineup?.entries ?? [];
  const countOf = (status: LineupEntryStatus) =>
    entries.filter((entry) => entry.status === status).length;
  const confirmedCount = countOf("accepted");
  const invitedCount = countOf("pending");
  // Only open rows (pending and accepted) count towards the cap.
  const isAtCap = confirmedCount + invitedCount >= MAX_LINEUP_ENTRIES;
  // Everyone already listed in any status, plus the viewer: inviting yourself
  // is always refused, and the host is usually going.
  const viewerSlug = user?.profile.slug;
  const excludeSlugs = entries.map((entry) => entry.slug);
  if (viewerSlug) excludeSlugs.push(viewerSlug);

  // Removing a row, or inviting a decliner again, unmounts the control that
  // held focus once the optimistic update lands, a tick after the click (and
  // after a confirm dialog has handed focus back to that control). Park focus
  // on the panel heading when the cache change has dropped it to the body.
  useEffect(() => {
    if (!shouldReclaimFocusRef.current) return;
    shouldReclaimFocusRef.current = false;
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) return;
    headingRef.current?.focus();
  }, [lineup]);

  // Each write settles through its own promise: overlapping `mutate` calls
  // keep only the latest call's callbacks, which would swallow earlier errors.
  const toastError = (error: unknown) =>
    showToast(reasonFor(error) ?? t("gatherings:lineup.errorToast"), "error");
  const toastSent = (name: string) =>
    showToast(t("gatherings:lineup.sentToast", { name }), "success");

  const setCreating = (memberSlug: string, isCreating: boolean) =>
    setCreatingSlugs((current) => {
      const next = new Set(current);
      if (isCreating) next.add(memberSlug);
      else next.delete(memberSlug);
      return next;
    });

  const invite = (person: LineupPerson, role: string) => {
    setIsComposerOpen(false);
    setCreating(person.slug, true);
    void inviteToLineup
      .mutateAsync({ person, role })
      .then(() => toastSent(person.name), toastError)
      .finally(() => setCreating(person.slug, false));
  };

  const remove = (entry: EventLineupEntryDTO) => {
    shouldReclaimFocusRef.current = true;
    void removeFromLineup
      .mutateAsync({ memberSlug: entry.slug })
      .then(
        () =>
          showToast(
            t("gatherings:lineup.removedToast", { name: entry.name }),
            "success",
          ),
        toastError,
      );
  };

  const requestRemoval = (entry: EventLineupEntryDTO) => {
    if (entry.status === "accepted") setPendingRemoval(entry);
    else remove(entry);
  };

  const inviteAgain = (entry: EventLineupEntryDTO) => {
    shouldReclaimFocusRef.current = true;
    invite(entry, entry.role);
  };

  return (
    <section className={styles.panel}>
      <LineupPanelHead
        headingRef={headingRef}
        confirmedCount={confirmedCount}
        invitedCount={invitedCount}
        isAtCap={isAtCap}
        onInvite={() => setIsComposerOpen(true)}
      />

      {entries.length === 0 ? (
        <p className={styles.empty}>{t("gatherings:lineup.empty")}</p>
      ) : (
        <div className={styles.rows}>
          {entries.map((entry) => (
            <GatheringLineupRow
              key={entry.slug}
              entry={entry}
              isCreating={creatingSlugs.has(entry.slug)}
              isInviteAgainDisabled={isAtCap}
              onRoleChange={(role) =>
                void changeRole
                  .mutateAsync({ memberSlug: entry.slug, role })
                  .catch(toastError)
              }
              onRemove={() => requestRemoval(entry)}
              onInviteAgain={() => inviteAgain(entry)}
            />
          ))}
        </div>
      )}

      {isComposerOpen && (
        <LineupInviteComposerModal
          slug={slug}
          excludeSlugs={excludeSlugs}
          onSend={(person, role) =>
            invite(
              {
                slug: person.slug,
                name: person.name,
                avatarUrl: person.avatarUrl ?? null,
              },
              role,
            )
          }
          onClose={() => setIsComposerOpen(false)}
        />
      )}

      {pendingRemoval && (
        <ConfirmDialog
          open
          onClose={() => setPendingRemoval(null)}
          onConfirm={() => {
            remove(pendingRemoval);
            setPendingRemoval(null);
          }}
          title={t("gatherings:lineup.removeConfirmTitle", {
            name: pendingRemoval.name,
          })}
          description={t("gatherings:lineup.removeConfirmBody")}
          confirmLabel={t("gatherings:lineup.removeConfirmCta")}
          tone="destructive"
        />
      )}
    </section>
  );
}

/**
 * Title, description, the "2 confirmed · 1 invited" line (zero parts left
 * out) and the invite button. At the cap the button waits and a quiet line
 * says why.
 */
function LineupPanelHead({
  headingRef,
  confirmedCount,
  invitedCount,
  isAtCap,
  onInvite,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  confirmedCount: number;
  invitedCount: number;
  isAtCap: boolean;
  onInvite: () => void;
}) {
  const { t } = useTranslation();
  const countParts = [
    confirmedCount > 0 &&
      t("gatherings:lineup.countConfirmed", { count: confirmedCount }),
    invitedCount > 0 &&
      t("gatherings:lineup.countInvited", { count: invitedCount }),
  ].filter(Boolean);

  return (
    <div className={styles.panelHead}>
      <div>
        <h2 ref={headingRef} tabIndex={-1} className={styles.panelTitle}>
          {t("gatherings:lineup.title")}
        </h2>
        <p className={styles.panelDesc}>{t("gatherings:lineup.description")}</p>
        {countParts.length > 0 && (
          <p className={styles.counts}>{countParts.join(" · ")}</p>
        )}
        {isAtCap && (
          <p className={styles.counts}>
            {t("gatherings:lineup.atCapHint", { max: MAX_LINEUP_ENTRIES })}
          </p>
        )}
      </div>
      <Button variant="ghost" onClick={onInvite} disabled={isAtCap}>
        <FiPlus size={16} aria-hidden /> {t("gatherings:lineup.inviteCta")}
      </Button>
    </div>
  );
}
