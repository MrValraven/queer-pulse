import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioCountView } from "./api/studio.adapters";
import { StudioNextReleaseCountdown } from "./StudioNextReleaseCountdown";
import { studioReleasePath } from "./studioPaths";

const now = new Date("2026-10-26T12:00:00.000Z");
const at = (hoursAhead: number) =>
  new Date(now.getTime() + hoursAhead * 3_600_000);

function renderCountdown({
  publishAt,
  reminders = { value: 12, isBelowThreshold: false },
}: {
  publishAt: Date;
  reminders?: StudioCountView;
}) {
  return render(
    <TestProviders>
      <StudioNextReleaseCountdown
        nextRelease={{
          releaseId: "r1",
          title: "Maré alta",
          publishAt,
          reminders,
          href: studioReleasePath("r1"),
        }}
      />
    </TestProviders>,
  );
}

describe("StudioNextReleaseCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down in days and hours and shows the floored reminders", () => {
    renderCountdown({
      publishAt: at(4 * 24 + 17),
      reminders: { value: null, isBelowThreshold: true },
    });
    expect(
      screen.getByText("Maré alta goes live in 4 days and 17 hours"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Waiting for it: Fewer than 5"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open release page" }),
    ).toHaveAttribute("href", studioReleasePath("r1"));
  });

  it("reads whole days alone", () => {
    renderCountdown({
      publishAt: at(48),
      reminders: { value: 12, isBelowThreshold: false },
    });
    expect(
      screen.getByText("Maré alta goes live in 2 days"),
    ).toBeInTheDocument();
    expect(screen.getByText("Waiting for it: 12")).toBeInTheDocument();
  });

  it("says less than an hour, then going live now", () => {
    const { unmount } = renderCountdown({ publishAt: at(0.5) });
    expect(
      screen.getByText("Maré alta goes live in less than an hour"),
    ).toBeInTheDocument();
    unmount();
    renderCountdown({ publishAt: at(-0.1) });
    expect(screen.getByText("Maré alta is going live now")).toBeInTheDocument();
  });
});
