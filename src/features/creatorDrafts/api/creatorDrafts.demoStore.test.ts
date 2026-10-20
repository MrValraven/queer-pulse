import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  creatorDraftErrorCode,
  readCreatorDraftConflict,
} from "./creatorDrafts.api";
import {
  clearCreatorDraftDemoStore,
  demoGetCreatorDraft,
  demoSaveCreatorDraft,
} from "./creatorDrafts.demoStore";

describe("creator draft demo store", () => {
  const eventSlot = { kind: "event", listingRef: null } as const;
  const body = (baseRevision: number | null) => ({
    payload: { title: "Picnic" },
    payloadVersion: 1,
    baseRevision,
    progress: null,
    missing: null,
  });

  beforeEach(() => {
    clearCreatorDraftDemoStore();
  });

  it("inserts on an empty slot and raises the revision on each save", async () => {
    await expect(
      demoSaveCreatorDraft(eventSlot, body(null)),
    ).resolves.toMatchObject({
      revision: 1,
    });
    await expect(
      demoSaveCreatorDraft(eventSlot, body(1)),
    ).resolves.toMatchObject({ revision: 2 });
    await expect(demoGetCreatorDraft(eventSlot)).resolves.toMatchObject({
      revision: 2,
      payload: { title: "Picnic" },
    });
  });

  it("answers a stale revision with the live 409 shape and writes nothing", async () => {
    await demoSaveCreatorDraft(eventSlot, body(null));
    const error = await demoSaveCreatorDraft(eventSlot, body(null)).catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect(readCreatorDraftConflict(error)).toMatchObject({ revision: 1 });
    await expect(demoGetCreatorDraft(eventSlot)).resolves.toMatchObject({
      revision: 1,
    });
  });

  it("answers a revision on an empty slot with a null-revision 409", async () => {
    const error = await demoSaveCreatorDraft(eventSlot, body(4)).catch(
      (caught: unknown) => caught,
    );
    expect((error as ApiError).status).toBe(409);
    expect(readCreatorDraftConflict(error)).toEqual({
      revision: null,
      savedAt: null,
    });
    await expect(
      demoSaveCreatorDraft(eventSlot, body(null)),
    ).resolves.toMatchObject({
      revision: 1,
    });
  });

  it("answers an oversized payload with a 413", async () => {
    const large = { ...body(null), payload: { text: "a".repeat(96 * 1024) } };
    const error = await demoSaveCreatorDraft(eventSlot, large).catch(
      (caught: unknown) => caught,
    );
    expect(creatorDraftErrorCode(error)).toBe("creator_draft_too_large");
  });

  it("keeps listing slots apart by ref and empties on clear", async () => {
    await demoSaveCreatorDraft(
      { kind: "listing_edit", listingRef: "a" },
      body(null),
    );
    await expect(
      demoGetCreatorDraft({ kind: "listing_edit", listingRef: "b" }),
    ).resolves.toBeNull();
    clearCreatorDraftDemoStore();
    await expect(
      demoGetCreatorDraft({ kind: "listing_edit", listingRef: "a" }),
    ).resolves.toBeNull();
  });

  it("returns copies so a caller edit never changes the stored draft", async () => {
    await demoSaveCreatorDraft(eventSlot, body(null));
    const read = await demoGetCreatorDraft(eventSlot);
    (read?.payload as { title: string }).title = "Changed";
    await expect(demoGetCreatorDraft(eventSlot)).resolves.toMatchObject({
      payload: { title: "Picnic" },
    });
  });
});
