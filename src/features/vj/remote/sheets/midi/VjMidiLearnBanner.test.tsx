import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import {
  VjMidiLearnProvider,
  useVjMidiLearn,
  type VjMidiLearnValue,
} from "../../midi/VjMidiLearnContext";
import { useVjMidiLearnTarget } from "../../midi/useVjMidiLearnTarget";
import type { VjMidiMapping } from "../../midi/vjMidiMappings";
import { VJ_MIDI_LEARN_DONE_MS, VjMidiLearnBanner } from "./VjMidiLearnBanner";

/** A Go button wired like the dock's: pickable while learn runs. */
function GoButton() {
  const { learnProps } = useVjMidiLearnTarget({ kind: "go" });
  return (
    <button type="button" {...learnProps}>
      Go
    </button>
  );
}

/** Hands the test the live learn value, so it can start learn and feed MIDI. */
function LearnProbe({
  onValue,
}: {
  onValue: (value: VjMidiLearnValue) => void;
}) {
  onValue(useVjMidiLearn());
  return null;
}

function renderBanner(onMapped: (mapping: VjMidiMapping) => void = vi.fn()) {
  let learn: VjMidiLearnValue | null = null;
  render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjMidiLearnProvider onMapped={onMapped}>
          <LearnProbe
            onValue={(value) => {
              learn = value;
            }}
          />
          <VjMidiLearnBanner />
          <GoButton />
        </VjMidiLearnProvider>
      </LazyMotion>
    </TestProviders>,
  );
  return {
    current(): VjMidiLearnValue {
      if (learn === null) throw new Error("learn value missing");
      return learn;
    },
  };
}

describe("VjMidiLearnBanner", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("asks for a target, then a control, then confirms", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const onMapped = vi.fn();
    const learn = renderBanner(onMapped);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");

    act(() => learn.current().start());
    expect(status).toHaveTextContent("Tap a clip, pad or control to map");
    expect(
      screen.getByRole("button", { name: "Cancel mapping" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(status).toHaveTextContent(
      "Now press a key or move a knob on your controller",
    );

    act(() =>
      learn
        .current()
        .handleMidi({ kind: "noteOn", channel: 1, note: 36, velocity: 100 }),
    );
    expect(onMapped).toHaveBeenCalledWith({
      controlKey: "note:1:36",
      target: { kind: "go" },
    });
    expect(status).toHaveTextContent("Mapped to Go");

    act(() => {
      vi.advanceTimersByTime(VJ_MIDI_LEARN_DONE_MS);
    });
    expect(status).not.toHaveTextContent("Mapped to Go");
  });

  it("asks for a knob when a fader target hears a key", () => {
    const learn = renderBanner();
    const status = screen.getByRole("status");
    act(() => learn.current().start());
    act(() => learn.current().pickTarget({ kind: "crossfader" }));
    act(() =>
      learn
        .current()
        .handleMidi({ kind: "noteOn", channel: 1, note: 36, velocity: 100 }),
    );
    expect(status).toHaveTextContent("This control needs a knob or fader");
  });

  it("Cancel mapping ends learn", () => {
    const onMapped = vi.fn();
    const learn = renderBanner(onMapped);
    act(() => learn.current().start());
    const goButton = screen.getByRole("button", { name: "Go" });
    expect(goButton).toHaveAttribute("data-vj-midi-pickable");

    fireEvent.click(screen.getByRole("button", { name: "Cancel mapping" }));
    expect(learn.current().state.kind).toBe("idle");
    expect(screen.getByRole("status").textContent).toBe("");
    expect(goButton).not.toHaveAttribute("data-vj-midi-pickable");
    expect(onMapped).not.toHaveBeenCalled();
  });
});
