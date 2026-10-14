import { useState, type ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toStudioPressKitView } from "./api/studio.adapters";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
  type StudioQueueTrack,
} from "./player/studioPlayerContext";
import { StudioPressPage } from "./StudioPressPage";
import {
  PressBestTracks,
  PressBio,
  PressContact,
  PressReleases,
} from "./StudioPressSections";

// The demo read answers a 410 for this id, as the server does for a
// taken-down release.
const WITHDRAWN_PERSONA_ID = "withdrawn-persona";
vi.mock("./api/studioDemoPress", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoPress")>();
  return {
    ...original,
    demoStudioPressKit: (subprofileId: string) => {
      if (subprofileId === "withdrawn-persona")
        throw new ApiError(410, "Gone", {
          statusCode: 410,
          code: "studio_release_withdrawn",
        });
      return original.demoStudioPressKit(subprofileId);
    },
  };
});

function renderAt(path: string, wrapper?: (page: ReactNode) => ReactNode) {
  const page = <StudioPressPage />;
  render(
    <TestProviders initialEntries={[path]}>
      {wrapper ? wrapper(page) : page}
    </TestProviders>,
  );
}

/** A player that keeps the current track and its playing state, so a Play
 *  click shows the same change the app player shows. */
function RecordingPlayer({
  children,
  onPlayTracks,
}: {
  children: ReactNode;
  onPlayTracks: (items: StudioQueueTrack[], startTrackId?: string) => void;
}) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const value = {
    ...createStudioPlayerTestValue(),
    status: isPlaying ? "playing" : currentTrackId ? "paused" : "idle",
    radio: null,
    currentItem: null,
    hasPrevious: false,
    hasNext: false,
    playRelease: () => Promise.resolve(),
    playReleases: () => Promise.resolve(),
    playTracks: (items: StudioQueueTrack[], startTrackId?: string) => {
      onPlayTracks(items, startTrackId);
      setCurrentTrackId(startTrackId ?? items[0]?.trackId ?? null);
      setIsPlaying(true);
      return Promise.resolve();
    },
    togglePlay: () => setIsPlaying((wasPlaying) => !wasPlaying),
    next: () => {},
    previous: () => {},
    seek: () => {},
    retry: () => {},
    stop: () => {},
    isCurrentRelease: () => false,
    isCurrentTrack: (trackId: string) => trackId === currentTrackId,
  } satisfies StudioPlayerValue;
  return (
    <StudioPlayerContext.Provider value={value}>
      {children}
    </StudioPlayerContext.Provider>
  );
}

const EMPTY_KIT = toStudioPressKitView({
  artist: {
    id: "p1",
    handle: "x",
    name: "X",
    kind: "musician",
    avatarUrl: null,
    bio: null,
    city: null,
  },
  personaHandle: "x",
  pitch: null,
  bio: null,
  featuredTracks: [],
  isFeaturedFallback: true,
  releases: [],
  quotes: [],
  contact: null,
  socialLinks: [],
  supportLinks: [],
  isOwner: false,
  owner: null,
});

