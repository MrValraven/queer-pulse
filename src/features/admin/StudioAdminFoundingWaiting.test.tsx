import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { TestProviders } from "../../test/TestProviders";
import type { AdminStudioLandingSettingsDTO } from "./api/studioLandingAdmin.api";
import { resetDemoAdminStudioLanding } from "./StudioAdminLanding.data";
import { StudioAdminPage } from "./StudioAdminPage";
import { ApiError } from "../../shared/api/client";

vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const mocks: {
  unlistedName: string | null;
  shelfBodies: AdminStudioLandingSettingsDTO[];
  isGrantRefused: boolean;
} = vi.hoisted(() => ({
  unlistedName: null,
  shelfBodies: [],
  isGrantRefused: false,
}));

// The demo seed lists every founding artist, so one test marks an artist as
// no longer able to appear.
vi.mock("./api/useStudioAdminLanding", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioAdminLanding")>();
  return {
    ...original,
    useAdminStudioLanding: () => {
      const result = original.useAdminStudioLanding();
      const landing = result.data;
      if (!landing || mocks.unlistedName === null) return result;
      return {
        ...result,
        data: {
          ...landing,
          foundingArtists: landing.foundingArtists.map((listed) => ({
            ...listed,
            isListed: listed.artist.name !== mocks.unlistedName,
          })),
        },
      };
    },
  };
});

vi.mock("./api/useStudioAdminLandingMutations", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("./api/useStudioAdminLandingMutations")
    >();
  return {
    ...original,
    useSetFoundingShelf: () => {
      const mutation = original.useSetFoundingShelf();
      return {
        ...mutation,
        mutate: (
          settings: AdminStudioLandingSettingsDTO,
          options?: Parameters<typeof mutation.mutate>[1],
        ) => {
          mocks.shelfBodies.push(settings);
          mutation.mutate(settings, options);
        },
      };
    },
  };
});

vi.mock("./api/useStudioAdminAccessRequests", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioAdminAccessRequests")>();
  return {
    ...original,
    useGrantStudioAccessRequest: () => {
      const mutation = original.useGrantStudioAccessRequest();
      return {
        ...mutation,
        mutate: (
          request: Parameters<typeof mutation.mutate>[0],
          options?: Parameters<typeof mutation.mutate>[1],
        ) => {
          if (mocks.isGrantRefused) {
            options?.onError?.(
              new ApiError(404, "Not Found", {
                statusCode: 404,
                code: "studio_access_request_not_found",
                message: "Not Found",
              }),
              request,
              undefined,
              undefined as never,
            );
            return;
          }
          mutation.mutate(request, options);
        },
      };
    },
  };
});

function renderPage() {
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <StudioAdminPage />
    </TestProviders>,
  );
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`no element at index ${index}`);
  return item;
}

async function openTab(name: string) {
  fireEvent.click(await screen.findByRole("tab", { name: new RegExp(name) }));
  return screen.findByRole("tabpanel");
}

beforeEach(() => {
  resetDemoAdminStudioLanding();
  mocks.unlistedName = null;
  mocks.shelfBodies = [];
  mocks.isGrantRefused = false;
});

describe("Studio console tabs (demo)", () => {
  it("shows six tabs, Artists after Scenes and the last with the number of members waiting", async () => {
    renderPage();
    const tabs = await screen.findAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent?.replace(/\d+$/, ""))).toEqual([
      "Shelves",
      "Scenes",
      "Artists",
      "Studio page",
      "Founding artists",
      "Waiting for Studio",
    ]);
    await waitFor(() => expect(at(tabs, 5).textContent).toContain("34"));
  });

  it("moves between tabs with the arrow keys", async () => {
    renderPage();
    const tabs = await screen.findAllByRole("tab");
    const firstTab = at(tabs, 0);
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    await waitFor(() =>
      expect(at(tabs, 1)).toHaveAttribute("aria-selected", "true"),
    );
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Scenes");
  });
});

