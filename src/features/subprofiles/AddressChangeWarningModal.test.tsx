import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AddressChangeWarningModal } from "./AddressChangeWarningModal";
import type { AddressChangeKind } from "./subprofileAddressChange";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

// `t` echoes its key (params appended as JSON), the same convention
// `SubprofileLinkFields.test.tsx` uses, so these assertions do not depend on
// the coordinator having merged this wave's `addressWarning.*` keys yet.
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string, params?: Record<string, unknown>) =>
      params ? key + JSON.stringify(params) : key,
  }),
}));

const MODAL_TITLE = "subprofiles:addressWarning.switchTitle";

function renderModal(
  changeKind: AddressChangeKind,
  overrides: {
    newPath?: string | null;
    followerCount?: number;
    endorsementCount?: number;
  } = {},
) {
  return render(
    <TestProviders>
      <AddressChangeWarningModal
        title={MODAL_TITLE}
        oldPath="/p/tiago-code"
        newPath={
          overrides.newPath === undefined ? "/p/code" : overrides.newPath
        }
        releasesHandle
        changeKind={changeKind}
        followerCount={overrides.followerCount}
        endorsementCount={overrides.endorsementCount}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("AddressChangeWarningModal", () => {
  it("leads a linked-to-standalone switch with the permanent loss and a danger confirm that names it", () => {
    renderModal("linkToUnlink", { newPath: null });

    expect(
      screen.getByText("subprofiles:addressWarning.unlinkLossTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("subprofiles:addressWarning.unlinkLossBody"),
    ).toBeInTheDocument();
    // The generic "This address is live" warning gives way to the loss.
    expect(
      screen.queryByText("subprofiles:addressWarning.noticeTitle"),
    ).not.toBeInTheDocument();
    // The recoverable consequences stay in the quieter list.
    expect(
      screen.getByText("subprofiles:addressWarning.unlinkBackToDraft"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("subprofiles:addressWarning.handleReleased"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("subprofiles:addressWarning.followersKept"),
    ).not.toBeInTheDocument();

    // The danger variant and this label switch together in the component.
    expect(
      screen.getByRole("button", {
        name: "subprofiles:addressWarning.confirmUnlink",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "subprofiles:addressWarning.confirm",
      }),
    ).not.toBeInTheDocument();
  });

  it("keeps the count-free loss title when the persona has no followers or endorsements", () => {
    renderModal("linkToUnlink", {
      newPath: null,
      followerCount: 0,
      endorsementCount: 0,
    });

    expect(
      screen.getByText("subprofiles:addressWarning.unlinkLossTitle"),
    ).toBeInTheDocument();
  });

  it("gives a rename a neutral note of where the page moves, one forwarding row and the primary confirm", () => {
    renderModal("rename", { newPath: "/p/codeworks-lab" });

    expect(
      screen.getByText(
        'subprofiles:addressWarning.renameNoticeTitle{"to":"/p/codeworks-lab"}',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("subprofiles:addressWarning.noticeTitle"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'subprofiles:addressWarning.renameOldLinksForward{"path":"/p/tiago-code"}',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("subprofiles:addressWarning.followersKept"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "subprofiles:addressWarning.confirm",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the live-address warning and the primary confirm for a switch to linked", () => {
    renderModal("other", { newPath: "/p/tiago-code" });

    expect(
      screen.getByText("subprofiles:addressWarning.noticeTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("subprofiles:addressWarning.handleReleased"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("subprofiles:addressWarning.unlinkBackToDraft"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "subprofiles:addressWarning.confirm",
      }),
    ).toBeInTheDocument();
  });
});
