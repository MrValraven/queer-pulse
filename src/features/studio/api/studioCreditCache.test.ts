import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { toPersonaRefView } from "./studio.adapters";
import {
  inboxAfterAccept,
  inboxWithout,
  isSettledCreditError,
  withOwnerRow,
  withoutOwnerRow,
} from "./studioCreditCache";
import type {
  StudioCreditInboxRowView,
  StudioPersonaCreditOwnerRowView,
} from "./studioDiscovery.adapters";

const grain = toPersonaRefView({
  id: "sp-grain",
  handle: "grain-studio",
  name: "GRAIN",
  kind: "visual_artist",
  avatarUrl: null,
  isListenable: false,
});

const request: StudioCreditInboxRowView = {
  id: "credit-1",
  role: "cover-art",
  roleLabelKey: "studio:credits.role.coverArt",
  status: "pending",
  requestingPersona: grain,
  creditedPersona: grain,
  track: { id: "track-1", title: "Tide", href: "/studio/track?id=track-1" },
  release: {
    id: "release-1",
    title: "Salt water",
    coverUrl: null,
    tint: "coral",
    href: "/studio/album?id=release-1",
  },
  createdAt: "2026-10-10T10:00:00.000Z",
  respondedAt: null,
};

describe("owner rows", () => {
  it("appends a new pending row and drops a removed one", () => {
    const row: StudioPersonaCreditOwnerRowView = {
      id: "credit-2",
      persona: grain,
      role: "cover-art",
      roleLabelKey: "studio:credits.role.coverArt",
      status: "pending",
      statusLabelKey: "studio:credits.status.pending",
      isPersonaPublic: true,
      createdAt: "2026-10-13T10:00:00.000Z",
    };
    const rows = withOwnerRow([], row);
    expect(rows).toEqual([row]);
    expect(withOwnerRow(rows, row)).toHaveLength(1);
    expect(withoutOwnerRow(rows, row.id)).toEqual([]);
  });
});

describe("inbox", () => {
  it("moves an accepted request to the top of Accepted", () => {
    const accepted: StudioCreditInboxRowView = {
      ...request,
      status: "accepted",
      respondedAt: "2026-10-13T10:00:00.000Z",
    };
    const inbox = inboxAfterAccept(
      { requests: [request], accepted: [] },
      accepted,
    );
    expect(inbox.requests).toEqual([]);
    expect(inbox.accepted[0]).toMatchObject({
      id: "credit-1",
      status: "accepted",
      respondedAt: "2026-10-13T10:00:00.000Z",
    });
    expect(inboxWithout(inbox, "credit-1").accepted).toEqual([]);
  });

  it("treats a missing or already settled credit as settled", () => {
    expect(isSettledCreditError(new ApiError(404, "Not found"))).toBe(true);
    expect(
      isSettledCreditError(
        new ApiError(409, "Conflict", { code: "studio_credit_not_pending" }),
      ),
    ).toBe(true);
    expect(
      isSettledCreditError(
        new ApiError(409, "Conflict", { code: "studio_credit_limit" }),
      ),
    ).toBe(false);
    expect(isSettledCreditError(new Error("offline"))).toBe(false);
  });
});
