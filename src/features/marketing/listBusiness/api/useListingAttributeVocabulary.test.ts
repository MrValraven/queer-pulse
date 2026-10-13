import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCAL_ATTRIBUTE_VOCABULARY } from "../listingAttributes.data";
import {
  LISTING_ATTRIBUTE_VOCABULARY_QUERY_KEY,
  useListingAttributeVocabulary,
} from "./useListingAttributeVocabulary";

interface HookState {
  demoMode: boolean;
}
const state = vi.hoisted((): HookState => ({ demoMode: true }));
const getListingAttributeVocabulary = vi.hoisted(() => vi.fn());

vi.mock("../../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: state.demoMode }),
}));
vi.mock("./listings.api", () => ({ getListingAttributeVocabulary }));

afterEach(() => {
  state.demoMode = true;
  getListingAttributeVocabulary.mockReset();
});

function renderVocabulary() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  const rendered = renderHook(() => useListingAttributeVocabulary(), {
    wrapper,
  });
  return { ...rendered, queryClient };
}

function queryStatusOf(queryClient: QueryClient) {
  return queryClient.getQueryState([...LISTING_ATTRIBUTE_VOCABULARY_QUERY_KEY])
    ?.status;
}

describe("useListingAttributeVocabulary", () => {
  it("answers demo with the local copy and never calls the network", () => {
    const { result } = renderVocabulary();
    expect(result.current).toBe(LOCAL_ATTRIBUTE_VOCABULARY);
    expect(getListingAttributeVocabulary).not.toHaveBeenCalled();
  });

  it("uses the server's groups once they load", async () => {
    state.demoMode = false;
    getListingAttributeVocabulary.mockResolvedValue({
      groups: [
        {
          id: "around",
          kinds: ["place"],
          categories: null,
          attributes: ["terrace"],
        },
      ],
      premisesOnly: [],
      sensitive: [],
      inclusionPractices: [],
      languages: ["pt"],
      commonLanguages: ["pt"],
    });
    const { result } = renderVocabulary();
    expect(result.current).toBe(LOCAL_ATTRIBUTE_VOCABULARY);
    await waitFor(() =>
      expect(result.current.groups.map((group) => group.id)).toEqual([
        "around",
      ]),
    );
  });

  it("keeps the local copy after a malformed read", async () => {
    state.demoMode = false;
    getListingAttributeVocabulary.mockResolvedValue({ groups: "nope" });
    const { result, queryClient } = renderVocabulary();
    await waitFor(() => expect(queryStatusOf(queryClient)).toBe("success"));
    expect(getListingAttributeVocabulary).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(LOCAL_ATTRIBUTE_VOCABULARY);
  });

  it("keeps the local copy after a failed read", async () => {
    state.demoMode = false;
    getListingAttributeVocabulary.mockRejectedValue(new Error("offline"));
    const { result, queryClient } = renderVocabulary();
    await waitFor(() => expect(queryStatusOf(queryClient)).toBe("error"));
    expect(result.current).toBe(LOCAL_ATTRIBUTE_VOCABULARY);
  });

  it("reads under the listings key, outside the directory prefix", async () => {
    state.demoMode = false;
    getListingAttributeVocabulary.mockResolvedValue({ groups: [] });
    const { queryClient } = renderVocabulary();
    await waitFor(() => expect(queryStatusOf(queryClient)).toBe("success"));
    expect(LISTING_ATTRIBUTE_VOCABULARY_QUERY_KEY).toEqual([
      "listings",
      "attributes",
    ]);
    expect(
      queryClient.getQueryCache().findAll({ queryKey: ["directory"] }),
    ).toHaveLength(0);
  });
});
