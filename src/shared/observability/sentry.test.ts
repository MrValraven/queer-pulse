import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/react";
import { dropPrivateRequestUrl, dropStudioPlayBreadcrumb } from "./sentry";

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
