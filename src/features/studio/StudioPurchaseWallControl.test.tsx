import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { tintForId } from "./api/studio.adapters";
import type { StudioSupporterIdentityView } from "./api/studioListening.adapters";
import type { StudioLoadState } from "./api/studioLoadState";
import type {
  StudioBuyerPurchaseView,
  StudioPurchaseWallStateView,
} from "./api/studioPurchases.adapters";
import type { StudioPurchaseStatusValue } from "./api/studioPurchases.types";
import type { useStudioPurchaseWall } from "./api/useStudioPurchaseLists";
import type { useStudioPurchaseMutations } from "./api/useStudioPurchaseMutations";
import { StudioPurchaseWallControl } from "./StudioPurchaseWallControl";

const mocks: {
  wall: ReturnType<typeof useStudioPurchaseWall> | null;
  mutations: ReturnType<typeof useStudioPurchaseMutations> | null;
} = vi.hoisted(() => ({ wall: null, mutations: null }));

vi.mock("./api/useStudioPurchaseLists", () => ({
  useStudioPurchaseWall: () => mocks.wall,
}));
vi.mock("./api/useStudioPurchaseMutations", () => ({
  useStudioPurchaseMutations: () => mocks.mutations,
}));

function identity(
  key: string,
  name: string,
  kind: "account" | "persona",
): StudioSupporterIdentityView {
  return {
    kind,
    key,
    name,
    avatarUrl: null,
    initials: name.slice(0, 2),
    tint: tintForId(key),
    href: null,
  };
}

const ACCOUNT = identity("account", "Tiago Costa", "account");
const LATE_BLOOMERS = identity("sp-late", "Late Bloomers", "persona");

const WALL_STATE: StudioPurchaseWallStateView = {
  isOnWall: true,
  shownAsSubprofileId: "sp-late",
  shownAs: LATE_BLOOMERS,
  needsNewIdentity: false,
  options: [
    { shownAsSubprofileId: null, identity: ACCOUNT },
    { shownAsSubprofileId: "sp-late", identity: LATE_BLOOMERS },
  ],
};

function loadStateOf(): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    isTrackWithheld: false,
    reason: "unknown",
    retry: () => undefined,
  };
}

function purchaseWith({
  status = "confirmed",
  artistSubprofileId = "sp-lua",
  wall,
}: {
  status?: StudioPurchaseStatusValue;
  artistSubprofileId?: string | null;
  wall: StudioBuyerPurchaseView["wall"];
}): StudioBuyerPurchaseView {
  return {
    id: "p1",
    status,
    item: {
      kind: "release",
      title: "Cidade dos santos",
      releaseId: "rel-1",
      trackId: null,
      formatLabelKey: "studio:purchase.format.album",
      coverUrl: null,
      href: "/studio/releases/rel-1",
      isAvailable: true,
    },
    artist: {
      name: "Lua Cardoso",
      href: null,
      subprofileId: artistSubprofileId,
    },
    amountCents: 800,
    referenceCode: "K7M2QX",
    payerName: null,
    declineReason: null,
    declineNote: null,
    createdAt: new Date("2026-10-20T10:00:00.000Z"),
    decidedAt: null,
    wall,
    downloads: [],
  };
}

const ON_WALL = {
  isOnWall: true,
  shownAs: LATE_BLOOMERS,
  needsNewIdentity: false,
};

function renderControl(purchase: StudioBuyerPurchaseView) {
  return render(
    <TestProviders>
      <StudioPurchaseWallControl purchase={purchase} />
    </TestProviders>,
  );
}

function mutationsSaving(
  saveWall: ReturnType<typeof useStudioPurchaseMutations>["saveWall"],
): ReturnType<typeof useStudioPurchaseMutations> {
  return {
    create: vi.fn(),
    cancel: vi.fn(),
    saveWall,
    isCreating: false,
    isCancelling: false,
    isSavingWall: false,
  };
}

const SWITCH = { name: "Show me on the supporter wall" };

beforeEach(() => {
  mocks.wall = { wall: WALL_STATE, loadState: loadStateOf() };
  mocks.mutations = mutationsSaving(
    vi.fn(() =>
      Promise.resolve({
        ...WALL_STATE,
        shownAsSubprofileId: null,
        shownAs: ACCOUNT,
      }),
    ),
  );
});

