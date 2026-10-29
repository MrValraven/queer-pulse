import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { useAdminStudioLanding } from "./api/useStudioAdminLanding";
import type {
  AdminStudioLandingDTO,
  AdminStudioLandingPreviewDTO,
} from "./api/studioLandingAdmin.api";
import {
  demoAdminStudioLanding,
  resetDemoAdminStudioLanding,
} from "./StudioAdminLanding.data";
import { trackEntries } from "./studioAdminLandingDemoBase";
import { StudioAdminLandingPreviews } from "./StudioAdminLandingPreviews";

const mocks: { refusal: ApiError | null } = vi.hoisted(() => ({
  refusal: null,
}));

// A set refusal answers every ask with that error, as the server would;
// otherwise the real demo write runs.
vi.mock("./api/useStudioAdminLandingMutations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("./api/useStudioAdminLandingMutations")
    >();
  return {
    ...actual,
    useRequestLandingPreview: () => {
      const real = actual.useRequestLandingPreview();
      if (!mocks.refusal) return real;
      const refusal = mocks.refusal;
      const mutate = ((
        _variables: unknown,
        options?: { onError?: (cause: unknown) => void },
      ) => {
        options?.onError?.(refusal);
      }) as unknown as typeof real.mutate;
      return { ...real, mutate };
    },
  };
});

function Host() {
  const { data } = useAdminStudioLanding();
  return data ? <StudioAdminLandingPreviews landing={data} /> : null;
}

function renderHost() {
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <Host />
    </TestProviders>,
  );
}

const section = () => screen.findByRole("region", { name: "Hear it first" });

function rowOf(container: HTMLElement, text: string) {
  const row = within(container)
    .getAllByRole("listitem")
    .find((item) => item.textContent?.includes(text));
  if (!row) throw new Error(`no row for ${text}`);
  return row;
}

/** Narrows an indexed read the test relies on; a missing seed row fails loud. */
function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`the demo seed holds no ${what}`);
  return value;
}

const seeded = () => demoAdminStudioLanding();
const openOf = (landing: AdminStudioLandingDTO) =>
  landing.previews.filter(
    (preview) => preview.status === "pending" || preview.status === "approved",
  );
const decidedOf = (landing: AdminStudioLandingDTO) =>
  landing.previews.filter(
    (preview) => preview.status !== "pending" && preview.status !== "approved",
  );

/** A track nobody asked for yet: eligible, or flagged with a reason. */
function untouchedTrack(isEligible: boolean) {
  const openTrackIds = new Set(
    openOf(seeded()).map((preview) => preview.track.id),
  );
  const entry = trackEntries().find(
    (candidate) =>
      !openTrackIds.has(candidate.track.id) &&
      (candidate.ineligibleReason === null) === isEligible,
  );
  if (!entry) throw new Error("the demo holds no such track");
  return entry;
}

