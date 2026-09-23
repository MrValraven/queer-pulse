import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { LeavePersonaModal } from "./LeavePersonaModal";
import type { MemberDTO } from "./api/subprofiles.api";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

/**
 * `LeavePersonaModal` reads the same members list a creator's persona would
 * (`useSubprofileMembers`), so this mocks that hook rather than the demo data
 * module underneath it, keeping the test focused on the modal's own "is the
 * viewer this persona's creator" body-copy switch. `TestProviders`' demo
 * `AuthProvider` signs the viewer in as `currentUserSlug` ("tiago"), which
 * the fixtures below key off of. The creator-leave body deliberately never
 * names a successor (the frontend can't tell an active co-owner from a
 * suspended one, and the backend prefers an active successor when it picks),
 * so these specs check for the unnamed copy rather than any particular name.
 */
const leaveMutateAsync = vi.fn().mockResolvedValue({ ok: true });
let membersFixture: MemberDTO[] = [];

vi.mock("./api/useSubprofileMembers", () => ({
  useSubprofileMembers: () => ({
    data: membersFixture,
    leave: { mutateAsync: leaveMutateAsync, isPending: false },
  }),
}));

const GENERIC_BODY =
  "You'll lose the ability to edit it. The other co-owners keep everything as it is.";
const CREATOR_BODY =
  "You'll lose editing access. The co-owner who's been here longest becomes the creator and can change its address or visibility, or delete it.";

function makeMember(overrides: Partial<MemberDTO>): MemberDTO {
  return {
    userId: "member",
    name: "Member",
    slug: "member",
    avatarUrl: null,
    joinedAt: "2026-01-01T00:00:00.000Z",
    isCreator: false,
    ...overrides,
  };
}

describe("LeavePersonaModal", () => {
  beforeEach(() => {
    leaveMutateAsync.mockClear();
  });

  it("shows the creator-specific leave body, unnamed, when the viewer created the persona", async () => {
    membersFixture = [
      makeMember({
        userId: "tiago",
        slug: "tiago",
        name: "Tiago Costa",
        isCreator: true,
        joinedAt: "2026-01-04T00:00:00.000Z",
      }),
      makeMember({
        userId: "rui",
        slug: "rui",
        name: "Rui Marçal",
        joinedAt: "2026-02-01T00:00:00.000Z",
      }),
    ];

    render(
      <TestProviders>
        <LeavePersonaModal subprofileId="sp-test" onClose={() => {}} />
      </TestProviders>,
    );

    expect(await screen.findByText(CREATOR_BODY)).toBeInTheDocument();
    // Never names Rui (or anyone) as the successor.
    expect(screen.queryByText(/Rui Marçal/)).not.toBeInTheDocument();
  });

  it("shows the generic leave body for a co-owner who did not create the persona", async () => {
    membersFixture = [
      makeMember({
        userId: "rui",
        slug: "rui",
        name: "Rui Marçal",
        isCreator: true,
        joinedAt: "2026-01-01T00:00:00.000Z",
      }),
      makeMember({
        userId: "tiago",
        slug: "tiago",
        name: "Tiago Costa",
        joinedAt: "2026-02-01T00:00:00.000Z",
      }),
    ];

    render(
      <TestProviders>
        <LeavePersonaModal subprofileId="sp-test" onClose={() => {}} />
      </TestProviders>,
    );

    expect(await screen.findByText(GENERIC_BODY)).toBeInTheDocument();
  });

  it("shows the generic leave body when the members list is empty (covers both the loading window and a persona with no other member)", () => {
    membersFixture = [];

    render(
      <TestProviders>
        <LeavePersonaModal subprofileId="sp-test" onClose={() => {}} />
      </TestProviders>,
    );

    expect(screen.getByText(GENERIC_BODY)).toBeInTheDocument();
  });

  it("confirms by calling the leave mutation", async () => {
    membersFixture = [
      makeMember({ userId: "rui", slug: "rui", isCreator: true }),
      makeMember({ userId: "tiago", slug: "tiago" }),
    ];
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LeavePersonaModal subprofileId="sp-test" onClose={() => {}} />
      </TestProviders>,
    );

    const confirmButton = await screen.findByRole("button", { name: "Leave" });
    await user.click(confirmButton);

    await waitFor(() => expect(leaveMutateAsync).toHaveBeenCalledTimes(1));
  });
});
