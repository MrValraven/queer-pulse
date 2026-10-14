import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { StudioAdminPage } from "./StudioAdminPage";

vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const failures = vi.hoisted(() => ({
  curation: null as Error | null,
  isSearchFailing: false,
}));

vi.mock("./api/StudioAdminCurationHooks", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/StudioAdminCurationHooks")>();
  return {
    ...original,
    useAdminStudioCuration: () =>
      failures.curation
        ? {
            data: undefined,
            isLoading: false,
            isError: true,
            error: failures.curation,
            refetch: vi.fn(),
          }
        : original.useAdminStudioCuration(),
    useAdminStudioReleaseSearch: (query: string) =>
      failures.isSearchFailing
        ? { data: undefined, isFetching: false, isError: true }
        : original.useAdminStudioReleaseSearch(query),
  };
});

function renderPage() {
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <StudioAdminPage />
    </TestProviders>,
  );
}

describe("Studio discovery console: failed reads (demo)", () => {
  it("shows the forbidden panel without a Try again button for a 403", async () => {
    failures.curation = new ApiError(403, "Forbidden");
    failures.isSearchFailing = false;
    renderPage();
    expect(
      await screen.findByText("Your account can't open Studio discovery"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try again" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Shelves");
  });

  it("shows the load error line when the search fails", async () => {
    failures.curation = null;
    failures.isSearchFailing = true;
    renderPage();
    const newThisWeek = await screen.findByRole("region", {
      name: "New this week",
    });
    fireEvent.click(
      within(newThisWeek).getByRole("button", { name: "Add to New this week" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByRole("searchbox", {
        name: "Search published releases",
      }),
      { target: { value: "cidade" } },
    );
    expect(
      await within(dialog).findByText("That search didn't load"),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/No results/i)).not.toBeInTheDocument();
  });
});
