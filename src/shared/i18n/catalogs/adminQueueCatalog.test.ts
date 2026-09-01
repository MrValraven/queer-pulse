import { describe, expect, it } from "vitest";
import { ADMIN_QUEUE_KEYS } from "../../../features/notifications/api/adminQueueRoutes";
import { admin as adminEn } from "./en/admin";

/**
 * parity.test.ts already asserts, for every namespace including this one,
 * that pt/admin declares exactly the same keys as en/admin and that none of
 * pt/admin's values are empty. That covers the EN/PT symmetry half of "does
 * every queue have a label in both languages." Duplicating it here would
 * just be the same check twice.
 *
 * What parity.test.ts cannot catch is a queue key that has no
 * `moderationHealth.queue.<key>` entry at all, in either language: it has no
 * notion of ADMIN_QUEUE_KEYS, so a queue silently missing its label (in both
 * catalogs at once) would pass parity while still rendering the "unknown
 * queue" fallback in the bell. This file owns that half, checked against the
 * EN catalog: if a key exists here, parity guarantees it also exists,
 * non-empty, in PT.
 */
describe("admin queue catalog coverage", () => {
  it.each(ADMIN_QUEUE_KEYS)("names %s in the admin catalog", (queue) => {
    const key = `moderationHealth.queue.${queue}`;
    expect(adminEn[key]).toBeTruthy();
  });

  it("carries all three queueArrival entries", () => {
    expect(adminEn["queueArrival.text_one"]).toBeTruthy();
    expect(adminEn["queueArrival.text_other"]).toBeTruthy();
    expect(adminEn["queueArrival.meta"]).toBeTruthy();
  });
});
