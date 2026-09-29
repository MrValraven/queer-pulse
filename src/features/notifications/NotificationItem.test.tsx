import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "./data";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    type: "community",
    unread: true,
    text: "Ana replied to your thread",
    meta: "Community",
    time: "2m",
    avatar: { initials: "AN", tint: "plum" },
    ...overrides,
  };
}

function renderItem(
  notification: Notification,
  { isUnread = notification.unread } = {},
) {
  const handlers = {
    onMarkRead: vi.fn(),
    onResolve: vi.fn(),
    onDismiss: vi.fn(),
  };
  render(
    <TestProviders>
      <NotificationItem
        notification={notification}
        index={0}
        isUnread={isUnread}
        {...handlers}
      />
    </TestProviders>,
  );
  return handlers;
}

describe("NotificationItem: unread state for screen readers (DES-400)", () => {
  it("starts the row link's accessible name with Unread on an unread row", async () => {
    renderItem(makeNotification({ sourceHref: "/forum/thread-1" }));
    const rowLink = await screen.findByRole("link", {
      name: /^Unread\. Ana replied to your thread/,
    });
    expect(rowLink).toBeInTheDocument();
  });

  it("keeps Unread out of the row link's name once the row is read", async () => {
    renderItem(makeNotification({ sourceHref: "/forum/thread-1" }), {
      isUnread: false,
    });
    const rowLink = await screen.findByRole("link", {
      name: /^Ana replied to your thread/,
    });
    expect(rowLink).toBeInTheDocument();
    expect(screen.queryByText("Unread")).not.toBeInTheDocument();
  });

  it("gives an unread row with no link hidden Unread text", async () => {
    renderItem(makeNotification());
    const hiddenLabel = await screen.findByText("Unread");
    expect(hiddenLabel).toHaveClass("visuallyHidden");
  });
});

describe("NotificationItem: shared buttons (DES-401)", () => {
  it("clears the row from the named dismiss button without marking it read", async () => {
    const user = userEvent.setup();
    const handlers = renderItem(makeNotification());
    await user.click(
      await screen.findByRole("button", { name: "Clear this notification" }),
    );
    expect(handlers.onDismiss).toHaveBeenCalledWith(1);
    expect(handlers.onMarkRead).not.toHaveBeenCalled();
  });

  it("resolves the row from an action button without marking it read", async () => {
    const user = userEvent.setup();
    const handlers = renderItem(
      makeNotification({
        actions: [
          {
            label: "Got it",
            variant: "primary",
            href: "#",
            resolve: { toast: "Done" },
          },
        ],
      }),
    );
    await user.click(await screen.findByRole("button", { name: "Got it" }));
    expect(handlers.onResolve).toHaveBeenCalledWith(1, "Done");
    expect(handlers.onMarkRead).not.toHaveBeenCalled();
  });

  it("renders an action with nowhere to go as plain text", async () => {
    renderItem(
      makeNotification({
        actions: [{ label: "Someday", variant: "ghost", href: "#" }],
      }),
    );
    expect(await screen.findByText("Someday")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Someday" }),
    ).not.toBeInTheDocument();
  });

  it("marks the row read when the row body is clicked", async () => {
    const user = userEvent.setup();
    const handlers = renderItem(makeNotification());
    await user.click(await screen.findByText("Ana replied to your thread"));
    expect(handlers.onMarkRead).toHaveBeenCalledWith(1);
  });
});

