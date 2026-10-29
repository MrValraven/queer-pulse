import { describe, expect, it } from "vitest";
import { studio as en } from "./en/studio";
import { studio as pt } from "./pt/studio";
import { studioShowcase as enShowcase } from "./en/studioShowcase";
import { studioShowcase as ptShowcase } from "./pt/studioShowcase";
import { notifications as enNotifications } from "./en/notifications";
import { notifications as ptNotifications } from "./pt/notifications";
import { settings as enSettings } from "./en/settings";
import { settings as ptSettings } from "./pt/settings";
import { safety as enSafety } from "./en/safety";
import { safety as ptSafety } from "./pt/safety";
import { marketing as enMarketing } from "./en/marketing";
import { marketing as ptMarketing } from "./pt/marketing";
import type { Catalog } from "../types";

/** Every new studio key the Studio purchases build reads (plan Task 0, Steps 6 and 7). */
const NEW_KEYS = [
  "libraryLive.tabs.purchases",
  "purchase.format.album",
  "purchase.format.ep",
  "purchase.format.single",
  "purchase.format.track",
  "purchase.format.release",
  "purchase.price.nameYourPrice",
  "purchase.panel.label",
  "purchase.panel.buy.album",
  "purchase.panel.buy.ep",
  "purchase.panel.buy.single",
  "purchase.panel.buy.track",
  "purchase.panel.buy.release",
  "purchase.panel.buyAria",
  "purchase.panel.tracksOnly",
  "purchase.panel.directNote",
  "purchase.panel.ownPersonaLink",
  "purchase.panel.owned",
  "purchase.panel.downloadCta",
  "purchase.panel.hideDownloadsCta",
  "purchase.panel.pending",
  "purchase.panel.pendingAmount",
  "purchase.panel.showWaysToPay",
  "purchase.panel.hideWaysToPay",
  "purchase.panel.cancelCta",
  "purchase.panel.openPurchases",
  "purchase.panel.loading",
  "purchase.cancel.title",
  "purchase.cancel.body",
  "purchase.cancel.confirm",
  "purchase.cancel.keep",
  "purchase.cancel.done",
  "purchase.cancel.failed",
  "purchase.sheet.title",
  "purchase.sheet.sub",
  "purchase.sheet.amountHeading",
  "purchase.sheet.amountLabel",
  "purchase.sheet.amountHint",
  "purchase.sheet.quickPicksLabel",
  "purchase.sheet.amountRequired",
  "purchase.sheet.payHeading",
  "purchase.sheet.payIntro",
  "purchase.sheet.methodsLabel",
  "purchase.sheet.payerLabel",
  "purchase.sheet.payerHint",
  "purchase.sheet.wallLegend",
  "purchase.sheet.notice",
  "purchase.sheet.paidCta",
  "purchase.sheet.createFailed",
  "purchase.sheet.doneStatus",
  "purchase.sheet.loading",
  "purchase.reference.label",
  "purchase.reference.line",
  "purchase.reference.loading",
  "purchase.reference.loadFailed",
  "purchase.reference.retryCta",
  "purchase.reference.neededReason",
  "purchase.reference.neededReasonFailed",
  "purchase.reference.copyCta",
  "purchase.reference.copyAria",
  "purchase.reference.copied",
  "purchase.reference.copyFailed",
  "purchase.status.pending",
  "purchase.status.confirmed",
  "purchase.status.declined",
  "purchase.status.cancelled",
  "purchase.status.expired",
  "purchase.statusLine.pending",
  "purchase.statusLine.expired",
  "purchase.statusLine.cancelled",
  "purchase.statusLine.declinedAgain",
  "purchase.declineReason.payment_not_found",
  "purchase.declineReason.amount_different",
  "purchase.declineReason.other",
  "purchase.declineNoteLine",
  "purchase.list.heading",
  "purchase.list.dek",
  "purchase.list.label",
  "purchase.list.empty",
  "purchase.list.showMore",
  "purchase.row.amount",
  "purchase.row.date",
  "purchase.row.byArtist",
  "purchase.row.itemGone",
  "purchase.downloads.heading",
  "purchase.downloads.listLabel",
  "purchase.downloads.formatNote",
  "purchase.downloads.cta",
  "purchase.downloads.ctaAria",
  "purchase.downloads.failed",
  "purchase.downloads.demoToast",
  "purchase.downloads.none",
  "purchase.downloads.mp3",
  "purchase.downloads.m4a",
  "purchase.wall.toggle",
  "purchase.wall.body",
  "purchase.wall.shownAs",
  "purchase.wall.pickAgain",
  "purchase.wall.pendingNote",
  "purchase.wall.saved",
  "purchase.wall.removed",
  "purchase.wall.saveFailed",
  "purchase.inbox.nav",
  "purchase.inbox.badge_one",
  "purchase.inbox.badge_other",
  "purchase.inbox.pageTitle",
  "purchase.inbox.eyebrow",
  "purchase.inbox.title",
  "purchase.inbox.dek",
  "purchase.inbox.personaLabel",
  "purchase.inbox.tabsLabel",
  "purchase.inbox.unknownPersona",
  "purchase.inbox.tab.confirm",
  "purchase.inbox.tab.sales",
  "purchase.inbox.listLabel",
  "purchase.inbox.empty",
  "purchase.inbox.reference",
  "purchase.inbox.payerName",
  "purchase.inbox.deletedAccount",
  "purchase.inbox.claimedOn",
  "purchase.inbox.confirmCta",
  "purchase.inbox.confirmAria",
  "purchase.inbox.declineCta",
  "purchase.inbox.declineAria",
  "purchase.inbox.confirmed",
  "purchase.inbox.declined",
  "purchase.inbox.confirmFailed",
  "purchase.inbox.declineFailed",
  "purchase.inbox.showMore",
  "purchase.inbox.loadingMore",
  "purchase.decline.title",
  "purchase.decline.body",
  "purchase.decline.reasonLegend",
  "purchase.decline.reason.payment_not_found",
  "purchase.decline.reason.amount_different",
  "purchase.decline.reason.other",
  "purchase.decline.noteLabel",
  "purchase.decline.notePlaceholder",
  "purchase.decline.confirm",
  "purchase.decline.keep",
  "purchase.sales.totalsLabel",
  "purchase.sales.last28",
  "purchase.sales.allTime",
  "purchase.sales.count_one",
  "purchase.sales.count_other",
  "purchase.sales.note",
  "purchase.sales.listLabel",
  "purchase.sales.empty",
  "purchase.sales.confirmedOn",
  "purchase.sales.showMore",
  "purchase.sales.loadingMore",
  "purchase.account.pageTitle",
  "purchase.account.eyebrow",
  "purchase.account.title",
  "purchase.account.dek",
  "purchase.account.empty",
  "purchase.account.cardTitle",
  "purchase.account.cardDesc",
  "purchase.account.cardCta",
  "purchase.price.legend",
  "purchase.price.trackLegend",
  "purchase.price.mode.not_for_sale",
  "purchase.price.mode.fixed",
  "purchase.price.mode.name_your_price",
  "purchase.price.amountLabel.fixed",
  "purchase.price.amountLabel.name_your_price",
  "purchase.price.hint.fixed",
  "purchase.price.hint.name_your_price",
  "purchase.price.amountRequired",
  "purchase.price.directNote",
  "purchase.price.needsMethods",
  "purchase.price.needsMethodsCta",
  "purchase.price.notOutNote",
  "paymentMethods.label",
  "paymentMethods.title",
  "paymentMethods.dek",
  "paymentMethods.personaLabel",
  "paymentMethods.listLabel",
  "paymentMethods.privacyNote",
  "paymentMethods.empty",
  "paymentMethods.addCta",
  "paymentMethods.saveCta",
  "paymentMethods.saved",
  "paymentMethods.saveFailed",
  "paymentMethods.rowError",
  "paymentMethods.rowLegend",
  "paymentMethods.lastMethodWarning",
  "paymentMethods.noPersona",
  "wall.heading",
  "wall.listLabel",
  "wall.showAll",
  "wall.loadMoreFailed",
  "owner.v3.paymentsLink",
  "owner.v3.gettingPaidLink",
  "errors.what.purchases",
  "errors.what.paymentMethods",
  "errors.what.sales",
  "errors.what.wall",
  "errors.what.offer",
  "errors.what.paymentsInbox",
  "errors.reason.studio_persona_not_found",
  "errors.reason.studio_release_type_not_for_sale",
  "errors.reason.studio_price_out_of_range",
  "errors.reason.studio_payment_methods_needed_for_sale",
  "errors.reason.studio_payment_methods_limit",
  "errors.reason.studio_payment_link_invalid",
  "errors.reason.studio_payment_mbway_invalid",
  "errors.reason.studio_payment_iban_invalid",
  "errors.reason.studio_purchase_item_required",
  "errors.reason.studio_purchase_item_not_found",
  "errors.reason.studio_purchase_own_persona",
  "errors.reason.studio_purchase_not_for_sale",
  "errors.reason.studio_purchase_release_not_published",
  "errors.reason.studio_purchase_track_unavailable",
  "errors.reason.studio_purchase_unavailable",
  "errors.reason.studio_purchase_no_payment_methods",
  "errors.reason.studio_purchase_pending_exists",
  "errors.reason.studio_purchase_already_owned",
  "errors.reason.studio_purchase_amount_below_minimum",
  "errors.reason.studio_purchase_amount_above_cap",
  "errors.reason.studio_purchase_price_changed",
  "errors.reason.studio_purchase_reference_invalid",
  "errors.reason.studio_purchase_reference_taken",
  "errors.reason.studio_purchase_not_found",
  "errors.reason.studio_purchase_not_pending",
  "errors.reason.studio_purchase_wall_not_available",
  "errors.reason.studio_purchase_not_confirmed",
  "errors.reason.studio_download_item_deleted",
  "errors.reason.studio_download_track_removed",
  "errors.reason.studio_download_release_taken_down",
  "errors.reason.studio_download_artist_unavailable",
  "errors.reason.studio_download_track_withheld",
  "errors.reason.studio_download_track_not_ready",
  "errors.reason.studio_download_track_preparing",
  "helpLive.cat.buying.heading",
  "helpLive.cat.buying.blurb",
  "helpLive.faq.buying.q",
  "helpLive.faq.buying.a",
  "helpLive.faq.selling.q",
  "helpLive.faq.selling.a",
  "termsLive.sec.selling.num",
  "termsLive.sec.selling.heading",
  "termsLive.sec.selling.p1",
  "termsLive.sec.selling.p2",
];

