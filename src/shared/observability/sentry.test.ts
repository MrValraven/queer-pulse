import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/react";
import {
  dropPrivateRequestUrl,
  dropStudioPlayBreadcrumb,
  isPrivateObservabilityUrl,
} from "./sentry";

describe("dropStudioPlayBreadcrumb", () => {
  it("drops a fetch breadcrumb for a track stream URL", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "/v1/studio/tracks/abc/stream", method: "GET" },
      }),
    ).toBeNull();
  });

  it("drops a breadcrumb for a release URL", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "xhr",
        data: { url: "https://api.example.com/v1/studio/releases/r1" },
      }),
    ).toBeNull();
  });

  it("drops a navigation breadcrumb whose message or target names a track", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        message: "/studio/tracks/abc",
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        data: { from: "/studio", to: "/studio/tracks/abc" },
      }),
    ).toBeNull();
  });

  it("drops a fetch breadcrumb for a playlist API URL", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "/v1/studio/playlists/p1/tracks", method: "POST" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "/v1/studio/playlists/mine", method: "GET" },
      }),
    ).toBeNull();
  });

  it("drops a navigation breadcrumb for a playlist, track or album page", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        data: { from: "/studio", to: "/studio/collection?id=p1" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        data: { from: "/studio/track?id=t1", to: "/studio" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        message: "/studio/album?id=r1",
      }),
    ).toBeNull();
  });

  it("keeps a navigation breadcrumb for the Studio home and the id-less collection page", () => {
    const homeCrumb = {
      category: "navigation",
      data: { from: "/feed", to: "/studio" },
    };
    const collectionCrumb = {
      category: "navigation",
      data: { from: "/studio", to: "/studio/collection" },
    };
    expect(dropStudioPlayBreadcrumb(homeCrumb)).toBe(homeCrumb);
    expect(dropStudioPlayBreadcrumb(collectionCrumb)).toBe(collectionCrumb);
  });

  it("keeps every other breadcrumb unchanged", () => {
    const fetchCrumb = {
      category: "fetch",
      data: { url: "/v1/feed", method: "GET" },
    };
    const clickCrumb = { category: "ui.click", message: "button.save" };
    expect(dropStudioPlayBreadcrumb(fetchCrumb)).toBe(fetchCrumb);
    expect(dropStudioPlayBreadcrumb(clickCrumb)).toBe(clickCrumb);
  });

  it("drops a fetch breadcrumb for a radio read", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "/v1/studio/radio?genre=fado", method: "GET" },
      }),
    ).toBeNull();
  });

  it("drops the artist kinds reads that name what a member listens to", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "/v1/studio/episodes/latest?limit=12", method: "GET" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "/v1/studio/formats", method: "GET" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "xhr",
        data: { url: "/v1/studio/tracks/e1/publish", method: "POST" },
      }),
    ).toBeNull();
  });

  it("drops every ui breadcrumb while the page is in Studio", () => {
    const startPath = window.location.pathname;
    try {
      for (const studioPath of ["/studio", "/studio/track?id=t1"]) {
        window.history.pushState(null, "", studioPath);
        expect(
          dropStudioPlayBreadcrumb({
            category: "ui.click",
            message: "button[aria-label=Report track]",
          }),
        ).toBeNull();
        expect(
          dropStudioPlayBreadcrumb({ category: "ui.input", message: "input" }),
        ).toBeNull();
      }
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });

  it("keeps ui breadcrumbs outside Studio and other kinds inside it", () => {
    const startPath = window.location.pathname;
    try {
      window.history.pushState(null, "", "/studiopass");
      const clickCrumb = { category: "ui.click", message: "button.save" };
      expect(dropStudioPlayBreadcrumb(clickCrumb)).toBe(clickCrumb);
      window.history.pushState(null, "", "/studio");
      const consoleCrumb = { category: "console", message: "ready" };
      expect(dropStudioPlayBreadcrumb(consoleCrumb)).toBe(consoleCrumb);
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });

  it("drops every ui breadcrumb while a community's Support tab is open", () => {
    const startPath = window.location.pathname + window.location.search;
    try {
      window.history.pushState(null, "", "/communities/runners?tab=giving");
      expect(
        dropStudioPlayBreadcrumb({
          category: "ui.click",
          message: "button[aria-label=Copy Ko-fi]",
        }),
      ).toBeNull();
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.input", message: "input" }),
      ).toBeNull();
      window.history.pushState(null, "", "/communities/runners?tab=events");
      const clickCrumb = { category: "ui.click", message: "button.save" };
      expect(dropStudioPlayBreadcrumb(clickCrumb)).toBe(clickCrumb);
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });
});

