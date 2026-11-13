import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { useVjClips } from "../api/useVjClips";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import { vjRefusal } from "../demo/vjDemoRefusals";
import {
  configureVjDemoStore,
  demoGetVjClips,
  demoUpdateVjClip,
  resetVjDemoLibrary,
} from "../demo/vjDemoStore";
import { VjClipCard } from "./VjClipCard";
import { VjClipFavoriteButton } from "./VjClipFavoriteButton";

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return { ...actual, demoUpdateVjClip: vi.fn(actual.demoUpdateVjClip) };
});

const CREATED_AT = "2026-11-06T20:00:00.000Z";
const WARM_HAZE_TITLE = "Warm haze";
const PREVIEW_URL = "https://media.test/neon-grid-preview.webm";

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();
  get length(): number {
    return this.entries.size;
  }
  clear(): void {
    this.entries.clear();
  }
  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.entries.delete(key);
  }
  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

function buildClip(overrides: Partial<VjClipDTO> = {}) {
  return {
    id: "00000000-0000-4000-8000-0000000000c1",
    title: "Neon grid",
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1024,
    width: 1920,
    height: 1080,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: "https://media.test/neon-grid.jpg",
    mediaUrl: "https://media.test/neon-grid.mp4",
    packIds: [],
    packCount: 0,
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: PREVIEW_URL,
    setlistItemCount: 0,
    ...overrides,
  } satisfies VjClipDTO;
}

function renderWithProviders(
  children: ReactNode,
  { isReducedMotion = false }: { isReducedMotion?: boolean } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <TestProviders queryClient={queryClient}>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <LazyMotion features={domMax}>{children}</LazyMotion>
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

/** Reads the demo library the way the grid does and shows one clip's star. */
function FavoriteHarness({ title }: { title: string }) {
  const clips = useVjClips();
  const clip = clips.data?.find((candidate) => candidate.title === title);
  if (clip === undefined) return null;
  return <VjClipFavoriteButton clip={clip} />;
}

function renderCard(
  clip: VjClipDTO,
  options: { isReducedMotion?: boolean; onEdit?: () => void } = {},
) {
  return renderWithProviders(
    <VjClipCard
      clip={clip}
      position={0}
      total={1}
      isReorderable={false}
      isDragging={false}
      onEdit={options.onEdit ?? (() => undefined)}
      onMove={() => undefined}
      gripProps={{ onPointerDown: () => undefined }}
    />,
    options,
  );
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

describe("VjClipFavoriteButton", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
    vi.mocked(demoUpdateVjClip).mockClear();
  });

  it("marks a clip as a favorite and says so to screen readers", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoriteHarness title={WARM_HAZE_TITLE} />);
    const star = await screen.findByRole("button", {
      name: "Add Warm haze to favorites",
    });
    expect(star).toHaveAttribute("aria-pressed", "false");

    await user.click(star);

    const pressed = await screen.findByRole("button", {
      name: "Remove Warm haze from favorites",
    });
    expect(pressed).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(
        demoGetVjClips().items.find((clip) => clip.title === "Warm haze")
          ?.isFavorite,
      ).toBe(true),
    );
  });

  it("rolls back and shows the reason when the write is refused", async () => {
    vi.mocked(demoUpdateVjClip).mockImplementationOnce(() => {
      throw vjRefusal("VJ_CLIP_FAVORITE_INVALID");
    });
    const user = userEvent.setup();
    renderWithProviders(<FavoriteHarness title={WARM_HAZE_TITLE} />);

    await user.click(
      await screen.findByRole("button", { name: "Add Warm haze to favorites" }),
    );

    expect(
      await screen.findByText("Favorite must be on or off"),
    ).toBeInTheDocument();
    const star = await screen.findByRole("button", {
      name: "Add Warm haze to favorites",
    });
    expect(star).toHaveAttribute("aria-pressed", "false");
  });

  it("the card plays the preview on hover when the clip has one", async () => {
    const user = userEvent.setup();
    const { container } = renderCard(buildClip());
    expect(container.querySelector("video")).toBeNull();

    await user.hover(screen.getByRole("article"));

    await waitFor(() =>
      expect(container.querySelector("video")).toHaveAttribute(
        "src",
        PREVIEW_URL,
      ),
    );
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("aria-hidden", "true");
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);

    await user.unhover(screen.getByRole("article"));
    await waitFor(() => expect(container.querySelector("video")).toBeNull());
  });

  it("the card plays the preview on a long-press and keeps the clip closed", async () => {
    // jsdom counts a finger's focus as :focus-visible, which keeps the
    // keyboard preview on; browsers show focus-visible for keys only.
    const nativeMatches = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "matches",
    )?.value as (this: Element, selectors: string) => boolean;
    const matchesSpy = vi
      .spyOn(Element.prototype, "matches")
      .mockImplementation(function matchesWithoutPointerFocus(
        this: Element,
        selectors: string,
      ) {
        return selectors === ":focus-visible"
          ? false
          : nativeMatches.call(this, selectors);
      });
    const onEdit = vi.fn();
    const user = userEvent.setup();
    const { container } = renderCard(buildClip(), { onEdit });
    const editButton = await screen.findByRole("button", {
      name: "Edit Neon grid",
    });

    await user.pointer({ keys: "[TouchA>]", target: editButton });
    await waitFor(() =>
      expect(container.querySelector("video")).toHaveAttribute(
        "src",
        PREVIEW_URL,
      ),
    );
    await user.pointer({ keys: "[/TouchA]", target: editButton });

    await waitFor(() => expect(container.querySelector("video")).toBeNull());
    expect(onEdit).not.toHaveBeenCalled();
    matchesSpy.mockRestore();
  });

  it("the card keeps the still thumbnail for a clip with no preview yet", async () => {
    const user = userEvent.setup();
    const { container } = renderCard(buildClip({ previewUrl: null }));

    await user.hover(screen.getByRole("article"));
    await wait(300);

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://media.test/neon-grid.jpg",
    );
  });

  it("the card shows no preview under reduced motion", async () => {
    const user = userEvent.setup();
    const { container } = renderCard(buildClip(), { isReducedMotion: true });

    await user.hover(screen.getByRole("article"));
    await wait(300);

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://media.test/neon-grid.jpg",
    );
  });
});
