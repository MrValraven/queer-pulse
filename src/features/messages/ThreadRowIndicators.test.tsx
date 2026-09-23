import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ThreadRowIndicators } from "./ThreadRowIndicators";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

const baseProps = {
  isArchived: false,
  hasUnreadMention: false,
  isFavorite: false,
  isPinned: false,
  time: "10:00",
};

/**
 * PRD-349: `isMuted` and `isMentionsOnly` are two independent axes off
 * `resolveMuteState`. This row indicator only has one slot for a mute-family
 * icon, so it covers all four combinations honestly rather than silently
 * dropping one when both are set.
 */
describe("ThreadRowIndicators: mute + mentions-only", () => {
  it("renders no mute-family indicator when neither is set", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={false}
        mutedUntilTime={undefined}
        isMentionsOnly={false}
      />,
      { wrapper },
    );
    // Give the lazy "messages" namespace a chance to resolve so this proves
    // real absence rather than just an unresolved-key coincidence.
    await waitFor(() => {
      expect(screen.getByText("10:00")).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/notifications muted|mentions only|muted until/i),
    ).not.toBeInTheDocument();
  });

  it("renders the plain muted indicator's real translated text", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={true}
        mutedUntilTime={undefined}
        isMentionsOnly={false}
      />,
      { wrapper },
    );
    const name = await screen.findByText("Notifications muted");
    expect(name).toBeInTheDocument();
    expect(name.textContent).not.toMatch(/^messages:/);
  });

  it("renders the mentions-only indicator with its own accessible name when muting is off", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={false}
        mutedUntilTime={undefined}
        isMentionsOnly={true}
      />,
      { wrapper },
    );
    const name = await screen.findByText("Mentions only");
    expect(name).toBeInTheDocument();
    expect(name.textContent).not.toMatch(/^messages:/);
    expect(screen.queryByText("Notifications muted")).not.toBeInTheDocument();
  });

  it("collapses to a single coherent state, plain mute wins, when both are set", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={true}
        mutedUntilTime={undefined}
        isMentionsOnly={true}
      />,
      { wrapper },
    );
    expect(await screen.findByText("Notifications muted")).toBeInTheDocument();
    // Only one mute-family indicator renders, never both glyphs at once.
    expect(screen.queryByText("Mentions only")).not.toBeInTheDocument();
  });

  it("shows the timed-mute name when both are set with an active timer", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={true}
        mutedUntilTime="14:32"
        isMentionsOnly={true}
      />,
      { wrapper },
    );
    expect(await screen.findByText("Muted until 14:32")).toBeInTheDocument();
    expect(screen.queryByText("Mentions only")).not.toBeInTheDocument();
  });
});

describe("ThreadRowIndicators: business mailbox claim tag", () => {
  it("tags an unclaimed seated row", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={false}
        mutedUntilTime={undefined}
        isMentionsOnly={false}
        claimStatus="unclaimed"
      />,
      { wrapper },
    );
    expect(await screen.findByText("Unclaimed")).toBeInTheDocument();
  });

  it("tags a row the viewer holds", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={false}
        mutedUntilTime={undefined}
        isMentionsOnly={false}
        claimStatus="mine"
      />,
      { wrapper },
    );
    expect(await screen.findByText("Yours")).toBeInTheDocument();
  });

  it("names the colleague holding the row", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={false}
        mutedUntilTime={undefined}
        isMentionsOnly={false}
        claimStatus="theirs"
        claimantFirstName="Rui"
      />,
      { wrapper },
    );
    expect(await screen.findByText("With Rui")).toBeInTheDocument();
  });

  it("shows no claim tag on a personal row", async () => {
    render(
      <ThreadRowIndicators
        {...baseProps}
        isMuted={false}
        mutedUntilTime={undefined}
        isMentionsOnly={false}
      />,
      { wrapper },
    );
    await waitFor(() => {
      expect(screen.getByText("10:00")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Unclaimed|Yours|With /)).not.toBeInTheDocument();
  });
});
