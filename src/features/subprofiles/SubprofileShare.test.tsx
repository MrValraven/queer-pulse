import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { TFunction } from "../../shared/i18n/types";
import { SubprofileShare } from "./SubprofileShare";
import { shareSubprofile } from "./shareSubprofile";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

// `t` echoes its key, the same convention `SubprofileLinkFields.test.tsx`
// uses, so these assertions do not depend on this wave's `share.*` keys
// having been merged into the catalogs yet.
const echoT = ((key: string) => key) as TFunction;
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

/** Only the fields the Share control and `shareSubprofile` read. */
function makeView(
  overrides: Partial<PublicSubprofileView> = {},
): PublicSubprofileView {
  return {
    id: "sp-test",
    displayName: "Codeworks",
    slug: "code",
    handle: "codeworks",
    linkVisibility: "unlinked",
    status: "published",
    ...overrides,
  } as PublicSubprofileView;
}

describe("SubprofileShare on a draft (M4)", () => {
  it("disables Share on a draft that already stores a handle, with the draft reason as its name", () => {
    render(
      <TestProviders>
        <SubprofileShare view={makeView({ status: "draft" })} />
      </TestProviders>,
    );

    expect(
      screen.getByRole("button", { name: "subprofiles:share.draftAria" }),
    ).toBeDisabled();
  });

  it("keeps Share live on a published persona", () => {
    render(
      <TestProviders>
        <SubprofileShare view={makeView()} />
      </TestProviders>,
    );

    expect(
      screen.getByRole("button", { name: "subprofiles:share.ariaLabel" }),
    ).toBeEnabled();
  });

  it("refuses to share a draft from any entry point, saying why, and copies nothing", async () => {
    const showToast = vi.fn();
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    await shareSubprofile(makeView({ status: "draft" }), echoT, showToast);

    expect(showToast).toHaveBeenCalledWith(
      "subprofiles:share.draftNotLive",
      "error",
    );
    expect(writeText).not.toHaveBeenCalled();
  });
});
