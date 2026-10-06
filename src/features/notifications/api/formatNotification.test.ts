import { beforeAll, describe, expect, it } from "vitest";
import {
  catalogs,
  loadNamespace,
  loadPtNamespace,
} from "../../../shared/i18n/catalogs";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import {
  formatNotification,
  type NotificationKind,
} from "./formatNotification";
import { LIFECYCLE_KIND_CATEGORY } from "./notificationKindCopy";

/**
 * The resolved `notifications` catalog per language. EN is eager, but PT's
 * `notifications` namespace is now lazily loaded (see catalogs/index.ts), so
 * `catalogs.pt.notifications` is an empty placeholder until its chunk resolves.
 * `beforeAll` swaps the real PT catalog in the same way the provider does.
 */
const resolvedCatalogs: Record<Language, Catalog> = {
  en: catalogs.en.notifications,
  pt: catalogs.pt.notifications,
};

beforeAll(async () => {
  resolvedCatalogs.en = await loadNamespace("en", "notifications");
  resolvedCatalogs.pt = await loadPtNamespace("notifications");
});

/**
 * A `t` bound to the real catalogs, so these tests fail if a key is missing
 * from `catalogs/<lang>/notifications.ts` rather than passing against a stub.
 * Mirrors the provider's resolution: `namespace:path` → catalog entry.
 */
function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const catalog = resolvedCatalogs[language];
    const hit = resolveEntry(catalog, path, language, options);
    // Surface a miss loudly instead of silently returning the key.
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

const t = makeT("en");

/**
 * `admin_queue_item`'s copy lives in the `admin` namespace rather than
 * `notifications`, the same reason `moderation_queue_alert`'s does (see
 * `moderationQueueAlert.format.test.ts`), so it needs its own `t` bound to
 * that catalog rather than the `t` above.
 */
const resolvedAdminCatalogs: Record<Language, Catalog | undefined> = {
  en: undefined,
  pt: undefined,
};

beforeAll(async () => {
  resolvedAdminCatalogs.en = await loadNamespace("en", "admin");
  resolvedAdminCatalogs.pt = await loadPtNamespace("admin");
});

function makeAdminT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const hit = resolveEntry(
      resolvedAdminCatalogs[language],
      path,
      language,
      options,
    );
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

/** Every kind the notifications centre knows how to render. `new_message` is
 * deliberately absent — DM alerts were retired from the centre (see the
 * "deprecated new_message" test below). */
const KINDS: NotificationKind[] = [
  "connection_request",
  "connection_accepted",
  "vouch_received",
  "promoted_to_member",
  "event_invite",
  "event_reminder",
  "waitlist_promoted",
  "event_cancelled",
  "event_updated",
  "introduction_made",
  "writer_application_approved",
  "writer_application_declined",
  // Account and security (ID-06). Listed with an empty payload on purpose:
  // these three carry interpolated tokens, and the point of including them is
  // that a row missing its payload still reads as a sentence rather than
  // leaving `{deviceLabel}` or `{daysRemaining}` on screen.
  "security_new_sign_in",
  "account_export_ready",
  "account_deletion_final_warning",
  // The two kinds that used to borrow `concern_update`. Also listed with an
  // empty payload: a row missing its `kind`/`reference` must still read as a
  // sentence rather than leaving `{form}` or `{reference}` on screen.
  "intake_reviewed",
  "dsar_resolved",
  // A card nearing expiry (SUS-07). Listed with an empty payload for the same
  // reason: its flat form has to read as a sentence when the row carries
  // neither a day count nor a community name.
  "card_expiring",
  // "Last few spots" (PRD-18). Listed with an empty payload for the same
  // reason as the two above: its flat form has to read as a sentence when the
  // row carries no seat count.
  "event_nearly_full",
  // PRD-31, both halves of a ban-evasion escalation. Listed with an empty
  // payload for the same reason as the rows above: each interpolates the
  // community it is about, and a row whose payload never arrived has to read
  // as a whole sentence rather than leaving `{communityName}` in front of
  // somebody being asked to act.
  "ban_evasion_escalation_raised",
  "ban_evasion_escalation_resolved",
  // PRD-334. Listed with an empty payload and no actor for the same reason: a
  // row missing its `groupTitle` and its adder still has to read as a whole
  // sentence rather than leaving `{groupTitle}` or `{name}` on screen.
  "group_added",
  // Task 13. The three co-manager kinds and `listing_owner_offer` were absent
  // here even though the backend has emitted them for a while, so every row
  // of all four fell through to the unknown-kind fallback. Listed with an
  // empty payload for the same reason as the rows above: each resolves
  // `listingName` and the actor's name defensively, so a row missing both
  // still reads as a whole sentence, naming "this listing" and "Someone"
  // when the payload carries neither.
  "listing_co_manager_invite",
  "listing_co_manager_invite_accepted",
  "listing_co_manager_invite_declined",
  "listing_owner_offer",
  // Task 6, both halves of a community space request decision. Listed with an
  // empty payload for the same reason `ban_evasion_escalation_raised`/
  // `_resolved` are above: each interpolates the community the request was
  // about, and a row whose payload never arrived still has to read as a whole
  // sentence rather than leaving `{communityName}` in front of the requester.
  "community_space_request_approved",
  "community_space_request_declined",
  // The two ambassador lifecycle rows. Listed with an empty payload for the
  // same reason as `community_space_request_approved`/`_declined` above:
  // `ambassador_granted`'s meta line interpolates the focus area, and a row
  // whose payload never arrived still has to read as a whole sentence rather
  // than leaving `{focus}` on screen (see the dedicated `describe` block
  // below for the focus-area branching itself).
  "ambassador_granted",
  "ambassador_revoked",
  // ENG-462, the desk passing on a pitch. Listed with an empty payload for
  // the same reason the piece rows above resolve `title` defensively: a row
  // whose payload never arrived still has to read as a whole sentence, with
  // the shared fallback filling `{title}`.
  "magazine_pitch_passed",
];

