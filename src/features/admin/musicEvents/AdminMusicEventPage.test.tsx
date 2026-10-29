import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import { AdminMusicEventPage } from "./AdminMusicEventPage";

const HOUSE_SLUG = "queerpulse-club-night";
const NOT_HOSTED_SLUG = "pride-brunch";

const mocks: {
  apiGet: Mock<(path: string) => Promise<unknown>>;
  /** What the event detail request answers, by admin API path. */
  eventAnswers: Map<string, () => Promise<unknown>>;
} = vi.hoisted(() => ({
  apiGet: vi.fn<(path: string) => Promise<unknown>>(),
  eventAnswers: new Map<string, () => Promise<unknown>>(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

// Only the event detail answers; every other read the providers make stays
// pending, so nothing but the page's own request settles.
vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/client")>()),
  apiGet: (path: string) => mocks.apiGet(path),
}));

vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({
    title,
    children,
  }: {
    title: ReactNode;
    children: ReactNode;
  }) => (
    <>
      <div>{title}</div>
      {children}
    </>
  ),
}));

// The dashboard has its own house-scope tests; here it only reports what
// the page handed it and which API scope it runs in.
vi.mock("../../gatherings/ManageGatheringDashboard", async () => {
  const { useEventHostScope } = await import("../../gatherings/eventHostScope");
  return {
    ManageGatheringDashboard: function DashboardProbe({
      gathering,
      slug,
    }: {
      gathering: { title: string } | null;
      slug: string;
    }) {
      const scope = useEventHostScope();
      return (
        <div
          data-testid="dashboard"
          data-slug={slug}
          data-api={scope.apiTarget}
        >
          {gathering?.title}
        </div>
      );
    },
  };
});

function renderEventPage(slug: string) {
  return render(
    <TestProviders initialEntries={[`/admin/music-events/${slug}`]}>
      <Routes>
        <Route
          path="/admin/music-events/:slug"
          element={<AdminMusicEventPage />}
        />
      </Routes>
    </TestProviders>,
  );
}

beforeEach(() => {
  mocks.eventAnswers.clear();
  mocks.apiGet.mockReset();
  mocks.apiGet.mockImplementation((path: string) => {
    const answer = mocks.eventAnswers.get(path);
    return answer ? answer() : new Promise<never>(() => undefined);
  });
});

describe("AdminMusicEventPage", () => {
  it("names an event QueerPulse does not host and offers no Retry", async () => {
    mocks.eventAnswers.set(`/admin/music-events/${NOT_HOSTED_SLUG}`, () =>
      Promise.reject(
        new ApiError(404, "Not found", { code: "music_event_not_found" }),
      ),
    );
    renderEventPage(NOT_HOSTED_SLUG);

    expect(
      await screen.findByRole("heading", {
        name: "This event isn't hosted by QueerPulse",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to music events" }),
    ).toHaveAttribute("href", "/admin/music-events");
    expect(
      screen.queryByRole("button", { name: /retry|try again/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("dashboard")).not.toBeInTheDocument();
  });

  it("opens the house dashboard for a QueerPulse music event", async () => {
    mocks.eventAnswers.set(`/admin/music-events/${HOUSE_SLUG}`, () =>
      Promise.resolve({
        slug: HOUSE_SLUG,
        title: "QueerPulse Club Night",
        startAt: "2026-11-20T23:00:00.000Z",
        status: "published",
        visibility: "members",
        eventType: "club-night",
        gatheringFamily: "music",
        isOrganizer: true,
      }),
    );
    renderEventPage(HOUSE_SLUG);

    expect(
      await screen.findByRole("link", { name: "Music events" }),
    ).toHaveAttribute("href", "/admin/music-events");
    const dashboard = await screen.findByTestId("dashboard");
    expect(dashboard).toHaveTextContent("QueerPulse Club Night");
    expect(dashboard).toHaveAttribute("data-slug", HOUSE_SLUG);
    expect(dashboard).toHaveAttribute("data-api", "musicAdmin");
  });
});
