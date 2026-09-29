import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MentionsPanel } from "./MentionsPanel";
import type { Mention } from "./mentions.data";
import type { MentionDay } from "./api/useMentions";

const mentionsState = vi.hoisted(() => ({ days: [] as MentionDay[] }));

vi.mock("./api/useMentions", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMentions: () => ({
    data: mentionsState.days,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function makeMention(overrides: Partial<Mention> = {}): Mention {
  return {
    id: "mention-1",
    initials: "AN",
    tint: "plum",
    name: "Ana",
    category: "post",
    context: "in a reply",
    when: "2m",
    content: "Come to the picnic on Saturday",
    whereText: "Picnic thread",
    actions: [{ type: "reply", primary: true }, { type: "markRead" }],
    ...overrides,
  };
}

function renderPanel(mention: Mention) {
  mentionsState.days = [{ day: "Today", items: [mention] }];
  render(
    <TestProviders>
      <MentionsPanel />
    </TestProviders>,
  );
}

/**
 * Design N4. A mention whose source was deleted, edited or taken down keeps
 * its other actions and offers no reply, since there is nothing to answer.
 */
describe("MentionsPanel: reply on a mention whose source is gone", () => {
  it("offers Reply while the excerpt is there", async () => {
    renderPanel(makeMention());
    expect(
      await screen.findByRole("button", { name: "Reply" }),
    ).toBeInTheDocument();
  });

  it.each(["", "   "])(
    "hides Reply and keeps the other actions for the excerpt %j",
    async (content) => {
      renderPanel(makeMention({ content }));
      expect(
        await screen.findByText("The original text is no longer available."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Mark read" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reply" }),
      ).not.toBeInTheDocument();
    },
  );
});

/**
 * A matched Go together chat's mention actor carries no slug (no profile to
 * open). The row then renders the name as plain text, matching the
 * notifications bell for the same case.
 */
describe("MentionsPanel: mention actor with no slug", () => {
  it("renders the name as plain text with no link", async () => {
    renderPanel(makeMention({ name: "Ana", actorSlug: undefined }));
    const name = await screen.findByText("Ana");
    expect(name.closest("a")).toBeNull();
  });

  it("still links the name when a slug is present", async () => {
    renderPanel(makeMention({ name: "Ana", actorSlug: "ana" }));
    expect(await screen.findByRole("link", { name: "Ana" })).toHaveAttribute(
      "href",
      "/members/ana",
    );
  });
});
