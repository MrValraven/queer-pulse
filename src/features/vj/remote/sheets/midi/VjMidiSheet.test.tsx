import { fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { UseVjMidiResult } from "../../midi/useVjMidi";
import type { UseVjMidiMappingsResult } from "../../midi/useVjMidiMappings";
import type { VjMidiAvailability } from "../../midi/vjMidiAvailability";
import type { VjMidiMapping } from "../../midi/vjMidiMappings";
import { VjMidiSheet } from "./VjMidiSheet";

const CLIP_MAPPING: VjMidiMapping = {
  controlKey: "note:1:36",
  target: { kind: "clipSlot", index: 0 },
};
const CROSSFADER_MAPPING: VjMidiMapping = {
  controlKey: "cc:2:7",
  target: { kind: "crossfader" },
};

function createMidi(availability: VjMidiAvailability): UseVjMidiResult {
  return {
    availability,
    inputs:
      availability === "ready"
        ? [{ id: "input-1", name: "Pad Controller" }]
        : [],
    request: vi.fn(),
  };
}

function createMappings(
  mappings: VjMidiMapping[] = [],
): UseVjMidiMappingsResult {
  return { mappings, save: vi.fn(), remove: vi.fn(), removeAll: vi.fn() };
}

async function renderMidiSheet({
  midi,
  mappings = createMappings(),
  onStartLearn = vi.fn(),
  onClose = vi.fn(),
}: {
  midi: UseVjMidiResult;
  mappings?: UseVjMidiMappingsResult;
  onStartLearn?: () => void;
  onClose?: () => void;
}) {
  const renderedView = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjMidiSheet
          midi={midi}
          mappings={mappings}
          onStartLearn={onStartLearn}
          onClose={onClose}
        />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return renderedView;
}

describe("VjMidiSheet", () => {
  it("explains that this browser has no Web MIDI", async () => {
    await renderMidiSheet({ midi: createMidi("unsupported") });
    expect(
      within(screen.getByRole("dialog")).getByRole("status"),
    ).toHaveTextContent("This browser has no Web MIDI");
    expect(
      screen.queryByRole("button", { name: "Turn on MIDI" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Map a control" }),
    ).not.toBeInTheDocument();
  });

  it("Turn on MIDI requests access", async () => {
    const midi = createMidi("idle");
    await renderMidiSheet({ midi });
    fireEvent.click(screen.getByRole("button", { name: "Turn on MIDI" }));
    expect(midi.request).toHaveBeenCalledTimes(1);
  });

  it("asks once while the browser is still deciding", async () => {
    const midi = createMidi("requesting");
    await renderMidiSheet({ midi });
    const turnOn = screen.getByRole("button", { name: "Turn on MIDI" });
    expect(turnOn).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(turnOn);
    expect(midi.request).not.toHaveBeenCalled();
    expect(
      within(screen.getByRole("dialog")).getByRole("status"),
    ).toHaveTextContent("Waiting for the browser to allow MIDI");
  });

  it("names a denied permission", async () => {
    await renderMidiSheet({ midi: createMidi("denied") });
    expect(
      within(screen.getByRole("dialog")).getByRole("alert"),
    ).toHaveTextContent("The browser blocked MIDI for this site");
    expect(
      screen.getByRole("button", { name: "Turn on MIDI" }),
    ).toBeInTheDocument();
  });

  it("lists mappings with their labels", async () => {
    await renderMidiSheet({
      midi: createMidi("ready"),
      mappings: createMappings([CLIP_MAPPING, CROSSFADER_MAPPING]),
    });
    expect(screen.getByText("Pad Controller")).toBeInTheDocument();
    expect(screen.getByText("Clip 1")).toBeInTheDocument();
    expect(screen.getByText("Note 36, channel 1")).toBeInTheDocument();
    expect(screen.getByText("Crossfader")).toBeInTheDocument();
    expect(screen.getByText("Knob 7, channel 2")).toBeInTheDocument();
    expect(
      screen.getByText("Mappings are saved on this device"),
    ).toBeInTheDocument();
  });

  it("Remove mapping removes one", async () => {
    const mappings = createMappings([CLIP_MAPPING, CROSSFADER_MAPPING]);
    await renderMidiSheet({ midi: createMidi("ready"), mappings });
    fireEvent.click(
      screen.getByRole("button", { name: "Remove mapping for Clip 1" }),
    );
    expect(mappings.remove).toHaveBeenCalledWith("note:1:36");
    expect(mappings.remove).toHaveBeenCalledTimes(1);
    expect(mappings.removeAll).not.toHaveBeenCalled();
  });

  it("Remove all mappings asks first", async () => {
    const mappings = createMappings([CLIP_MAPPING]);
    await renderMidiSheet({ midi: createMidi("ready"), mappings });
    fireEvent.click(
      screen.getByRole("button", { name: "Remove all mappings" }),
    );
    expect(mappings.removeAll).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", {
      name: "Remove every mapping on this device?",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove all mappings" }),
    );
    expect(mappings.removeAll).toHaveBeenCalledTimes(1);
  });

  it("Map a control starts learn and closes", async () => {
    const onStartLearn = vi.fn();
    const onClose = vi.fn();
    await renderMidiSheet({ midi: createMidi("ready"), onStartLearn, onClose });
    fireEvent.click(screen.getByRole("button", { name: "Map a control" }));
    expect(onStartLearn).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("names a pad target by its effect", async () => {
    const mappings = createMappings([
      { controlKey: "note:10:40", target: { kind: "pad", padId: "invert" } },
      { controlKey: "cc:1:20", target: { kind: "pad", padId: "strobe" } },
    ]);
    await renderMidiSheet({ midi: createMidi("ready"), mappings });
    expect(screen.getByText("Pad: Invert")).toBeInTheDocument();
    expect(screen.getByText("Pad: Strobe")).toBeInTheDocument();
    expect(screen.getByText("Note 40, channel 10")).toBeInTheDocument();
  });
});
