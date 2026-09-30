import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { SubprofileFeedDTO } from "../api/subprofileFeeds.api";
import { DEMO_PODCAST_SUBPROFILE_ID } from "../data/subprofileFeeds.data";
import {
  demoListFeeds,
  resetDemoFeedsForTests,
} from "../data/subprofileFeedsDemo";
import { resetDemoItemWritesForTests } from "../data/subprofiles.data";
import { FeedCard } from "./FeedCard";
import { demoPodcastView, editorStub } from "./feedImportTestData";
import { WithEditor } from "./feedImportTestSupport";

function renderCard(
  overrides: Partial<SubprofileFeedDTO> = {},
  onDisconnected: () => void = () => undefined,
) {
  const [feed] = demoListFeeds(DEMO_PODCAST_SUBPROFILE_ID);
  if (!feed) throw new Error("demo feed is missing");
  render(
    <TestProviders>
      <WithEditor editor={editorStub()}>
        <FeedCard
          subprofile={demoPodcastView()}
          feed={{ ...feed, ...overrides }}
          shouldFocus={false}
          onDisconnected={onDisconnected}
        />
      </WithEditor>
    </TestProviders>,
  );
}

const reset = () => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
};
beforeEach(reset);
afterEach(reset);

describe("FeedCard (demo mode)", () => {
  it("shows a healthy feed as connected, with when it was last checked", async () => {
    renderCard();
    expect(
      await screen.findByRole("heading", { name: "Late Bloomers" }),
    ).toBeInTheDocument();
    // The catalog loads on demand, so the first translated line is awaited.
    expect(await screen.findByText("Connected")).toBeInTheDocument();
    expect(screen.getByText(/last checked/i)).toBeInTheDocument();
    expect(screen.getByText("7 episodes on your page")).toBeInTheDocument();
  });

  it("says in plain words when we cannot reach a feed, in text and not colour alone", async () => {
    renderCard({ status: "failing", lastError: "unreachable" });
    expect(
      await screen.findByText("Can't reach your feed"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /we couldn't reach your feed\. the address may have changed/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Connected")).not.toBeInTheDocument();
  });

  it("explains that published episodes stay when disconnecting, and asks first", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(await screen.findByRole("button", { name: "Disconnect" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(
      /episodes you've already published stay on your page/i,
    );
    expect(dialog).toHaveTextContent(
      /anything still waiting for review is cleared/i,
    );
  });

  it("opens the feed's settings: section and auto-publish, off by default", async () => {
    const user = userEvent.setup();
    renderCard();
    const settings = await screen.findByRole("button", { name: /settings/i });
    expect(settings).toHaveAttribute("aria-expanded", "false");
    await user.click(settings);
    expect(settings).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("switch", {
        name: /publish new episodes automatically/i,
      }),
    ).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByRole("group", { name: /publish episodes to/i }),
    ).toBeInTheDocument();
  });

  it("Check now reports what it found", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(await screen.findByRole("button", { name: /check now/i }));
    expect(
      await screen.findByText("Found 1 new episode to review."),
    ).toBeInTheDocument();
  });

  it("disconnects: toasts that published episodes stay, closes the dialog and hands focus on", async () => {
    const user = userEvent.setup();
    const onDisconnected = vi.fn();
    renderCard({}, onDisconnected);
    await user.click(await screen.findByRole("button", { name: "Disconnect" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Disconnect" }),
    );

    expect(
      await screen.findByText(
        /feed disconnected\. your published episodes are still on your page/i,
      ),
    ).toBeInTheDocument();
    expect(onDisconnected).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The demo store let go of the feed.
    expect(demoListFeeds(DEMO_PODCAST_SUBPROFILE_ID)).toHaveLength(0);
  });
});
