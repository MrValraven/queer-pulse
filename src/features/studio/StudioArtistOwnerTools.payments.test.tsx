import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toArtistView } from "./api/studio.adapters";
import { demoStudioArtist } from "./api/studioDemoApi";
import { DEMO_ARTIST_MARIANA } from "./api/studioDemoMe.data";
import { StudioArtistOwnerTools } from "./StudioArtistOwnerTools";

describe("StudioArtistOwnerTools payments links (demo, Mariana)", () => {
  it("shows the payments to confirm and Getting paid links with the press kit group folded", async () => {
    const ownerView = toArtistView(demoStudioArtist(DEMO_ARTIST_MARIANA.id));
    render(
      <TestProviders>
        <StudioArtistOwnerTools artist={ownerView} />
      </TestProviders>,
    );
    expect(
      screen.getByRole("button", { name: "Press kit and updates" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: "Edit press kit" }),
    ).not.toBeInTheDocument();
    const personaId = encodeURIComponent(DEMO_ARTIST_MARIANA.id);
    const paymentsLink = await screen.findByRole("link", {
      name: "Payments to confirm, 3 payments to confirm",
    });
    expect(paymentsLink).toHaveAttribute(
      "href",
      `/studio/payments?persona=${personaId}`,
    );
    expect(screen.getByRole("link", { name: "Getting paid" })).toHaveAttribute(
      "href",
      `/studio/settings?persona=${personaId}#getting-paid`,
    );
  });
});
