/**
 * Web MIDI for the remote. Access is asked for only from a user gesture
 * (`request`, the "Turn on MIDI" button); Web MIDI is Chromium only, so iOS and
 * Safari read `"unsupported"` and the MIDI sheet shows the named reason.
 *
 * Every connected input gets a `midimessage` listener. While learning, parsed
 * messages go to `onLearnEvent`; otherwise the mapping for the message's
 * control turns it into a `dispatch` call. Each input keeps the last CC value
 * per control, so a knob turning above 64 presses its target once. A held pad
 * releases when its note off arrives (even when its mapping went away
 * mid-hold), when its device disconnects, when the page hides, when learning
 * starts and on unmount, so a pad never sticks on.
 * Nothing here logs MIDI data.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VjActionDispatch, VjRemoteAction } from "../input/vjRemoteAction";
import {
  vjMidiFailureOf,
  vjMidiSupportOf,
  type VjMidiAvailability,
} from "./vjMidiAvailability";
import { vjMidiActionOf, type VjMidiMapping } from "./vjMidiMappings";
import {
  parseVjMidiMessage,
  vjMidiControlKeyOf,
  type VjMidiEvent,
} from "./vjMidiMessage";

export interface VjMidiInputSummary {
  id: string;
  name: string;
}

export interface UseVjMidiOptions {
  mappings: readonly VjMidiMapping[];
  dispatch: VjActionDispatch;
  onLearnEvent: (event: VjMidiEvent) => void;
  isLearning: boolean;
}

export interface UseVjMidiResult {
  availability: VjMidiAvailability;
  inputs: readonly VjMidiInputSummary[];
  /** Runs from a user gesture (the "Turn on MIDI" button). */
  request: () => void;
}

/** One bound input: its listener, the last CC value per control and the pads it holds. */
interface VjMidiInputBinding {
  input: MIDIInput;
  onMessage: (event: MIDIMessageEvent) => void;
  lastCcValues: Map<string, number>;
  heldPads: Map<string, VjRemoteAction>;
}

/** The refs a message handler reads, so listeners never re-bind on a render. */
interface VjMidiRouting {
  mappingsByControlKey: Map<string, VjMidiMapping>;
  dispatch: VjActionDispatch;
  onLearnEvent: (event: VjMidiEvent) => void;
  isLearning: boolean;
}

const NO_INPUTS: readonly VjMidiInputSummary[] = [];

function initialVjMidiAvailability(): VjMidiAvailability {
  if (typeof navigator === "undefined") return "unsupported";
  return vjMidiSupportOf(navigator) === "supported" ? "idle" : "unsupported";
}

function connectedVjMidiInputsOf(access: MIDIAccess): MIDIInput[] {
  return [...access.inputs.values()].filter(
    (input) => input.state !== "disconnected",
  );
}

function summaryOfVjMidiInput(input: MIDIInput): VjMidiInputSummary {
  const name = input.name?.trim() || input.manufacturer?.trim() || input.id;
  return { id: input.id, name };
}

function availabilityOfVjMidiInputs(
  inputs: readonly MIDIInput[],
): VjMidiAvailability {
  return inputs.length > 0 ? "ready" : "noDevices";
}

function releaseVjMidiHeldPads(
  binding: VjMidiInputBinding,
  dispatch: VjActionDispatch,
): void {
  const heldActions = [...binding.heldPads.values()];
  binding.heldPads.clear();
  for (const action of heldActions) dispatch(action, "release");
}

/**
 * Whether this message lets go of the pad its control holds. It is read
 * against the held pad itself, so a mapping removed or changed mid-hold still
 * gets its note off or its knob dropping under 64.
 */
function isVjMidiHeldPadRelease(
  heldAction: VjRemoteAction,
  controlKey: string,
  event: VjMidiEvent,
  previousValue: number | null,
): boolean {
  if (heldAction.kind !== "pad") return false;
  const heldMapping: VjMidiMapping = {
    controlKey,
    target: { kind: "pad", padId: heldAction.padId },
  };
  return vjMidiActionOf(heldMapping, event, previousValue)?.phase === "release";
}

/** Routes one message from one input: learn, a held pad's release, a mapped action, or nothing. */
function routeVjMidiMessage(
  binding: VjMidiInputBinding,
  data: ArrayLike<number>,
  routing: VjMidiRouting,
): void {
  const event = parseVjMidiMessage(data);
  const controlKey = vjMidiControlKeyOf(event);
  if (controlKey === null) return;
  const previousValue = binding.lastCcValues.get(controlKey) ?? null;
  if (event.kind === "cc") binding.lastCcValues.set(controlKey, event.value);
  if (routing.isLearning) {
    routing.onLearnEvent(event);
    return;
  }
  const heldAction = binding.heldPads.get(controlKey);
  if (
    heldAction !== undefined &&
    isVjMidiHeldPadRelease(heldAction, controlKey, event, previousValue)
  ) {
    binding.heldPads.delete(controlKey);
    routing.dispatch(heldAction, "release");
    return;
  }
  const mapping = routing.mappingsByControlKey.get(controlKey);
  if (!mapping) return;
  const result = vjMidiActionOf(mapping, event, previousValue);
  if (!result) return;
  if (result.action.kind === "pad") {
    if (result.phase === "press") {
      binding.heldPads.set(controlKey, result.action);
    } else if (result.phase === "release") {
      // A pad already let go (page hidden, learn started) releases once only.
      if (!binding.heldPads.delete(controlKey)) return;
    }
  }
  routing.dispatch(result.action, result.phase);
}

