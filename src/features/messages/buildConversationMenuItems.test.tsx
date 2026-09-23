// src/features/messages/buildConversationMenuItems.test.tsx
import { describe, expect, it, vi } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import { buildConversationMenuItems } from "./buildConversationMenuItems";

/** Echoes the chosen key and its params, so each test pins WHICH catalog
 *  entry the builder picked without depending on the catalog's wording
 *  (mirrors `systemMessageText.test.ts`'s own `echo`). */
const echo: TFunction = (key, options) =>
  options && Object.keys(options).length > 0
    ? `${key} ${JSON.stringify(options)}`
    : key;

function baseParams(
  overrides: Partial<Parameters<typeof buildConversationMenuItems>[0]>,
) {
  return {
    t: echo,
    name: "Ana",
    getMediaTrigger: () => null,
    onOpenWallpaper: vi.fn(),
    muteItems: [],
    groupReportItems: [],
    blocked: false,
    onBeginBlock: vi.fn(),
    onManageBlockedMembers: vi.fn(),
    onOpenReport: vi.fn(),
    ...overrides,
  };
}

describe("buildConversationMenuItems, business mailboxes (PRD-376)", () => {
  it("offers the identity block and report for a customer's view of a business", () => {
    const onBeginIdentityBlock = vi.fn();
    const onOpenIdentityReport = vi.fn();
    const onBeginBlock = vi.fn();
    const onOpenReport = vi.fn();
    const items = buildConversationMenuItems(
      baseParams({
        safety: {
          slug: "cafe-lisboa",
          reportSubjectId: "identity-cafe-lisboa",
        },
        counterpartIdentityKind: "listing",
        businessName: "Café Lisboa",
        onBeginBlock,
        onOpenReport,
        onBeginIdentityBlock,
        onOpenIdentityReport,
      }),
    );
    const labels = items.map((item) => item.label);

    expect(labels).toContain(
      'messages:mailbox.block.action {"name":"Café Lisboa"}',
    );
    expect(labels).toContain(
      'messages:mailbox.report.action {"name":"Café Lisboa"}',
    );
    expect(
      labels.some((label) => label.startsWith("safety:profileMenu.block")),
    ).toBe(false);
    expect(
      labels.some((label) =>
        label.startsWith("messages:conversation.reportMemberAction"),
      ),
    ).toBe(false);

    items.find((item) => item.key === "block")!.onSelect();
    expect(onBeginIdentityBlock).toHaveBeenCalledTimes(1);
    expect(onBeginBlock).not.toHaveBeenCalled();

    items.find((item) => item.key === "report")!.onSelect();
    expect(onOpenIdentityReport).toHaveBeenCalledTimes(1);
    expect(onOpenReport).not.toHaveBeenCalled();

    // The blocked-members link stays, unchanged, for every DM.
    expect(items.some((item) => item.key === "blockedMembers")).toBe(true);
  });

  it("keeps the person block and report for a staff member's view of a customer", () => {
    const onBeginBlock = vi.fn();
    const onOpenReport = vi.fn();
    const items = buildConversationMenuItems(
      baseParams({
        safety: { slug: "tiago", reportSubjectId: "user-tiago" },
        onBeginBlock,
        onOpenReport,
        // No counterpartIdentityKind: a seated staff row's customer is a
        // person, even though the row itself belongs to a mailbox.
      }),
    );
    const labels = items.map((item) => item.label);

    expect(labels).toContain('safety:profileMenu.block {"name":"Ana"}');
    expect(labels).toContain(
      'messages:conversation.reportMemberAction {"name":"Ana"}',
    );
    expect(
      labels.some((label) => label.startsWith("messages:mailbox.block")),
    ).toBe(false);
    expect(
      labels.some((label) => label.startsWith("messages:mailbox.report")),
    ).toBe(false);

    items.find((item) => item.key === "block")!.onSelect();
    expect(onBeginBlock).toHaveBeenCalledTimes(1);
  });

  it("drops the whole safety block for a former business", () => {
    const items = buildConversationMenuItems(
      baseParams({
        safety: { slug: "cafe-lisboa", reportSubjectId: undefined },
        counterpartIdentityKind: "listing",
        isCounterpartFormerBusiness: true,
        businessName: "Café Lisboa",
      }),
    );
    expect(items.some((item) => item.key === "block")).toBe(false);
    expect(items.some((item) => item.key === "blockedMembers")).toBe(false);
    expect(items.some((item) => item.key === "report")).toBe(false);
  });
});
