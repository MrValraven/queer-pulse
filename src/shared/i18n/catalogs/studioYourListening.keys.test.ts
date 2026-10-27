import { describe, expect, it } from "vitest";
import { studio as en } from "./en/studio";
import { studio as pt } from "./pt/studio";
import { settings as enSettings } from "./en/settings";

/** Every new studio key the Studio dashboard Part 2 (Listening) build reads. */
const NEW_KEYS = [
  "shell.menu.yourListening",
  "listening.pageTitle",
  "listening.eyebrow",
  "listening.title",
  "listening.dek",
  "listening.controls.heading",
  "listening.history.heading",
  "listening.history.body",
  "listening.clearCta",
  "listening.clear.title",
  "listening.clear.body",
  "listening.clear.confirm",
  "listening.clear.done",
  "listening.clear.failed",
  "listening.paused.body",
  "listening.paused.resumeCta",
  "listening.range.label",
  "listening.range.4w",
  "listening.range.6m",
  "listening.range.12m",
  "listening.listens_one",
  "listening.listens_other",
  "listening.days_one",
  "listening.days_other",
  "listening.topArtists.heading",
  "listening.topTracks.heading",
  "listening.top.empty",
  "listening.recent.heading",
  "listening.recent.playedOn",
  "listening.recent.unavailable",
  "listening.recent.showMore",
  "listening.recent.empty",
  "listening.empty.title",
  "listening.empty.body",
  "listening.empty.cta",
  "listening.empty.pausedBody",
  "listening.supporting.heading",
  "listening.supporting.dek",
  "listening.supporting.since",
  "listening.supporting.shownAs",
  "listening.supporting.linksLabel",
  "listening.supporting.empty",
  "listening.supporting.stop",
  "listening.supporting.stopAria",
  "listening.notice.body",
  "listening.notice.cta",
  "listening.notice.close",
  "settingsLive.history.label",
  "settingsLive.history.title",
  "supporter.heading",
  "supporter.body",
  "supporter.pickerLegend",
  "supporter.account",
  "supporter.saveCta",
  "supporter.closeCta",
  "supporter.changeCta",
  "supporter.confirmation",
  "supporter.removed",
  "supporter.saveFailed",
  "supporter.removeFailed",
  "numbers.column.plays",
  "numbers.plays.showsNotCounted",
  "numbers.plays.title",
  "numbers.plays.sub",
  "numbers.plays.ariaLabel",
  "numbers.plays.today",
  "numbers.plays.tableCaption",
  "numbers.plays.dayColumn",
  "numbers.plays.countColumn",
  "numbers.plays.totals",
  "numbers.plays.note",
  "numbers.plays.empty",
  "numbers.supporters.heading",
  "numbers.supporters.dek",
  "numbers.supporters.optedIn",
  "numbers.supporters.empty",
  "numbers.supporters.listLabel",
  "errors.reason.studio_supporter_artist_not_found",
  "errors.reason.studio_supporter_own_persona",
  "errors.reason.studio_supporter_identity_not_yours",
  "errors.what.listening",
  "errors.what.listeningHistory",
  "errors.what.supporting",
  "errors.what.supporter",
  "errors.what.plays",
  "errors.what.topSupporters",
];

/** Existing studio keys whose value reverses the old "Studio never counts plays" promise. */
const REWRITTEN_KEYS = [
  "numbers.dek",
  "demo.dashboard.activity.sub_one",
  "demo.dashboard.activity.sub_other",
  "helpLive.faq.tracking.a",
  "helpLive.faq.stats.a",
  "aboutLive.sec.privacy.p1",
  "aboutLive.sec.privacy.p2",
  "termsLive.sec.stored.p1",
  "landing.compare.listening.studio",
  "aboutLive.sec.privacy.num",
  "settings.privacy.dek",
];

const tokensOf = (value: string) =>
  [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("Studio dashboard Part 2 catalog keys", () => {
  it("exist in both languages with the same tokens", () => {
    for (const key of [...NEW_KEYS, ...REWRITTEN_KEYS]) {
      expect(en[key], `en ${key}`).toEqual(expect.any(String));
      expect(pt[key], `pt ${key}`).toEqual(expect.any(String));
      expect(tokensOf(pt[key] ?? ""), key).toEqual(tokensOf(en[key] ?? ""));
    }
  });
  it("carry no dashes and no antithesis, and new keys no closing full stop", () => {
    for (const key of [...NEW_KEYS, ...REWRITTEN_KEYS])
      for (const value of [en[key] ?? "", pt[key] ?? ""]) {
        expect(value, key).not.toMatch(/[\u2013\u2014]/);
        expect(value, key).not.toMatch(
          /, not |rather than|instead of|not just|, never /,
        );
      }
    for (const key of NEW_KEYS)
      for (const value of [en[key] ?? "", pt[key] ?? ""])
        expect(value, key).not.toMatch(/\.$/);
  });
  it("names each supporter refusal the way the server does", () => {
    expect(en["errors.reason.studio_supporter_artist_not_found"]).toBe(
      "This artist is not available to support",
    );
    expect(en["errors.reason.studio_supporter_own_persona"]).toBe(
      "You are a member of this artist, so you cannot be its supporter",
    );
    expect(en["errors.reason.studio_supporter_identity_not_yours"]).toBe(
      "You can show yourself only as your account or a persona you are a member of",
    );
    expect(pt["errors.reason.studio_supporter_identity_not_yours"]).toBe(
      "Só podes aparecer com a tua conta ou com uma persona de que fazes parte",
    );
  });
  it("no longer promises that Studio keeps no play counts", () => {
    for (const key of REWRITTEN_KEYS) {
      expect(en[key] ?? "", key).not.toMatch(
        /never counts plays|no play counts|no record of what you play/i,
      );
      expect(pt[key] ?? "", key).not.toMatch(
        /nunca conta|não guarda contagens|não conta audições/i,
      );
    }
    expect(enSettings["dataExport.type.activityLog.sub"]).toContain(
      "Studio listening history",
    );
  });
  it("uses gender-neutral people nouns in PT", () => {
    for (const key of [...NEW_KEYS, ...REWRITTEN_KEYS])
      expect(pt[key] ?? "", key).not.toMatch(/seguidor|apoiador/i);
  });
});
