import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_MAILBOX_SUMMARIES } from "../demoIdentities.data";
import { MessagesThreadList } from "../MessagesThreadList";
import { MailboxSettingsModal } from "./MailboxSettingsModal";

const cafe = DEMO_MAILBOX_SUMMARIES[1]!;
const estudioNorte = DEMO_MAILBOX_SUMMARIES[3]!;

const NOOP = () => {};

describe("MailboxSettingsModal (demo)", () => {
  it("lets the owner switch staff names off", async () => {
    render(<MailboxSettingsModal mailbox={cafe} onClose={() => {}} />, {
      wrapper: TestProviders,
    });
    const ownerSwitch = await screen.findByRole("switch", {
      name: "Show who replied",
    });
    expect(ownerSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(ownerSwitch);
    // The cache change reaches the switch on react-query's next batch tick.
    await waitFor(() =>
      expect(ownerSwitch).toHaveAttribute("aria-checked", "false"),
    );
  });

  it("locks both switches on a persona moderation removed", async () => {
    render(<MailboxSettingsModal mailbox={estudioNorte} onClose={() => {}} />, {
      wrapper: TestProviders,
    });
    expect(
      await screen.findByText(
        "Moderation removed Estúdio Norte, so these settings can't change.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Show who replied" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: "Include my first name" }),
    ).toBeDisabled();
  });

  it("leaves a team member their own switch and locks the owner's", async () => {
    const teamMailbox = {
      ...cafe,
      identityId: "demo-identity-team-only",
      isOwner: false,
    };
    render(<MailboxSettingsModal mailbox={teamMailbox} onClose={() => {}} />, {
      wrapper: TestProviders,
    });
    expect(
      await screen.findByText("Only the owner can change this."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Show who replied" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: "Include my first name" }),
    ).toBeEnabled();
  });

  it("opens from the switcher's settings slot and hands focus back to the switcher on close", async () => {
    render(
      <MessagesThreadList
        loading={false}
        threads={[]}
        activeId=""
        readIds={new Set()}
        query=""
        onQueryChange={NOOP}
        onOpen={NOOP}
        onCompose={NOOP}
        onComposeGroup={NOOP}
        onDelete={NOOP}
        onSelectResult={NOOP}
        deletePending={false}
        onMarkThreadRead={NOOP}
        onMarkThreadUnread={NOOP}
        showRailChrome={false}
        mailboxes={DEMO_MAILBOX_SUMMARIES}
        activeMailbox={DEMO_MAILBOX_SUMMARIES[0]}
      />,
      { wrapper: TestProviders },
    );
    const trigger = await screen.findByRole("button", { name: /Tiago Costa/ });
    fireEvent.click(trigger);
    const [cafeSettings] = await screen.findAllByRole("button", {
      name: "Mailbox settings",
    });
    fireEvent.click(cafeSettings!);
    expect(
      await screen.findByRole("dialog", {
        name: "Mailbox settings for Café Lisboa",
      }),
    ).toBeInTheDocument();
    // The head's close icon and the footer button share the name; use the
    // footer's.
    fireEvent.click(screen.getAllByRole("button", { name: "Close" }).at(-1)!);
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", {
          name: "Mailbox settings for Café Lisboa",
        }),
      ).toBeNull(),
    );
    expect(trigger).toHaveFocus();
  });
});
