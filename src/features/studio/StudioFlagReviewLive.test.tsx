import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoFlagReview } from "./api/studioDemoFlagReview";
import { StudioFlagReviewPage } from "./StudioFlagReviewPage";

const access = vi.hoisted(() => ({
  isShowcase: false,
  isStaff: true,
  shouldFail: false,
  /** A refusal the next decision throws as is, when set. */
  failWith: null as Error | null,
}));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => access.isShowcase,
}));
vi.mock("./useIsStudioStaff", () => ({
  useIsStudioStaff: () => access.isStaff,
}));
vi.mock("./api/studioDemoFlagReview", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoFlagReview")>();
  return {
    ...original,
    demoApplyReviewAction: (
      ...args: Parameters<typeof original.demoApplyReviewAction>
    ) => {
      if (access.failWith) throw access.failWith;
      if (access.shouldFail) throw new Error("refused");
      original.demoApplyReviewAction(...args);
    },
  };
});

beforeEach(() => {
  access.isShowcase = false;
  access.isStaff = true;
  access.shouldFail = false;
  access.failWith = null;
  resetDemoFlagReview();
});

function renderReview() {
  render(
    <TestProviders initialEntries={["/studio/flag-review"]}>
      <StudioFlagReviewPage />
    </TestProviders>,
  );
}

// Two open reports name "Cidade dos santos"; the first card is the newest.
async function firstReportCard() {
  const [title] = await screen.findAllByRole("heading", {
    level: 3,
    name: "Cidade dos santos",
  });
  const card = title?.closest("article");
  if (!card) throw new Error("the report title sits outside its card");
  return card;
}

/** A Withdrawn card, found by its release title (the queue's order is a
 *  sort choice, so tests never pick a card by position). */
async function withdrawnCardTitled(title: string) {
  const heading = await screen.findByRole("heading", { level: 3, name: title });
  const card = heading.closest("article");
  if (!card) throw new Error(`the ${title} title sits outside its card`);
  return card;
}

/** The Withdrawn card that carries "Dispute waiting". */
async function withdrawnCardWithDispute() {
  const chip = await screen.findByText("Dispute waiting");
  const card = chip.closest("article");
  if (!card) throw new Error("the dispute chip sits outside its card");
  return card;
}