describe("formatNotification", () => {
  it.each(KINDS)("renders non-empty text + meta for %s", (kind) => {
    const result = formatNotification(kind, {}, t);
    expect(result.text.trim()).not.toBe("");
    expect(result.meta.trim()).not.toBe("");
    // The whole point: no raw key or enum value leaks into the UI.
    expect(result.text).not.toContain("notifications:");
    expect(result.text).not.toContain(kind);
  });

  it.each(KINDS)("resolves %s in Portuguese too", (kind) => {
    const result = formatNotification(kind, {}, makeT("pt"));
    expect(result.text.trim()).not.toBe("");
    expect(result.meta.trim()).not.toBe("");
  });

  it.each([
    "community_space_request_approved",
    "community_space_request_declined",
  ] as const)(
    "%s reads as a whole sentence without a community name",
    (kind) => {
      const formatted = formatNotification(kind, {}, t);
      expect(formatted.text).not.toMatch(/\{communityName\}/);
    },
  );

  describe("ambassador notifications", () => {
    it("ambassador_granted names the focus area in its meta line for a recognised focus", () => {
      const withFocus = formatNotification(
        "ambassador_granted",
        { focusArea: "trans_health", communitySlug: "queerpulse-ambassadors" },
        t,
      );
      const withoutFocus = formatNotification("ambassador_granted", {}, t);
      // The two must differ: a recognised focus area appends its label, so the
      // row with one is strictly longer than the bare "Ambassador" fallback.
      expect(withFocus.meta).not.toBe(withoutFocus.meta);
      expect(withFocus.meta.length).toBeGreaterThan(withoutFocus.meta.length);
      expect(withFocus.meta).not.toMatch(/\{focus\}/);
    });

    it("ambassador_granted drops the focus clause for a payload with no focus area", () => {
      const result = formatNotification("ambassador_granted", {}, t);
      expect(result.meta.trim()).not.toBe("");
      expect(result.meta).not.toMatch(/\{focus\}/);
    });

    it("ambassador_granted drops the focus clause for a focus area this build has never seen", () => {
      const result = formatNotification(
        "ambassador_granted",
        {
          focusArea: "a_future_focus_area",
          communitySlug: "queerpulse-ambassadors",
        },
        t,
      );
      expect(result.meta.trim()).not.toBe("");
      expect(result.meta).not.toMatch(/\{focus\}/);
      // Same fallback line as the missing-payload case above: an unrecognised
      // value falls back exactly the same way an absent one does, through the
      // translated label alone.
      expect(result.meta).not.toContain("a_future_focus_area");
    });

    it("ambassador_granted's own text never varies with the focus area", () => {
      const withFocus = formatNotification(
        "ambassador_granted",
        { focusArea: "trans_health", communitySlug: "queerpulse-ambassadors" },
        t,
      );
      const withoutFocus = formatNotification("ambassador_granted", {}, t);
      expect(withFocus.text).toBe(withoutFocus.text);
      expect(withFocus.text.trim()).not.toBe("");
    });

    it("ambassador_revoked reads as a flat sentence with no payload at all", () => {
      const result = formatNotification("ambassador_revoked", {}, t);
      expect(result.text.trim()).not.toBe("");
      expect(result.meta.trim()).not.toBe("");
      expect(result.category).toBe("platform");
      expect(result.kind).toBe("ambassador_revoked");
    });

    it("both ambassador kinds resolve to the platform tab", () => {
      expect(formatNotification("ambassador_granted", {}, t).category).toBe(
        "platform",
      );
      expect(formatNotification("ambassador_revoked", {}, t).category).toBe(
        "platform",
      );
    });
  });

  it("gives each kind text distinct from the generic fallback", () => {
    const fallback = formatNotification("something_else", {}, t).text;
    for (const kind of KINDS) {
      expect(formatNotification(kind, {}, t).text).not.toBe(fallback);
    }
  });

  it("maps kinds onto the right tab category", () => {
    expect(formatNotification("event_invite", {}, t).category).toBe("events");
    expect(formatNotification("event_cancelled", {}, t).category).toBe(
      "events",
    );
    expect(formatNotification("vouch_received", {}, t).category).toBe(
      "community",
    );
    expect(formatNotification("connection_request", {}, t).category).toBe(
      "community",
    );
    expect(formatNotification("promoted_to_member", {}, t).category).toBe(
      "platform",
    );
  });

  it("formats event_cohost_invite under the events category", () => {
    const result = formatNotification("event_cohost_invite", {}, t);
    expect(result.category).toBe("events");
    expect(result.kind).toBe("event_cohost_invite");
  });

  it.each([
    "event_lineup_invite",
    "event_lineup_accepted",
    "event_lineup_declined",
  ] as const)("formats %s under the events category", (kind) => {
    const result = formatNotification(kind, {}, t);
    expect(result.kind).toBe(kind);
    expect(result.category).toBe("events");
  });

  it("treats the retired `new_message` kind as unknown, not a known kind", () => {
    // DM alerts no longer render in the notifications centre. `new_message` is
    // no longer a known kind, so it resolves to the generic fallback (and is
    // dropped from the live feed upstream in `useNotifications`).
    const result = formatNotification("new_message", {}, t);
    expect(result.kind).toBeNull();
    expect(result.text).toBe("You have a new notification.");
    expect(result.category).toBe("platform");
  });

  it("formats a mention as a community-category known kind", () => {
    const result = formatNotification("mention", { actorId: "u1" }, t);
    expect(result.category).toBe("community");
    expect(result.kind).toBe("mention");
  });

  // `mention` is deliberately out of the `KINDS` sweep above: that sweep asserts
  // `text` never contains the raw kind string, but the natural copy ("You were
  // *mention*ed…") contains "mention". So it gets the equivalent coverage here,
  // guarding against a raw-key leak via the `type.mention` key form instead.
  it("renders non-empty mention copy in both languages, distinct from the fallback", () => {
    const fallback = formatNotification("something_else", {}, t).text;
    for (const language of ["en", "pt"] as const) {
      const localized = makeT(language);
      const result = formatNotification(
        "mention",
        { actorId: "u1" },
        localized,
      );
      expect(result.text.trim()).not.toBe("");
      expect(result.meta.trim()).not.toBe("");
      expect(result.text).not.toContain("notifications:");
      expect(result.text).not.toContain("type.mention");
    }
    expect(formatNotification("mention", {}, t).text).not.toBe(fallback);
  });

  it("passes scalar payload entries through as interpolation tokens", () => {
    // Today's copy uses no tokens, so this asserts the seam via a stub `t`
    // that echoes what it was handed.
    const spy: TFunction = (key, options) =>
      `${key}|${JSON.stringify(options)}`;
    const out = formatNotification(
      "event_reminder",
      { senderId: "abc", count: 2, nested: { deep: true } },
      spy,
    );
    expect(out.text).toContain('"senderId":"abc"');
    expect(out.text).toContain('"count":2');
    // Non-scalar payload entries are dropped — they can't be interpolated.
    expect(out.text).not.toContain("nested");
  });
});

