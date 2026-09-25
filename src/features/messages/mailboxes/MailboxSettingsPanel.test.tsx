import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_MAILBOX_SUMMARIES } from "../demoIdentities.data";
import { MessagesThreadList } from "../MessagesThreadList";
import { MailboxSettingsPanel } from "./MailboxSettingsPanel";

const cafe = DEMO_MAILBOX_SUMMARIES[1]!;
const estudioNorte = DEMO_MAILBOX_SUMMARIES[3]!;

const NOOP = () => {};

describe("MailboxSettingsPanel (demo)", () => {
  it("lets the owner switch staff names off", async () => {
    render(<MailboxSettingsPanel mailbox={cafe} />, {
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
    render(<MailboxSettingsPanel mailbox={estudioNorte} />, {
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
    render(<MailboxSettingsPanel mailbox={teamMailbox} />, {
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

  it("replaces the switcher's list inside the same sheet and returns to it with focus on the gear", async () => {
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
      await screen.findByRole("heading", {
        name: "Mailbox settings for Café Lisboa",
      }),
    ).toBeInTheDocument();
    // The settings take the list's place in the one sheet.
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    const backButton = screen.getByRole("button", {
      name: "Back to your mailboxes",
    });
    await waitFor(() => expect(backButton).toHaveFocus());

    fireEvent.click(backButton);
    expect(
      await screen.findByRole("heading", { name: "Your mailboxes" }),
    ).toBeInTheDocument();
    const [cafeSettingsAgain] = screen.getAllByRole("button", {
      name: "Mailbox settings",
    });
    await waitFor(() => expect(cafeSettingsAgain).toHaveFocus());
  });
});
