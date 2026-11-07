import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { AnimatePresence } from "motion/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { loadNamespace } from "../../shared/i18n/catalogs";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { toPlaylistEditorView, toPlaylistView } from "./api/studio.adapters";
import {
  demoStudioPlaylist,
  resetDemoPlaylists,
} from "./api/studioDemoPlaylists";
import { StudioPlaylistEditorRows } from "./StudioPlaylistEditorRows";
import { StudioPlaylistEditorsSheet } from "./StudioPlaylistEditorsSheet";

const control = vi.hoisted(() => ({
  inviteRefusal: null as null | {
    status: 409 | 422;
    body: Record<string, unknown>;
  },
  hiddenCandidateSlug: null as string | null,
  isEditorsListFailing: false,
}));
const removeSpy = vi.hoisted(() => vi.fn());
vi.mock("./api/studioDemoPlaylistEditors", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoPlaylistEditors")>();
  return {
    ...original,
    demoInvitePlaylistEditors: (
      ...args: Parameters<typeof original.demoInvitePlaylistEditors>
    ) => {
      if (control.inviteRefusal) {
        const { status, body } = control.inviteRefusal;
        throw new ApiError(status, "refused", { statusCode: status, ...body });
      }
      return original.demoInvitePlaylistEditors(...args);
    },
    demoPlaylistEditorCandidates: (
      ...args: Parameters<typeof original.demoPlaylistEditorCandidates>
    ) => {
      const answer = original.demoPlaylistEditorCandidates(...args);
      return {
        items: answer.items.filter(
          (item) => item.member.slug !== control.hiddenCandidateSlug,
        ),
      };
    },
    demoRemovePlaylistEditor: (
      ...args: Parameters<typeof original.demoRemovePlaylistEditor>
    ) => {
      removeSpy(...args);
      return original.demoRemovePlaylistEditor(...args);
    },
  };
});

// The editors list fails at the hook: the hook's first dynamic import of the
// demo module above receives the unmocked module under Vitest 3.2, so a throw
// placed in the demo reader never reaches the list.
vi.mock("./api/useStudioPlaylistEditors", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioPlaylistEditors")>();
  return {
    ...original,
    useStudioPlaylistEditors: (
      ...args: Parameters<typeof original.useStudioPlaylistEditors>
    ) => {
      const result = original.useStudioPlaylistEditors(...args);
      if (!control.isEditorsListFailing) return result;
      return {
        editors: [],
        loadState: {
          ...result.loadState,
          isLoading: false,
          isError: true,
          reason: "server" as const,
        },
      };
    },
  };
});

beforeEach(() => {
  resetDemoPlaylists();
  control.inviteRefusal = null;
  control.hiddenCandidateSlug = null;
  control.isEditorsListFailing = false;
  removeSpy.mockClear();
});

async function renderSheet(
  playlistId: string,
  { shouldWaitForData = true }: { shouldWaitForData?: boolean } = {},
) {
  const onClose = vi.fn();
  render(
    <TestProviders>
      <AnimatePresence>
        <StudioPlaylistEditorsSheet
          playlist={toPlaylistView(demoStudioPlaylist(playlistId))}
          onClose={onClose}
        />
      </AnimatePresence>
    </TestProviders>,
  );
  if (shouldWaitForData) await awaitCatalog("studio");
  else await paintCatalogBeforeData();
  return onClose;
}

/** Paints the studio copy on microtasks only. awaitCatalog yields a task,
 *  and React Query hands a read's answer over on a task, so the sheet is
 *  still loading when this returns. */
async function paintCatalogBeforeData() {
  await act(async () => {
    await loadNamespace("en", "studio");
    for (let tick = 0; tick < 5; tick += 1) await Promise.resolve();
  });
}

const GROUP_CHAT = "demo-playlist-for-the-group-chat";
const CARTAS = "demo-playlist-cartas-que-voltam";

/** Invite editors answers a press only once the editors have loaded. */
async function pressInviteEditors() {
  const inviteButton = await screen.findByRole("button", {
    name: "Invite editors",
  });
  await waitFor(() =>
    expect(inviteButton).not.toHaveAttribute("aria-disabled"),
  );
  fireEvent.click(inviteButton);
}

/** The toast deck keeps an empty alert region mounted, so a refusal is read
 *  inside the sheet. */
function withinSheet() {
  return within(screen.getByRole("dialog"));
}

/** Opens Invite editors on the group chat, ticks Anika and sends. */
async function inviteAnikaToGroupChat() {
  await renderSheet(GROUP_CHAT);
  await pressInviteEditors();
  fireEvent.change(
    await screen.findByPlaceholderText("Search your connections"),
    { target: { value: "ani" } },
  );
  fireEvent.click(await screen.findByRole("option", { name: /Anika Kovač/ }));
  fireEvent.click(screen.getByRole("button", { name: "Send 1 invite" }));
}

