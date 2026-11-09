import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type JSX,
  type RefObject,
} from "react";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowFramelessPage } from "../../quizshow/useQuizshowFramelessPage";
import { useVjScenes } from "../api/useVjScenes";
import { useVjSetlists } from "../api/useVjSetlists";
import { useVjStage } from "../live/useVjStage";
import type { VjErrorValues } from "../live/vjStageCommands";
import { VjFlashConsentPopover } from "./dock/VjFlashConsentPopover";
import { useVjCueMode } from "./hooks/useVjCueMode";
import { useVjDockPads } from "./hooks/useVjDockPads";
import { useVjFlashConsent } from "./hooks/useVjFlashConsent";
import { useVjMirrorFrames } from "./hooks/useVjMirrorFrames";
import { useVjRemoteClock } from "./hooks/useVjRemoteClock";
import { useVjRemoteLayout } from "./hooks/useVjRemoteLayout";
import { useVjRemoteKeyboard } from "./input/useVjRemoteKeyboard";
import { useVjMidi } from "./midi/useVjMidi";
import {
  useVjMidiMappings,
  type UseVjMidiMappingsResult,
} from "./midi/useVjMidiMappings";
import { useVjMidiLearn, VjMidiLearnProvider } from "./midi/VjMidiLearnContext";
import {
  useVjRemoteActions,
  type VjFlashConsentRequest,
} from "./page/useVjRemoteActions";
import { useVjRemoteLibrary } from "./page/useVjRemoteLibrary";
import { useVjRemoteSheets } from "./page/useVjRemoteSheets";
import { VjRemoteDock } from "./page/VjRemoteDock";
import { VjRemoteSheetsHost } from "./page/VjRemoteSheetsHost";
import {
  VjRemoteShell,
  type VjRemoteSession,
  type VjRemoteView,
} from "./page/VjRemoteShell";
import type { VjGridSource } from "./top/VjRemoteTopRow";
import { useVjCommandRunner } from "./useVjCommandRunner";
import { vjRemoteOfflineReasonOf } from "./vjRemoteOffline";

/** The grid's source, favorites only and search: local to this page load. */
function useVjRemoteView(): VjRemoteView {
  const [gridSource, setGridSource] = useState<VjGridSource>("pack");
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toggleFavoritesOnly = useCallback(() => {
    setGridSource("pack");
    setIsFavoritesOnly((wasOn) => !wasOn);
  }, []);
  const toggleSearch = useCallback(() => {
    setGridSource("pack");
    setIsSearchOpen((wasOpen) => !wasOpen);
  }, []);
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);
  return useMemo(
    () => ({
      gridSource,
      setGridSource,
      isFavoritesOnly,
      toggleFavoritesOnly,
      isSearchOpen,
      toggleSearch,
      closeSearch,
      searchQuery,
      setSearchQuery,
    }),
    [
      gridSource,
      isFavoritesOnly,
      toggleFavoritesOnly,
      isSearchOpen,
      toggleSearch,
      closeSearch,
      searchQuery,
    ],
  );
}

/**
 * The status line's refusal: the newest reason the dispatcher named (a
 * favorite's REST refusal included), held until the stage moves on, else the
 * command runner's last refusal. The runner's {max} or {min} go with its own
 * key; a dispatcher key takes them only when the runner refused with the
 * same key (the same send, seen by both).
 */
function useVjStatusErrorKey(
  runnerError: { key: string | null; values: VjErrorValues | null },
  stateRevision: number | null,
): {
  errorKey: string | null;
  errorValues: VjErrorValues | null;
  onRefused: (errorKey: string | null) => void;
} {
  const [refusal, setRefusal] = useState<{
    key: string;
    revision: number | null;
  } | null>(null);
  const revisionRef = useRef(stateRevision);
  useEffect(() => {
    revisionRef.current = stateRevision;
  });
  const onRefused = useCallback((errorKey: string | null) => {
    if (errorKey === null) return;
    setRefusal({ key: errorKey, revision: revisionRef.current });
  }, []);
  const isRefusalCurrent =
    refusal !== null && refusal.revision === stateRevision;
  if (!isRefusalCurrent) {
    return {
      errorKey: runnerError.key,
      errorValues: runnerError.values,
      onRefused,
    };
  }
  return {
    errorKey: refusal.key,
    errorValues: refusal.key === runnerError.key ? runnerError.values : null,
    onRefused,
  };
}

/**
 * The pad's own element, else the dock, for a press that came without one
 * (keyboard, MIDI). A set list step without one sits on the set list group.
 */
function vjConsentAnchorOf(request: VjFlashConsentRequest): HTMLElement | null {
  if (request.anchor !== null) return request.anchor;
  if (request.sceneName !== undefined) {
    const setlistGroup = document.querySelector<HTMLElement>(
      "[data-vj-setlist-group]",
    );
    if (setlistGroup !== null) return setlistGroup;
  }
  const padSelector =
    request.padId === null ? null : `[data-vj-pad="${request.padId}"]`;
  return (
    (padSelector === null
      ? null
      : document.querySelector<HTMLElement>(padSelector)) ??
    document.querySelector<HTMLElement>("[data-vj-remote-dock]")
  );
}

