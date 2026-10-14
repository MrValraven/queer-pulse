import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioReleaseStatus } from "./api/studio.types";
import { StudioUploadPage } from "./StudioUploadPage";

const SHOW_ID = "demo-release-late-bloomers";

// The demo show is live; these tests read it as a draft or taken down.
const showStatus = vi.hoisted(() => ({
  override: null as StudioReleaseStatus | null,
}));
vi.mock("./api/useStudioRelease", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./api/useStudioRelease")>();
  return {
    ...actual,
    useStudioRelease: (
      ...args: Parameters<typeof actual.useStudioRelease>
    ): ReturnType<typeof actual.useStudioRelease> => {
      const result = actual.useStudioRelease(...args);
      const status = showStatus.override;
      return status && result.release?.id === SHOW_ID
        ? {
            ...result,
            release: {
              ...result.release,
              status,
              takedownReason: status === "taken_down" ? "A test" : null,
            },
          }
        : result;
    },
  };
});

const DRAFT_URL = `/studio/upload?release=${SHOW_ID}&episode=demo-episode-late-bloomers-draft`;

describe("episode mode (demo, owner)", () => {
  it("opens the draft episode with its fields and Publish episode", async () => {
    render(
      <TestProviders initialEntries={[DRAFT_URL]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("textbox", { name: "Episode title" }),
    ).toHaveValue("Our parents, part two");
    expect(
      screen.getByRole("textbox", { name: "Show notes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Transcript" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish episode" }),
    ).toBeInTheDocument();
  });

  it("says when no line of the notes starts with a time", async () => {
    render(
      <TestProviders initialEntries={[DRAFT_URL]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    // The demo draft's notes hold "00:00 Intro", so the notes change first.
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Show notes" }),
      {
        target: { value: "Still editing this one" },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Read chapters from the notes" }),
    );
    expect(
      await screen.findByText(
        "No line in the notes starts with a time like 12:30",
      ),
    ).toBeInTheDocument();
  });

  it("reads chapters from the notes into the editor", async () => {
    render(
      <TestProviders initialEntries={[DRAFT_URL]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Show notes" }),
      {
        target: { value: "00:00 Intro\n04:10 Why now" },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Read chapters from the notes" }),
    );
    expect(
      await screen.findByText("Read 2 chapters from the notes"),
    ).toBeInTheDocument();
  });

  it("publishes the episode and offers the next steps", async () => {
    render(
      <TestProviders initialEntries={[DRAFT_URL]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Publish episode" }),
    );
    expect(await screen.findByText(/is live/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
    expect(
      screen.getByRole("link", { name: "Add another episode" }),
    ).toHaveAttribute(
      "href",
      "/studio/upload?release=demo-release-late-bloomers&episode=new",
    );
  });

  it("shows one drop zone for a new episode", async () => {
    render(
      <TestProviders
        initialEntries={[
          "/studio/upload?release=demo-release-late-bloomers&episode=new",
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Episode audio" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/up to 250 MB an episode/)).toBeInTheDocument();
  });
});

describe("episode mode guards", () => {
  afterEach(() => {
    showStatus.override = null;
  });

  it("keeps the release flow when the address names no episode", async () => {
    render(
      <TestProviders
        initialEntries={[
          "/studio/upload?release=demo-release-cidade-dos-santos",
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("list", { name: "Upload steps" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Episode audio" }),
    ).not.toBeInTheDocument();
  });

  it("reads a track of another release as not found", async () => {
    render(
      <TestProviders
        initialEntries={[
          `/studio/upload?release=${SHOW_ID}&episode=demo-track-lua-01`,
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        name: "We can't find that in Studio",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Episode title" }),
    ).not.toBeInTheDocument();
  });

  it("locks a taken-down show", async () => {
    showStatus.override = "taken_down";
    render(
      <TestProviders initialEntries={[DRAFT_URL]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        name: "This release was taken down",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Episode title" }),
    ).not.toBeInTheDocument();
  });

  it("offers Save episode and no Publish episode on a draft show", async () => {
    showStatus.override = "draft";
    render(
      <TestProviders initialEntries={[DRAFT_URL]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("textbox", { name: "Episode title" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save episode" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Publish episode" }),
    ).not.toBeInTheDocument();
  });
});