function bindVjMidiInput(
  input: MIDIInput,
  routingRef: { readonly current: VjMidiRouting },
): VjMidiInputBinding {
  const binding: VjMidiInputBinding = {
    input,
    onMessage: (event) => {
      if (event.data)
        routeVjMidiMessage(binding, event.data, routingRef.current);
    },
    lastCcValues: new Map(),
    heldPads: new Map(),
  };
  input.addEventListener("midimessage", binding.onMessage);
  return binding;
}

function unbindVjMidiInput(
  binding: VjMidiInputBinding,
  dispatch: VjActionDispatch,
): void {
  binding.input.removeEventListener("midimessage", binding.onMessage);
  releaseVjMidiHeldPads(binding, dispatch);
}

/** Binds the connected inputs and drops the gone ones; answers the connected list. */
function syncVjMidiBindings(
  access: MIDIAccess,
  bindings: Map<string, VjMidiInputBinding>,
  routingRef: { readonly current: VjMidiRouting },
): MIDIInput[] {
  const connectedInputs = connectedVjMidiInputsOf(access);
  const connectedIds = new Set(connectedInputs.map((input) => input.id));
  for (const [inputId, binding] of [...bindings]) {
    if (connectedIds.has(inputId)) continue;
    unbindVjMidiInput(binding, routingRef.current.dispatch);
    bindings.delete(inputId);
  }
  for (const input of connectedInputs) {
    if (!bindings.has(input.id)) {
      bindings.set(input.id, bindVjMidiInput(input, routingRef));
    }
  }
  return connectedInputs;
}

export function useVjMidi(options: UseVjMidiOptions): UseVjMidiResult {
  const { mappings, dispatch, onLearnEvent, isLearning } = options;
  const [availability, setAvailability] = useState<VjMidiAvailability>(
    initialVjMidiAvailability,
  );
  const [inputs, setInputs] =
    useState<readonly VjMidiInputSummary[]>(NO_INPUTS);
  const [access, setAccess] = useState<MIDIAccess | null>(null);

  const mappingsByControlKey = useMemo(
    () => new Map(mappings.map((mapping) => [mapping.controlKey, mapping])),
    [mappings],
  );
  const routingRef = useRef<VjMidiRouting>({
    mappingsByControlKey,
    dispatch,
    onLearnEvent,
    isLearning,
  });
  useEffect(() => {
    routingRef.current = {
      mappingsByControlKey,
      dispatch,
      onLearnEvent,
      isLearning,
    };
  });

  const bindingsRef = useRef(new Map<string, VjMidiInputBinding>());
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Bind every connected input; a plug or unplug re-binds and refreshes the list.
  useEffect(() => {
    if (!access) return;
    const bindings = bindingsRef.current;
    syncVjMidiBindings(access, bindings, routingRef);
    const onStateChange = () => {
      const connectedInputs = syncVjMidiBindings(access, bindings, routingRef);
      setInputs(connectedInputs.map(summaryOfVjMidiInput));
      setAvailability(availabilityOfVjMidiInputs(connectedInputs));
    };
    access.addEventListener("statechange", onStateChange);
    return () => {
      access.removeEventListener("statechange", onStateChange);
      for (const binding of bindings.values()) {
        unbindVjMidiInput(binding, routingRef.current.dispatch);
      }
      bindings.clear();
    };
  }, [access]);

  // Learn takes every message from here on, so no note off would reach a held pad.
  useEffect(() => {
    if (!isLearning) return;
    for (const binding of bindingsRef.current.values()) {
      releaseVjMidiHeldPads(binding, routingRef.current.dispatch);
    }
  }, [isLearning]);

  // A hidden page misses the note off: let every held pad go.
  useEffect(() => {
    const releaseEveryHeldPad = () => {
      for (const binding of bindingsRef.current.values()) {
        releaseVjMidiHeldPads(binding, routingRef.current.dispatch);
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") releaseEveryHeldPad();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", releaseEveryHeldPad);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", releaseEveryHeldPad);
    };
  }, []);

  const isRequestable =
    availability === "idle" ||
    availability === "denied" ||
    availability === "failed";

  const request = useCallback(() => {
    if (!isRequestable) return;
    setAvailability("requesting");
    let accessRequest: Promise<MIDIAccess>;
    try {
      accessRequest = navigator.requestMIDIAccess({ sysex: false });
    } catch (cause) {
      setAvailability(vjMidiFailureOf(cause));
      return;
    }
    void accessRequest.then(
      (midiAccess) => {
        if (!isMountedRef.current) return;
        const connectedInputs = connectedVjMidiInputsOf(midiAccess);
        setInputs(connectedInputs.map(summaryOfVjMidiInput));
        setAvailability(availabilityOfVjMidiInputs(connectedInputs));
        setAccess(midiAccess);
      },
      (cause: unknown) => {
        if (isMountedRef.current) setAvailability(vjMidiFailureOf(cause));
      },
    );
  }, [isRequestable]);

  return { availability, inputs, request };
}
