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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../test/msw/server";
import { API, API_V1 } from "../../test/msw/handlers";
import { TestProviders } from "../../test/TestProviders";
// Statically imported (unlike the live-mode block below, which re-imports
// per test via `loadLiveDrawer()`) so this shares its module graph — and
// therefore its DemoModeContext/I18nContext instances — with `TestProviders`,
// also a static import. Mirrors useAdminVerifications.test.tsx.
import { VerificationDetailDrawer } from "./VerificationDetailDrawer";
import {
  ADMIN_VERIFICATIONS_DEMO,
  ADMIN_VERIFICATION_HISTORY,
} from "./adminVerifications.data";
import type { AdminVerificationDTO } from "./api/adminVerifications.api";

/**
 * Demo-mode contract: the drawer renders the loaded audit history (mirroring
 * `ListingHistoryPanel`) and derives the provenance line from it rather than
 * a `grantedBy` field — `demo-user-1`'s most recent event moving it to
 * `id_verified` has `actor: null` (an automated self-serve approval) so it
 * reads "Member-earned", while `demo-user-8`'s equivalent event carries a
 * staff `actor` so it reads "Granted by {actor}". The override control is
 * live-only (no demo record to change), so Apply stays disabled in demo
 * regardless of the level picked — the reason-required-on-downgrade guard
 * itself is exercised below, against a real (MSW-mocked) PATCH, where the
 * demo-only guard doesn't also apply.
 */
/**
 * Pick a verification level. The level control migrated from a native
 * `<select>` to the shared `<Select>` primitive — a button trigger + a
 * `role="listbox"` — so we open it and click the option row rather than
 * `user.selectOptions()` (which only drives real `<select>`s).
 */
async function pickLevel(
  user: ReturnType<typeof userEvent.setup>,
  optionName: RegExp,
) {
  await user.click(await screen.findByLabelText(/Set verification level/i));
  const listbox = await screen.findByRole("listbox");
  await user.click(
    await within(listbox).findByRole("option", { name: optionName }),
  );
}

describe("VerificationDetailDrawer (demo mode)", () => {
  function demoRow(userId: string): AdminVerificationDTO {
    const row = ADMIN_VERIFICATIONS_DEMO.find((r) => r.userId === userId);
    if (!row) throw new Error(`no demo fixture row for ${userId}`);
    return row;
  }

  it("shows Member-earned provenance and the audit history for a self-serve approval", async () => {
    render(
      <TestProviders>
        <VerificationDetailDrawer
          row={demoRow("demo-user-1")}
          onClose={vi.fn()}
        />
      </TestProviders>,
    );

    expect(await screen.findByText("Member-earned")).toBeInTheDocument();
    expect(await screen.findByText("Approved")).toBeInTheDocument();
    expect(await screen.findByText("Submitted")).toBeInTheDocument();
  });

  it("shows Granted-by provenance and the reviewer's note for an admin override", async () => {
    render(
      <TestProviders>
        <VerificationDetailDrawer
          row={demoRow("demo-user-8")}
          onClose={vi.fn()}
        />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Granted by Ana Ribeiro"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Overridden")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "“Verified passport in person during a community meetup check-in.”",
      ),
    ).toBeInTheDocument();
  });

  it("shows the empty state for a member with no recorded history", async () => {
    render(
      <TestProviders>
        <VerificationDetailDrawer
          row={demoRow("demo-user-3")}
          onClose={vi.fn()}
        />
      </TestProviders>,
    );

    expect(ADMIN_VERIFICATION_HISTORY["demo-user-3"]).toBeUndefined();
    expect(await screen.findByText("No history yet.")).toBeInTheDocument();
  });

  it("keeps Apply disabled in demo mode even once a lower level and a reason are set", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <VerificationDetailDrawer
          row={demoRow("demo-user-1")}
          onClose={vi.fn()}
        />
      </TestProviders>,
    );

    await pickLevel(user, /^Phone$/);
    await user.type(screen.getByLabelText(/^Reason$/i), "Testing");

    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });
});

