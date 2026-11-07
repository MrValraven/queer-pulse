import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  resetDemoEditVersionsForTests,
  resetDemoKindChangesForTests,
} from "../data/subprofiles.data";
import { useChangeSubprofileKind } from "./useSubprofileMutations";
import { subprofileQueryKey } from "./useSubprofile";
import type { SubprofileView } from "./subprofiles.adapters";

/**
 * The persona type change in demo mode: it writes the mock registry, resolves
 * with the saved view, seeds the owner query only once `applyKindChange` runs,
 * and refuses the same type or another group with the reasons the server
 * names. Rui's persona is a developer, in the Workshop group.
 */

const PERSONA_ID = "sp-rui-dev";

let queryClient: QueryClient;

function renderChangeKind() {
  return renderHook(() => useChangeSubprofileKind(PERSONA_ID), {
    wrapper: (props) => <TestProviders queryClient={queryClient} {...props} />,
  });
}

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});
afterEach(resetDemoKindChangesForTests);
afterEach(resetDemoEditVersionsForTests);

describe("useChangeSubprofileKind (demo mode)", () => {
  it("resolves with the saved view and leaves the owner cache alone", async () => {
    const { result } = renderChangeKind();
    const saved = await act(() => result.current.mutateAsync("ceramicist"));
    expect(saved.kind).toBe("ceramicist");
    expect(
      queryClient.getQueryData(subprofileQueryKey(true, PERSONA_ID)),
    ).toBeUndefined();
  });

  it("seeds the owner cache when applyKindChange runs", async () => {
    const { result } = renderChangeKind();
    const saved = await act(() => result.current.mutateAsync("ceramicist"));
    act(() => result.current.applyKindChange(saved));
    expect(
      queryClient.getQueryData<SubprofileView>(
        subprofileQueryKey(true, PERSONA_ID),
      )?.kind,
    ).toBe("ceramicist");
  });

  it("refuses the same type with reason unchanged", async () => {
    const { result } = renderChangeKind();
    await expect(result.current.mutateAsync("developer")).rejects.toMatchObject(
      { reason: "unchanged" },
    );
  });

  it("refuses another group with both groups named", async () => {
    const { result } = renderChangeKind();
    await expect(result.current.mutateAsync("dj")).rejects.toMatchObject({
      details: {
        reason: "other_family",
        currentFamily: "workshop",
        requestedFamily: "stage",
      },
    });
  });

  it("lets a generic persona leave for any group", async () => {
    const { result } = renderChangeKind();
    // developer to generic stays in the Workshop group
    const genericPersona = await act(() =>
      result.current.mutateAsync("generic"),
    );
    expect(genericPersona.kind).toBe("generic");
    const djPersona = await act(() => result.current.mutateAsync("dj"));
    expect(djPersona).toMatchObject({ kind: "dj" });
  });
});
