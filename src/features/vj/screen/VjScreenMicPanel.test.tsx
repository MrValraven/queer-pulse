import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import type { VjTempoSource } from "../../../shared/contracts/vj";
import type { VjMicTempoState } from "./useVjMicTempo";
import { VjScreenMicPanel } from "./VjScreenMicPanel";

vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    t: (key: string, options?: Record<string, unknown>) =>
      options === undefined
        ? key
        : `${key} ${Object.values(options).map(String).join(" ")}`,
  }),
}));

function micState(patch: Partial<VjMicTempoState> = {}): VjMicTempoState {
  return {
    status: "off",
    failure: null,
    level: 0,
    levelRef: { current: null },
    report: null,
    start: vi.fn(),
    stop: vi.fn(),
    ...patch,
  };
}

const LISTENING: Partial<VjMicTempoState> = {
  status: "listening",
  level: 0.42,
  levelRef: { current: 0.42 },
  report: { level: 0.42, bpm: null, confidence: 0.3, beatAt: null },
};

function Wrapper({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>;
}

function renderPanel(
  mic: VjMicTempoState,
  options: { isLead?: boolean; tempoSource?: VjTempoSource | null } = {},
) {
  return render(
    <VjScreenMicPanel
      mic={mic}
      isLead={options.isLead ?? true}
      tempoSource={
        options.tempoSource === undefined ? "manual" : options.tempoSource
      }
    />,
    { wrapper: Wrapper },
  );
}

describe("VjScreenMicPanel", () => {
  it("names the button by its action and marks it pressed while listening", () => {
    const offMic = micState();
    const view = renderPanel(offMic);
    const startButton = screen.getByRole("button", {
      name: "vj:screen.mic.start",
    });
    expect(startButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(startButton);
    expect(offMic.start).toHaveBeenCalledTimes(1);

    const listeningMic = micState(LISTENING);
    view.rerender(
      <VjScreenMicPanel mic={listeningMic} isLead tempoSource="mic" />,
    );
    const stopButton = screen.getByRole("button", {
      name: "vj:screen.mic.stop",
    });
    expect(stopButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(stopButton);
    expect(listeningMic.stop).toHaveBeenCalledTimes(1);
  });

  it("shows the level as a meter", () => {
    renderPanel(micState(LISTENING), { tempoSource: "mic" });
    const meter = screen.getByRole("meter", { name: "vj:screen.mic.level" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("vj:screen.mic.searching")).toBeInTheDocument();
  });

  it("says it waits for the microphone while the mic starts", () => {
    const view = renderPanel(micState());
    expect(
      screen.queryByText("vj:screen.mic.starting"),
    ).not.toBeInTheDocument();
    view.unmount();
    renderPanel(micState({ status: "starting" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "vj:screen.mic.starting",
    );
    expect(
      screen.getByRole("button", { name: "vj:screen.mic.stop" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("names the tempo and how sure it is once the beat is steady", () => {
    renderPanel(
      micState({
        ...LISTENING,
        report: { level: 0.42, bpm: 124.5, confidence: 0.81, beatAt: 1 },
      }),
      { tempoSource: "mic" },
    );
    expect(
      screen.getByText("vj:screen.mic.listening 124.5 81"),
    ).toBeInTheDocument();
  });

  it("folds the failure reason open with role alert", () => {
    const view = renderPanel(micState());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    view.rerender(
      <VjScreenMicPanel
        mic={micState({ status: "failed", failure: "denied" })}
        isLead
        tempoSource="manual"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "vj:screen.mic.failure.denied",
    );
    expect(
      screen.getByRole("button", { name: "vj:screen.mic.start" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("tells a follower screen that only the lead's microphone counts", () => {
    renderPanel(micState(), { isLead: false });
    expect(screen.getByText("vj:screen.mic.followerOnly")).toBeInTheDocument();
    expect(
      screen.queryByText("vj:screen.mic.pickOnRemote"),
    ).not.toBeInTheDocument();
  });

  it("tells the operator to pick Microphone on the remote when the tempo source is manual", () => {
    renderPanel(micState(LISTENING), { tempoSource: "manual" });
    expect(screen.getByText("vj:screen.mic.pickOnRemote")).toBeInTheDocument();
    expect(
      screen.queryByText("vj:screen.mic.followerOnly"),
    ).not.toBeInTheDocument();
  });

  it("drops the remote note once the remote follows the microphone", () => {
    renderPanel(micState(LISTENING), { tempoSource: "mic" });
    expect(
      screen.queryByText("vj:screen.mic.pickOnRemote"),
    ).not.toBeInTheDocument();
  });
});
