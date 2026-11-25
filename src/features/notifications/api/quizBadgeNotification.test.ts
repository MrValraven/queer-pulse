import { beforeAll, describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import { buildNotifications, DEMO_UNREAD_IDS } from "../notificationsList.data";
import { DEMO_QUIZ_BADGE_NOTIFICATION_ID } from "../quizBadgeNotifications.data";
import { formatNotification } from "./formatNotification";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";
import { quizBadgeEarnedText } from "./quizBadgeNotification";

const catalogsByLanguage: Record<Language, Record<string, Catalog>> = {
  en: {},
  pt: {},
};

beforeAll(async () => {
  for (const language of ["en", "pt"] as const) {
    // The demo list also carries rows that read the communities and admin
    // namespaces.
    for (const namespace of [
      "notifications",
      "communities",
      "admin",
    ] as const) {
      catalogsByLanguage[language][namespace] = await loadNamespace(
        language,
        namespace,
      );
    }
  }
});

function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { namespace, path } = parseKey(key);
    const catalog = catalogsByLanguage[language][namespace];
    const hit = catalog
      ? resolveEntry(catalog, path, language, options)
      : undefined;
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

const english = (key: string, options?: TranslateOptions) =>
  makeT("en")(key, options);
const portuguese = (key: string, options?: TranslateOptions) =>
  makeT("pt")(key, options);
const fmt = createFormatters("en");

/** A notification shaped as the backend serves it. */
function dto(type: string, payload: Record<string, unknown>): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type,
    payload,
    read: false,
    createdAt: "2026-07-16T10:30:00.000Z",
  };
}

const quizPayload = {
  badgeKey: "quiz:d1",
  badgeName: "Quiz Night Champion",
  badgeNamePt: "Campeã da noite de quiz",
  eventName: "Pride Brunch: June Edition",
};

describe("quiz badge notifications", () => {
  it("names the badge and the event of a quiz win", () => {
    expect(quizBadgeEarnedText(quizPayload, english, "en")).toBe(
      "You won the Quiz Night Champion badge at Pride Brunch: June Edition.",
    );
    expect(
      formatNotification("badge_earned", quizPayload, english, fmt).text,
    ).toBe(
      "You won the Quiz Night Champion badge at Pride Brunch: June Edition.",
    );
  });

  it("names the Portuguese badge for a Portuguese viewer and falls back to English", () => {
    const portugueseText = quizBadgeEarnedText(quizPayload, portuguese, "pt");
    expect(portugueseText).toContain("Campeã da noite de quiz");
    expect(portugueseText).toContain("Pride Brunch: June Edition");
    const fallbackText = quizBadgeEarnedText(
      { ...quizPayload, badgeNamePt: null },
      portuguese,
      "pt",
    );
    expect(fallbackText).toContain("Quiz Night Champion");
    expect(fallbackText).not.toContain("Campeã");
    const englishViewerText = quizBadgeEarnedText(quizPayload, english, "en");
    expect(englishViewerText).not.toContain("Campeã");
  });

  it("keeps the platform badge sentence without an event name", () => {
    expect(
      formatNotification(
        "badge_earned",
        { badgeKey: "regular", badgeName: "Regular" },
        english,
      ).text,
    ).toBe("You earned the Regular badge.");
    expect(
      quizBadgeEarnedText(
        { badgeName: "Regular", eventName: " " },
        english,
        "en",
      ),
    ).toBeNull();
    expect(quizBadgeEarnedText(null, english, undefined)).toBeNull();
  });

  it("keeps the platform sentence when both badge names are blank", () => {
    expect(
      quizBadgeEarnedText(
        { badgeName: " ", badgeNamePt: null, eventName: "Pride Brunch" },
        english,
        "en",
      ),
    ).toBeNull();
  });

  it("keeps the badge link for a quiz key", () => {
    const view = notificationDtoToView(
      dto("badge_earned", { ...quizPayload, badgeKey: "quiz:d1" }),
      english,
      fmt,
      "en",
    );
    expect(view.sourceHref).toBe(`${routes.badges}?badge=quiz%3Ad1`);
    expect(view.text).toBe(
      "You won the Quiz Night Champion badge at Pride Brunch: June Edition.",
    );
  });

  it("adds the demo row unread", () => {
    const rows = buildNotifications(english, fmt, "en");
    const row = rows.find(
      (candidate) => candidate.id === DEMO_QUIZ_BADGE_NOTIFICATION_ID,
    );
    expect(DEMO_QUIZ_BADGE_NOTIFICATION_ID).toBe(42);
    expect(row?.unread).toBe(true);
    expect(row?.text).toBe(
      "You won the Quiz Night Champion badge at Pride Brunch: June Edition.",
    );
    expect(row?.sourceHref).toBe(
      `${routes.badges}?badge=${encodeURIComponent("quiz:demo-quiz-badge-champion")}`,
    );
    expect(DEMO_UNREAD_IDS).toContain(DEMO_QUIZ_BADGE_NOTIFICATION_ID);
  });
});
