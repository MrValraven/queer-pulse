/**
 * MIDI learn for the whole remote: the MIDI sheet starts it, a tile, pad or
 * control picks the target (`useVjMidiLearnTarget`), and the next note or CC
 * from the controller (`handleMidi`, fed by `useVjMidi` while learning) saves
 * the mapping through `onMapped`. Without a provider the value reads idle and
 * every action does nothing, so a control can wire the target hook freely.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  vjMidiLearnReduce,
  type VjMidiLearnEvent,
  type VjMidiLearnState,
} from "./vjMidiLearn";
import type { VjMidiMapping, VjMidiTarget } from "./vjMidiMappings";
import type { VjMidiEvent } from "./vjMidiMessage";

export interface VjMidiLearnValue {
  state: VjMidiLearnState;
  start: () => void;
  cancel: () => void;
  pickTarget: (target: VjMidiTarget) => void;
  handleMidi: (event: VjMidiEvent) => void;
  /** The mapping learned last, for the "Mapped to" line; clears on the next start. */
  lastMapping: VjMidiMapping | null;
}

export interface VjMidiLearnProviderProps {
  onMapped: (mapping: VjMidiMapping) => void;
  children: ReactNode;
}

const IDLE_STATE: VjMidiLearnState = { kind: "idle" };

function doNothing(): void {}

const IDLE_LEARN_VALUE: VjMidiLearnValue = {
  state: IDLE_STATE,
  start: doNothing,
  cancel: doNothing,
  pickTarget: doNothing,
  handleMidi: doNothing,
  lastMapping: null,
};

const VjMidiLearnContext = createContext<VjMidiLearnValue>(IDLE_LEARN_VALUE);

export function VjMidiLearnProvider(props: VjMidiLearnProviderProps) {
  const { onMapped, children } = props;
  const [state, setState] = useState<VjMidiLearnState>(IDLE_STATE);
  const [lastMapping, setLastMapping] = useState<VjMidiMapping | null>(null);
  /** The current state for steps that land between renders (MIDI messages). */
  const stateRef = useRef<VjMidiLearnState>(IDLE_STATE);
  const onMappedRef = useRef(onMapped);
  useEffect(() => {
    onMappedRef.current = onMapped;
  });

  const step = useCallback((event: VjMidiLearnEvent) => {
    const next = vjMidiLearnReduce(stateRef.current, event);
    stateRef.current = next.state;
    setState(next.state);
    if (event.kind === "start") setLastMapping(null);
    if (next.mapping) {
      setLastMapping(next.mapping);
      onMappedRef.current(next.mapping);
    }
  }, []);

  const start = useCallback(() => step({ kind: "start" }), [step]);
  const cancel = useCallback(() => step({ kind: "cancel" }), [step]);
  const pickTarget = useCallback(
    (target: VjMidiTarget) => step({ kind: "targetPicked", target }),
    [step],
  );
  const handleMidi = useCallback(
    (event: VjMidiEvent) => step({ kind: "midi", event }),
    [step],
  );

  const value = useMemo<VjMidiLearnValue>(
    () => ({ state, start, cancel, pickTarget, handleMidi, lastMapping }),
    [state, start, cancel, pickTarget, handleMidi, lastMapping],
  );

  return (
    <VjMidiLearnContext.Provider value={value}>
      {children}
    </VjMidiLearnContext.Provider>
  );
}

export function useVjMidiLearn(): VjMidiLearnValue {
  return useContext(VjMidiLearnContext);
}
