import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { usePieceMessages } from "./usePieceMessages";

/**
 * Regression test for the writer workspace's demo thread:
 * `EditorMessageCard.tsx` / `MessageEditorModal.tsx`
 * read this hook by the writer's ASSIGNMENT id (the piece id is the desk
 * peek's own key), and `pieceMessages.data.ts` aliases the two demo
 * assignments to their own piece's thread (`a1` -> `p1`, `a2` -> `p4`,
 * empty). This broke silently once already (an earlier pass re-keyed the
 * fixture by piece id alone and emptied "From your editor" on the writer
 * workspace); this test exists so a third recurrence fails a test run
 * instead of only a manual review.
 */
describe("usePieceMessages demo mode: writer assignment aliases", () => {
  it("resolves assignment a1 to the same thread as piece p1", async () => {
    const { result: byAssignment } = renderHook(
      () => usePieceMessages("a1", "writer"),
      { wrapper: TestProviders },
    );
    const { result: byPiece } = renderHook(
      () => usePieceMessages("p1", "editor"),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(byAssignment.current.isLoading).toBe(false));
    await waitFor(() => expect(byPiece.current.isLoading).toBe(false));

    // Same seeded thread either way: id, author and body agree. `fromMe`
    // flips with `side` by design, so the comparison sticks to the parts
    // that name the conversation itself.
    expect(byAssignment.current.messages.length).toBeGreaterThan(0);
    expect(
      byAssignment.current.messages.map(({ id, author, body }) => ({
        id,
        author,
        body,
      })),
    ).toEqual(
      byPiece.current.messages.map(({ id, author, body }) => ({
        id,
        author,
        body,
      })),
    );
  });

  it("resolves assignment a2 (piece p4, which has no seeded thread) to an empty thread", async () => {
    const { result } = renderHook(() => usePieceMessages("a2", "writer"), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages).toEqual([]);
  });

  it("resolves a piece id the demo fixture has never seen to an empty thread", async () => {
    const { result } = renderHook(
      () => usePieceMessages("p-does-not-exist", "editor"),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages).toEqual([]);
  });
});
