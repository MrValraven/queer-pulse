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

/** `editor.link` defaults to `"linked"` so the pane renders the plain slug
 *  `<input>` below the choice cards rather than `UsernameField` (which pulls
 *  in the handle-availability network hook), kept out of scope here since
 *  these tests cover only the choice cards themselves. */
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