/** The flash warning for the press that waits on it, anchored on the control that asked. */
function VjRemoteFlashConsent({
  session,
}: {
  session: VjRemoteSession;
}): JSX.Element {
  const { t } = useTranslation();
  const { flashConsent, confirmFlash, dismissFlash } = session.actions;
  // Keeps the last request while the popover fades out.
  const [shownRequest, setShownRequest] = useState(flashConsent);
  if (flashConsent !== null && flashConsent !== shownRequest) {
    setShownRequest(flashConsent);
  }
  const anchorRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({
      current: shownRequest === null ? null : vjConsentAnchorOf(shownRequest),
    }),
    [shownRequest],
  );
  const padId = shownRequest?.padId ?? null;
  const transitionMode = shownRequest?.transitionMode ?? null;
  const sceneName = shownRequest?.sceneName;
  // A scene reads "Turn on <scene name> now": the scene's name is its label.
  const effectLabel =
    sceneName !== undefined
      ? sceneName
      : padId === "strobe"
        ? t("vj:effects.strobe")
        : padId !== null
          ? t(`vj:effect.name.${padId}`)
          : transitionMode !== null
            ? t(`vj:transition.mode.${transitionMode}`)
            : t("vj:transition.title");
  return (
    <VjFlashConsentPopover
      anchorRef={anchorRef}
      effectLabel={effectLabel}
      isOpen={flashConsent !== null}
      onConsent={confirmFlash}
      onClose={dismissFlash}
    />
  );
}

/** Every hook the remote runs, inside the MIDI learn provider. */
function VjRemotePage({
  midiMappings,
}: {
  midiMappings: UseVjMidiMappingsResult;
}): JSX.Element {
  const stage = useVjStage({ role: "remote" });
  const isOnline = useOnlineStatus();
  const offlineReason = vjRemoteOfflineReasonOf(stage, isOnline);
  const isBlocked = offlineReason !== null;
  const { run, lastErrorKey, lastErrorValues } = useVjCommandRunner(stage);
  // The phone stays awake while the remote is open.
  useScreenWakeLock(true);
  const clock = useVjRemoteClock(stage);
  const frames = useVjMirrorFrames(stage, clock);
  const layout = useVjRemoteLayout();
  const dockPads = useVjDockPads();
  const cue = useVjCueMode();
  const latestState = stage.latestState;
  const stateRevision = latestState?.revision ?? null;
  const flashConsent = useVjFlashConsent(latestState?.stageEpoch ?? null);
  const sheets = useVjRemoteSheets();
  const view = useVjRemoteView();
  const library = useVjRemoteLibrary(stage, {
    searchQuery: view.isSearchOpen ? view.searchQuery : "",
    isFavoritesOnly: view.isFavoritesOnly,
  });
  const status = useVjStatusErrorKey(
    { key: lastErrorKey, values: lastErrorValues },
    stateRevision,
  );
  const statusLineId = useId();
  // One shared cache with the strips: a set list step reads the look it recalls.
  const scenesQuery = useVjScenes();
  const setlistsQuery = useVjSetlists();
  const actions = useVjRemoteActions({
    stage,
    clock,
    run,
    visibleClips: library.visibleClips,
    dockPads: dockPads.pads,
    cue,
    flashConsent,
    isBlocked,
    onRefused: status.onRefused,
    onOpenSheet: sheets.open,
    scenes: scenesQuery.data,
    setlists: setlistsQuery.data,
  });
  useVjRemoteKeyboard({ isEnabled: true, dispatch: actions.dispatch });
  const learn = useVjMidiLearn();
  const midi = useVjMidi({
    mappings: midiMappings.mappings,
    dispatch: actions.dispatch,
    isLearning: learn.state.kind !== "idle",
    onLearnEvent: learn.handleMidi,
  });
  const [dockHeight, setDockHeight] = useState(0);

  const session: VjRemoteSession = {
    stage,
    latestState,
    stateRevision,
    run,
    clock,
    frames,
    layout,
    library,
    actions,
    cue,
    dockPads,
    flashConsent,
    sheets,
    view,
    midi,
    midiMappings,
    onStartLearn: learn.start,
    isBlocked,
    blockedReasonId: isBlocked ? statusLineId : undefined,
    statusLineId,
    offlineReason,
    errorKey: status.errorKey,
    errorValues: status.errorValues,
    onRefused: status.onRefused,
  };

  return (
    <VjRemoteShell
      session={session}
      dockHeight={dockHeight}
      dock={<VjRemoteDock session={session} onHeightChange={setDockHeight} />}
    >
      <VjRemoteSheetsHost session={session} />
      <VjRemoteFlashConsent session={session} />
    </VjRemoteShell>
  );
}

/**
 * The VJ remote at /admin/vj/remote, an instrument in the dark Pulse Live
 * look: on a phone the top row, the mirror band, the strips and nine clip
 * tiles sit above the dock; from 900px wide (or landscape over 700px) the
 * dock becomes a right column with the crossfader always in reach. Touch,
 * keys and a MIDI controller all play through one dispatcher.
 */
export function AdminVjRemotePage(): JSX.Element {
  useQuizshowFramelessPage();
  const midiMappings = useVjMidiMappings();
  return (
    <VjMidiLearnProvider onMapped={midiMappings.save}>
      <VjRemotePage midiMappings={midiMappings} />
    </VjMidiLearnProvider>
  );
}
