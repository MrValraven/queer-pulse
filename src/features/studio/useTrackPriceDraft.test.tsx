import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  DEMO_DEFAULT_RELEASE_ID,
  DEMO_DEFAULT_TRACK_ID,
} from "./api/studioDemoMe.data";
import { resetDemoPurchases } from "./api/studioDemoPurchases";
import { useTrackPriceDraft } from "./useTrackPriceDraft";

/** The demo owner release carries track 06 priced fixed at €1.50. */
async function renderDraft() {
  const rendered = renderHook(
    () =>
      useTrackPriceDraft({
        releaseId: DEMO_DEFAULT_RELEASE_ID,
        trackId: DEMO_DEFAULT_TRACK_ID,
        releaseType: "album",
      }),
    { wrapper: TestProviders },
  );
  await waitFor(() => expect(rendered.result.current.priceMode).toBe("fixed"));
  return rendered;
}

beforeEach(() => resetDemoPurchases());

describe("useTrackPriceDraft", () => {
  it("reads the stored price and saves nothing while it is unchanged", async () => {
    const { result } = await renderDraft();
    expect([result.current.priceMode, result.current.priceText]).toEqual([
      "fixed",
      "1.50",
    ]);
    expect(result.current.saveFields()).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it("takes the track off sale with a null price", async () => {
    const { result } = await renderDraft();
    act(() => result.current.setPriceMode("not_for_sale"));
    expect(result.current.saveFields()).toEqual({ price: null });
    expect(result.current.isDirty).toBe(true);
  });

  it("sends a changed price in cents", async () => {
    const { result } = await renderDraft();
    act(() => result.current.setPriceText("2"));
    expect(result.current.saveFields()).toEqual({
      price: { mode: "fixed", amountCents: 200 },
    });
  });

  it("holds the save and names the reason for a fixed price under €1", async () => {
    const { result } = await renderDraft();
    act(() => result.current.setPriceText("0.10"));
    let isAllowed = true;
    act(() => {
      isAllowed = result.current.check();
    });
    expect(isAllowed).toBe(false);
    expect(result.current.errorKey).toBe(
      "studio:errors.reason.studio_price_out_of_range",
    );
  });

  it("stays quiet about an error until a save was tried", async () => {
    const { result } = await renderDraft();
    act(() => result.current.setPriceText("0.10"));
    expect(result.current.errorKey).toBeNull();
  });

  it("is hidden for a release type that cannot sell", () => {
    const { result } = renderHook(
      () =>
        useTrackPriceDraft({
          releaseId: DEMO_DEFAULT_RELEASE_ID,
          trackId: DEMO_DEFAULT_TRACK_ID,
          releaseType: "mix",
        }),
      { wrapper: TestProviders },
    );
    expect(result.current.isShown).toBe(false);
    expect(result.current.check()).toBe(true);
    expect(result.current.saveFields()).toEqual({});
  });
});
