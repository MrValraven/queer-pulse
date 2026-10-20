import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioClaimStatusChip } from "./StudioClaimStatusChip";
import { StudioContentWarningPicker } from "./StudioContentWarningPicker";
import { StudioTrackReportDialog } from "./StudioTrackReportDialog";
import { StudioTrackSafetyFields } from "./StudioTrackSafetyFields";
import { StudioTrackWarningPill } from "./StudioTrackWarningPill";

const wrap = (ui: React.ReactElement) =>
  render(<TestProviders>{ui}</TestProviders>);

describe("StudioTrackWarningPill", () => {
  it("names the themes and renders nothing without warnings", () => {
    const { container, rerender } = wrap(
      <StudioTrackWarningPill warnings={["self-harm"]} />,
    );
    expect(container.textContent).toMatch(/self-harm/i);
    rerender(
      <TestProviders>
        <StudioTrackWarningPill warnings={[]} />
      </TestProviders>,
    );
    expect(container.textContent).toBe("");
  });
});

describe("StudioContentWarningPicker", () => {
  it("returns the pick in D7 order and leaves our team's warnings out of the chips", () => {
    const onChange = vi.fn();
    wrap(
      <StudioContentWarningPicker
        selected={["police"]}
        lockedWarnings={["violence"]}
        onChange={onChange}
      />,
    );
    const pressable = screen.getAllByRole("button");
    expect(pressable).toHaveLength(7);
    fireEvent.click(screen.getByRole("button", { name: /medical/i }));
    expect(onChange).toHaveBeenCalledWith(["medical", "police"]);
    expect(screen.getByText(/added by our team/i)).toBeTruthy();
  });
});

describe("StudioTrackSafetyFields", () => {
  it("keeps a locked explicit box checked and disabled with our team's line", () => {
    wrap(
      <StudioTrackSafetyFields
        explicitLabel="Explicit"
        isExplicit={false}
        isExplicitLocked
        onExplicitChange={() => {}}
        contentWarnings={[]}
        staffContentWarnings={[]}
        onContentWarningsChange={() => {}}
      />,
    );
    const box = screen.getByRole("checkbox", { name: "Explicit" });
    expect((box as HTMLInputElement).checked).toBe(true);
    expect((box as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText(/marked explicit by our team/i)).toBeTruthy();
  });
});

describe("StudioClaimStatusChip", () => {
  it("labels a countered claim", () => {
    wrap(<StudioClaimStatusChip status="countered" />);
    expect(screen.getByText(/counter-notice sent/i)).toBeTruthy();
  });
});

describe("StudioTrackReportDialog", () => {
  it("opens the shared report modal about the track", () => {
    wrap(
      <StudioTrackReportDialog
        isOpen
        trackId="track-1"
        trackTitle="Vela acesa"
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByDisplayValue("hateful_lyrics")).toBeTruthy();
  });
});