describe("dropStudioPlayBreadcrumb on a player surface", () => {
  it("drops a ui breadcrumb aimed inside the player on any page", () => {
    const startPath = window.location.pathname + window.location.search;
    try {
      window.history.pushState(null, "", "/feed");
      const playerBar = document.createElement("section");
      playerBar.setAttribute("data-studio-player", "");
      const likeButton = document.createElement("button");
      likeButton.setAttribute("aria-label", "Like Night Swim");
      playerBar.append(likeButton);
      expect(
        dropStudioPlayBreadcrumb(
          {
            category: "ui.click",
            message: "section > button[aria-label=Like Night Swim]",
          },
          { event: { target: likeButton } },
        ),
      ).toBeNull();
      expect(
        dropStudioPlayBreadcrumb(
          { category: "ui.click", message: "section" },
          { event: { target: playerBar } },
        ),
      ).toBeNull();
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });

  it("keeps a ui breadcrumb aimed outside the player or without a DOM target", () => {
    const startPath = window.location.pathname + window.location.search;
    try {
      window.history.pushState(null, "", "/feed");
      const saveButton = document.createElement("button");
      const outsideCrumb = { category: "ui.click", message: "button.save" };
      expect(
        dropStudioPlayBreadcrumb(outsideCrumb, {
          event: { target: saveButton },
        }),
      ).toBe(outsideCrumb);
      const missingHintCrumb = { category: "ui.click", message: "button" };
      expect(dropStudioPlayBreadcrumb(missingHintCrumb)).toBe(missingHintCrumb);
      const missingEventCrumb = { category: "ui.click", message: "button" };
      expect(dropStudioPlayBreadcrumb(missingEventCrumb, {})).toBe(
        missingEventCrumb,
      );
      const playerBar = document.createElement("section");
      playerBar.setAttribute("data-studio-player", "");
      const textNode = document.createTextNode("Night Swim");
      playerBar.append(textNode);
      for (const target of [textNode, window, document, null]) {
        const keypressCrumb = { category: "ui.keypress", message: "body" };
        expect(
          dropStudioPlayBreadcrumb(keypressCrumb, { event: { target } }),
        ).toBe(keypressCrumb);
      }
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });
});

function eventWithRequest(request: ErrorEvent["request"]): ErrorEvent {
  return { type: undefined, request };
}

describe("dropPrivateRequestUrl", () => {
  it("removes the url and query string of a private collection page", () => {
    const event = dropPrivateRequestUrl(
      eventWithRequest({
        url: "https://queerpulse.test/studio/collection?id=p1",
        query_string: "id=p1",
        method: "GET",
      }),
    );
    expect(event.request).toEqual({ method: "GET" });
  });

  it("keeps the url and query string of a feed page", () => {
    const event = dropPrivateRequestUrl(
      eventWithRequest({
        url: "https://queerpulse.test/feed?tab=new",
        query_string: "tab=new",
      }),
    );
    expect(event.request).toEqual({
      url: "https://queerpulse.test/feed?tab=new",
      query_string: "tab=new",
    });
  });

  it("drops a private referer under a lower-case key", () => {
    const event = dropPrivateRequestUrl(
      eventWithRequest({
        url: "https://queerpulse.test/feed",
        headers: {
          referer: "https://queerpulse.test/studio/collection?id=p1",
          "User-Agent": "test",
        },
      }),
    );
    expect(event.request?.headers).toEqual({ "User-Agent": "test" });
  });

  it("drops a private referer under an upper-case key", () => {
    const event = dropPrivateRequestUrl(
      eventWithRequest({
        url: "https://queerpulse.test/feed",
        headers: { Referer: "https://queerpulse.test/studio/track?id=t1" },
      }),
    );
    expect(event.request?.headers).toEqual({});
  });

  it("keeps an unrelated referer", () => {
    const event = dropPrivateRequestUrl(
      eventWithRequest({
        url: "https://queerpulse.test/feed",
        headers: { Referer: "https://queerpulse.test/events" },
      }),
    );
    expect(event.request?.headers).toEqual({
      Referer: "https://queerpulse.test/events",
    });
  });
});

describe("Studio saves and likes", () => {
  it("drops a breadcrumb for liking or saving a Studio track, release or playlist", () => {
    for (const url of [
      "/v1/me/saved/studio_track%3A3f2a9c1e-0b7d-4c55-9e1a-2d4f6b8c0e11",
      "/v1/me/saved/studio_track:3f2a9c1e-0b7d-4c55-9e1a-2d4f6b8c0e11",
      "/v1/me/saved/studio_release%3Ar1",
      "/v1/me/saved/studio_playlist%3Ap1",
    ])
      expect(
        dropStudioPlayBreadcrumb({
          category: "fetch",
          data: { url, method: "PUT" },
        }),
      ).toBeNull();
  });

  it("keeps a breadcrumb for the saved list and for other saved kinds", () => {
    for (const url of [
      "/v1/me/saved",
      "/v1/me/saved?kind=studio_track",
      "/v1/me/saved/event%3Ae1",
    ]) {
      const crumb = { category: "fetch", data: { url, method: "GET" } };
      expect(dropStudioPlayBreadcrumb(crumb)).toBe(crumb);
    }
  });

  it("drops a breadcrumb for a Studio item in a saved list", () => {
    for (const url of [
      "/v1/me/saved/lists/l1/items/studio_track%3A3f2a9c1e",
      "/v1/me/saved/lists/l1/items/studio_track:3f2a9c1e",
      "/v1/me/saved/lists/l1/items/studio_release%3Ar1",
      "/v1/me/saved/lists/l1/items/studio_playlist%3Ap1",
    ])
      expect(
        dropStudioPlayBreadcrumb({
          category: "fetch",
          data: { url, method: "PUT" },
        }),
      ).toBeNull();
  });

  it("keeps a breadcrumb for an event item in a saved list", () => {
    const crumb = {
      category: "fetch",
      data: { url: "/v1/me/saved/lists/l1/items/event%3Ae1", method: "PUT" },
    };
    expect(dropStudioPlayBreadcrumb(crumb)).toBe(crumb);
  });
});

describe("Studio v3 private paths", () => {
  it("drops breadcrumbs that name a preview link or a press kit", () => {
    const token = "a".repeat(64);
    for (const url of [
      `/v1/studio/previews/${token}`,
      `/v1/studio/previews/${token}/tracks/t1/stream`,
      "/v1/studio/artists/p1/press-kit",
    ])
      expect(
        dropStudioPlayBreadcrumb({ category: "fetch", data: { url } }),
      ).toBeNull();
    for (const to of [
      `/studio/preview/${token}`,
      "/studio/press?id=p1",
      "/studio/press/print?id=p1",
      "/studio/press/edit?persona=p1",
    ])
      expect(
        dropStudioPlayBreadcrumb({
          category: "navigation",
          data: { from: "/studio", to },
        }),
      ).toBeNull();
  });

  it("strips a preview page from an error's request url", () => {
    const event = dropPrivateRequestUrl(
      eventWithRequest({
        url: `https://queerpulse.test/studio/preview/${"b".repeat(64)}`,
        method: "GET",
      }),
    );
    expect(event.request).toEqual({ method: "GET" });
  });

  it("treats creator draft routes and the admin page as private", () => {
    expect(
      isPrivateObservabilityUrl("http://api.test/v1/me/creator-drafts/event"),
    ).toBe(true);
    expect(
      isPrivateObservabilityUrl(
        "http://api.test/v1/admin/creator-drafts/persona/123",
      ),
    ).toBe(true);
    expect(
      isPrivateObservabilityUrl(
        "https://queerpulse.pt/admin/creator-drafts?kind=event",
      ),
    ).toBe(true);
    expect(
      isPrivateObservabilityUrl("http://api.test/v1/admin/listing-drafts/123"),
    ).toBe(true);
  });

  it("treats a mention name lookup as private", () => {
    expect(
      isPrivateObservabilityUrl(
        "http://api.test/v1/mentions/names?refs=member%3Adraft-persona",
      ),
    ).toBe(true);
  });

  it("drops a breadcrumb for the landing visit count", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "http://api.test/v1/landing/visits", method: "POST" },
      }),
    ).toBeNull();
    expect(
      isPrivateObservabilityUrl("http://api.test/v1/landing/features"),
    ).toBe(false);
  });
});
