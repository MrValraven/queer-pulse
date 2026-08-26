import { beforeAll, describe, expect, it } from "vitest";
import { loadNamespace, loadPtNamespace } from "../../../shared/i18n/catalogs";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import { formatNotification } from "./formatNotification";

/**
 * TS-04's staff alert is the one notification kind whose copy lives in the
 * `admin` namespace rather than `notifications` (its whole vocabulary is
 * shared with the queue-health panel, and it is served only to staff), so it
 * needs its own `t` bound to that catalog. Everything else about it is checked
 * the way `formatNotification.test.ts` checks the rest: against the REAL
 * catalogs, so a missing key fails here instead of printing a raw key on a
 * moderator's screen.
 */
const resolved: Record<Language, Catalog | undefined> = {
  en: undefined,
  pt: undefined,
};

beforeAll(async () => {
  resolved.en = await loadNamespace("en", "admin");
  resolved.pt = await loadPtNamespace("admin");
});

function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const hit = resolveEntry(resolved[language], path, language, options);
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

const ALERT = "moderation_queue_alert";

function payload(overrides: Record<string, unknown> = {}) {
  return {
    source: "moderation",
    queue: "invite_requests",
    severity: "warning",
    depth: 18,
    overdueCount: 3,
    oldestItemHours: 55.5,
    ...overrides,
  };
}

describe("moderation_queue_alert copy", () => {
  it("names the queue, the depth, the overdue count and the longest wait", () => {
    const t = makeT("en");
    const result = formatNotification(ALERT, payload(), t);

    expect(result.text).toBe(
      "Invite requests has 18 items waiting, 3 past their window. Longest wait: 55.5 hours.",
    );
    expect(result.category).toBe("platform");
    expect(result.kind).toBe(ALERT);
  });

  it("pluralises each number on its own", () => {
    const t = makeT("en");
    const result = formatNotification(
      ALERT,
      payload({ depth: 1, overdueCount: 1, oldestItemHours: 1 }),
      t,
    );

    expect(result.text).toBe(
      "Invite requests has 1 item waiting, 1 past its window. Longest wait: 1 hour.",
    );
  });

  it("reads a null oldest wait as an empty queue rather than a gap", () => {
    const t = makeT("en");
    const result = formatNotification(
      ALERT,
      payload({
        severity: "ok",
        depth: 0,
        overdueCount: 0,
        oldestItemHours: null,
      }),
      t,
    );

    expect(result.text).toBe(
      "Invite requests is back to normal, with 0 items waiting.",
    );
    expect(result.meta).toBe("Nothing to do. Thanks for clearing it.");
  });

  it("uses the recovery copy for severity ok and the urgent copy for critical", () => {
    const t = makeT("en");
    const recovery = formatNotification(ALERT, payload({ severity: "ok" }), t);
    const critical = formatNotification(
      ALERT,
      payload({ severity: "critical" }),
      t,
    );

    expect(recovery.text).toContain("back to normal");
    expect(critical.meta).toContain("Past a window we published");
  });

  it("falls back to the warning level for an unrecognised severity", () => {
    const t = makeT("en");
    const result = formatNotification(
      ALERT,
      payload({ severity: "meltdown" }),
      t,
    );

    // Neither claims the platform is failing somebody nor that it recovered.
    expect(result.meta).toBe("Worth a look when someone has time.");
  });

  it("reads as a sentence when the queue key is one this build has no copy for", () => {
    const t = makeT("en");
    const result = formatNotification(
      ALERT,
      payload({ queue: "future_desk" }),
      t,
    );

    expect(result.text).toContain("Another queue");
    expect(result.text).not.toContain("future_desk");
  });

  it("renders in Portuguese from the same payload", () => {
    const t = makeT("pt");
    const result = formatNotification(ALERT, payload(), t);

    expect(result.text).toContain("Pedidos de convite");
    expect(result.text.trim()).not.toBe("");
    expect(result.meta.trim()).not.toBe("");
  });
});
