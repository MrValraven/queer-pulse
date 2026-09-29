import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import { InviteCoOwnerModal } from "./InviteCoOwnerModal";
import type { SubprofileView } from "./api/subprofiles.adapters";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

// `t` echoes its key (params appended as JSON), the same convention
// `AddressChangeWarningModal.test.tsx` uses, so these assertions do not
// depend on the coordinator having merged this wave's catalog values yet.
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string, params?: Record<string, unknown>) =>
      params ? key + JSON.stringify(params) : key,
  }),
}));

const { mutateAsync, connectionViews } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  connectionViews: [
    { slug: "sofia", name: "Sofia Reyes", photo: undefined, pron: "she/her" },
    { slug: "amara", name: "Amara Cole", photo: undefined, pron: "they/them" },
  ],
}));

vi.mock("../connect/api/useConnectionsList", () => ({
  useConnectionsList: () => ({
    views: connectionViews,
    loading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
}));

vi.mock("./api/useSubprofileInvites", () => ({
  useSubprofileInvites: () => ({ invite: { mutateAsync, isPending: false } }),
}));

const SUBPROFILE: SubprofileView = {
  id: "sp-1",
  kind: "developer",
  slug: "codeworks",
  handle: "tiago-codeworks",
  displayName: "CodeWorks",
  avatarUrl: null,
  tagline: "",
  bio: "",
  coverUrl: null,
  accent: "coral",
  availability: null,
  ctaLabel: "",
  ctaUrl: "",
  socialLinks: [],
  linkVisibility: "linked",
  visibility: "open",
  status: "published",
  position: 0,
  sections: [],
  featured: null,
  affiliations: [],
  endorsementCount: 0,
  followerCount: 0,
  skinData: null,
  memberCount: 1,
  editVersion: 0,
};

afterEach(() => {
  mutateAsync.mockReset();
});

function renderModal() {
  return render(
    <TestProviders>
      <InviteCoOwnerModal
        subprofile={SUBPROFILE}
        excludedSlugs={[]}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );
}

/** Picks the one seeded connection and ticks the acknowledgment checkbox, so
 *  Send is ready to press. The shared setup for both permanent-failure cases
 *  below. */
async function pickPersonAndAcknowledge() {
  fireEvent.click(await screen.findByText("Sofia Reyes"));
  fireEvent.click(await screen.findByRole("checkbox"));
}

describe("InviteCoOwnerModal", () => {
  it("keeps Send disabled and shows the reason inline, with focus moved onto it, when a send is blocked (S8)", async () => {
    mutateAsync.mockRejectedValueOnce(
      new ApiError(400, "This invite is no longer available.", {
        code: "SUBPROFILE_INVITE_BLOCKED",
      }),
    );
    renderModal();
    await pickPersonAndAcknowledge();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "subprofiles:invite.confirmSend",
      }),
    );

    const notice = await screen.findByText("subprofiles:invite.toastBlocked");
    expect(
      screen.getByRole("button", { name: "subprofiles:invite.confirmSend" }),
    ).toBeDisabled();
    const noticeRegion = notice.closest('[tabindex="-1"]');
    expect(noticeRegion).not.toBeNull();
    await waitFor(() => expect(noticeRegion).toHaveFocus());
  });

  it("keeps Send disabled and shows the account-restricted reason inline, with focus moved onto it, when the sender's account is restricted", async () => {
    mutateAsync.mockRejectedValueOnce(
      new ApiError(403, "Your account is restricted.", {
        code: "ACCOUNT_RESTRICTED",
      }),
    );
    renderModal();
    await pickPersonAndAcknowledge();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "subprofiles:invite.confirmSend",
      }),
    );

    const notice = await screen.findByText("shared:apiError.accountRestricted");
    expect(
      screen.getByRole("button", { name: "subprofiles:invite.confirmSend" }),
    ).toBeDisabled();
    const noticeRegion = notice.closest('[tabindex="-1"]');
    expect(noticeRegion).not.toBeNull();
    await waitFor(() => expect(noticeRegion).toHaveFocus());
  });

  it("does not carry a stale blocked reason onto a freshly picked person", async () => {
    mutateAsync.mockRejectedValueOnce(
      new ApiError(400, "This invite is no longer available.", {
        code: "SUBPROFILE_INVITE_BLOCKED",
      }),
    );
    renderModal();
    await pickPersonAndAcknowledge();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "subprofiles:invite.confirmSend",
      }),
    );
    await screen.findByText("subprofiles:invite.toastBlocked");

    fireEvent.click(
      screen.getByRole("button", { name: "subprofiles:invite.confirmBack" }),
    );
    fireEvent.click(await screen.findByText("Amara Cole"));

    await screen.findByText("subprofiles:invite.disclosureAccessTitle");
    expect(
      screen.queryByText("subprofiles:invite.toastBlocked"),
    ).not.toBeInTheDocument();
  });
});
