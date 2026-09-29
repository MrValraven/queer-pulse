import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileLinkFields } from "./SubprofileLinkFields";
import {
  usePersonaCreatorSlug,
  usePersonaIsCreator,
} from "./usePersonaCreatorSlug";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";

/**
 * Product rule: only a persona's CREATOR may switch it from unlinked to
 * linked (linking shows the creator's name under their own profile).
 * Co-owners keep every other edit on this pane, and an already-linked
 * persona is never gated here (unlinking rules are unchanged).
 *
 * Mocks the whole `usePersonaCreatorSlug` module the same way
 * `PersonaDangerZone.test.tsx` does: the one demo fixture with more than one
 * member always has the signed-in viewer as its creator, which can't
 * exercise the non-creator branch on its own. `vi.hoisted` is required
 * because `vi.mock` is hoisted above this file's own `const`s.
 */
const { creatorSlugMock, isCreatorMock } = vi.hoisted(() => {
  const creatorSlug: MockedFunction<typeof usePersonaCreatorSlug> = vi.fn();
  const isCreator: MockedFunction<typeof usePersonaIsCreator> = vi.fn();
  return { creatorSlugMock: creatorSlug, isCreatorMock: isCreator };
});

vi.mock("./usePersonaCreatorSlug", () => ({
  usePersonaCreatorSlug: creatorSlugMock,
  usePersonaIsCreator: isCreatorMock,
}));

// `t` echoes its key (params appended as JSON) rather than resolving real
// copy, the same convention `RehomedPersonaNote.test.tsx` uses: these
// assertions don't depend on the coordinator having merged the new
// `link.creatorOnlyHint` catalog key yet.
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string, params?: Record<string, unknown>) =>
      params ? key + JSON.stringify(params) : key,
  }),
}));

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

/** Only the fields `SubprofileLinkFields` actually reads are filled in, same
 *  convention as `PersonaDangerZone.test.tsx`'s `makeView`: the cast keeps
 *  the fixture honest about what's under test. */
function makeSubprofile(
  overrides: Partial<SubprofileView> = {},
): SubprofileView {
  return {
    id: "sp-test",
    memberCount: 2,
    slug: "atelier",
    handle: null,
    status: "draft",
    linkVisibility: "unlinked",
    ...overrides,
  } as SubprofileView;
}

/** `editor.link` defaults to `"linked"` with an empty handle. `UsernameField`
 *  renders for both kinds; demo mode (forced on in vitest) keeps its
 *  availability check off the network. */
function makeEditor(
  overrides: Partial<SubprofileMetaEditor> = {},
): SubprofileMetaEditor {
  return {
    link: "linked",
    setLink: vi.fn(),
    slug: "atelier",
    setSlug: vi.fn(),
    handle: "",
    setHandle: vi.fn(),
    handleStatus: { status: "idle", reason: null },
    setHandleStatus: vi.fn(),
    visibility: "open",
    setVisibility: vi.fn(),
    ...overrides,
  } as SubprofileMetaEditor;
}

function linkedCard() {
  return screen.getByText("subprofiles:link.linked").closest("button")!;
}

function addressInput() {
  return screen.getByLabelText("subprofiles:metaForm.addressFieldLabel");
}

/** The field's own status line, found through the input's description so a
 *  toast region elsewhere in the providers can never match instead. */
function addressStatus() {
  const statusId = addressInput().getAttribute("aria-describedby")!;
  return document.getElementById(statusId)!;
}

function renderPane(subprofile: SubprofileView, editor: SubprofileMetaEditor) {
  return render(
    <TestProviders>
      <SubprofileLinkFields editor={editor} subprofile={subprofile} />
    </TestProviders>,
  );
}

describe("SubprofileLinkFields creator-only link rule", () => {
  it("locks the linked choice with a hint for a confirmed non-creator on an unlinked persona", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(false);
    const editor = makeEditor();
    renderPane(makeSubprofile({ linkVisibility: "unlinked" }), editor);

    expect(linkedCard()).toBeDisabled();
    expect(
      screen.getByText("subprofiles:link.creatorOnlyHint"),
    ).toBeInTheDocument();

    fireEvent.click(linkedCard());
    expect(editor.setLink).not.toHaveBeenCalled();
  });

  it("does not offer the linked choice while creator status is still loading", () => {
    creatorSlugMock.mockReturnValue(undefined);
    isCreatorMock.mockReturnValue(undefined);
    renderPane(makeSubprofile({ linkVisibility: "unlinked" }), makeEditor());

    expect(linkedCard()).toBeDisabled();
    // No hint yet: a "creator only" explanation would be a confidently wrong
    // guess before the answer is known.
    expect(
      screen.queryByText("subprofiles:link.creatorOnlyHint"),
    ).not.toBeInTheDocument();
  });

  it("lets the creator link an unlinked persona", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    const editor = makeEditor({ link: "unlinked" });
    renderPane(makeSubprofile({ linkVisibility: "unlinked" }), editor);

    expect(linkedCard()).not.toBeDisabled();
    expect(
      screen.queryByText("subprofiles:link.creatorOnlyHint"),
    ).not.toBeInTheDocument();

    fireEvent.click(linkedCard());
    expect(editor.setLink).toHaveBeenCalledWith("linked");
  });

  it("leaves an already-linked persona's choice unchanged for a non-creator", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(false);
    const editor = makeEditor({ link: "linked" });
    renderPane(makeSubprofile({ linkVisibility: "linked" }), editor);

    expect(linkedCard()).not.toBeDisabled();
    expect(
      screen.queryByText("subprofiles:link.creatorOnlyHint"),
    ).not.toBeInTheDocument();
  });
});

