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
import { awaitCatalog } from "../../test/awaitCatalog";
import { toArtistView, type StudioArtistView } from "./api/studio.adapters";
import {
  toSupporterStateView,
  type StudioSupporterStateView,
} from "./api/studioListening.adapters";
import type { StudioSupporterIdentityDTO } from "./api/studioListening.types";
import type { StudioLoadState } from "./api/studioLoadState";
import type {
  useRemoveStudioSupporter,
  useSaveStudioSupporter,
  useStudioSupporterState,
} from "./api/useStudioSupporter";
import { StudioArtistSupporterCard } from "./StudioArtistSupporterCard";

interface MocksHolder {
  state: ReturnType<typeof useStudioSupporterState> | null;
  save: ReturnType<typeof useSaveStudioSupporter> | null;
  remove: ReturnType<typeof useRemoveStudioSupporter> | null;
  isHistoryOn: boolean;
}

const mocks: MocksHolder = vi.hoisted(() => ({
  state: null,
  save: null,
  remove: null,
  isHistoryOn: true,
}));

vi.mock("./api/useStudioListeningHistorySwitch", () => ({
  useStudioListeningHistorySwitch: () => ({
    isOn: mocks.isHistoryOn,
    isAwaitingRow: false,
    setOn: vi.fn(),
  }),
}));

vi.mock("./api/useStudioSupporter", () => ({
  useStudioSupporterState: () => mocks.state,
  useSaveStudioSupporter: () => mocks.save,
  useRemoveStudioSupporter: () => mocks.remove,
}));

const ACCOUNT: StudioSupporterIdentityDTO = {
  kind: "account",
  member: { slug: "tiago", displayName: "Tiago Costa", avatarUrl: null },
};

function personaIdentity(id: string, name: string): StudioSupporterIdentityDTO {
  return {
    kind: "persona",
    persona: {
      id,
      handle: id,
      name,
      kind: "musician",
      avatarUrl: null,
      isLinkable: true,
    },
  };
}

const OPTIONS = [
  { shownAsSubprofileId: null, identity: ACCOUNT },
  {
    shownAsSubprofileId: "sp-late",
    identity: personaIdentity("sp-late", "Late Bloomers"),
  },
  {
    shownAsSubprofileId: "sp-mariana",
    identity: personaIdentity("sp-mariana", "Mariana Sol"),
  },
];

function loadStateOf(
  overrides: Partial<StudioLoadState> = {},
): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    isTrackWithheld: false,
    reason: "unknown",
    retry: () => undefined,
    ...overrides,
  };
}

function notFoundLoadState(): StudioLoadState {
  return loadStateOf({ isNotFound: true, reason: "notFound" });
}

/** The server keeps the identity while the member is hidden, so `shownAs`
 *  reads the same whether the switch is on or off. */
function stateWith({
  isSupporting,
  shownAsSubprofileId = null,
}: {
  isSupporting: boolean;
  shownAsSubprofileId?: string | null;
}): { state: StudioSupporterStateView; loadState: StudioLoadState } {
  const shownAs =
    OPTIONS.find((option) => option.shownAsSubprofileId === shownAsSubprofileId)
      ?.identity ?? null;
  return {
    state: toSupporterStateView({
      isSupporting,
      shownAsSubprofileId,
      shownAs,
      since: isSupporting ? "2026-10-01T10:00:00.000Z" : null,
      options: OPTIONS,
    }),
    loadState: loadStateOf(),
  };
}

function apiError(status: number, code: string): ApiError {
  return new ApiError(status, code, { statusCode: status, code });
}

function saveResolving(isSaved: boolean, error: unknown = null) {
  return {
    save: vi.fn(() => Promise.resolve(isSaved)),
    isSaving: false,
    error,
  };
}

function artistView({ isOwner = false }: { isOwner?: boolean } = {}) {
  const artist: StudioArtistView = toArtistView({
    artist: {
      id: "sp-nightform",
      handle: "nightform",
      name: "NIGHTFORM",
      kind: "musician",
      avatarUrl: null,
      bio: null,
      city: null,
      coverUrl: null,
      studioHero: null,
    },
    releases: [],
    ownerReleases: isOwner ? [] : null,
    followerCount: 0,
    isFollowing: false,
    playlists: [],
    supportLinks: [],
    upcoming: [],
  });
  return artist;
}

async function renderCard(options: { isOwner?: boolean } = {}) {
  const view = render(
    <TestProviders>
      <StudioArtistSupporterCard artist={artistView(options)} />
    </TestProviders>,
  );
  await awaitCatalog("studio");
  return view;
}

const SWITCH = { name: "Show me among NIGHTFORM's top listeners" };
// The card's own alert. The toast region keeps an empty alert mounted, so a
// page-wide query would find that one first.
const cardRegion = () => screen.getByRole("region", SWITCH);
const findCardAlert = () => within(cardRegion()).findByRole("alert");

