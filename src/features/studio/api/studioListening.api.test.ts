import { describe, expect, it, vi } from "vitest";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import {
  deleteStudioListening,
  deleteStudioSupporter,
  getStudioListeningRecent,
  getStudioListeningSummary,
  getStudioListeningSupporting,
  getStudioSupporterState,
  postStudioPlay,
  putStudioSupporter,
} from "./studioListening.api";

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/client")>()),
  apiGet: vi.fn(() => Promise.resolve({})),
  apiPost: vi.fn(() => Promise.resolve({})),
  apiPut: vi.fn(() => Promise.resolve({})),
  apiDelete: vi.fn(() => Promise.resolve({})),
}));

describe("Studio listening raw calls", () => {
  it("counts a play with the track id alone", async () => {
    await postStudioPlay("t 1");
    expect(apiPost).toHaveBeenLastCalledWith("/studio/plays", {
      trackId: "t 1",
    });
  });

  it("reads the summary for a range and pages the history", async () => {
    await getStudioListeningSummary("6m");
    expect(apiGet).toHaveBeenLastCalledWith("/me/studio-listening?range=6m");
    await getStudioListeningRecent("c/2");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/me/studio-listening/recent?cursor=c%2F2",
    );
    await getStudioListeningRecent(null);
    expect(apiGet).toHaveBeenLastCalledWith("/me/studio-listening/recent");
  });

  it("clears the history and reads the artists the member supports", async () => {
    await deleteStudioListening();
    expect(apiDelete).toHaveBeenLastCalledWith("/me/studio-listening");
    await getStudioListeningSupporting();
    expect(apiGet).toHaveBeenLastCalledWith("/me/studio-listening/supporting");
  });

  it("reads, saves and removes the supporter opt-in, sending null for the account", async () => {
    await getStudioSupporterState("p 1");
    expect(apiGet).toHaveBeenLastCalledWith("/studio/artists/p%201/supporter");
    await putStudioSupporter("p1", { shownAsSubprofileId: null });
    expect(apiPut).toHaveBeenLastCalledWith("/studio/artists/p1/supporter", {
      shownAsSubprofileId: null,
    });
    await deleteStudioSupporter("p1");
    expect(apiDelete).toHaveBeenLastCalledWith("/studio/artists/p1/supporter");
  });
});
