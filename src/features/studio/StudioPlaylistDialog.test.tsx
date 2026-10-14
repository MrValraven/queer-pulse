import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toPlaylistView } from "./api/studio.adapters";
import {
  demoStudioPlaylist,
  resetDemoPlaylists,
} from "./api/studioDemoPlaylists";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";

const control = vi.hoisted(() => ({
  hasNoPersona: false,
  shouldSwapPersona: false,
}));
const createSpy = vi.hoisted(() => vi.fn());
const updateSpy = vi.hoisted(() => vi.fn());

vi.mock("./api/useStudioAccess", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioAccess")>();
  return {
    ...original,
    useStudioAccess: () => {
      const access = original.useStudioAccess();
      if (control.hasNoPersona) return { ...access, uploadablePersonas: [] };
      if (control.shouldSwapPersona)
        return {
          ...access,
          uploadablePersonas: access.uploadablePersonas.map(
            (persona, index) => ({
              ...persona,
              id: `demo-persona-someone-else-${index}`,
              name: `Someone Else ${index}`,
            }),
          ),
        };
      return access;
    },
  };
});
vi.mock("./api/studioDemoPlaylists", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoPlaylists")>();
  return {
    ...original,
    demoCreatePlaylist: (
      body: Parameters<typeof original.demoCreatePlaylist>[0],
    ) => {
      createSpy(body);
      return original.demoCreatePlaylist(body);
    },
    demoUpdatePlaylist: (
      ...args: Parameters<typeof original.demoUpdatePlaylist>
    ) => {
      updateSpy(...args);
      return original.demoUpdatePlaylist(...args);
    },
  };
});

beforeEach(() => {
  control.hasNoPersona = false;
  control.shouldSwapPersona = false;
  createSpy.mockClear();
  updateSpy.mockClear();
  resetDemoPlaylists();
});

function renderCreate(onSaved = vi.fn()) {
  render(
    <TestProviders>
      <StudioPlaylistDialog mode="create" onClose={vi.fn()} onSaved={onSaved} />
    </TestProviders>,
  );
  return onSaved;
}

describe("StudioPlaylistDialog", () => {
  it("creates a private playlist shown as the member by default", async () => {
    const onSaved = renderCreate();
    fireEvent.change(screen.getByRole("textbox", { name: /name/i }), {
      target: { value: "  Night bus  " },
    });
    expect(screen.getByRole("radio", { name: /private/i })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Create playlist" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(createSpy.mock.calls[0]?.[0]).toEqual({
      name: "Night bus",
      visibility: "private",
    });
  });

  it("credits a persona and says a connections-only playlist stays off its page", async () => {
    const onSaved = renderCreate();
    fireEvent.change(screen.getByRole("textbox", { name: /name/i }), {
      target: { value: "For the group chat" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /connections only/i }));
    fireEvent.click(screen.getByRole("radio", { name: /mariana sol/i }));
    expect(
      await screen.findByText(/stays off Mariana Sol's page/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create playlist" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(createSpy.mock.calls[0]?.[0]).toEqual({
      name: "For the group chat",
      visibility: "connections",
      creditSubprofileId: "demo-persona-mariana-sol",
    });
  });

  it("hides Show as for a member with no persona", () => {
    control.hasNoPersona = true;
    renderCreate();
    expect(
      screen.queryByRole("group", { name: "Show as" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Who can open it" }),
    ).toBeInTheDocument();
  });

  it("refuses a blank name", async () => {
    const onSaved = renderCreate();
    fireEvent.change(screen.getByRole("textbox", { name: /name/i }), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create playlist" }));
    expect(
      await screen.findByText("Give your playlist a name"),
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("moves focus to the name field after a blank submit", async () => {
    renderCreate();
    const createButton = screen.getByRole("button", {
      name: "Create playlist",
    });
    createButton.focus();
    fireEvent.click(createButton);
    expect(
      await screen.findByText("Give your playlist a name"),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /name/i })).toHaveFocus();
  });

  it("sends only the credit when that is all the member changed", async () => {
    const onSaved = renderEdit("demo-playlist-kitchen-tapes");
    fireEvent.click(screen.getByRole("radio", { name: /mariana sol/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(updateSpy).toHaveBeenCalledWith("demo-playlist-kitchen-tapes", {
      creditSubprofileId: "demo-persona-mariana-sol",
    });
  });

  it("shows You for a saved persona missing from the list and keeps its credit", async () => {
    control.shouldSwapPersona = true;
    const onSaved = renderEdit("demo-playlist-cartas-que-voltam");
    expect(screen.getByRole("radio", { name: "You" })).toBeChecked();
    fireEvent.change(screen.getByRole("textbox", { name: /name/i }), {
      target: { value: "Cartas novas" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(updateSpy).toHaveBeenCalledWith("demo-playlist-cartas-que-voltam", {
      name: "Cartas novas",
    });
  });

  it("names each radio by its title and describes it by its hint", () => {
    renderCreate();
    expect(
      screen.getByRole("radio", { name: "Private" }),
    ).toHaveAccessibleDescription("Only you");
  });
});

function renderEdit(playlistId: string, onSaved = vi.fn()) {
  render(
    <TestProviders>
      <StudioPlaylistDialog
        mode="edit"
        playlist={toPlaylistView(demoStudioPlaylist(playlistId))}
        onClose={vi.fn()}
        onSaved={onSaved}
      />
    </TestProviders>,
  );
  return onSaved;
}
