import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DEMO_DEFAULT_RELEASE_ID } from "./api/studioDemoMe.data";
import { resetDemoPurchases } from "./api/studioDemoPurchaseStore";
import {
  toBuyerPurchaseView,
  toOfferView,
  type StudioBuyerPurchaseView,
  type StudioOfferView,
} from "./api/studioPurchases.adapters";
import { useStudioOffer } from "./api/useStudioOffer";
import { StudioReleaseBuyPanel } from "./StudioReleaseBuyPanel";

// The studio catalog loads lazily, so the first query of each test waits.

const mocks: { offer: StudioOfferView | null } = { offer: null };

/** One client per test, so a test never reads another's cache. */
let testQueryClient = new QueryClient();

function baseOffer(): StudioOfferView {
  const offer = toOfferView({
    item: {
      kind: "release",
      title: "Água-forte",
      releaseId: "rel-1",
      trackId: null,
      releaseType: "album",
      coverUrl: null,
      isAvailable: true,
    },
    artist: {
      id: "sp-rita",
      handle: "rita-ferreira",
      name: "Rita Ferreira",
      kind: "musician",
      avatarUrl: null,
    },
    price: { mode: "fixed", amountCents: 300 },
    viewer: {
      state: "can_buy",
      refusalCode: null,
      pendingPurchase: null,
      ownedPurchase: null,
    },
    paymentMethods: [],
    identityOptions: [],
    trackOffers: [],
  });
  if (offer === null) throw new Error("test offer must resolve");
  return offer;
}

function offerView(overrides: Partial<StudioOfferView>): StudioOfferView {
  return { ...baseOffer(), ...overrides };
}

function confirmedPurchase(): StudioBuyerPurchaseView {
  const purchase = toBuyerPurchaseView({
    id: "pur-owned",
    status: "confirmed",
    item: {
      kind: "release",
      title: "Água-forte",
      releaseId: "rel-1",
      trackId: null,
      releaseType: "album",
      coverUrl: null,
      isAvailable: true,
    },
    artist: {
      name: "Rita Ferreira",
      subprofileId: "sp-rita",
      handle: "rita-ferreira",
      isLinkable: true,
    },
    amountCents: 300,
    referenceCode: "QP4M7R",
    payerName: null,
    declineReason: null,
    declineNote: null,
    createdAt: "2026-10-20T12:00:00Z",
    decidedAt: "2026-10-21T12:00:00Z",
    wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
    downloads: [
      {
        trackId: "trk-1",
        position: 1,
        title: "Maré",
        durationSeconds: 201,
        format: "mp3",
        unavailableReason: null,
      },
    ],
  });
  if (purchase === null) throw new Error("test purchase must resolve");
  return purchase;
}

function renderPanel() {
  const offer = mocks.offer;
  if (offer === null) throw new Error("set mocks.offer first");
  return render(
    <TestProviders queryClient={new QueryClient()}>
      <StudioReleaseBuyPanel offer={offer} />
    </TestProviders>,
  );
}

/** Reads the demo offer the way the album page does, then mounts the panel. */
function DemoReleasePanel({ releaseId }: { releaseId: string }) {
  const { offer } = useStudioOffer("release", releaseId, { isEnabled: true });
  return offer ? <StudioReleaseBuyPanel offer={offer} /> : null;
}

async function renderPanelFor(releaseId: string) {
  render(
    <TestProviders queryClient={testQueryClient}>
      <DemoReleasePanel releaseId={releaseId} />
    </TestProviders>,
  );
  await screen.findByRole("region", { name: /^Buy / });
}

beforeEach(() => {
  resetDemoPurchases();
  testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mocks.offer = null;
});

