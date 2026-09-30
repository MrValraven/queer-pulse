import { vi } from "vitest";
import { subprofileToView } from "../api/subprofiles.adapters";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { mockSubprofileById } from "../data/subprofiles.data";
import { DEMO_PODCAST_SUBPROFILE_ID } from "../data/subprofileFeeds.data";
import type { SubprofileEditorContextValue } from "../subprofileEditorContext";

/** The demo podcaster persona as the editor holds it. */
export function demoPodcastView(): SubprofileView {
  const dto = mockSubprofileById(DEMO_PODCAST_SUBPROFILE_ID);
  if (!dto) throw new Error("demo podcaster persona is missing");
  return subprofileToView(dto);
}

/** The slice of the editor context the Import pane reads. */
export type EditorStubFields = Pick<
  SubprofileEditorContextValue,
  | "dirty"
  | "saving"
  | "isReloading"
  | "hasEditConflict"
  | "getEditVersion"
  | "adoptEditVersion"
  | "markEditConflict"
  | "reseedSection"
  | "pending"
  | "sectionRows"
  | "setSectionRows"
>;

/** A stand-in editor context carrying only what the feed components read, with
 *  spies for the four calls a publish makes back into the editor. */
export function editorStub(
  overrides: Partial<EditorStubFields> = {},
): EditorStubFields {
  return {
    dirty: false,
    saving: false,
    isReloading: false,
    hasEditConflict: false,
    getEditVersion: () => 0,
    adoptEditVersion: vi.fn(),
    markEditConflict: vi.fn(),
    reseedSection: vi.fn(),
    pending: [],
    sectionRows: {},
    setSectionRows: vi.fn(),
    ...overrides,
  };
}
