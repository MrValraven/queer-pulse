import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toArtistView, toReleaseCardView } from "./api/studio.adapters";
import { demoStudioArtist, demoStudioRelease } from "./api/studioDemoApi";
import { DEMO_SHOW_ID } from "./api/studioDemoFormats.data";
import { StudioArtistHero } from "./StudioArtistHero";
import { artistTabsOf } from "./studioArtist.data";
import { StudioArtistMain } from "./StudioArtistMain";
import { StudioOwnerReleaseRow } from "./StudioOwnerReleaseRow";

describe("artist kinds on the artist page", () => {
  it("titles a podcaster's releases Shows", () => {
    render(
      <TestProviders>
        <StudioArtistMain
          tab="music"
          artist={toArtistView(demoStudioArtist("sp-tiago-late-bloomers"))}
        />
      </TestProviders>,
    );
    expect(screen.getByRole("heading", { name: "Shows" })).toBeInTheDocument();
  });

  it("titles a drag artist's releases Performance audio", () => {
    render(
      <TestProviders>
        <StudioArtistMain
          tab="music"
          artist={toArtistView(
            demoStudioArtist("sp-ines-fonseca-vanda-diesel"),
          )}
        />
      </TestProviders>,
    );
    expect(
      screen.getByRole("heading", { name: "Performance audio" }),
    ).toBeInTheDocument();
  });

  it("labels the first tab by the artist's format", () => {
    expect(artistTabsOf("music")[0]?.labelKey).toBe("studio:artist.tabs.music");
    expect(artistTabsOf("podcast")[0]?.labelKey).toBe(
      "studio:artist.tabs.podcast",
    );
    expect(artistTabsOf("spoken_word")[0]?.labelKey).toBe(
      "studio:artist.tabs.spokenWord",
    );
    expect(artistTabsOf("performance")[0]?.labelKey).toBe(
      "studio:artist.tabs.performance",
    );
    expect(artistTabsOf("podcast")[1]?.id).toBe("about");
  });

  it("counts a podcaster's releases as shows in the hero", () => {
    render(
      <TestProviders>
        <StudioArtistHero
          artist={toArtistView(demoStudioArtist("sp-tiago-late-bloomers"))}
          titleRef={createRef<HTMLSpanElement>()}
          onTip={() => undefined}
        />
      </TestProviders>,
    );
    expect(screen.getByText(/\d+ shows?/)).toBeInTheDocument();
    expect(screen.queryByText(/\d+ releases?/)).toBeNull();
  });

  it("offers Add episode on a live show's owner row", () => {
    const release = toReleaseCardView(demoStudioRelease(DEMO_SHOW_ID));
    render(
      <TestProviders>
        <ul>
          <StudioOwnerReleaseRow
            row={{
              release,
              status: "published",
              statusLabelKey: "studio:releaseStatus.published",
              takedownReason: null,
              publishAt: null,
            }}
            isBusy={false}
            errorKey={null}
            onAction={() => {}}
          />
        </ul>
      </TestProviders>,
    );
    expect(
      screen.getByRole("link", { name: "Add episode to Late Bloomers" }),
    ).toHaveAttribute(
      "href",
      `/studio/upload?release=${DEMO_SHOW_ID}&episode=new`,
    );
  });
});