/**
 * Sibling top-level describe (not nested under `formatNotification` above)
 * purely to keep each block's line count under the max-lines-per-function
 * budget. Grouping intent and coverage are unchanged from before the split.
 */
describe("formatNotification — unknown / future types", () => {
  it("falls back to generic copy instead of a blank row", () => {
    const result = formatNotification("a_type_from_the_future", {}, t);
    expect(result.text).toBe("You have a new notification.");
    expect(result.meta).toBe("Notification");
    expect(result.category).toBe("platform");
  });

  it("never throws, whatever the type or payload", () => {
    const cases: [string, unknown][] = [
      ["", null],
      ["", undefined],
      ["unheard_of", {}],
      ["__proto__", { a: 1 }],
      ["toString", "not-an-object"],
      ["new_message", null],
      ["new_message", 42],
    ];
    for (const [type, payload] of cases) {
      expect(() => formatNotification(type, payload, t)).not.toThrow();
      expect(formatNotification(type, payload, t).text.trim()).not.toBe("");
    }
  });

  it("has a Portuguese fallback as well", () => {
    const result = formatNotification("unheard_of", {}, makeT("pt"));
    expect(result.text).toBe("Tens uma nova notificação.");
  });
});

/** Same rationale as above: a sibling top-level describe to stay under the
 * per-function line budget. */
describe("formatNotification — verification_update", () => {
  it("names the level the member was moved TO, not the level they moved from", () => {
    const result = formatNotification(
      "verification_update",
      { fromLevel: "email", toLevel: "phone" },
      t,
    );
    expect(result.text).toBe("Your verification level was updated to Phone.");
    expect(result.meta.trim()).not.toBe("");
    expect(result.category).toBe("platform");
    expect(result.kind).toBe("verification_update");
    // The raw enum value must never leak through unresolved.
    expect(result.text).not.toContain("phone");
    expect(result.text).not.toContain("email");
  });

  it("resolves the same row in Portuguese", () => {
    const result = formatNotification(
      "verification_update",
      { fromLevel: "phone", toLevel: "id_verified" },
      makeT("pt"),
    );
    expect(result.text).toBe(
      "O teu nível de verificação foi atualizado para Identidade verificada.",
    );
  });

  it("falls back to a generic level phrase for an unrecognised toLevel", () => {
    // A future ladder rung an old client doesn't know yet — must never
    // interpolate the raw, unresolved value.
    const result = formatNotification(
      "verification_update",
      { toLevel: "some_future_level" },
      t,
    );
    expect(result.text).toBe(
      "Your verification level was updated to a new level.",
    );
    expect(result.text).not.toContain("some_future_level");
  });

  // Regression coverage for the bug this fix closes: `decideRequest`'s
  // approve/reject payloads carry no `toLevel`, so before the fix both fell
  // through to the override's `levelFallback` copy — which for a rejection
  // is factually false (nothing about the member's level changed).
  describe("approved decision", () => {
    it("names the level that was requested, not a false level-updated claim", () => {
      const result = formatNotification(
        "verification_update",
        { requestedLevel: "id_verified", decision: "approved" },
        t,
      );
      expect(result.text).toBe(
        "Your verification request was approved. You're now verified to ID-verified.",
      );
      expect(result.category).toBe("platform");
      // The raw enum value must never leak through unresolved.
      expect(result.text).not.toContain("id_verified");
    });

    it("resolves the same row in Portuguese", () => {
      const result = formatNotification(
        "verification_update",
        { requestedLevel: "phone", decision: "approved" },
        makeT("pt"),
      );
      expect(result.text).toBe(
        "O teu pedido de verificação foi aprovado. O teu nível de verificação é agora Telefone.",
      );
    });
  });

  describe("rejected decision", () => {
    it("never implies a level change, and surfaces the admin's reason", () => {
      const result = formatNotification(
        "verification_update",
        {
          requestedLevel: "id_verified",
          decision: "rejected",
          reason: "The submitted document photo was too blurry to verify.",
        },
        t,
      );
      expect(result.text).toBe("Your verification request was declined.");
      // The bug this fix closes: this must never read as a level update.
      expect(result.text).not.toContain("updated");
      expect(result.text).not.toContain("level");
      expect(result.reason).toBe(
        "The submitted document photo was too blurry to verify.",
      );
      expect(result.meta).toBe("Verification update");
    });

    it("keeps the label and carries no reason when none is on the payload", () => {
      const result = formatNotification(
        "verification_update",
        { requestedLevel: "id_verified", decision: "rejected", reason: "  " },
        t,
      );
      expect(result.text).toBe("Your verification request was declined.");
      expect(result.meta).toBe("Verification update");
      expect(result.reason).toBeUndefined();
    });

    it("resolves the same row in Portuguese", () => {
      const result = formatNotification(
        "verification_update",
        {
          requestedLevel: "phone",
          decision: "rejected",
          reason: "A foto do documento estava desfocada.",
        },
        makeT("pt"),
      );
      expect(result.text).toBe("O teu pedido de verificação foi recusado.");
      expect(result.meta).toBe("Atualização de verificação");
      expect(result.reason).toBe("A foto do documento estava desfocada.");
    });
  });
});

/** Same rationale as the two describes above: a sibling top-level describe to
 *  stay under the per-function line budget. */
describe("formatNotification: admin_queue_item", () => {
  const adminT = makeAdminT("en");

  it("names the queue an admin arrival landed in", () => {
    const result = formatNotification(
      "admin_queue_item",
      { source: "admin", queue: "invite_requests" },
      adminT,
    );
    expect(result.category).toBe("platform");
    expect(result.kind).toBe("admin_queue_item");
    expect(result.text).toContain("1");
  });

  it("counts a bundled admin arrival as one more than otherActorCount", () => {
    const result = formatNotification(
      "admin_queue_item",
      { source: "admin", queue: "invite_requests" },
      adminT,
      undefined,
      3,
    );
    expect(result.text).toContain("4");
  });

  it("still reads for a queue this build does not know", () => {
    const result = formatNotification(
      "admin_queue_item",
      { source: "admin", queue: "some_future_queue" },
      adminT,
    );
    expect(result.text).not.toBe("");
    expect(result.kind).toBe("admin_queue_item");
  });

  it("renders the arrival copy in Portuguese", () => {
    const result = formatNotification(
      "admin_queue_item",
      { source: "admin", queue: "dsar" },
      makeAdminT("pt"),
    );
    expect(result.text).not.toBe("");
  });
});

