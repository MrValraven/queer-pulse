import {
  act,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { SubprofileDTO } from "./api/subprofiles.api";
import {
  subprofileToView,
  type SubprofileView,
} from "./api/subprofiles.adapters";
import { PERSONA_EDIT_CONFLICT_CODE } from "./api/personaEditConflict";
import { SubprofileEditorProvider } from "./SubprofileEditorProvider";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { ItemRevisionHistoryModal } from "./rights/ItemRevisionHistoryModal";

/**
 * ENG-451: the editor's save chain and the conflict Reload, driven through the
 * real provider with the persona writes and the reload refetch stubbed, so each
 * spec controls exactly which `editVersion` the server answers with.
 */

const writes = vi.hoisted(() => ({
  update: vi.fn(),
  replaceSection: vi.fn(),
  replaceSocials: vi.fn(),
  replaceAffiliations: vi.fn(),
  reload: vi.fn(),
  restore: vi.fn(),
  closeHistory: vi.fn(),
}));

vi.mock("./api/useItemRevisions", () => ({
  useItemRevisions: () => ({
    data: [
      {
        id: "rev-earlier",
        createdAt: "2026-09-01T00:00:00.000Z",
        title: "Earlier draft",
      },
    ],
    isLoading: false,
  }),
  useItemRevisionDetail: () => ({ data: undefined, isLoading: false }),
  useRestoreItemRevision: () => ({
    mutateAsync: writes.restore,
    isPending: false,
  }),
}));

vi.mock("./api/useSubprofileMutations", () => ({
  useSubprofileMutations: () => ({
    update: { mutateAsync: writes.update, isPending: false },
    replaceSection: { mutateAsync: writes.replaceSection, isPending: false },
    replaceSocials: { mutateAsync: writes.replaceSocials, isPending: false },
  }),
}));

vi.mock("./api/useAffiliations", () => ({
  useAffiliations: () => ({
    replace: { mutateAsync: writes.replaceAffiliations, isPending: false },
  }),
}));

vi.mock("./api/useSubprofile", () => ({
  useSubprofileReload: () => writes.reload,
}));

function ownerDto(overrides: Partial<SubprofileDTO> = {}): SubprofileDTO {
  return {
    id: "sp-conflict",
    kind: "writer",
    slug: "words",
    handle: "tiago-words",
    displayName: "Tiago Costa",
    avatarUrl: null,
    tagline: null,
    bio: null,
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: null,
    ctaUrl: null,
    socialLinks: [{ platform: "github", urlOrHandle: "tiago" }],
    linkVisibility: "linked",
    visibility: "open",
    status: "draft",
    position: 0,
    items: [],
    affiliations: [],
    endorsementCount: 0,
    followerCount: 0,
    skinData: null,
    memberCount: 2,
    editVersion: 3,
    ...overrides,
  };
}

const editConflict = () =>
  new ApiError(409, "Conflict", {
    code: PERSONA_EDIT_CONFLICT_CODE,
    currentEditVersion: 6,
  });

function renderEditor(view: SubprofileView) {
  return renderHook(() => useSubprofileEditorContext(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestProviders>
        <SubprofileEditorProvider subprofile={view}>
          {children}
        </SubprofileEditorProvider>
      </TestProviders>
    ),
  });
}

beforeEach(() => {
  for (const write of Object.values(writes)) write.mockReset();
});

