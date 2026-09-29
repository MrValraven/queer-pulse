import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  mockSubprofileById,
  resetDemoEditVersionsForTests,
} from "../data/subprofiles.data";
import { useAffiliations } from "./useAffiliations";
import { useSubprofileMutations } from "./useSubprofileMutations";
import type { SubprofileView } from "./subprofiles.adapters";

/**
 * ENG-451 in demo mode: every persona-content write answers with the next
 * `editVersion`, and the owner view the next read returns carries it too, so
 * the editor's save chain (which sends each answer back as the next
 * `expectedEditVersion`) never meets a false conflict in demo.
 */

const PERSONA_ID = "sp-rui-dev";

function renderWrites() {
  return renderHook(
    () => ({
      mutations: useSubprofileMutations(),
      affiliations: useAffiliations(PERSONA_ID),
    }),
    { wrapper: TestProviders },
  );
}

beforeEach(() => {
  resetDemoEditVersionsForTests();
});

describe("demo persona writes raise editVersion (ENG-451)", () => {
  it("answers the PATCH and the three PUTs with increasing versions, and the owner read follows", async () => {
    const { result } = renderWrites();
    expect(mockSubprofileById(PERSONA_ID)?.editVersion).toBe(0);

    const answeredVersions: Array<number | undefined> = [];
    await act(async () => {
      const { mutations, affiliations } = result.current;
      const patched = await mutations.update.mutateAsync({
        id: PERSONA_ID,
        dto: { tagline: "Backend person", expectedEditVersion: 0 },
      });
      answeredVersions.push(patched.editVersion);
      const section = await mutations.replaceSection.mutateAsync({
        id: PERSONA_ID,
        section: "projects",
        items: [{ title: "A tool" }],
        expectedEditVersion: 1,
      });
      answeredVersions.push(section.editVersion);
      const socials = await mutations.replaceSocials.mutateAsync({
        id: PERSONA_ID,
        items: [{ platform: "github", urlOrHandle: "rui" }],
        expectedEditVersion: 2,
      });
      answeredVersions.push(socials.editVersion);
      const linked = await affiliations.replace.mutateAsync({
        items: [],
        expectedEditVersion: 3,
      });
      answeredVersions.push(linked.editVersion);
    });

    expect(answeredVersions).toEqual([1, 2, 3, 4]);
    expect(mockSubprofileById(PERSONA_ID)?.editVersion).toBe(4);
  });

  it("keeps the request-only precondition off the saved persona", async () => {
    const { result } = renderWrites();

    let saved: Record<string, unknown> = {};
    await act(async () => {
      saved = {
        ...(await result.current.mutations.update.mutateAsync({
          id: PERSONA_ID,
          dto: { tagline: "Backend person", expectedEditVersion: 0 },
        })),
      };
    });

    expect(saved.tagline).toBe("Backend person");
    expect(saved).not.toHaveProperty("expectedEditVersion");
  });
});

/**
 * I2: a section, socials or affiliations write only invalidated the owner
 * query, so a copy flow's editor could mount from a stale cached view (seeded
 * once, before this write's invalidation refetch lands) and conflict on its
 * own first save. Each write now seeds the owner-editor query with its own
 * response, the same way `update`'s onSuccess already does.
 */
describe("section, socials and affiliations writes seed the owner query (I2)", () => {
  const OWNER_QUERY_KEY = ["subprofile", true, PERSONA_ID];

  function renderWritesWithClient(queryClient: QueryClient) {
    return renderHook(
      () => ({
        mutations: useSubprofileMutations(),
        affiliations: useAffiliations(PERSONA_ID),
      }),
      {
        wrapper: ({ children }) => (
          <TestProviders queryClient={queryClient}>{children}</TestProviders>
        ),
      },
    );
  }

  function cachedEditVersion(queryClient: QueryClient): number | undefined {
    return queryClient.getQueryData<SubprofileView>(OWNER_QUERY_KEY)
      ?.editVersion;
  }

  it("holds a section save's editVersion in the owner query right after it resolves", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderWritesWithClient(queryClient);

    let section: { editVersion?: number } = {};
    await act(async () => {
      section = await result.current.mutations.replaceSection.mutateAsync({
        id: PERSONA_ID,
        section: "projects",
        items: [{ title: "A tool" }],
        expectedEditVersion: 0,
      });
    });

    expect(section.editVersion).toBe(1);
    expect(cachedEditVersion(queryClient)).toBe(1);
  });

  it("holds a socials save's editVersion in the owner query right after it resolves", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderWritesWithClient(queryClient);

    let socials: { editVersion?: number } = {};
    await act(async () => {
      socials = await result.current.mutations.replaceSocials.mutateAsync({
        id: PERSONA_ID,
        items: [{ platform: "github", urlOrHandle: "rui" }],
        expectedEditVersion: 0,
      });
    });

    expect(socials.editVersion).toBe(1);
    expect(cachedEditVersion(queryClient)).toBe(1);
  });

  it("holds an affiliations save's editVersion in the owner query right after it resolves", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderWritesWithClient(queryClient);

    let linked: { editVersion?: number } = {};
    await act(async () => {
      linked = await result.current.affiliations.replace.mutateAsync({
        items: [],
        expectedEditVersion: 0,
      });
    });

    expect(linked.editVersion).toBe(1);
    expect(cachedEditVersion(queryClient)).toBe(1);
  });
});
