import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SideCard } from "./SideCard";
import { SideRow } from "./SideRow";
import { SubprofileAvailability } from "./SubprofileAvailability";
import { SubprofileCard } from "./SubprofileCard";
import { SubprofileHeroActions } from "./SubprofileHeroActions";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import type {
  AvailabilityKey,
  SkinData,
  SubprofileCardDTO,
  SubprofileKind,
} from "./api/subprofiles.api";

// Unrun per repo policy: verified statically.

function makeOwnerView(
  kind: SubprofileKind,
  availability: AvailabilityKey | null,
  skinData: SkinData | null = null,
): SubprofileView {
  return {
    id: "sp-availability",
    kind,
    slug: "inkwell",
    handle: "inkwell",
    displayName: "Inkwell",
    avatarUrl: null,
    tagline: "Fine line",
    bio: "",
    coverUrl: null,
    accent: null,
    availability,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    position: 0,
    sections: [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    followerCount: 0,
    skinData,
    memberCount: 1,
    editVersion: 0,
  };
}

function makeCard(
  kind: SubprofileKind,
  availability: string | null,
): SubprofileCardDTO {
  return {
    handle: "inkwell",
    linkVisibility: "unlinked",
    ownerSlug: null,
    ownerName: null,
    slug: "inkwell",
    kind,
    displayName: "Inkwell",
    avatarUrl: null,
    coverUrl: null,
    tagline: "Fine line",
    accent: null,
    availability,
    socialCount: 0,
    tags: [],
    followerCount: 0,
  };
}

function renderInProviders(element: React.ReactElement) {
  return render(<TestProviders>{element}</TestProviders>);
}

describe("availability labels on a tattoo persona", () => {
  it("labels every availability surface of a tattoo persona in books words", () => {
    const { unmount: unmountPill } = renderInProviders(
      <SubprofileAvailability
        kind="tattoo_artist"
        value="booking"
        accent="coral"
      />,
    );
    expect(screen.getByText("Waitlist")).toBeTruthy();
    unmountPill();

    const view = makeOwnerView("tattoo_artist", "booking");
    const { unmount: unmountCard } = renderInProviders(
      <SideCard view={view} footer={null} />,
    );
    expect(screen.getByText("Waitlist")).toBeTruthy();
    unmountCard();

    const { unmount: unmountRow } = renderInProviders(
      <SideRow view={view} footer={null} />,
    );
    expect(screen.getByText("Waitlist")).toBeTruthy();
    unmountRow();

    renderInProviders(
      <SubprofileCard card={makeCard("tattoo_artist", "open_to_collabs")} />,
    );
    expect(screen.getByText("Books open")).toBeTruthy();
  });

  it("reads a stored status over a stale availability", () => {
    const view = makeOwnerView("tattoo_artist", "open_to_collabs", {
      tattoo: { status: "closed" },
    });
    renderInProviders(<SideCard view={view} footer={null} />);
    expect(screen.getByText("Books closed")).toBeTruthy();
    expect(screen.queryByText("Books open")).toBeNull();
  });

  it("keeps every other kind's words", () => {
    const { unmount: unmountPill } = renderInProviders(
      <SubprofileAvailability kind="dj" value="booking" accent="coral" />,
    );
    expect(screen.getByText("Taking bookings")).toBeTruthy();
    unmountPill();

    const view = makeOwnerView("dj", "booking");
    const { unmount: unmountCard } = renderInProviders(
      <SideCard view={view} footer={null} />,
    );
    expect(screen.getByText("Taking bookings")).toBeTruthy();
    unmountCard();

    const { unmount: unmountRow } = renderInProviders(
      <SideRow view={view} footer={null} />,
    );
    expect(screen.getByText("Taking bookings")).toBeTruthy();
    unmountRow();

    renderInProviders(
      <SubprofileCard card={makeCard("dj", "open_to_collabs")} />,
    );
    expect(screen.getByText("Open to collabs")).toBeTruthy();
  });

  it("hides the hero actions pill when asked", () => {
    const view = {
      ...makeOwnerView("tattoo_artist", "booking"),
      viewerEndorsed: false,
      viewerFollowing: false,
      viewerIsMember: false,
    } as unknown as PublicSubprofileView;
    const { unmount } = renderInProviders(
      <SubprofileHeroActions view={view} mode="preview" onAction={() => {}} />,
    );
    expect(screen.getByText("Waitlist")).toBeTruthy();
    unmount();

    renderInProviders(
      <SubprofileHeroActions
        view={view}
        mode="preview"
        onAction={() => {}}
        isAvailabilityHidden
      />,
    );
    expect(screen.queryByText("Waitlist")).toBeNull();
  });
});
