import { describe, expect, it } from "vitest";
import { shouldSeedLateServerDraft } from "./drafts";

/**
 * The pure precedence check behind `Composer.tsx`'s late-server-draft seed
 * (SOC-16/ENG-253): a cross-device server draft can resolve AFTER a composer
 * has already mounted, since `useMessagesController` fetches it from a
 * separate, slower `GET /conversations/:id` detail call. These cases cover
 * the decision function in isolation; `Composer.lateServerDraftSeed.test.tsx`
 * covers the effect actually wiring it into the mounted component.
 */

const baseline = {
  hasAlreadySeeded: false,
  hasMemberTyped: false,
  currentDraft: "",
  serverDraft: "hello from another device",
};

describe("shouldSeedLateServerDraft: seeds an untouched, empty, unseeded composer", () => {
  it("seeds when nothing has been typed, nothing local exists, and a server draft is present", () => {
    expect(shouldSeedLateServerDraft(baseline)).toBe(true);
  });
});

describe("shouldSeedLateServerDraft: never clobbers typing", () => {
  it("discards a late server draft once the member has typed anything at all, even if the field reads empty again", () => {
    expect(
      shouldSeedLateServerDraft({
        ...baseline,
        hasMemberTyped: true,
        currentDraft: "", // typed, then deleted back to empty
      }),
    ).toBe(false);
  });

  it("discards while the member's own typed text is still in the field", () => {
    expect(
      shouldSeedLateServerDraft({
        ...baseline,
        hasMemberTyped: true,
        currentDraft: "still typing this",
      }),
    ).toBe(false);
  });
});

describe("shouldSeedLateServerDraft: a local draft keeps winning over a late server draft", () => {
  it("discards when the composer's current text is non-empty (the mount-time local-first seed already applied)", () => {
    expect(
      shouldSeedLateServerDraft({
        ...baseline,
        hasMemberTyped: false,
        currentDraft: "device's own local draft",
      }),
    ).toBe(false);
  });
});

describe("shouldSeedLateServerDraft: applies at most once per thread", () => {
  it("discards once a late seed has already been applied, even though nothing else has changed", () => {
    expect(
      shouldSeedLateServerDraft({
        ...baseline,
        hasAlreadySeeded: true,
      }),
    ).toBe(false);
  });

  it("discards a second, different server draft after the first one was already applied", () => {
    expect(
      shouldSeedLateServerDraft({
        hasAlreadySeeded: true,
        hasMemberTyped: false,
        currentDraft: "hello from another device",
        serverDraft: "an even newer draft from a third device",
      }),
    ).toBe(false);
  });
});

describe("shouldSeedLateServerDraft: nothing to seed", () => {
  it("discards when the server has no draft to offer (null)", () => {
    expect(shouldSeedLateServerDraft({ ...baseline, serverDraft: null })).toBe(
      false,
    );
  });

  it("discards when the server has no draft to offer (undefined)", () => {
    expect(
      shouldSeedLateServerDraft({ ...baseline, serverDraft: undefined }),
    ).toBe(false);
  });

  it("discards when the server draft is an empty string", () => {
    expect(shouldSeedLateServerDraft({ ...baseline, serverDraft: "" })).toBe(
      false,
    );
  });
});