/** Existing studio keys rewritten by the listen-supporter rename (contract
 *  10.6) and because Studio now sells music. */
const REWRITTEN_KEYS = [
  "listening.dek",
  "listening.supporting.heading",
  "listening.supporting.dek",
  "listening.supporting.since",
  "listening.supporting.empty",
  "listening.supporting.stop",
  "listening.supporting.stopAria",
  "listening.supporting.pausedNote",
  "supporter.heading",
  "supporter.body",
  "supporter.pausedNote",
  "supporter.removed",
  "supporter.removeFailed",
  "numbers.supporters.heading",
  "numbers.supporters.optedIn",
  "numbers.supporters.empty",
  "numbers.supporters.listLabel",
  "errors.reason.studio_supporter_artist_not_found",
  "errors.reason.studio_supporter_own_persona",
  "errors.what.supporting",
  "errors.what.supporter",
  "errors.what.topSupporters",
  "helpLive.faq.tracking.a",
  "helpLive.faq.stats.a",
  "termsLive.sec.stored.p1",
  "aboutLive.sec.next.p1",
  "aboutLive.hero.lede",
  "aboutLive.sec.today.p2",
  "helpLive.faq.whatIsStudio.a",
];

/** Action labels that sit in one row on a phone. */
const SHORT_LABEL_KEYS = [
  "purchase.panel.buy.album",
  "purchase.panel.buy.ep",
  "purchase.panel.buy.single",
  "purchase.panel.buy.track",
  "purchase.panel.buy.release",
  "purchase.panel.downloadCta",
  "purchase.panel.cancelCta",
  "purchase.inbox.confirmCta",
  "purchase.inbox.declineCta",
  "purchase.sheet.paidCta",
  "purchase.reference.copyCta",
  "purchase.downloads.cta",
  "paymentMethods.saveCta",
  "paymentMethods.addCta",
  "wall.showAll",
  "purchase.inbox.nav",
];