describe("SubprofileLinkFields one handle field", () => {
  it("renders the address field with the derived default for a linked persona", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({ linkVisibility: "linked" }),
      makeEditor({ link: "linked" }),
    );

    expect(addressInput()).toHaveAttribute("placeholder", "mara-atelier");
    expect(screen.getByText("/p/")).toBeInTheDocument();
  });

  it("uses the standalone placeholder for an unlinked persona", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({ linkVisibility: "unlinked" }),
      makeEditor({ link: "unlinked" }),
    );

    expect(addressInput()).toHaveAttribute(
      "placeholder",
      "subprofiles:metaForm.standalonePlaceholder",
    );
  });

  it("hints at the derived default when a linked handle is empty", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({ linkVisibility: "linked" }),
      makeEditor({ link: "linked", handle: "", slug: "atelier" }),
    );

    expect(
      screen.getByText(
        'subprofiles:metaForm.linkedHandleHint{"handle":"mara-atelier"}',
      ),
    ).toBeInTheDocument();
  });

  it("shows an unlinked handle that carries the creator slug as a field error", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({ linkVisibility: "unlinked" }),
      makeEditor({ link: "unlinked", handle: "mara-nights" }),
    );

    const status = addressStatus();
    expect(status).toHaveTextContent(
      'subprofiles:metaForm.handleNamesOwner{"creator":"mara"}',
    );
    expect(status).toHaveAttribute("data-state", "unavailable");
    expect(status).not.toHaveTextContent("settings:usernameField.free");
    expect(addressInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("leaves an unlinked handle without the creator slug unflagged", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({ linkVisibility: "unlinked" }),
      makeEditor({ link: "unlinked", handle: "nightform" }),
    );

    expect(addressStatus()).not.toHaveTextContent(
      "subprofiles:metaForm.handleNamesOwner",
    );
    expect(addressInput()).not.toHaveAttribute("aria-invalid");
  });

  it("clears the handle when a draft switches mode", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    const editor = makeEditor({ link: "linked", handle: "mara-atelier" });
    renderPane(makeSubprofile({ linkVisibility: "linked" }), editor);

    fireEvent.click(
      screen.getByText("subprofiles:link.standalone").closest("button")!,
    );
    expect(editor.setLink).toHaveBeenCalledWith("unlinked");
    expect(editor.setHandle).toHaveBeenCalledWith("");
  });
});

describe("SubprofileLinkFields address notes and warnings", () => {
  it("explains the linked default only while no handle is typed", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    const linkedNote =
      'subprofiles:newModal.linkedAddressNote{"creator":"mara"}';
    const { unmount } = renderPane(
      makeSubprofile({ linkVisibility: "linked" }),
      makeEditor({ link: "linked", handle: "" }),
    );
    expect(screen.getByText(linkedNote)).toBeInTheDocument();
    unmount();

    renderPane(
      makeSubprofile({ linkVisibility: "linked" }),
      makeEditor({ link: "linked", handle: "tc-therapy" }),
    );
    expect(screen.queryByText(linkedNote)).not.toBeInTheDocument();
  });

  it("gives the first come note only to a draft standalone persona", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    const { unmount } = renderPane(
      makeSubprofile({ linkVisibility: "unlinked" }),
      makeEditor({ link: "unlinked" }),
    );
    expect(addressStatus()).toHaveTextContent(
      "subprofiles:newModal.handleStateClaim",
    );
    unmount();

    renderPane(
      makeSubprofile({
        linkVisibility: "unlinked",
        status: "published",
        handle: "nightform",
      }),
      makeEditor({ link: "unlinked", handle: "nightform" }),
    );
    expect(
      screen.queryByText("subprofiles:newModal.handleStateClaim"),
    ).not.toBeInTheDocument();
  });

  it("skips the warning when clearing a published linked default keeps its address", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({
        linkVisibility: "linked",
        status: "published",
        handle: "mara-atelier",
      }),
      makeEditor({ link: "linked", handle: "" }),
    );

    fireEvent.focusOut(addressInput());
    expect(
      screen.queryByText("subprofiles:addressWarning.editTitle"),
    ).not.toBeInTheDocument();
  });

  it("restores the previous handle when clearing a published linked default, sending no change", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    const editor = makeEditor({ link: "linked", handle: "" });
    renderPane(
      makeSubprofile({
        linkVisibility: "linked",
        status: "published",
        handle: "mara-atelier",
      }),
      editor,
    );

    fireEvent.focusOut(addressInput());
    expect(editor.setHandle).toHaveBeenCalledWith("mara-atelier");
    expect(
      screen.queryByText("subprofiles:addressWarning.editTitle"),
    ).not.toBeInTheDocument();
  });

  it("warns before a published handle edit moves the address", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({
        linkVisibility: "linked",
        status: "published",
        handle: "mara-atelier",
      }),
      makeEditor({ link: "linked", handle: "tc-therapy" }),
    );

    fireEvent.focusOut(addressInput());
    expect(
      screen.getByText("subprofiles:addressWarning.editTitle"),
    ).toBeInTheDocument();
  });

  it("says a published persona switching to standalone waits for a new handle", () => {
    creatorSlugMock.mockReturnValue("mara");
    isCreatorMock.mockReturnValue(true);
    renderPane(
      makeSubprofile({
        linkVisibility: "linked",
        status: "published",
        handle: "mara-atelier",
      }),
      makeEditor({ link: "linked", handle: "mara-atelier" }),
    );

    fireEvent.click(
      screen.getByText("subprofiles:link.standalone").closest("button")!,
    );
    expect(
      screen.getByText(
        'subprofiles:addressWarning.noticeBodyNewHandle{"from":"/p/mara-atelier"}',
      ),
    ).toBeInTheDocument();
  });
});
