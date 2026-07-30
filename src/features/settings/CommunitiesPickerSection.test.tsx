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
vi.mock("../../app/providers/useProfile", async (importOriginal) => ({
  // `useProfile` now lives in `useProfile.ts` (both this component and
  // `PublicProfileProvider` import it there). Keep the module's real exports
  // (`ProfileContext`, `toDraft`, …) so the real `ProfileProvider` that
  // TestProviders mounts still works; override only the `useProfile` hook the
  // component reads. It must supply a realistic full context value, not just
  // what our own component reads, since PublicProfileProvider also calls it.
  ...(await importOriginal<
    typeof import("../../app/providers/useProfile")
  >()),
  useProfile: () => ({
    profile: currentUser,
    isEditing: true,
    draft: { featuredCommunities: draftFeaturedSlugs },
    justSaved: false,
    savedVersion: 0,
    isSaving: false,
    saveError: null,
    startEditing: vi.fn(),
    cancelEditing: vi.fn(),
    save: vi.fn(() => Promise.resolve(true)),
    updateDraft,
  }),
}));

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
