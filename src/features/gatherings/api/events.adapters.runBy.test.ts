import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import { gatheringDetails } from "../data";
import { useGatheringForm } from "../useGatheringForm";
import type { EventCardDTO, EventDetailDTO } from "./events.api";
import {
  cardToCalendarEvent,
  detailToGathering,
  formToCreateEventDto,
} from "./events.adapters";

const t: TFunction = (key) => key;
const runByListing = {
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
};

describe("formToCreateEventDto run by", () => {
  it("sends no key when the host picked no business", () => {
    const { result } = renderHook(() => useGatheringForm());
    const dto = formToCreateEventDto(result.current);
    expect("runByListingId" in dto).toBe(false);
  });

  it("sends the picked listing id", () => {
    const { result } = renderHook(() => useGatheringForm());
    act(() => result.current.setRunByListingId("listing-uuid-1"));
    expect(formToCreateEventDto(result.current).runByListingId).toBe(
      "listing-uuid-1",
    );
  });

  it("restores the pick from a saved draft", () => {
    const { result } = renderHook(() => useGatheringForm());
    act(() =>
      result.current.restoreDraft({
        ...result.current.draftSnapshot,
        runByListingId: "listing-uuid-1",
      }),
    );
    expect(result.current.runByListingId).toBe("listing-uuid-1");
    expect(result.current.draftSnapshot.runByListingId).toBe("listing-uuid-1");
  });

  it("reads a draft saved before the field as no pick", () => {
    const { result } = renderHook(() => useGatheringForm());
    const { runByListingId: _runByListingId, ...olderSnapshot } =
      result.current.draftSnapshot;
    act(() => result.current.restoreDraft(olderSnapshot));
    expect(result.current.runByListingId).toBeNull();
  });
});

describe("reading runByListing", () => {
  const card = {
    slug: "queer-history-walk",
    title: "Queer history walk",
    startAt: "2026-10-17T10:00:00",
    runByListing,
  } as EventCardDTO;

  it("puts the business name on the card", () => {
    expect(cardToCalendarEvent(card, t).runByName).toBe(
      "Lisboa Arco-Íris Walks",
    );
    expect(
      cardToCalendarEvent({ ...card, runByListing: null }, t).runByName,
    ).toBeUndefined();
  });

  it("carries the link onto the detail view model", () => {
    const detail = { ...card, description: "" } as EventDetailDTO;
    expect(detailToGathering(detail, t).runByListing).toEqual(runByListing);
    expect(
      detailToGathering({ ...detail, runByListing: undefined }, t).runByListing,
    ).toBeNull();
  });
});

describe("the demo gathering run by the walking tour", () => {
  it("exists and names the tour", () => {
    expect(gatheringDetails["queer-history-walk"]?.runByListing?.slug).toBe(
      "lisboa-arco-iris-walks",
    );
  });
});
