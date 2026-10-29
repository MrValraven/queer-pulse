import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioAdminPage } from "./StudioAdminPage";
import { studioAdminDemoRefusal } from "./studioAdminDemoErrors";

// AdminShell pulls in the admin chrome (nav badges, the role switcher) this
// test has no reason to exercise, as AdminCommunitySpaceRequestsPage.test.tsx
// mocks it.
vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Set by the server refusal test: the add mutation then rejects as the
// server does when the release is already on the shelf.
const refusals = vi.hoisted(() => ({ isAddRefused: false }));

vi.mock("./api/StudioAdminCurationHooks", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/StudioAdminCurationHooks")>();
  return {
    ...original,
    useAddAdminStudioPick: () => {
      const add = original.useAddAdminStudioPick();
      if (!refusals.isAddRefused) return add;
      return {
        ...add,
        mutate: (
          _variables: unknown,
          options?: { onError?: (cause: unknown) => void },
        ) =>
          options?.onError?.(
            studioAdminDemoRefusal("studio_curation_already_on_shelf"),
          ),
      };
    },
  };
});

function renderPage() {
  refusals.isAddRefused = false;
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <StudioAdminPage />
    </TestProviders>,
  );
}

describe("Studio discovery console: shelves (demo)", () => {
  it("lists the featured slot and both shelves with notes and ages", async () => {
    renderPage();
    const staffPicks = await screen.findByRole("region", {
      name: "Staff picks",
    });
    expect(within(staffPicks).getByText("3 of 12")).toBeInTheDocument();
    expect(
      within(staffPicks).getByText(
        "Ninety minutes for the hour after the lights come up",
      ),
    ).toBeInTheDocument();
    // The inline link and the pencil both read Add a note without a note.
    expect(
      within(staffPicks).getAllByRole("button", {
        name: "Add a note to Cantiga para a vizinha",
      }),
    ).toHaveLength(2);
    expect(within(staffPicks).getAllByText(/^Added /)).toHaveLength(3);
    expect(
      within(screen.getByRole("region", { name: "Featured" })).getByText(
        "Cidade dos santos",
      ),
    ).toBeInTheDocument();
  });

  it("moves a pick later, says where it went and keeps focus on the button", async () => {
    renderPage();
    const staffPicks = await screen.findByRole("region", {
      name: "Staff picks",
    });
    const moveLater = within(staffPicks).getByRole("button", {
      name: "Move later: Bicha, with love",
    });
    moveLater.focus();
    fireEvent.click(moveLater);
    await waitFor(() =>
      expect(within(staffPicks).getAllByRole("listitem")[0]).toHaveTextContent(
        "Devoção",
      ),
    );
    expect(
      await screen.findByText("Bicha, with love is now number 2"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(staffPicks).getByRole("button", {
          name: "Move later: Bicha, with love",
        }),
      ).toHaveFocus(),
    );
  });

  it("adds a release found by title, with a note", async () => {
    renderPage();
    const newThisWeek = await screen.findByRole("region", {
      name: "New this week",
    });
    fireEvent.click(
      within(newThisWeek).getByRole("button", { name: "Add to New this week" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Add a release to New this week",
    });
    fireEvent.change(
      within(dialog).getByRole("searchbox", {
        name: "Search published releases",
      }),
      { target: { value: "cidade" } },
    );
    fireEvent.click(
      await within(dialog).findByRole("button", { name: /Cidade dos santos/ }),
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Note (optional)" }),
      { target: { value: "Back for a second week" } },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Add release" }),
    );
    expect(
      await within(newThisWeek).findByText("Back for a second week"),
    ).toBeInTheDocument();
    expect(within(newThisWeek).getByText("3 of 12")).toBeInTheDocument();
  });

  it("asks for a release before adding", async () => {
    renderPage();
    const newThisWeek = await screen.findByRole("region", {
      name: "New this week",
    });
    fireEvent.click(
      within(newThisWeek).getByRole("button", { name: "Add to New this week" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Add release" }),
    );
    expect(
      await within(dialog).findByText("Choose a release first"),
    ).toBeInTheDocument();
  });

  it("edits a note and removes a pick", async () => {
    renderPage();
    const staffPicks = await screen.findByRole("region", {
      name: "Staff picks",
    });
    fireEvent.click(
      within(staffPicks).getByRole("button", { name: "Edit note for Devoção" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Edit note",
    });
    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "Start with Vela acesa" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(
      await within(staffPicks).findByText("Start with Vela acesa"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(staffPicks).getByRole("button", {
        name: "Remove pick Cantiga para a vizinha from Staff picks",
      }),
    );
    await waitFor(() =>
      expect(within(staffPicks).getByText("2 of 12")).toBeInTheDocument(),
    );
  });

  it("marks the featured release as taken and asks for a choice", async () => {
    renderPage();
    const featured = await screen.findByRole("region", { name: "Featured" });
    fireEvent.click(
      within(featured).getByRole("button", { name: "Replace release" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Set the featured release",
    });
    fireEvent.change(
      within(dialog).getByRole("searchbox", {
        name: "Search published releases",
      }),
      { target: { value: "cidade" } },
    );
    const takenRow = await within(dialog).findByRole("button", {
      name: /Cidade dos santos/,
    });
    expect(takenRow).toHaveAttribute("aria-disabled", "true");
    expect(takenRow).toHaveAccessibleName(/Featured now/);
    fireEvent.click(takenRow);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Set as featured" }),
    );
    expect(
      await within(dialog).findByText("Choose a release first"),
    ).toBeInTheDocument();
  });

  it("names the server's refusal when the release is already on the shelf", async () => {
    renderPage();
    refusals.isAddRefused = true;
    const newThisWeek = await screen.findByRole("region", {
      name: "New this week",
    });
    fireEvent.click(
      within(newThisWeek).getByRole("button", { name: "Add to New this week" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Add a release to New this week",
    });
    fireEvent.change(
      within(dialog).getByRole("searchbox", {
        name: "Search published releases",
      }),
      { target: { value: "cidade" } },
    );
    fireEvent.click(
      await within(dialog).findByRole("button", { name: /Cidade dos santos/ }),
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Add release" }),
    );
    expect(
      await within(dialog).findByText("That release is already on this shelf"),
    ).toBeInTheDocument();
    expect(within(newThisWeek).getByText("2 of 12")).toBeInTheDocument();
  });
});
