import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import { resetAmbassadorHandlerState } from "../../../test/msw/ambassadors.handlers";

/**
 * LIVE-mode suite for `/admin/ambassadors` against the MSW handlers in
 * `test/msw/ambassadors.handlers.ts`, which keep a small in-memory roster so a
 * grant or a revoke shows up on the refetch that follows it.
 */

// AdminShell pulls in the full admin chrome (rail, live nav badges, the auth
// backed role switcher) that this suite has no reason to exercise.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// The picker's rows render `MemberIdentity`, whose ambassador tag reads the
// session. Signed out, that roster is an empty map and nothing is fetched.
vi.mock("../../../app/providers/authContext", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/authContext")
  >()),
  useAuth: () => ({ loggedIn: false, checking: false, user: null }),
}));

const toastSpy = vi.fn();
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: toastSpy }),
}));

/** What `GET /search?type=member` answers for the grant picker. */
const SEARCHABLE_MEMBERS = [
  { type: "member", slug: "helena", name: "Helena Duarte", sub: "she/her" },
  { type: "member", slug: "beatriz", name: "Beatriz Pinto", sub: "she/her" },
];

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
  toastSpy.mockClear();
  resetAmbassadorHandlerState();
  server.use(
    http.get(`${API_V1}/search`, ({ request }) => {
      const query = (
        new URL(request.url).searchParams.get("q") ?? ""
      ).toLowerCase();
      return HttpResponse.json({
        query,
        results: SEARCHABLE_MEMBERS.filter((member) =>
          member.name.toLowerCase().includes(query),
        ),
        hasMore: false,
      });
    }),
  );
});

async function renderLivePage() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { AdminAmbassadorsPage } = await import("./AdminAmbassadorsPage");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>
          <MemoryRouter initialEntries={["/admin/ambassadors"]}>
            <AdminAmbassadorsPage />
          </MemoryRouter>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
  // The `admin` catalog loads lazily, and until it lands every label is its
  // raw key. The exact tab label only matches once the copy is in.
  await screen.findByRole("tab", { name: "Past" });
  return userEvent.setup();
}

async function grantThroughPanel(
  user: ReturnType<typeof userEvent.setup>,
  searchText: string,
  memberName: RegExp,
) {
  await user.type(
    screen.getByRole("searchbox", { name: /search members/i }),
    searchText,
  );
  await user.click(await screen.findByRole("option", { name: memberName }));
  await user.selectOptions(
    screen.getByLabelText(/^focus area/i),
    "sexual_health",
  );
  await user.type(
    screen.getByLabelText(/why this member/i),
    "Runs the testing drop-in at the community centre.",
  );
  await user.click(screen.getByRole("button", { name: /grant the status/i }));
}

