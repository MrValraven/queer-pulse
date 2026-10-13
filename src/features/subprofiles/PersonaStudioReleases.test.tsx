import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileSections } from "./SubprofileSections";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

let isGranted = true;
const demoStudioArtistSpy = vi.fn();

vi.mock("../studio/api/useStudioAccess", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../studio/api/useStudioAccess")>();
  return {
    ...original,
    useStudioAccess: () =>
      isGranted
        ? original.useStudioAccess()
        : {
            status: "denied",
            hasAccess: false,
            isPending: false,
            uploadablePersonas: [],
          },
  };
});
vi.mock("../studio/api/studioDemoApi", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../studio/api/studioDemoApi")>();
  return {
    ...original,
    demoStudioArtist: (subprofileId: string) => {
      demoStudioArtistSpy(subprofileId);
      return original.demoStudioArtist(subprofileId);
    },
  };
});

beforeEach(() => {
  isGranted = true;
  demoStudioArtistSpy.mockClear();
});

function personaOf(
  overrides: Partial<PublicSubprofileView>,
): PublicSubprofileView {
  return {
    id: "sp-diogo-nightform",
    kind: "musician",
    slug: "nightform",
    handle: "nightform",
    displayName: "NIGHTFORM",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "linked",
    visibility: "open",
    status: "published",
    sections: [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: null,
    ...overrides,
  };
}

describe("Studio releases on a persona page (demo)", () => {
  it("adds a Discography section with the musician's Studio releases", async () => {
    render(
      <TestProviders>
        <SubprofileSections
          persona={personaOf({})}
          skin="studio"
          mode="public"
          featuredId={null}
        />
      </TestProviders>,
    );
    const section = await screen.findByRole("region", { name: /discography/i });
    expect(
      within(section).getByRole("link", { name: /pedro on the 25/i }),
    ).toHaveAttribute("href", "/studio/album?id=demo-release-home-4");
  });

  it("files a DJ's releases under Mixes", async () => {
    render(
      <TestProviders>
        <SubprofileSections
          persona={personaOf({ id: "sp-jordan-lechatdashinko", kind: "dj" })}
          skin="studio"
          mode="public"
          featuredId={null}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("region", { name: /mixes/i }),
    ).toBeInTheDocument();
  });

  it("shows the published releases in the editor preview, as cards that do not navigate", async () => {
    render(
      <TestProviders>
        <SubprofileSections
          persona={personaOf({})}
          skin="studio"
          mode="preview"
          featuredId={null}
        />
      </TestProviders>,
    );
    const section = await screen.findByRole("region", { name: /discography/i });
    expect(within(section).getByText(/pedro on the 25/i)).toBeInTheDocument();
    expect(
      within(section).queryByRole("link", { name: /pedro on the 25/i }),
    ).not.toBeInTheDocument();
    expect(section).toHaveAttribute(
      "data-preview-anchor",
      "section:discography",
    );
  });

  it("makes no Studio request and shows no block for a viewer without a grant", async () => {
    isGranted = false;
    render(
      <TestProviders>
        <SubprofileSections
          persona={personaOf({})}
          skin="studio"
          mode="public"
          featuredId={null}
        />
      </TestProviders>,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(demoStudioArtistSpy).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("region", { name: /discography/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: /studio releases/i }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing and no error when the persona's artist read answers 404", async () => {
    render(
      <TestProviders>
        <SubprofileSections
          persona={personaOf({ id: "sp-no-studio-page" })}
          skin="studio"
          mode="public"
          featuredId={null}
        />
      </TestProviders>,
    );
    await vi.waitFor(() =>
      expect(demoStudioArtistSpy).toHaveBeenCalledWith("sp-no-studio-page"),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(
      screen.queryByRole("region", { name: /discography/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("lists the persona's public playlists in the Studio block", async () => {
    render(
      <TestProviders>
        <SubprofileSections
          persona={personaOf({})}
          skin="studio"
          mode="public"
          featuredId={null}
        />
      </TestProviders>,
    );
    const list = await screen.findByRole("list", { name: /studio playlists/i });
    expect(
      within(list).getByRole("link", { name: /trans composers vol\. iv/i }),
    ).toHaveAttribute(
      "href",
      "/studio/collection?id=demo-playlist-trans-composers",
    );
  });

  it("never shows a draft in the preview", async () => {
    render(
      <TestProviders>
        <SubprofileSections
          persona={personaOf({
            id: "demo-persona-mariana-sol",
            handle: "",
            slug: "mariana-sol",
          })}
          skin="studio"
          mode="preview"
          featuredId={null}
        />
      </TestProviders>,
    );
    await screen.findByRole("region", { name: /discography/i });
    expect(screen.queryByText("Cartas ao mar")).not.toBeInTheDocument();
  });
});
