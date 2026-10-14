import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioUploadLoudnessNote } from "./StudioUploadLoudnessNote";

describe("StudioUploadLoudnessNote", () => {
  it("lists each loud or peaking track and explains on request", async () => {
    render(
      <TestProviders>
        <StudioUploadLoudnessNote
          notes={[
            { trackNumber: 4, kind: "loud", loudnessLufs: -7.8, peakDb: -0.1 },
            { trackNumber: 6, kind: "peak", loudnessLufs: -12, peakDb: 0.4 },
          ]}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/Track 4 measures \u22127\.8 LUFS/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Track 6 peaks at 0\.4 dB/)).toBeInTheDocument();
    const toggle = screen.getByRole("button", {
      name: "How Studio evens out loudness",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    // Task 0 writes the target with a true minus sign (U+2212).
    expect(await screen.findByText(/−14 LUFS/)).toBeInTheDocument();
  });

  it("shows nothing when every track sits in range", () => {
    const { container } = render(
      <TestProviders>
        <StudioUploadLoudnessNote notes={[]} />
      </TestProviders>,
    );
    expect(container.querySelector("[role='note']")).toBeNull();
  });
});
