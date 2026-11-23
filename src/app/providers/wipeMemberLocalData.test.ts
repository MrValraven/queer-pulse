import { beforeEach, describe, expect, it } from "vitest";
import {
  adoptConfirmedMember,
  wipeEveryScopeMessagingDrafts,
  wipeFixedKeyMemberStores,
  wipeMemberLocalData,
} from "./wipeMemberLocalData";

/** SEC-46/49/51 and the I-5/I-9 rulings: what each wipe forgets. */
const LAST_MEMBER_KEY = "qp.auth.last-member";
const FIXED_TEXT_KEYS = [
  "qp-story-draft-v1",
  "qp:search:recents",
  "qp.economy.issuer",
] as const;
const OTHER_MEMBER_KEYS = [
  "qp.drafts.v1",
  "qp.drafts.v1.u.member-a",
  "qp.saved.v1",
  "qp.saved.v1.u.member-a",
  "qp.vouches.v1",
  "qp.vouches.v1.u.member-a",
  "qp-postjob-draft",
  "qp.economy.setAsidePot",
  "qp.economy.ivaEntries",
  "qp.economy.rateBoard",
  "qp-badges-story-notes",
  "qp.forum.draft.fields.draft-1",
  "qp.forum.draft.fields.draft-2.u.member-a",
] as const;

function seed(keys: ReadonlyArray<string>): void {
  for (const key of keys) window.localStorage.setItem(key, '"kept"');
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("wipeMemberLocalData", () => {
  it("forgets the fixed-key and per-draft stores and the last member", () => {
    seed([...FIXED_TEXT_KEYS, ...OTHER_MEMBER_KEYS, LAST_MEMBER_KEY]);
    window.localStorage.setItem("qp-employer-affiliation", '"demo"');

    wipeMemberLocalData("member-a");

    for (const key of [...FIXED_TEXT_KEYS, ...OTHER_MEMBER_KEYS]) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(window.localStorage.getItem(LAST_MEMBER_KEY)).toBeNull();
    expect(window.localStorage.getItem("qp-employer-affiliation")).toBe(
      '"demo"',
    );
  });

  it("leaves another scope's DM drafts to the bucket match", () => {
    seed(["qp.messages.drafts.v1.u.member-b"]);

    wipeMemberLocalData("member-a");

    expect(
      window.localStorage.getItem("qp.messages.drafts.v1.u.member-b"),
    ).toBe('"kept"');
  });
});

describe("wipeFixedKeyMemberStores", () => {
  it("forgets the story draft, recents and issuer only", () => {
    seed([...FIXED_TEXT_KEYS, "qp.drafts.v1"]);

    wipeFixedKeyMemberStores();

    for (const key of FIXED_TEXT_KEYS) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(window.localStorage.getItem("qp.drafts.v1")).toBe('"kept"');
  });
});

describe("wipeEveryScopeMessagingDrafts", () => {
  it("forgets DM drafts and outbox for every scope", () => {
    const messagingKeys = [
      "qp.messages.drafts.v1",
      "qp.messages.drafts.v1.u.member-a",
      "qp.messages.outbox.v1.u.member-b",
    ];
    seed(messagingKeys);

    wipeEveryScopeMessagingDrafts();

    for (const key of messagingKeys) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
  });
});

describe("adoptConfirmedMember", () => {
  it("keeps the same member's traces", () => {
    window.localStorage.setItem(LAST_MEMBER_KEY, "member-a");
    seed(FIXED_TEXT_KEYS);

    adoptConfirmedMember("member-a");

    expect(window.localStorage.getItem("qp-story-draft-v1")).toBe('"kept"');
    expect(window.localStorage.getItem(LAST_MEMBER_KEY)).toBe("member-a");
  });

  it("wipes the previous member's traces when another member is confirmed", () => {
    window.localStorage.setItem(LAST_MEMBER_KEY, "member-a");
    seed([...FIXED_TEXT_KEYS, "qp.messages.drafts.v1.u.member-a"]);

    adoptConfirmedMember("member-b");

    for (const key of FIXED_TEXT_KEYS) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(
      window.localStorage.getItem("qp.messages.drafts.v1.u.member-a"),
    ).toBeNull();
    expect(window.localStorage.getItem(LAST_MEMBER_KEY)).toBe("member-b");
  });
});