describe("StudioPlaylistEditorsSheet", () => {
  it("shows the owner active editors and a pending invite with their actions", async () => {
    await renderSheet(GROUP_CHAT);
    const list = await screen.findByRole("list", {
      name: "Editors of For the group chat",
    });
    expect(await within(list).findByText("Catarina Vaz")).toBeInTheDocument();
    expect(within(list).getByText("Invite sent")).toBeInTheDocument();
    expect(
      within(list).getByRole("button", {
        name: "Remove Catarina Vaz as an editor",
      }),
    ).toBeInTheDocument();
    expect(
      within(list).getByRole("button", {
        name: "Cancel the invite to Luísa Gomes",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 of 10 places taken")).toBeInTheDocument();
  });

  it("cancels an invite at once and removes an editor after a confirm", async () => {
    await renderSheet(GROUP_CHAT);
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Cancel the invite to Luísa Gomes",
      }),
    );
    expect(await screen.findByText("Invite cancelled")).toBeInTheDocument();
    expect(removeSpy).toHaveBeenCalledWith(
      GROUP_CHAT,
      "demo-editor-demo-playlist-for-the-group-chat-luisa",
    );
    await waitFor(() =>
      expect(screen.queryByText("Luísa Gomes")).not.toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Catarina Vaz as an editor" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Remove Catarina Vaz as an editor?",
    });
    expect(
      within(confirm).getByText("The tracks they added stay in the playlist"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Remove editor" }),
    );
    expect(
      await screen.findByText("Catarina Vaz can't edit this playlist anymore"),
    ).toBeInTheDocument();
  });

  it("re-ticks a pick that an earlier search pinned", async () => {
    await renderSheet(GROUP_CHAT);
    await pressInviteEditors();
    const search = await screen.findByPlaceholderText(
      "Search your connections",
    );
    expect(
      screen.queryByRole("option", { name: /Catarina Vaz/ }),
    ).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "ani" } });
    fireEvent.click(await screen.findByRole("option", { name: /Anika Kovač/ }));
    fireEvent.change(search, { target: { value: "sofia" } });
    const pinned = await screen.findByRole("option", { name: /Anika Kovač/ });
    fireEvent.click(pinned);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /Anika Kovač/ }),
      ).toHaveAttribute("aria-selected", "false"),
    );
    fireEvent.click(screen.getByRole("option", { name: /Anika Kovač/ }));
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /Anika Kovač/ }),
      ).toHaveAttribute("aria-selected", "true"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Send 1 invite" }));
    // Back on the list: Anika joins as a pending invite beside Luísa.
    const list = await screen.findByRole("list", {
      name: "Editors of For the group chat",
    });
    expect(within(list).getByText("Anika Kovač")).toBeInTheDocument();
    expect(within(list).getAllByText("Invite sent")).toHaveLength(2);
  });

  it("says why the server refused each person", async () => {
    control.inviteRefusal = {
      status: 422,
      body: {
        code: "studio_playlist_editor_ineligible",
        memberSlugs: ["anika"],
        ineligibleMembers: [
          { memberSlug: "anika", reason: "no_studio_access" },
        ],
      },
    };
    await inviteAnikaToGroupChat();
    expect(await withinSheet().findByRole("alert")).toHaveTextContent(
      "Anika Kovač doesn't have Studio access yet, so they can't edit playlists. Untick them and try again",
    );
  });

  it("names the people refused without a reason, as an older server answers", async () => {
    control.inviteRefusal = {
      status: 422,
      body: {
        code: "studio_playlist_editor_ineligible",
        memberSlugs: ["anika"],
      },
    };
    await inviteAnikaToGroupChat();
    expect(await withinSheet().findByRole("alert")).toHaveTextContent(
      "Anika Kovač can't be invited right now. Untick them and try again",
    );
  });

  it("says the cap is reached when the server answers 409", async () => {
    control.inviteRefusal = {
      status: 409,
      body: { code: "studio_playlist_editor_cap" },
    };
    await inviteAnikaToGroupChat();
    expect(await withinSheet().findByRole("alert")).toHaveTextContent(
      "A playlist can have up to 10 editors and invites",
    );
  });

  it("clears the refusal alert as soon as a pick changes", async () => {
    control.inviteRefusal = {
      status: 422,
      body: {
        code: "studio_playlist_editor_ineligible",
        memberSlugs: ["anika"],
        ineligibleMembers: [{ memberSlug: "anika", reason: "not_connected" }],
      },
    };
    await inviteAnikaToGroupChat();
    expect(await withinSheet().findByRole("alert")).toHaveTextContent(
      "Anika Kovač isn't one of your connections anymore",
    );
    fireEvent.click(screen.getByRole("option", { name: /Anika Kovač/ }));
    await waitFor(() =>
      expect(withinSheet().queryByRole("alert")).not.toBeInTheDocument(),
    );
  });

  it("moves focus to Invite editors once a cancelled invite leaves", async () => {
    await renderSheet(GROUP_CHAT);
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Cancel the invite to Luísa Gomes",
      }),
    );
    expect(await screen.findByText("Invite cancelled")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Invite editors" }),
      ).toHaveFocus(),
    );
  });

  it("moves focus to Invite editors once a confirmed remove closes the confirm", async () => {
    await renderSheet(GROUP_CHAT);
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Catarina Vaz as an editor",
      }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Remove Catarina Vaz as an editor?",
    });
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Remove editor" }),
    );
    expect(
      await screen.findByText("Catarina Vaz can't edit this playlist anymore"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", {
          name: "Remove Catarina Vaz as an editor?",
        }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Invite editors" }),
    ).toHaveFocus();
  });
});

