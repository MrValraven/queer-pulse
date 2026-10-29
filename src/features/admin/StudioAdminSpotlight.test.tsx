import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type {
  AdminStudioSpotlightArtistDTO,
  AdminStudioSpotlightDTO,
} from "./api/studioSpotlightAdmin.api";
import { StudioAdminSpotlight } from "./StudioAdminSpotlight";

const holder: { spotlight: AdminStudioSpotlightDTO | null } = vi.hoisted(
  () => ({ spotlight: null }),
);

vi.mock("./api/StudioAdminSpotlightHooks", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/StudioAdminSpotlightHooks")>();
  return {
    ...original,
    // A set holder replays a fixed read; otherwise the demo read runs.
    useAdminStudioSpotlight: () =>
      holder.spotlight
        ? {
            data: holder.spotlight,
            error: null,
            isLoading: false,
            isError: false,
            isFetching: false,
            errorUpdateCount: 0,
            refetch: () => Promise.resolve(),
          }
        : original.useAdminStudioSpotlight(),
  };
});

function spotlightRow(
  index: number,
  name: string,
  overrides: Partial<AdminStudioSpotlightArtistDTO> = {},
): AdminStudioSpotlightArtistDTO {
  return {
    id: `spotlight-${index}`,
    slot: "new_stars",
    position: index,
    note: null,
    createdAt: new Date().toISOString(),
    isListenable: true,
    artist: {
      id: `persona-${index}`,
      handle: `artist${index}`,
      name,
      kind: "musician",
      avatarUrl: null,
    },
    ...overrides,
  };
}

const VANDA = spotlightRow(0, "Vanda Diesel", {
  slot: "artist_of_the_month",
  position: 1,
  note: "Sunday Mass turned the whole room into a choir",
});

function renderTab() {
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <StudioAdminSpotlight />
    </TestProviders>,
  );
}

async function monthSection() {
  const heading = await screen.findByRole("heading", {
    name: "Artist of the month",
  });
  const section = heading.closest("section");
  if (!section) throw new Error("The month heading sits outside a section");
  return within(section);
}

describe("StudioAdminSpotlight", () => {
  beforeEach(() => {
    holder.spotlight = null;
  });

  it("shows the artist of the month with the day it was picked", async () => {
    holder.spotlight = { artistOfTheMonth: VANDA, newStars: [] };
    renderTab();
    const month = await monthSection();
    expect(month.getByText("Vanda Diesel")).toBeInTheDocument();
    expect(month.getByText(/^Picked /)).toBeInTheDocument();
    expect(
      month.getByRole("button", { name: "Change artist" }),
    ).toBeInTheDocument();
    expect(
      month.getByRole("button", { name: "Edit note for Vanda Diesel" }),
    ).toBeInTheDocument();
    expect(
      month.getByRole("button", { name: "Remove artist: Vanda Diesel" }),
    ).toHaveTextContent("Remove artist");
  });

  it("asks for this month's artist when the pick is from an earlier month", async () => {
    holder.spotlight = {
      artistOfTheMonth: {
        ...VANDA,
        createdAt: new Date(2026, 0, 15).toISOString(),
      },
      newStars: [],
    };
    renderTab();
    const month = await monthSection();
    expect(
      month.getByText(/^Picked in January 2026\. Pick this month's artist$/),
    ).toBeInTheDocument();
    expect(month.queryByText(/^Picked January/)).not.toBeInTheDocument();
  });

  it("names a full New stars list and keeps the picker closed", async () => {
    holder.spotlight = {
      artistOfTheMonth: null,
      newStars: Array.from({ length: 12 }, (_unused, index) =>
        spotlightRow(index + 1, `Star ${index + 1}`),
      ),
    };
    renderTab();
    await screen.findByRole("heading", { name: "Artist of the month" });
    const addButton = screen.getByRole("button", { name: "Add artist" });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(addButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      await screen.findByText("New stars holds 12 artists. Remove one first"),
    ).toBeInTheDocument();
    expect(screen.getByText("12 of 12")).toBeInTheDocument();
  });

  it("adds an artist through the search", async () => {
    renderTab();
    await screen.findByRole("heading", { name: "Artist of the month" });
    fireEvent.click(await screen.findByRole("button", { name: "Add artist" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByLabelText("Search artists by name or handle"),
      { target: { value: "mariana" } },
    );
    fireEvent.click(
      await within(dialog).findByRole("button", { name: "Pick Mariana Sol" }),
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Add artist" }));
    expect(
      await screen.findByText("Mariana Sol is in New stars"),
    ).toBeInTheDocument();
  });

  it("marks an artist already in New stars and keeps them from being picked", async () => {
    renderTab();
    await screen.findByRole("heading", { name: "Artist of the month" });
    fireEvent.click(await screen.findByRole("button", { name: "Add artist" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByLabelText("Search artists by name or handle"),
      { target: { value: "rita" } },
    );
    const rita = await within(dialog).findByRole("button", {
      name: "Pick Rita Ferreira",
    });
    expect(rita).toHaveAttribute("aria-disabled", "true");
    expect(within(rita).getByText("Already in New stars")).toBeInTheDocument();
  });

  it("lets an artist who left New stars be picked again", async () => {
    // The spotlight read no longer lists Rita, while the demo search payload
    // still flags her as in New stars; the read wins.
    holder.spotlight = { artistOfTheMonth: VANDA, newStars: [] };
    renderTab();
    await screen.findByRole("heading", { name: "Artist of the month" });
    fireEvent.click(await screen.findByRole("button", { name: "Add artist" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByLabelText("Search artists by name or handle"),
      { target: { value: "rita" } },
    );
    const rita = await within(dialog).findByRole("button", {
      name: "Pick Rita Ferreira",
    });
    expect(rita).not.toHaveAttribute("aria-disabled");
    expect(
      within(rita).queryByText("Already in New stars"),
    ).not.toBeInTheDocument();
  });

  it("asks for an artist before saving", async () => {
    renderTab();
    await screen.findByRole("heading", { name: "Artist of the month" });
    fireEvent.click(await screen.findByRole("button", { name: "Add artist" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Add artist" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Choose an artist first",
    );
  });
});