/**
 * Task 13. The three co-manager kinds and `listing_owner_offer` had no entry
 * in `KIND_CATEGORY` before this, so every row of all four resolved to
 * `isKnownKind === false` and rendered the unknown-kind fallback. A sibling
 * top-level describe, the same rationale as the blocks above: it stays under
 * the per-function line budget.
 */
describe("formatNotification: listing co-manager and owner offer", () => {
  const coManagerKinds = [
    "listing_co_manager_invite",
    "listing_co_manager_invite_accepted",
    "listing_co_manager_invite_declined",
  ] as const;

  it("resolves all four as known kinds", () => {
    for (const kind of [...coManagerKinds, "listing_owner_offer"] as const) {
      expect(formatNotification(kind, {}, t).kind).toBe(kind);
    }
  });

  it("puts the three co-manager kinds on the community tab", () => {
    for (const kind of coManagerKinds) {
      expect(formatNotification(kind, {}, t).category).toBe("community");
    }
  });

  it("puts listing_owner_offer on the platform tab", () => {
    expect(formatNotification("listing_owner_offer", {}, t).category).toBe(
      "platform",
    );
  });

  it("interpolates the listing name and the resolved actor's name", () => {
    // A stub `t` that echoes what it was handed, the same technique the
    // interpolation-tokens test above uses, so this asserts the token seam
    // without depending on catalog copy that has not landed yet.
    const spy: TFunction = (key, options) =>
      `${key}|${JSON.stringify(options)}`;
    const out = formatNotification(
      "listing_co_manager_invite",
      { listingSlug: "lux-cafe", listingName: "Lux Cafe", inviteId: "inv1" },
      spy,
      undefined,
      undefined,
      "Jordan Rivera",
    );
    expect(out.text).toContain('"listingName":"Lux Cafe"');
    expect(out.text).toContain('"name":"Jordan Rivera"');
  });

  it("falls back to a generic listing name and actor name when the payload carries neither", () => {
    const spy: TFunction = (key, options) =>
      `${key}|${JSON.stringify(options)}`;
    const out = formatNotification("listing_owner_offer", {}, spy);
    expect(out.text).toContain(
      "type.listing_co_manager_invite.listingNameFallback",
    );
    expect(out.text).toContain("type.listing_co_manager_invite.nameFallback");
  });
});

/**
 * Phase 2 persona creator handoff (T8). A sibling top-level describe, the
 * same rationale as the blocks above: it stays under the per-function line
 * budget.
 *
 * `subprofile_creator_changed` is deliberately absent from the `KINDS` sweep
 * above, the same way `persona_update` and `subprofile_credit` are: like
 * those two, its flat copy interpolates a payload field
 * (`subprofileName`/`newCreatorName`) with no defensive fallback (the backend
 * always writes both, and no older row shape exists to degrade for), so
 * calling it with `{}` would only leave an unresolved `{subprofileName}` on
 * screen. Real payloads are used here
 * instead.
 */
describe("formatNotification: subprofile_creator_changed", () => {
  const payload = {
    subprofileName: "Nightform",
    newCreatorName: "Ana Ribeiro",
  };

  it("names the new creator for every other remaining member", () => {
    const result = formatNotification(
      "subprofile_creator_changed",
      { ...payload, isYou: false },
      t,
    );
    expect(result.text).toBe("Ana Ribeiro is now the creator of Nightform.");
    expect(result.meta).toBe("Persona ownership");
    expect(result.category).toBe("community");
    expect(result.kind).toBe("subprofile_creator_changed");
  });

  it("addresses the successor in the second person", () => {
    const result = formatNotification(
      "subprofile_creator_changed",
      { ...payload, isYou: true },
      t,
    );
    expect(result.text).toBe("You're now the creator of Nightform.");
    // `newCreatorName` is the recipient here, so the successor's own copy
    // speaks to them directly and leaves their name out.
    expect(result.text).not.toContain("Ana Ribeiro");
  });

  it("defaults to the 'someone else' variant when isYou is absent", () => {
    const result = formatNotification("subprofile_creator_changed", payload, t);
    expect(result.text).toBe("Ana Ribeiro is now the creator of Nightform.");
  });

  it("never throws and stays on the community tab with an empty payload", () => {
    const result = formatNotification("subprofile_creator_changed", {}, t);
    expect(result.category).toBe("community");
    expect(result.kind).toBe("subprofile_creator_changed");
    expect(result.text.trim()).not.toBe("");
  });

  it("resolves both variants in Portuguese", () => {
    const someoneElse = formatNotification(
      "subprofile_creator_changed",
      { ...payload, isYou: false },
      makeT("pt"),
    );
    expect(someoneElse.text).toBe(
      "Ana Ribeiro passou a ser responsável por Nightform.",
    );
    expect(someoneElse.meta).toBe("Responsável pela persona");

    const successor = formatNotification(
      "subprofile_creator_changed",
      { ...payload, isYou: true },
      makeT("pt"),
    );
    expect(successor.text).toBe("Passaste a ser responsável por Nightform.");
  });
});

/**
 * ENG-409. The thirty-one kinds the backend wrote with no copy here. A sibling
 * top-level describe for the same line-budget reason as the blocks above.
 *
 * Unlike `KINDS`, every one of these IS safe to sweep with an empty payload:
 * `applyLifecycleTokens` resolves each interpolated field to a fallback
 * phrase, so a row whose payload never arrived still reads as a sentence.
 */
const LIFECYCLE_KINDS = Object.keys(LIFECYCLE_KIND_CATEGORY);

