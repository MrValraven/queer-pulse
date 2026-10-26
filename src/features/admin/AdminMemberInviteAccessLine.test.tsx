import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MEMBERS, type AdminMember } from "./adminMembers.data";
import { AdminMemberInviteAccessLine } from "./AdminMemberInviteAccessLine";
import { useAdminMember } from "./api/useAdminMembers";

/** Reads the detail the way the drawer does, so a cache write by the switch
 *  reaches the row. */
function DrawerHarness({ member }: { member: AdminMember }) {
  const { data: detail } = useAdminMember(member);
  if (!detail) return null;
  return <AdminMemberInviteAccessLine member={member} detail={detail} />;
}

function renderLine(memberId: string) {
  const member = MEMBERS.find((candidate) => candidate.id === memberId);
  if (!member) throw new Error(`No demo member with id ${memberId}`);
  return render(
    <TestProviders>
      <DrawerHarness member={member} />
    </TestProviders>,
  );
}

describe("AdminMemberInviteAccessLine (demo)", () => {
  it("pauses invites only after the confirm, and turns them back on in one tap", async () => {
    renderLine("ines");
    const inviteSwitch = screen.getByRole("switch", {
      name: "Invites for Inês Martins",
    });
    expect(inviteSwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Can invite new people")).toBeInTheDocument();

    fireEvent.click(inviteSwitch);
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Pause invites for Inês Martins?"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/2 pending invites/)).toBeInTheDocument();
    expect(inviteSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Pause invites" }),
    );
    expect(await screen.findByText("Invites paused")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(inviteSwitch).toHaveAttribute("aria-checked", "false");

    fireEvent.click(inviteSwitch);
    expect(
      await screen.findByText("Can invite new people"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(inviteSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("says there are no pending invites for a member without any", () => {
    renderLine("devon");
    fireEvent.click(
      screen.getByRole("switch", { name: "Invites for Devon Okoro" }),
    );
    expect(
      within(screen.getByRole("dialog")).getByText(
        /They have no pending invites right now/,
      ),
    ).toBeInTheDocument();
  });
});
