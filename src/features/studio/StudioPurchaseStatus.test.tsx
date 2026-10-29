import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioBuyerPurchaseView } from "./api/studioPurchases.adapters";
import type {
  StudioPurchaseDeclineReason,
  StudioPurchaseStatusValue,
} from "./api/studioPurchases.types";
import { StudioPurchaseStatus } from "./StudioPurchaseStatus";

function purchaseWith({
  status,
  artistName,
  declineReason = null,
  declineNote = null,
}: {
  status: StudioPurchaseStatusValue;
  artistName: string;
  declineReason?: StudioPurchaseDeclineReason | null;
  declineNote?: string | null;
}): StudioBuyerPurchaseView {
  return {
    id: "p1",
    status,
    item: {
      kind: "release",
      title: "Cidade dos santos",
      releaseId: "rel-1",
      trackId: null,
      formatLabelKey: "studio:purchase.format.single",
      coverUrl: null,
      href: "/studio/releases/rel-1",
      isAvailable: true,
    },
    artist: { name: artistName, href: null, subprofileId: "sp-artist" },
    amountCents: 300,
    referenceCode: "K7M2QX",
    payerName: null,
    declineReason,
    declineNote,
    createdAt: new Date("2026-10-20T10:00:00.000Z"),
    decidedAt: null,
    wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
    downloads: [],
  };
}

function renderStatus(purchase: StudioBuyerPurchaseView) {
  return render(
    <TestProviders>
      <StudioPurchaseStatus purchase={purchase} />
    </TestProviders>,
  );
}

describe("StudioPurchaseStatus", () => {
  it("names who a pending buyer waits for", () => {
    renderStatus(
      purchaseWith({ status: "pending", artistName: "Lua Cardoso" }),
    );
    expect(screen.getByText("Waiting for the artist")).toBeInTheDocument();
    expect(
      screen.getByText("Waiting for Lua Cardoso to confirm"),
    ).toBeInTheDocument();
  });

  it("names the decline reason, the artist's note and the way forward", () => {
    renderStatus(
      purchaseWith({
        status: "declined",
        artistName: "Rita Ferreira",
        declineReason: "amount_different",
        declineNote:
          "I received €2 and the single is €3. Send the rest and tap I've paid again",
      }),
    );
    expect(screen.getByText("Declined")).toBeInTheDocument();
    expect(
      screen.getByText("Rita Ferreira received a different amount"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Rita Ferreira added: I received €2 and the single is €3. Send the rest and tap I've paid again",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You can start a new purchase from the release page"),
    ).toBeInTheDocument();
  });

  it("gives a decline without a note two lines and no note line", () => {
    renderStatus(
      purchaseWith({
        status: "declined",
        artistName: "Rita Ferreira",
        declineReason: "payment_not_found",
      }),
    );
    expect(
      screen.getByText("Rita Ferreira could not find your payment"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/added:/)).toBeNull();
  });

  it("reads the 30-day line for an expired claim", () => {
    renderStatus(
      purchaseWith({ status: "expired", artistName: "Lua Cardoso" }),
    );
    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Lua Cardoso did not answer within 30 days, so this claim expired. You can buy it again",
      ),
    ).toBeInTheDocument();
  });

  it("reads its own line for a cancelled purchase", () => {
    renderStatus(
      purchaseWith({ status: "cancelled", artistName: "Lua Cardoso" }),
    );
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("You cancelled this purchase")).toBeInTheDocument();
  });

  it("shows only the chip for a confirmed purchase", () => {
    const { container } = renderStatus(
      purchaseWith({ status: "confirmed", artistName: "Lua Cardoso" }),
    );
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
