// src/features/messages/ConversationMenu.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DEMO_IDENTITY } from "./demoIdentities.data";
import { ConversationMenu } from "./ConversationMenu";

/** Opens the kebab menu and returns its visible item labels. Catalog
 *  namespaces load lazily (`I18nProvider`), so the trigger's accessible
 *  name only resolves after an await. */
async function openMenuItems() {
  const trigger = await screen.findByRole("button", {
    name: /more options/i,
  });
  fireEvent.click(trigger);
  return screen.findAllByRole("menuitem");
}

/** Opens the kebab menu once and asserts no item's text ever matches either
 *  `patterns` entry. Polls repeatedly: `useMessageViewer`'s own mailboxes
 *  query resolves asynchronously (own-mailbox suppression, m-6), so an item
 *  present on the very first render can still disappear a tick later. */
async function expectNoMenuItemMatching(...patterns: RegExp[]) {
  const trigger = await screen.findByRole("button", {
    name: /more options/i,
  });
  fireEvent.click(trigger);
  await waitFor(() => {
    const labels = screen
      .queryAllByRole("menuitem")
      .map((item) => item.textContent ?? "");
    for (const pattern of patterns) {
      expect(labels.some((label) => pattern.test(label))).toBe(false);
    }
  });
}

/** Opens the kebab menu and clicks the single "Report…" item: there is at
 *  most one report item on a DM, identity or person. */
async function openAndClickReport() {
  const items = await openMenuItems();
  const reportItem = items.find((item) =>
    /report/i.test(item.textContent ?? ""),
  );
  if (!reportItem) throw new Error("no report menu item found");
  fireEvent.click(reportItem);
}

describe("ConversationMenu, business mailboxes (PRD-376)", () => {
  // Controller note: `safety` still carries the business's own HANDLE for a
  // business counterpart (`livrariaAuroraConversation`'s `slug`), so this
  // pins that the menu routes the block/report flow through the identity
  // block/report, driven by the `counterpart` prop `ConversationHeader`
  // passes; this is real usage, so the fallback cache lookup never runs.
  it("opens the identity report for a customer's view of a business", async () => {
    render(
      <ConversationMenu
        conversationId="demo-livraria-aurora"
        name="Livraria Aurora"
        safety={{ slug: "livraria-aurora", reportSubjectId: undefined }}
        counterpart={{
          name: "Livraria Aurora",
          slug: "livraria-aurora",
          counterpartIdentityId: DEMO_IDENTITY.livrariaAurora,
          counterpartIdentityKind: "listing",
        }}
      />,
      { wrapper: TestProviders },
    );

    await openAndClickReport();

    // ReportListingModal's title ("What's wrong with Livraria Aurora?").
    // ConversationReportModal's own title ("Report {name}?") is checked
    // absent right below.
    expect(
      await screen.findByText((_, node) =>
        (node?.textContent ?? "").startsWith("What's wrong with"),
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Report Livraria Aurora?")).toBeNull();

    // The reason list is the identity taxonomy: it carries `housing_scam`
    // and leaves out `outing`, the code for what one person did to another,
    // a person-report-only concern.
    expect(await screen.findByText("Scam or fake listing")).toBeInTheDocument();
    expect(
      screen.queryByText("Outing / sharing private identity without consent"),
    ).toBeNull();
  });

  it("keeps the person report for a staff member's view of a customer", async () => {
    render(
      <ConversationMenu
        conversationId="demo-cafe-lisboa-nuno"
        name="Nuno"
        safety={{ slug: "nuno", reportSubjectId: "nuno" }}
        counterpart={{ name: "Nuno Alves", slug: "nuno" }}
      />,
      { wrapper: TestProviders },
    );

    await openAndClickReport();

    expect(await screen.findByText("Report Nuno?")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Outing / sharing private identity without consent",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Scam or fake listing")).toBeNull();
  });

  // The fallback cache lookup path (`counterpart` prop absent): still finds
  // the seeded row and behaves exactly like the props path above.
  it("falls back to the cache lookup and still opens the identity report", async () => {
    render(
      <ConversationMenu
        conversationId="demo-livraria-aurora"
        name="Livraria Aurora"
        safety={{ slug: "livraria-aurora", reportSubjectId: undefined }}
      />,
      { wrapper: TestProviders },
    );

    await openAndClickReport();

    expect(
      await screen.findByText((_, node) =>
        (node?.textContent ?? "").startsWith("What's wrong with"),
      ),
    ).toBeInTheDocument();
  });

  // m-5: a counterpart the fallback cannot resolve at all (no `counterpart`
  // prop, and the conversation id sits in no cache and no demo seed) offers
  // no safety action at all. This is the case that used to fall back to the
  // person flow against a business's own handle.
  it("offers no block or report item when the counterpart cannot be resolved", async () => {
    render(
      <ConversationMenu
        conversationId="conversation-nowhere-in-any-cache"
        name="Somebody"
        safety={{ slug: "somebody", reportSubjectId: "somebody" }}
      />,
      { wrapper: TestProviders },
    );

    await expectNoMenuItemMatching(/report/i, /block/i);
  });

  // m-6: a member who staffs this same business but still has a personal
  // thread with it (they were a customer before joining the team). Neither
  // action can succeed against the viewer's own mailbox
  // (`IDENTITY_BLOCK_OWN`, 403 on the report), so both stay off the menu.
  it("offers no block or report item for a business the viewer also staffs", async () => {
    render(
      <ConversationMenu
        conversationId="demo-viewer-is-also-staff"
        name="Café Lisboa"
        safety={{ slug: "cafe-lisboa", reportSubjectId: undefined }}
        counterpart={{
          name: "Café Lisboa",
          slug: "cafe-lisboa",
          counterpartIdentityId: DEMO_IDENTITY.cafeLisboa,
          counterpartIdentityKind: "listing",
        }}
      />,
      { wrapper: TestProviders },
    );

    await expectNoMenuItemMatching(/report/i, /block/i);
  });
});
