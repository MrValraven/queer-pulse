import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoCreditLedger } from "./api/studioDemoCreditLedger";
import { StudioUploadTrackDetails } from "./StudioUploadTrackDetails";

interface CreditFixture {
  name: string;
  role: string;
}

interface TrackFixture {
  id: string;
  title: string;
  isExplicit: boolean;
  lyricStanzas: string[][];
  credits: CreditFixture[];
  durationSeconds: number | null;
  hasAudio: boolean;
  syncedLyrics: { ms: number; text: string }[] | null;
  chapters:
    | {
        startSeconds: number;
        title: string;
        artist: string | null;
        timeLabel: string;
      }[]
    | null;
  notes: string | null;
  sources: { title: string; artist: string }[];
  release: {
    format: "music" | "podcast" | "spoken_word" | "performance";
    type: string;
  };
}

interface TrackHolder {
  current: TrackFixture | null;
}

/** The mock reads the holder at call time, so each test's own fixture is the
 *  one that renders. `renderDetails` fills it; `afterEach` empties it. */
const trackHolder: TrackHolder = vi.hoisted((): TrackHolder => ({
  current: null,
}));

vi.mock("./api/useStudioTrack", () => ({
  useStudioTrack: () => ({
    track: trackHolder.current,
    loadState: { kind: "ready" },
  }),
}));

/** Typed with its argument, so a test can read the body it was sent. */
type UpdateTrackCall = (variables: {
  body: Record<string, unknown>;
}) => Promise<unknown>;

const mutations = vi.hoisted(() => ({
  mutateAsync: vi.fn<UpdateTrackCall>(() => Promise.resolve({})),
}));
vi.mock("./api/useStudioTrackMutations", () => ({
  useUpdateStudioTrack: () => ({
    isPending: false,
    mutateAsync: mutations.mutateAsync,
  }),
}));

const THREE_CREDITS: readonly CreditFixture[] = [
  { name: "Ana", role: "Vocals" },
  { name: "Bia", role: "Piano" },
  { name: "Cris", role: "Mix" },
];

/** A new fixture object, with new credit objects, for every render. */
function buildTrackFixture(
  credits: readonly CreditFixture[],
  overrides: Partial<TrackFixture> = {},
): TrackFixture {
  return {
    id: "track-1",
    title: "Cidade dos santos",
    isExplicit: false,
    lyricStanzas: [],
    credits: credits.map((credit) => ({ ...credit })),
    durationSeconds: 600,
    hasAudio: true,
    syncedLyrics: null,
    chapters: null,
    notes: null,
    sources: [],
    release: { format: "music", type: "ep" },
    ...overrides,
  };
}

function renderDetails(
  credits: readonly CreditFixture[] = THREE_CREDITS,
  overrides: Partial<TrackFixture> = {},
  releaseType: "ep" | "mix" | "lip_sync" | "podcast" = "ep",
) {
  trackHolder.current = buildTrackFixture(credits, overrides);
  return render(
    <TestProviders>
      <StudioUploadTrackDetails
        trackId="track-1"
        releaseId="release-1"
        releaseType={releaseType}
        localFile={null}
        onDone={vi.fn()}
      />
    </TestProviders>,
  );
}

afterEach(() => {
  trackHolder.current = null;
  mutations.mutateAsync.mockClear();
});

beforeEach(() => resetDemoCreditLedger());

describe("StudioUploadTrackDetails remove credit", () => {
  it("moves focus to the next credit's name field", async () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 2" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Credit 2 name" }),
      ).toHaveFocus(),
    );
    expect(screen.getByRole("textbox", { name: "Credit 2 name" })).toHaveValue(
      "Cris",
    );
  });

  it("moves focus to the previous credit when the last one is removed", async () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 3" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Credit 2 name" }),
      ).toHaveFocus(),
    );
    expect(screen.getByRole("textbox", { name: "Credit 2 name" })).toHaveValue(
      "Bia",
    );
  });

  it("moves focus to Add a credit when the only credit is removed", async () => {
    renderDetails([{ name: "Ana", role: "Vocals" }]);
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 1" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add a credit" }),
      ).toHaveFocus(),
    );
  });

  it("renders all three credits again after a test used a single credit", () => {
    renderDetails();
    expect(screen.getByRole("textbox", { name: "Credit 3 name" })).toHaveValue(
      "Cris",
    );
  });
});

