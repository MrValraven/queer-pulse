import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  DEMO_PREVIEW_TOKEN,
  DEMO_PUBLISHED_PREVIEW_TOKEN,
  DEMO_VISITOR_PREVIEW_TOKEN,
} from "./api/studioDemoArtistTools";
import { StudioPreviewPage } from "./StudioPreviewPage";

const overrides = vi.hoisted(() => ({
  hideExplicit: false,
  isFirstTrackExplicit: false,
}));

vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => overrides.hideExplicit,
}));

// The demo previews carry no explicit track, so one test marks the first
// track explicit on the wire the preview hook reads.
vi.mock("./api/studioDemoApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("./api/studioDemoApi")>();
  return {
    ...original,
    demoStudioPreview: (token: string) => {
      const result = original.demoStudioPreview(token);
      if (!overrides.isFirstTrackExplicit || !result.release) return result;
      return {
        ...result,
        release: {
          ...result.release,
          tracks: result.release.tracks.map((track, index) =>
            index === 0 ? { ...track, isExplicit: true } : track,
          ),
        },
      };
    },
  };
});

afterEach(() => {
  overrides.hideExplicit = false;
  overrides.isFirstTrackExplicit = false;
});

function ReleasePageStub() {
  const navigate = useNavigate();
  return (
    <>
      <p>Release page</p>
      <button type="button" onClick={() => void navigate(-1)}>
        Back
      </button>
    </>
  );
}

function renderAt(path: string) {
  render(
    <TestProviders initialEntries={["/start", path]}>
      <Routes>
        <Route path="/start" element={<p>Start page</p>} />
        <Route path="/studio/preview/:token" element={<StudioPreviewPage />} />
        <Route path="/studio/album" element={<ReleasePageStub />} />
      </Routes>
    </TestProviders>,
  );
}

describe("StudioPreviewPage (demo)", () => {
  it("shows the draft with the banner and no Save, Share or Report", async () => {
    renderAt(`/studio/preview/${DEMO_PREVIEW_TOKEN}`);
    expect(
      await screen.findByText(
        "Private preview from Mariana Sol. Please keep this link to yourself",
      ),
    ).toBeInTheDocument();
    const heroSection = heroOf("Cartas ao mar");
    // The persona may be private or a draft: the hero names it unlinked.
    expect(within(heroSection).getByText("Mariana Sol")).toBeInTheDocument();
    expect(
      within(heroSection).queryByRole("link", { name: "Mariana Sol" }),
    ).toBeNull();
    const tracks = screen.getByRole("list", {
      name: "Tracklist of Cartas ao mar",
    });
    expect(within(tracks).getAllByRole("button")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /^save/i })).toBeNull();
    expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
    expect(screen.queryByRole("button", { name: /more actions/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /add release to playlist/i }),
    ).toBeNull();
    expect(within(tracks).queryAllByRole("link")).toHaveLength(0);
  });

  it("plays another persona's scheduled release through the link", async () => {
    renderAt(`/studio/preview/${DEMO_VISITOR_PREVIEW_TOKEN}`);
    expect(
      await screen.findByText(
        "Private preview from NIGHTFORM. Please keep this link to yourself",
      ),
    ).toBeInTheDocument();
    // The hero's Play and track one's Play share the name, so each is read
    // inside its own block.
    const heroSection = heroOf("Night bus (extended)");
    expect(
      within(heroSection).getByRole("button", {
        name: /^play night bus \(extended\)/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /notify me when/i }),
    ).toBeNull();
    const tracks = screen.getByRole("list", {
      name: "Tracklist of Night bus (extended)",
    });
    expect(within(tracks).getAllByRole("button")).toHaveLength(2);
    expect(
      within(tracks).getByRole("button", { name: "Play Night bus (extended)" }),
    ).toBeInTheDocument();
    expect(
      within(tracks).getByRole("button", { name: "Play Last stop" }),
    ).toBeInTheDocument();
  });

  it("greys an explicit track while Hide explicit is on and offers no Play", async () => {
    overrides.hideExplicit = true;
    overrides.isFirstTrackExplicit = true;
    renderAt(`/studio/preview/${DEMO_PREVIEW_TOKEN}`);
    const tracks = await screen.findByRole("list", {
      name: "Tracklist of Cartas ao mar",
    });
    expect(
      within(tracks).queryByRole("button", { name: "Play Carta um" }),
    ).toBeNull();
    expect(within(tracks).getAllByRole("button")).toHaveLength(2);
    expect(
      within(tracks).getByRole("link", { name: "Hidden by your settings" }),
    ).toHaveAttribute("href", "/studio/settings");
    expect(within(tracks).getByTitle("Explicit")).toHaveTextContent("E");
  });

  it("opens the normal release page once the release is live, with Back skipping the link", async () => {
    renderAt(`/studio/preview/${DEMO_PUBLISHED_PREVIEW_TOKEN}`);
    expect(await screen.findByText("Release page")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByText("Start page")).toBeInTheDocument();
  });

  it.each([`/studio/preview/${"0".repeat(64)}`, "/studio/preview/abc"])(
    "shows the not-found state for an unknown or malformed link (%s)",
    async (path) => {
      renderAt(path);
      expect(
        await screen.findByText("We can't find that in Studio"),
      ).toBeInTheDocument();
    },
  );
});

/** The hero block around the release's h1. */
function heroOf(title: string): HTMLElement {
  const heading = screen.getByRole("heading", { level: 1, name: title });
  const heroSection = heading.closest("section");
  if (!heroSection) throw new Error(`No hero around ${title}`);
  return heroSection;
}