describe("formatNotification: ENG-409 newly rendered kinds", () => {
  it.each(LIFECYCLE_KINDS)(
    "renders %s as its own copy, with no brace token, in both languages",
    (kind) => {
      const fallback = formatNotification("a_type_from_the_future", {}, t);
      for (const language of ["en", "pt"] as const) {
        const result = formatNotification(kind, {}, makeT(language));
        expect(result.kind).toBe(kind);
        expect(result.text.trim()).not.toBe("");
        expect(result.meta.trim()).not.toBe("");
        expect(`${result.text} ${result.meta}`).not.toMatch(/[{}]/);
      }
      expect(formatNotification(kind, {}, t).text).not.toBe(fallback.text);
    },
  );

  it("files each group under the tab its neighbours use", () => {
    expect(formatNotification("community_new_post", {}, t).category).toBe(
      "community",
    );
    expect(formatNotification("event_announcement", {}, t).category).toBe(
      "events",
    );
    expect(formatNotification("forum_thread_reviewed", {}, t).category).toBe(
      "platform",
    );
    expect(formatNotification("subprofile_invite", {}, t).category).toBe(
      "community",
    );
  });

  it("names the community a fan-out came from", () => {
    const result = formatNotification(
      "community_new_post",
      {
        source: "community",
        communitySlug: "trans-friends",
        communityName: "Trans Friends",
        postId: "p1",
      },
      t,
    );
    expect(result.text).toContain("Trans Friends");
  });

  it("branches a role change on the new role, and falls back for an unknown one", () => {
    const moderator = formatNotification(
      "community_role_changed",
      { communityName: "Trans Friends", role: "mod" },
      t,
    );
    const unknown = formatNotification(
      "community_role_changed",
      { communityName: "Trans Friends", role: "gardener" },
      t,
    );
    expect(moderator.text).toContain("Trans Friends");
    expect(moderator.text).not.toBe(unknown.text);
    expect(unknown.text).toBe(
      formatNotification(
        "community_role_changed",
        { communityName: "Trans Friends" },
        t,
      ).text,
    );
  });

  it("names the listing field an accepted correction touched", () => {
    const hours = formatNotification(
      "listing_edit_suggestion_accepted",
      { source: "listing", listingSlug: "lux-cafe", field: "hours" },
      t,
    );
    const other = formatNotification(
      "listing_edit_suggestion_accepted",
      { field: "other" },
      t,
    );
    // The member reads the field's label.
    expect(hours.text).toContain("opening hours");
    expect(hours.text).not.toBe(other.text);
  });

  it("names the persona and the gathering where the payload carries them", () => {
    const invite = formatNotification(
      "subprofile_invite",
      { subprofileName: "Fio Solto" },
      t,
    );
    expect(invite.text).toContain("Fio Solto");
    expect(invite.textValues?.subprofileName).toBe("Fio Solto");
    const venue = formatNotification(
      "venue_event_attachment",
      { listingName: "Lux Cafe", eventTitle: "Picnic in Estrela" },
      t,
    );
    expect(venue.text).toContain("Lux Cafe");
    expect(venue.text).toContain("Picnic in Estrela");
  });
});

/**
 * PRD-404. `event_reminder` names the gathering when the backend's new
 * payload carries its title, and keeps the original sentence for rows written
 * before that change.
 */
describe("formatNotification: event_reminder with a gathering title", () => {
  it("names the gathering when the title is present", () => {
    const titled = formatNotification(
      "event_reminder",
      {
        eventId: "e1",
        source: "event",
        eventSlug: "picnic-in-estrela",
        eventTitle: "Picnic in Estrela",
      },
      t,
    );
    expect(titled.text).toContain("Picnic in Estrela");
    expect(titled.meta).toBe(formatNotification("event_reminder", {}, t).meta);
  });

  it("keeps the original sentence for an older row with no title", () => {
    const untitled = formatNotification("event_reminder", { eventId: "e1" }, t);
    expect(untitled.text).toBe("A gathering you're going to is coming up.");
  });

  it("resolves the titled variant in Portuguese", () => {
    const titled = formatNotification(
      "event_reminder",
      { eventTitle: "Piquenique na Estrela" },
      makeT("pt"),
    );
    expect(titled.text).toContain("Piquenique na Estrela");
  });
});

/**
 * PRD-402. Five decline pushes say "Tap to read why" and open the bell, so
 * the bell row has to carry the moderator's words. They ride on the row's own
 * `reason` field, verbatim and trimmed, the row shows them in full under the
 * sentence, and `meta` stays the kind's short label whether or not a reason
 * was written.
 */
