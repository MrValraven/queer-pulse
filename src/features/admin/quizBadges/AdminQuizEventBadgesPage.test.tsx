import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { adminQuizshowEventBadgesPath, routes } from "../../../app/routeMap";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { gatheringDetails } from "../../gatherings/data";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
  QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
} from "../../quizshow/api/quizshowDemoStore.data";
import { demoQuizEventIdOf } from "../../quizshow/winBadges/quizWinBadgesDemo.data";
import { resetQuizWinBadgesDemoStore } from "../../quizshow/winBadges/quizWinBadgesDemoStore";
import { AdminQuizEventBadgesPage } from "./AdminQuizEventBadgesPage";

// The admin chrome (theme toggle, nav-badge queries, role switcher) has
// nothing to do with this page.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const libraryRead = vi.hoisted(() => ({ isFailing: false }));

// One test makes the demo library read fail; every other test reads it.
vi.mock(
  "../../quizshow/winBadges/quizWinBadgesDemoStore",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../quizshow/winBadges/quizWinBadgesDemoStore")
      >();
    return {
      ...original,
      demoGetQuizBadgeLibrary: () => {
        if (libraryRead.isFailing) {
          throw new Error("The demo library read failed");
        }
        return original.demoGetQuizBadgeLibrary();
      },
    };
  },
);

const KEEPS_WINS_NOTE =
  "Removing a badge keeps the wins already given. Use Revoke win on a winner to take back their game";

