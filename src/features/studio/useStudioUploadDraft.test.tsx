import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toReleaseView, type StudioReleaseView } from "./api/studio.adapters";
import { useStudioUploadDraft } from "./useStudioUploadDraft";

const updateMutate = vi.fn();
const updateMutateAsync = vi.fn();
let shownRelease: StudioReleaseView | null = null;

vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({ uploadablePersonas: [] }),
}));
vi.mock("./api/useStudioRelease", () => ({
  useStudioRelease: () => ({ release: shownRelease, loadState: null }),
}));
vi.mock("./api/useStudioReleaseMutations", () => ({
  useCreateStudioRelease: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateStudioRelease: () => ({
    mutate: updateMutate,
    mutateAsync: updateMutateAsync,
    isPending: false,
  }),
}));
// Autosave fires on the settled form; here every form is settled at once.
vi.mock("../../shared/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <Value,>(value: Value) => value,
}));

const draft = toReleaseView({
  id: "r1",
  title: "Night bus",
  type: "mix",
  coverUrl: "https://files.example/cover.webp",
  releasedOn: null,
  trackCount: 1,
  totalDurationSeconds: 200,
  artist: {
    id: "p1",
    handle: "lechat",
    name: "LeChat",
    kind: "dj",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  mood: null,
  scene: null,
  status: "draft",
  publishedAt: null,
  tracks: [],
  isOwner: true,
  rightsConfirmedAt: "2026-10-08T10:00:00.000Z",
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
});

// Scheduling filled the empty date with the Lisbon day of publishAt.
const scheduled: StudioReleaseView = {
  ...draft,
  status: "scheduled",
  isUpcoming: true,
  publishAt: "2026-10-20T17:00:00.000Z",
  releasedOn: "2026-10-20",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={["/studio/upload?release=r1"]}>
    {children}
  </MemoryRouter>
);

const sentReleasedOn = (mock: typeof updateMutate) =>
  mock.mock.calls.some(
    ([variables]) => "releasedOn" in (variables as { body: object }).body,
  );

beforeEach(() => {
  updateMutate.mockReset();
  updateMutateAsync.mockReset();
  updateMutateAsync.mockResolvedValue(undefined);
});

describe("useStudioUploadDraft release date", () => {
  it("follows the date scheduling filled, so Continue sends no empty date", async () => {
    shownRelease = draft;
    const { result, rerender } = renderHook(() => useStudioUploadDraft(), {
      wrapper,
    });
    expect(result.current.form.releasedOn).toBe("");
    shownRelease = scheduled;
    rerender();
    expect(result.current.form.releasedOn).toBe("2026-10-20");
    // A real edit, so Continue does send a PATCH: only the title goes.
    act(() => result.current.setField("title", "Night bus, side B"));
    await act(() => result.current.continueToTracks());
    expect(updateMutateAsync).toHaveBeenCalledTimes(1);
    expect(updateMutateAsync).toHaveBeenCalledWith({
      releaseId: "r1",
      body: { title: "Night bus, side B" },
    });
    expect(sentReleasedOn(updateMutateAsync)).toBe(false);
  });

  it("clears the filled date after Cancel schedule, and autosave sends no old date", () => {
    shownRelease = scheduled;
    const { result, rerender } = renderHook(() => useStudioUploadDraft(), {
      wrapper,
    });
    expect(result.current.form.releasedOn).toBe("2026-10-20");
    shownRelease = {
      ...scheduled,
      status: "draft",
      isUpcoming: false,
      publishAt: null,
      releasedOn: null,
    };
    rerender();
    expect(result.current.form.releasedOn).toBe("");
    // The next edit autosaves the draft: only the title goes.
    act(() => result.current.setField("title", "Night bus, side B"));
    expect(updateMutate).toHaveBeenCalledWith(
      { releaseId: "r1", body: { title: "Night bus, side B" } },
      expect.anything(),
    );
    expect(sentReleasedOn(updateMutate)).toBe(false);
  });

  it("keeps a date the member typed when the saved one moves", () => {
    shownRelease = { ...draft, status: "scheduled", isUpcoming: true };
    const { result, rerender } = renderHook(() => useStudioUploadDraft(), {
      wrapper,
    });
    act(() => result.current.setField("releasedOn", "2026-11-01"));
    shownRelease = scheduled;
    rerender();
    expect(result.current.form.releasedOn).toBe("2026-11-01");
  });
});
