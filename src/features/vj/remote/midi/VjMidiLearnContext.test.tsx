import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  VjMidiLearnProvider,
  useVjMidiLearn,
  type VjMidiLearnValue,
} from "./VjMidiLearnContext";
import { useVjMidiLearnTarget } from "./useVjMidiLearnTarget";
import type { VjMidiMapping } from "./vjMidiMappings";

function CrossfaderButton(props: { onPress: () => void }) {
  const { learnProps } = useVjMidiLearnTarget({ kind: "crossfader" });
  return (
    <button type="button" onClick={props.onPress} {...learnProps}>
      Crossfader
    </button>
  );
}

function LearnProbe(props: { onValue: (value: VjMidiLearnValue) => void }) {
  props.onValue(useVjMidiLearn());
  return null;
}

function renderLearn() {
  const onMapped = vi.fn<(mapping: VjMidiMapping) => void>();
  const onPress = vi.fn();
  const latest: { current: VjMidiLearnValue | null } = { current: null };
  render(
    <VjMidiLearnProvider onMapped={onMapped}>
      <CrossfaderButton onPress={onPress} />
      <LearnProbe
        onValue={(value) => {
          latest.current = value;
        }}
      />
    </VjMidiLearnProvider>,
  );
  const learn = () => {
    if (!latest.current) throw new Error("learn value missing");
    return latest.current;
  };
  return { onMapped, onPress, learn };
}

describe("VjMidiLearnContext", () => {
  it("a pick-mode click picks the target and stops the click", () => {
    const { onPress, learn } = renderLearn();
    const button = screen.getByRole("button", { name: "Crossfader" });
    expect(button).not.toHaveAttribute("data-vj-midi-pickable");
    act(() => learn().start());
    expect(button).toHaveAttribute("data-vj-midi-pickable", "");
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(learn().state).toEqual({
      kind: "waitControl",
      target: { kind: "crossfader" },
    });
  });

  it("a CC after the pick saves the mapping and calls onMapped", () => {
    const { onMapped, learn } = renderLearn();
    act(() => learn().start());
    fireEvent.click(screen.getByRole("button", { name: "Crossfader" }));
    act(() =>
      learn().handleMidi({
        kind: "noteOn",
        channel: 1,
        note: 40,
        velocity: 90,
      }),
    );
    expect(onMapped).not.toHaveBeenCalled();
    expect(learn().state.kind).toBe("needsContinuous");
    act(() =>
      learn().handleMidi({ kind: "cc", channel: 2, controller: 7, value: 30 }),
    );
    const mapping = { controlKey: "cc:2:7", target: { kind: "crossfader" } };
    expect(onMapped).toHaveBeenCalledTimes(1);
    expect(onMapped).toHaveBeenCalledWith(mapping);
    expect(learn().lastMapping).toEqual(mapping);
    expect(learn().state).toEqual({ kind: "idle" });
  });

  it("cancel leaves pick mode", () => {
    const { onPress, learn } = renderLearn();
    act(() => learn().start());
    act(() => learn().cancel());
    expect(learn().state).toEqual({ kind: "idle" });
    const button = screen.getByRole("button", { name: "Crossfader" });
    expect(button).not.toHaveAttribute("data-vj-midi-pickable");
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
