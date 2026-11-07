import { QueryClient } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyMotion, domMax } from "motion/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { useVjClips } from "../api/useVjClips";
import { vjKeys } from "../api/vjKeys";
import { vjRefusal } from "../demo/vjDemoRefusals";
import { demoUpdateVjClip } from "../demo/vjDemoStore";
import { useVjClipPlaybackDraft } from "./useVjClipPlaybackDraft";
import { VjClipPlaybackFields } from "./VjClipPlaybackFields";

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return { ...actual, demoUpdateVjClip: vi.fn() };
});

const CLIP_ID = "00000000-0000-4000-8000-0000000000c7";
const CREATED_AT = "2026-11-06T20:00:00.000Z";
const DURATION_MS = 8000;

function buildClip(overrides: Partial<VjClipDTO> = {}) {
  return {
    id: CLIP_ID,
    title: "Night drive",
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1024,
    width: 1920,
    height: 1080,
    durationMs: DURATION_MS,
    fitMode: "fill",
    thumbnailUrl: "https://media.test/night-drive.jpg",
    mediaUrl: "https://media.test/night-drive.mp4",
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
    previewUrl: null,
    ...overrides,
  } satisfies VjClipDTO;
}

/** The server's copy of the clip: the mocked write merges each body into it,
 *  the way the demo store does once the rules pass. */
let storedClip: VjClipDTO = buildClip();

function PlaybackFields({ clip }: { clip: VjClipDTO }) {
  const draft = useVjClipPlaybackDraft(clip);
  return <VjClipPlaybackFields clip={clip} draft={draft} />;
}

/** Reads the clip from the library cache the way Edit clip does, so a save
 *  shows through the cache patch. */
function PlaybackHarness() {
  const clips = useVjClips();
  const clip = clips.data?.find((candidate) => candidate.id === CLIP_ID);
  if (clip === undefined) return null;
  return <PlaybackFields clip={clip} />;
}

function renderFields(clip: VjClipDTO) {
  storedClip = clip;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(vjKeys.clips(true), [clip]);
  render(
    <TestProviders queryClient={queryClient}>
      <LazyMotion features={domMax}>
        <PlaybackHarness />
      </LazyMotion>
    </TestProviders>,
  );
  return userEvent.setup();
}

/** The Playback section's alert: the toast region around it is an alert region too. */
async function findPlaybackAlert(): Promise<HTMLElement> {
  const section = await screen.findByRole("region", { name: "Playback" });
  return within(section).findByRole("alert");
}

describe("VjClipPlaybackFields", () => {
  beforeEach(() => {
    vi.mocked(demoUpdateVjClip).mockReset();
    vi.mocked(demoUpdateVjClip).mockImplementation((_clipId, body) => {
      storedClip = { ...storedClip, ...(body as Partial<VjClipDTO>) };
      return storedClip;
    });
  });

  it("saves a new speed at once and keeps it shown", async () => {
    const user = renderFields(buildClip());
    await user.click(await screen.findByRole("button", { name: "2x" }));

    expect(screen.getByRole("button", { name: "2x" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await waitFor(() =>
      expect(demoUpdateVjClip).toHaveBeenCalledWith(CLIP_ID, {
        defaultSpeed: 2,
      }),
    );
    await waitFor(() => expect(storedClip.defaultSpeed).toBe(2));
    expect(screen.getByRole("button", { name: "2x" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("puts the speed back and names the reason when the server refuses", async () => {
    vi.mocked(demoUpdateVjClip).mockImplementationOnce(() => {
      throw vjRefusal("VJ_CLIP_SPEED_INVALID");
    });
    const user = renderFields(buildClip());
    await user.click(await screen.findByRole("button", { name: "4x" }));

    expect(await findPlaybackAlert()).toHaveTextContent(
      "Pick a speed from 0.25x to 4x",
    );
    expect(screen.getByRole("button", { name: "1x" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "4x" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("switches to ping-pong", async () => {
    const user = renderFields(buildClip());
    await user.click(await screen.findByRole("button", { name: "Ping-pong" }));

    expect(screen.getByRole("button", { name: "Ping-pong" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await screen.findByText("Plays forward, then backward, and repeats"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(demoUpdateVjClip).toHaveBeenCalledWith(CLIP_ID, {
        loopMode: "pingPong",
      }),
    );
  });

  it("shows Save loop only after a handle moves", async () => {
    renderFields(buildClip());
    const loopStart = await screen.findByRole("slider", { name: "Loop start" });
    expect(screen.queryByRole("button", { name: "Save loop" })).toBeNull();

    // An arrow key moves the handle 100 ms.
    fireEvent.keyDown(loopStart, { key: "ArrowRight" });
    fireEvent.keyUp(loopStart, { key: "ArrowRight" });

    expect(
      await screen.findByRole("button", { name: "Save loop" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Loop start" })).toHaveValue(
      "100",
    );
    expect(demoUpdateVjClip).not.toHaveBeenCalled();
  });

  it("saves the loop with null for an untouched start", async () => {
    const user = renderFields(buildClip());
    fireEvent.change(await screen.findByRole("slider", { name: "Loop end" }), {
      target: { value: "6000" },
    });
    await user.click(await screen.findByRole("button", { name: "Save loop" }));

    await waitFor(() =>
      expect(demoUpdateVjClip).toHaveBeenCalledWith(CLIP_ID, {
        loopInMs: null,
        loopOutMs: 6000,
      }),
    );
    expect(await screen.findByText("Loop saved")).toBeInTheDocument();
  });

  it("Use whole clip clears both points", async () => {
    const user = renderFields(buildClip({ loopInMs: 1000, loopOutMs: 5000 }));
    await user.click(
      await screen.findByRole("button", { name: "Use whole clip" }),
    );

    await waitFor(() =>
      expect(demoUpdateVjClip).toHaveBeenCalledWith(CLIP_ID, {
        loopInMs: null,
        loopOutMs: null,
      }),
    );
    expect(
      await screen.findByText("The whole clip loops now"),
    ).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Loop start" })).toHaveValue("0");
    expect(screen.getByRole("slider", { name: "Loop end" })).toHaveValue(
      String(DURATION_MS),
    );
  });

  it("hides loop points for a GIF and says why", async () => {
    renderFields(
      buildClip({ mediaKind: "gif", mimeType: "image/gif", durationMs: null }),
    );
    expect(
      await screen.findByText(
        "GIFs always loop whole. Speed and loop mode still apply",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.getByRole("button", { name: "Ping-pong" })).toBeVisible();
  });

  it("names VJ_CLIP_LOOP_INVALID with the minimum length", async () => {
    vi.mocked(demoUpdateVjClip).mockImplementationOnce(() => {
      throw vjRefusal("VJ_CLIP_LOOP_INVALID");
    });
    const user = renderFields(buildClip());
    fireEvent.change(
      await screen.findByRole("slider", { name: "Loop start" }),
      { target: { value: "1000" } },
    );
    await user.click(await screen.findByRole("button", { name: "Save loop" }));

    expect(await findPlaybackAlert()).toHaveTextContent(
      "Loop points must sit inside the clip, at least 250 ms apart",
    );
    expect(storedClip.loopInMs).toBeNull();
  });
});
