import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { SpaceRequestDTO } from "./api/communitySpaceRequests.api";
import { SpaceRequestPanel } from "./SpaceRequestPanel";

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

let latest: {
  data: SpaceRequestDTO | null | undefined;
  isLoading: boolean;
  isError: boolean;
};
const refetch = vi.fn();
const createMutate =
  vi.fn<(body: { note?: string }, options: MutateOptions) => void>();
const withdrawMutate =
  vi.fn<(variables: undefined, options: MutateOptions) => void>();

vi.mock("./api/useSpaceRequest", () => ({
  spaceRequestPrefix: (slug: string) => ["space-request", slug],
  useLatestSpaceRequest: () => ({ ...latest, refetch }),
  useCreateSpaceRequest: () => ({ mutate: createMutate, isPending: false }),
  useWithdrawSpaceRequest: () => ({ mutate: withdrawMutate, isPending: false }),
}));

function makeRequest(
  overrides: Partial<SpaceRequestDTO> = {},
): SpaceRequestDTO {
  return {
    id: "space-request-1",
    status: "open",
    note: null,
    createdAt: "2026-09-23T10:00:00Z",
    decidedAt: null,
    declineReason: null,
    requestedBy: null,
    ...overrides,
  };
}

function renderPanel(viewerRole: "owner" | "co_owner" | "mod") {
  return render(
    <TestProviders>
      <SpaceRequestPanel slug="coletivo-gula" viewerRole={viewerRole} />
    </TestProviders>,
  );
}

describe("SpaceRequestPanel", () => {
  beforeEach(() => {
    latest = { data: null, isLoading: false, isError: false };
    createMutate.mockReset();
    withdrawMutate.mockReset();
    refetch.mockReset();
  });

  it("lets an owner send a request with a note", async () => {
    renderPanel("owner");
    const note = await screen.findByLabelText(/what spaces would you open/i);
    await userEvent.type(note, "A parents corner");
    await userEvent.click(
      screen.getByRole("button", { name: /request spaces/i }),
    );
    expect(createMutate).toHaveBeenCalledWith(
      { note: "A parents corner" },
      expect.any(Object),
    );
  });

  it("shows a mod the status line and no form", async () => {
    renderPanel("mod");
    expect(
      await screen.findByText(/only the owner or a co-owner/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /request spaces/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an open request with a Withdraw button for a co-owner", async () => {
    latest = { data: makeRequest(), isLoading: false, isError: false };
    renderPanel("co_owner");
    expect(
      await screen.findByText(/waiting for the queerpulse team/i),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /withdraw request/i }),
    );
    expect(withdrawMutate).toHaveBeenCalled();
  });

  it("hides Withdraw from a mod on an open request", async () => {
    latest = { data: makeRequest(), isLoading: false, isError: false };
    renderPanel("mod");
    expect(
      await screen.findByText(/waiting for the queerpulse team/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /withdraw request/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the decline reason and the form again", async () => {
    latest = {
      data: makeRequest({
        status: "declined",
        declineReason: "Too small for now",
      }),
      isLoading: false,
      isError: false,
    };
    renderPanel("owner");
    expect(await screen.findByText(/too small for now/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request spaces/i }),
    ).toBeInTheDocument();
  });

  it("shows an approved request with no form until the refresh settles", () => {
    latest = {
      data: makeRequest({ status: "approved" }),
      isLoading: false,
      isError: false,
    };
    renderPanel("owner");
    // No `await` here on purpose: the one-shot community refetch the panel
    // fires for an approved request resolves on a microtask, and this
    // assertion has to land before that microtask gets a chance to run, to
    // pin down the state an owner actually sees the instant the row goes
    // "approved".
    expect(screen.getByText(/spaces are on/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /request spaces/i }),
    ).not.toBeInTheDocument();
  });

  it("offers the form again once the approval refresh settles and spaces are still off", async () => {
    // An owner whose spaces were switched off again after an earlier
    // approval: the last request is still `approved` (nothing closes it),
    // but the community's `allowsSubcommunities` is really false. Once the
    // pane's one-shot refetch for that stale `approved` status settles, it
    // must fall through to the ask-again form instead of reading "Spaces are
    // on" forever.
    latest = {
      data: makeRequest({ status: "approved" }),
      isLoading: false,
      isError: false,
    };
    renderPanel("owner");
    expect(
      await screen.findByRole("button", { name: /request spaces/i }),
    ).toBeInTheDocument();
  });

  it("treats a double submit as already waiting and refetches", async () => {
    createMutate.mockImplementation((_body, { onError }) =>
      onError?.(
        new ApiError(409, "Conflict", { code: "SPACE_REQUEST_ALREADY_OPEN" }),
      ),
    );
    renderPanel("owner");
    await userEvent.click(
      await screen.findByRole("button", { name: /request spaces/i }),
    );
    expect(await screen.findByText(/already waiting/i)).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it("treats spaces already allowed as success", async () => {
    createMutate.mockImplementation((_body, { onError }) =>
      onError?.(
        new ApiError(409, "Conflict", { code: "SPACES_ALREADY_ALLOWED" }),
      ),
    );
    renderPanel("owner");
    await userEvent.click(
      await screen.findByRole("button", { name: /request spaces/i }),
    );
    expect(
      await screen.findByText(/spaces are already on/i),
    ).toBeInTheDocument();
  });
});