describe("AdminAmbassadorsPage (live mode via MSW)", () => {
  it("lists the active ambassadors", async () => {
    await renderLivePage();

    expect(
      await screen.findByRole("link", { name: "Beatriz Pinto" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Diogo Vasques" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Rui Marçal" })).toBeNull();
  });

  it("shows revoked grants with their reason on the Past tab", async () => {
    const user = await renderLivePage();
    await screen.findByRole("link", { name: "Beatriz Pinto" });

    await user.click(screen.getByRole("tab", { name: /past/i }));

    expect(
      await screen.findByRole("link", { name: "Rui Marçal" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Stepped back to focus on work. Welcome back any time."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Beatriz Pinto" })).toBeNull();
  });

  it("posts the member, focus and reason on a grant and lists the new row", async () => {
    let grantBody: unknown;
    server.use(
      http.post(`${API_V1}/admin/ambassadors`, async ({ request }) => {
        grantBody = await request.clone().json();
        // No response: fall through to the stateful handler.
        return undefined;
      }),
    );
    const user = await renderLivePage();
    await screen.findByRole("link", { name: "Beatriz Pinto" });

    await grantThroughPanel(user, "hel", /helena duarte/i);

    expect(
      await screen.findByRole("link", { name: "Helena Duarte" }),
    ).toBeInTheDocument();
    expect(grantBody).toEqual({
      memberSlug: "helena",
      focusArea: "sexual_health",
      reason: "Runs the testing drop-in at the community centre.",
    });
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringMatching(/helena duarte is now a queerpulse ambassador/i),
      "success",
    );
  });

  it("shows the mapped message when the member is already an ambassador", async () => {
    const user = await renderLivePage();
    await screen.findByRole("link", { name: "Beatriz Pinto" });

    await grantThroughPanel(user, "bea", /beatriz pinto/i);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /already an ambassador/i,
    );
  });

  it("requires a reason to revoke, then moves the row to Past and focuses the heading", async () => {
    const user = await renderLivePage();
    await screen.findByRole("link", { name: "Beatriz Pinto" });

    await user.click(
      screen.getByRole("button", {
        name: /revoke ambassador status for beatriz pinto/i,
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: /revoke the status/i,
    });
    expect(confirmButton).toBeDisabled();

    await user.type(
      within(dialog).getByLabelText(/reason for revoking/i),
      "Asked to step back for now.",
    );
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Beatriz Pinto" })).toBeNull(),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveFocus(),
    );

    await user.click(screen.getByRole("tab", { name: /past/i }));
    expect(
      await screen.findByRole("link", { name: "Beatriz Pinto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Asked to step back for now.")).toBeInTheDocument();
  });

  it("keeps Grant and Revoke disabled until the trimmed reason has 3 characters", async () => {
    const user = await renderLivePage();
    await screen.findByRole("link", { name: "Beatriz Pinto" });

    // Grant: member and focus picked, reason padded to look longer than it is.
    await user.type(
      screen.getByRole("searchbox", { name: /search members/i }),
      "hel",
    );
    await user.click(
      await screen.findByRole("option", { name: /helena duarte/i }),
    );
    await user.selectOptions(
      screen.getByLabelText(/^focus area/i),
      "sexual_health",
    );
    const grantReason = screen.getByLabelText(/why this member/i);
    const grantButton = screen.getByRole("button", {
      name: /grant the status/i,
    });
    await user.type(grantReason, "  ab  ");
    expect(grantButton).toBeDisabled();
    await user.clear(grantReason);
    await user.type(grantReason, "abc");
    expect(grantButton).toBeEnabled();

    // Revoke: same floor inside the confirm dialog.
    await user.click(
      screen.getByRole("button", {
        name: /revoke ambassador status for diogo vasques/i,
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const revokeReason = within(dialog).getByLabelText(/reason for revoking/i);
    const confirmButton = within(dialog).getByRole("button", {
      name: /revoke the status/i,
    });
    await user.type(revokeReason, "ab");
    expect(confirmButton).toBeDisabled();
    await user.type(revokeReason, "c");
    expect(confirmButton).toBeEnabled();
  });

  it("flags a row whose invite quota override stops the bonus applying", async () => {
    await renderLivePage();

    const carlaRow = await screen.findByRole("article", {
      name: "Carla Nogueira",
    });
    expect(
      within(carlaRow).getByText(/invite quota overridden to 25/i),
    ).toBeInTheDocument();
    const beatrizRow = screen.getByRole("article", { name: "Beatriz Pinto" });
    expect(
      within(beatrizRow).queryByText(/invite quota overridden/i),
    ).toBeNull();
  });

  it("offers a staff seat in the circle while the viewer is not a member", async () => {
    await renderLivePage();

    expect(
      await screen.findByRole("button", { name: /take a staff seat/i }),
    ).toBeInTheDocument();
  });

  it("hides the staff seat once the viewer is already in the circle", async () => {
    server.use(
      http.get(`${API_V1}/admin/ambassadors/circle`, () =>
        HttpResponse.json({
          slug: "queerpulse-ambassadors",
          memberCount: 6,
          isViewerMember: true,
        }),
      ),
    );
    await renderLivePage();

    expect(await screen.findByText(/6 members/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /take a staff seat/i }),
    ).toBeNull();
  });
});