describe("NotificationItem: the moderators' reason (design M2, N1)", () => {
  const REASON =
    "The photos show a different flat. Please update them and submit again.";

  it("shows the whole reason under the sentence with its lead-in", async () => {
    renderItem(makeNotification({ meta: "Housing listing", reason: REASON }));
    const reasonBlock = (await screen.findByText("Reason from the moderators:"))
      .parentElement;
    expect(reasonBlock).toHaveTextContent(
      `Reason from the moderators: ${REASON}`,
    );
    expect(screen.getByText("Housing listing")).toBeInTheDocument();
  });

  it("names a member as the author of a reason a member wrote", async () => {
    renderItem(
      makeNotification({
        reason: "They left the group",
        isReasonFromMember: true,
      }),
    );
    const reasonBlock = (
      await screen.findByText("Reason from the member who asked:")
    ).parentElement;
    expect(reasonBlock).toHaveTextContent(
      "Reason from the member who asked: They left the group",
    );
    expect(
      screen.queryByText("Reason from the moderators:"),
    ).not.toBeInTheDocument();
  });

  it("renders markup in a reason as plain text", async () => {
    const markupReason = "<b>Too short</b>";
    renderItem(makeNotification({ reason: markupReason }));
    const reasonBlock = (await screen.findByText("Reason from the moderators:"))
      .parentElement;
    expect(reasonBlock).toHaveTextContent(markupReason);
    expect(reasonBlock?.querySelector("b")).toBeNull();
  });

  it.each([undefined, "", "   "])(
    "shows no reason block when the reason is %j",
    async (reason) => {
      renderItem(makeNotification({ reason }));
      await screen.findByText("Ana replied to your thread");
      expect(
        screen.queryByText("Reason from the moderators:"),
      ).not.toBeInTheDocument();
    },
  );

  it("reads the reason in the row link's name, after the sentence", async () => {
    renderItem(
      makeNotification({ sourceHref: "/forum/thread-1", reason: REASON }),
      { isUnread: false },
    );
    const rowLink = await screen.findByRole("link", {
      name: `Ana replied to your thread. Reason from the moderators: ${REASON} View thread`,
    });
    expect(rowLink).toBeInTheDocument();
  });

  it("closes a reason with no end punctuation with a full stop in the name", async () => {
    renderItem(
      makeNotification({ sourceHref: "/forum/thread-1", reason: "Off topic" }),
      { isUnread: false },
    );
    const rowLink = await screen.findByRole("link", {
      name: /Reason from the moderators: Off topic\. /,
    });
    expect(rowLink).toBeInTheDocument();
  });
});

// A matched Go together chat names its mention actor by first name only,
// with an empty href (no profile to open, product decision). The `<profile>`
// tag in the catalog string must then render its plain inner text, with no
// link.
describe("NotificationItem: actor name link", () => {
  function makeActorNotification(href: string): Notification {
    return makeNotification({
      type: "community",
      text: "Alex mentioned you in a discussion.",
      actor: {
        name: "Alex",
        href,
        textKey: "notifications:type.mention.textNamed",
      },
    });
  }

  it("links the actor's name to their profile when href is present", async () => {
    renderItem(makeActorNotification("/members/alex"));
    const nameLink = await screen.findByRole("link", { name: "Alex" });
    expect(nameLink).toHaveAttribute("href", "/members/alex");
  });

  it("renders the actor's name as plain text when href is empty", async () => {
    renderItem(makeActorNotification(""));
    expect(
      await screen.findByText("Alex mentioned you in a discussion."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Alex" }),
    ).not.toBeInTheDocument();
  });
});

describe("NotificationItem: compact avatar size (design N2)", () => {
  it("draws a bare avatar at 36px in a compact row", async () => {
    render(
      <TestProviders>
        <NotificationItem
          notification={makeNotification()}
          index={0}
          isUnread={false}
          onMarkRead={vi.fn()}
          onResolve={vi.fn()}
          onDismiss={vi.fn()}
          isCompact
        />
      </TestProviders>,
    );
    await screen.findByText("Ana replied to your thread");
    const avatarSizes = Array.from(
      document.querySelectorAll<HTMLElement>("[style]"),
    )
      .map((element) => element.style.getPropertyValue("--avatar-size"))
      .filter(Boolean);
    expect(avatarSizes).toEqual(["36px"]);
  });
});