describe("flag review: the open tab lives in the URL", () => {
  it("opens the tab the link names", async () => {
    render(
      <TestProviders initialEntries={["/studio/flag-review?tab=disputes"]}>
        <StudioFlagReviewPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("tab", { name: /Disputes/, selected: true }),
    ).toBeInTheDocument();
  });

  it("asks before a typed note is thrown away", async () => {
    renderReview();
    const card = await firstReportCard();
    fireEvent.click(
      within(card).getByRole("button", { name: "Take down release" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "Names a member" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(
      await within(dialog).findByRole("button", { name: "Keep writing" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Discard note" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

describe("flag review: who sees it", () => {
  it("answers the Studio 404 to a member who is not staff", async () => {
    access.isStaff = false;
    renderReview();
    expect(await screen.findByText("Track not found")).toBeInTheDocument();
  });

  it("shows the live review and its tabs in the demo", async () => {
    access.isShowcase = true;
    renderReview();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /studio reports and disputes/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "Disputes" })).toBeVisible();
  });
});

describe("flag review: Reports", () => {
  it("takes a release down with a required reason, then every card for it leaves and focus moves on", async () => {
    renderReview();
    const card = await firstReportCard();
    fireEvent.click(
      within(card).getByRole("button", { name: "Take down release" }),
    );
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", {
      name: "Take down release",
    });
    expect(confirm).toBeDisabled();
    fireEvent.change(
      within(dialog).getByLabelText(/reason the artist will see/i),
      {
        target: { value: "Uncleared sample in the opening track" },
      },
    );
    fireEvent.click(confirm);
    expect(
      await screen.findByText(
        "Cidade dos santos is down and its reports are closed",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryAllByRole("heading", {
          level: 3,
          name: "Cidade dos santos",
        }),
      ).toHaveLength(0),
    );
    await waitFor(() => expect(document.activeElement?.tagName).toBe("H3"));
  });

  it("keeps the card and the dialog when the decision fails", async () => {
    access.shouldFail = true;
    renderReview();
    const card = await firstReportCard();
    fireEvent.click(
      within(card).getByRole("button", { name: "Dismiss report" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Dismiss report" }),
    );
    // The reason shows in the toast and inside the dialog, which stays.
    expect(
      await within(screen.getByRole("dialog")).findByText(
        "That didn't go through. Try again",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 3, name: "Cidade dos santos" }),
    ).toHaveLength(2);
  });

  it("closes the dialog when the report was already decided elsewhere", async () => {
    access.failWith = new ApiError(404, "Not found");
    renderReview();
    const card = await firstReportCard();
    fireEvent.click(
      within(card).getByRole("button", { name: "Dismiss report" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Dismiss report" }),
    );
    expect(
      await screen.findByText(
        "This was already closed or is no longer there, so the queue now shows the latest",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes the dialog on Cancel", async () => {
    renderReview();
    const card = await firstReportCard();
    fireEvent.click(
      within(card).getByRole("button", { name: "Dismiss report" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getAllByRole("heading", { level: 3, name: "Cidade dos santos" }),
    ).toHaveLength(2);
  });

  it("names each queue with a heading between the page and its cards", async () => {
    renderReview();
    expect(
      await screen.findByRole("heading", { level: 2, name: "Reports" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Disputes" }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Disputes" }),
    ).toBeInTheDocument();
  });

  it("opens the report in the moderation queue", async () => {
    renderReview();
    const card = await firstReportCard();
    expect(
      within(card).getByRole("link", { name: "Open in moderation" }),
    ).toHaveAttribute(
      "href",
      "/admin/moderation?tab=open&subjectId=demo-release-cidade-dos-santos",
    );
  });
});

describe("flag review: Disputes and Withdrawn", () => {
  it("keeps a disputed release down with a reply under the catalog label", async () => {
    renderReview();
    fireEvent.click(await screen.findByRole("tab", { name: "Disputes" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Keep release down" }),
    );
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", {
      name: "Keep release down",
    });
    expect(confirm).toBeDisabled();
    fireEvent.change(
      within(dialog).getByLabelText(/reply the artist will read/i),
      { target: { value: "The verse still names their workplace" } },
    );
    fireEvent.click(confirm);
    expect(
      await screen.findByRole("heading", { name: "No open disputes" }),
    ).toBeInTheDocument();
  });

  it("closes the keep-down dialog when the release was already restored", async () => {
    access.failWith = new ApiError(409, "Conflict", {
      code: "studio_release_not_taken_down",
    });
    renderReview();
    fireEvent.click(await screen.findByRole("tab", { name: "Disputes" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Keep release down" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByLabelText(/reply the artist will read/i),
      { target: { value: "The verse still names their workplace" } },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Keep release down" }),
    );
    expect(
      await screen.findByText("This release isn't taken down anymore"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("restores a disputed release with a reply and empties the queue", async () => {
    renderReview();
    fireEvent.click(await screen.findByRole("tab", { name: "Disputes" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Restore release" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByLabelText(/reply the artist will read/i),
      {
        target: { value: "You're right, the name is yours to share" },
      },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Restore release" }),
    );
    expect(
      await screen.findByRole("heading", { name: "No open disputes" }),
    ).toBeInTheDocument();
  });

  it("restores a withdrawn release with no dispute straight away", async () => {
    renderReview();
    fireEvent.click(await screen.findByRole("tab", { name: "Withdrawn" }));
    expect(await screen.findByText("Dispute waiting")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Restore release" }),
    ).toHaveLength(2);
    fireEvent.click(
      within(await withdrawnCardTitled("Bairro antigo")).getByRole("button", {
        name: "Restore release",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Restore release" }),
    );
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: "Restore release" }),
      ).toHaveLength(1),
    );
  });

  it("restores a withdrawn release with a dispute waiting through that dispute, with a reply", async () => {
    renderReview();
    fireEvent.click(await screen.findByRole("tab", { name: "Withdrawn" }));
    fireEvent.click(
      within(await withdrawnCardWithDispute()).getByRole("button", {
        name: "Restore release",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", {
      name: "Restore release",
    });
    expect(confirm).toBeDisabled();
    fireEvent.change(
      within(dialog).getByLabelText(/reply the artist will read/i),
      {
        target: { value: "You're right, the name is yours to share" },
      },
    );
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(screen.queryByText("Dispute waiting")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Disputes" }));
    expect(
      await screen.findByRole("heading", { name: "No open disputes" }),
    ).toBeInTheDocument();
  });

  it("keeps a withdrawn card when the artist disputed it in the meantime", async () => {
    access.failWith = new ApiError(409, "Conflict", {
      code: "studio_release_has_open_dispute",
    });
    renderReview();
    fireEvent.click(await screen.findByRole("tab", { name: "Withdrawn" }));
    fireEvent.click(
      within(await withdrawnCardTitled("Bairro antigo")).getByRole("button", {
        name: "Restore release",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Restore release" }),
    );
    expect(
      await screen.findByText(
        "This release has a dispute waiting. Restore it from Disputes",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getAllByRole("button", { name: "Restore release" }),
    ).toHaveLength(2);
  });
});
