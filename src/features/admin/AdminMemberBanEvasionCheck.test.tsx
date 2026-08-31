import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminMemberBanEvasionCheck } from "./AdminMemberBanEvasionCheck";
import type { BanEvasionAssessmentDTO } from "./api/adminInvites.api";

// The component owns the query boundary itself, so the hook is mocked directly
// (the same convention as AdminCommunityGrid.test.tsx) to drive the states that
// matter here without a network: not-yet-asked, loading, failed, clear, flagged.
let assessment: BanEvasionAssessmentDTO | undefined;
let isLoading = false;
let isError = false;
const enabledCalls: boolean[] = [];
const refetch = vi.fn();

vi.mock("./AdminBanEvasionSignals", () => ({
  useBanEvasionAssessmentForUser: (_userId: string, isEnabled: boolean) => {
    enabledCalls.push(isEnabled);
    return { data: assessment, isLoading, isError, refetch };
  },
}));

beforeEach(() => {
  assessment = undefined;
  isLoading = false;
  isError = false;
  enabledCalls.length = 0;
  refetch.mockClear();
});

function renderCheck() {
  return render(
    <TestProviders>
      <AdminMemberBanEvasionCheck memberId="anon_4471" />
    </TestProviders>,
  );
}

/**
 * This check's own section, isolated from `ToastProvider`'s two always-mounted
 * live regions. Both render from first paint by design (WCAG 4.1.3) and carry
 * `role="alert"` (assertive) and `role="status"` (polite), so a bare
 * `findByRole("alert")` matches several and a bare `queryByRole("alert")` is
 * never null. Scoping to the section keeps every assertion below about what
 * this component itself announces.
 */
async function findCheckSection(): Promise<HTMLElement> {
  const heading = await screen.findByRole("heading", {
    name: "Returning account check",
  });
  const section = heading.closest("section");
  if (!section) throw new Error("The check rendered no <section> wrapper.");
  return section;
}

const FLAGGED_ASSESSMENT: BanEvasionAssessmentDTO = {
  subjectId: "anon_4471",
  tier: "high",
  score: 70,
  signals: [
    {
      kind: "sign_in_identifier_match",
      removalKind: "platform_ban",
      removedAt: "2026-06-21T09:15:00.000Z",
      removedAccountName: null,
      removedAccountSlug: null,
      communityName: null,
    },
  ],
};

const CLEAR_ASSESSMENT: BanEvasionAssessmentDTO = {
  subjectId: "anon_4471",
  tier: "none",
  score: 0,
  signals: [],
};

describe("AdminMemberBanEvasionCheck", () => {
  it("does not run the check until a staff member asks for it", async () => {
    // The whole point of the explicit action: opening a member drawer must not
    // compile a removed-account correlation for that person.
    const user = userEvent.setup();
    renderCheck();

    expect(enabledCalls.every((isEnabled) => isEnabled === false)).toBe(true);

    // "admin:" is an async catalogue chunk, so await the resolved label.
    await user.click(
      await screen.findByRole("button", {
        name: "Check for ban-evasion signals",
      }),
    );
    expect(enabledCalls.at(-1)).toBe(true);
  });

  it("says a failed check is not a clear result", async () => {
    // The bug this guards: collapsing a failed fetch into "nothing found" would
    // tell a moderator that a known evader is clean.
    isError = true;
    renderCheck();

    const alert = await within(await findCheckSection()).findByRole("alert");
    expect(alert).toHaveTextContent(/didn't run/i);
    expect(
      screen.queryByText(/Nothing about this account matches/i),
    ).not.toBeInTheDocument();
  });

  it("states a clear result rather than rendering nothing", async () => {
    assessment = CLEAR_ASSESSMENT;
    renderCheck();

    expect(
      await screen.findByText(/Nothing about this account matches/i),
    ).toBeInTheDocument();
    expect(
      within(await findCheckSection()).queryByRole("alert"),
    ).not.toBeInTheDocument();
  });

  it("renders the assessment panel when there are signals", async () => {
    assessment = FLAGGED_ASSESSMENT;
    renderCheck();

    expect(
      await screen.findByText(
        "Signs in with the identifier a removed account used",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("High confidence")).toBeInTheDocument();
    // The member-drawer note replaces the invite-queue wording about an
    // application: this person is already a member.
    expect(
      screen.getByText(/judge this member on what they have actually done/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Nothing about this account matches/i),
    ).not.toBeInTheDocument();
  });

  it("shows a loading state while the check is running", async () => {
    isLoading = true;
    renderCheck();

    expect(
      await within(await findCheckSection()).findByRole("status"),
    ).toHaveTextContent("Checking");
  });
});
