import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mentionRefsInMarkdownAll } from "../../../../shared/mentions/mentionRefs";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  SubprofileKind,
  SubprofilePublicDTO,
} from "../../../subprofiles/api/subprofiles.api";
import { SamplePersonaPage } from "./persona/SamplePersonaPage";
import { toSamplePersonaView } from "./persona/samplePersonaView";
import { sampleIsoDate } from "./sampleDates";

const GIG_TITLE = "Midnight Revue at Casa Sample";

function sampleDto(kind: SubprofileKind): SubprofilePublicDTO {
  return {
    id: `sample-${kind}`,
    kind,
    slug: `sample-${kind}`,
    handle: null,
    displayName: "Velvet Sample",
    avatarUrl: null,
    tagline: "Lip sync and late nights",
    bio: "A sample performer for this test.",
    coverUrl: null,
    accent: "coral",
    availability: null,
    ctaLabel: null,
    ctaUrl: null,
    socialLinks: [],
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    items: [
      {
        id: "gig-1",
        section: "shows",
        title: GIG_TITLE,
        createdAt: "2026-01-01T00:00:00.000Z",
        date: sampleIsoDate(new Date(), 10),
        venue: "Casa Sample",
        tags: [],
        isFeatured: false,
        collaborators: [],
      },
    ],
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: {
      booker: { fee: "From 300", rider: "", press: "", contact: "" },
    },
  };
}

const MENTION_BIO =
  "Booked by @someone, regular at **@another** and c/late-club";
const WORD_JOINER = String.fromCharCode(0x2060);

/** Every query key that starts fetching on `queryClient`, and every URL the
 *  page hands to `fetch`, from the moment this is called. */
function recordRequests(queryClient: QueryClient) {
  const fetchedQueryKeys: string[] = [];
  queryClient.getQueryCache().subscribe((event) => {
    if (event.query.state.fetchStatus === "fetching") {
      fetchedQueryKeys.push(JSON.stringify(event.query.queryKey));
    }
  });
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  const fetchedUrls = () =>
    fetchSpy.mock.calls.map(([input]) =>
      input instanceof Request ? input.url : String(input),
    );
  return { fetchedQueryKeys, fetchedUrls };
}

function testQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("SamplePersonaPage", () => {
  it("renders a stage persona with marquee and booker", async () => {
    const { container } = render(
      <TestProviders>
        <SamplePersonaPage dto={sampleDto("drag")} />
      </TestProviders>,
    );
    expect(
      container.querySelector('.pp[data-skin="stage"][data-kind="drag"]'),
    ).not.toBeNull();
    expect((await screen.findAllByText(GIG_TITLE)).length).toBeGreaterThan(0);
    expect(container.querySelector(".nextup")?.textContent).toContain(
      GIG_TITLE,
    );
    expect(container.querySelector(".booker")).not.toBeNull();
  });

  it("renders nothing for a therapist", () => {
    render(
      <TestProviders>
        <div data-testid="persona-host">
          <SamplePersonaPage dto={sampleDto("therapist")} />
        </div>
      </TestProviders>,
    );
    expect(screen.getByTestId("persona-host")).toBeEmptyDOMElement();
  });

  it("a tattoo persona with endorsements starts no endorser request", async () => {
    const queryClient = testQueryClient();
    const requests = recordRequests(queryClient);
    const { container } = render(
      <TestProviders queryClient={queryClient}>
        <SamplePersonaPage
          dto={{ ...sampleDto("tattoo_artist"), endorsementCount: 3 }}
        />
      </TestProviders>,
    );
    await waitFor(() =>
      expect(
        container.querySelector('.pp[data-kind="tattoo_artist"]'),
      ).not.toBeNull(),
    );
    expect(
      requests.fetchedQueryKeys.filter((key) => key.includes("endorsers")),
    ).toEqual([]);
    expect(
      requests.fetchedUrls().filter((url) => url.includes("/endorsers")),
    ).toEqual([]);
  });

  it("a member reading a bio with mentions starts no mention lookup", async () => {
    const queryClient = testQueryClient();
    const requests = recordRequests(queryClient);
    const dto = { ...sampleDto("drag"), bio: MENTION_BIO, tagline: "@someone" };
    const { container } = render(
      <TestProviders queryClient={queryClient}>
        <SamplePersonaPage dto={dto} />
      </TestProviders>,
    );
    await screen.findAllByText(GIG_TITLE);
    // The hero's lookup is enabled only when the text holds a mention ref,
    // so no ref means no request in either mode.
    const view = toSamplePersonaView(dto);
    expect(mentionRefsInMarkdownAll([view.bio, view.tagline])).toEqual([]);
    expect(view.bio.split(WORD_JOINER).join("")).toBe(MENTION_BIO);
    expect(
      container.querySelector(".pp")?.textContent?.split(WORD_JOINER).join(""),
    ).toContain("@someone");
    expect(
      requests.fetchedQueryKeys.filter((key) => key.includes("mention-names")),
    ).toEqual([]);
    expect(
      requests.fetchedUrls().filter((url) => url.includes("/mentions/names")),
    ).toEqual([]);
  });

  it("pins the endorsement count to 0 whatever the sample says", () => {
    const view = toSamplePersonaView({
      ...sampleDto("tattoo_artist"),
      endorsementCount: 3,
    });
    expect(view.endorsementCount).toBe(0);
  });
});