describe("StudioPressPage (demo press kits)", () => {
  it("shows Mariana's press kit from the view model", async () => {
    renderAt("/studio/press?id=demo-persona-mariana-sol");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Mariana Sol" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Fado letters set to a patient piano, from Beja to Sintra",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy bio" }),
    ).toBeInTheDocument();
    const tracks = screen.getByRole("list", {
      name: "Best tracks by Mariana Sol",
    });
    expect(within(tracks).getAllByRole("button").length).toBe(3);
    expect(
      screen.getByText(
        "Sol sings like someone bargaining with God, and winning",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "press@marianasol.pt" }),
    ).toHaveAttribute("href", "mailto:press@marianasol.pt");
  });

  it("opens the one-sheet from the bar and gives the owner the editor", async () => {
    renderAt("/studio/press?id=demo-persona-mariana-sol");
    expect(
      await screen.findByRole("link", { name: "Download one-sheet" }),
    ).toHaveAttribute(
      "href",
      "/studio/press/print?id=demo-persona-mariana-sol&print=1",
    );
    expect(
      screen.getByRole("link", { name: "Edit press kit" }),
    ).toHaveAttribute(
      "href",
      "/studio/press/edit?persona=demo-persona-mariana-sol",
    );
  });

  it("keeps the demo's mock pieces to Mariana's kit", async () => {
    renderAt("/studio/press?id=sp-diogo-nightform");
    expect(
      await screen.findByRole("heading", { level: 1, name: "NIGHTFORM" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Watermarked")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edit press kit" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Download assets" }),
    ).toBeNull();
    expect(screen.getByText("From the newest releases")).toBeInTheDocument();
  });

  it("hides empty sections from a visitor and hints the owner", () => {
    const { container, rerender } = render(
      <TestProviders>
        <PressBestTracks pressKit={EMPTY_KIT} />
        <PressReleases pressKit={EMPTY_KIT} />
      </TestProviders>,
    );
    expect(container.querySelector("section")).toBeNull();
    rerender(
      <TestProviders>
        <PressBestTracks pressKit={{ ...EMPTY_KIT, isOwner: true }} />
        <PressReleases pressKit={{ ...EMPTY_KIT, isOwner: true }} />
      </TestProviders>,
    );
    expect(
      screen.getAllByText("Publish a release to fill this section"),
    ).toHaveLength(2);
  });

  it("hides an empty bio and contact from a visitor and hints the owner", () => {
    const { container, rerender } = render(
      <TestProviders>
        <PressBio pressKit={EMPTY_KIT} />
        <PressContact pressKit={EMPTY_KIT} />
      </TestProviders>,
    );
    expect(container.querySelector("section")).toBeNull();
    expect(screen.queryByText("No bio yet")).toBeNull();
    expect(screen.queryByText("No press contact yet")).toBeNull();
    rerender(
      <TestProviders>
        <PressBio pressKit={{ ...EMPTY_KIT, isOwner: true }} />
        <PressContact pressKit={{ ...EMPTY_KIT, isOwner: true }} />
      </TestProviders>,
    );
    expect(container.querySelectorAll("section")).toHaveLength(2);
    expect(screen.getByText("No bio yet")).toBeInTheDocument();
    expect(screen.getByText("No press contact yet")).toBeInTheDocument();
  });

  it("opens a web contact in a new tab with the new-tab cue", () => {
    render(
      <TestProviders>
        <PressContact
          pressKit={{
            ...EMPTY_KIT,
            contact: {
              href: "https://marianasol.pt/press",
              label: "marianasol.pt/press",
              isEmail: false,
            },
          }}
        />
      </TestProviders>,
    );
    const contact = screen.getByRole("link", {
      name: /^marianasol\.pt\/press\s*\(opens in a new tab\)$/,
    });
    expect(contact).toHaveAttribute("target", "_blank");
    expect(contact).toHaveAttribute("rel", "noopener noreferrer");
    expect(contact.querySelector("svg")).not.toBeNull();
  });

  it("shows the Studio not-found state for an unknown persona", async () => {
    renderAt("/studio/press?id=missing");
    expect(
      await screen.findByText("We can't find that in Studio"),
    ).toBeInTheDocument();
  });

  it("shows the Studio not-found state when the read answers 410", async () => {
    renderAt(`/studio/press?id=${WITHDRAWN_PERSONA_ID}`);
    expect(
      await screen.findByText("We can't find that in Studio"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("plays a best track through the app player", async () => {
    const onPlayTracks = vi.fn();
    renderAt("/studio/press?id=demo-persona-mariana-sol", (page) => (
      <RecordingPlayer onPlayTracks={onPlayTracks}>{page}</RecordingPlayer>
    ));
    const tracks = await screen.findByRole("list", {
      name: "Best tracks by Mariana Sol",
    });
    const play = within(tracks).getAllByRole("button")[0]!;
    const playLabel = play.getAttribute("aria-label") ?? "";
    expect(playLabel).toMatch(/^Play /);
    const title = playLabel.replace(/^Play /, "");
    const row = play.closest("li")!;
    expect(row).not.toHaveAttribute("aria-current");

    fireEvent.click(play);

    expect(onPlayTracks).toHaveBeenCalledTimes(1);
    const [queue, startTrackId] = onPlayTracks.mock.calls[0] as [
      StudioQueueTrack[],
      string,
    ];
    expect(queue).toHaveLength(3);
    expect(queue.map((item) => item.title)).toContain(title);
    expect(queue.find((item) => item.trackId === startTrackId)?.title).toBe(
      title,
    );
    expect(play).toHaveAccessibleName(`Pause ${title}`);
    expect(row).toHaveAttribute("aria-current", "true");

    fireEvent.click(play);
    expect(onPlayTracks).toHaveBeenCalledTimes(1);
    expect(play).toHaveAccessibleName(`Play ${title}`);
  });
});