describe("formatNotification: PRD-402 decline reasons on the bell row", () => {
  const REASON = "The photos show a different flat from the one described.";

  const declines: [string, Record<string, unknown>, string][] = [
    [
      "forum_thread_reviewed",
      {
        source: "forum",
        threadSlug: "t1",
        title: "Coming out at work",
        decision: "rejected",
        reviewNote: REASON,
      },
      "Thread review",
    ],
    [
      "reading_group_proposal_decided",
      {
        source: "community",
        decision: "declined",
        book: "Stone Butch Blues",
        reason: REASON,
      },
      "Reading group proposal",
    ],
    [
      "group_listing_decided",
      {
        source: "housing_group",
        decision: "declined",
        listingTitle: "Sunny room in Arroios",
        groupName: "Casa Lilás",
        groupSlug: "casa-lilas",
        reason: REASON,
      },
      "Group listing",
    ],
    // PRD-463. A published listing a moderator hid, with the required reason.
    [
      "group_listing_decided",
      {
        source: "housing_group",
        decision: "hidden",
        listingTitle: "Sunny room in Arroios",
        groupName: "Casa Lilás",
        groupSlug: "casa-lilas",
        reason: REASON,
      },
      "Group listing",
    ],
    [
      "landlord_suggestion_decided",
      {
        source: "landlord",
        decision: "removed",
        landlordName: "Casas do Bairro",
        landlordSlug: "casas-do-bairro",
        reason: REASON,
      },
      "Landlord suggestion",
    ],
    [
      "landlord_intro_request_decided",
      {
        source: "landlord",
        decision: "declined",
        landlordName: "Casas do Bairro",
        landlordSlug: "casas-do-bairro",
        reason: REASON,
      },
      "Introduction request",
    ],
  ];

  it.each(declines)(
    "%s carries the reason on `reason` and its label on `meta`",
    (kind, payload, label) => {
      const result = formatNotification(kind, payload, t);
      expect(result.reason).toBe(REASON);
      expect(result.meta).toBe(label);
      expect(result.text).not.toContain(REASON);
      expect(result.text).not.toMatch(/[{}]/);
    },
  );

  it.each(declines)(
    "%s keeps a readable sentence and its label when no reason was written",
    (kind, payload, label) => {
      const withoutReason = { ...payload };
      delete withoutReason.reason;
      delete withoutReason.reviewNote;
      expect(formatNotification(kind, withoutReason, t).meta).toBe(label);
      for (const language of ["en", "pt"] as const) {
        const result = formatNotification(kind, withoutReason, makeT(language));
        expect(result.reason).toBeUndefined();
        expect(result.meta.trim()).not.toBe("");
        expect(`${result.text} ${result.meta}`).not.toMatch(/[{}]/);
      }
    },
  );

  it("trims the reason and drops one that is only whitespace", () => {
    const padded = formatNotification(
      "group_listing_decided",
      { decision: "declined", reason: `  ${REASON}\n` },
      t,
    );
    expect(padded.reason).toBe(REASON);
    const blank = formatNotification(
      "group_listing_decided",
      { decision: "declined", reason: " \n\t " },
      t,
    );
    expect(blank.reason).toBeUndefined();
    expect(blank.meta).toBe("Group listing");
  });

  it("passes a reason through as plain text, markup and all", () => {
    const markup = "<b>Not a room</b> & <a href='x'>see</a>";
    const result = formatNotification(
      "group_listing_decided",
      { decision: "declined", reason: markup },
      t,
    );
    // The row renders `reason` as a text node, so the string must arrive
    // untouched: neither parsed nor escaped here.
    expect(result.reason).toBe(markup);
    expect(result.meta).toBe("Group listing");
  });

  it("gives the declined and the approved outcome different sentences", () => {
    const approved = formatNotification(
      "reading_group_proposal_decided",
      { decision: "approved", book: "Stone Butch Blues" },
      t,
    );
    const declined = formatNotification(
      "reading_group_proposal_decided",
      { decision: "declined", book: "Stone Butch Blues", reason: REASON },
      t,
    );
    expect(approved.text).not.toBe(declined.text);
    expect(approved.reason).toBeUndefined();
    expect(approved.meta).toBe(declined.meta);
  });

  it("gives a hidden group listing its own sentence, naming the listing", () => {
    const payload = {
      source: "housing_group",
      listingTitle: "Sunny room in Arroios",
      groupName: "Casa Lilás",
      groupSlug: "casa-lilas",
    };
    for (const language of ["en", "pt"] as const) {
      const localized = makeT(language);
      const hidden = formatNotification(
        "group_listing_decided",
        { ...payload, decision: "hidden", reason: REASON },
        localized,
      );
      const declined = formatNotification(
        "group_listing_decided",
        { ...payload, decision: "declined", reason: REASON },
        localized,
      );
      // The flat fallback also names the listing, so pin the outcome sentence:
      // this fails if `hidden` leaves OUTCOME_FIELDS.
      const flat = formatNotification(
        "group_listing_decided",
        payload,
        localized,
      );
      expect(hidden.text).not.toBe(flat.text);
      expect(hidden.text).not.toBe(declined.text);
      expect(hidden.reason).toBe(REASON);
    }
    expect(
      formatNotification(
        "group_listing_decided",
        { ...payload, decision: "hidden", reason: REASON },
        t,
      ).text,
    ).toBe("Sunny room in Arroios was hidden from Casa Lilás by moderators.");
  });

  it.each(["request_changes", "reject", "take_down"])(
    "carries the reason on the housing listing decision (%s)",
    (decision) => {
      const result = formatNotification(
        "housing_listing_decision",
        {
          source: "housing",
          slug: "sunny-room",
          title: "Sunny room",
          decision,
          reason: REASON,
        },
        t,
      );
      expect(result.reason).toBe(REASON);
      expect(result.meta).toBe("Housing");
      expect(result.text).toContain("Sunny room");
    },
  );
});

/**
 * PRD-402, continued. The kinds that carried a reason on their meta line
 * before the lifecycle kinds did, plus the one whose reason a member wrote.
 */
describe("formatNotification: PRD-402 reasons on the other decision kinds", () => {
  it("carries the moderator's note on every moderation outcome", () => {
    const note = "Repeated slurs in the community chat.";
    for (const action of ["warn", "suspend", "ban", "restriction_lifted"]) {
      const result = formatNotification(
        "moderation_outcome",
        { action, note },
        t,
      );
      expect(result.reason).toBe(note);
      expect(result.meta).toBe("Moderation decision");
    }
    const flat = formatNotification("moderation_outcome", { note }, t);
    expect(flat.reason).toBe(note);
    expect(flat.meta).toBe("Moderation decision");
    expect(formatNotification("moderation_outcome", {}, t).reason).toBe(
      undefined,
    );
  });

  it("carries the reviewer's note on a decided submission", () => {
    const reviewNote = "We only list swaps between members in Portugal.";
    const declined = formatNotification(
      "submission_decided",
      { kind: "barter_proposal", outcome: "declined", reviewNote },
      t,
    );
    expect(declined.reason).toBe(reviewNote);
    expect(declined.meta).toBe("Swap proposal");
    expect(
      formatNotification(
        "submission_decided",
        { kind: "partner_application", outcome: "accepted" },
        t,
      ).meta,
    ).toBe("Partner application");
    const unknownKind = formatNotification(
      "submission_decided",
      { kind: "a_future_kind", reviewNote },
      t,
    );
    expect(unknownKind.reason).toBe(reviewNote);
    expect(unknownKind.meta).toBe("Submission");
  });

  it("carries the member's reason on an owner review request", () => {
    const reason = "The owner has not answered anyone in three months.";
    const result = formatNotification(
      "community_owner_review_requested",
      { communityName: "Trans Friends", reason },
      t,
    );
    expect(result.reason).toBe(reason);
    expect(result.meta).toBe("Owner review");
    expect(result.text).toContain("Trans Friends");
  });

  it("carries no reason on kinds whose sentence already quotes it", () => {
    const result = formatNotification(
      "community_banned",
      { communityName: "Trans Friends", reason: "Repeated slurs." },
      t,
    );
    expect(result.reason).toBeUndefined();
  });
});

/**
 * ENG-409 review fix. Three sentences end on a named thing ("…: {title}.").
 * A row missing that name reads a variant sentence written without it, so no
 * fallback phrase is left dangling after a colon.
 */
