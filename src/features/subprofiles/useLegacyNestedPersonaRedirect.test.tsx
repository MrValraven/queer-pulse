import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigationType } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { PublicSubprofileResult } from "./api/usePublicSubprofile";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import { useLegacyNestedPersonaRedirect } from "./useLegacyNestedPersonaRedirect";

/**
 * F2: the legacy nested `/members/:ownerSlug/:slug` address replaces itself
 * with the persona's `/p/<handle>` address once it loads with a handle.
 * Mirrors the harness style of `useMovedPersonaRedirect.test.tsx`: a
 * `MemoryRouter` around a probe that calls the hook, plus a sibling `Landing`
 * component reporting where the router actually ended up.
 */

function makeView(
  overrides: Partial<PublicSubprofileView> = {},
): PublicSubprofileView {
  return {
    id: "sp-tiago-costa-therapist",
    kind: "therapist",
    slug: "therapist",
    handle: "tiago-costa-therapist",
    displayName: "Tiago Costa",
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

/** Reports where the router actually landed, the navigation type of that
 *  landing (REPLACE vs PUSH, so a redirect that swapped history is told apart
 *  from one that grew it), and the router state carried along. */
function Landing() {
  const location = useLocation();
  const navigationType = useNavigationType();
  return (
    <div>
      <div data-testid="landing">
        {`${location.pathname}${location.search}${location.hash}`}
      </div>
      <div data-testid="landing-navigation-type">{navigationType}</div>
      <div data-testid="landing-state">
        {JSON.stringify(location.state ?? null)}
      </div>
    </div>
  );
}

function Probe({
  isNestedRoute,
  result,
}: {
  isNestedRoute: boolean;
  result: PublicSubprofileResult;
}) {
  const isRedirecting = useLegacyNestedPersonaRedirect(isNestedRoute, result);
  return (
    <div data-testid="probe">{isRedirecting ? "redirecting" : "idle"}</div>
  );
}

function renderProbe(
  entry:
    | string
    | { pathname: string; search?: string; hash?: string; state?: unknown },
  props: { isNestedRoute: boolean; result: PublicSubprofileResult },
) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Probe {...props} />
      <Landing />
    </MemoryRouter>,
  );
}

describe("useLegacyNestedPersonaRedirect", () => {
  it("replaces the nested address with /p/<handle>, keeping the query, hash and router state", async () => {
    renderProbe(
      {
        pathname: "/members/tiago-costa/therapist",
        search: "?tab=work",
        hash: "#poems",
        state: { rehomedFrom: "x" },
      },
      {
        isNestedRoute: true,
        result: {
          state: "ok",
          data: makeView({ handle: "tiago-costa-therapist" }),
        },
      },
    );
    // The hook reports the redirect is in flight synchronously, before the
    // navigation effect has even run: `navigate` can only fire from an
    // effect, so the caller needs the value up front to hold its waiting
    // state and never paint the nested page on the way through.
    expect(screen.getByTestId("probe")).toHaveTextContent("redirecting");

    await waitFor(() =>
      expect(screen.getByTestId("landing")).toHaveTextContent(
        "/p/tiago-costa-therapist?tab=work#poems",
      ),
    );
    expect(screen.getByTestId("landing-navigation-type")).toHaveTextContent(
      "REPLACE",
    );
    expect(screen.getByTestId("landing-state")).toHaveTextContent(
      JSON.stringify({ rehomedFrom: "x" }),
    );
  });

  it("does not navigate for a linked persona with no handle yet (an owner's draft)", () => {
    renderProbe("/members/tiago-costa/therapist", {
      isNestedRoute: true,
      result: { state: "ok", data: makeView({ handle: null }) },
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("idle");
    expect(screen.getByTestId("landing")).toHaveTextContent(
      "/members/tiago-costa/therapist",
    );
  });

  it("does not navigate for a draft persona even once it carries a handle (the owner's typed handle may still belong to someone else)", () => {
    renderProbe("/members/tiago-costa/therapist", {
      isNestedRoute: true,
      result: {
        state: "ok",
        data: makeView({ handle: "tiago-costa-therapist", status: "draft" }),
      },
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("idle");
    expect(screen.getByTestId("landing")).toHaveTextContent(
      "/members/tiago-costa/therapist",
    );
  });

  it("does not navigate on the /p/:handle route itself, so a loaded persona there never loops", () => {
    renderProbe("/p/tiago-costa-therapist", {
      isNestedRoute: false,
      result: {
        state: "ok",
        data: makeView({ handle: "tiago-costa-therapist" }),
      },
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("idle");
    expect(screen.getByTestId("landing")).toHaveTextContent(
      "/p/tiago-costa-therapist",
    );
  });

  const nestedRouteNonOkResults: Array<[string, PublicSubprofileResult]> = [
    ["loading", { state: "loading" }],
    ["moved", { state: "moved", error: new Error("moved") }],
    ["restricted", { state: "restricted", restricted: "private" }],
    ["not-found", { state: "not-found" }],
  ];

  it.each(nestedRouteNonOkResults)(
    "does not navigate on the nested route while the result is %s",
    (_label, result) => {
      renderProbe("/members/tiago-costa/therapist", {
        isNestedRoute: true,
        result,
      });
      expect(screen.getByTestId("probe")).toHaveTextContent("idle");
      expect(screen.getByTestId("landing")).toHaveTextContent(
        "/members/tiago-costa/therapist",
      );
    },
  );
});
