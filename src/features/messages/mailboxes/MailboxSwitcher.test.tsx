import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_MAILBOX_SUMMARIES } from "../demoIdentities.data";
import { MailboxSwitcher } from "./MailboxSwitcher";

const mailboxes = DEMO_MAILBOX_SUMMARIES.map((mailbox, index) => ({
  ...mailbox,
  unreadCount: index === 1 ? 2 : 0,
}));

describe("MailboxSwitcher", () => {
  it("names the current mailbox and opens a sheet with every mailbox and its unread count", async () => {
    render(
      <MailboxSwitcher
        mailboxes={mailboxes}
        active={mailboxes[0]!}
        onSelect={() => {}}
      />,
      { wrapper: TestProviders },
    );
    fireEvent.click(await screen.findByRole("button", { name: /Tiago Costa/ }));
    expect(await screen.findByText("Café Lisboa")).toBeInTheDocument();
    // The count rolls, so its text is split across nodes; the row's
    // accessible name reads it whole.
    expect(
      screen.getByRole("button", { name: /2 unread/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Read only")).toBeInTheDocument();
  });

  it("tells a screen reader when another mailbox has unread messages", async () => {
    render(
      <MailboxSwitcher
        mailboxes={mailboxes}
        active={mailboxes[0]!}
        onSelect={() => {}}
      />,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByRole("button", {
        name: /New messages in your other mailboxes/,
      }),
    ).toBeInTheDocument();
  });

  it("switches when a mailbox is chosen", async () => {
    const onSelect = vi.fn();
    render(
      <MailboxSwitcher
        mailboxes={mailboxes}
        active={mailboxes[0]!}
        onSelect={onSelect}
      />,
      { wrapper: TestProviders },
    );
    fireEvent.click(await screen.findByRole("button", { name: /Tiago Costa/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Café Lisboa/ }));
    expect(onSelect).toHaveBeenCalledWith(mailboxes[1]!.identityId);
  });

  it("renders nothing for a member with one mailbox", () => {
    render(
      <MailboxSwitcher
        mailboxes={[mailboxes[0]!]}
        active={mailboxes[0]!}
        onSelect={() => {}}
      />,
      { wrapper: TestProviders },
    );
    // `TestProviders` mounts the toast live regions inside the container, so
    // the check is that the switcher itself added nothing.
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("Tiago Costa")).toBeNull();
  });
});