describe("SubprofileEditorProvider save conflicts (ENG-451)", () => {
  it("saves the areas in sequence, passing each returned editVersion to the next request", async () => {
    writes.update.mockResolvedValue(ownerDto({ editVersion: 4 }));
    writes.replaceSocials.mockResolvedValue(ownerDto({ editVersion: 5 }));
    const { result } = renderEditor(subprofileToView(ownerDto()));

    act(() => {
      result.current.meta.setDisplayName("Tiago C.");
      result.current.setSocialRows([
        ...result.current.socialRows,
        { platform: "site", urlOrHandle: "tiago.dev", _uid: "social-added" },
      ]);
    });
    let isSaved = false;
    await act(async () => {
      isSaved = await result.current.saveAll();
    });

    expect(isSaved).toBe(true);
    expect(writes.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sp-conflict",
        dto: expect.objectContaining({
          displayName: "Tiago C.",
          expectedEditVersion: 3,
        }),
      }),
    );
    expect(writes.replaceSocials).toHaveBeenCalledWith(
      expect.objectContaining({ id: "sp-conflict", expectedEditVersion: 4 }),
    );
    expect(writes.update.mock.invocationCallOrder[0]!).toBeLessThan(
      writes.replaceSocials.mock.invocationCallOrder[0]!,
    );
    expect(result.current.dirty).toBe(false);
    expect(result.current.hasEditConflict).toBe(false);
  });

  it("stops the chain on PERSONA_EDIT_CONFLICT, raises the conflict and keeps the edits on screen", async () => {
    writes.update.mockRejectedValue(editConflict());
    const { result } = renderEditor(subprofileToView(ownerDto()));

    act(() => {
      result.current.meta.setDisplayName("My draft name");
      result.current.setSocialRows([
        { platform: "site", urlOrHandle: "tiago.dev", _uid: "social-added" },
      ]);
    });
    let isSaved = true;
    await act(async () => {
      isSaved = await result.current.saveAll();
    });

    expect(isSaved).toBe(false);
    expect(result.current.hasEditConflict).toBe(true);
    expect(result.current.canSave).toBe(false);
    expect(writes.replaceSocials).not.toHaveBeenCalled();
    expect(result.current.meta.displayName).toBe("My draft name");
    expect(result.current.dirty).toBe(true);
  });

  it("Reload refetches and re-seeds every area from the fresh copy, and the next save carries its version", async () => {
    writes.update.mockRejectedValueOnce(editConflict());
    const { result } = renderEditor(subprofileToView(ownerDto()));

    act(() => {
      result.current.meta.setDisplayName("My draft name");
      result.current.skinBlocks.setValue("colophon", "My colophon");
    });
    await act(async () => {
      await result.current.saveAll();
    });
    expect(result.current.hasEditConflict).toBe(true);
    expect(result.current.reloadGeneration).toBe(0);

    writes.reload.mockResolvedValue(
      subprofileToView(
        ownerDto({
          displayName: "Their name",
          socialLinks: [{ platform: "site", urlOrHandle: "their.site" }],
          skinData: { colophon: "Their colophon" },
          items: [
            {
              id: "itm-their-essay",
              section: "publications",
              title: "Their essay",
              createdAt: "2026-09-01T00:00:00.000Z",
              tags: [],
              isFeatured: false,
              collaborators: [],
            },
          ],
          editVersion: 7,
        }),
      ),
    );
    act(() => result.current.reloadLatest());

    await waitFor(() =>
      expect(result.current.meta.displayName).toBe("Their name"),
    );
    expect(writes.reload).toHaveBeenCalledTimes(1);
    expect(result.current.reloadGeneration).toBe(1);
    expect(result.current.hasEditConflict).toBe(false);
    expect(result.current.hasReloadFailed).toBe(false);
    expect(result.current.dirty).toBe(false);
    expect(result.current.subprofile.editVersion).toBe(7);
    expect(result.current.socialRows.map((row) => row.urlOrHandle)).toEqual([
      "their.site",
    ]);
    expect(result.current.skinBlocks.getValue("colophon")).toBe(
      "Their colophon",
    );
    expect(result.current.skinBlocks.dirty).toBe(false);
    expect(
      result.current.sectionRows.publications?.map((row) => row.title),
    ).toEqual(["Their essay"]);

    writes.update.mockResolvedValueOnce(ownerDto({ editVersion: 8 }));
    act(() => {
      result.current.meta.setDisplayName("After reload");
    });
    await act(async () => {
      await result.current.saveAll();
    });
    expect(writes.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dto: expect.objectContaining({
          displayName: "After reload",
          expectedEditVersion: 7,
        }),
      }),
    );
  });

  it("keeps the edits and the conflict when the Reload refetch fails", async () => {
    writes.update.mockRejectedValueOnce(editConflict());
    const { result } = renderEditor(subprofileToView(ownerDto()));

    act(() => {
      result.current.meta.setDisplayName("My draft name");
    });
    await act(async () => {
      await result.current.saveAll();
    });
    writes.reload.mockRejectedValue(new Error("offline"));
    act(() => result.current.reloadLatest());

    await waitFor(() => expect(result.current.hasReloadFailed).toBe(true));
    expect(result.current.isReloading).toBe(false);
    expect(result.current.hasEditConflict).toBe(true);
    expect(result.current.reloadGeneration).toBe(0);
    expect(result.current.meta.displayName).toBe("My draft name");
    expect(result.current.dirty).toBe(true);
  });
});

