import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommunitiesPickerSection } from "./CommunitiesPickerSection";
import type { FeaturedCommunityRef } from "../members/profileCommunities.types";
import { currentUser } from "../members/data/members";
import { TestProviders } from "../../test/TestProviders";

const ELIGIBLE_COMMUNITIES: FeaturedCommunityRef[] = [
  {
    slug: "a",
    name: "Alpha",
    tagline: "",
    type: "sports",
    typeLabel: "Sports",
    countLabel: "1",
    role: "owner",
  },
  {
    slug: "b",
    name: "Beta",
    tagline: "",
    type: "sports",
    typeLabel: "Sports",
    countLabel: "1",
    role: "member",
  },
];
vi.mock("../members/useMyCommunityCards", () => ({
  useMyCommunityCards: () => ELIGIBLE_COMMUNITIES,
}));

let draftFeaturedSlugs: string[] = [];
const updateDraft = vi.fn(
  (patch: { featuredCommunities?: string[] }) => {
    if (patch.featuredCommunities) draftFeaturedSlugs = patch.featuredCommunities;
  },
);
vi.mock("../../app/providers/useProfile", async (importOriginal) => {
  // Fresh fixtures built PER CALL (not hoisted to module scope) so each
  // re-render re-reads the live `draftFeaturedSlugs` — tests reassign it
  // (`draftFeaturedSlugs = [...]`) between renders and expect that to show up
  // in the next `draft` read, the same way the original single-hook mock did.
  const editFixture = () => ({
    isEditing: true,
    draft: { featuredCommunities: draftFeaturedSlugs },
    justSaved: false,
    savedVersion: 0,
    isSaving: false,
    saveError: null,
    isDirty: false,
    startEditing: vi.fn(),
    cancelEditing: vi.fn(),
    requestCancel: vi.fn(),
    save: vi.fn(() => Promise.resolve(true)),
    updateDraft,
  });
  const dataFixture = () => ({
    profile: currentUser,
    isProfileLoading: false,
    isProfileError: false,
    retryProfile: vi.fn(),
  });
  return {
    // Keep the module's real exports (`ProfileDataContext`, `toDraft`, …) so
    // the real `ProfileProvider` that TestProviders mounts still works;
    // override only the hooks the components under test actually read.
    // `useProfile` (both this component and `PublicProfileProvider` used to
    // share it) is kept for compatibility; `CommunitiesPickerSection` now
    // reads the split `useProfileEdit()` (see `useProfile.ts`'s context
    // split), and `PublicProfileProvider` reads `useProfileData()`.
    ...(await importOriginal<
      typeof import("../../app/providers/useProfile")
    >()),
    useProfile: () => ({ ...dataFixture(), ...editFixture() }),
    useProfileData: dataFixture,
    useProfileEdit: editFixture,
  };
});

function renderPicker(onChange?: (section: string) => void) {
  return render(
    <TestProviders>
      <CommunitiesPickerSection onChange={onChange} />
    </TestProviders>,
  );
}

describe("CommunitiesPickerSection", () => {
  it("lists eligible communities (private already excluded upstream)", () => {
    draftFeaturedSlugs = [];
    renderPicker();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("featuring a community adds its slug to the draft", () => {
    draftFeaturedSlugs = [];
    renderPicker();
    fireEvent.click(screen.getAllByRole("button", { name: /feature/i })[0]!);
    expect(updateDraft).toHaveBeenCalledWith({ featuredCommunities: ["a"] });
  });

  it("featuring a community reports the change via onChange, so a communities-only edit dirties the save bar", () => {
    draftFeaturedSlugs = [];
    const onChange = vi.fn();
    renderPicker(onChange);
    fireEvent.click(screen.getAllByRole("button", { name: /feature/i })[0]!);
    expect(onChange).toHaveBeenCalledWith("communities");
  });
});
