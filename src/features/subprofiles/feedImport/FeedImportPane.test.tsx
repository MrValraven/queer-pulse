import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { resetDemoFeedsForTests } from "../data/subprofileFeedsDemo";
import { resetDemoItemWritesForTests } from "../data/subprofiles.data";
import { FeedImportPane } from "./FeedImportPane";
import { demoPodcastView, editorStub } from "./feedImportTestData";
import { WithEditor } from "./feedImportTestSupport";

const reset = () => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
};
beforeEach(reset);
afterEach(reset);

describe("FeedImportPane (demo mode)", () => {
  it("lists the connected feed with its waiting episodes, and offers another", async () => {
    render(
      <TestProviders>
        <WithEditor editor={editorStub()}>
          <FeedImportPane subprofile={demoPodcastView()} />
        </WithEditor>
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Late Bloomers" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Bring in another show" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("checkbox", { name: "The second coming out" }),
    ).toBeInTheDocument();
  });

  it("after a disconnect, focus lands on the labelled connect heading", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <WithEditor editor={editorStub()}>
          <FeedImportPane subprofile={demoPodcastView()} />
        </WithEditor>
      </TestProviders>,
    );
    await user.click(await screen.findByRole("button", { name: "Disconnect" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Disconnect" }),
    );

    const heading = await screen.findByRole("heading", {
      name: "Bring your show in",
    });
    await waitFor(() => expect(heading).toHaveFocus());
  });
});
