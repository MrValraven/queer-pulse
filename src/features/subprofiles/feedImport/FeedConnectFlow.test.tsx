import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { resetDemoFeedsForTests } from "../data/subprofileFeedsDemo";
import { resetDemoItemWritesForTests } from "../data/subprofiles.data";
import { FeedConnectFlow } from "./FeedConnectFlow";
import { demoPodcastView } from "./feedImportTestData";

function renderFlow(onDone = vi.fn()) {
  render(
    <TestProviders>
      <FeedConnectFlow
        subprofile={demoPodcastView()}
        hasFeeds
        feedCount={1}
        onDone={onDone}
      />
    </TestProviders>,
  );
  return onDone;
}

async function lookUp(user: ReturnType<typeof userEvent.setup>, url: string) {
  // The catalog loads on demand, so the first label is awaited.
  await user.type(await screen.findByLabelText(/podcast feed address/i), url);
  await user.click(screen.getByRole("button", { name: /look up my show/i }));
}

beforeEach(() => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
});
afterEach(() => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
});

describe("FeedConnectFlow (demo mode)", () => {
  it("connects a feed: look up, see the show, choose, connect", async () => {
    const user = userEvent.setup();
    const onDone = renderFlow();

    await lookUp(user, "https://feeds.example.com/rss");

    // The preview: title, author, count and the newest episodes, with date,
    // length and season/episode. No image anywhere.
    expect(
      await screen.findByRole("heading", { name: "Late Bloomers" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Kai Duarte · 12 episodes/)).toBeInTheDocument();
    expect(screen.getByText("The second coming out")).toBeInTheDocument();
    expect(screen.getByText(/48 min/)).toBeInTheDocument();
    expect(screen.getByText(/S2 · E10/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    // Auto-publish is off by default, with an honest one-line consequence.
    const autoPublish = screen.getByRole("switch", {
      name: /publish new episodes automatically/i,
    });
    expect(autoPublish).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByText(/new episodes wait here for your review/i),
    ).toBeInTheDocument();
    await user.click(autoPublish);
    expect(autoPublish).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByText(
        /episodes we find from now on go straight to your page/i,
      ),
    ).toBeInTheDocument();
    await user.click(autoPublish);

    // Backfill defaults to bringing everything in to review.
    expect(
      screen.getByRole("radio", {
        name: /bring in all 12 episodes to review/i,
      }),
    ).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Connect" }));

    // Success is the plum panel, and says what happens next.
    expect(
      await screen.findByText(/12 episodes are waiting for your review/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Review episodes" }));
    expect(onDone).toHaveBeenCalledWith(expect.stringMatching(/^feed-demo-/));
  });

  it("offers only new episodes from now on", async () => {
    const user = userEvent.setup();
    renderFlow();
    await lookUp(user, "https://feeds.example.com/rss");
    await screen.findByRole("heading", { name: "Late Bloomers" });

    await user.click(
      screen.getByRole("radio", { name: /only new episodes from now on/i }),
    );
    await user.click(screen.getByRole("button", { name: "Connect" }));

    expect(
      await screen.findByText(/we'll check for new episodes from now on/i),
    ).toBeInTheDocument();
  });

  it("says plainly when an address is not a feed", async () => {
    const user = userEvent.setup();
    renderFlow();
    await lookUp(user, "https://example.com/about");
    expect(
      await screen.findByText(/doesn't look like a podcast feed/i),
    ).toBeInTheDocument();
  });

  it("asks for a web address before looking anything up", async () => {
    const user = userEvent.setup();
    renderFlow();
    await lookUp(user, "my podcast");
    expect(
      await screen.findByText(/doesn't look like a web address/i),
    ).toBeInTheDocument();
  });

  it("will not connect a feed that is already connected", async () => {
    const user = userEvent.setup();
    renderFlow();
    await lookUp(user, "https://feeds.latebloomers.example/podcast.xml");
    expect(
      await screen.findByText(/already connected to this persona/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect" })).toBeDisabled();
  });
});

describe("FeedConnectFlow auto-publish and existing episodes", () => {
  it("says existing episodes still wait for review when auto-publish is on", async () => {
    const user = userEvent.setup();
    renderFlow();
    await lookUp(user, "https://feeds.example.com/rss");
    await screen.findByRole("heading", { name: "Late Bloomers" });

    await user.click(
      screen.getByRole("switch", {
        name: /publish new episodes automatically/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Connect" }));

    expect(
      await screen.findByText(
        /12 episodes are waiting for your review\. Episodes we find from now on go straight to your page/i,
      ),
    ).toBeInTheDocument();
  });
});

describe("FeedConnectFlow focus and stale lookups", () => {
  it("returns focus to the address field on 'Use a different feed'", async () => {
    const user = userEvent.setup();
    renderFlow();
    await lookUp(user, "https://feeds.example.com/rss");
    await screen.findByRole("heading", { name: "Late Bloomers" });
    await user.click(
      screen.getByRole("button", { name: "Use a different feed" }),
    );
    expect(screen.getByLabelText(/podcast feed address/i)).toHaveFocus();
  });

  it("moves focus to the success panel after connecting", async () => {
    const user = userEvent.setup();
    renderFlow();
    await lookUp(user, "https://feeds.example.com/rss");
    await screen.findByRole("heading", { name: "Late Bloomers" });
    await user.click(screen.getByRole("button", { name: "Connect" }));
    const panel = await screen.findByRole("group", {
      name: /your show is connected/i,
    });
    expect(panel).toHaveFocus();
  });
});