/** The "Version history" modal wired to the editor the way
 *  `SubprofileItemDrawer` wires it. */
function RestoreFromEditor() {
  const { getEditVersion, adoptEditVersion, markEditConflict } =
    useSubprofileEditorContext();
  return (
    <ItemRevisionHistoryModal
      subprofileId="sp-conflict"
      itemId="itm-essay"
      section="publications"
      onClose={writes.closeHistory}
      editVersionControls={{
        getEditVersion,
        adoptEditVersion,
        markEditConflict,
      }}
    />
  );
}

function renderEditorWithRestore(view: SubprofileView) {
  return renderHook(() => useSubprofileEditorContext(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestProviders>
        <SubprofileEditorProvider subprofile={view}>
          {children}
          <RestoreFromEditor />
        </SubprofileEditorProvider>
      </TestProviders>
    ),
  });
}

/** The `expectedEditVersion` the latest persona PATCH carried. */
function lastUpdateExpectedVersion(): number | undefined {
  const lastUpdate = writes.update.mock.lastCall?.[0] as {
    dto: { expectedEditVersion?: number };
  };
  return lastUpdate.dto.expectedEditVersion;
}

async function pressRestore() {
  const restoreButton = await screen.findByRole("button", {
    name: /Restore/i,
  });
  // The restore request starts synchronously on the click; each spec waits
  // for its own outcome.
  fireEvent.click(restoreButton);
}

describe("item revision restore joins the editor's version (ENG-451)", () => {
  it("sends the editor's version, and the version the restore answers rides on the next Save", async () => {
    writes.restore.mockResolvedValue({
      ok: true,
      editVersion: 4,
      subprofile: null,
    });
    writes.update.mockResolvedValue(ownerDto({ editVersion: 5 }));
    const { result } = renderEditorWithRestore(subprofileToView(ownerDto()));

    await pressRestore();

    expect(writes.restore).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "itm-essay",
        revisionId: "rev-earlier",
        expectedEditVersion: 3,
      }),
    );
    await waitFor(() => expect(writes.closeHistory).toHaveBeenCalled());
    expect(result.current.getEditVersion()).toBe(4);

    act(() => {
      result.current.meta.setDisplayName("After restore");
    });
    await act(async () => {
      await result.current.saveAll();
    });
    expect(lastUpdateExpectedVersion()).toBe(4);
  });

  it("keeps the loaded version when the restore hands back none", async () => {
    writes.restore.mockResolvedValue({
      ok: true,
      editVersion: null,
      subprofile: null,
    });
    writes.update.mockResolvedValue(ownerDto({ editVersion: 4 }));
    const { result } = renderEditorWithRestore(subprofileToView(ownerDto()));

    await pressRestore();
    await waitFor(() => expect(writes.closeHistory).toHaveBeenCalled());
    expect(result.current.getEditVersion()).toBe(3);

    act(() => {
      result.current.meta.setDisplayName("After restore");
    });
    await act(async () => {
      await result.current.saveAll();
    });
    expect(lastUpdateExpectedVersion()).toBe(3);
  });

  it("raises the conflict alert when the restore is refused with PERSONA_EDIT_CONFLICT", async () => {
    writes.restore.mockRejectedValue(editConflict());
    const { result } = renderEditorWithRestore(subprofileToView(ownerDto()));

    await pressRestore();

    await waitFor(() => expect(result.current.hasEditConflict).toBe(true));
    expect(writes.closeHistory).toHaveBeenCalled();
    expect(result.current.getEditVersion()).toBe(3);
    act(() => {
      result.current.meta.setDisplayName("Blocked edit");
    });
    expect(result.current.canSave).toBe(false);
  });
});