describe("StudioUploadTrackDetails timings and chapters", () => {
  it("saves pasted timings and fills empty lyrics from them", async () => {
    renderDetails(THREE_CREDITS);
    fireEvent.click(await screen.findByRole("button", { name: "Add timings" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "LRC lyrics" }),
      {
        target: { value: "[00:01.00]One\n[00:03.00]Two" },
      },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Use these timings" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    const body = mutations.mutateAsync.mock.lastCall?.[0].body;
    expect(body?.syncedLyrics).toEqual([
      { ms: 1000, text: "One" },
      { ms: 3000, text: "Two" },
    ]);
    expect(body?.lyrics).toBe("One\nTwo");
  });

  it("clears timings that no longer match the lyrics", async () => {
    renderDetails(THREE_CREDITS, {
      lyricStanzas: [["One"]],
      syncedLyrics: [{ ms: 0, text: "One" }],
    });
    fireEvent.change(await screen.findByRole("textbox", { name: "Lyrics" }), {
      target: { value: "Changed" },
    });
    expect(
      await screen.findByText(/Saving clears the timings/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    expect(
      mutations.mutateAsync.mock.lastCall?.[0].body.syncedLyrics,
    ).toBeNull();
  });

  it("blocks the save on invalid chapters and shows every error", async () => {
    renderDetails(THREE_CREDITS, {}, "mix");
    fireEvent.click(
      await screen.findByRole("button", { name: "Add a chapter" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    expect(
      await screen.findByText("Fix the chapters marked below to save"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Write the time as m:ss or h:mm:ss/),
    ).toBeInTheDocument();
    expect(mutations.mutateAsync).not.toHaveBeenCalled();
  });

  it("sends chapters only when they changed", async () => {
    renderDetails(THREE_CREDITS, {
      chapters: [
        { startSeconds: 0, title: "Opening", artist: null, timeLabel: "0:00" },
      ],
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Save track details" }),
    );
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    expect(mutations.mutateAsync.mock.lastCall?.[0].body).not.toHaveProperty(
      "chapters",
    );
    expect(mutations.mutateAsync.mock.lastCall?.[0].body).not.toHaveProperty(
      "syncedLyrics",
    );
  });

  it("clears the lyrics and their timings when the artist empties the field", async () => {
    renderDetails(THREE_CREDITS, {
      lyricStanzas: [["One"]],
      syncedLyrics: [{ ms: 0, text: "One" }],
    });
    fireEvent.change(await screen.findByRole("textbox", { name: "Lyrics" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    const body = mutations.mutateAsync.mock.lastCall?.[0].body;
    expect(body?.lyrics).toBeNull();
    expect(body?.syncedLyrics).toBeNull();
  });

  it("announces the chapter summary again on each failed save and focuses it", async () => {
    renderDetails(THREE_CREDITS, {}, "mix");
    fireEvent.click(
      await screen.findByRole("button", { name: "Add a chapter" }),
    );
    const save = screen.getByRole("button", { name: "Save track details" });
    fireEvent.click(save);
    const firstSummary = await screen.findByText(
      "Fix the chapters marked below to save",
    );
    expect(firstSummary).toHaveAttribute("role", "alert");
    await waitFor(() => expect(firstSummary).toHaveFocus());
    fireEvent.click(save);
    await waitFor(() =>
      expect(
        screen.getByText("Fix the chapters marked below to save"),
      ).not.toBe(firstSummary),
    );
    const secondSummary = screen.getByText(
      "Fix the chapters marked below to save",
    );
    expect(secondSummary).toHaveAttribute("role", "alert");
    await waitFor(() => expect(secondSummary).toHaveFocus());
    expect(mutations.mutateAsync).not.toHaveBeenCalled();
  });

  it("clears the chapter summary once a chapter is edited", async () => {
    renderDetails(THREE_CREDITS, {}, "mix");
    fireEvent.click(
      await screen.findByRole("button", { name: "Add a chapter" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    expect(
      await screen.findByText("Fix the chapters marked below to save"),
    ).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Start time for chapter 1" }),
      {
        target: { value: "0:00" },
      },
    );
    await waitFor(() =>
      expect(
        screen.queryByText("Fix the chapters marked below to save"),
      ).toBeNull(),
    );
  });
});

describe("StudioUploadTrackDetails for artist kinds", () => {
  it("labels the words Transcript on a podcast track and saves the notes", async () => {
    renderDetails(
      THREE_CREDITS,
      {
        release: { format: "podcast", type: "podcast" },
        notes: "00:00 Hello",
      },
      "podcast",
    );
    expect(
      await screen.findByRole("textbox", { name: "Transcript" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Show notes" }), {
      target: { value: "00:00 Hello\n04:10 Why now" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    expect(mutations.mutateAsync.mock.lastCall?.[0].body.notes).toBe(
      "00:00 Hello\n04:10 Why now",
    );
  });

  it("saves sources on a lip-sync track and refuses a half-filled row", async () => {
    renderDetails(
      THREE_CREDITS,
      {
        release: { format: "performance", type: "lip_sync" },
      },
      "lip_sync",
    );
    fireEvent.click(await screen.findByRole("button", { name: "Add source" }));
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Song title 1" }),
      {
        target: { value: "Vogue" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    expect(mutations.mutateAsync).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: "Artist 1" }), {
      target: { value: "Madonna" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    expect(mutations.mutateAsync.mock.lastCall?.[0].body.sources).toEqual([
      { title: "Vogue", artist: "Madonna" },
    ]);
  });

  it("keeps Lyrics on music and sends no sources or notes", async () => {
    renderDetails(THREE_CREDITS);
    expect(
      await screen.findByRole("textbox", { name: "Lyrics" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add source" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    const body = mutations.mutateAsync.mock.lastCall?.[0].body;
    expect(body).not.toHaveProperty("sources");
    expect(body).not.toHaveProperty("notes");
  });

  it("sends a blank note as null", async () => {
    renderDetails(
      THREE_CREDITS,
      {
        release: { format: "podcast", type: "podcast" },
        notes: "00:00 Hello",
      },
      "podcast",
    );
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Show notes" }),
      { target: { value: "   " } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    expect(mutations.mutateAsync.mock.lastCall?.[0].body.notes).toBeNull();
  });

  it("sends an empty list once every stored source is removed", async () => {
    renderDetails(
      THREE_CREDITS,
      {
        release: { format: "performance", type: "lip_sync" },
        sources: [{ title: "Vogue", artist: "Madonna" }],
      },
      "lip_sync",
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove source 1" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    expect(mutations.mutateAsync.mock.lastCall?.[0].body.sources).toEqual([]);
  });

  it("leaves sources off the save when none were stored and none are filled", async () => {
    renderDetails(
      THREE_CREDITS,
      {
        release: { format: "music", type: "mix" },
      },
      "mix",
    );
    fireEvent.click(await screen.findByRole("button", { name: "Add source" }));
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() => expect(mutations.mutateAsync).toHaveBeenCalled());
    expect(mutations.mutateAsync.mock.lastCall?.[0].body).not.toHaveProperty(
      "sources",
    );
  });

  it("focuses the first incomplete source when it blocks the save", async () => {
    renderDetails(
      THREE_CREDITS,
      {
        release: { format: "performance", type: "lip_sync" },
        sources: [
          { title: "Vogue", artist: "Madonna" },
          { title: "Express yourself", artist: "" },
        ],
      },
      "lip_sync",
    );
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Song title 1" }),
      { target: { value: "Vogue (live)" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save track details" }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Artist 2" })).toHaveFocus(),
    );
    expect(screen.getByRole("textbox", { name: "Artist 2" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mutations.mutateAsync).not.toHaveBeenCalled();
  });
});