const TAB_KEYS = [
  "purchase.inbox.tab.confirm",
  "purchase.inbox.tab.sales",
  "libraryLive.tabs.purchases",
];

/** The new keys of the other namespaces, as [en, pt] catalog pairs. */
const SHOWCASE_PAIR: [Catalog, Catalog] = [enShowcase, ptShowcase];
const NOTIFICATIONS_PAIR: [Catalog, Catalog] = [
  enNotifications,
  ptNotifications,
];
const SETTINGS_PAIR: [Catalog, Catalog] = [enSettings, ptSettings];
const SAFETY_PAIR: [Catalog, Catalog] = [enSafety, ptSafety];
const MARKETING_PAIR: [Catalog, Catalog] = [enMarketing, ptMarketing];
const OTHER_NAMESPACE_KEYS: [[Catalog, Catalog], string][] = [
  [SHOWCASE_PAIR, "purchases.declineNote.rita"],
  [SHOWCASE_PAIR, "purchases.methodNote.mbway"],
  [SHOWCASE_PAIR, "purchases.methodNote.iban"],
  [SHOWCASE_PAIR, "purchases.methodLabel.bandcamp"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_claimed.text"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_claimed.text_one"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_claimed.text_other"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_claimed.meta"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_claimed.artistNameFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_claimed.itemTitleFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_confirmed.text"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_confirmed.meta"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_confirmed.artistNameFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_confirmed.itemTitleFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_declined.text"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_declined.meta"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_declined.artistNameFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_declined.itemTitleFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_declined.reasonFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_expired.text"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_expired.meta"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_expired.artistNameFallback"],
  [NOTIFICATIONS_PAIR, "type.studio_purchase_expired.itemTitleFallback"],
  [NOTIFICATIONS_PAIR, "purchaseDeclineReason.payment_not_found"],
  [NOTIFICATIONS_PAIR, "purchaseDeclineReason.amount_different"],
  [NOTIFICATIONS_PAIR, "purchaseDeclineReason.other"],
  [NOTIFICATIONS_PAIR, "actions.openPurchases"],
  [NOTIFICATIONS_PAIR, "actions.reviewPayments"],
  [SETTINGS_PAIR, "dataExport.type.activityLog.sub"],
  [SETTINGS_PAIR, "dataExport.type.subprofiles.sub"],
  [SAFETY_PAIR, "reason.paymentNeverConfirmed"],
  [MARKETING_PAIR, "privacy.whatWeCollect.activity.item6"],
];

const tokensOf = (value: string) =>
  [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("Studio purchases catalog keys", () => {
  it("exist in both languages with the same tokens", () => {
    for (const key of [...NEW_KEYS, ...REWRITTEN_KEYS]) {
      expect(en[key], `en ${key}`).toEqual(expect.any(String));
      expect(pt[key], `pt ${key}`).toEqual(expect.any(String));
      expect(tokensOf(pt[key] ?? ""), key).toEqual(tokensOf(en[key] ?? ""));
    }
  });
  it("keeps the other namespaces in parity", () => {
    for (const [[enCatalog, ptCatalog], key] of OTHER_NAMESPACE_KEYS) {
      expect(enCatalog[key], `en ${key}`).toEqual(expect.any(String));
      expect(ptCatalog[key], `pt ${key}`).toEqual(expect.any(String));
      expect(tokensOf(ptCatalog[key] ?? ""), key).toEqual(
        tokensOf(enCatalog[key] ?? ""),
      );
      for (const value of [enCatalog[key] ?? "", ptCatalog[key] ?? ""])
        expect(value, key).not.toMatch(/[\u2013\u2014]/);
    }
  });
  it("carry no dashes and no antithesis, and new product keys no closing full stop", () => {
    for (const key of [...NEW_KEYS, ...REWRITTEN_KEYS])
      for (const value of [en[key] ?? "", pt[key] ?? ""]) {
        expect(value, key).not.toMatch(/[\u2013\u2014]/);
        expect(value, key).not.toMatch(
          /, no[t] |rathe[r] than|instea[d] of|no[t] jus[t]|, neve[r] /,
        );
      }
    for (const key of NEW_KEYS.filter(
      (key) => !key.startsWith("helpLive.") && !key.startsWith("termsLive."),
    ))
      for (const value of [en[key] ?? "", pt[key] ?? ""])
        expect(value, key).not.toMatch(/\.$/);
  });
  it("keeps PT action labels and tabs short enough for a phone row", () => {
    for (const key of SHORT_LABEL_KEYS)
      expect((pt[key] ?? "").length, key).toBeLessThanOrEqual(26);
    for (const key of TAB_KEYS)
      expect((pt[key] ?? "").length, key).toBeLessThanOrEqual(14);
  });
  it("names the visible button text in each inbox and copy accessible name", () => {
    expect(en["purchase.panel.buyAria"]).toBe("{action}: {title} by {artist}");
    expect(pt["purchase.panel.buyAria"]).toBe("{action}: {title} de {artist}");
    expect(en["purchase.inbox.confirmAria"]).toContain(
      en["purchase.inbox.confirmCta"],
    );
    expect(pt["purchase.inbox.confirmAria"]).toContain(
      pt["purchase.inbox.confirmCta"],
    );
    expect(en["purchase.inbox.declineAria"]).toContain(
      en["purchase.inbox.declineCta"],
    );
    expect(pt["purchase.inbox.declineAria"]).toContain(
      pt["purchase.inbox.declineCta"],
    );
    expect(en["purchase.reference.copyAria"]).toContain(
      en["purchase.reference.copyCta"],
    );
    expect(pt["purchase.reference.copyAria"]).toContain(
      pt["purchase.reference.copyCta"],
    );
  });
  it("names every purchase refusal, the preparing download included", () => {
    expect(en["errors.reason.studio_download_track_preparing"]).toBe(
      "We are preparing this file for you. Try again in a few minutes",
    );
    expect(en["errors.reason.studio_purchase_unavailable"]).toBe(
      "You cannot buy music from this artist",
    );
    expect(pt["errors.reason.studio_purchase_amount_above_cap"]).toBe(
      "Uma compra pode ir até 500 €",
    );
    expect(en["errors.reason.studio_purchase_reference_invalid"]).toBe(
      "This payment code is too old. Get a new code below, and if you already paid with the old one, put the old code in the name field so the artist can match it",
    );
    expect(en["errors.reason.studio_purchase_reference_taken"]).toBe(
      "This payment code was just taken by another purchase. Get a new code below",
    );
  });
  it("renames the listen supporters to top listeners", () => {
    expect(en["supporter.heading"]).toBe(
      "Show me among {persona}'s top listeners",
    );
    expect(en["numbers.supporters.heading"]).toBe("Top listeners");
    expect(pt["numbers.supporters.heading"]).toBe("Quem mais te ouve");
    for (const key of REWRITTEN_KEYS)
      expect(en[key] ?? "", key).not.toMatch(
        /as a supporter|top supporters|Artists you support/,
      );
  });
  it("no longer says Studio has no money", () => {
    for (const key of [
      "aboutLive.hero.lede",
      "aboutLive.sec.today.p2",
      "helpLive.faq.whatIsStudio.a",
      "aboutLive.sec.next.p1",
    ]) {
      expect(en[key] ?? "", key).not.toMatch(/listen-only|no money in Studio/i);
      expect(pt[key] ?? "", key).not.toMatch(/só para ouvir|não há dinheiro/i);
    }
  });
  it("uses gender-neutral people nouns in PT and says our team", () => {
    for (const key of NEW_KEYS) {
      expect(pt[key] ?? "", key).not.toMatch(
        /comprador|vendedor|seguidor|apoiador/i,
      );
      expect(en[key] ?? "", key).not.toMatch(/a real person/i);
    }
  });
  it("adds the notification, report reason, export and privacy lines", () => {
    expect(
      enNotifications["type.studio_purchase_claimed.text_other"],
    ).toContain("{count}");
    expect(enSafety["reason.paymentNeverConfirmed"]).toBe(
      "Took my payment and did not confirm it",
    );
    expect(enSettings["dataExport.type.activityLog.sub"]).toContain(
      "Studio purchases",
    );
    expect(enSettings["dataExport.type.subprofiles.sub"]).toContain(
      "Studio sales and payment methods",
    );
    expect(enMarketing["privacy.whatWeCollect.activity.item6"]).toContain(
      "MB WAY",
    );
  });
});