describe("Founding artists tab (demo)", () => {
  it("lists each artist with the day they were added", async () => {
    renderPage();
    const panel = await openTab("Founding artists");
    const rows = await within(panel).findAllByRole("listitem");
    expect(rows).toHaveLength(3);
    rows.forEach((row) => expect(row).toHaveTextContent(/Added on /));
    expect(within(panel).queryByText(/Not shown/)).not.toBeInTheDocument();
  });

  it("marks an artist who cannot appear right now as Not shown", async () => {
    mocks.unlistedName = "NIGHTFORM";
    renderPage();
    const panel = await openTab("Founding artists");
    const row = (await within(panel).findByText("NIGHTFORM")).closest("li");
    expect(row).toHaveTextContent("Not shown");
    expect(within(panel).getAllByText(/Not shown/)).toHaveLength(1);
  });

  it("turns the shelf off, sends the setting and announces it with the help line beneath", async () => {
    renderPage();
    const panel = await openTab("Founding artists");
    const shelfSwitch = await within(panel).findByRole("switch", {
      name: "Show the Founding artists shelf on Studio home",
    });
    expect(shelfSwitch).toHaveAttribute("aria-checked", "true");
    expect(shelfSwitch).toHaveAccessibleDescription(
      "The badge stays on artist pages either way",
    );
    fireEvent.click(shelfSwitch);
    await waitFor(() =>
      expect(shelfSwitch).toHaveAttribute("aria-checked", "false"),
    );
    expect(mocks.shelfBodies).toEqual([{ isFoundingShelfVisible: false }]);
    expect(
      await within(panel).findByText("The Founding artists shelf is off"),
    ).toBeInTheDocument();
  });

  it("adds through the persona search and leaves founding artists unpickable", async () => {
    renderPage();
    const panel = await openTab("Founding artists");
    fireEvent.click(
      await within(panel).findByRole("button", {
        name: "Add a founding artist",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Add a founding artist",
    });
    const searchbox = within(dialog).getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "nightform" } });
    expect(
      await within(dialog).findByRole("button", { name: "Pick NIGHTFORM" }),
    ).toHaveAttribute("aria-disabled", "true");
    fireEvent.change(searchbox, { target: { value: "mariana" } });
    fireEvent.click(
      await within(dialog).findByRole("button", { name: "Pick Mariana Sol" }),
    );
    expect(
      await screen.findByText("Mariana Sol is a founding artist"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(within(panel).getAllByRole("listitem")).toHaveLength(4),
    );
    expect(within(panel).getAllByRole("listitem")[3]).toHaveTextContent(
      "Mariana Sol",
    );
  });

  it("asks before removing and takes the artist off the list", async () => {
    renderPage();
    const panel = await openTab("Founding artists");
    fireEvent.click(
      await within(panel).findByRole("button", {
        name: "Remove NIGHTFORM from the founding artists",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(
      "Remove NIGHTFORM from the founding artists?",
    );
    expect(within(panel).getAllByRole("listitem")).toHaveLength(3);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove founding artist" }),
    );
    expect(
      await screen.findByText("NIGHTFORM is no longer a founding artist"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(within(panel).getAllByRole("listitem")).toHaveLength(2),
    );
  });

  it("moves an artist down and says where they went", async () => {
    renderPage();
    const panel = await openTab("Founding artists");
    const firstName = at(within(panel).getAllByRole("listitem"), 0).textContent;
    const moveDown = at(
      await within(panel).findAllByRole("button", { name: /^Move down: / }),
      0,
    );
    fireEvent.click(moveDown);
    await waitFor(() =>
      expect(
        at(within(panel).getAllByRole("listitem"), 0).textContent,
      ).not.toBe(firstName),
    );
    expect(
      await within(panel).findByText(/is now number 2$/),
    ).toBeInTheDocument();
  });
});

describe("Waiting for Studio tab (demo)", () => {
  it("lists artists first with the Artist chip and the Studio page chip", async () => {
    renderPage();
    const panel = await openTab("Waiting for Studio");
    expect(
      await within(panel).findByText("34 waiting, artists: 9"),
    ).toBeInTheDocument();
    const rows = within(panel).getAllByRole("listitem");
    expect(rows).toHaveLength(30);
    rows
      .slice(0, 9)
      .forEach((row) => expect(within(row).getByText("Artist")).toBeVisible());
    rows
      .slice(9)
      .forEach((row) =>
        expect(within(row).queryByText("Artist")).not.toBeInTheDocument(),
      );
    expect(rows[0]).toHaveTextContent("Inês Martins");
    expect(rows[0]).toHaveTextContent(/Asked on /);
    const invited = within(panel).getByText("Devon Okoro").closest("li");
    expect(invited).toHaveTextContent("Joined from the Studio page");
    expect(rows[0]).not.toHaveTextContent("Joined from the Studio page");
  });

  it("links each name to the member", async () => {
    renderPage();
    const panel = await openTab("Waiting for Studio");
    expect(
      await within(panel).findByRole("link", { name: "Inês Martins" }),
    ).toHaveAttribute("href", expect.stringMatching(/^\/members\/.+/));
  });

  it("grants at once, announces it, folds the row away and lowers the counts", async () => {
    renderPage();
    const panel = await openTab("Waiting for Studio");
    fireEvent.click(
      await within(panel).findByRole("button", {
        name: "Grant Studio access to Inês Martins",
      }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      await within(panel).findByText(
        "Inês Martins can use Studio now and gets a notification",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(panel).queryByText("Inês Martins", { selector: "a" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      await within(panel).findByText("33 waiting, artists: 8"),
    ).toBeInTheDocument();
    const waitingTab = screen.getByRole("tab", { name: /Waiting for Studio/ });
    await waitFor(() => expect(waitingTab.textContent).toContain("33"));
  });

  it("names the reason when a grant is refused", async () => {
    mocks.isGrantRefused = true;
    renderPage();
    const panel = await openTab("Waiting for Studio");
    fireEvent.click(
      await within(panel).findByRole("button", {
        name: "Grant Studio access to Inês Martins",
      }),
    );
    const toast = await screen.findByText(
      /^We couldn't grant Studio access: .+/,
    );
    expect(toast.textContent).not.toContain("That change didn't save");
    expect(
      within(panel).getByRole("link", { name: "Inês Martins" }),
    ).toBeInTheDocument();
  });

  it("confirms before dismissing a request", async () => {
    renderPage();
    const panel = await openTab("Waiting for Studio");
    fireEvent.click(
      await within(panel).findByRole("button", {
        name: "Dismiss the request from Devon Okoro",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Dismiss the request from Devon Okoro?");
    expect(within(panel).getByText("Devon Okoro")).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Dismiss request" }),
    );
    expect(
      await within(panel).findByText(
        "The request from Devon Okoro is dismissed",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(panel).queryByRole("link", { name: "Devon Okoro" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("loads the next page on Show more requests and moves focus to its first new row", async () => {
    renderPage();
    const panel = await openTab("Waiting for Studio");
    const showMore = await within(panel).findByRole("button", {
      name: "Show more requests",
    });
    showMore.focus();
    fireEvent.click(showMore);
    await waitFor(() =>
      expect(within(panel).getAllByRole("listitem")).toHaveLength(34),
    );
    await waitFor(() =>
      expect(
        within(panel).getByRole("link", { name: "Pedro Amaral" }),
      ).toHaveFocus(),
    );
    await waitFor(() =>
      expect(
        within(panel).queryByRole("button", { name: "Show more requests" }),
      ).not.toBeInTheDocument(),
    );
  });
});
