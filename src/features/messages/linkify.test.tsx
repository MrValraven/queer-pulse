import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  formatLinkLabel,
  isExternalHref,
  renderWithLinks,
  type ChatPlaceLinkInfo,
} from "./linkify";

describe("renderWithLinks", () => {
  it("wraps an http URL in a safe anchor", () => {
    render(<div>{renderWithLinks("see https://queerpulse.com/x here")}</div>);
    const link = screen.getByRole("link", { name: "queerpulse.com/x" });
    expect(link).toHaveAttribute("href", "https://queerpulse.com/x");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("prefixes bare www links with https", () => {
    render(<div>{renderWithLinks("go to www.example.org now")}</div>);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.example.org",
    );
  });

  it("leaves plain text without links untouched", () => {
    render(
      <div data-testid="t">{renderWithLinks("just a plain sentence")}</div>,
    );
    expect(screen.getByTestId("t").querySelector("a")).toBeNull();
  });

  it("marks a link that leaves QueerPulse with an external-link icon", () => {
    const { container } = render(
      <div>{renderWithLinks("try https://example.org/page")}</div>,
    );
    const link = screen.getByRole("link");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(container.textContent).toContain("opens an external site");
  });

  it("leaves a queerpulse.com link unmarked", () => {
    const { container } = render(
      <div>{renderWithLinks("try https://queerpulse.com/communities")}</div>,
    );
    expect(screen.getByRole("link").querySelector("svg")).toBeNull();
    expect(container.textContent).not.toContain("opens an external site");
  });

  it("leaves a www.queerpulse.com link unmarked", () => {
    render(<div>{renderWithLinks("try www.queerpulse.com/communities")}</div>);
    expect(screen.getByRole("link").querySelector("svg")).toBeNull();
  });

  it("shortens a long tracking URL while keeping the full href", () => {
    const href =
      "https://www.romp.toys/eu/?_gl=1*75wvyc*_up*MQ..*_gs*MQ..&gclid=CjwKCAjwtp7VBhBjEiwAJfpV-7VGQ768RgxOdEBzmRd28dzep7ymGdW2Kx_Z4lXO1JzhucFvA22sahoCvVcQAvD_BwE&gbraid=0AAAAACjv-87sOodQDsZMtyW4jnp3-aeFH";
    render(<div>{renderWithLinks(href)}</div>);
    const link = screen.getByRole("link");
    expect(link.textContent).toContain("romp.toys");
    expect(link.textContent).not.toContain("gclid");
    expect(link.textContent?.length ?? 0).toBeLessThan(href.length);
    expect(link).toHaveAttribute("href", href);
  });
});

describe("isExternalHref", () => {
  it("treats a third-party host as external", () => {
    expect(isExternalHref("https://example.org/page")).toBe(true);
  });

  it("treats queerpulse.com as internal even off production", () => {
    expect(isExternalHref("https://queerpulse.com/communities")).toBe(false);
  });

  it("treats www.queerpulse.com as internal", () => {
    expect(isExternalHref("https://www.queerpulse.com/communities")).toBe(
      false,
    );
  });

  it("matches the internal host case-insensitively", () => {
    expect(isExternalHref("https://QueerPulse.COM/x")).toBe(false);
  });

  it("treats the host the app is served from as internal", () => {
    expect(isExternalHref(`${window.location.origin}/messages`)).toBe(false);
  });

  it("treats a malformed href as external, the safer default", () => {
    expect(isExternalHref("not a url")).toBe(true);
  });
});

describe("formatLinkLabel", () => {
  it("strips the scheme and www for a short link", () => {
    expect(formatLinkLabel("https://www.example.org/about")).toBe(
      "example.org/about",
    );
  });

  it("drops a trailing slash on a bare path", () => {
    expect(formatLinkLabel("https://romp.toys/")).toBe("romp.toys");
  });

  it("drops a long tracking query once the full URL is over budget", () => {
    const label = formatLinkLabel(
      "https://www.romp.toys/eu/?_gl=1*75wvyc*_up*MQ..*_gs*MQ..&gclid=CjwKCAjwtp7VBhBjEiwAJfpV-7VGQ768RgxOdEBzmRd28dzep7ymGdW2Kx_Z4lXO1JzhucFvA22sahoCvVcQAvD_BwE&gbraid=0AAAAACjv-87sOodQDsZMtyW4jnp3-aeFH",
    );
    expect(label).toBe("romp.toys/eu");
  });

  it("middle-truncates a very long path and keeps the host intact", () => {
    const href = `https://example.com/${"segment-".repeat(20)}end`;
    const label = formatLinkLabel(href);
    expect(label.startsWith("example.com")).toBe(true);
    expect(label).toContain("…");
    expect(label.length).toBeLessThanOrEqual(48);
  });

  it("returns a malformed match unchanged instead of throwing", () => {
    expect(formatLinkLabel("not a url")).toBe("not a url");
  });
});

describe("renderWithLinks with a placeLink", () => {
  const PLACE_URL = "https://localhost:5173/local/directory/cafe-do-tiago";
  const placeLink: ChatPlaceLinkInfo = {
    url: PLACE_URL,
    name: "Cafe do Tiago",
    to: "/local/directory/cafe-do-tiago",
  };

  function renderInRouter(text: string) {
    return render(
      <MemoryRouter>
        <div data-testid="body">{renderWithLinks(text, placeLink)}</div>
      </MemoryRouter>,
    );
  }

  it("swaps a trailing place URL for the place-name link, joined by an en dash", () => {
    renderInRouter(`bue slay este sitio\n${PLACE_URL}`);
    const link = screen.getByRole("link", { name: "Cafe do Tiago" });
    expect(link).toHaveAttribute("href", "/local/directory/cafe-do-tiago");
    // One run, no raw URL, no stray newline from the note/URL line break, and
    // exactly the en dash (never an em dash) between the note and the link.
    expect(screen.getByTestId("body").textContent).toBe(
      "bue slay este sitio – Cafe do Tiago",
    );
    expect(screen.queryByText(PLACE_URL, { exact: false })).toBeNull();
  });

  it("renders only the place-name link, with no dash, when the URL is the whole message", () => {
    renderInRouter(PLACE_URL);
    expect(
      screen.getByRole("link", { name: "Cafe do Tiago" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("body").textContent).toBe("Cafe do Tiago");
  });

  it("swaps only the URL token in place, with no dash, when text follows it", () => {
    renderInRouter(`Check out ${PLACE_URL} it's great`);
    expect(
      screen.getByRole("link", { name: "Cafe do Tiago" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("body").textContent).toBe(
      "Check out Cafe do Tiago it's great",
    );
  });

  it("leaves a different URL in the same message linkified as usual", () => {
    renderInRouter(`See https://example.com and also\n${PLACE_URL}`);
    const links = screen.getAllByRole("link");
    const otherLink = links.find(
      (link) => link.getAttribute("href") === "https://example.com",
    );
    expect(otherLink).toBeDefined();
    const placeAnchor = links.find(
      (link) => link.getAttribute("href") === "/local/directory/cafe-do-tiago",
    );
    expect(placeAnchor?.textContent).toBe("Cafe do Tiago");
    const text = screen.getByTestId("body").textContent ?? "";
    expect(text).toContain(" – Cafe do Tiago");
    expect(text).not.toContain(PLACE_URL);
  });

  it("drops a newline that separates the note from the URL", () => {
    renderInRouter(`hey check this place out\n\n${PLACE_URL}`);
    expect(screen.getByTestId("body").textContent).toBe(
      "hey check this place out – Cafe do Tiago",
    );
  });
});
