/**
 * The remote's sheets (plan R27): one at a time inside one AnimatePresence,
 * so each opens and closes through the shared Modal's motion and More hands
 * over to the sheet it lists. Nothing mounts before the first state lands.
 * Setup sheets read `stage.latestState` and send through `run` themselves;
 * the effects library goes through the dispatcher like the pads.
 */
import { useCallback, type JSX } from "react";
import { AnimatePresence } from "motion/react";
import type {
  VjEffectId,
  VjEffectSettingPatch,
  VjSpeed,
} from "../../../../shared/contracts/vj";
import { VjEffectsLibrarySheet } from "../sheets/effects/VjEffectsLibrarySheet";
import { VjEventCardSheet } from "../sheets/eventCard/VjEventCardSheet";
import { VjMidiSheet } from "../sheets/midi/VjMidiSheet";
import { VjMixSheet } from "../sheets/mix/VjMixSheet";
import { VjMoreSheet } from "../sheets/more/VjMoreSheet";
import { VjShortcutsSheet } from "../sheets/more/VjShortcutsSheet";
import { VjScenesSheet } from "../sheets/scenes/VjScenesSheet";
import { VjScreensSheet } from "../sheets/screens/VjScreensSheet";
import { VjShuffleSettingsSheet } from "../sheets/shuffle/VjShuffleSettingsSheet";
import { VjTextOnScreenSheet } from "../sheets/text/VjTextOnScreenSheet";
import type { VjRemoteSession } from "./VjRemoteShell";

export interface VjRemoteSheetsHostProps {
  session: VjRemoteSession;
}

export function VjRemoteSheetsHost({
  session,
}: VjRemoteSheetsHostProps): JSX.Element {
  const { latestState: state, sheets, run, isBlocked, library } = session;
  const { openSheet, open, close } = sheets;
  const { setCueMode } = session.cue;
  const activePackId = state?.activePackId ?? null;
  const shownSheet = state === null ? null : openSheet;
  const latestLiveClip =
    state?.liveClipId == null
      ? null
      : (library.clipsById.get(state.liveClipId) ?? null);

  const clearScreen = useCallback(() => {
    close();
    if (!isBlocked) void run("goClip", null);
  }, [close, isBlocked, run]);
  const setEffectSetting = useCallback(
    (effectId: VjEffectId, patch: VjEffectSettingPatch) => {
      const settings: Partial<Record<VjEffectId, VjEffectSettingPatch>> = {};
      settings[effectId] = patch;
      return run("setEffects", { settings });
    },
    [run],
  );
  const setSpeed = useCallback(
    (speed: VjSpeed) => run("setEffects", { speed }),
    [run],
  );

  return (
    <AnimatePresence mode="wait">
      {state !== null && shownSheet === "more" ? (
        <VjMoreSheet
          key="more"
          isCueMode={session.cue.isCueMode}
          isClearBlocked={isBlocked}
          onOpen={open}
          onSetCueMode={setCueMode}
          onClearScreen={clearScreen}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "text" ? (
        <VjTextOnScreenSheet
          key="text"
          overlay={state.overlay}
          countdown={state.countdown}
          logo={state.logo}
          serverNow={session.clock.serverNow}
          run={run}
          isBlocked={isBlocked}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "shuffle" ? (
        <VjShuffleSettingsSheet
          key="shuffle"
          shuffle={state.shuffle}
          tempo={state.tempo}
          packClips={library.packClips}
          activePackId={activePackId}
          leadNextClipId={library.leadNextClipId}
          run={run}
          isBlocked={isBlocked}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "mix" ? (
        <VjMixSheet
          key="mix"
          mix={state.mix}
          packClips={library.packClips}
          liveClipId={state.liveClipId}
          stateRevision={session.stateRevision}
          run={run}
          isBlocked={isBlocked}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "scenes" ? (
        <VjScenesSheet
          key="scenes"
          state={state}
          activePackId={activePackId}
          run={run}
          isBlocked={isBlocked}
          requestSceneFlashConsent={session.actions.requestSceneFlashConsent}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "screens" ? (
        <VjScreensSheet
          key="screens"
          screens={session.stage.screens}
          overrides={state.screenOverrides}
          packClips={library.packClips}
          run={run}
          isBlocked={isBlocked}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "eventCard" ? (
        <VjEventCardSheet
          key="eventCard"
          eventCard={state.eventCard}
          activePackId={activePackId}
          run={run}
          isBlocked={isBlocked}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "midi" ? (
        <VjMidiSheet
          key="midi"
          midi={session.midi}
          mappings={session.midiMappings}
          onStartLearn={session.onStartLearn}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "effects" ? (
        <VjEffectsLibrarySheet
          key="effects"
          effects={state.effects}
          stateRevision={session.stateRevision}
          dockPads={session.dockPads}
          liveMediaKind={latestLiveClip?.mediaKind ?? null}
          isBlocked={isBlocked}
          dispatch={session.actions.dispatch}
          padIsOn={session.actions.padIsOn}
          setEffectSetting={setEffectSetting}
          setSpeed={setSpeed}
          onClose={close}
        />
      ) : null}
      {state !== null && shownSheet === "shortcuts" ? (
        <VjShortcutsSheet key="shortcuts" onClose={close} />
      ) : null}
    </AnimatePresence>
  );
}
