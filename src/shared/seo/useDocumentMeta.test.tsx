import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PageMeta } from "./PageMeta";
import { defaultMeta } from "./seo.data";

// Held in consts so the i18n lint rule doesn't read these fixtures as
// user-facing copy that belongs in a catalog.
const MAGAZINE_TITLE = "The Magazine — QueerPulse";
const MAGAZINE_DESCRIPTION = "Essays.";
const VERIFY_TITLE = "Verify — QueerPulse";
const PROFILE_TITLE = "Someone — QueerPulse";

function metaContent(selector: string): string | null {
  return (
    document.head
      .querySelector<HTMLMetaElement>(selector)
      ?.getAttribute("content") ?? null
  );
}

describe("useDocumentMeta", () => {
  it("applies the page's title and description", () => {
    render(
      <MemoryRouter initialEntries={["/magazine"]}>
        <PageMeta title={MAGAZINE_TITLE} description={MAGAZINE_DESCRIPTION} />
      </MemoryRouter>,
    );

    expect(document.title).toBe(MAGAZINE_TITLE);
    expect(metaContent('meta[name="description"]')).toBe(MAGAZINE_DESCRIPTION);
    expect(metaContent('meta[property="og:title"]')).toBe(MAGAZINE_TITLE);
  });

  it("returns the head to the site defaults on unmount, even when the document started on a prerendered page title", () => {
    // scripts/prerender.mjs bakes each public page's own title into its
    // dist/<path>/index.html, so a session entered there starts with a
    // page-specific head. The baseline must still be the site default —
    // gated routes (feed, local directory) render no <PageMeta> to overwrite it.
    document.title = MAGAZINE_TITLE;

    const view = render(
      <MemoryRouter initialEntries={["/magazine"]}>
        <PageMeta title={MAGAZINE_TITLE} description={MAGAZINE_DESCRIPTION} />
      </MemoryRouter>,
    );
    view.unmount();

    expect(document.title).toBe(defaultMeta.title);
    expect(metaContent('meta[name="description"]')).toBe(
      defaultMeta.description,
    );
    expect(metaContent('meta[property="og:title"]')).toBe(defaultMeta.title);
  });

  it("drops the noindex robots tag on unmount", () => {
    const view = render(
      <MemoryRouter initialEntries={["/cards/verify"]}>
        <PageMeta title={VERIFY_TITLE} noIndex />
      </MemoryRouter>,
    );
    expect(metaContent('meta[name="robots"]')).toBe("noindex, nofollow");

    view.unmount();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("restores the default social image dimensions after a page overrides the image", () => {
    const view = render(
      <MemoryRouter initialEntries={["/members/someone"]}>
        <PageMeta title={PROFILE_TITLE} image="/avatars/someone.png" />
      </MemoryRouter>,
    );
    expect(
      document.head.querySelector('meta[property="og:image:width"]'),
    ).toBeNull();

    view.unmount();
    expect(metaContent('meta[property="og:image:width"]')).toBe(
      String(defaultMeta.imageWidth),
    );
    expect(metaContent('meta[property="og:image:height"]')).toBe(
      String(defaultMeta.imageHeight),
    );
  });
});
