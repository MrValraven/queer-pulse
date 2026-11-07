import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  CouncilSection,
  DecisionsSection,
  ModerationSection,
  PrinciplesSection,
  RaiseSection,
} from "./GovernanceSections";
import type {
  CouncilSeatView,
  GovernanceOverviewResult,
} from "./api/useGovernanceOverview";
import { concernStatusLink, type ConcernAckDTO } from "./api/governance.api";
import { DEMO_SUBMITTED_CONCERN_CODE } from "./concernStatus.data";
import { AUTH_STORAGE_KEY } from "../marketing/cookies.data";

/**
 * Extends the existing Health/Finances coverage to the five other governance
 * sections. The four overview-backed sections (Moderation, Council, Principles,
 * Decisions) all render `SectionError` (a synchronous `role="alert"` + a retry
 * button wired to the hook's `retry`) when the live fetch fails, instead of a
 * silently-empty list — so we mock the shared hook at its boundary and drive the
 * `error` flag. RaiseSection has no data hook but a real dual-mode branch:
 * demo confirms locally, live POSTs to the concern-intake endpoint (which
 * exists now) and confirms on success. Both paths are gated behind the same
 * validation, so we flip a mutable `useDemoMode`, stub the submit, and capture
 * `showToast`. `role="alert"`, the button role, and plain data (a council name,
 * a step number) are all synchronous.
 */

const retry = vi.fn();
let overviewState: GovernanceOverviewResult;

vi.mock("./api/useGovernanceOverview", () => ({
  useGovernanceOverview: () => overviewState,
}));

const submitConcern = vi.fn(
  (_submission: unknown): Promise<ConcernAckDTO | undefined> =>
    Promise.resolve(undefined),
);

/** What the intake endpoint answers a recorded concern with (PRD-261). */
const LIVE_CONCERN_ACK = {
  id: "intake-1",
  status: "received",
  statusToken: "QP-LIVE-CODE-1",
  submittedAt: "2026-11-07T10:00:00.000Z",
} satisfies ConcernAckDTO;
vi.mock("./api/governance.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/governance.api")>()),
  submitConcern: (submission: unknown) => submitConcern(submission),
}));

const showToast = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

