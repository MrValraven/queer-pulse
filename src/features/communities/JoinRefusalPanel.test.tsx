import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { JoinRefusalPanelKind } from "./api/communityJoin.api";
import { JoinRefusalPanel } from "./JoinRefusalPanel";

/**
 * Every refusal the join wizard can show, read in English. The communities
 * catalog loads lazily, so the first assertion of each case waits for it with
 * a `findBy` query.
 *
 * Demo mode is a hoisted flag, live by default, so a case can run the pending
 * panel's withdraw in either mode. The withdraw hook is a stand-in that
 * settles at once, so most cases assert what the panel does with a settled
 * withdrawal; its `isPending` and `isPaused` are hoisted flags too, so a
 * case can hold a withdrawal in flight or parked offline, and
 * `isInFlightAnywhere` stands in for a withdraw of the same slug started by
 * another surface or an earlier mount. The membership store's
 * `withdrawRequest` is a spy, which is where a demo withdrawal lands.
 */
const { demoModeState, withdrawState, withdrawMock, withdrawRequestMock } =
  vi.hoisted(() => ({
    demoModeState: { isDemoMode: false },
    withdrawState: {
      isPending: false,
      isPaused: false,
      isInFlightAnywhere: false,
    },
    withdrawMock: vi.fn((onSettled: () => void) => onSettled()),
    withdrawRequestMock: vi.fn(),
  }));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: demoModeState.isDemoMode,
    setDemoMode: vi.fn(),
  }),
}));

vi.mock("./api/useWithdrawJoinRequestWithFeedback", () => ({
  useWithdrawJoinRequestWithFeedback: () => ({
    withdraw: withdrawMock,
    mutation: {
      isPending: withdrawState.isPending,
      isPaused: withdrawState.isPaused,
    },
  }),
}));

vi.mock("./api/useCommunityJoin", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useIsWithdrawingJoinRequest: () => withdrawState.isInFlightAnywhere,
}));

vi.mock(
  "../../app/providers/useCommunityMembership",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useCommunityMembership: () => ({ withdrawRequest: withdrawRequestMock }),
  }),
);

beforeEach(() => {
  demoModeState.isDemoMode = false;
  withdrawState.isPending = false;
  withdrawState.isPaused = false;
  withdrawState.isInFlightAnywhere = false;
  withdrawMock.mockReset();
  withdrawMock.mockImplementation((onSettled: () => void) => onSettled());
  withdrawRequestMock.mockClear();
});

function panelElement(
  refusal: JoinRefusalPanelKind,
  parentName: string | undefined,
  options: { parentSlug?: string; onClose?: () => void },
) {
  return (
    <TestProviders>
      <JoinRefusalPanel
        refusal={refusal}
        slug="queer-youth"
        communityName="Queer Youth"
        parentName={parentName}
        parentSlug={options.parentSlug}
        onClose={options.onClose ?? (() => {})}
      />
    </TestProviders>
  );
}

function renderPanel(
  refusal: JoinRefusalPanelKind,
  parentName?: string,
  options: { parentSlug?: string; onClose?: () => void } = {},
) {
  return render(panelElement(refusal, parentName, options));
}