describe("typed refusals on Save show translated copy (ENG-448, PRD-427)", () => {
  it("stops the chain on a restricted account and toasts the restriction copy", async () => {
    writes.update.mockRejectedValue(
      new ApiError(403, "Your account is restricted.", {
        code: "ACCOUNT_RESTRICTED",
      }),
    );
    const { result } = renderEditor(subprofileToView(ownerDto()));

    act(() => {
      result.current.meta.setDisplayName("Tiago C.");
      result.current.setSocialRows([
        { platform: "site", urlOrHandle: "tiago.dev", _uid: "social-added" },
      ]);
    });
    let isSaved = true;
    await act(async () => {
      isSaved = await result.current.saveAll();
    });

    expect(isSaved).toBe(false);
    expect(writes.replaceSocials).not.toHaveBeenCalled();
    expect(result.current.hasEditConflict).toBe(false);
    expect(
      await screen.findByText(/moderation restriction is in effect/i),
    ).toBeInTheDocument();
  });

  it("toasts the checklist's taken-handle copy when a rename loses the claim race", async () => {
    writes.update.mockRejectedValue(
      new ApiError(409, "That handle is already taken.", {
        code: "HANDLE_TAKEN",
        unmet: ["handle_taken"],
      }),
    );
    const { result } = renderEditor(subprofileToView(ownerDto()));

    act(() => {
      result.current.meta.setDisplayName("Tiago C.");
    });
    await act(async () => {
      await result.current.saveAll();
    });

    expect(
      await screen.findByText(/Someone already has that handle/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("That handle is already taken."),
    ).not.toBeInTheDocument();
  });
});

// ENG-447: an unlink answers under a fresh id, and the old one no longer
// resolves, so the rest of the same save writes to the new one.
describe("SubprofileEditorProvider save after an unlink (ENG-447)", () => {
  it("writes every step after the unlink to the fresh id the PATCH answers with", async () => {
    writes.update.mockResolvedValue(
      ownerDto({ id: "sp-fresh", linkVisibility: "unlinked", editVersion: 4 }),
    );
    writes.replaceSocials.mockResolvedValue(
      ownerDto({ id: "sp-fresh", linkVisibility: "unlinked", editVersion: 5 }),
    );
    const { result } = renderEditor(subprofileToView(ownerDto()));

    act(() => {
      result.current.meta.setLink("unlinked");
      result.current.setSocialRows([
        ...result.current.socialRows,
        { platform: "site", urlOrHandle: "tiago.dev", _uid: "social-added" },
      ]);
    });
    let isSaved = false;
    await act(async () => {
      isSaved = await result.current.saveAll();
    });

    expect(isSaved).toBe(true);
    expect(writes.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sp-conflict",
        dto: expect.objectContaining({ linkVisibility: "unlinked" }),
      }),
    );
    expect(writes.replaceSocials).toHaveBeenCalledWith(
      expect.objectContaining({ id: "sp-fresh", expectedEditVersion: 4 }),
    );
  });
});