let demoMode = true;
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({
    demoMode,
    available: !demoMode,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

function overviewOk(): GovernanceOverviewResult {
  return {
    health: [],
    moderationSteps: [],
    council: [],
    principles: [],
    decisions: [],
    loading: false,
    error: false,
    retry,
  };
}

beforeEach(() => {
  retry.mockReset();
  showToast.mockReset();
  demoMode = true;
  overviewState = overviewOk();
  localStorage.removeItem(AUTH_STORAGE_KEY);
});

/**
 * `SectionError`'s alert, isolated from `ToastProvider`'s two always-mounted
 * live regions. Both toast regions render from first paint by design (WCAG
 * 4.1.3) and the assertive one also carries `role="alert"`, so a bare
 * `getByRole("alert")` matches multiple / a bare `queryByRole("alert")` is never
 * null. `SectionError` is the only alert that contains a retry button, so we
 * key off that. Returns null when no section is in its error state.
 */
function querySectionErrorAlert(): HTMLElement | null {
  return (
    screen
      .queryAllByRole("alert")
      .find((region) => within(region).queryByRole("button") !== null) ?? null
  );
}

describe("ModerationSection", () => {
  it("renders the numbered steps on a successful load", () => {
    overviewState = {
      ...overviewOk(),
      moderationSteps: [
        {
          titleKey: "governance:steps.a.title",
          textKey: "governance:steps.a.text",
        },
      ],
    };
    render(
      <TestProviders>
        <ModerationSection />
      </TestProviders>,
    );
    // The step ordinal is plain data (index + 1), not i18n.
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(querySectionErrorAlert()).toBeNull();
  });

  it("shows the retry alert and re-fetches when the overview failed", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <ModerationSection />
      </TestProviders>,
    );
    const sectionAlert = querySectionErrorAlert();
    expect(sectionAlert).not.toBeNull();
    fireEvent.click(within(sectionAlert!).getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("CouncilSection", () => {
  /** One resolved seat. A seat names a staff member, so every field about the
   *  person comes from that member's profile. */
  const seat = (overrides: Partial<CouncilSeatView> = {}): CouncilSeatView => ({
    slug: "alex-rivera",
    name: "Alex Rivera",
    initials: "AR",
    avatarUrl: null,
    // PRD-265: a seat's role is a `GovernanceText` — a seeded i18n key or the
    // editor's own EN/PT. This fixture is the seeded form.
    role: { key: "governance:council.chair", authored: null },
    background: "rgba(0,0,0,.1)",
    color: "var(--plum)",
    ...overrides,
  });

  it("renders each seat's (plain-data) name on a successful load", () => {
    overviewState = { ...overviewOk(), council: [seat()] };
    render(
      <TestProviders>
        <CouncilSection />
      </TestProviders>,
    );
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(querySectionErrorAlert()).toBeNull();
  });

  it("falls back to the tinted monogram when the seat-holder shows no photo", () => {
    overviewState = { ...overviewOk(), council: [seat()] };
    const { container } = render(
      <TestProviders>
        <CouncilSection />
      </TestProviders>,
    );
    expect(screen.getByText("AR")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("draws the seat-holder's photo when they have one", () => {
    overviewState = {
      ...overviewOk(),
      council: [seat({ avatarUrl: "https://example.test/alex.jpg" })],
    };
    const { container } = render(
      <TestProviders>
        <CouncilSection />
      </TestProviders>,
    );
    const photo = container.querySelector("img");
    expect(photo).not.toBeNull();
    // The name is rendered beside the circle, so the image is decorative —
    // announcing it too would read the same person twice.
    expect(photo).toHaveAttribute("alt", "");
    // Google/OAuth avatars 403 when a referrer is sent.
    expect(photo).toHaveAttribute("referrerPolicy", "no-referrer");
  });

  it("does NOT link a signed-out visitor to a gated member profile", () => {
    overviewState = { ...overviewOk(), council: [seat()] };
    // The demo session reads this flag on mount; "false" is a signed-out visitor.
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders>
        <CouncilSection />
      </TestProviders>,
    );
    // `/governance` is public and `/members/*` is not: a link here would bounce
    // a visitor into the auth gate from a page built to be read by anyone.
    expect(
      screen.queryByRole("link", { name: "Alex Rivera" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
  });

  it("shows the retry alert and re-fetches on failure", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <CouncilSection />
      </TestProviders>,
    );
    const sectionAlert = querySectionErrorAlert();
    expect(sectionAlert).not.toBeNull();
    fireEvent.click(within(sectionAlert!).getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("PrinciplesSection", () => {
  it("shows the retry alert and re-fetches on failure", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <PrinciplesSection />
      </TestProviders>,
    );
    const sectionAlert = querySectionErrorAlert();
    expect(sectionAlert).not.toBeNull();
    fireEvent.click(within(sectionAlert!).getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("DecisionsSection", () => {
  it("shows the retry alert and re-fetches on failure", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <DecisionsSection />
      </TestProviders>,
    );
    const sectionAlert = querySectionErrorAlert();
    expect(sectionAlert).not.toBeNull();
    fireEvent.click(within(sectionAlert!).getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("RaiseSection dual-mode submit", () => {
  /** Fill the two fields a triager needs before a submission is accepted. */
  async function fillConcern() {
    fireEvent.click(
      await screen.findByRole("button", { name: "What kind of concern?" }),
    );
    fireEvent.click(
      await screen.findByRole("option", {
        name: "Report a member or behaviour",
      }),
    );
    fireEvent.change(
      screen.getByLabelText(
        "Describe what happened, or what's wrong, in as much detail as you're comfortable with…",
      ),
      { target: { value: "Someone is following me across threads." } },
    );
  }

  async function clickSubmit() {
    fireEvent.click(await screen.findByRole("button", { name: /^Submit/ }));
  }

  it("refuses an empty submission rather than filing an empty task", async () => {
    render(
      <TestProviders>
        <RaiseSection />
      </TestProviders>,
    );
    await clickSubmit();
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast.mock.calls[0]![1]).toBe("error");
    expect(submitConcern).not.toHaveBeenCalled();
  });

  it("hands over the demo reference code in demo mode, without calling the API", async () => {
    render(
      <TestProviders>
        <RaiseSection />
      </TestProviders>,
    );
    await fillConcern();
    await clickSubmit();
    // The submitted panel replaces the form and carries the code the status
    // page resolves in the sandbox; a code on screen is the confirmation.
    expect(
      await screen.findByText("Your concern is with us"),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(DEMO_SUBMITTED_CONCERN_CODE),
    ).toBeInTheDocument();
    expect(showToast).not.toHaveBeenCalled();
    expect(submitConcern).not.toHaveBeenCalled();
  });

  it("POSTs the concern and hands over the returned reference code in live mode", async () => {
    demoMode = false;
    submitConcern.mockResolvedValueOnce(LIVE_CONCERN_ACK);
    render(
      <TestProviders>
        <RaiseSection />
      </TestProviders>,
    );
    await fillConcern();
    await clickSubmit();
    await waitFor(() => expect(submitConcern).toHaveBeenCalledTimes(1));
    expect(submitConcern).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "member",
        description: "Someone is following me across threads.",
      }),
    );
    expect(
      await screen.findByText("Your concern is with us"),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(LIVE_CONCERN_ACK.statusToken),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Check on this concern" }),
    ).toHaveAttribute("href", concernStatusLink(LIVE_CONCERN_ACK.statusToken));
    expect(showToast).not.toHaveBeenCalled();
  });

  it("surfaces a failed live submit as an error, not a false confirmation", async () => {
    demoMode = false;
    submitConcern.mockRejectedValueOnce(new Error("boom"));
    render(
      <TestProviders>
        <RaiseSection />
      </TestProviders>,
    );
    await fillConcern();
    await clickSubmit();
    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(1));
    expect(showToast.mock.calls[0]![1]).toBe("error");
  });
});
