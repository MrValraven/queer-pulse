import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type { QuizshowRetryCause } from "../realtime/quizshowClientStore";
import { QuizshowConnectionBanner } from "./QuizshowConnectionBanner";

/** The banner's own live region; TestProviders also mounts the toast regions. */
function bannerStatus(): HTMLElement {
  const [status, ...otherStatuses] = screen
    .getAllByRole("status")
    .filter((element) => element.closest("[data-toast-region]") === null);
  expect(otherStatuses).toHaveLength(0);
  if (status === undefined) {
    throw new Error("The banner rendered no status region");
  }
  return status;
}

async function renderRetrying(retryCause: QuizshowRetryCause | null) {
  render(
    <TestProviders>
      <ReducedMotionContext.Provider value={true}>
        <QuizshowConnectionBanner
          status="reconnecting"
          retryCause={retryCause}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
}

describe("QuizshowConnectionBanner", () => {
  it("says the sign-in is refreshing while an UNAUTHORIZED retry runs", async () => {
    await renderRetrying("UNAUTHORIZED");

    await waitFor(() =>
      expect(bannerStatus()).toHaveTextContent("Refreshing your sign-in"),
    );
    expect(bannerStatus()).not.toHaveTextContent("Sign in again");
  });

  it("names a server fault while it retries", async () => {
    await renderRetrying("SERVER_ERROR");

    await waitFor(() =>
      expect(bannerStatus()).toHaveTextContent(
        "The server hit a problem. Trying again",
      ),
    );
  });
});