describe("formatNotification: ENG-409 rows missing their named thing", () => {
  it.each([
    ["community_resource_added", { communityName: "Trans Friends" }],
    ["community_tag_request_resolved", {}],
    ["venue_event_attachment", { listingName: "Lux Cafe" }],
  ] as [string, Record<string, unknown>][])(
    "%s reads a whole sentence with no colon tail in both languages",
    (kind, payload) => {
      for (const language of ["en", "pt"] as const) {
        const result = formatNotification(kind, payload, makeT(language));
        expect(result.text).not.toContain(":");
        expect(result.text).not.toMatch(/[{}]/);
      }
    },
  );

  it("names the resource once the payload carries its title", () => {
    const titled = formatNotification(
      "community_resource_added",
      { communityName: "Trans Friends", title: "Name change guide" },
      t,
    );
    expect(titled.text).toContain("Name change guide");
  });
});

/**
 * ENG-409 follow-up. The payload fields the backend began forwarding later.
 * Every one of them is missing from rows stored before that, so each case
 * checks both shapes: the new field names the thing, and its absence keeps
 * the original sentence.
 */
describe("formatNotification: newly forwarded payload fields", () => {
  it("tells the incoming owner the community is theirs now", () => {
    const incoming = formatNotification(
      "community_ownership_transferred",
      { communityName: "Trans Friends", youAreNowOwner: true },
      t,
    );
    const outgoing = formatNotification(
      "community_ownership_transferred",
      { communityName: "Trans Friends", youAreNowOwner: false },
      t,
    );
    expect(incoming.text).toContain("Trans Friends");
    expect(incoming.text).not.toBe(outgoing.text);
    // A handover reads differently from being made owner by a role change.
    expect(incoming.text).not.toBe(
      formatNotification(
        "community_role_changed",
        { communityName: "Trans Friends", role: "owner" },
        t,
      ).text,
    );
    expect(
      formatNotification("community_ownership_transferred", {}, t).text,
    ).toBe(
      outgoing.text.replace("Trans Friends", "a community you're part of"),
    );
  });

  it.each(["persona_endorsed", "persona_followed"])(
    "%s names the persona when the payload carries it",
    (kind) => {
      const named = formatNotification(
        kind,
        { subprofileName: "Fio Solto" },
        t,
      );
      expect(named.text).toContain("Fio Solto");
    },
  );

  it.each([
    ["persona_endorsed", "Someone endorsed one of your personas."],
    ["persona_followed", "Someone started following one of your personas."],
  ])("%s keeps its original sentence without a persona name", (kind, text) => {
    expect(formatNotification(kind, {}, t).text).toBe(text);
  });

  it("names the gathering a host posted about, and keeps the old sentence without a title", () => {
    const titled = formatNotification(
      "event_announcement",
      { source: "event", eventSlug: "picnic", title: "Picnic in Estrela" },
      t,
    );
    expect(titled.text).toBe(
      "A host posted an update about Picnic in Estrela.",
    );
    expect(titled.textValues?.title).toBe("Picnic in Estrela");
    expect(formatNotification("event_announcement", {}, t).text).toBe(
      "A host posted an update about one of your gatherings.",
    );
  });

  it.each([
    "governance_motion_approved",
    "governance_motion_rejected",
    "governance_motion_ready_for_review",
  ])("%s names the motion when the payload carries its title", (kind) => {
    const titled = formatNotification(
      kind,
      { source: "governance", title: "Quiet hours in shared spaces" },
      t,
    );
    expect(titled.text).toContain("Quiet hours in shared spaces");
  });

  it.each([
    [
      "governance_motion_approved",
      "Your motion was approved and is now open for a vote.",
    ],
    [
      "governance_motion_rejected",
      "Your motion wasn't put to a vote this time.",
    ],
    [
      "governance_motion_ready_for_review",
      "A motion has enough co-signatures and is ready for review.",
    ],
  ])("%s keeps its original sentence without a title", (kind, text) => {
    expect(formatNotification(kind, {}, t).text).toBe(text);
  });

  it("carries the admin's reason on a rejected motion beside its label", () => {
    const note = "It repeats a motion the community voted on in June.";
    const withNote = formatNotification(
      "governance_motion_rejected",
      { source: "governance", title: "Quiet hours", note },
      t,
    );
    expect(withNote.reason).toBe(note);
    expect(withNote.meta).toBe("Governance motion");
    expect(withNote.text).not.toContain(note);
    const untitledWithNote = formatNotification(
      "governance_motion_rejected",
      { note },
      t,
    );
    expect(untitledWithNote.reason).toBe(note);
    expect(untitledWithNote.meta).toBe("Governance motion");
    const withoutNote = formatNotification("governance_motion_rejected", {}, t);
    expect(withoutNote.reason).toBeUndefined();
    expect(withoutNote.meta).toBe("Governance motion");
  });

  it.each(["listing_claim_approved", "listing_claim_declined"])(
    "%s names the listing when the payload carries it",
    (kind) => {
      const named = formatNotification(
        kind,
        { source: "listing", listingSlug: "lux-cafe", listingName: "Lux Cafe" },
        t,
      );
      expect(named.text).toContain("Lux Cafe");
    },
  );

  it.each([
    [
      "listing_claim_approved",
      "Your claim was approved. You now manage this listing.",
    ],
    ["listing_claim_declined", "Your claim on a listing wasn't approved."],
  ])("%s keeps its original sentence without a listing name", (kind, text) => {
    expect(formatNotification(kind, {}, t).text).toBe(text);
  });

  it.each([
    ["community_ownership_transferred", { youAreNowOwner: true }],
    ["persona_endorsed", { subprofileName: "Fio Solto" }],
    ["persona_followed", { subprofileName: "Fio Solto" }],
    ["event_announcement", { title: "Piquenique" }],
    ["governance_motion_approved", { title: "Horas de silêncio" }],
    ["governance_motion_rejected", { title: "Horas de silêncio" }],
    ["governance_motion_ready_for_review", { title: "Horas de silêncio" }],
    ["listing_claim_approved", { listingName: "Lux Cafe" }],
    ["listing_claim_declined", { listingName: "Lux Cafe" }],
  ] as [string, Record<string, unknown>][])(
    "%s resolves its new variant in Portuguese with no brace token",
    (kind, payload) => {
      const result = formatNotification(kind, payload, makeT("pt"));
      expect(`${result.text} ${result.meta}`).not.toMatch(/[{}]/);
    },
  );
});

/**
 * DES-417. Safe-space review bells used to ride on `moderation_outcome` with
 * an English sentence, so a nomination thank-you read like a sanction. They
 * now carry their own kind and structured codes, and the copy is written here.
 */
