import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminMemberStudioAccessLine } from "./AdminMemberStudioAccessLine";

// The demo read never fails, so a test that needs a failed first load sets
// this override; every other test reads the real hook.
const accessOverride = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}));

vi.mock("./api/useAdminStudio", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/useAdminStudio")>();
  return {
    ...actual,
    useMemberStudioAccess: (memberId: string) => {
      const realQuery = actual.useMemberStudioAccess(memberId);
      return accessOverride.current ?? realQuery;
    },
  };
});

afterEach(() => {
  accessOverride.current = null;
});

const lineFor = (memberId: string) => (
  <TestProviders>
    <AdminMemberStudioAccessLine memberId={memberId} />
  </TestProviders>
);

function renderLine(memberId: string) {
  return render(lineFor(memberId));
}

describe("AdminMemberStudioAccessLine (demo)", () => {
  it("names who granted access, and revokes it only after the confirm", async () => {
    renderLine("ines");
    expect(
      await screen.findByText(/^Granted by Sofia on /),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Revoke Studio access" }),
    );
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Revoke Studio access?"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Granted by Sofia/)).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Revoke access" }),
    );
    expect(await screen.findByText("Not granted")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Grant Studio access" }),
    ).toBeInTheDocument();
  });

  it("shows no access for a member without a grant, and grants it in one click", async () => {
    renderLine("member-without-grant");
    expect(await screen.findByText("Not granted")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Grant Studio access" }),
    );
    expect(await screen.findByText(/^Granted on /)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Revoke Studio access" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Not granted")).not.toBeInTheDocument();
  });

  it("moves focus to the swapped-in Grant button after a revoke, and back to Revoke after a grant", async () => {
    renderLine("ines");
    fireEvent.click(
      await screen.findByRole("button", { name: "Revoke Studio access" }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Revoke access",
      }),
    );
    const grantButton = await screen.findByRole("button", {
      name: "Grant Studio access",
    });
    await waitFor(() => expect(grantButton).toHaveFocus());
    fireEvent.click(grantButton);
    const revokeButton = await screen.findByRole("button", {
      name: "Revoke Studio access",
    });
    await waitFor(() => expect(revokeButton).toHaveFocus());
  });

  it("keeps a failed first load and its focused Retry mounted while the retry runs", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn(() => Promise.resolve());
    accessOverride.current = {
      data: undefined,
      errorUpdateCount: 1,
      isError: true,
      isPending: false,
      isFetching: false,
      refetch,
    };
    const view = renderLine("ines");
    expect(
      screen.getByText("We couldn't load Studio access"),
    ).toBeInTheDocument();
    const retry = screen.getByRole("button");
    await user.click(retry);
    expect(refetch).toHaveBeenCalledTimes(1);
    // What react-query reports for a never-loaded query while its retry runs:
    // back to pending, the error count kept.
    accessOverride.current = {
      ...accessOverride.current,
      isError: false,
      isPending: true,
      isFetching: true,
    };
    view.rerender(lineFor("ines"));
    expect(
      screen.getByText("We couldn't load Studio access"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBe(retry);
    expect(retry).toHaveFocus();
    expect(retry).toHaveAttribute("aria-disabled", "true");
    await user.click(retry);
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
