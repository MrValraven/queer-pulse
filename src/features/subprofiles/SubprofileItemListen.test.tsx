import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileItemRow } from "./SubprofileItemRow";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { SubprofileKind } from "./api/subprofiles.api";

/**
 * Imported episodes carry their link in `url`, which a list row never showed
 * before, so an episode had no way to be played. A row on a kind that can
 * import a feed, in a section a feed can publish into, with a safe http(s)
 * link now carries a Listen link ("Watch" for a video creator); no other
 * kind's sections do.
 */
const EPISODE = {
  id: "itm-feed-1",
  section: "episodes",
  title: "The second coming out",
  createdAt: "2026-09-22T08:30:00.000Z",
  subtitle: "S2 · E10",
  description: "Kai on telling their parents twice.",
  url: "https://latebloomers.example/episodes/the-second-coming-out",
  imageUrl: "",
  date: "2026-09",
  meta: "48 min",
  tags: [],
  isFeatured: false,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: null,
} satisfies SubprofileItemView;

function renderRow(
  item: SubprofileItemView,
  interactive = true,
  kind: SubprofileKind = "podcaster",
) {
  render(
    <TestProviders>
      <SubprofileItemRow
        item={item}
        skin="page"
        interactive={interactive}
        kind={kind}
      />
    </TestProviders>,
  );
}

describe("SubprofileItemRow Listen link", () => {
  it("links an episode to its page in a new tab, named for the episode", async () => {
    renderRow(EPISODE);
    const link = await screen.findByRole("link", {
      name: "Listen to The second coming out",
    });
    expect(link).toHaveAttribute("href", EPISODE.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("Listen");
  });

  it("keeps the episode's subtitle and length on the row", async () => {
    renderRow(EPISODE);
    expect(await screen.findByText("S2 · E10")).toBeInTheDocument();
    expect(screen.getByText("48 min")).toBeInTheDocument();
  });

  it("follows what a feed can publish into for the kind: a podcaster's appearances too", async () => {
    renderRow({ ...EPISODE, section: "appearances" });
    expect(
      await screen.findByRole("link", {
        name: "Listen to The second coming out",
      }),
    ).toBeInTheDocument();
  });

  it("says Watch, not Listen, for a video creator's videos", async () => {
    renderRow({ ...EPISODE, section: "videos" }, true, "video_creator");
    const link = await screen.findByRole("link", {
      name: "Watch The second coming out",
    });
    expect(link).toHaveTextContent("Watch");
  });

  it("adds none to another kind's sections, such as a performer's appearances", async () => {
    renderRow({ ...EPISODE, section: "appearances" }, true, "performer");
    expect(
      await screen.findByText("The second coming out"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("adds none without a kind, or for a kind that cannot import a feed", async () => {
    renderRow(EPISODE, true, "developer");
    expect(
      await screen.findByText("The second coming out"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("only links http(s): a mailto address gets no Listen", async () => {
    renderRow({ ...EPISODE, url: "mailto:hello@latebloomers.example" });
    expect(
      await screen.findByText("The second coming out"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("adds no link to rows in other sections, even with a url", async () => {
    renderRow({ ...EPISODE, section: "projects" });
    expect(
      await screen.findByText("The second coming out"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("adds none to an episode without a url, or with an unsafe one", async () => {
    renderRow({ ...EPISODE, url: "" });
    expect(
      await screen.findByText("The second coming out"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("drops a script address", async () => {
    renderRow({ ...EPISODE, url: "javascript:alert(1)" });
    expect(
      await screen.findByText("The second coming out"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /listen/i })).toBeNull();
  });

  it("shows a disabled Listen in the editor's preview instead of a link", async () => {
    renderRow(EPISODE, false);
    const button = await screen.findByRole("button", { name: /listen/i });
    expect(button).toBeDisabled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
