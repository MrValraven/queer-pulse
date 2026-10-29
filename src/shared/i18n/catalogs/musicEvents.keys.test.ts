import { describe, expect, it } from "vitest";
import { admin as enAdmin } from "./en/admin";
import { admin as ptAdmin } from "./pt/admin";
import { gatherings as enGatherings } from "./en/gatherings";
import { gatherings as ptGatherings } from "./pt/gatherings";
import { shared as enShared } from "./en/shared";
import { shared as ptShared } from "./pt/shared";

type CatalogMap = Record<string, string | undefined>;

const CATALOGS: Record<string, { en: CatalogMap; pt: CatalogMap }> = {
  admin: { en: enAdmin, pt: ptAdmin },
  gatherings: { en: enGatherings, pt: ptGatherings },
  shared: { en: enShared, pt: ptShared },
};

const MUSIC_EVENT_AUDIT_ACTIONS = [
  "music_event_created",
  "music_event_updated",
  "music_event_cancelled",
  "music_event_lineup_changed",
  "music_event_announcement_posted",
  "music_event_guest_removed",
  "music_event_guest_barred",
  "music_event_guest_bar_lifted",
  "music_event_waitlist_promoted",
  "music_event_invites_sent",
  "music_event_invite_decided",
  "music_event_cohost_added",
  "music_event_cohost_removed",
  "music_event_go_together_changed",
  "music_event_guests_exported",
];

/** Every key the Music manager & producer build reads, as `namespace:key`. */
export const MUSIC_EVENT_KEYS: string[] = [
  "gatherings:catalog.family.music.name",
  "shared:staffBadge.grant.musicManagerProducer",
  "shared:adminNav.items.musicEvents",
  "shared:apiError.musicEvent.notFound",
  "shared:apiError.musicEvent.familyLocked",
  "shared:apiError.musicEvent.communityUnavailable",
  "shared:apiError.musicEvent.performerNotStudioArtist",
  "shared:apiError.musicEvent.cohostIsYou",
  "shared:apiError.musicEvent.cohostHoldsGrant",
  "shared:apiError.musicEvent.cohostIsStaffTier",
  "shared:apiError.musicEvent.cohostNotActive",
  "shared:apiError.musicEvent.memberNotFound",
  "shared:apiError.musicEvent.inviteRequestNotFound",
  "admin:staffRoles.musicManagerProducer.label",
  "admin:staffRoles.musicManagerProducer.desc",
  "admin:musicEvents.eyebrow",
  "admin:musicEvents.title",
  "admin:musicEvents.sub",
  "admin:musicEvents.createCta",
  "admin:musicEvents.tabs.upcoming",
  "admin:musicEvents.tabs.past",
  "admin:musicEvents.tabs.cancelled",
  "admin:musicEvents.attention.requests_one",
  "admin:musicEvents.attention.requests_other",
  "admin:musicEvents.attention.lineup_one",
  "admin:musicEvents.attention.lineup_other",
  "admin:musicEvents.row.manageCta",
  "admin:musicEvents.row.manageAria",
  "admin:musicEvents.row.lineupLabel",
  "admin:musicEvents.row.lineupConfirmed_one",
  "admin:musicEvents.row.lineupConfirmed_other",
  "admin:musicEvents.row.lineupInvited_one",
  "admin:musicEvents.row.lineupInvited_other",
  "admin:musicEvents.row.lineupDeclined_one",
  "admin:musicEvents.row.lineupDeclined_other",
  "admin:musicEvents.row.requests_one",
  "admin:musicEvents.row.requests_other",
  "admin:musicEvents.row.cancelled",
  "admin:musicEvents.empty.upcoming.title",
  "admin:musicEvents.empty.upcoming.body",
  "admin:musicEvents.empty.past.title",
  "admin:musicEvents.empty.past.body",
  "admin:musicEvents.empty.cancelled.title",
  "admin:musicEvents.empty.cancelled.body",
  "admin:musicEvents.loadError",
  "admin:musicEvents.loadMore",
  "admin:musicEvents.new.title",
  "admin:musicEvents.new.lead",
  "admin:musicEvents.backCta",
  "admin:musicEvents.notFound.title",
  "admin:musicEvents.notFound.body",
  "admin:musicEvents.manageLoadError",
  "admin:musicEvents.lineupPicker.title",
  "admin:musicEvents.lineupPicker.sub",
  "admin:musicEvents.lineupPicker.searchPlaceholder",
  "admin:musicEvents.lineupPicker.empty",
  "admin:musicEvents.lineupPicker.emptyAll",
  "admin:musicEvents.lineupPicker.allListed",
  "admin:musicEvents.lineupPicker.loadError",
  "admin:musicEvents.lineupPicker.personas",
  "admin:musicEvents.cohostAdd.confirmTitle",
  "admin:musicEvents.cohostAdd.confirmBody",
  "admin:musicEvents.cohostAdd.confirmCta",
  "admin:musicEvents.cohostAdd.pickOther",
  "admin:musicEvents.cohostAdd.addedToast",
  "admin:musicEvents.house.successLead",
  "admin:musicEvents.house.cohostsNote",
  "admin:musicEvents.house.formatSearchPlaceholder",
  "admin:musicEvents.house.capacityHint",
  "admin:musicEvents.house.titleExample",
  ...MUSIC_EVENT_AUDIT_ACTIONS.flatMap((action) => [
    `admin:platformLog.kind.mod.${action}`,
    `admin:platformLog.kind.mod.${action}.target`,
    `admin:governance.audit.actionType.${action}`,
  ]),
];

const valueOf = (language: "en" | "pt", namespacedKey: string) => {
  const separatorIndex = namespacedKey.indexOf(":");
  const namespace = namespacedKey.slice(0, separatorIndex);
  const key = namespacedKey.slice(separatorIndex + 1);
  return CATALOGS[namespace]?.[language][key];
};

const tokensOf = (value: string) =>
  [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("Music events catalog keys", () => {
  it("has every music events key in English and Portuguese", () => {
    for (const key of MUSIC_EVENT_KEYS) {
      expect(valueOf("en", key), `en ${key}`).toEqual(expect.any(String));
      expect(valueOf("pt", key), `pt ${key}`).toEqual(expect.any(String));
    }
  });

  it("keeps the same {tokens} in both languages", () => {
    for (const key of MUSIC_EVENT_KEYS)
      expect(tokensOf(valueOf("pt", key) ?? ""), key).toEqual(
        tokensOf(valueOf("en", key) ?? ""),
      );
  });

  it("fits Portuguese action labels on a phone row", () => {
    for (const key of [
      "admin:musicEvents.createCta",
      "admin:musicEvents.row.manageCta",
      "admin:musicEvents.cohostAdd.confirmCta",
      "admin:musicEvents.backCta",
    ])
      expect((valueOf("pt", key) ?? "").length, key).toBeLessThanOrEqual(32);
    for (const key of [
      "admin:musicEvents.tabs.upcoming",
      "admin:musicEvents.tabs.past",
      "admin:musicEvents.tabs.cancelled",
    ])
      expect((valueOf("pt", key) ?? "").length, key).toBeLessThanOrEqual(12);
  });

  it("never says gathering in the new copy", () => {
    for (const key of MUSIC_EVENT_KEYS)
      for (const language of ["en", "pt"] as const)
        expect(valueOf(language, key) ?? "", `${language} ${key}`).not.toMatch(
          /gathering|convívio/i,
        );
  });
});
