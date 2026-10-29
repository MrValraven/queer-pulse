import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { StudioPriceDTO } from "./api/studio.types";
import type { StudioSupporterIdentityDTO } from "./api/studioListening.types";
import {
  toBuyerPurchaseView,
  toOfferView,
  type StudioBuyerPurchaseView,
  type StudioOfferView,
} from "./api/studioPurchases.adapters";
import type { StudioPaymentMethodDTO } from "./api/studioPurchases.types";
import type { useStudioPurchaseMutations } from "./api/useStudioPurchaseMutations";
import type { useStudioPurchaseReference } from "./api/useStudioPurchaseReference";
import { StudioBuySheet } from "./StudioBuySheet";

// The studio catalog loads lazily, so the first query of each test waits.

interface MocksHolder {
  mutations: ReturnType<typeof useStudioPurchaseMutations> | null;
  reference: ReturnType<typeof useStudioPurchaseReference> | null;
}

const mocks: MocksHolder = vi.hoisted(() => ({
  mutations: null,
  reference: null,
}));

vi.mock("./api/useStudioPurchaseMutations", () => ({
  useStudioPurchaseMutations: () => mocks.mutations,
}));
vi.mock("./api/useStudioPurchaseReference", () => ({
  useStudioPurchaseReference: () => mocks.reference,
}));

const requestNew = vi.fn();
const expiresAt = new Date("2026-11-04T12:00:00Z");

const ACCOUNT: StudioSupporterIdentityDTO = {
  kind: "account",
  member: { slug: "tiago", displayName: "Tiago Costa", avatarUrl: null },
};
const LATE_BLOOMERS: StudioSupporterIdentityDTO = {
  kind: "persona",
  persona: {
    id: "sp-late-bloomers",
    handle: "late-bloomers",
    name: "Late Bloomers",
    kind: "musician",
    avatarUrl: null,
    isLinkable: true,
  },
};

function method(kind: string, value: string): StudioPaymentMethodDTO {
  return {
    id: `pm-${value}`,
    kind,
    label: null,
    value,
    note: null,
    position: 0,
  };
}
const link = (value: string) => method("link", value);
const mbway = (value: string) => method("mbway", value);
const iban = (value: string) => method("iban", value);

function offerWith({
  methods = [mbway("912345678")],
  price = { mode: "fixed", amountCents: 300 },
}: {
  methods?: StudioPaymentMethodDTO[];
  price?: StudioPriceDTO;
}): StudioOfferView {
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
    price,
    viewer: {
      state: "can_buy",
      refusalCode: null,
      pendingPurchase: null,
      ownedPurchase: null,
    },
    paymentMethods: methods,
    identityOptions: [
      { shownAsSubprofileId: null, identity: ACCOUNT },
      { shownAsSubprofileId: "sp-late-bloomers", identity: LATE_BLOOMERS },
    ],
    trackOffers: [],
  });
  if (offer === null) throw new Error("test offer must resolve");
  return offer;
}

function purchaseFixture(): StudioBuyerPurchaseView {
  const purchase = toBuyerPurchaseView({
    id: "pur-1",
    status: "pending",
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
    createdAt: "2026-10-28T12:00:00Z",
    decidedAt: null,
    wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
    downloads: [],
  });
  if (purchase === null) throw new Error("test purchase must resolve");
  return purchase;
}
const PURCHASE = purchaseFixture();

function apiError(
  status: number,
  code: string | null,
  extra: Record<string, unknown> = {},
) {
  return new ApiError(status, code ?? "refused", {
    statusCode: status,
    ...(code === null ? {} : { code }),
    ...extra,
  });
}

function mutationsWith(
  create: ReturnType<typeof useStudioPurchaseMutations>["create"],
): ReturnType<typeof useStudioPurchaseMutations> {
  return {
    create: vi.fn(create),
    cancel: vi.fn(),
    saveWall: vi.fn(),
    isCreating: false,
    isCancelling: false,
    isSavingWall: false,
  };
}
const mutationsRejecting = (error: Error) =>
  mutationsWith(() => Promise.reject(error));

const onClose = vi.fn();
const onPurchased = vi.fn();

function sheetElement(offer: StudioOfferView) {
  return (
    <TestProviders>
      <StudioBuySheet
        offer={offer}
        onClose={onClose}
        onPurchased={onPurchased}
      />
    </TestProviders>
  );
}
const renderSheet = (offer: StudioOfferView) => render(sheetElement(offer));
const paidButton = () => screen.getByRole("button", { name: "I've paid" });

async function pressPaidAndReadAlert() {
  fireEvent.click(await screen.findByRole("button", { name: "I've paid" }));
  return screen.findByRole("alert");
}