describe("StudioPurchaseWallControl", () => {
  it("shows the switch on with the chosen identity, and saves a new one", async () => {
    renderControl(purchaseWith({ wall: ON_WALL }));
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("Shown as Late Bloomers")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Change how you appear" }),
    );
    const group = await screen.findByRole("radiogroup", {
      name: "How you appear on the wall",
    });
    fireEvent.click(
      Array.from(group.querySelectorAll('[role="radio"]')).find((radio) =>
        radio.textContent?.includes("Tiago Costa"),
      )!,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save how you appear" }),
    );
    await waitFor(() =>
      expect(mocks.mutations!.saveWall).toHaveBeenCalledWith("p1", "rel-1", {
        isOnWall: true,
        shownAsSubprofileId: null,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "You are on the supporter wall as Tiago Costa",
    );
  });

  it("turns the spot off and says so", async () => {
    mocks.mutations = mutationsSaving(
      vi.fn(() => Promise.resolve({ ...WALL_STATE, isOnWall: false })),
    );
    renderControl(purchaseWith({ wall: ON_WALL }));
    fireEvent.click(screen.getByRole("switch", SWITCH));
    await waitFor(() =>
      expect(mocks.mutations!.saveWall).toHaveBeenCalledWith("p1", "rel-1", {
        isOnWall: false,
        shownAsSubprofileId: "sp-late",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "You are off the supporter wall",
    );
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("asks to pick again when the chosen persona is gone, with no card preselected", async () => {
    mocks.wall = {
      wall: {
        ...WALL_STATE,
        shownAsSubprofileId: null,
        shownAs: null,
        needsNewIdentity: true,
      },
      loadState: loadStateOf(),
    };
    renderControl(
      purchaseWith({
        wall: { isOnWall: true, shownAs: null, needsNewIdentity: true },
      }),
    );
    expect(
      screen.getByText("The persona you picked is gone. Pick how you appear"),
    ).toBeInTheDocument();
    const group = await screen.findByRole("radiogroup", {
      name: "How you appear on the wall",
    });
    const radios = Array.from(group.querySelectorAll('[role="radio"]'));
    expect(radios.length).toBeGreaterThan(0);
    for (const radio of radios)
      expect(radio).toHaveAttribute("aria-checked", "false");
    const saveButton = screen.getByRole("button", {
      name: "Save how you appear",
    });
    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(saveButton);
    expect(mocks.mutations!.saveWall).not.toHaveBeenCalled();
  });

  it("opens the picker from a spot that is off with no identity, then saves it on", async () => {
    renderControl(
      purchaseWith({
        wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
      }),
    );
    fireEvent.click(screen.getByRole("switch", SWITCH));
    const group = await screen.findByRole("radiogroup", {
      name: "How you appear on the wall",
    });
    fireEvent.click(
      Array.from(group.querySelectorAll('[role="radio"]')).find((radio) =>
        radio.textContent?.includes("Late Bloomers"),
      )!,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save how you appear" }),
    );
    await waitFor(() =>
      expect(mocks.mutations!.saveWall).toHaveBeenCalledWith("p1", "rel-1", {
        isOnWall: true,
        shownAsSubprofileId: "sp-late",
      }),
    );
  });

  it("tells a pending buyer when they will appear", () => {
    renderControl(purchaseWith({ status: "pending", wall: ON_WALL }));
    expect(
      screen.getByText("You appear once Lua Cardoso confirms your payment"),
    ).toBeInTheDocument();
  });

  it("renders nothing for a declined purchase or an artist no longer on Studio", () => {
    const declined = renderControl(
      purchaseWith({ status: "declined", wall: ON_WALL }),
    );
    expect(declined.container).toBeEmptyDOMElement();
    declined.unmount();
    const unlinked = renderControl(
      purchaseWith({ artistSubprofileId: null, wall: ON_WALL }),
    );
    expect(unlinked.container).toBeEmptyDOMElement();
  });

  it("names a refused save", async () => {
    mocks.mutations = mutationsSaving(
      vi.fn(() =>
        Promise.reject(
          new ApiError(409, "studio_purchase_wall_not_available", {
            statusCode: 409,
            code: "studio_purchase_wall_not_available",
          }),
        ),
      ),
    );
    renderControl(purchaseWith({ wall: ON_WALL }));
    fireEvent.click(screen.getByRole("switch", SWITCH));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't change your spot on the supporter wall. The supporter wall is open to pending and confirmed purchases of an artist still on Studio",
    );
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