describe("StudioPlaylistEditorsSheet by credit and role", () => {
  it("lets the owner of a persona playlist tick its co-owners", async () => {
    await renderSheet("demo-playlist-cartas-que-voltam");
    const list = await screen.findByRole("list", {
      name: "Co-owners of Mariana Sol",
    });
    expect(
      within(list).getByRole("checkbox", { name: "Rita Varela" }),
    ).toBeChecked();
    const nuno = within(list).getByRole("checkbox", { name: "Nuno Alves" });
    expect(nuno).not.toBeChecked();
    fireEvent.click(nuno);
    expect(
      await screen.findByText("Nuno Alves can now edit this playlist"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(list).getByRole("checkbox", { name: "Nuno Alves" }),
      ).toBeChecked(),
    );
    expect(
      screen.queryByRole("button", { name: "Invite editors" }),
    ).not.toBeInTheDocument();
  });

  it("shows a loading skeleton while the co-owners load", async () => {
    await renderSheet(CARTAS, { shouldWaitForData: false });
    expect(
      screen.getByRole("status", { name: "Loading editors" }),
    ).toBeInTheDocument();
    await screen.findByRole("list", { name: "Co-owners of Mariana Sol" });
    await waitFor(() =>
      expect(
        screen.queryByRole("status", { name: "Loading editors" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps an editor who lost the co-owner grant ticked so the owner can untick them", async () => {
    control.hiddenCandidateSlug = "rita";
    await renderSheet(CARTAS);
    const list = await screen.findByRole("list", {
      name: "Co-owners of Mariana Sol",
    });
    const rita = await within(list).findByRole("checkbox", {
      name: "Rita Varela",
    });
    expect(rita).toBeChecked();
    expect(
      within(list).getByRole("checkbox", { name: "Nuno Alves" }),
    ).not.toBeChecked();
    fireEvent.click(rita);
    expect(
      await screen.findByText("Rita Varela can't edit this playlist anymore"),
    ).toBeInTheDocument();
    expect(removeSpy).toHaveBeenCalledWith(
      CARTAS,
      "demo-editor-demo-playlist-cartas-que-voltam-rita",
    );
    await waitFor(() =>
      expect(
        within(list).queryByRole("checkbox", { name: "Rita Varela" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("says the editors did not load when an untick finds no editor row", async () => {
    control.isEditorsListFailing = true;
    await renderSheet(CARTAS);
    const list = await screen.findByRole("list", {
      name: "Co-owners of Mariana Sol",
    });
    const rita = await within(list).findByRole("checkbox", {
      name: "Rita Varela",
    });
    expect(rita).toBeChecked();
    fireEvent.click(rita);
    expect(
      await screen.findByText("We couldn't load the editors"),
    ).toBeInTheDocument();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(
      within(list).getByRole("checkbox", { name: "Rita Varela" }),
    ).toBeChecked();
  });

  it("offers Remove for a member without a profile row and removes them by id", async () => {
    const editorsResult = {
      editors: [
        toPlaylistEditorView({
          editorId: "demo-editor-demo-playlist-for-the-group-chat-jonas",
          member: { slug: "", displayName: "Former member", avatarUrl: null },
          status: "active",
          source: "member_invite",
          invitedAt: "2026-10-10T21:00:00.000Z",
        }),
      ],
      loadState: {
        isLoading: false,
        isError: false,
        isRetrying: false,
        isNotFound: false,
        isWithdrawn: false,
        retry: () => undefined,
      },
    };
    render(
      <TestProviders>
        <StudioPlaylistEditorRows
          playlist={toPlaylistView(demoStudioPlaylist(GROUP_CHAT))}
          editorsResult={editorsResult}
          isOwner
          onInvite={vi.fn()}
        />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    expect(screen.queryByRole("link", { name: "Former member" })).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Former member as an editor" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Remove Former member as an editor?",
    });
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Remove editor" }),
    );
    await waitFor(() =>
      expect(removeSpy).toHaveBeenCalledWith(
        GROUP_CHAT,
        "demo-editor-demo-playlist-for-the-group-chat-jonas",
      ),
    );
  });

  it("shows an editor the active list with no actions", async () => {
    await renderSheet("demo-playlist-tour-diary");
    const list = await screen.findByRole("list", {
      name: "Editors of Tour diary",
    });
    expect(within(list).getByText("Tiago Costa")).toBeInTheDocument();
    expect(within(list).queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Invite editors" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Everyone who can edit this playlist"),
    ).toBeInTheDocument();
  });
});
