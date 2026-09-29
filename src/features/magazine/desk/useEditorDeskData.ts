/**
 * The desk's data layer: every dual-mode fetch hook, the selected issue and
 * scope, the viewer's identity, the focus chips and the table's filter
 * state. `useEditorDesk` layers the actions and overlays on top of this.
 */

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMagazineSections } from "../api/useMagazineSections";
import { usePieces } from "../api/usePieces";
import { usePitches } from "../api/usePitches";
import { useDeskSummary } from "../api/useDeskSummary";
import { useMagazineEditors } from "../api/useMagazineEditors";
import { useCurrentIssue } from "../api/useCurrentIssue";
import { useDeskIssues } from "../api/useDeskIssues";
import { usePieceMutations } from "../api/usePieceMutations";
import { usePitchMutations } from "../api/usePitchMutations";
import { useDeskState } from "./useDeskState";
import { useDeskTracks } from "./useDeskTracks";
import { useDeskIssueSelection } from "./useDeskIssueSelection";
import { useDeskScopePick } from "./useDeskScopePick";
import { useDeskFocus } from "./useDeskFocus";
import { useDeskViewerId } from "./useDeskViewerId";

export function useEditorDeskData() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const pieceQuery = usePieces({});
  const pitchQuery = usePitches();
  const { pieces } = pieceQuery;
  const { pitches } = pitchQuery;
  const { summary } = useDeskSummary();
  const pieceMutations = usePieceMutations();
  const pitchMutations = usePitchMutations();
  // The editor directory backs the rail's team names and the filter menu.
  const { editors, isLoading: isEditorDirectoryLoading } = useMagazineEditors();
  // PRD-130: the section taxonomy behind the Issue plan, the commission
  // picker, Write and Build a deck. The two flags travel with the list: an
  // empty picker that files a piece into no section is worse than a
  // disabled one.
  const {
    sections,
    isLoading: areSectionsLoading,
    isError: hasSectionsError,
  } = useMagazineSections();

  // Which issue the desk works on is the editor's choice (`?issue=`); the
  // backend's current issue is only the default.
  const { issues, isLoading: isIssueListLoading } = useDeskIssues();
  const { issue: currentIssue } = useCurrentIssue();
  const { deskIssue: issue, selectIssue } = useDeskIssueSelection({
    issues,
    currentIssue,
    searchParams,
    setSearchParams,
  });
  const selectIssueScope = useDeskScopePick(setSearchParams);

  // `editorId` on new work must be a real user UUID: the signed-in editor in
  // live mode (never `editors[0]`, which could misattribute a commission),
  // the first fixture editor in demo (`useDeskViewerId`, the rule every
  // desk surface reads). The desk always acts as the viewer.
  const activeMe = useDeskViewerId();

  const tracks = useDeskTracks({
    pieces,
    issue,
    searchParams,
    setSearchParams,
    pieceMutations,
    showToast,
    translate: t,
  });
  const focus = useDeskFocus();
  // The "at-risk" chip reads the issue's close day, as the rail's forecast
  // does: only the issue scope has one (`useDeskCalendarProps`' rule).
  const deskState = useDeskState(tracks.activePieces, activeMe, {
    activeFocusIds: focus.activeFocusIds,
    closesOn: tracks.track === "issue" ? (issue.closesOn ?? null) : null,
    pitchIds: pitches.map((pitch) => pitch.id),
  });

  // Issues feed the scope's own default (`useDeskTracks`' "issue when there
  // is a current one, else unassigned"): while they are still loading, that
  // default reads as Unassigned and the scope would flicker into the issue
  // scope once the list lands, so the desk's own loading state waits for it.
  const isLoading =
    pieceQuery.isLoading || pitchQuery.isLoading || isIssueListLoading;
  // Either failed list is enough to make an empty desk a lie, so both feed
  // the one error band (DES-22).
  const hasDeskLoadError = pieceQuery.isError || pitchQuery.isError;
  const retry = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
    void queryClient.invalidateQueries({ queryKey: ["magazine-pitches"] });
  }, [queryClient]);

  // A chip, a Filter-menu filter or a search narrows the table, so it can no
  // longer say that nothing waits on you.
  const isFiltered =
    focus.activeFocusIds.length > 0 ||
    deskState.q.trim() !== "" ||
    deskState.fmt !== "all" ||
    deskState.sectionFilter.length > 0 ||
    deskState.stageFilter.length > 0 ||
    deskState.editorFilter !== null;

  return {
    searchParams,
    setSearchParams,
    showToast,
    translate: t,
    pieces,
    pitches,
    arePitchesLoading: pitchQuery.isLoading,
    summary,
    pieceMutations,
    pitchMutations,
    editors,
    isEditorDirectoryLoading,
    sections,
    areSectionsLoading,
    hasSectionsError,
    issues,
    issue,
    selectIssue,
    selectIssueScope,
    activeMe,
    tracks,
    focus,
    deskState,
    isLoading,
    hasDeskLoadError,
    retry,
    isFiltered,
  };
}
