import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  demoCreatePersonaPost,
  demoDeletePersonaPost,
  demoOwnImageUrl,
  demoPersonaPostsPage,
  demoRemovePersonaPostByStaff,
  demoUpdatePersonaPost,
} from "../data/personaPostsDemo";
import { usePersonaPosts } from "./usePersonaPosts";
import {
  useCreatePersonaPost,
  useDeletePersonaPost,
  useUpdatePersonaPost,
} from "./usePersonaPostMutations";
import { deletePersonaPost, updatePersonaPost } from "./personaPosts.api";
import type { PersonaPostDTO } from "./personaPosts.types";

const demoState = vi.hoisted(() => ({ demoMode: true }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoState.demoMode }),
}));

const LIVE_POST: PersonaPostDTO = vi.hoisted(() => ({
  id: "live-post-1",
  body: "Soundcheck at six",
  linkUrl: null,
  imageUrl: "https://cdn.example.org/personas/p-1/live-post-1.jpg",
  createdAt: "2026-10-12T10:00:00.000Z",
  editedAt: null,
  canEdit: true,
}));

vi.mock("./personaPosts.api", () => ({
  getPersonaPosts: vi.fn(() =>
    Promise.resolve({
      items: [LIVE_POST],
      pageInfo: { nextCursor: null, hasMore: false },
    }),
  ),
  createPersonaPost: vi.fn(),
  updatePersonaPost: vi.fn((postId: string, body: { body?: string }) =>
    Promise.resolve({
      ...LIVE_POST,
      id: postId,
      body: body.body ?? LIVE_POST.body,
      editedAt: "2026-10-13T10:00:00.000Z",
    }),
  ),
  deletePersonaPost: vi.fn(),
}));

const MARIANA = "demo-persona-mariana-sol";
const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "revokeObjectURL",
);

/** Puts a URL static back as jsdom had it (jsdom has none of the two). */
function restoreUrlStatic(
  name: "createObjectURL" | "revokeObjectURL",
  original: PropertyDescriptor | undefined,
) {
  if (original) Object.defineProperty(URL, name, original);
  else Reflect.deleteProperty(URL, name);
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
}

afterEach(() => {
  demoState.demoMode = true;
  vi.mocked(updatePersonaPost).mockClear();
  vi.mocked(deletePersonaPost).mockReset();
  vi.unstubAllGlobals();
  restoreUrlStatic("createObjectURL", originalCreateObjectURL);
  restoreUrlStatic("revokeObjectURL", originalRevokeObjectURL);
});

/** Stubs the blob read and the copy the demo store makes of a picked photo. */
function stubBlobCopy() {
  const picked = new Blob(["photo"], { type: "image/jpeg" });
  const fetchBlob = vi.fn(() =>
    Promise.resolve({ blob: () => Promise.resolve(picked) }),
  );
  vi.stubGlobal("fetch", fetchBlob);
  let copyCount = 0;
  const createObjectURL = vi.fn<(object: Blob) => string>(() => {
    copyCount += 1;
    return `blob:http://localhost/store-copy-${copyCount}`;
  });
  const revokeObjectURL = vi.fn<(url: string) => void>();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: revokeObjectURL,
  });
  return { fetchBlob, createObjectURL, revokeObjectURL };
}

