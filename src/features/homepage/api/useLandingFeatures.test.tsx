import { renderHook, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
import { spotlights } from "../sections/Discovery.data";
import { spotlightCommunities } from "../sections/Communities.data";
import { changemakers } from "../data/changemakers";
// Statically imported so it shares this file's module graph (and therefore
// its `DemoModeContext` instance) with `TestProviders`, also a static
// import — see useAdminMembers.live.test.tsx, which this mirrors. Only the
// live-mode suite below needs a fresh, dynamically re-imported instance.
import { useLandingFeaturesPublic } from "./useLandingFeatures";

/**
 * Demo-mode suite: proves `useLandingFeaturesPublic` adapts the existing rich
 * static homepage fixtures (Discovery spotlights, Communities spotlights,
 * changemakers) to the public landing DTO shape without ever touching the
 * network — the whole point of keeping demo's showcase rich while live mode
 * stays honest. Live-mode suite proves the demo→live branch actually hits
 * `GET /landing/features` and returns the response as-is.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useLandingFeaturesPublic: useLandingFeaturesPublicLive } =
    await import("./useLandingFeatures");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported
  // provider would hold a different I18nContext instance than the freshly
  // imported hook resolves against.
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>{children}</DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useLandingFeaturesPublic: useLandingFeaturesPublicLive, wrapper };
}

describe("useLandingFeaturesPublic (demo mode)", () => {
  it("returns the static homepage fixtures adapted to the public DTO shape, with no network request", async () => {
    // No handler is registered for GET /landing/features — `onUnhandledRequest:
    // "error"` above means any real request at all fails the test, so a
    // passing result proves demo mode never touched the network.
    const { result } = renderHook(() => useLandingFeaturesPublic(), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.members).toHaveLength(spotlights.length);
    expect(result.current.members[0]!.name).toBe(spotlights[0]!.member.name);
    expect(result.current.members[0]!.quote).toBe(spotlights[0]!.quote);
    expect(result.current.members[0]!.slug).toBe(spotlights[0]!.member.key);

    expect(result.current.communities).toHaveLength(
      spotlightCommunities.length,
    );
    expect(result.current.communities[0]!.name).toBe(
      spotlightCommunities[0]!.name,
    );
    expect(result.current.communities[0]!.memberCount).toBe(
      spotlightCommunities[0]!.members,
    );

    expect(result.current.changemakers).toHaveLength(changemakers.length);
    expect(result.current.changemakers[0]!.name).toBe(changemakers[0]!.name);
    expect(result.current.changemakers[0]!.tags).toEqual(changemakers[0]!.tags);
  });
});

describe("useLandingFeaturesPublic (live mode via MSW)", () => {
  it("fetches GET /landing/features and returns the response as-is", async () => {
    server.use(
      http.get(`${API_V1}/landing/features`, () =>
        HttpResponse.json({
          members: [
            {
              id: "feat-1",
              slug: "marco-vieira",
              name: "Marco Vieira",
              tagline: "Photographer",
              avatarUrl: null,
              quote: "Bring me your half-finished demos.",
            },
          ],
          communities: [
            {
              id: "feat-2",
              slug: "trans-hub",
              name: "Trans & Non-Binary Hub",
              memberCount: 312,
              blurb: "Docs, HRT, plain warmth.",
            },
          ],
          changemakers: [
            {
              id: "feat-3",
              slug: "catarina-vaz",
              name: "Catarina Vaz",
              cause: "Housing Rights",
              blurb: "Organising queer residents facing displacement.",
              tags: ["Housing", "Organising"],
            },
          ],
        }),
      ),
    );

    const { useLandingFeaturesPublic: useLandingFeaturesPublicLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useLandingFeaturesPublicLive(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.members).toHaveLength(1);
    expect(result.current.members[0]!.name).toBe("Marco Vieira");
    expect(result.current.communities[0]!.memberCount).toBe(312);
    expect(result.current.changemakers[0]!.tags).toEqual([
      "Housing",
      "Organising",
    ]);
  });

  it("returns empty arrays when nothing has been curated yet", async () => {
    server.use(
      http.get(`${API_V1}/landing/features`, () =>
        HttpResponse.json({ members: [], communities: [], changemakers: [] }),
      ),
    );

    const { useLandingFeaturesPublic: useLandingFeaturesPublicLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useLandingFeaturesPublicLive(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.members).toEqual([]);
    expect(result.current.communities).toEqual([]);
    expect(result.current.changemakers).toEqual([]);
  });
});