beforeEach(() => {
  mocks.isHistoryOn = true;
  mocks.state = stateWith({ isSupporting: true });
  mocks.save = saveResolving(true);
  mocks.remove = {
    remove: vi.fn(() => Promise.resolve(true)),
    isRemoving: false,
    error: null,
  };
});

describe("StudioArtistSupporterCard", () => {
  it("starts with the switch on and the line naming the artist", async () => {
    mocks.state = stateWith({ isSupporting: true });
    await renderCard();
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      screen.getByText(
        "NIGHTFORM sees the name and photo you pick among their top listeners, ranked by how much you played them in the last 28 days. It starts on as your account, and you can turn it off any time",
      ),
    ).toBeInTheDocument();
    const lead = screen.getByText("This is how NIGHTFORM sees you");
    expect(
      within(lead.parentElement as HTMLElement).getByText("Tiago Costa"),
    ).toBeInTheDocument();
  });

  it("turns it back on as the kept identity without opening the picker", async () => {
    mocks.state = stateWith({
      isSupporting: false,
      shownAsSubprofileId: "sp-mariana",
    });
    await renderCard();
    const toggle = screen.getByRole("switch", SWITCH);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(mocks.save?.save).toHaveBeenCalledWith("sp-mariana"),
    );
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(mocks.remove?.remove).not.toHaveBeenCalled();
  });

  it("opens the picker from Change how you appear with a preview per identity and saves the account", async () => {
    mocks.state = stateWith({ isSupporting: true });
    await renderCard();
    fireEvent.click(
      screen.getByRole("button", { name: "Change how you appear" }),
    );
    const group = await screen.findByRole("radiogroup", {
      name: "How NIGHTFORM sees you",
    });
    expect(
      within(group)
        .getAllByRole("radio")
        .map((radio) => radio.textContent),
    ).toEqual([
      expect.stringContaining("Tiago Costa"),
      expect.stringContaining("Late Bloomers"),
      expect.stringContaining("Mariana Sol"),
    ]);
    expect(within(group).queryAllByRole("link")).toEqual([]);
    expect(within(group).getAllByRole("radio")[0]).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(group).getAllByRole("radio")[0]).toHaveFocus();
    fireEvent.click(
      screen.getByRole("button", { name: "Save how you appear" }),
    );
    expect(mocks.save?.save).toHaveBeenCalledWith(null);
  });

  it("closes the picker without saving and leaves the switch on", async () => {
    mocks.state = stateWith({ isSupporting: true });
    await renderCard();
    fireEvent.click(
      screen.getByRole("button", { name: "Change how you appear" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Close without saving" }),
    );
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("switch", SWITCH)).toHaveFocus();
    expect(mocks.save?.save).not.toHaveBeenCalled();
  });

  it("tells a member with paused history that they will not appear", async () => {
    mocks.isHistoryOn = false;
    mocks.state = stateWith({ isSupporting: true });
    await renderCard();
    expect(
      screen.getByText(
        "While your history is paused, you don't appear among their top listeners",
      ),
    ).toBeInTheDocument();
  });

  it("confirms who the artist sees and changes it through the same picker", async () => {
    mocks.state = stateWith({
      isSupporting: true,
      shownAsSubprofileId: "sp-mariana",
    });
    await renderCard();
    const lead = screen.getByText("This is how NIGHTFORM sees you");
    expect(
      within(lead.parentElement as HTMLElement).getByText("Mariana Sol"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Change how you appear" }),
    );
    const radios = within(await screen.findByRole("radiogroup")).getAllByRole(
      "radio",
    );
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
  });

  it("turns it off and says so", async () => {
    mocks.state = stateWith({ isSupporting: true, shownAsSubprofileId: null });
    await renderCard();
    fireEvent.click(screen.getByRole("switch", SWITCH));
    await waitFor(() => expect(mocks.remove?.remove).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(
        "NIGHTFORM no longer sees you among their top listeners",
      ),
    ).toBeInTheDocument();
  });

  it("names a refused identity under the picker", async () => {
    mocks.state = stateWith({ isSupporting: true });
    mocks.save = saveResolving(
      false,
      apiError(403, "studio_supporter_identity_not_yours"),
    );
    await renderCard();
    fireEvent.click(
      screen.getByRole("button", { name: "Change how you appear" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Save how you appear" }),
    );
    expect(await findCardAlert()).toHaveTextContent(
      "You can show yourself only as your account or a persona you are a member of",
    );
  });

  it("names why turning it back on failed and leaves the switch off", async () => {
    mocks.state = stateWith({ isSupporting: false });
    mocks.save = saveResolving(
      false,
      apiError(403, "studio_supporter_identity_not_yours"),
    );
    await renderCard();
    fireEvent.click(screen.getByRole("switch", SWITCH));
    expect(
      await screen.findByText(
        "We couldn't turn on Show me among the top listeners. You can show yourself only as your account or a persona you are a member of",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("says the artist is not available to support with no Retry, and renders nothing for an owner", async () => {
    mocks.state = { state: null, loadState: notFoundLoadState() };
    const { unmount } = await renderCard();
    expect(
      screen.getByText("This artist is not available to show your name to"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).toBeNull();
    unmount();
    await renderCard({ isOwner: true });
    expect(screen.queryByRole("switch")).toBeNull();
  });
});

describe("StudioArtistSupporterCard at its edges", () => {
  it("opens the picker on the current options when the chosen identity can no longer be read", async () => {
    const supporting = stateWith({
      isSupporting: true,
      shownAsSubprofileId: "sp-mariana",
    });
    mocks.state = {
      ...supporting,
      state: supporting.state && { ...supporting.state, shownAs: null },
    };
    await renderCard();
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "true",
    );
    const group = await screen.findByRole("radiogroup", {
      name: "How NIGHTFORM sees you",
    });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(screen.queryByText(/This is how NIGHTFORM sees you/)).toBeNull();
    // Opened by the card on load: focus stays where the page put it.
    expect(document.activeElement?.getAttribute("role")).not.toBe("radio");
  });

  it("shows the identity the artist sees without a link when it cannot be linked", async () => {
    const unlinkablePersona: StudioSupporterIdentityDTO = {
      kind: "persona",
      persona: {
        id: "sp-mariana",
        handle: "mariana-sol",
        name: "Mariana Sol",
        kind: "musician",
        avatarUrl: null,
        isLinkable: false,
      },
    };
    const accountWithoutProfile: StudioSupporterIdentityDTO = {
      kind: "account",
      member: { slug: "", displayName: "Tiago Costa", avatarUrl: null },
    };
    const cases = [
      { shownAsSubprofileId: "sp-mariana", shownAs: unlinkablePersona },
      { shownAsSubprofileId: null, shownAs: accountWithoutProfile },
    ];
    for (const { shownAsSubprofileId, shownAs } of cases) {
      mocks.state = {
        state: toSupporterStateView({
          isSupporting: true,
          shownAsSubprofileId,
          shownAs,
          since: "2026-10-01T10:00:00.000Z",
          options: [
            { shownAsSubprofileId: null, identity: accountWithoutProfile },
            { shownAsSubprofileId: "sp-mariana", identity: unlinkablePersona },
          ],
        }),
        loadState: loadStateOf(),
      };
      const { unmount } = await renderCard();
      const name =
        shownAs.kind === "account"
          ? shownAs.member.displayName
          : shownAs.persona.name;
      const lead = screen.getByText("This is how NIGHTFORM sees you");
      expect(
        within(lead.parentElement as HTMLElement).getByText(name),
      ).toBeInTheDocument();
      expect(screen.queryAllByRole("link")).toEqual([]);
      unmount();
    }
  });

  it("opens the picker when the kept identity is no longer the member's", async () => {
    const hidden = stateWith({ isSupporting: false });
    mocks.state = {
      ...hidden,
      state: hidden.state && {
        ...hidden.state,
        shownAsSubprofileId: "sp-gone",
        shownAs: null,
      },
    };
    await renderCard();
    fireEvent.click(screen.getByRole("switch", SWITCH));
    const group = await screen.findByRole("radiogroup", {
      name: "How NIGHTFORM sees you",
    });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("switch", SWITCH)).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(mocks.save?.save).not.toHaveBeenCalled();
  });

  it("moves focus to the card heading when turning it on finds the artist gone", async () => {
    mocks.state = stateWith({ isSupporting: false });
    mocks.save = {
      save: vi.fn(() => {
        mocks.state = { state: null, loadState: notFoundLoadState() };
        return Promise.resolve(false);
      }),
      isSaving: false,
      error: apiError(404, "studio_supporter_artist_not_found"),
    };
    await renderCard();
    fireEvent.click(screen.getByRole("switch", SWITCH));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: "Show me among NIGHTFORM's top listeners",
        }),
      ).toHaveFocus(),
    );
    expect(
      screen.getByText("This artist is not available to show your name to"),
    ).toBeInTheDocument();
  });

  it("drops a refused save once the switch is turned off", async () => {
    mocks.state = stateWith({
      isSupporting: true,
      shownAsSubprofileId: "sp-mariana",
    });
    mocks.save = saveResolving(
      false,
      apiError(403, "studio_supporter_identity_not_yours"),
    );
    await renderCard();
    fireEvent.click(
      screen.getByRole("button", { name: "Change how you appear" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Save how you appear" }),
    );
    expect(await findCardAlert()).toHaveTextContent(
      "You can show yourself only as your account",
    );
    fireEvent.click(screen.getByRole("switch", SWITCH));
    await waitFor(() => expect(mocks.remove?.remove).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(within(cardRegion()).queryByRole("alert")).toBeNull(),
    );
    expect(
      await screen.findByText(
        "NIGHTFORM no longer sees you among their top listeners",
      ),
    ).toBeInTheDocument();
  });
});
