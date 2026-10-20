import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioUploadRowProgress } from "./StudioUploadRowProgress";
import type { UploadRow } from "./useStudioTrackUploads";

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const LABEL = { title: "Tide", position: 1 };
const rowWith = (patch: Partial<UploadRow>): UploadRow => ({
  localId: "a",
  trackId: null,
  title: "Tide",
  fileName: "Tide.wav",
  stage: "converting",
  progress: 40,
  errorKey: null,
  durationLabel: null,
  isRetryable: true,
  ...patch,
});

describe("StudioUploadRowProgress", () => {
  it("shows the bar and the tab hint while converting", () => {
    render(<StudioUploadRowProgress row={rowWith({})} label={LABEL} />);
    expect(
      screen.getByRole("progressbar", {
        name: "studio:uploadFlow.files.convertProgressLabel",
      }),
    ).toHaveAttribute("value", "40");
    expect(
      screen.getByText("studio:uploadFlow.files.convertingHint"),
    ).toBeInTheDocument();
  });

  it("keeps a converted file's full bar while its track is made", () => {
    render(
      <StudioUploadRowProgress
        row={rowWith({ stage: "creating", progress: 100 })}
        label={LABEL}
      />,
    );
    expect(
      screen.getByRole("progressbar", {
        name: "studio:uploadFlow.files.progressLabel",
      }),
    ).toHaveAttribute("value", "100");
    expect(
      screen.queryByText("studio:uploadFlow.files.convertingHint"),
    ).not.toBeInTheDocument();
  });

  it("shows no bar for a file waiting its turn", () => {
    render(
      <StudioUploadRowProgress
        row={rowWith({ stage: "queued", progress: 0 })}
        label={LABEL}
      />,
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
