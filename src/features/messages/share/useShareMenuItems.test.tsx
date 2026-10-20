import type { ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../../app/providers/authContext";
import { TestProviders } from "../../../test/TestProviders";
import type { Membership } from "../../communities/membership.types";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import type { StudioShareRules } from "../../studio/share/useStudioShareRules";
import { ShareMenu } from "./ShareMenu";
import type { ShareContent } from "./shareMenu.types";
import { useShareMenuItems } from "./useShareMenuItems";
import { useShareToChat } from "./useShareToChat";
import { useShareToCommunityPicker } from "./useShareToCommunityPicker";

const rulesFor = vi.fn<(target: unknown) => StudioShareRules>();
vi.mock("../../studio/share/useStudioShareRules", () => ({
  useStudioShareRules: (target: unknown) => rulesFor(target),
}));

const membershipsFor = vi.fn<() => Record<string, Membership>>();
vi.mock("../../communities/api/useMyCommunities", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../communities/api/useMyCommunities")
  >()),
  useMyCommunities: () => membershipsFor(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

const PLAYLIST_ID = "9b2f6c1e-4a7d-4e3b-8c5a-0d1e2f3a4b5c";
const studioContent: ShareContent = {
  path: `/studio/collection?id=${PLAYLIST_ID}`,
  title: "For the group chat",
  kind: "studio",
  text: "For the group chat",
};

function useItemKeys(content: ShareContent, shouldOfferSendInMessage = true) {
  const shareToChat = useShareToChat();
  const shareToCommunity = useShareToCommunityPicker(content);
  return useShareMenuItems(content, shareToChat, {
    shouldOfferSendInMessage,
    shareToCommunity,
  }).map((item) => item.key);
}

beforeEach(() => {
  rulesFor.mockReset();
  rulesFor.mockReturnValue({ canSendToOthers: true, ownPersonaName: null });
  membershipsFor.mockReset();
  membershipsFor.mockReturnValue({
    "trans-hub": { role: "member", joinedAt: "Jan 2025" },
  });
});

// A signed-out case writes the demo session flag; the next test signs in.
afterEach(() => window.localStorage.removeItem(AUTH_STORAGE_KEY));

describe("Share to a community in the share menu", () => {
  it("offers it for a Studio link the viewer may pass on", () => {
    const { result } = renderHook(() => useItemKeys(studioContent), {
      wrapper,
    });
    expect(result.current).toContain("community");
    expect(rulesFor).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "playlist", id: PLAYLIST_ID }),
    );
  });

  it("hides it from the owner of a persona-credited Connections-only playlist and keeps Copy link", () => {
    rulesFor.mockReturnValue({ canSendToOthers: false, ownPersonaName: null });
    const { result } = renderHook(() => useItemKeys(studioContent), {
      wrapper,
    });
    expect(result.current).not.toContain("community");
    expect(result.current).toContain("copyLink");
  });

  it("hides it when the caller leaves Send in a message out", () => {
    const { result } = renderHook(() => useItemKeys(studioContent, false), {
      wrapper,
    });
    expect(result.current).not.toContain("community");
    expect(result.current).not.toContain("message");
    expect(result.current).toContain("copyLink");
  });

  it("hides it from a member who belongs to no community yet", () => {
    membershipsFor.mockReturnValue({});
    const { result } = renderHook(() => useItemKeys(studioContent), {
      wrapper,
    });
    expect(result.current).not.toContain("community");
    expect(result.current).toContain("copyLink");
  });

  it("hides it once the viewer signs out", async () => {
    const { result } = renderHook(
      () => ({ auth: useAuth(), keys: useItemKeys(studioContent) }),
      { wrapper },
    );
    expect(result.current.keys).toContain("community");
    act(() => result.current.auth.signOut());
    await waitFor(() => expect(result.current.keys).not.toContain("community"));
    expect(result.current.keys).toContain("copyLink");
  });

  it("never offers it for other kinds and asks the rules about nothing", () => {
    const { result } = renderHook(
      () =>
        useItemKeys({
          path: "/gatherings/queer-book-club",
          title: "Queer Book Club",
          kind: "gathering",
          text: "",
        }),
      { wrapper },
    );
    expect(result.current).not.toContain("community");
    expect(rulesFor).toHaveBeenCalledWith(null);
  });
});

describe("ShareMenu's community modal", () => {
  it("shows the owner-persona line when the viewer runs the persona", async () => {
    rulesFor.mockReturnValue({
      canSendToOthers: true,
      ownPersonaName: "Mariana Sol",
    });
    render(
      <TestProviders>
        <ShareMenu content={studioContent} />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Share to a community" }),
    );
    expect(
      await screen.findByText(
        "Posting this from your account shows everyone in that community that you run Mariana Sol",
        undefined,
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
  });
});
