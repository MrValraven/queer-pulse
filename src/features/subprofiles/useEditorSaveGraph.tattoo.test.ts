import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { runEditorSaveChain } from "./editorSaveChain";
import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";
import type { EditorRowsState } from "./useEditorRowsState";
import { buildSaveSteps, type SaveMutations } from "./useEditorSaveGraph";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";

/**
 * A tattoo artist's flash days drop their event links only once the persona
 * is unlinked on the server. The save chain moves on after a refused PATCH,
 * so the flash days PUT that follows a refused unlink keeps every link.
 */

const LINKED_PERSONA = {
  id: "sp-tattoo",
  kind: "tattoo_artist",
  linkVisibility: "linked",
  skinData: null,
  editVersion: 3,
} as unknown as SubprofileView;

const FLASH_DAY_ROW = {
  _uid: "row-flash-day",
  id: "item-flash-day",
  section: "flash_days",
  title: "Flash day at Portfolio Night",
  createdAt: "2026-10-01T00:00:00.000Z",
  subtitle: "",
  description: "",
  url: "",
  imageUrl: "",
  date: "2026-11-14",
  meta: "",
  tags: [],
  isFeatured: false,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: { flashDay: { eventSlug: "portfolio-night" } },
} as unknown as SubprofileEditorRow;

/** A draft that unlinks the persona and changes nothing else in meta. */
function unlinkingMeta(): SubprofileMetaEditor {
  const snapshot = { link: "unlinked", availability: "", coverBleed: false };
  return {
    availability: "",
    buildMetaPatch: () => ({ linkVisibility: "unlinked" }),
    metaSnapshot: () => snapshot,
    baselineSnapshot: () => ({ ...snapshot, link: "linked" }),
    markSaved: vi.fn(),
    setAvailability: vi.fn(),
  } as unknown as SubprofileMetaEditor;
}

function cleanSkinBlocks(): SubprofileSkinBlocksEditor {
  return {
    dirty: false,
    chapters: [],
    getValue: () => undefined,
    getBaselineValue: () => undefined,
    buildSkinBlocks: () => ({}),
    markSaved: vi.fn(),
  } as unknown as SubprofileSkinBlocksEditor;
}

function flashDayRows(): EditorRowsState {
  return {
    sectionRows: { flash_days: [FLASH_DAY_ROW] },
    sectionBaseline: { flash_days: [] },
    sectionLabelKeys: { flash_days: "subprofiles:section.flash_days" },
    setSectionBaseline: vi.fn(),
    socialRows: [],
    socialBaseline: [],
    setSocialBaseline: vi.fn(),
    affiliationRows: [],
    affiliationBaseline: [],
    setAffiliationBaseline: vi.fn(),
  } as unknown as EditorRowsState;
}

/** `answerUpdate` builds the PATCH answer when the request is sent. */
function saveMutations(answerUpdate: () => Promise<unknown>) {
  const update = { mutateAsync: vi.fn(answerUpdate) };
  const replaceSection = {
    mutateAsync: vi.fn((_request: unknown) =>
      Promise.resolve({ editVersion: 5 }),
    ),
  };
  const mutations = {
    update,
    replaceSection,
    replaceSocials: { mutateAsync: vi.fn() },
    replaceAffiliations: { mutateAsync: vi.fn() },
  } as unknown as SaveMutations;
  return { mutations, replaceSection };
}

const ADDED_ROW = () => ({
  added: 1,
  removed: 0,
  edited: 0,
  reordered: false,
});

describe("buildSaveSteps for a tattoo artist's flash days", () => {
  it("keeps flash day event links when the unlink is refused", async () => {
    const { mutations, replaceSection } = saveMutations(() =>
      Promise.reject(
        new ApiError(409, "That address is taken", { code: "HANDLE_TAKEN" }),
      ),
    );
    const steps = buildSaveSteps(
      LINKED_PERSONA,
      unlinkingMeta(),
      cleanSkinBlocks(),
      flashDayRows(),
      mutations,
      ADDED_ROW,
    );

    const outcome = await runEditorSaveChain(steps, 3);

    expect(outcome.failedLabelKeys).toEqual(["subprofiles:pending.area.meta"]);
    expect(replaceSection.mutateAsync).toHaveBeenCalledTimes(1);
    expect(replaceSection.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sp-tattoo",
        section: "flash_days",
        items: [
          expect.objectContaining({
            structured: { flashDay: { eventSlug: "portfolio-night" } },
          }),
        ],
      }),
    );
  });

  it("drops flash day event links once the unlink saves", async () => {
    const { mutations, replaceSection } = saveMutations(() =>
      Promise.resolve({
        id: "sp-tattoo-unlinked",
        linkVisibility: "unlinked",
        editVersion: 4,
      }),
    );
    const steps = buildSaveSteps(
      LINKED_PERSONA,
      unlinkingMeta(),
      cleanSkinBlocks(),
      flashDayRows(),
      mutations,
      ADDED_ROW,
    );

    const outcome = await runEditorSaveChain(steps, 3);

    expect(outcome.failedLabelKeys).toEqual([]);
    const sectionRequest = replaceSection.mutateAsync.mock.calls[0]?.[0] as {
      id: string;
      items: Array<{ structured?: unknown }>;
    };
    expect(sectionRequest.id).toBe("sp-tattoo-unlinked");
    expect(sectionRequest.items).toHaveLength(1);
    expect(sectionRequest.items[0]?.structured).toBeUndefined();
  });
});
