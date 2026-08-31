import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { JoinRequestStatusDTO } from "./api/joinRequest.api";
import { JoinRequestStatusPage } from "./JoinRequestStatusPage";

/**
 * The two findings this page carries (PRD-02 and PRD-14) are both about what
 * the applicant is TOLD, so the query and mutation boundaries are mocked
 * directly rather than driven through demo fixtures: what matters here is that
 * a given backend answer produces the right sentence and the right button.
 */
let status: JoinRequestStatusDTO;
const refresh = vi.fn();
let isRefreshing = false;

vi.mock("./api/useJoinRequestStatus", () => ({
  useJoinRequestStatus: () => ({
    data: status,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("./api/useRefreshJoinRequestInvite", () => ({
  useRefreshJoinRequestInvite: () => ({
    mutate: refresh,
    isPending: isRefreshing,
    error: null,
  }),
}));

// The module-level mutation mock is shared across every test in the file, so
// it is cleared per test rather than accumulating calls.
beforeEach(() => {
  refresh.mockClear();
  isRefreshing = false;
});

/** A well-formed token in the query string, so the page skips its form and
 *  goes straight to the resolved state. */
const TOKEN = "a".repeat(43);

const approved = (
  overrides: Partial<JoinRequestStatusDTO> = {},
): JoinRequestStatusDTO => ({
  status: "approved",
  submittedAt: "2026-08-01T00:00:00.000Z",
  decidedAt: "2026-08-10T00:00:00.000Z",
  declineReason: null,
  inviteCode: "QP-ABCD-EFGH",
  inviteStatus: "valid",
  inviteExpiresAt: null,
  ...overrides,
});

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

function renderStatus() {
  return render(
    <TestProviders
      initialEntries={[`/auth/request-invite/status?token=${TOKEN}`]}
    >
      <JoinRequestStatusPage />
    </TestProviders>,
  );
}

describe("JoinRequestStatusPage: the invite deadline (PRD-02)", () => {
  it("tells an approved applicant how long the link has left", async () => {
    status = approved({ inviteExpiresAt: daysFromNow(6) });
    renderStatus();

    // `findBy` awaits the lazy `auth` i18n chunk; until it resolves the copy
    // renders as raw keys.
    expect(
      await screen.findByText(/This link works for 6 more days/),
    ).toBeInTheDocument();
  });

  it("says 'day' rather than 'days' on the last one", async () => {
    status = approved({ inviteExpiresAt: daysFromNow(1) });
    renderStatus();

    expect(
      await screen.findByText(/This link works for 1 more day,/),
    ).toBeInTheDocument();
  });

  it("never says '0 more days' on the final day", async () => {
    status = approved({ inviteExpiresAt: new Date().toISOString() });
    renderStatus();

    expect(
      await screen.findByText("This link stops working today. Open it now."),
    ).toBeInTheDocument();
  });

  it("drops the deadline line entirely when there is no usable date", async () => {
    status = approved({ inviteExpiresAt: null });
    renderStatus();

    // The invite itself is still handed over. A missing deadline must never
    // take the code down with it.
    expect(await screen.findByText("Open my invite")).toBeInTheDocument();
    expect(screen.queryByText(/This link works/)).not.toBeInTheDocument();
  });
});

describe("JoinRequestStatusPage: a spent invite (PRD-02)", () => {
  it("offers a fresh link when the window lapsed, and asks for one on click", async () => {
    status = approved({
      inviteCode: null,
      inviteStatus: "expired",
      inviteExpiresAt: daysFromNow(-3),
    });
    renderStatus();

    const button = await screen.findByRole("button", {
      name: "Give me a fresh link",
    });
    await userEvent.click(button);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does NOT offer a refresh once an account exists on the invite", async () => {
    status = approved({ inviteCode: null, inviteStatus: "used" });
    renderStatus();

    expect(
      await screen.findByText(
        /an account has since been made with this invite/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Give me a fresh link" }),
    ).not.toBeInTheDocument();
  });

  it("does NOT offer a refresh on a revoked invite", async () => {
    status = approved({ inviteCode: null, inviteStatus: "revoked" });
    renderStatus();

    expect(
      await screen.findByText(/this invite has since been withdrawn/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Give me a fresh link" }),
    ).not.toBeInTheDocument();
  });

  it("ignores a second click while the first is still in flight", async () => {
    isRefreshing = true;
    status = approved({ inviteCode: null, inviteStatus: "expired" });
    renderStatus();

    const button = await screen.findByRole("button", {
      name: /Getting your link/,
    });
    await userEvent.click(button);
    expect(refresh).not.toHaveBeenCalled();
  });
});
