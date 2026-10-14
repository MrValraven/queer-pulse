import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { resetDemoCreditLedger } from "./studioDemoCreditLedger";
import { useStudioAppearsOn } from "./useStudioAppearsOn";
import { useStudioBrowseReleases } from "./useStudioBrowseReleases";
import { useStudioCreditCandidate } from "./useStudioCreditCandidate";
import { useStudioCreditInbox } from "./useStudioCreditInbox";
import { useStudioCreditPendingCount } from "./useStudioCreditPendingCount";
import { useStudioCuration } from "./useStudioCuration";
import { useStudioMoods } from "./useStudioMoods";
import { useStudioRelatedArtists } from "./useStudioRelatedArtists";
import { useStudioScene } from "./useStudioScene";
import { useStudioSceneReleases } from "./useStudioSceneReleases";
import { useStudioScenes } from "./useStudioScenes";
import { useStudioTrackPersonaCredits } from "./useStudioTrackPersonaCredits";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

beforeEach(() => resetDemoCreditLedger());

describe("discovery read hooks (demo)", () => {
  it("lists the moods that have releases", async () => {
    const { result } = renderHook(() => useStudioMoods(), { wrapper });
    await waitFor(() => expect(result.current.moods).toContain("tender"));
    expect(result.current.moods[0]).toBe("late-night");
  });

  it("browses by mood alone", async () => {
    const { result } = renderHook(
      () => useStudioBrowseReleases(null, "tender"),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.releases.map((release) => release.id)).toEqual([
        "demo-release-home-1",
        "demo-release-mariana-2",
      ]),
    );
  });

  it("reads the curation with the featured note", async () => {
    const { result } = renderHook(() => useStudioCuration(), { wrapper });
    await waitFor(() =>
      expect(result.current.curation?.featured?.title).toBe(
        "Cidade dos santos",
      ),
    );
    expect(result.current.curation?.staffPicks).toHaveLength(3);
  });

  it("lists the active scenes and answers an archived one as not found", async () => {
    const list = renderHook(() => useStudioScenes(), { wrapper });
    await waitFor(() => expect(list.result.current.scenes).toHaveLength(2));
    const archived = renderHook(() => useStudioScene("sintra-choirs"), {
      wrapper,
    });
    await waitFor(() =>
      expect(archived.result.current.loadState.isNotFound).toBe(true),
    );
  });

  it("answers a link with no slug as not found", () => {
    const { result } = renderHook(() => useStudioScene(null), { wrapper });
    expect(result.current.loadState.isNotFound).toBe(true);
  });

  it("pages a scene's releases", async () => {
    const { result } = renderHook(
      () => useStudioSceneReleases("mouraria-fado"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.releases).toHaveLength(3));
  });

  it("finds a persona by exact handle and answers an unknown one as not found", async () => {
    const found = renderHook(() => useStudioCreditCandidate("nightform"), {
      wrapper,
    });
    await waitFor(() =>
      expect(found.result.current.candidate?.href).toBe(
        "/studio/artist?id=sp-diogo-nightform",
      ),
    );
    const missing = renderHook(() => useStudioCreditCandidate("nobody"), {
      wrapper,
    });
    await waitFor(() =>
      expect(missing.result.current.loadState.isNotFound).toBe(true),
    );
  });

  it("reads the owner's credit rows, the inbox and the pending count", async () => {
    const rows = renderHook(
      () => useStudioTrackPersonaCredits("demo-track-cidade-dos-santos-06"),
      { wrapper },
    );
    await waitFor(() => expect(rows.result.current.rows).toHaveLength(4));
    const inbox = renderHook(() => useStudioCreditInbox(), { wrapper });
    await waitFor(() =>
      expect(inbox.result.current.inbox?.requests).toHaveLength(2),
    );
    const count = renderHook(() => useStudioCreditPendingCount(), {
      wrapper,
    });
    await waitFor(() => expect(count.result.current.count).toBe(2));
  });

  it("reads Appears on and related artists for an artist", async () => {
    const appearsOn = renderHook(
      () => useStudioAppearsOn("demo-persona-mariana-sol"),
      { wrapper },
    );
    await waitFor(() =>
      expect(appearsOn.result.current.cards.map((card) => card.id)).toEqual([
        "demo-release-home-4",
      ]),
    );
    const related = renderHook(
      () => useStudioRelatedArtists("sp-diogo-nightform"),
      { wrapper },
    );
    await waitFor(() =>
      expect(related.result.current.artists[0]?.name).toBe("Mariana Sol"),
    );
  });
});
