import { useEffect, useRef, useState, type RefObject } from "react";
import { routes } from "../../app/routeMap";
import { reasonFor } from "../../shared/api/errorMessage";
import { useToast } from "../../shared/components/feedback/useToast";
import { MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "../subprofiles/subprofile-kinds";
import { useEventLineup, useLeaveLineup } from "./api/useEventLineup";
import { useRespondLineupInvite } from "./api/useLineupInvite";
import { lineupRoleToKind } from "./eventLineup.data";
import {
  GatheringLineupViewerLine,
  GatheringLineupViewerPanel,
  type LineupViewer,
  type LineupViewerState,
} from "./GatheringLineupViewerPanel";
import styles from "./GatheringLineup.module.css";

interface FocusTargets {
  anchorRef: RefObject<HTMLDivElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  lineRef: RefObject<HTMLDivElement | null>;
}

/**
 * The viewer's own lineup row: answer an open invite, or Leave. Lives in
 * `GatheringLineup`, which is always mounted, so the mutation callbacks still
 * run after the row's UI unmounts.
 *
 * The control the viewer pressed unmounts with the state it belonged to, so
 * after every answer or Leave focus moves to whatever shows the new state:
 * the on-lineup line after Join, the banner after a failed answer, the
 * Lineup heading after Decline or Leave, or the anchor above it when nobody
 * is on the lineup. The query re-renders a tick after the mutation callbacks
 * run, so the hook waits for the state it expects before focusing.
 */
function useLineupViewer(slug: string, targets: FocusTargets): LineupViewer {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: lineup } = useEventLineup(slug);
  const respondInvite = useRespondLineupInvite();
  const leaveLineup = useLeaveLineup(slug);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const awaitedStateRef = useRef<LineupViewerState | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const { anchorRef, headingRef, lineRef } = targets;

  const entry = lineup?.viewerEntry;
  const viewerState: LineupViewerState =
    entry?.status === "pending" || entry?.status === "accepted"
      ? entry.status
      : "none";
  const roleKind = entry ? lineupRoleToKind(entry.role) : null;
  const roleLabel = roleKind ? t(KIND_LABEL_KEYS[roleKind]) : entry?.role;

  useEffect(() => {
    if (awaitedStateRef.current !== viewerState) return;
    awaitedStateRef.current = null;
    const target =
      viewerState === "accepted"
        ? lineRef.current
        : viewerState === "none"
          ? headingRef.current
          : null;
    (target ?? anchorRef.current)?.focus();
  }, [viewerState, focusRequest, anchorRef, headingRef, lineRef]);

  const focusOnceShowing = (state: LineupViewerState) => {
    awaitedStateRef.current = state;
    setFocusRequest((count) => count + 1);
  };

  const toastError = (
    error: unknown,
    stateAfterRollback: LineupViewerState,
  ) => {
    showToast(
      reasonFor(error) ?? t("gatherings:lineupInvite.errorToast"),
      "error",
    );
    focusOnceShowing(stateAfterRollback);
  };

  const answer = (outcome: "accepted" | "declined") => {
    if (!entry) return;
    respondInvite.mutate(
      { entryId: entry.id, slug, outcome },
      {
        onSuccess: () => {
          showToast(
            outcome === "accepted"
              ? t("gatherings:lineupInvite.acceptedToast")
              : t("gatherings:lineupInvite.declinedToast"),
            outcome === "accepted" ? "success" : "info",
          );
          focusOnceShowing(outcome === "accepted" ? "accepted" : "none");
        },
        onError: (error) => toastError(error, "pending"),
      },
    );
  };

  const leave = () => {
    setIsLeaveConfirmOpen(false);
    leaveLineup.mutate(undefined, {
      onSuccess: () => {
        showToast(t("gatherings:lineupInvite.leftToast"), "info");
        focusOnceShowing("none");
      },
      onError: (error) => toastError(error, "accepted"),
    });
  };

  return {
    viewerState,
    roleLabel,
    isAnswering: respondInvite.isPending,
    answer,
    isLeaveConfirmOpen,
    openLeaveConfirm: () => setIsLeaveConfirmOpen(true),
    closeLeaveConfirm: () => setIsLeaveConfirmOpen(false),
    leave,
  };
}

/**
 * The gathering's lineup, read-only: everyone who accepted an invite to the
 * bill (DJs, performers, chefs) with their craft, each linking to their
 * profile, plus the viewer's own place on it. An open invite shows as a
 * banner above the section; once accepted, "you're on the lineup" with Leave
 * sits under the list.
 * Hosts edit it on the Manage page's Attendees tab (`GatheringLineupEditor`).
 *
 * The panel and title follow `GatheringTakingCare` and `GatheringGoodToKnow`
 * so the column reads as one surface. The section renders nothing while the
 * lineup loads, when it fails, when the viewer is a visitor (the hook keeps
 * the query disabled), or when nobody has accepted yet. A role outside the
 * curated craft list has no catalog label, so that row shows the person
 * alone. Organizers receive every status from the server, so this filters to
 * accepted.
 */
export function GatheringLineup({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { data: lineup } = useEventLineup(slug);
  const anchorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const viewer = useLineupViewer(slug, { anchorRef, headingRef, lineRef });
  const entries = (lineup?.entries ?? []).filter(
    (entry) => entry.status === "accepted",
  );

  return (
    <>
      <GatheringLineupViewerPanel ref={anchorRef} viewer={viewer} />
      {entries.length > 0 && (
        <section className={styles.panel}>
          <h2 ref={headingRef} tabIndex={-1} className={styles.heading}>
            {t("gatherings:lineup.title")}
          </h2>
          <ul className={styles.list}>
            {entries.map((entry) => {
              const roleKind = lineupRoleToKind(entry.role);
              return (
                <li key={entry.id} className={styles.row}>
                  <MemberIdentity
                    person={{
                      slug: entry.slug,
                      name: entry.name,
                      avatarUrl: entry.avatarUrl ?? undefined,
                    }}
                    secondary={
                      roleKind ? t(KIND_LABEL_KEYS[roleKind]) : undefined
                    }
                    to={`${routes.members}/${entry.slug}`}
                    size={38}
                  />
                </li>
              );
            })}
          </ul>
          <GatheringLineupViewerLine ref={lineRef} viewer={viewer} />
        </section>
      )}
    </>
  );
}