describe("formatNotification: safe_space_review", () => {
  it.each([
    [
      "safe_space_nomination_acknowledged",
      "nominator",
      "Your nomination of Lux Cafe is with a reviewer.",
      "Safe-space nomination",
    ],
    [
      "safe_space_nomination_declined",
      "nominator",
      "We reviewed Lux Cafe and aren't adding the badge for now.",
      "Safe-space nomination",
    ],
    [
      "safe_space_nomination_awarded",
      "nominator",
      "Lux Cafe is now a verified safe space. Thank you for nominating it.",
      "Safe-space nomination",
    ],
    [
      "safe_space_nomination_awarded",
      "owner",
      "Lux Cafe now carries the QueerPulse safe-space badge.",
      "Safe-space badge",
    ],
    [
      "safe_space_badge_suspended",
      "owner",
      "The safe-space badge on Lux Cafe is paused while we review it. Someone from the review team will be in touch.",
      "Safe-space badge",
    ],
    [
      "safe_space_badge_restored",
      "flagger",
      "The review of Lux Cafe is finished. Thank you for raising it.",
      "Safe-space review",
    ],
    [
      "safe_space_badge_restored",
      "owner",
      "The review is finished and the safe-space badge on Lux Cafe is live again.",
      "Safe-space badge",
    ],
    [
      "safe_space_flag_review_opened",
      "flagger",
      "The safe-space badge on Lux Cafe is paused while we look into what you raised.",
      "Safe-space review",
    ],
    [
      "safe_space_flag_resolved",
      "flagger",
      "The review team has finished looking at what you raised about Lux Cafe.",
      "Safe-space review",
    ],
  ])("%s to the %s reads its own sentence", (action, audience, text, meta) => {
    const result = formatNotification(
      "safe_space_review",
      { source: "safe-space", action, audience, placeName: "Lux Cafe" },
      t,
    );
    expect(result.text).toBe(text);
    expect(result.meta).toBe(meta);
    expect(result.kind).toBe("safe_space_review");
    expect(result.category).toBe("community");
  });

  it("tells staff the queue is overdue with no place named", () => {
    const result = formatNotification(
      "safe_space_review",
      {
        source: "safe-space",
        action: "safe_space_queue_overdue",
        audience: "staff",
      },
      t,
    );
    expect(result.text).toBe(
      "The safe-space review queue has items waiting past their deadline.",
    );
    expect(result.meta).toBe("Safe-space queue");
  });

  it("names this place when the payload carries no place name", () => {
    const result = formatNotification(
      "safe_space_review",
      {
        source: "safe-space",
        action: "safe_space_flag_resolved",
        audience: "flagger",
      },
      t,
    );
    expect(result.text).toBe(
      "The review team has finished looking at what you raised about this place.",
    );
  });

  it("falls back to the flat line for an action this client does not know", () => {
    const result = formatNotification(
      "safe_space_review",
      {
        source: "safe-space",
        action: "safe_space_something_new",
        audience: "owner",
      },
      t,
    );
    expect(result.text).toBe("There's an update on a safe-space review.");
    expect(result.meta).toBe("Safe-space review");
  });

  it("carries the moderator's reason on a declined nomination", () => {
    const reason = "We could not confirm the accessibility details.";
    const result = formatNotification(
      "safe_space_review",
      {
        source: "safe-space",
        action: "safe_space_nomination_declined",
        audience: "nominator",
        placeName: "Lux Cafe",
        reason,
      },
      t,
    );
    expect(result.reason).toBe(reason);
  });

  it("resolves every action in Portuguese with no brace token", () => {
    const portugueseT = makeT("pt");
    for (const action of [
      "safe_space_nomination_acknowledged",
      "safe_space_nomination_declined",
      "safe_space_nomination_awarded",
      "safe_space_badge_suspended",
      "safe_space_badge_restored",
      "safe_space_flag_review_opened",
      "safe_space_flag_resolved",
      "safe_space_queue_overdue",
    ]) {
      for (const audience of ["nominator", "owner", "flagger", "staff"]) {
        const result = formatNotification(
          "safe_space_review",
          { source: "safe-space", action, audience },
          portugueseT,
        );
        expect(`${result.text} ${result.meta}`).not.toMatch(/[{}]/);
      }
    }
  });

  it("renders a legacy moderation_outcome safe-space row as a neutral update", () => {
    const result = formatNotification(
      "moderation_outcome",
      {
        source: "safe-space",
        action: "safe_space_badge_suspended",
        note: "The safe-space badge on your listing is paused while we review it.",
      },
      t,
    );
    expect(result.text).toBe("There's an update on a safe-space review.");
    expect(result.meta).toBe("Safe-space review");
    expect(result.reason).toBeUndefined();
  });

  it("keeps the moderation copy for a real moderation action", () => {
    const result = formatNotification(
      "moderation_outcome",
      { action: "warn", note: "Please keep it kind." },
      t,
    );
    expect(result.meta).toBe("Moderation decision");
    expect(result.reason).toBe("Please keep it kind.");
  });
});

// "Last few spots" (PRD-18). A host who hid the attendee count still has the
// alert sent, but the backend leaves `seatsRemaining` off: with a public
// capacity it would spell out the seats taken. The row must then read as the
// plain "almost full" sentence.
describe("formatNotification: event_nearly_full", () => {
  const basePayload = {
    source: "event",
    eventSlug: "queer-book-club",
    title: "Queer Book Club",
  };

  it("counts the spots left when the payload carries them", () => {
    const result = formatNotification(
      "event_nearly_full",
      { ...basePayload, seatsRemaining: 2 },
      t,
    );
    expect(result.text).toBe(
      "A gathering you were looking at has 2 spots left.",
    );
    expect(result.category).toBe("events");
  });

  it("reads as the almost-full variant when the host hid the count", () => {
    const result = formatNotification("event_nearly_full", basePayload, t);
    expect(result.text).toBe("A gathering you were looking at is nearly full.");
    expect(result.text).not.toContain("{seatsRemaining}");
    expect(result.meta).toBe("Last few spots");
  });

  it("reads as the almost-full variant in Portuguese too", () => {
    const result = formatNotification(
      "event_nearly_full",
      basePayload,
      makeT("pt"),
    );
    expect(result.text).toBe(
      "Um convívio que estavas a ponderar está quase cheio.",
    );
  });
});
