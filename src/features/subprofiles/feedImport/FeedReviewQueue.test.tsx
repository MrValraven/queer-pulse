import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  DEMO_EPISODES,
  DEMO_PODCAST_SUBPROFILE_ID,
} from "../data/subprofileFeeds.data";
import {
  demoListFeeds,
  resetDemoFeedsForTests,
} from "../data/subprofileFeedsDemo";
import {
  resetDemoEditVersionsForTests,
  resetDemoItemWritesForTests,
} from "../data/subprofiles.data";
import { FeedReviewQueue } from "./FeedReviewQueue";
import { editorStub } from "./feedImportTestData";
import { WithEditor } from "./feedImportTestSupport";

function renderQueue(
  editor = editorStub(),
  { sectionItemCount = 7 }: { sectionItemCount?: number } = {},
) {
  const feed = demoListFeeds(DEMO_PODCAST_SUBPROFILE_ID)[0];
  if (!feed) throw new Error("demo feed is missing");
  render(
    <TestProviders>
      <WithEditor editor={editor}>
        <FeedReviewQueue
          feed={feed}
          sectionLabel="Episodes"
          sectionItemCount={sectionItemCount}
        />
      </WithEditor>
    </TestProviders>,
  );
  return editor;
}

const reset = () => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
  resetDemoEditVersionsForTests();
};
beforeEach(reset);
afterEach(reset);

describe("FeedReviewQueue (demo mode)", () => {
  it("lists what is waiting, newest first, with date, length and episode number", async () => {
    renderQueue();
    const rows = await screen.findAllByRole("checkbox", {
      name: /./,
    });
    // One select-all plus the five waiting episodes.
    expect(rows).toHaveLength(6);
    const newest = screen.getByRole("checkbox", {
      name: "The second coming out",
    });
    expect(newest).toHaveAccessibleDescription(/48 min/);
    expect(newest).toHaveAccessibleDescription(/S2 · E10/);
    expect(
      await screen.findByText(/room for 93 more items in episodes/i),
    ).toBeInTheDocument();
  });

  it("locks publishing with a one-line reason while the editor has unsaved edits", async () => {
    renderQueue(editorStub({ dirty: true }));
    await screen.findByRole("checkbox", { name: "The second coming out" });

    expect(
      screen.getByText("Save or discard your edits first."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish all" })).toBeDisabled();
    await userEvent
      .setup()
      .click(screen.getByRole("checkbox", { name: "The second coming out" }));
    expect(
      screen.getByRole("button", { name: "Publish selected" }),
    ).toBeDisabled();
    // Setting an episode aside changes nothing on the persona, so it stays open.
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeEnabled();
  });

  it("explains a save conflict and a running save the same way", async () => {
    renderQueue(editorStub({ hasEditConflict: true }));
    expect(
      await screen.findByText(/reload the latest version first/i),
    ).toBeInTheDocument();
  });

  it("publishes the selection, hands the new version and section back to the editor, and says so", async () => {
    const user = userEvent.setup();
    const editor = renderQueue();
    await screen.findByRole("checkbox", { name: "The second coming out" });

    await user.click(screen.getByRole("checkbox", { name: /select all 5/i }));
    await user.click(screen.getByRole("button", { name: "Publish selected" }));

    expect(
      await screen.findByText("5 episodes are on your page."),
    ).toBeInTheDocument();
    // The editor takes the raised version and re-seeds the section it landed in.
    expect(editor.adoptEditVersion).toHaveBeenCalledWith(1);
    expect(editor.reseedSection).toHaveBeenCalledTimes(1);
    const [section, view] = vi.mocked(editor.reseedSection).mock.calls[0] ?? [];
    expect(section).toBe("episodes");
    const episodes = view?.sections.find(
      (candidate) => candidate.section === "episodes",
    );
    expect(episodes?.items[0]?.title).toBe(DEMO_EPISODES[0]?.title);
    expect(episodes?.items).toHaveLength(12);
    // The queue is empty now.
    expect(
      await screen.findByText(/nothing waiting for review/i),
    ).toBeInTheDocument();
  });

  it("sends the editor's version, and raises the conflict alert when the persona moved on", async () => {
    const user = userEvent.setup();
    const editor = renderQueue(editorStub({ getEditVersion: () => 41 }));
    await screen.findByRole("checkbox", { name: "The second coming out" });

    await user.click(screen.getByRole("button", { name: "Publish all" }));

    expect(
      await screen.findByText(/this persona changed while you were here/i),
    ).toBeInTheDocument();
    expect(editor.markEditConflict).toHaveBeenCalledTimes(1);
    expect(editor.adoptEditVersion).not.toHaveBeenCalled();
  });

  it("says how much room is left and what happens to episodes that do not fit", async () => {
    renderQueue(editorStub(), { sectionItemCount: 97 });
    await screen.findByRole("checkbox", { name: "The second coming out" });
    expect(
      screen.getByText(/room for 3 more items in episodes/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/only the newest 3 will go live/i),
    ).toBeInTheDocument();
  });

  it("closes publishing when the section is full", async () => {
    renderQueue(editorStub(), { sectionItemCount: 100 });
    await screen.findByRole("checkbox", { name: "The second coming out" });
    expect(screen.getByText(/episodes is full/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish all" })).toBeDisabled();
  });

  it("dismisses, then restores from the Dismissed view", async () => {
    const user = userEvent.setup();
    renderQueue();
    await user.click(
      await screen.findByRole("checkbox", { name: "The second coming out" }),
    );
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(await screen.findByText(/1 episode set aside/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismissed" }));
    const list = await screen.findByRole("list");
    await user.click(
      within(list).getByRole("button", {
        name: "Restore The second coming out",
      }),
    );
    expect(
      await screen.findByText(/1 episode is back in your review list/i),
    ).toBeInTheDocument();
  });
});
