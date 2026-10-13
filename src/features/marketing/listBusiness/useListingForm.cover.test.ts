import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useListingForm } from "./useListingForm";

describe("useListingForm cover photo", () => {
  it("clears the cover's refused mark when the cover changes, and only that mark", () => {
    const { result } = renderHook(() => useListingForm());
    act(() => result.current.setRejectedPhotoSlots(["cover", "wide"]));
    act(() => result.current.setCoverPhoto("listing-covers/u/new.webp"));
    expect(result.current.rejectedPhotoSlots).toEqual(["wide"]);
    expect(result.current.draft.coverPhoto?.image).toBe(
      "listing-covers/u/new.webp",
    );
  });

  it("keeps the refused mark when only the cover's alt text changes", () => {
    const { result } = renderHook(() => useListingForm());
    act(() => result.current.setRejectedPhotoSlots(["cover", "wide"]));
    act(() => result.current.setCoverAlt("Front door"));
    expect(result.current.rejectedPhotoSlots).toEqual(["cover", "wide"]);
    expect(result.current.draft.coverPhoto?.alt).toBe("Front door");
  });

  it("clears the cover preview on reset", () => {
    const { result } = renderHook(() => useListingForm());
    act(() => result.current.setCoverPreview("blob:cover"));
    expect(result.current.coverPreview).toBe("blob:cover");
    act(() => result.current.reset());
    expect(result.current.coverPreview).toBe("");
  });
});
