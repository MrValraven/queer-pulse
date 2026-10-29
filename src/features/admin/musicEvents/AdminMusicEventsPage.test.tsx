import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AdminMusicEventsPage } from "./AdminMusicEventsPage";

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: true }),
}));

// AdminShell pulls in the full admin chrome (theme toggle, nav-badge queries,
// the auth-backed role switcher) that this list has no reason to exercise.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderListAt(entry: string) {
  return render(
    <TestProviders initialEntries={[entry]}>
      <Routes>
        <Route path="/admin/music-events" element={<AdminMusicEventsPage />} />
      </Routes>
    </TestProviders>,
  );
}

/** The admin namespace loads lazily, so every test waits for its heading. */
async function waitForPage() {
  await screen.findByRole("heading", { name: "Music events" });
}

/** The row of the event with this title. */
async function rowOf(title: string): Promise<HTMLElement> {
  const heading = await screen.findByRole("heading", { name: title });
  const row = heading.closest("article");
  if (row === null) throw new Error(`the ${title} row is missing`);
  return row;
}

describe("AdminMusicEventsPage", () => {
  it("lists upcoming house music events with lineup and request counts", async () => {
    renderListAt("/admin/music-events");
    await waitForPage();
    const clubNightTitle = await screen.findByRole("heading", {
      name: "QueerPulse Club Night",
    });
    expect(clubNightTitle).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "QueerPulse Live: Songs from the Studio",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Manage / })).toHaveLength(2);
    const clubNightRow = await rowOf("QueerPulse Club Night");
    expect(within(clubNightRow).getByText("Lineup")).toBeInTheDocument();
    expect(within(clubNightRow).getByText("3 confirmed")).toBeInTheDocument();
    expect(within(clubNightRow).getByText("2 invited")).toBeInTheDocument();
    expect(within(clubNightRow).getByText("1 declined")).toBeInTheDocument();
    const liveRow = await rowOf("QueerPulse Live: Songs from the Studio");
    expect(within(liveRow).getByText("2 confirmed")).toBeInTheDocument();
    expect(
      screen.getAllByRole("img", { name: /^\d+ requests?$/ }),
    ).toHaveLength(2);
  });

  it("shows a finished lineup on the past event", async () => {
    const user = userEvent.setup();
    renderListAt("/admin/music-events");
    await waitForPage();
    await user.click(await screen.findByRole("tab", { name: "Past" }));
    const pastRow = await rowOf("Listening Party: New Lisbon Sounds");
    expect(within(pastRow).getByText("3 confirmed")).toBeInTheDocument();
    expect(within(pastRow).getByText("0 invited")).toBeInTheDocument();
  });

  it("links Create music event to the wizard", async () => {
    renderListAt("/admin/music-events");
    await waitForPage();
    expect(
      screen.getByRole("link", { name: "Create music event" }),
    ).toHaveAttribute("href", "/admin/music-events/new");
  });

  it("shows the cancelled jam session under Cancelled", async () => {
    const user = userEvent.setup();
    renderListAt("/admin/music-events");
    await waitForPage();
    await screen.findByRole("heading", { name: "QueerPulse Club Night" });

    await user.click(screen.getByRole("tab", { name: "Cancelled" }));

    const jamTitle = await screen.findByRole("heading", {
      name: "Open Jam at the Hub",
    });
    const jamRow = jamTitle.closest("article");
    if (jamRow === null) throw new Error("the jam session row is missing");
    expect(within(jamRow).getByText("Cancelled")).toBeInTheDocument();
    expect(
      within(jamRow).getByRole("link", { name: "Manage Open Jam at the Hub" }),
    ).toHaveAttribute("href", "/admin/music-events/queerpulse-jam-session");
  });

  it("shows the invite requests to review", async () => {
    renderListAt("/admin/music-events");
    await waitForPage();
    expect(
      await screen.findByText(/invite requests? to review/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/lineup invites? waiting for a reply/),
    ).toBeInTheDocument();
  });
});
