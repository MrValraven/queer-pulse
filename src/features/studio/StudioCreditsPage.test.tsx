import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoCreditLedger } from "./api/studioDemoCreditLedger";
import { StudioCreditsPage } from "./StudioCreditsPage";

const inboxControl = vi.hoisted(() => ({ isEmpty: false }));
vi.mock("./api/studioDemoCreditReads", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoCreditReads")>();
  return {
    ...original,
    demoStudioCreditInbox: () =>
      inboxControl.isEmpty
        ? { requests: [], accepted: [] }
        : original.demoStudioCreditInbox(),
    demoStudioCreditPendingCount: () =>
      inboxControl.isEmpty
        ? { count: 0 }
        : original.demoStudioCreditPendingCount(),
  };
});

afterEach(() => {
  inboxControl.isEmpty = false;
});

function renderPage() {
  render(
    <TestProviders initialEntries={["/studio/credits"]}>
      <StudioCreditsPage />
    </TestProviders>,
  );
}

/** A credit line holds a link to its track, so its words span two nodes:
 *  match the paragraph by its whole text. */
const creditLine =
  (text: string) => (_content: string, element: Element | null) =>
    element?.tagName === "P" && element.textContent === text;

beforeEach(() => resetDemoCreditLedger());

describe("StudioCreditsPage (demo)", () => {
  it("lists requests and accepted credits by persona name alone, linking the track and the release", async () => {
    renderPage();
    const requests = await screen.findByRole("region", { name: "Requests" });
    expect(
      await within(requests).findByText(
        creditLine(
          "LeChatDashinko credited Mariana Sol as Featured on Bicha, with love",
        ),
      ),
    ).toBeInTheDocument();
    expect(
      within(requests)
        .getAllByRole("link", { name: "Bicha, with love" })
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/studio/track?id=demo-track-home-2-01",
      "/studio/album?id=demo-release-home-2",
    ]);
    const accepted = screen.getByRole("region", { name: "Accepted" });
    expect(
      within(accepted).getByText(
        creditLine(
          "NIGHTFORM credits Mariana Sol as Mixing on Pedro on the 25",
        ),
      ),
    ).toBeInTheDocument();
  });

  it("puts Credits in the creator nav with the pending count", async () => {
    renderPage();
    expect(
      await screen.findByRole("link", {
        name: /credits.*2 credit requests waiting/i,
      }),
    ).toHaveAttribute("href", "/studio/credits");
  });

  it("accepts a request, moves it to Accepted and lowers the count", async () => {
    renderPage();
    const requests = await screen.findByRole("region", { name: "Requests" });
    fireEvent.click(
      await within(requests).findByRole("button", {
        name: "Accept credit for Mariana Sol on Bicha, with love",
      }),
    );
    const accepted = screen.getByRole("region", { name: "Accepted" });
    expect(
      await within(accepted).findByText(
        creditLine(
          "LeChatDashinko credits Mariana Sol as Featured on Bicha, with love",
        ),
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText("Credit accepted")).toBeInTheDocument();
    expect(
      await screen.findByText("1 credit request waiting"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Requests" }),
      ).toHaveFocus(),
    );
  });

  it("declines a request and drops it", async () => {
    renderPage();
    const requests = await screen.findByRole("region", { name: "Requests" });
    fireEvent.click(
      await within(requests).findByRole("button", {
        name: "Decline credit for Mariana Sol on Pedro on the 25",
      }),
    );
    await waitFor(() =>
      expect(within(requests).getAllByRole("listitem")).toHaveLength(1),
    );
    expect(await screen.findByText("Credit declined")).toBeInTheDocument();
  });

  it("removes an accepted credit after a confirmation", async () => {
    renderPage();
    const accepted = await screen.findByRole("region", { name: "Accepted" });
    fireEvent.click(
      await within(accepted).findByRole("button", {
        name: "Remove credit for Mariana Sol on Pedro on the 25",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Remove this credit?",
    });
    expect(
      within(dialog).getByText("Mariana Sol stops showing on Pedro on the 25"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove credit" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Accepted" })).toBeNull(),
    );
    expect(await screen.findByText("Credit removed")).toBeInTheDocument();
  });

  it("moves focus to Requests when the last accepted credit leaves", async () => {
    renderPage();
    const accepted = await screen.findByRole("region", { name: "Accepted" });
    fireEvent.click(
      await within(accepted).findByRole("button", {
        name: "Remove credit for Mariana Sol on Pedro on the 25",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove credit" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Requests" }),
      ).toHaveFocus(),
    );
  });

  it("says so when no credit request is waiting", async () => {
    inboxControl.isEmpty = true;
    renderPage();
    expect(
      await screen.findByText("No credit requests right now"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Accepted" })).toBeNull();
  });
});
