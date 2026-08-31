import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { CommunityGovernanceLogEntryDTO } from "./api/communityGovernanceLog.api";
import { ModToolsGovernanceLog } from "./ModToolsGovernanceLog";

/**
 * What the mocked hook answers with on the next render. Set per test so one
 * suite can walk the pane through its four outcomes without a network layer:
 * a loaded trail, a failed request, an empty trail, and a platform action.
 */
let hookResult: {
  data?: {
    items: CommunityGovernanceLogEntryDTO[];
    total: number;
    page: number;
    pageSize: number;
  };
  isPending: boolean;
  isError: boolean;
};

vi.mock("./api/useCommunityGovernanceLog", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./api/useCommunityGovernanceLog")>();
  return {
    ...actual,
    useCommunityGovernanceLog: () => ({ ...hookResult, refetch: vi.fn() }),
  };
});

function entry(
  overrides: Partial<CommunityGovernanceLogEntryDTO> = {},
): CommunityGovernanceLogEntryDTO {
  return {
    id: "entry-1",
    action: "member_removed",
    actor: { slug: "rui-alves", firstName: "Rui", lastName: "Alves" },
    target: { slug: "ana-costa", firstName: "Ana", lastName: "Costa" },
    isPlatformAction: false,
    details: {},
    createdAt: "2026-03-04T10:30:00.000Z",
    ...overrides,
  };
}

function renderPane() {
  return render(
    <TestProviders>
      <ModToolsGovernanceLog slug="trans-joy" viewerRole="owner" />
    </TestProviders>,
  );
}

describe("ModToolsGovernanceLog", () => {
  beforeEach(() => {
    hookResult = { isPending: false, isError: false };
  });

  it("reads out who did what to whom, with the detail the server recorded", async () => {
    hookResult = {
      isPending: false,
      isError: false,
      data: {
        items: [
          entry({
            action: "role_changed",
            details: { fromRole: "member", toRole: "mod" },
          }),
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    };
    renderPane();

    // i18n catalogs load lazily, so the first assertion needs findBy*.
    expect(await screen.findByText("Role changed")).toBeInTheDocument();
    expect(screen.getByText("Ana Costa's role changed")).toBeInTheDocument();
    expect(screen.getByText("Member to Moderator")).toBeInTheDocument();
    expect(screen.getByText(/by Rui Alves/)).toBeInTheDocument();
  });

  it("labels a platform action as one instead of attributing it to a moderator", async () => {
    hookResult = {
      isPending: false,
      isError: false,
      data: {
        items: [
          entry({
            id: "entry-platform",
            action: "frozen",
            actor: null,
            target: null,
            isPlatformAction: true,
          }),
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    };
    renderPane();

    expect(await screen.findByText("Platform action")).toBeInTheDocument();
    expect(
      screen.getByText(/by QueerPulse platform staff/),
    ).toBeInTheDocument();
    expect(screen.queryByText("No named actor")).not.toBeInTheDocument();
  });

  it("surfaces a failed fetch as a failure, never as an empty trail", async () => {
    hookResult = { isPending: false, isError: true };
    renderPane();

    expect(
      await screen.findByText("We couldn't load the history"),
    ).toBeInTheDocument();
    // The single most damaging thing this pane could claim: a request that
    // failed must never read as "nobody has ever moderated here".
    expect(screen.queryByText("Nothing recorded yet")).not.toBeInTheDocument();
  });

  it("says a trail is genuinely empty only when the request succeeded", async () => {
    hookResult = {
      isPending: false,
      isError: false,
      data: { items: [], total: 0, page: 1, pageSize: 20 },
    };
    renderPane();

    expect(await screen.findByText("Nothing recorded yet")).toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load the history"),
    ).not.toBeInTheDocument();
  });
});
