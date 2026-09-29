import { render, screen } from "@testing-library/react";
import { FiBell } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { NotificationsBellMenu } from "./NotificationsBellMenu";

function renderBell(unreadCount: number) {
  render(
    <TestProviders>
      <NotificationsBellMenu
        unreadCount={unreadCount}
        icon={<FiBell aria-hidden />}
        badgeClassName="bellBadge"
      />
    </TestProviders>,
  );
}

describe("NotificationsBellMenu: accessible name (DES-400)", () => {
  it("names the unread count in the trigger's accessible name", async () => {
    renderBell(3);
    expect(
      await screen.findByRole("button", { name: "Notifications, 3 unread" }),
    ).toBeInTheDocument();
  });

  it("uses the singular form for one unread notification", async () => {
    renderBell(1);
    expect(
      await screen.findByRole("button", { name: "Notifications, 1 unread" }),
    ).toBeInTheDocument();
  });

  it("reads plain Notifications when nothing is unread", async () => {
    renderBell(0);
    expect(
      await screen.findByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
  });

  it("hides the visual badge from assistive tech so the count is heard once", async () => {
    renderBell(3);
    const trigger = await screen.findByRole("button", {
      name: "Notifications, 3 unread",
    });
    const badge = trigger.querySelector(".bellBadge");
    expect(badge).not.toBeNull();
    expect(badge).toHaveAttribute("aria-hidden", "true");
  });
});