/**
 * LIVE-mode suite: proves the reason-required-on-downgrade guardrail (Apply
 * stays disabled while lowering the level with no reason typed, and enables
 * once one is) and that Apply PATCHes `/admin/verifications/:userId` with
 * `{ level, note }`, toasts success, and calls `onClose`. Live mode is
 * required here because `useApplyVerificationLevel` has no demo branch at
 * all (see its docblock) — the demo-mode suite above covers the separate
 * demo-disables-the-control guard instead. Mirrors the `loadLive()` idiom
 * from `useAdminVerifications.test.tsx` / `useAdminMembers.live.test.tsx`,
 * applied one layer up at the component that consumes the hooks.
 */
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

const LIVE_ROW: AdminVerificationDTO = {
  userId: "user-9",
  member: {
    slug: "helena",
    firstName: "Helena",
    lastName: "Duarte",
    avatarUrl: null,
  },
  level: "id_verified",
  method: "id_document",
  provider: "manual_review",
  providerRef: null,
  verifiedAt: "2026-08-10T09:00:00.000Z",
  updatedAt: "2026-08-10T09:00:00.000Z",
};

async function loadLiveDrawer() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { VerificationDetailDrawer: VerificationDetailDrawerLive } =
    await import("./VerificationDetailDrawer");
  const { DemoModeProvider } =
    await import("../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../app/providers/I18nProvider");
  const { ToastProvider } =
    await import("../../shared/components/feedback/ToastProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>
          <ToastProvider>{children}</ToastProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { VerificationDetailDrawer: VerificationDetailDrawerLive, wrapper };
}

describe("VerificationDetailDrawer (live mode via MSW)", () => {
  it("blocks Apply on a downgrade until a reason is typed, then PATCHes level + note", async () => {
    server.use(
      http.get(`${API_V1}/admin/verifications/${LIVE_ROW.userId}/history`, () =>
        HttpResponse.json([]),
      ),
    );
    let receivedBody: unknown;
    server.use(
      http.patch(
        `${API_V1}/admin/verifications/${LIVE_ROW.userId}`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ ...LIVE_ROW, level: "phone" });
        },
      ),
    );

    const { VerificationDetailDrawer: VerificationDetailDrawerLive, wrapper } =
      await loadLiveDrawer();
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<VerificationDetailDrawerLive row={LIVE_ROW} onClose={onClose} />, {
      wrapper,
    });

    await pickLevel(user, /^Phone$/); // lower than id_verified
    const applyButton = screen.getByRole("button", { name: "Apply" });
    expect(applyButton).toBeDisabled();

    const reasonInput = screen.getByLabelText(/^Reason$/i);
    await user.type(
      reasonInput,
      "Verified in person, revoking prior ID check.",
    );
    expect(applyButton).not.toBeDisabled();

    await user.click(applyButton);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(receivedBody).toEqual({
      level: "phone",
      note: "Verified in person, revoking prior ID check.",
    });
    expect(
      await screen.findByText("Verification level updated."),
    ).toBeInTheDocument();
  });

  it("does not require a reason when raising the level", async () => {
    server.use(
      http.get(`${API_V1}/admin/verifications/${LIVE_ROW.userId}/history`, () =>
        HttpResponse.json([]),
      ),
    );
    server.use(
      http.patch(`${API_V1}/admin/verifications/${LIVE_ROW.userId}`, () =>
        HttpResponse.json(LIVE_ROW),
      ),
    );

    const startRow: AdminVerificationDTO = { ...LIVE_ROW, level: "phone" };
    const { VerificationDetailDrawer: VerificationDetailDrawerLive, wrapper } =
      await loadLiveDrawer();
    const user = userEvent.setup();
    render(<VerificationDetailDrawerLive row={startRow} onClose={vi.fn()} />, {
      wrapper,
    });

    await pickLevel(user, /^ID-verified$/); // higher than phone

    expect(screen.getByRole("button", { name: "Apply" })).not.toBeDisabled();
  });
});
