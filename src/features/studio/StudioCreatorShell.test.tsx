import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { resetDemoPurchases } from "./api/studioDemoPurchaseStore";
import { StudioCreatorShell } from "./StudioCreatorShell";

async function renderShellAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <StudioCreatorShell>
        <div />
      </StudioCreatorShell>
    </TestProviders>,
  );
  await awaitCatalog("studio");
  return screen.getByRole("navigation", { name: "Creator pages" });
}

beforeEach(() => {
  resetDemoPurchases();
});

describe("StudioCreatorShell creator tabs (demo)", () => {
  it("lists Dashboard, New release, Credits, Press kit and Payments to confirm", async () => {
    const nav = await renderShellAt("/studio/dashboard");
    const labels = within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent ?? "");
    expect(labels).toHaveLength(5);
    expect(labels[4]).toMatch(/^Payments to confirm/);
    expect(
      within(nav).queryByRole("link", { name: "Payouts" }),
    ).not.toBeInTheDocument();
  });

  it("links Payments to confirm to the payments page with the waiting count", async () => {
    const nav = await renderShellAt("/studio/dashboard");
    expect(
      await within(nav).findByRole("link", {
        name: /^Payments to confirm\s?, \d+ payments? to confirm$/,
      }),
    ).toHaveAttribute("href", "/studio/payments");
  });

  it("marks Payments to confirm as the current page on /studio/payments", async () => {
    const nav = await renderShellAt("/studio/payments?tab=sales");
    const paymentsLink = within(nav).getByRole("link", {
      name: /^Payments to confirm/,
    });
    expect(paymentsLink).toHaveAttribute("aria-current", "page");
    expect(
      within(nav)
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page"),
    ).toEqual([paymentsLink]);
  });

  it("scrolls the current tab into view along the row", async () => {
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    try {
      const nav = await renderShellAt("/studio/payments");
      const paymentsLink = within(nav).getByRole("link", {
        name: /^Payments to confirm/,
      });
      const paymentsCallIndex = scrollSpy.mock.contexts.indexOf(paymentsLink);
      expect(paymentsCallIndex).toBeGreaterThanOrEqual(0);
      expect(scrollSpy.mock.calls[paymentsCallIndex]?.[0]).toMatchObject({
        inline: "nearest",
        block: "nearest",
      });
    } finally {
      scrollSpy.mockRestore();
    }
  });
});