describe("StudioReleaseBuyPanel", () => {
  it("offers Rita's single at its price and opens the sheet", async () => {
    await renderPanelFor("demo-release-home-1");
    expect(await screen.findByText("Digital single")).toBeInTheDocument();
    expect(screen.getByText("€3")).toBeInTheDocument();
    expect(
      screen.getByText("You pay Rita Ferreira directly"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /^Buy single: .+ by Rita Ferreira$/ }),
    );
    expect(
      await screen.findByRole("dialog", { name: /^Buy / }),
    ).toBeInTheDocument();
  });

  it("reads name your price with its minimum", async () => {
    mocks.offer = offerView({
      price: { mode: "name_your_price", amountCents: 200 },
      viewer: {
        state: "can_buy",
        refusalCode: null,
        pendingPurchase: null,
        ownedPurchase: null,
      },
    });
    renderPanel();
    expect(
      await screen.findByText("Name your price, €2 or more"),
    ).toBeInTheDocument();
    // The accessible name starts with the visible label (WCAG 2.5.3).
    expect(
      screen.getByRole("button", {
        name: "Buy album: Água-forte by Rita Ferreira",
      }),
    ).toHaveTextContent("Buy album");
  });

  it("shows Lua's pending claim with its code, ways to pay and cancel", async () => {
    await renderPanelFor("demo-release-lua-ultimo-eletrico");
    expect(
      await screen.findByText(
        "Waiting for Lua Cardoso to confirm your payment",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("QP7K3F")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add this code to your payment note so Lua Cardoso can find it",
      ),
    ).toBeInTheDocument();
    const waysToggle = screen.getByRole("button", {
      name: "Show ways to pay Lua Cardoso",
    });
    expect(waysToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(waysToggle);
    expect(
      screen.getByRole("button", { name: "Hide ways to pay" }),
    ).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(
      screen.getByRole("button", { name: "Cancel this purchase" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Cancel purchase" }),
    );
    expect(await screen.findByText("Purchase cancelled")).toBeInTheDocument();
  });

  it("shows Coro's single in the collection with its downloads behind a toggle", async () => {
    await renderPanelFor("demo-release-home-3");
    expect(await screen.findByText("In your collection")).toBeInTheDocument();
    const downloadToggle = screen.getByRole("button", {
      name: "Download tracks",
    });
    expect(downloadToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(downloadToggle);
    expect(
      screen.getByRole("list", { name: /^Tracks of .+ to download$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hide downloads" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("switch", { name: "Show me on the supporter wall" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("link", { name: "Open your purchases" }),
    ).toHaveAttribute("href", "/studio/library?tab=purchases");
  });
});

describe("StudioReleaseBuyPanel edge states", () => {
  it("keeps an owned item in the collection after the artist took it off sale", async () => {
    mocks.offer = offerView({
      price: null,
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_not_for_sale",
        pendingPurchase: null,
        ownedPurchase: confirmedPurchase(),
      },
    });
    renderPanel();
    expect(await screen.findByText("In your collection")).toBeInTheDocument();
    expect(screen.queryByText("This is not for sale")).toBeNull();
  });

  it("names each refusal, with the neutral line for a block and a link for the artist's own page", async () => {
    await renderPanelFor(DEMO_DEFAULT_RELEASE_ID);
    expect(
      await screen.findByText(
        "You are a member of this artist, so you cannot buy its music",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open payments to confirm" }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("/studio/payments?persona="),
    );
    mocks.offer = offerView({
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_unavailable",
        pendingPurchase: null,
        ownedPurchase: null,
      },
    });
    renderPanel();
    expect(
      await screen.findByText("You cannot buy music from this artist"),
    ).toBeInTheDocument();
    // The refusal is the page's state, so it reads as plain text.
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Buy / })).toBeNull();
  });

  it("lets the artist's own persona win over an owned or pending claim", async () => {
    mocks.offer = offerView({
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_own_persona",
        pendingPurchase: { ...confirmedPurchase(), status: "pending" },
        ownedPurchase: confirmedPurchase(),
      },
    });
    renderPanel();
    expect(
      await screen.findByText(
        "You are a member of this artist, so you cannot buy its music",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("In your collection")).toBeNull();
    expect(
      screen.queryByText("Waiting for Rita Ferreira to confirm your payment"),
    ).toBeNull();
    expect(
      screen.getByRole("link", { name: "Open payments to confirm" }),
    ).toHaveAttribute("href", "/studio/payments?persona=sp-rita");
  });

  it("points a release sold track by track to its tracks", async () => {
    mocks.offer = offerView({
      price: null,
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_not_for_sale",
        pendingPurchase: null,
        ownedPurchase: null,
      },
      trackOffers: [
        {
          trackId: "trk-1",
          position: 1,
          title: "Maré",
          price: { mode: "fixed", amountCents: 100 },
          state: "can_buy",
          refusalCode: null,
          pendingPurchaseId: null,
          ownedPurchaseId: null,
        },
      ],
    });
    renderPanel();
    expect(
      await screen.findByText(
        "This release is sold track by track. Pick a track below to buy it",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("This is not for sale")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("keeps the not for sale line when no track is on offer either", async () => {
    mocks.offer = offerView({
      price: null,
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_not_for_sale",
        pendingPurchase: null,
        ownedPurchase: null,
      },
      trackOffers: [],
    });
    renderPanel();
    expect(await screen.findByText("This is not for sale")).toBeInTheDocument();
  });

  it("closes the sheet into the pending state and announces it", async () => {
    await renderPanelFor("demo-release-home-1");
    fireEvent.click(
      await screen.findByRole("button", {
        name: /^Buy single: .+ by Rita Ferreira$/,
      }),
    );
    await screen.findByRole("dialog", { name: /^Buy / });
    // "I've paid" waits for the payment code.
    await screen.findByRole("button", { name: "Copy the reference code" });
    fireEvent.click(screen.getByRole("button", { name: "I've paid" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(
      await screen.findByText(
        "Rita Ferreira will confirm your payment. Follow it in your purchases",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Waiting for Rita Ferreira to confirm your payment",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Digital single" }),
      ).toHaveFocus(),
    );
  });
});
