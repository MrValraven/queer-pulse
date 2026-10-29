import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ApiError } from "../../shared/api/client";
import type { ListingPhotoFraming } from "./api/directory.api";
import type { GalleryShot } from "./directoryGalleryShots";
import { useGalleryReposition } from "./useGalleryReposition";
import type { ListingPhotoRepositionAccess } from "./useListingPhotoRepositionAccess";

const holder = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  guardSpy: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("./api/useSaveListingPhotoFraming", () => ({
  useSaveListingPhotoFraming: () => ({
    mutate: holder.mutate,
    isPending: holder.isPending,
  }),
}));
vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useUnsavedChangesGuard: holder.guardSpy,
}));
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: holder.showToast }),
}));

const MOVED: ListingPhotoFraming = { focusX: 0.2, focusY: 0.7, zoom: 1.5 };
const SHOT_FIRST: GalleryShot = { url: "u1", alt: "First" };
const SHOT_SECOND: GalleryShot = { url: "u2", alt: "Second" };
const SHOTS = [SHOT_FIRST, SHOT_SECOND];
const ACCESS: ListingPhotoRepositionAccess = {
  ref: "ref-1",
  slug: "a-place",
  asAdmin: false,
};

function renderReposition() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{children}</I18nProvider>
    </QueryClientProvider>
  );
  return renderHook(
    () => useGalleryReposition({ shots: SHOTS, access: ACCESS }),
    { wrapper },
  );
}

function lastGuardOptions(): { active: boolean } {
  const calls = holder.guardSpy.mock.calls as Array<[{ active: boolean }]>;
  const lastCall = calls[calls.length - 1];
  if (!lastCall) throw new Error("The leave guard was never called");
  return lastCall[0];
}

beforeEach(() => {
  holder.mutate.mockReset();
  holder.guardSpy.mockReset();
  holder.showToast.mockReset();
  holder.isPending = false;
});

describe("useGalleryReposition", () => {
  it("starts from the saved framing and is clean", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    expect(result.current.isEditing).toBe(true);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.framingFor(SHOT_FIRST)).toEqual({
      focusX: 0.5,
      focusY: 0.5,
      zoom: 1,
    });
  });

  it("marks the gallery dirty after a change and arms the leave guard", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    expect(lastGuardOptions().active).toBe(false);
    act(() => result.current.setFraming("u1", MOVED));
    expect(result.current.isDirty).toBe(true);
    expect(result.current.framingFor(SHOT_FIRST)).toEqual(MOVED);
    expect(lastGuardOptions().active).toBe(true);
  });

  it("clamps a draft framing that falls outside the allowed range", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    act(() =>
      result.current.setFraming("u1", { focusX: 4, focusY: -1, zoom: 9 }),
    );
    expect(result.current.framingFor(SHOT_FIRST)).toEqual({
      focusX: 1,
      focusY: 0,
      zoom: 3,
    });
  });

  it("asks before discarding changes on Cancel, and Discard restores the saved framing", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    act(() => result.current.setFraming("u1", MOVED));
    act(() => result.current.requestCancel());
    expect(result.current.isDiscardConfirmOpen).toBe(true);
    expect(result.current.isEditing).toBe(true);
    act(() => result.current.keepEditing());
    expect(result.current.isDiscardConfirmOpen).toBe(false);
    act(() => result.current.requestCancel());
    act(() => result.current.confirmDiscard());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isDiscardConfirmOpen).toBe(false);
    expect(result.current.framingFor(SHOT_FIRST)).toEqual({
      focusX: 0.5,
      focusY: 0.5,
      zoom: 1,
    });
  });

  it("leaves edit mode at once on Cancel when nothing changed", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    act(() => result.current.requestCancel());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isDiscardConfirmOpen).toBe(false);
  });

  it("sends only the photos whose framing changed", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    act(() => result.current.setFraming("u2", MOVED));
    act(() => result.current.save());
    expect(holder.mutate).toHaveBeenCalledWith(
      { photos: [{ image: "u2", framing: MOVED }] },
      expect.anything(),
    );
  });

  it("leaves edit mode and skips the request when nothing changed", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    act(() => result.current.save());
    expect(holder.mutate).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(false);
  });

  it("keeps edit mode and the draft after a failed save and names the reason", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    act(() => result.current.setFraming("u2", MOVED));
    act(() => result.current.save());
    const callbacks = holder.mutate.mock.calls[0]?.[1] as {
      onError: (error: Error) => void;
    };
    act(() =>
      callbacks.onError(
        new ApiError(403, "x", { message: "x", code: "LISTING_NOT_MANAGER" }),
      ),
    );
    expect(result.current.isEditing).toBe(true);
    expect(result.current.framingFor(SHOT_SECOND)).toEqual(MOVED);
    expect(result.current.error?.reason).toBe("notManager");
  });

  it("confirms a successful save with a toast and returns to the desktop view", () => {
    const { result } = renderReposition();
    act(() => result.current.startEditing());
    act(() => result.current.setViewport("phone"));
    act(() => result.current.setFraming("u1", MOVED));
    act(() => result.current.save());
    const callbacks = holder.mutate.mock.calls[0]?.[1] as {
      onSuccess: () => void;
    };
    act(() => callbacks.onSuccess());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.viewport).toBe("desktop");
    expect(holder.showToast).toHaveBeenCalledWith(
      expect.any(String),
      "success",
    );
  });
});
