import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DirectoryActionBar } from "./DirectoryActionBar";
import { DirectorySpaceHeader } from "./DirectorySpaceHeader";
import { MOBILE_DIRECTORY_PLACES } from "./directoryMobilePlaces.data";
import type { DirectoryPlace } from "./directoryPlaces";

vi.mock("./LocationMiniMap", () => ({
  LocationMiniMap: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="img" aria-label={ariaLabel} />
  ),
}));

/** The action bar reads the saved list, the session and the router, so the
 *  detail parts mount inside the full provider set. */
function renderDetail(node: ReactNode) {
  return render(node, { wrapper: TestProviders });
}

const fixture = (slug: string): DirectoryPlace =>
  MOBILE_DIRECTORY_PLACES.find((place) => place.slug === slug)!;

describe("DirectorySpaceHeader eyebrow for an out-and-about listing", () => {
  it("prints where it works and no empty segment when there is no meeting point", async () => {
    renderDetail(<DirectorySpaceHeader place={fixture("muda-comigo")} />);
    const eyebrow = (await screen.findByText(/Works across Lisbon/)).closest(
      "div",
    );
    expect(eyebrow?.textContent).not.toMatch(/·\s*·/);
    expect(eyebrow?.textContent).toMatch(/Works across Lisbon$/);
  });

  it("prints the neighbourhood and city when it has a meeting point", async () => {
    renderDetail(
      <DirectorySpaceHeader place={fixture("lisboa-arco-iris-walks")} />,
    );
    expect(await screen.findByText(/Mouraria · /)).toBeInTheDocument();
  });
});

describe("DirectoryActionBar Directions for an out-and-about listing", () => {
  it("leaves Directions off with no meeting point", async () => {
    renderDetail(<DirectoryActionBar place={fixture("corte-movel")} />);
    expect(await screen.findByRole("button", { name: /save/i })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Directions" }),
    ).not.toBeInTheDocument();
  });

  it("keeps Directions with a meeting point", async () => {
    renderDetail(
      <DirectoryActionBar place={fixture("lisboa-arco-iris-walks")} />,
    );
    expect(
      await screen.findByRole("link", { name: "Directions" }),
    ).toBeInTheDocument();
  });
});
