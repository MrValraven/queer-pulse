import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { SubprofileDTO } from "./api/subprofiles.api";
import { buildSections, subprofileToView } from "./api/subprofiles.adapters";
import { SubprofileEditorProvider } from "./SubprofileEditorProvider";
import { useSubprofileEditorContext } from "./subprofileEditorContext";

/**
 * A persona type change lands in the owner cache with a new `kind`; the editor
 * re-seeds every area for that kind the same way Reload does, and a refetch
 * that keeps the kind leaves the editor mounted.
 */

const writes = vi.hoisted(() => ({
  update: vi.fn(),
  replaceSection: vi.fn(),
  replaceSocials: vi.fn(),
  replaceAffiliations: vi.fn(),
  reload: vi.fn(),
  restore: vi.fn(),
}));

vi.mock("./api/useItemRevisions", () => ({
  useItemRevisions: () => ({
    data: [
      {
        id: "rev-earlier",
        createdAt: "2026-09-01T00:00:00.000Z",
        title: "Earlier draft",
      },
    ],
    isLoading: false,
  }),
  useItemRevisionDetail: () => ({ data: undefined, isLoading: false }),
  useRestoreItemRevision: () => ({
    mutateAsync: writes.restore,
    isPending: false,
  }),
}));

vi.mock("./api/useSubprofileMutations", () => ({
  useSubprofileMutations: () => ({
    update: { mutateAsync: writes.update, isPending: false },
    replaceSection: { mutateAsync: writes.replaceSection, isPending: false },
    replaceSocials: { mutateAsync: writes.replaceSocials, isPending: false },
  }),
}));

vi.mock("./api/useAffiliations", () => ({
  useAffiliations: () => ({
    replace: { mutateAsync: writes.replaceAffiliations, isPending: false },
  }),
}));

vi.mock("./api/useSubprofile", () => ({
  useSubprofileReload: () => writes.reload,
}));

const musicianDto: SubprofileDTO = {
  id: "sp-sound",
  kind: "musician",
  slug: "sound",
  handle: "tiago-sound",
  displayName: "Tiago Costa",
  avatarUrl: null,
  tagline: null,
  bio: null,
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "linked",
  visibility: "open",
  status: "draft",
  position: 0,
  items: [],
  affiliations: [],
  endorsementCount: 0,
  followerCount: 0,
  skinData: null,
  memberCount: 1,
  editVersion: 3,
};

const musicianView = subprofileToView(musicianDto);

let mountCount = 0;

/** Counts each mount of the editor state and shows what it was seeded with. */
function Probe() {
  const context = useSubprofileEditorContext();
  useEffect(() => {
    mountCount += 1;
  }, []);
  return (
    <>
      <span data-testid="probe-kind">{context.subprofile.kind}</span>
      <span data-testid="probe-generation">{context.reloadGeneration}</span>
    </>
  );
}

beforeEach(() => {
  mountCount = 0;
  for (const write of Object.values(writes)) write.mockReset();
});

describe("SubprofileEditorProvider after a type change", () => {
  it("re-seeds every editor area when the persona's kind changes", () => {
    const { rerender } = render(
      <SubprofileEditorProvider subprofile={musicianView}>
        <Probe />
      </SubprofileEditorProvider>,
      { wrapper: TestProviders },
    );
    rerender(
      <SubprofileEditorProvider
        subprofile={{
          ...musicianView,
          kind: "dj",
          sections: buildSections(musicianDto.items, "dj", {
            includeEmpty: true,
          }),
        }}
      >
        <Probe />
      </SubprofileEditorProvider>,
    );

    expect(mountCount).toBe(2);
    expect(screen.getByTestId("probe-kind")).toHaveTextContent("dj");
    expect(screen.getByTestId("probe-generation")).toHaveTextContent("1");
  });

  it("keeps the editor mounted when a refetch brings the same kind", () => {
    const { rerender } = render(
      <SubprofileEditorProvider subprofile={musicianView}>
        <Probe />
      </SubprofileEditorProvider>,
      { wrapper: TestProviders },
    );
    rerender(
      <SubprofileEditorProvider
        subprofile={{
          ...musicianView,
          editVersion: musicianView.editVersion + 1,
        }}
      >
        <Probe />
      </SubprofileEditorProvider>,
    );

    expect(mountCount).toBe(1);
    expect(screen.getByTestId("probe-kind")).toHaveTextContent("musician");
    expect(screen.getByTestId("probe-generation")).toHaveTextContent("0");
  });
});
