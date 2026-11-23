import { describe, expect, it } from "vitest";
import type * as Sentry from "@sentry/react";
import {
  dropPrivateRequestUrl,
  dropStudioPlayBreadcrumb,
  redactSearchTextInEvent,
  redactSearchTextInUrl,
} from "./sentry";

/** SEC-47: what a member typed into a search box never reaches an event. */
describe("redactSearchTextInUrl", () => {
  it("replaces every search parameter value and keeps the rest", () => {
    expect(
      redactSearchTextInUrl(
        "https://api.example/v1/search?q=hiv%20clinic&type=people",
      ),
    ).toBe("https://api.example/v1/search?q=[private]&type=people");
    expect(redactSearchTextInUrl("/members?page=2&query=Lua#top")).toBe(
      "/members?page=2&query=[private]#top",
    );
    expect(redactSearchTextInUrl("/admin/landing?SEARCH=abc")).toBe(
      "/admin/landing?SEARCH=[private]",
    );
  });

  it("leaves a URL with no search parameter as it was", () => {
    expect(redactSearchTextInUrl("/events?tab=week&quality=1")).toBe(
      "/events?tab=week&quality=1",
    );
  });
});

describe("dropStudioPlayBreadcrumb and search text", () => {
  it("redacts the search text in fetch and navigation breadcrumbs", () => {
    const fetchCrumb: Sentry.Breadcrumb = {
      category: "fetch",
      data: { url: "https://api.example/v1/search?q=trans%20lawyer" },
    };
    const navigationCrumb: Sentry.Breadcrumb = {
      category: "navigation",
      data: { from: "/feed", to: "/search?q=trans%20lawyer" },
    };

    expect(dropStudioPlayBreadcrumb(fetchCrumb)?.data?.url).toBe(
      "https://api.example/v1/search?q=[private]",
    );
    expect(dropStudioPlayBreadcrumb(navigationCrumb)?.data?.to).toBe(
      "/search?q=[private]",
    );
  });
});

describe("console breadcrumbs and search text", () => {
  it("redacts the search text in console arguments", () => {
    const consoleCrumb: Sentry.Breadcrumb = {
      category: "console",
      message: "GET /v1/search?q=prep failed",
      data: { arguments: ["GET /v1/search?q=prep failed", 500] },
    };

    const kept = dropStudioPlayBreadcrumb(consoleCrumb);

    expect(kept?.message).toBe("GET /v1/search?q=[private] failed");
    expect(kept?.data?.arguments).toEqual([
      "GET /v1/search?q=[private] failed",
      500,
    ]);
  });
});

describe("redactSearchTextInEvent", () => {
  it("redacts the event message and every exception value", () => {
    const event: Sentry.ErrorEvent = {
      type: undefined,
      message: "Request to /members?query=Lua failed",
      exception: {
        values: [
          { type: "ApiError", value: "GET /v1/search?q=hiv%20clinic: 500" },
          { type: "TypeError", value: "Failed to fetch" },
        ],
      },
    };

    const redacted = redactSearchTextInEvent(event);

    expect(redacted.message).toBe("Request to /members?query=[private] failed");
    expect(redacted.exception?.values?.map((value) => value.value)).toEqual([
      "GET /v1/search?q=[private]: 500",
      "Failed to fetch",
    ]);
  });
});

describe("dropPrivateRequestUrl and search text", () => {
  it("redacts the page URL, query string and Referer on a search page", () => {
    const event: Sentry.ErrorEvent = {
      type: undefined,
      request: {
        url: "https://queerpulse.example/search?q=prep&type=all",
        query_string: "q=prep&type=all",
        headers: { Referer: "https://queerpulse.example/search?q=prep" },
      },
    };

    const request = dropPrivateRequestUrl(event).request;

    expect(request?.url).toBe(
      "https://queerpulse.example/search?q=[private]&type=all",
    );
    expect(request?.query_string).toBe("q=[private]&type=all");
    expect(request?.headers?.Referer).toBe(
      "https://queerpulse.example/search?q=[private]",
    );
  });

  it("redacts search values in a query string held as pairs", () => {
    const event: Sentry.ErrorEvent = {
      type: undefined,
      request: {
        query_string: [
          ["query", "Lua"],
          ["page", "2"],
        ],
      },
    };

    expect(dropPrivateRequestUrl(event).request?.query_string).toEqual([
      ["query", "[private]"],
      ["page", "2"],
    ]);
  });
});