function resetMocks() {
  vi.clearAllMocks();
  mocks.mutations = mutationsWith(() => Promise.resolve(PURCHASE));
  mocks.reference = {
    reference: {
      referenceCode: "QP4M7R",
      referenceToken: "tok-1",
      expiresAt,
    },
    status: "ready",
    error: null,
    requestNew,
  };
}

describe("StudioBuySheet, pay step and wall", () => {
  beforeEach(resetMocks);

  it("lists the artist's ways to pay with copy rows, and one I've paid in the footer", async () => {
    renderSheet(
      offerWith({
        methods: [
          link("https://ko-fi.com/rita"),
          mbway("912345678"),
          iban("PT50000201231234567890154"),
        ],
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Buy Água-forte",
    });
    expect(within(dialog).getByRole("link", { name: /Ko-fi/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(within(dialog).getByText("912 345 678")).toBeInTheDocument();
    expect(
      within(dialog).getByText("PT50 0002 0123 1234 5678 9015 4"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getAllByRole("button", { name: "I've paid" }),
    ).toHaveLength(1);
    expect(
      within(dialog).getByText(
        "You pay Rita Ferreira directly. QueerPulse never handles this money, and any refund is between you and Rita Ferreira",
      ),
    ).toBeInTheDocument();
  });

  it("shows the payment code in the pay step before I've paid, with its copy row and line", async () => {
    renderSheet(offerWith({}));
    const dialog = await screen.findByRole("dialog", {
      name: "Buy Água-forte",
    });
    expect(within(dialog).getByText("QP4M7R")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Copy the reference code" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Add this code to your payment note so Rita Ferreira can find it",
      ),
    ).toBeInTheDocument();
    expect(paidButton()).not.toHaveAttribute("aria-disabled");
    expect(mocks.mutations!.create).not.toHaveBeenCalled();
  });

  it("holds I've paid while the code loads, and offers a new code when it fails", async () => {
    mocks.reference = {
      reference: null,
      status: "loading",
      error: null,
      requestNew,
    };
    const { rerender } = renderSheet(offerWith({}));
    expect(
      await screen.findByText("Getting your payment code"),
    ).toBeInTheDocument();
    expect(paidButton()).toHaveAttribute("aria-disabled", "true");
    expect(paidButton()).toHaveAccessibleDescription(
      "Your payment code is still loading, so I've paid waits for it",
    );
    fireEvent.click(paidButton());
    expect(mocks.mutations!.create).not.toHaveBeenCalled();

    mocks.reference = {
      reference: null,
      status: "failed",
      error: apiError(429, null),
      requestNew,
    };
    rerender(sheetElement(offerWith({})));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /^We couldn't get your payment code\. /,
    );
    expect(paidButton()).toHaveAttribute("aria-disabled", "true");
    expect(paidButton()).toHaveAccessibleDescription(
      "Get a new payment code first",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Get a new payment code" }),
    );
    expect(requestNew).toHaveBeenCalledTimes(1);
  });

  it("names an expired payment code and offers a new one right there", async () => {
    mocks.mutations = mutationsRejecting(
      apiError(400, "studio_purchase_reference_invalid"),
    );
    renderSheet(offerWith({}));
    expect(await pressPaidAndReadAlert()).toHaveTextContent(
      "We couldn't record your payment. This payment code is too old. Get a new code below, and if you already paid with the old one, put the old code in the name field so the artist can match it",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Get a new payment code" }),
    );
    expect(requestNew).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("names a code someone else took and offers a new one right there", async () => {
    mocks.mutations = mutationsRejecting(
      apiError(409, "studio_purchase_reference_taken"),
    );
    renderSheet(offerWith({}));
    expect(await pressPaidAndReadAlert()).toHaveTextContent(
      "We couldn't record your payment. This payment code was just taken by another purchase. Get a new code below",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Get a new payment code" }),
    );
    expect(requestNew).toHaveBeenCalledTimes(1);
  });

  it("keeps the wall off by default and previews identities when turned on", async () => {
    renderSheet(offerWith({}));
    const wallSwitch = await screen.findByRole("switch", {
      name: "Show me on the supporter wall",
    });
    expect(wallSwitch).toHaveAttribute("aria-checked", "false");
    expect(
      screen.queryByRole("radiogroup", { name: "How you appear on the wall" }),
    ).toBeNull();
    fireEvent.click(wallSwitch);
    expect(
      await screen.findByRole("radiogroup", {
        name: "How you appear on the wall",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save how you appear" }),
    ).toBeNull();
  });
});

describe("StudioBuySheet, I've paid", () => {
  beforeEach(resetMocks);

  it("sends the claim with the trimmed payer name and the chosen identity", async () => {
    renderSheet(
      offerWith({ price: { mode: "name_your_price", amountCents: 300 } }),
    );
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Your amount in euros" }),
      { target: { value: "5" } },
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Name on the payment (optional)" }),
      { target: { value: "  R. Ferreira " } },
    );
    fireEvent.click(
      screen.getByRole("switch", { name: "Show me on the supporter wall" }),
    );
    fireEvent.click(
      await screen.findByRole("radio", { name: /Late Bloomers/ }),
    );
    fireEvent.click(paidButton());
    await waitFor(() =>
      expect(mocks.mutations!.create).toHaveBeenCalledWith({
        releaseId: "rel-1",
        amountCents: 500,
        payerName: "R. Ferreira",
        isOnWall: true,
        shownAsSubprofileId: "sp-late-bloomers",
        referenceCode: "QP4M7R",
        referenceToken: "tok-1",
      }),
    );
  });

  it("sends no identity while the wall stays off", async () => {
    renderSheet(offerWith({}));
    fireEvent.click(await screen.findByRole("button", { name: "I've paid" }));
    await waitFor(() =>
      expect(mocks.mutations!.create).toHaveBeenCalledWith({
        releaseId: "rel-1",
        amountCents: 300,
        payerName: null,
        isOnWall: false,
        shownAsSubprofileId: null,
        referenceCode: "QP4M7R",
        referenceToken: "tok-1",
      }),
    );
  });

  it("refuses an amount below the minimum before sending, with the reason", async () => {
    renderSheet(
      offerWith({ price: { mode: "name_your_price", amountCents: 300 } }),
    );
    const input = await screen.findByRole("textbox", {
      name: "Your amount in euros",
    });
    fireEvent.change(input, { target: { value: "2" } });
    expect(await pressPaidAndReadAlert()).toHaveTextContent(
      "We couldn't record your payment. The amount is below the artist's minimum",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveFocus();
    expect(mocks.mutations!.create).not.toHaveBeenCalled();
  });

  it("shows the new price after a price change and names the reason", async () => {
    mocks.mutations = mutationsRejecting(
      apiError(409, "studio_purchase_price_changed", {
        price: { mode: "fixed", amountCents: 400 },
      }),
    );
    renderSheet(offerWith({}));
    expect(await screen.findByText("€3")).toBeInTheDocument();
    expect(await pressPaidAndReadAlert()).toHaveTextContent(
      "We couldn't record your payment. The price changed. Check the new price and try again",
    );
    expect(await screen.findByText("€4")).toBeInTheDocument();
  });

  it("puts a refused I've paid in the pinned footer, above the button and apart from the body", async () => {
    mocks.mutations = mutationsRejecting(
      apiError(409, "studio_purchase_price_changed", {
        price: { mode: "fixed", amountCents: 400 },
      }),
    );
    renderSheet(offerWith({}));
    const alert = await pressPaidAndReadAlert();
    const button = paidButton();
    expect(
      alert.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    let sharedAncestor = button.parentElement;
    while (sharedAncestor !== null && !sharedAncestor.contains(alert)) {
      sharedAncestor = sharedAncestor.parentElement;
    }
    expect(sharedAncestor).not.toBeNull();
    expect(sharedAncestor).not.toContainElement(
      screen.getByRole("textbox", { name: "Name on the payment (optional)" }),
    );
    expect(
      screen.queryByRole("button", { name: "Get a new payment code" }),
    ).toBeNull();
  });

  it("names a pending claim that already exists", async () => {
    mocks.mutations = mutationsRejecting(
      apiError(409, "studio_purchase_pending_exists"),
    );
    renderSheet(offerWith({}));
    expect(await pressPaidAndReadAlert()).toHaveTextContent(
      "We couldn't record your payment. You already told this artist you paid for this; it is waiting for them",
    );
  });

  it("holds Escape and Close while I've paid is in flight, then hands over the purchase", async () => {
    let resolveCreate: (purchase: StudioBuyerPurchaseView) => void = () => {};
    mocks.mutations = mutationsWith(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );
    renderSheet(offerWith({}));
    fireEvent.click(await screen.findByRole("button", { name: "I've paid" }));
    expect(paidButton()).toHaveAttribute("aria-busy", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    // Longer than the dialog's exit fallback, so an honoured close would
    // have reached onClose by now.
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Buy Água-forte" }),
    ).toBeInTheDocument();
    resolveCreate(PURCHASE);
    await waitFor(() => expect(onPurchased).toHaveBeenCalledWith(PURCHASE));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("hands the new purchase to the host on success", async () => {
    renderSheet(offerWith({}));
    fireEvent.click(await screen.findByRole("button", { name: "I've paid" }));
    await waitFor(() => expect(onPurchased).toHaveBeenCalledWith(PURCHASE));
    expect(onClose).not.toHaveBeenCalled();
  });
});
