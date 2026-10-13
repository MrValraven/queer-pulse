import { describe, expect, it } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import type { GatheringDetail } from "./data";
import { editedSectionKeys, resetSection } from "./editDetailsChanges";
import {
  applyEditDraft,
  editDraftFromState,
  guestCommunityChangesFor,
  liveInitialState,
  liveStateKeepingGuests,
  type GatheringState,
} from "./manageGatheringState";

const t: TFunction = (key) => key;
const fmt = createFormatters("en-GB");

const joined: GuestCommunityDraftEntry = {
  slug: "trans-hub",
  name: "Trans & Non-Binary Hub",
  accessTier: "request",
  status: "accepted",
};
const invited: GuestCommunityDraftEntry = {
  slug: "rainbow-arts",
  name: "Rainbow Arts Collective",
  accessTier: "request",
  status: "pending",
};
const added: GuestCommunityDraftEntry = {
  slug: "queer-elders",
  name: "Queer Elders",
  accessTier: "public",
  status: "unsent",
};

const gathering = {
  slug: "end-of-month-run",
  title: "End-of-Month Run",
  body: "A flat, friendly 5K.",
  date: new Date("2026-11-01T09:00:00"),
  hood: "Tejo path",
  communitySlug: "queer-runners",
} as unknown as GatheringDetail;

function savedState(): GatheringState {
  return {
    ...liveInitialState(gathering, fmt, t),
    guestCommunities: [joined, invited],
  };
}

describe("guest communities in the edit modal", () => {
  it("opens on the saved guest list", () => {
    expect(editDraftFromState(savedState()).guestCommunities).toEqual([
      joined,
      invited,
    ]);
  });

  it("lights the audience section when a guest is added and puts it back on Undo section changes", () => {
    const openedDraft = editDraftFromState(savedState());
    const draft = {
      ...openedDraft,
      guestCommunities: [joined, invited, added],
    };
    expect(editedSectionKeys(draft, openedDraft)).toEqual(["audience"]);
    const undone = resetSection(draft, openedDraft, "audience");
    expect(undone.guestCommunities).toEqual([joined, invited]);
    expect(editedSectionKeys(undone, openedDraft)).toEqual([]);
    expect(guestCommunityChangesFor(savedState(), undone)).toEqual({
      invites: [],
      removeSlugs: [],
    });
  });

  it("invites added rows and removes dropped saved rows on Save", () => {
    const draft = {
      ...editDraftFromState(savedState()),
      guestCommunities: [joined, added],
    };
    expect(guestCommunityChangesFor(savedState(), draft)).toEqual({
      invites: [added],
      removeSlugs: ["rainbow-arts"],
    });
  });

  it("sends no removal for a guest the same save made the lead", () => {
    const draft = {
      ...editDraftFromState(savedState()),
      communitySlug: "trans-hub",
      guestCommunities: [invited],
    };
    expect(guestCommunityChangesFor(savedState(), draft)).toEqual({
      invites: [],
      removeSlugs: [],
    });
  });

  it("keeps the guest baseline when the host bar re-reads the detail", () => {
    const refreshed = liveStateKeepingGuests(
      savedState(),
      { ...gathering, title: "Renamed run" },
      fmt,
      t,
    );
    expect(refreshed.title).toBe("Renamed run");
    expect(refreshed.guestCommunities).toEqual([joined, invited]);
  });

  it("opens with no guest list before the saved list answers, and that draft sends no guest change", () => {
    const draft = editDraftFromState(liveInitialState(gathering, fmt, t));
    expect(draft.guestCommunities).toBeUndefined();
    expect(guestCommunityChangesFor(savedState(), draft)).toEqual({
      invites: [],
      removeSlugs: [],
    });
  });

  it("keeps the saved guest list when a saved edit folds into the state", () => {
    const draft = {
      ...editDraftFromState(savedState()),
      title: "Renamed run",
      guestCommunities: [joined, added],
    };
    const folded = applyEditDraft(savedState(), draft, fmt, t);
    expect(folded.title).toBe("Renamed run");
    expect(folded.guestCommunities).toEqual([joined, invited]);
  });
});

describe("guest changes when the saved list refreshes while the modal is open", () => {
  it("sends no change for an untouched list after a refetch brought in a new guest", () => {
    const openedDraft = editDraftFromState(savedState());
    const refreshed: GatheringState = {
      ...savedState(),
      guestCommunities: [joined, invited, { ...added, status: "pending" }],
    };
    const draft = { ...openedDraft, title: "Renamed run" };
    expect(
      guestCommunityChangesFor(refreshed, draft, openedDraft.guestCommunities),
    ).toEqual({ invites: [], removeSlugs: [] });
  });

  it("sends nothing for a removed row a refetch already dropped", () => {
    const openedDraft = editDraftFromState(savedState());
    const refreshed: GatheringState = {
      ...savedState(),
      guestCommunities: [joined],
    };
    const draft = { ...openedDraft, guestCommunities: [joined] };
    expect(
      guestCommunityChangesFor(refreshed, draft, openedDraft.guestCommunities),
    ).toEqual({ invites: [], removeSlugs: [] });
  });

  it("sends no invite for a row a refetch shows as already invited", () => {
    const openedDraft = editDraftFromState(savedState());
    const refreshed: GatheringState = {
      ...savedState(),
      guestCommunities: [joined, invited, { ...added, status: "pending" }],
    };
    const draft = {
      ...openedDraft,
      guestCommunities: [joined, invited, added],
    };
    expect(
      guestCommunityChangesFor(refreshed, draft, openedDraft.guestCommunities),
    ).toEqual({ invites: [], removeSlugs: [] });
  });

  it("still sends the host's own removal of a row the saved list holds", () => {
    const openedDraft = editDraftFromState(savedState());
    const draft = { ...openedDraft, guestCommunities: [joined] };
    expect(
      guestCommunityChangesFor(
        savedState(),
        draft,
        openedDraft.guestCommunities,
      ),
    ).toEqual({ invites: [], removeSlugs: ["rainbow-arts"] });
  });
});
