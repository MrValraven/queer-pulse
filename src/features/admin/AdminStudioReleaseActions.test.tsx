import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DEMO_DEFAULT_RELEASE_ID } from "../studio/api/studioDemoMe.data";
import type { ModReport } from "./adminModeration.data";
import { AdminStudioReleaseActions } from "./AdminStudioReleaseActions";

// The demo read never fails, so a test that needs a failed first load sets
// this override; every other test reads the real hook.
const staffReleaseOverride = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}));

vi.mock("./api/useAdminStudio", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/useAdminStudio")>();
  return {
    ...actual,
    useStaffStudioRelease: (releaseId: string) => {
      const realQuery = actual.useStaffStudioRelease(releaseId);
      return staffReleaseOverride.current ?? realQuery;
    },
  };
});

afterEach(() => {
  staffReleaseOverride.current = null;
});

const report = {
  id: "report-1",
  subjectType: "studio_release",
  subjectId: DEMO_DEFAULT_RELEASE_ID,
  title: "Cidade dos santos",
  reportedName: "Mariana Sol",
} as ModReport;

const panelFor = (subject: ModReport) => (
  <TestProviders>
    <AdminStudioReleaseActions report={subject} />
  </TestProviders>
);

describe("AdminStudioReleaseActions (demo)", () => {
  it("takes a live release down only with a reason, then restores it to live", async () => {
    render(panelFor(report));
    fireEvent.click(
      await screen.findByRole("button", { name: "Take down release" }),
    );
    // The catalog's confirm label matches the trigger, so the confirm is read
    // inside the dialog.
    const dialog = screen.getByRole("dialog");
    const confirm = within(dialog).getByRole("button", {
      name: "Take down release",
    });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText(/reason/i), {
      target: { value: "Uses a sample without permission" },
    });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(await screen.findByText("Release taken down")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Take down release" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Takedown reason: Uses a sample without permission"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restore release" }));
    expect(
      await screen.findByText("Release restored and live again"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Take down release" }),
    ).toBeInTheDocument();
  });

  it("shows a taken-down release with staff's reason and offers Restore", async () => {
    render(
      panelFor({
        ...report,
        subjectId: "demo-release-taken-down-bairro",
        title: "Bairro antigo",
      }),
    );
    expect(
      await screen.findByRole("button", { name: "Restore release" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Takedown reason: A rights holder asked us to check the sample on this track",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Status: Taken down")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Take down release" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a failed first load and its focused Retry mounted while the retry runs", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn(() => Promise.resolve());
    staffReleaseOverride.current = {
      data: undefined,
      errorUpdateCount: 1,
      isError: true,
      isPending: false,
      isFetching: false,
      refetch,
    };
    const view = render(panelFor(report));
    expect(
      screen.getByText("We couldn't load this release"),
    ).toBeInTheDocument();
    const retry = screen.getByRole("button");
    await user.click(retry);
    expect(refetch).toHaveBeenCalledTimes(1);
    // What react-query reports for a never-loaded query while its retry runs:
    // back to pending, the error count kept.
    staffReleaseOverride.current = {
      ...staffReleaseOverride.current,
      isError: false,
      isPending: true,
      isFetching: true,
    };
    view.rerender(panelFor(report));
    expect(
      screen.getByText("We couldn't load this release"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBe(retry);
    expect(retry).toHaveFocus();
    expect(retry).toHaveAttribute("aria-disabled", "true");
    await user.click(retry);
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
