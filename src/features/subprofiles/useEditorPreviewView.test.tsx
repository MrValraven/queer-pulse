import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorPreviewView } from "./useEditorPreviewView";
import { personaPublicPathOrNull } from "./personaLinks.data";
import type { SubprofileView } from "./api/subprofiles.adapters";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

/**
 * The hook reads the shared editor context, the creator lookups, the signed-in
 * profile and the preview-fit refs. Each is mocked to the smallest shape the
 * hook touches, so these specs pin its two address decisions: the "Open live"
 * label for a draft (M4 / S9), and the preview address for a persona with no
 * handle (N6).
 */
const { metaState } = vi.hoisted(() => ({
  metaState: { link: "linked", handle: "", slug: "code" },
}));

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

vi.mock("../../app/providers/useProfile", () => ({
  useProfileData: () => ({ profile: { slug: "viewer" } }),
}));

vi.mock("./usePersonaCreatorSlug", () => ({
  usePersonaCreatorSlug: () => "tiago",
  usePersonaCreatorName: () => "Tiago",
}));

vi.mock("./usePreviewFit", () => ({
  usePreviewFit: () => ({
    scrollRef: { current: null },
    frameRef: { current: null },
    pageRef: { current: null },
  }),
}));

vi.mock("./editorPreviewSections", () => ({
  overlaySectionRows: () => ({ sections: [], featured: [] }),
}));

vi.mock("./subprofileEditorContext", () => ({
  useSubprofileEditorContext: () => ({
    meta: {
      displayName: "Codeworks",
      tagline: "",
      bio: "",
      avatarPreview: null,
      avatarUrl: "",
      coverPreview: null,
      coverUrl: "",
      coverCrop: undefined,
      coverPreviewCrop: undefined,
      accent: "",
      availability: "",
      ctaLabel: "",
      ctaUrl: "",
      visibility: "open",
      coverBleed: false,
      ...metaState,
    },
    skinBlocks: { buildSkinBlocks: () => ({}) },
    sectionRows: {},
    socialRows: [],
    affiliationRows: [],
  }),
}));

// The preview names a freshly picked "Part of" target from the picker's
// cached options; these tests pick none, so an empty cache stands in.
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ getQueriesData: () => [] }),
}));

function makeSubprofile(overrides: Partial<SubprofileView>): SubprofileView {
  return {
    id: "sp-test",
    kind: "developer",
    slug: "code",
    handle: "codeworks",
    linkVisibility: "unlinked",
    status: "published",
    memberCount: 1,
    skinData: {},
    ...overrides,
  } as SubprofileView;
}

describe("useEditorPreviewView", () => {
  beforeEach(() => {
    metaState.link = "unlinked";
    metaState.handle = "codeworks";
    metaState.slug = "code";
  });

  it("marks the saved address of a draft as a draft page (no live promise)", () => {
    const { result } = renderHook(() =>
      useEditorPreviewView(makeSubprofile({ status: "draft" }), "mobile"),
    );
    expect(result.current.liveHref).toBe("/p/codeworks");
    expect(result.current.isDraftHref).toBe(true);
  });

  it("keeps the live label for a published persona", () => {
    const { result } = renderHook(() =>
      useEditorPreviewView(makeSubprofile({}), "mobile"),
    );
    expect(result.current.liveHref).toBe("/p/codeworks");
    expect(result.current.isDraftHref).toBe(false);
  });

  it("previews a standalone persona with its handle cleared as having no address (N6)", () => {
    metaState.handle = "";
    const { result } = renderHook(() =>
      useEditorPreviewView(makeSubprofile({}), "mobile"),
    );
    expect(personaPublicPathOrNull(result.current.data)).toBeNull();
  });

  it("previews a linked persona with no handle at its derived default", () => {
    metaState.link = "linked";
    metaState.handle = "";
    const { result } = renderHook(() =>
      useEditorPreviewView(
        makeSubprofile({ linkVisibility: "linked", handle: null }),
        "mobile",
      ),
    );
    expect(personaPublicPathOrNull(result.current.data)).toBe("/p/tiago-code");
  });
});