describe("demo persona post store", () => {
  const PERSONA = "demo-persona-store-test";

  it("keeps its own copy of a picked photo on create and on edit", async () => {
    const { fetchBlob, createObjectURL } = stubBlobCopy();
    const created = await demoCreatePersonaPost(PERSONA, {
      body: "New flyer",
      imageKey: "blob:http://localhost/picked-1",
    });
    expect(fetchBlob).toHaveBeenCalledWith("blob:http://localhost/picked-1");
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createObjectURL.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
    expect(created.imageUrl).toBe("blob:http://localhost/store-copy-1");
    const edited = await demoUpdatePersonaPost(created.id, {
      imageKey: "blob:http://localhost/picked-2",
    });
    expect(fetchBlob).toHaveBeenCalledWith("blob:http://localhost/picked-2");
    expect(edited.imageUrl).toBe("blob:http://localhost/store-copy-2");
  });

  it("revokes its own copy when an edit replaces or clears the photo and when the post leaves", async () => {
    const { revokeObjectURL } = stubBlobCopy();
    const created = await demoCreatePersonaPost(PERSONA, {
      body: "Flyer one",
      imageKey: "blob:http://localhost/picked-a",
    });
    await demoUpdatePersonaPost(created.id, {
      imageKey: "blob:http://localhost/picked-b",
    });
    expect(revokeObjectURL).toHaveBeenLastCalledWith(
      "blob:http://localhost/store-copy-1",
    );
    await demoUpdatePersonaPost(created.id, { imageKey: null });
    expect(revokeObjectURL).toHaveBeenLastCalledWith(
      "blob:http://localhost/store-copy-2",
    );
    const deleted = await demoCreatePersonaPost(PERSONA, {
      body: "Flyer two",
      imageKey: "blob:http://localhost/picked-c",
    });
    demoDeletePersonaPost(deleted.id);
    expect(revokeObjectURL).toHaveBeenLastCalledWith(
      "blob:http://localhost/store-copy-3",
    );
    const removed = await demoCreatePersonaPost(PERSONA, {
      body: "Flyer three",
      imageKey: "blob:http://localhost/picked-d",
    });
    demoRemovePersonaPostByStaff(removed.id);
    expect(revokeObjectURL).toHaveBeenLastCalledWith(
      "blob:http://localhost/store-copy-4",
    );
    expect(revokeObjectURL).toHaveBeenCalledTimes(4);
  });

  it("revokes no URL it did not make", async () => {
    const { revokeObjectURL } = stubBlobCopy();
    const created = await demoCreatePersonaPost(PERSONA, {
      body: "Poster",
      imageKey: "https://cdn.example.org/poster-two.jpg",
    });
    demoDeletePersonaPost(created.id);
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it("keeps the picked key when the blob can no longer be read", async () => {
    const { createObjectURL } = stubBlobCopy();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );
    await expect(
      demoOwnImageUrl("blob:http://localhost/revoked"),
    ).resolves.toBe("blob:http://localhost/revoked");
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("passes a key that is no blob URL through untouched", async () => {
    const { fetchBlob } = stubBlobCopy();
    const created = await demoCreatePersonaPost(PERSONA, {
      body: "Poster up",
      imageKey: "https://cdn.example.org/poster.jpg",
    });
    expect(fetchBlob).not.toHaveBeenCalled();
    expect(created.imageUrl).toBe("https://cdn.example.org/poster.jpg");
  });

  it("refuses a body or a link over the server's limits with a 400", async () => {
    await expect(
      demoCreatePersonaPost(PERSONA, { body: "x".repeat(501) }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      demoCreatePersonaPost(PERSONA, { body: "   " }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      demoCreatePersonaPost(PERSONA, {
        body: "Tickets",
        linkUrl: `https://example.org/${"a".repeat(1000)}`,
      }),
    ).rejects.toMatchObject({ status: 400 });
    const created = await demoCreatePersonaPost(PERSONA, {
      body: "x".repeat(500),
    });
    await expect(
      demoUpdatePersonaPost(created.id, { body: "y".repeat(501) }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("takes a post removed by staff out of the persona's pages", async () => {
    const created = await demoCreatePersonaPost(PERSONA, { body: "Reported" });
    demoRemovePersonaPostByStaff(created.id);
    expect(
      demoPersonaPostsPage(PERSONA, null).items.map((post) => post.id),
    ).not.toContain(created.id);
  });
});

describe("persona post writes (demo)", () => {
  it("adds a new post at the top, edits it and deletes it", async () => {
    const { wrapper } = setup();
    const posts = renderHook(() => usePersonaPosts(MARIANA), { wrapper });
    await waitFor(() => expect(posts.result.current.hasLoaded).toBe(true));
    const before = posts.result.current.posts.length;
    const create = renderHook(() => useCreatePersonaPost(MARIANA), { wrapper });
    const created = await act(() =>
      create.result.current.mutateAsync({ body: "Rehearsal tonight" }),
    );
    expect(posts.result.current.posts[0]?.id).toBe(created.id);
    expect(posts.result.current.posts).toHaveLength(before + 1);
    const update = renderHook(() => useUpdatePersonaPost(MARIANA), { wrapper });
    await act(() =>
      update.result.current.mutateAsync({
        postId: created.id,
        body: { body: "Rehearsal moved to Thursday" },
      }),
    );
    expect(posts.result.current.posts[0]?.body).toBe(
      "Rehearsal moved to Thursday",
    );
    expect(posts.result.current.posts[0]?.isEdited).toBe(true);
    const remove = renderHook(() => useDeletePersonaPost(MARIANA), { wrapper });
    await act(() => remove.result.current.mutateAsync({ postId: created.id }));
    expect(posts.result.current.posts).toHaveLength(before);
  });

  it("leaves a post unedited when the edit changes nothing", async () => {
    const { wrapper } = setup();
    const posts = renderHook(() => usePersonaPosts(MARIANA), { wrapper });
    await waitFor(() => expect(posts.result.current.hasLoaded).toBe(true));
    const target = posts.result.current.posts.find((post) => !post.isEdited);
    expect(target).toBeDefined();
    const update = renderHook(() => useUpdatePersonaPost(MARIANA), { wrapper });
    const result = await act(() =>
      update.result.current.mutateAsync({ postId: target?.id ?? "", body: {} }),
    );
    expect(result.isEdited).toBe(false);
    expect(result.editedAt).toBeNull();
    expect(
      posts.result.current.posts.find((post) => post.id === target?.id)
        ?.isEdited,
    ).toBe(false);
  });

  it("pages NIGHTFORM's posts four at a time", async () => {
    const { wrapper } = setup();
    const posts = renderHook(() => usePersonaPosts("sp-diogo-nightform"), {
      wrapper,
    });
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(4));
    expect(posts.result.current.hasMore).toBe(true);
    await act(() => posts.result.current.fetchNextPage());
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(6));
    expect(posts.result.current.hasMore).toBe(false);
  });

  it("loads the next page with no repeated post after a new one lands on top", async () => {
    const { wrapper } = setup();
    const nightform = "sp-diogo-nightform";
    const posts = renderHook(() => usePersonaPosts(nightform), { wrapper });
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(4));
    const create = renderHook(() => useCreatePersonaPost(nightform), {
      wrapper,
    });
    const created = await act(() =>
      create.result.current.mutateAsync({ body: "soundcheck in ten" }),
    );
    expect(posts.result.current.posts[0]?.id).toBe(created.id);
    await act(() => posts.result.current.fetchNextPage());
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(7));
    const ids = posts.result.current.posts.map((post) => post.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(posts.result.current.hasMore).toBe(false);
    const remove = renderHook(() => useDeletePersonaPost(nightform), {
      wrapper,
    });
    await act(() => remove.result.current.mutateAsync({ postId: created.id }));
  });
});

describe("persona post edits (live)", () => {
  it("sends no request for an edit with no changed field", async () => {
    demoState.demoMode = false;
    const { wrapper } = setup();
    const posts = renderHook(() => usePersonaPosts("p-live"), { wrapper });
    await waitFor(() => expect(posts.result.current.hasLoaded).toBe(true));
    const update = renderHook(() => useUpdatePersonaPost("p-live"), {
      wrapper,
    });
    const result = await act(() =>
      update.result.current.mutateAsync({ postId: LIVE_POST.id, body: {} }),
    );
    expect(updatePersonaPost).not.toHaveBeenCalled();
    expect(result.id).toBe(LIVE_POST.id);
    expect(result.isEdited).toBe(false);
  });

  it("sends a changed field and keeps the photo by leaving imageKey out", async () => {
    demoState.demoMode = false;
    const { wrapper } = setup();
    const posts = renderHook(() => usePersonaPosts("p-live"), { wrapper });
    await waitFor(() => expect(posts.result.current.hasLoaded).toBe(true));
    const update = renderHook(() => useUpdatePersonaPost("p-live"), {
      wrapper,
    });
    await act(() =>
      update.result.current.mutateAsync({
        postId: LIVE_POST.id,
        body: { body: "Soundcheck at seven" },
      }),
    );
    expect(updatePersonaPost).toHaveBeenCalledWith(LIVE_POST.id, {
      body: "Soundcheck at seven",
    });
    expect(posts.result.current.posts[0]?.body).toBe("Soundcheck at seven");
    expect(posts.result.current.posts[0]?.imageUrl).toBe(LIVE_POST.imageUrl);
  });

  it("drops a post from the list when its delete answers 404", async () => {
    demoState.demoMode = false;
    vi.mocked(deletePersonaPost).mockRejectedValue(
      new ApiError(404, "not_found", { code: "not_found" }),
    );
    const { wrapper } = setup();
    const posts = renderHook(() => usePersonaPosts("p-live"), { wrapper });
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(1));
    const remove = renderHook(() => useDeletePersonaPost("p-live"), {
      wrapper,
    });
    await act(async () => {
      await expect(
        remove.result.current.mutateAsync({ postId: LIVE_POST.id }),
      ).rejects.toBeInstanceOf(ApiError);
    });
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(0));
  });

  it("drops a post from the list when its edit answers 404", async () => {
    demoState.demoMode = false;
    vi.mocked(updatePersonaPost).mockRejectedValueOnce(
      new ApiError(404, "not_found", { code: "not_found" }),
    );
    const { wrapper } = setup();
    const posts = renderHook(() => usePersonaPosts("p-live"), { wrapper });
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(1));
    const update = renderHook(() => useUpdatePersonaPost("p-live"), {
      wrapper,
    });
    await act(async () => {
      await expect(
        update.result.current.mutateAsync({
          postId: LIVE_POST.id,
          body: { body: "Soundcheck at nine" },
        }),
      ).rejects.toBeInstanceOf(ApiError);
    });
    await waitFor(() => expect(posts.result.current.posts).toHaveLength(0));
  });
});
