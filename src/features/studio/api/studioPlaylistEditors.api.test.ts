import { describe, expect, it, vi } from "vitest";
import { ApiError, apiGet } from "../../../shared/api/client";
import {
  getStudioPlaylistEditorCandidates,
  editorsRemovedByCreditChangeOf,
  ineligibleEditorSlugsOf,
} from "./studioPlaylistEditors.api";

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/client")>()),
  apiGet: vi.fn(() => Promise.resolve({ items: [] })),
}));

const refusal = (status: number, body: Record<string, unknown>) =>
  new ApiError(status, "refused", { statusCode: status, ...body });

describe("collaborative playlist error bodies", () => {
  it("reads the slugs a 422 ineligible names", () => {
    expect(
      ineligibleEditorSlugsOf(
        refusal(422, {
          code: "studio_playlist_editor_ineligible",
          memberSlugs: ["anika", 7, "rita"],
        }),
      ),
    ).toEqual(["anika", "rita"]);
    expect(
      ineligibleEditorSlugsOf(
        refusal(409, { code: "studio_playlist_editor_cap" }),
      ),
    ).toEqual([]);
    expect(ineligibleEditorSlugsOf(new Error("offline"))).toEqual([]);
  });

  it("reads the editors a credit change would remove", () => {
    const rita = { slug: "rita", displayName: "Rita Varela", avatarUrl: null };
    expect(
      editorsRemovedByCreditChangeOf(
        refusal(409, {
          code: "studio_playlist_credit_change_removes_editors",
          editors: [rita, { slug: 3 }],
        }),
      ),
    ).toEqual([rita]);
    expect(
      editorsRemovedByCreditChangeOf(
        refusal(409, { code: "studio_playlist_order_mismatch" }),
      ),
    ).toBeNull();
  });
});

describe("collaborative playlist editor candidates", () => {
  it("sends the trimmed search cut to 80 characters", async () => {
    await getStudioPlaylistEditorCandidates("p1", `  ${"a".repeat(120)}  `);
    expect(apiGet).toHaveBeenLastCalledWith(
      expect.stringContaining(`?q=${"a".repeat(80)}`),
    );
    const calledPath = vi.mocked(apiGet).mock.calls.at(-1)?.[0] as string;
    expect(calledPath.endsWith("a".repeat(80))).toBe(true);
  });

  it("sends no query for a blank search", async () => {
    await getStudioPlaylistEditorCandidates("p1", "   ");
    const calledPath = vi.mocked(apiGet).mock.calls.at(-1)?.[0] as string;
    expect(calledPath.includes("?q=")).toBe(false);
  });
});
