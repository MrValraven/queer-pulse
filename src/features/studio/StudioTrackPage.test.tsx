import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoCreditLedger } from "./api/studioDemoCreditLedger";
import { StudioTrackPage } from "./StudioTrackPage";

const TRACK_URL = "/studio/track?id=demo-track-cidade-dos-santos-06";

beforeEach(() => resetDemoCreditLedger());

describe("StudioTrackPage (demo fixture)", () => {
  it("shows credits and lyrics from data, with no fake language switch", async () => {
    render(
      <TestProviders initialEntries={[TRACK_URL]}>
        <StudioTrackPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Carta para a santa",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Querida santa, não me ouves/)).toBeInTheDocument();
    expect(screen.getByText("João Anjos")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "EN" }),
    ).not.toBeInTheDocument();
  });

  it("names the artist in the More from heading", async () => {
    render(
      <TestProviders initialEntries={[TRACK_URL]}>
        <StudioTrackPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /more from mariana sol/i,
      }),
    ).toBeInTheDocument();
  });

  it("links the crumbs to the artist and the release", async () => {
    render(
      <TestProviders initialEntries={[TRACK_URL]}>
        <StudioTrackPage />
      </TestProviders>,
    );
    const crumbs = await screen.findByRole("navigation", {
      name: /breadcrumb/i,
    });
    expect(
      within(crumbs).getByRole("link", { name: "Mariana Sol" }),
    ).toHaveAttribute("href", "/studio/artist?id=demo-persona-mariana-sol");
    expect(
      within(crumbs).getByRole("link", { name: "Cidade dos santos" }),
    ).toHaveAttribute(
      "href",
      "/studio/album?id=demo-release-cidade-dos-santos",
    );
  });
});

describe("StudioTrackPage: a track on a withdrawn release", () => {
  it("shows the withdrawn view in place", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/track?id=demo-track-withdrawn-01"]}
      >
        <StudioTrackPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "This release was withdrawn",
      }),
    ).toBeInTheDocument();
  });
});

describe("StudioTrackPage: the Like heart", () => {
  it("offers Like on a track of a live release", async () => {
    render(
      <TestProviders initialEntries={[TRACK_URL]}>
        <StudioTrackPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Like Carta para a santa" }),
    ).toBeInTheDocument();
  });

  it("leaves Like off the owner's taken-down track", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/track?id=demo-track-taken-down-bairro-01"]}
      >
        <StudioTrackPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Bairro antigo" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Like Bairro antigo" }),
    ).not.toBeInTheDocument();
  });
});