async function renderSetup(eventId: string) {
  render(
    <TestProviders initialEntries={[adminQuizshowEventBadgesPath(eventId)]}>
      <MotionProvider>
        <Routes>
          <Route
            path={routes.adminQuizshowEventBadges}
            element={<AdminQuizEventBadgesPage />}
          />
          <Route
            path={routes.adminQuizshowEvents}
            element={<output data-testid="events-page" />}
          />
        </Routes>
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("quizshow", "admin", "shared");
}

/** Renders a demo event's setup and waits for its heading. */
async function renderEventSetup(slug: string) {
  await renderSetup(demoQuizEventIdOf(slug));
  await screen.findByRole("heading", {
    level: 1,
    name: `Badges for ${gatheringDetails[slug]?.title ?? slug}`,
  });
  // The game cards mount once the setup and the badge library have loaded.
  await screen.findByRole("region", { name: "Game 1" });
}

function gameCard(gameNumber: number): HTMLElement {
  return screen.getByRole("region", { name: `Game ${gameNumber}` });
}

/** The finished-game row of the winner with this screen name. */
function winnerRow(screenName: string): HTMLElement {
  const row = screen
    .getByText(screenName, { selector: "p" })
    .closest("article");
  if (!row) throw new Error(`No winner row for ${screenName}`);
  return row;
}

async function attach(user: UserEvent, gameNumber: number, badgeName: string) {
  await user.click(
    within(gameCard(gameNumber)).getByRole("button", {
      name: `Attach badges to game ${gameNumber}`,
    }),
  );
  await user.click(await screen.findByRole("option", { name: badgeName }));
}

beforeEach(() => {
  libraryRead.isFailing = false;
  resetQuizWinBadgesDemoStore();
});

describe("AdminQuizEventBadgesPage", () => {
  it("shows five games with the played one tagged", async () => {
    await renderEventSetup(QUIZSHOW_DEMO_LIVE_SLUG);

    for (const gameNumber of [1, 2, 3, 4, 5]) {
      expect(gameCard(gameNumber)).toBeInTheDocument();
    }
    expect(within(gameCard(1)).getByText("Played")).toBeInTheDocument();
    expect(within(gameCard(2)).queryByText("Played")).toBeNull();
    expect(
      within(gameCard(1)).getByText("Quiz Night Champion"),
    ).toBeInTheDocument();
    expect(
      within(gameCard(3)).getByText("This game gives no badges yet"),
    ).toBeInTheDocument();
    // Game 1 already gives both live badges, so its picker says so.
    expect(
      within(gameCard(1)).getByText("Every live badge is on this game already"),
    ).toBeInTheDocument();
    expect(screen.getByText("Next game: 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save game badges" }),
    ).toBeDisabled();
  });

  it("hides Attach badges at three and says the game is full", async () => {
    const user = userEvent.setup();
    await renderEventSetup(QUIZSHOW_DEMO_RESULTS_SLUG);

    // Game 1 keeps the archived Pride badge, tagged, and the picker skips it.
    expect(within(gameCard(1)).getByText("Archived")).toBeInTheDocument();
    await user.click(
      within(gameCard(1)).getByRole("button", {
        name: "Attach badges to game 1",
      }),
    );
    expect(
      await screen.findByRole("option", { name: "Quiz Night Champion" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Pride Quiz 2026" }),
    ).toBeNull();
    await user.click(
      screen.getByRole("option", { name: "Quiz Night Champion" }),
    );
    await attach(user, 1, "Trivia Sharpshooter");

    await waitFor(() =>
      expect(
        within(gameCard(1)).queryByRole("button", {
          name: "Attach badges to game 1",
        }),
      ).toBeNull(),
    );
    expect(
      within(gameCard(1)).getByText(
        "This game gives 3 badges, the most it can",
      ),
    ).toBeInTheDocument();
    // The picker folded away with focus on it, so focus lands on the game heading.
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Game 1" }),
      ).toHaveFocus(),
    );
  });

  it("names how many badges the save gave out", async () => {
    const user = userEvent.setup();
    await renderEventSetup(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG);

    // Game 1 of this event was won by a team of three and gives no badge yet.
    await user.click(
      within(gameCard(1)).getByRole("button", {
        name: "Attach badges to game 1",
      }),
    );
    expect(
      await screen.findByRole("option", { name: "Quiz Night Champion" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Pride Quiz 2026" }),
    ).toBeNull();
    await user.click(
      screen.getByRole("option", { name: "Quiz Night Champion" }),
    );

    const save = screen.getByRole("button", { name: "Save game badges" });
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    expect(await screen.findByText("Handed out 3 badges")).toBeInTheDocument();
    await waitFor(() => expect(save).toBeDisabled());
  });

  it("shows the keeps-wins note after removing a badge from a played game", async () => {
    const user = userEvent.setup();
    await renderEventSetup(QUIZSHOW_DEMO_LIVE_SLUG);
    expect(screen.queryByText(KEEPS_WINS_NOTE)).toBeNull();

    await user.click(
      screen.getByRole("button", {
        name: "Remove Trivia Sharpshooter from game 1",
      }),
    );

    // The note sits in the card of the game that lost the badge.
    expect(
      await within(gameCard(1)).findByText(KEEPS_WINS_NOTE),
    ).toBeInTheDocument();
    expect(screen.getAllByText(KEEPS_WINS_NOTE)).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Save game badges" }),
    ).toBeEnabled();
    // Sharpshooter was the last row, so focus moves to the row above it.
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "Remove Quiz Night Champion from game 1",
        }),
      ).toHaveFocus(),
    );
  });

  it("shows a revoked winner with date and reason and no action", async () => {
    await renderEventSetup(QUIZSHOW_DEMO_LIVE_SLUG);

    const kaiRow = winnerRow("Kai");
    expect(within(kaiRow).getByText("Revoked")).toBeInTheDocument();
    expect(
      within(kaiRow).getByText(
        /^Revoked on .+: Played from the host's laptop with the answers on screen$/,
      ),
    ).toBeInTheDocument();
    expect(
      within(kaiRow).queryByRole("button", { name: "Revoke win" }),
    ).toBeNull();
  });

  it("revokes a win with a reason", async () => {
    const user = userEvent.setup();
    await renderEventSetup(QUIZSHOW_DEMO_LIVE_SLUG);

    await user.click(
      within(winnerRow("Quiz Whiz")).getByRole("button", {
        name: "Revoke win",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Revoke this win?",
    });
    const confirm = within(dialog).getByRole("button", { name: "Revoke win" });
    expect(confirm).toBeDisabled();
    // The dialog opens on the reason.
    const reasonField = within(dialog).getByRole("textbox", {
      name: /^Reason/,
    });
    await waitFor(() => expect(reasonField).toHaveFocus());

    await user.type(reasonField, "Joined the game from two accounts");
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    expect(await screen.findByText("Win revoked")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(
        within(winnerRow("Quiz Whiz")).getByText("Revoked"),
      ).toBeInTheDocument(),
    );
    expect(
      within(winnerRow("Quiz Whiz")).getByText(
        /^Revoked on .+: Joined the game from two accounts$/,
      ),
    ).toBeInTheDocument();
    // Revoke win folded away, so focus lands on the winner's name.
    await waitFor(() =>
      expect(screen.getByText("Quiz Whiz", { selector: "p" })).toHaveFocus(),
    );
  });

  it("names a failed library read above the games", async () => {
    libraryRead.isFailing = true;
    await renderEventSetup(QUIZSHOW_DEMO_LIVE_SLUG);

    const alertRow = (
      await screen.findByText("We couldn't load the quiz badges")
    ).closest('[role="alert"]');
    expect(alertRow).not.toBeNull();
    if (!(alertRow instanceof HTMLElement)) return;
    expect(
      within(alertRow).getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    // Nothing is attachable, and no game blames an empty library for it.
    expect(
      within(gameCard(3)).queryByRole("button", {
        name: "Attach badges to game 3",
      }),
    ).toBeNull();
    expect(
      screen.queryByText("Create a badge in the library first"),
    ).toBeNull();
    expect(
      screen.queryByText("Every live badge is on this game already"),
    ).toBeNull();
  });

  it("names a missing event with its own line", async () => {
    await renderSetup("nope");

    expect(
      await screen.findByText(
        "This event was deleted or its link is wrong. Search for it again.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to quiz events" }),
    ).toHaveAttribute("href", routes.adminQuizshowEvents);
  });
});
