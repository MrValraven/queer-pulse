import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AdminMemberEarlyAccessSection } from "./AdminMemberEarlyAccessSection";

// The demo read and save never fail, so a test that needs a failed load, an
// empty feature list or a failed save sets an override; every other test
// reads the real hooks.
const readOverride = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}));
const saveOverride = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}));

vi.mock("../api/useAdminEarlyAccess", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/useAdminEarlyAccess")>();
  return {
    ...actual,
    useMemberEarlyAccess: (memberId: string) => {
      const realQuery = actual.useMemberEarlyAccess(memberId);
      return readOverride.current ?? realQuery;
    },
    useSetMemberEarlyAccess: () => {
      const realMutation = actual.useSetMemberEarlyAccess();
      return saveOverride.current ?? realMutation;
    },
  };
});

afterEach(() => {
  readOverride.current = null;
  saveOverride.current = null;
});

const sectionFor = (memberId: string) => (
  <TestProviders>
    <AdminMemberEarlyAccessSection memberId={memberId} />
  </TestProviders>
);

function renderSection(memberId: string) {
  return render(sectionFor(memberId));
}

const pulseLiveSwitch = () =>
  screen.findByRole("switch", { name: "Pulse Live early access" });

describe("AdminMemberEarlyAccessSection (demo)", () => {
  it("starts off for a member without a grant, and turns on in one click", async () => {
    renderSection("ines");
    const toggle = await pulseLiveSwitch();
    expect(
      screen.getByRole("heading", { name: "Early access" }),
    ).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(
      screen.getByText("Live quiz games on events, for hosts and players"),
    ).toBeInTheDocument();
    fireEvent.click(toggle);
    // A new demo grant credits the signed-in demo staff member.
    expect(
      await screen.findByText(/turned on by Tiago Costa/i),
    ).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByText("Off")).not.toBeInTheDocument();
  });

  it("names who turned a grant on, and turns it off with no confirm", async () => {
    renderSection("devon");
    const toggle = await pulseLiveSwitch();
    expect(toggle).toHaveAttribute("aria-checked", "true");
    // Seeded grants keep their historical grantor.
    expect(screen.getByText(/turned on by Inês Martins/i)).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(await screen.findByText("Off")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("renders no section while no feature is in early access", () => {
    readOverride.current = {
      data: { features: [] },
      errorUpdateCount: 0,
      isPending: false,
      isFetching: false,
    };
    renderSection("ines");
    expect(
      screen.queryByRole("heading", { name: "Early access" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("keeps a failed first load and its Retry mounted while the retry runs", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn(() => Promise.resolve());
    readOverride.current = {
      data: undefined,
      errorUpdateCount: 1,
      isError: true,
      isPending: false,
      isFetching: false,
      refetch,
    };
    const view = renderSection("ines");
    expect(screen.getByText("Couldn't load early access.")).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: "Check again" });
    await user.click(retry);
    expect(refetch).toHaveBeenCalledTimes(1);
    // What react-query reports for a never-loaded query while its retry runs:
    // back to pending, the error count kept.
    readOverride.current = {
      ...readOverride.current,
      isError: false,
      isPending: true,
      isFetching: true,
    };
    view.rerender(sectionFor("ines"));
    expect(screen.getByRole("button", { name: "Check again" })).toBe(retry);
    expect(retry).toHaveAttribute("aria-disabled", "true");
    await user.click(retry);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("says a save failed under the row, in a polite live region", async () => {
    saveOverride.current = {
      isPending: false,
      isError: true,
      mutate: vi.fn(),
    };
    renderSection("ines");
    await pulseLiveSwitch();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Couldn't save early access. Try again.",
    );
  });

  it("ignores a flip while the row's save is in flight", async () => {
    const mutate = vi.fn();
    saveOverride.current = { isPending: true, isError: false, mutate };
    renderSection("devon");
    const toggle = await pulseLiveSwitch();
    fireEvent.click(toggle);
    expect(mutate).not.toHaveBeenCalled();
    expect(toggle.parentElement).toHaveAttribute("aria-busy", "true");
  });
});
