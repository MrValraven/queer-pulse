import { describe, expect, it } from "vitest";
import {
  threadDraftSnapshotFromMeta,
  threadDraftSnapshotToMeta,
  type ForumThreadDraftSnapshot,
} from "./forumDraftSnapshot";

const SNAPSHOT: ForumThreadDraftSnapshot = {
  title: "A call",
  category: "funding",
  communitySlug: "",
  tags: [],
  imageKey: null,
  imagePreviewUrl: null,
  kind: "call",
  fundingFields: [
    "https://example.org/x",
    "Maré",
    "",
    "2000",
    "2026-11-30T17:00",
    "",
    "eu",
    "",
    "",
    "",
    "",
    "students",
  ],
};

describe("draft snapshot funding fields", () => {
  it("round-trips through the server's meta bag", () => {
    const meta = threadDraftSnapshotToMeta(SNAPSHOT);
    expect(threadDraftSnapshotFromMeta(meta)?.fundingFields).toEqual(
      SNAPSHOT.fundingFields,
    );
  });

  it("stays inside the bag's 32-key limit", () => {
    expect(
      Object.keys(threadDraftSnapshotToMeta(SNAPSHOT)).length,
    ).toBeLessThanOrEqual(32);
  });

  it("reads a bag written before the field existed as no funding", () => {
    const { fundingFields: _fundingFields, ...meta } =
      threadDraftSnapshotToMeta(SNAPSHOT);
    expect(threadDraftSnapshotFromMeta(meta)?.fundingFields ?? null).toBeNull();
  });
});