describe("JoinRefusalPanel", () => {
  it("a manual pause reads as a moderator pause", async () => {
    renderPanel({ kind: "frozen", frozenReason: "manual" });

    expect(
      await screen.findByText("This community is paused"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a moderator paused this community/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/report/i)).not.toBeInTheDocument();
  });

  it("an emergency pause reads as a serious report", async () => {
    renderPanel({ kind: "frozen", frozenReason: "emergency_report" });

    expect(
      await screen.findByText(/a serious report came in/i),
    ).toBeInTheDocument();
  });

  it("a parent pause with no parent name falls back to the generic pause line", async () => {
    renderPanel({ kind: "frozen", frozenReason: "parent_frozen" });

    expect(
      await screen.findByText(
        /new posts and joins are on hold until moderators lift it/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\{name\}/)).not.toBeInTheDocument();
  });

  it("a pending request says the request is already in", async () => {
    renderPanel({ kind: "alreadyPending" });

    expect(
      await screen.findByRole("heading", {
        name: "Your request is already in",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The moderators have it, and their answer will reach you here.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/community's page/i)).not.toBeInTheDocument();
  });

  it("a space's pause is titled as the space's", async () => {
    renderPanel(
      { kind: "frozen", frozenReason: "parent_frozen" },
      "Lisbon Queers",
    );

    expect(
      await screen.findByRole("heading", { name: "This space is paused" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This space is paused because Lisbon Queers is paused."),
    ).toBeInTheDocument();
  });

  it("join the parent first links to the parent when its slug is known", async () => {
    renderPanel({ kind: "parentRequired" }, "Lisbon Queers", {
      parentSlug: "lisbon-queers",
    });

    expect(
      await screen.findByRole("link", { name: "Go to Lisbon Queers" }),
    ).toHaveAttribute("href", "/community/lisbon-queers");
  });

  it("a missing parent membership names the parent on a space's own page", async () => {
    renderPanel({ kind: "parentRequired" }, "Lisbon Queers", {
      parentSlug: "lisbon-queers",
    });

    expect(
      await screen.findByText("Join Lisbon Queers first"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/this space is for members of the community/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("on the parent's own page, join the parent first says to join here and closes back onto the page", async () => {
    const onClose = vi.fn();
    renderPanel({ kind: "parentRequired" }, "Lisbon Queers", { onClose });

    expect(
      await screen.findByRole("heading", { name: "Join Lisbon Queers first" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This space is for members of Lisbon Queers. You can join from this page, then come back to the space.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Back to Lisbon Queers" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("JoinRefusalPanel pending withdraw", () => {
  it("a pending request can be withdrawn from the panel, which then closes", async () => {
    const onClose = vi.fn();
    renderPanel({ kind: "alreadyPending" }, undefined, { onClose });

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw my request" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw request" }),
    );

    expect(withdrawMock).toHaveBeenCalledTimes(1);
    expect(withdrawRequestMock).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("demo withdraws from the membership store through the same feedback hook", async () => {
    demoModeState.isDemoMode = true;
    const onClose = vi.fn();
    renderPanel({ kind: "alreadyPending" }, undefined, { onClose });

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw my request" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw request" }),
    );

    expect(withdrawRequestMock).toHaveBeenCalledWith("queer-youth");
    expect(withdrawMock).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("holds the wizard open and the controls disabled until the withdraw settles", async () => {
    let settleWithdraw: () => void = () => {};
    withdrawMock.mockImplementation((onSettled: () => void) => {
      settleWithdraw = onSettled;
    });
    const onClose = vi.fn();
    const pendingRefusal: JoinRefusalPanelKind = { kind: "alreadyPending" };
    const { rerender } = renderPanel(pendingRefusal, undefined, { onClose });

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw my request" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw request" }),
    );
    // A second press that lands before `isPending` renders sends nothing.
    fireEvent.click(screen.getByRole("button", { name: "Withdraw request" }));
    expect(withdrawMock).toHaveBeenCalledTimes(1);
    withdrawState.isPending = true;
    rerender(panelElement(pendingRefusal, undefined, { onClose }));

    expect(
      screen.getByRole("button", { name: "Withdrawing your request" }),
    ).toBeDisabled();
    const confirmButton = screen.getByRole("button", {
      name: "Withdraw request",
    });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(confirmButton);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(withdrawMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Withdraw request" }),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    act(() => settleWithdraw());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("offline, a parked withdraw lets the confirm close without sending again", async () => {
    let settleWithdraw: () => void = () => {};
    withdrawMock.mockImplementation((onSettled: () => void) => {
      settleWithdraw = onSettled;
    });
    const onClose = vi.fn();
    const pendingRefusal: JoinRefusalPanelKind = { kind: "alreadyPending" };
    const { rerender } = renderPanel(pendingRefusal, undefined, { onClose });

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw my request" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw request" }),
    );
    withdrawState.isPending = true;
    withdrawState.isPaused = true;
    rerender(panelElement(pendingRefusal, undefined, { onClose }));

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("button", { name: "Withdraw request" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Withdrawing your request" }),
    ).toBeDisabled();
    expect(withdrawMock).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    // Back online, the parked request goes out and settles: the wizard
    // closes then, with the hook's feedback.
    withdrawState.isPending = false;
    withdrawState.isPaused = false;
    act(() => settleWithdraw());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("a panel mounted while a withdraw of the slug is parked keeps the trigger disabled and sends nothing", async () => {
    withdrawState.isInFlightAnywhere = true;
    renderPanel({ kind: "alreadyPending" });

    const trigger = await screen.findByRole("button", {
      name: "Withdrawing your request",
    });
    expect(trigger).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Withdraw my request" }),
    ).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(
      screen.queryByRole("button", { name: "Withdraw request" }),
    ).not.toBeInTheDocument();
    expect(withdrawMock).not.toHaveBeenCalled();
    expect(withdrawRequestMock).not.toHaveBeenCalled();
  });

  it("a later withdraw goes out once the first one has settled", async () => {
    renderPanel({ kind: "alreadyPending" });

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw my request" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw request" }),
    );
    expect(withdrawMock).toHaveBeenCalledTimes(1);

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw my request" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw request" }),
    );

    expect(withdrawMock).toHaveBeenCalledTimes(2);
  });
});
