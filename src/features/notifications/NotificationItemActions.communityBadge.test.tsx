import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { communityBadgeRefusal } from "../communities/badges/communityBadgeErrors";
import { NotificationItemActions } from "./NotificationItemActions";
import type { NotifAction } from "./notifications.types";

const mocks = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../communities/badges/api/useCommunityBadgeMutations", () => ({
  useWearCommunityBadge: () => ({ mutate: mocks.mutate, isPending: false }),
}));

// Portalled to the body as the real dialog is, so the hidden holder around it
// leaves it on screen.
vi.mock("../economy/ReportListingModal", async () => {
  const { createPortal } = await import("react-dom");
  return {
    ReportListingModal: (props: {
      subjectType: string;
      subjectId: string;
      subjectName: string;
    }) =>
      createPortal(
        <div role="dialog" aria-label={props.subjectType}>
          {`${props.subjectType} ${props.subjectId} ${props.subjectName}`}
        </div>,
        document.body,
      ),
  };
});

const actions: NotifAction[] = [
  {
    label: "Wear this badge",
    variant: "primary",
    href: "/community/club?badges=open&badge=b1",
    wearBadge: { communitySlug: "club", badgeId: "b1", toast: "Worn" },
  },
];

describe("NotificationItemActions: Wear this badge", () => {
  beforeEach(() => mocks.mutate.mockReset());

  it("wears the badge from the row and keeps the row", async () => {
    const onResolve = vi.fn();
    render(
      <TestProviders>
        <NotificationItemActions
          notificationId="n1"
          actions={actions}
          onResolve={onResolve}
        />
      </TestProviders>,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Wear this badge" }),
    );
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.mutate.mock.calls[0]?.[0]).toEqual({
      slug: "club",
      badgeId: "b1",
    });
    expect(onResolve).not.toHaveBeenCalled();
  });

  it("names the specific refusal when wearing fails", async () => {
    mocks.mutate.mockImplementation(
      (_variables: unknown, options: { onError: (error: unknown) => void }) =>
        options.onError(communityBadgeRefusal("flair_badge_not_earned")),
    );
    render(
      <TestProviders>
        <NotificationItemActions
          notificationId="n1"
          actions={actions}
          onResolve={vi.fn()}
        />
      </TestProviders>,
    );
    await awaitCatalog("communities");
    await userEvent.click(
      await screen.findByRole("button", { name: "Wear this badge" }),
    );
    expect(
      await screen.findByText(
        "You haven't earned this badge yet, so you can't wear it.",
      ),
    ).toBeInTheDocument();
  });

  it("swaps the button for a wearing status once the badge is worn", async () => {
    mocks.mutate.mockImplementation(
      (_variables: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    render(
      <TestProviders>
        <NotificationItemActions
          notificationId="n1"
          actions={actions}
          onResolve={vi.fn()}
        />
      </TestProviders>,
    );
    await awaitCatalog("communities");
    await userEvent.click(
      await screen.findByRole("button", { name: "Wear this badge" }),
    );
    expect(
      await screen.findByText("You're wearing this badge"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Wear this badge" }),
    ).toBeNull();
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });
});

describe("NotificationItemActions: after wearing", () => {
  beforeEach(() => mocks.mutate.mockReset());

  it("marks the row read once the badge is worn", async () => {
    mocks.mutate.mockImplementation(
      (_variables: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const onMarkRead = vi.fn();
    render(
      <TestProviders>
        <NotificationItemActions
          notificationId="n1"
          actions={actions}
          onResolve={vi.fn()}
          onMarkRead={onMarkRead}
        />
      </TestProviders>,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Wear this badge" }),
    );
    expect(onMarkRead).toHaveBeenCalledWith("n1");
  });

  it("leaves the row unread when wearing fails", async () => {
    mocks.mutate.mockImplementation(
      (_variables: unknown, options: { onError: (error: unknown) => void }) =>
        options.onError(communityBadgeRefusal("flair_badge_not_earned")),
    );
    const onMarkRead = vi.fn();
    render(
      <TestProviders>
        <NotificationItemActions
          notificationId="n1"
          actions={actions}
          onResolve={vi.fn()}
          onMarkRead={onMarkRead}
        />
      </TestProviders>,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Wear this badge" }),
    );
    expect(onMarkRead).not.toHaveBeenCalled();
  });
});

describe("NotificationItemActions: Report gift", () => {
  const giftActions: NotifAction[] = [
    {
      label: "Report gift",
      variant: "ghost",
      href: "/community/club?badges=gifts",
      reportGift: { giftId: "gift-1", giftName: "Heart" },
    },
  ];

  function renderGiftRow(senderName?: string) {
    const onResolve = vi.fn();
    render(
      <TestProviders>
        <NotificationItemActions
          notificationId="n2"
          actions={giftActions}
          onResolve={onResolve}
          senderName={senderName}
        />
      </TestProviders>,
    );
    return onResolve;
  }

  it("opens the report dialog on that gift and keeps the row", async () => {
    const onResolve = renderGiftRow("Carla");
    await awaitCatalog("communities");
    expect(screen.queryByRole("dialog", { name: "community_gift" })).toBeNull();
    await userEvent.click(
      await screen.findByRole("button", { name: "Report gift" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "community_gift" }),
    ).toHaveTextContent("community_gift gift-1 the Heart gift from Carla");
    expect(onResolve).not.toHaveBeenCalled();
  });

  it("names a gift from a deleted member in the dialog title", async () => {
    renderGiftRow();
    await awaitCatalog("communities");
    await userEvent.click(
      await screen.findByRole("button", { name: "Report gift" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "community_gift" }),
    ).toHaveTextContent("the Heart gift from a deleted member");
  });
});