async function searchFor(title: string) {
  fireEvent.click(
    await screen.findByRole("button", { name: "Ask to play a track" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Ask to play a track",
  });
  fireEvent.change(within(dialog).getByRole("searchbox"), {
    target: { value: title },
  });
  await within(dialog).findAllByRole("listitem");
  return dialog;
}

beforeEach(() => {
  resetDemoAdminStudioLanding();
  mocks.refusal = null;
});

describe("Studio page console: previews (demo)", () => {
  it("lists open rows with position, status, who asked, the page flag and the reason an approved row is muted", async () => {
    renderHost();
    const region = await section();
    const open = openOf(seeded());
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(open.length);
    // The list order is the position order, numbered 1 to n.
    open.forEach((preview, index) => {
      expect(preview.position).toBe(index + 1);
      expect(items[index]).toHaveTextContent(preview.track.title);
      expect(
        within(items[index]!).getByText(String(index + 1)),
      ).toBeInTheDocument();
    });
    const first = required(open[0], "open preview");
    expect(items[0]).toHaveTextContent(first.track.title);
    expect(items[0]).toHaveTextContent("Waiting for the artist");
    expect(items[0]).toHaveTextContent(/Asked by Sam Alves on/);
    const onPage = open.find((preview) => preview.isOnLanding);
    if (!onPage) throw new Error("the seed holds no live preview");
    expect(rowOf(region, onPage.track.title)).toHaveTextContent(
      "On the page now",
    );
    const muted = open.find(
      (preview) => preview.ineligibleReason === "content_warnings",
    );
    if (!muted) throw new Error("the seed holds no muted preview");
    const mutedRow = rowOf(region, muted.track.title);
    expect(mutedRow).toHaveTextContent("Approved");
    expect(mutedRow).toHaveTextContent("Has content warnings");
    expect(mutedRow).not.toHaveTextContent("On the page now");
  });

  it("keeps answered requests behind a toggle that names its state", async () => {
    renderHost();
    const region = await section();
    const declined = required(decidedOf(seeded())[0], "answered preview");
    expect(within(region).queryByText(declined.track.title)).toBeNull();
    const toggle = within(region).getByRole("button", {
      name: "Show answered requests",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(
      within(region).getByRole("button", { name: "Hide answered requests" }),
    ).toHaveAttribute("aria-expanded", "true");
    const row = await waitFor(() => rowOf(region, declined.track.title));
    expect(row).toHaveTextContent("Declined");
    expect(row).toHaveTextContent(/Answered by .+ on /);
  });

  it("disables Ask to play a track with the full line at 10 open rows", async () => {
    const base = seeded();
    const open = openOf(base);
    const template = required(open[0], "open preview");
    const filler: AdminStudioLandingPreviewDTO[] = Array.from(
      { length: 10 - open.length },
      (_, index) => ({
        ...template,
        id: `filler-${index}`,
        track: { ...template.track, id: `filler-track-${index}` },
        position: open.length + index + 1,
      }),
    );
    render(
      <TestProviders initialEntries={["/admin/studio"]}>
        <StudioAdminLandingPreviews
          landing={{ ...base, previews: [...open, ...filler] }}
        />
      </TestProviders>,
    );
    const button = await screen.findByRole("button", {
      name: "Ask to play a track",
    });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText("10 open requests. Remove one to ask for another"),
    ).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("moves a row down and names the new position", async () => {
    renderHost();
    const region = await section();
    const [firstRow, secondRow] = openOf(seeded());
    const first = required(firstRow, "first open preview");
    const second = required(secondRow, "second open preview");
    fireEvent.click(
      within(region).getByRole("button", {
        name: `Move down: ${first.track.title}`,
      }),
    );
    await waitFor(() =>
      expect(within(region).getAllByRole("listitem")[1]).toHaveTextContent(
        first.track.title,
      ),
    );
    expect(within(region).getAllByRole("listitem")[0]).toHaveTextContent(
      second.track.title,
    );
    expect(
      await within(region).findByText(`${first.track.title} is now number 2`),
    ).toBeInTheDocument();
  });

  it("asks before removing, then removes and says so", async () => {
    renderHost();
    const region = await section();
    const target = required(openOf(seeded())[0], "open preview");
    fireEvent.click(
      within(region).getByRole("button", {
        name: `Remove the preview of ${target.track.title}`,
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: `Remove ${target.track.title} from the Studio page?`,
    });
    expect(within(region).getAllByRole("listitem")[0]).toHaveTextContent(
      target.track.title,
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove preview" }),
    );
    expect(
      await screen.findByText(`${target.track.title} is off the Studio page`),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(within(region).queryByText(target.track.title)).toBeNull(),
    );
  });
});

describe("Studio page console: ask to play a track (demo)", () => {
  it("lists results with ineligible and already asked tracks unpickable and their reason shown", async () => {
    renderHost();
    const blocked = untouchedTrack(false);
    const dialog = await searchFor(blocked.track.title);
    const blockedRow = rowOf(dialog, blocked.track.title);
    expect(
      within(blockedRow).getByRole("button", {
        name: `Ask to play ${blocked.track.title}`,
      }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(blockedRow).toHaveTextContent(
      /Can't play right now|The artist can't appear|Podcast episode|Has content warnings|Marked explicit|Under a rights claim/,
    );
    fireEvent.change(within(dialog).getByRole("searchbox"), {
      target: {
        value: required(openOf(seeded())[0], "open preview").track.title,
      },
    });
    await waitFor(() => expect(dialog).toHaveTextContent("Already asked"));
  });

  it("sends the track id and announces that it went to the artist", async () => {
    renderHost();
    const region = await section();
    const track = untouchedTrack(true);
    const dialog = await searchFor(track.track.title);
    fireEvent.click(
      within(rowOf(dialog, track.track.title)).getByRole("button", {
        name: `Ask to play ${track.track.title}`,
      }),
    );
    expect(
      await screen.findByText(
        `${track.track.title} was sent to the artist for approval`,
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const row = await waitFor(() => rowOf(region, track.track.title));
    expect(row).toHaveTextContent("Waiting for the artist");
    expect(
      openOf(demoAdminStudioLanding()).some(
        (preview) => preview.track.id === track.track.id,
      ),
    ).toBe(true);
  });

  it("names the reason when nobody who runs the artist can answer", async () => {
    mocks.refusal = new ApiError(409, "Conflict", {
      code: "studio_landing_preview_no_reachable_owner",
    });
    renderHost();
    const track = untouchedTrack(true);
    const dialog = await searchFor(track.track.title);
    fireEvent.click(
      within(rowOf(dialog, track.track.title)).getByRole("button", {
        name: `Ask to play ${track.track.title}`,
      }),
    );
    expect(
      await within(dialog).findByText(
        "Nobody who runs this artist has Studio access, so nobody could answer",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("names the rule a 422 carries and marks that result unpickable", async () => {
    mocks.refusal = new ApiError(422, "Unprocessable Entity", {
      code: "studio_landing_preview_track_not_eligible",
      ineligibleReason: "content_warnings",
    });
    renderHost();
    const track = untouchedTrack(true);
    const dialog = await searchFor(track.track.title);
    const row = rowOf(dialog, track.track.title);
    fireEvent.click(
      within(row).getByRole("button", {
        name: `Ask to play ${track.track.title}`,
      }),
    );
    expect(
      await within(dialog).findByText(
        "This track can't play on the Studio page: Has content warnings",
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      const refusedRow = rowOf(dialog, track.track.title);
      expect(refusedRow).toHaveTextContent("Has content warnings");
      expect(
        within(refusedRow).getByRole("button", {
          name: `Ask to play ${track.track.title}`,
        }),
      ).toHaveAttribute("aria-disabled", "true");
    });
  });
});
