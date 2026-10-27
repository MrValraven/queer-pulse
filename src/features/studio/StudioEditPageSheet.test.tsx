import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { SubprofileNotFoundError } from "../subprofiles/api/useOwnerSkinPatch";
import { TestProviders } from "../../test/TestProviders";
import { toArtistView, type StudioArtistView } from "./api/studio.adapters";
import { studioKeys } from "./api/studioQueryKeys";
import { studioHeroSaveFailureOf } from "./api/useStudioHeroChoiceSave";
import { StudioEditPageSheet } from "./StudioEditPageSheet";

const ARTIST_ID = "sp-mariana";

function artistWith(coverUrl: string | null): StudioArtistView {
  return toArtistView({
    artist: {
      id: ARTIST_ID,
      handle: "mariana",
      name: "Mariana",
      kind: "musician",
      avatarUrl: null,
      bio: null,
      city: null,
      coverUrl,
      studioHero: "both",
    },
    releases: [],
    ownerReleases: [],
    followerCount: 3,
    isFollowing: false,
    playlists: [],
  });
}

/** Demo mode (forced on in vitest), with the artist view already cached. */
function renderSheet(view: StudioArtistView) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(studioKeys.artist(true, ARTIST_ID), view);
  const onPreviewChange = vi.fn();
  const onClose = vi.fn();
  render(
    <TestProviders queryClient={queryClient}>
      <StudioEditPageSheet
        artist={view}
        onPreviewChange={onPreviewChange}
        onClose={onClose}
      />
    </TestProviders>,
  );
  return { queryClient, onPreviewChange, onClose };
}

describe("StudioEditPageSheet", () => {
  it("previews the highlighted choice and saves it for the session in demo", async () => {
    const { queryClient, onPreviewChange, onClose } = renderSheet(
      artistWith("/files/cover.jpg"),
    );
    fireEvent.click(
      screen.getByRole("radio", { name: /^Banner\s?Your cover/ }),
    );
    expect(onPreviewChange).toHaveBeenLastCalledWith("banner");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    expect(
      queryClient.getQueryData<StudioArtistView>(
        studioKeys.artist(true, ARTIST_ID),
      )?.heroLayout,
    ).toBe("banner");
  });

  it("closes without a save when the choice is the saved one", async () => {
    const { queryClient, onClose } = renderSheet(
      artistWith("/files/cover.jpg"),
    );
    const artistKey = studioKeys.artist(true, ARTIST_ID);
    const cachedBefore = queryClient.getQueryData(artistKey);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    // No write: the cached view is the very object it was.
    expect(queryClient.getQueryData(artistKey)).toBe(cachedBefore);
  });

  it("hands the hero back to the saved choice on Cancel", async () => {
    const { onPreviewChange, onClose } = renderSheet(
      artistWith("/files/cover.jpg"),
    );
    fireEvent.click(screen.getByRole("radio", { name: /^Avatar/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("keeps every choice shut without a cover, links to the editor and offers only Close", async () => {
    const { onPreviewChange, onClose } = renderSheet(artistWith(null));
    fireEvent.click(
      screen.getByRole("radio", { name: /^Banner\s?Your cover/ }),
    );
    expect(onPreviewChange).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("radio", { name: /^Avatar/ })
        .getAttribute("aria-checked"),
    ).toBe("true");
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio.getAttribute("aria-disabled")).toBe("true");
    }
    expect(
      screen.getByText(/A banner needs a cover photo/),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("link", { name: "Add one in the persona editor" })
        .getAttribute("href"),
    ).toBe(`/account/subprofiles/${ARTIST_ID}/edit?pane=presence&field=cover`);
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    // The sheet's X is also named Close; the footer's comes last.
    const footerClose = screen.getAllByRole("button", { name: "Close" }).at(-1);
    if (!footerClose) throw new Error("No footer Close button");
    fireEvent.click(footerClose);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe("studioHeroSaveFailureOf", () => {
  it("names the reason from the server's answer", () => {
    expect(studioHeroSaveFailureOf(new ApiError(400, "bad")).reason).toBe(
      "invalidChoice",
    );
    expect(studioHeroSaveFailureOf(new ApiError(403, "no")).reason).toBe(
      "notAllowed",
    );
    expect(studioHeroSaveFailureOf(new ApiError(503, "down")).reason).toBe(
      "serverDown",
    );
    expect(studioHeroSaveFailureOf(new TypeError("fetch")).reason).toBe(
      "network",
    );
    expect(
      studioHeroSaveFailureOf(new ApiError(408, "Request timed out")).reason,
    ).toBe("network");
    expect(studioHeroSaveFailureOf(new SubprofileNotFoundError())).toEqual({
      reason: "personaMissing",
      status: null,
    });
    expect(studioHeroSaveFailureOf(new Error("bug"))).toEqual({
      reason: "unexpected",
      status: null,
    });
    expect(studioHeroSaveFailureOf(new ApiError(418, "odd"))).toEqual({
      reason: "unexpected",
      status: 418,
    });
  });
});
