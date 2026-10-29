import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ReducedMotionContext } from "../../app/providers/motionPrefs";
import { galleryShotsOf } from "./directoryGalleryShots";
import { DirectoryGalleryRepositionable } from "./DirectoryGalleryRepositionable";
import { getPlace } from "./directoryPlaces";
import { resetDemoPhotoFraming } from "./listingPhotoFramingDemoOverlay";
import type { ListingPhotoRepositionAccess } from "./useListingPhotoRepositionAccess";
import styles from "./DirectorySpacePage.module.css";

const holder = vi.hoisted(() => ({
  guardSpy: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useUnsavedChangesGuard: holder.guardSpy,
}));
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: holder.showToast }),
}));

const farinha = getPlace("a-farinha")!;
const SHOTS = galleryShotsOf(farinha);
const ACCESS: ListingPhotoRepositionAccess = {
  ref: null,
  slug: "a-farinha",
  asAdmin: false,
};
const HERO_FRAME_NAME = "Photo 1 of 3: The bar at A Farinha";

function renderRepositionable({ isReducedMotion = false } = {}) {
  const onOpenShot = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <I18nProvider>
          <MemoryRouter>
            <DirectoryGalleryRepositionable
              placeName={farinha.name}
              shots={SHOTS}
              access={ACCESS}
              onOpenShot={onOpenShot}
            />
          </MemoryRouter>
        </I18nProvider>
      </ReducedMotionContext.Provider>
    </QueryClientProvider>,
  );
  return { onOpenShot };
}

function startEditing() {
  fireEvent.click(screen.getByRole("button", { name: "Reposition photos" }));
  return screen.getByRole("group", { name: HERO_FRAME_NAME });
}

beforeEach(() => {
  holder.guardSpy.mockReset();
  holder.showToast.mockReset();
  resetDemoPhotoFraming();
});

describe("DirectoryGalleryRepositionable", () => {
  it("switches to edit mode and stops frames from opening the lightbox", () => {
    const { onOpenShot } = renderRepositionable();

    const heroFrame = startEditing();
    fireEvent.click(heroFrame);

    expect(onOpenShot).not.toHaveBeenCalled();
    expect(
      screen.getByRole("group", { name: HERO_FRAME_NAME }),
    ).toBeInTheDocument();
  });

  it("swaps to the phone preview at once under reduced motion, keeping the frames mounted", () => {
    renderRepositionable({ isReducedMotion: true });

    const heroFrame = startEditing();
    fireEvent.click(screen.getByRole("button", { name: "Phone" }));

    expect(screen.getByRole("group", { name: HERO_FRAME_NAME })).toBe(
      heroFrame,
    );
    expect(heroFrame.closest(`.${styles.galleryViewport}`)).toHaveClass(
      styles.galleryViewportPhone!,
    );
  });

  it("holds the desktop layout until the fade out ends, then swaps", () => {
    renderRepositionable();

    const heroFrame = startEditing();
    fireEvent.click(screen.getByRole("button", { name: "Phone" }));
    const viewportWrapper = heroFrame.closest(`.${styles.galleryViewport}`)!;

    expect(viewportWrapper).toHaveClass(styles.galleryViewportFading!);
    expect(viewportWrapper).not.toHaveClass(styles.galleryViewportPhone!);

    /* A child's transitionend bubbling up leaves the layout alone. */
    fireEvent.transitionEnd(heroFrame);
    expect(viewportWrapper).not.toHaveClass(styles.galleryViewportPhone!);

    fireEvent.transitionEnd(viewportWrapper);
    expect(viewportWrapper).toHaveClass(styles.galleryViewportPhone!);
    expect(viewportWrapper).not.toHaveClass(styles.galleryViewportFading!);
    expect(screen.getByRole("group", { name: HERO_FRAME_NAME })).toBe(
      heroFrame,
    );
  });

  it("leaves edit mode on Escape when nothing moved", async () => {
    renderRepositionable();

    const heroFrame = startEditing();
    fireEvent.keyDown(heroFrame, { key: "Escape" });

    expect(
      await screen.findByRole("button", { name: "Reposition photos" }),
    ).toBeInTheDocument();
  });

  it("asks before discarding moved photos on Escape and keeps the dialog open", () => {
    renderRepositionable();
    const documentKeyDown = vi.fn();
    document.addEventListener("keydown", documentKeyDown);

    const heroFrame = startEditing();
    fireEvent.keyDown(heroFrame, { key: "ArrowRight" });
    documentKeyDown.mockClear();
    fireEvent.keyDown(heroFrame, { key: "Escape" });
    document.removeEventListener("keydown", documentKeyDown);

    /* The opening Escape stops at the gallery region, so the dialog's own
       document listener never sees it and the dialog stays open. */
    expect(documentKeyDown).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", {
        name: "Discard your photo position changes?",
      }),
    ).toBeInTheDocument();
  });

  it("ignores Escape pressed outside the gallery", () => {
    renderRepositionable();

    startEditing();
    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(
      screen.getByRole("button", { name: "Save positions" }),
    ).toBeInTheDocument();
  });

  it("asks before discarding moved photos on Cancel", () => {
    renderRepositionable();

    const heroFrame = startEditing();
    fireEvent.keyDown(heroFrame, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("dialog", {
        name: "Discard your photo position changes?",
      }),
    ).toBeInTheDocument();
  });

  it("saves in demo and leaves edit mode", async () => {
    renderRepositionable();

    const heroFrame = startEditing();
    fireEvent.keyDown(heroFrame, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "Save positions" }));

    expect(
      await screen.findByRole("button", { name: "Reposition photos" }),
    ).toBeInTheDocument();
    expect(holder.showToast).toHaveBeenCalledWith(
      "Photo positions saved",
      "success",
    );
  });
});
