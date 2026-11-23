import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { ApiError } from "../../shared/api/client";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";

const toastSpy = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: toastSpy }),
}));

// Keys back as their own text so assertions don't depend on the catalogs
// (this task's new keys are staged in the T5 keys file, merged separately).
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    translateIn: () => undefined,
  }),
}));

vi.mock("../../app/providers/useSocial", () => ({
  useSocial: () => ({
    isBlocked: () => false,
    isMuted: () => false,
    toggleBlock: vi.fn(),
    toggleMute: vi.fn(),
  }),
}));

/** The per-call callbacks the menu item hands `useHideFrom().mutate`. */
interface HideFromCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/** What the stubbed hide-from mutation records, so a test can settle it. */
interface HideFromMockState {
  mutate: Mock<(slug: string, callbacks?: HideFromCallbacks) => void>;
  isPending: boolean;
}

const hideFromMock = vi.hoisted<HideFromMockState>(() => ({
  mutate: vi.fn<(slug: string, callbacks?: HideFromCallbacks) => void>(),
  isPending: false,
}));

const unhideFromMock = vi.hoisted<HideFromMockState>(() => ({
  mutate: vi.fn<(slug: string, callbacks?: HideFromCallbacks) => void>(),
  isPending: false,
}));

/** The slugs the stubbed `GET /profiles/me/hidden-from` answers with. */
interface HiddenFromListMockState {
  data: { slug: string; firstName: string; lastName: string }[];
}

const hiddenFromListMock = vi.hoisted<HiddenFromListMockState>(() => ({
  data: [],
}));

vi.mock("./api/useHiddenFrom", () => ({
  useHideFrom: () => hideFromMock,
  useUnhideFrom: () => unhideFromMock,
  useHiddenFromList: () => hiddenFromListMock,
}));

/** Which mode the stubbed `useDemoMode` reports. */
interface DemoModeMockState {
  demoMode: boolean;
}

const demoModeMock = vi.hoisted<DemoModeMockState>(() => ({
  demoMode: false,
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => demoModeMock,
}));

beforeEach(() => {
  toastSpy.mockClear();
  hideFromMock.mutate.mockReset();
  unhideFromMock.mutate.mockReset();
  hiddenFromListMock.data = [];
  demoModeMock.demoMode = false;
});

// PRD-424: withdrawing a vouch used to toast success on the click, before the
// unvouch request had settled. The menu must wait for the caller's
// `onSettled(didSucceed)` before it tells the member anything, the same
// contract `toggleBlock`/`toggleMute` already use.
describe("ProfileSafetyMenu withdraw vouch", () => {
  async function openConfirm(
    onWithdrawVouch: (onSettled: (didSucceed: boolean) => void) => void,
  ) {
    const user = userEvent.setup();
    render(
      <ProfileSafetyMenu
        slug="ana-lopes"
        firstName="Ana"
        onWithdrawVouch={onWithdrawVouch}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: /safety:profileMenu.ariaLabel/ }),
    );
    await user.click(
      screen.getByRole("menuitem", {
        name: /members:profile.hero.withdrawVouchCta/,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "safety:profileMenu.withdrawVouchConfirmCta",
      }),
    );
    return user;
  }

  it("waits for the server to confirm before it toasts success", async () => {
    let capturedOnSettled: ((didSucceed: boolean) => void) | undefined;
    await openConfirm((onSettled) => {
      capturedOnSettled = onSettled;
    });

    expect(toastSpy).not.toHaveBeenCalled();
    expect(capturedOnSettled).toBeInstanceOf(Function);

    act(() => capturedOnSettled?.(true));

    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(expect.any(String), "success");
  });

  it("toasts an error when the withdrawal fails", async () => {
    let capturedOnSettled: ((didSucceed: boolean) => void) | undefined;
    await openConfirm((onSettled) => {
      capturedOnSettled = onSettled;
    });

    act(() => capturedOnSettled?.(false));

    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(expect.any(String), "error");
  });
});

describe("ProfileSafetyMenu hide my profile", () => {
  async function pickHideFrom() {
    const user = userEvent.setup();
    render(<ProfileSafetyMenu slug="ana-lopes" firstName="Ana" />);
    await user.click(
      screen.getByRole("button", { name: /safety:profileMenu.ariaLabel/ }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: /safety:profileMenu.hideFrom/ }),
    );
  }

  it("hides the profile from this member and toasts once the server agrees", async () => {
    await pickHideFrom();

    expect(hideFromMock.mutate).toHaveBeenCalledTimes(1);
    const [slug, callbacks] = hideFromMock.mutate.mock.calls[0] ?? [];
    expect(slug).toBe("ana-lopes");
    expect(toastSpy).not.toHaveBeenCalled();

    act(() => {
      callbacks?.onSuccess?.();
    });

    expect(toastSpy).toHaveBeenCalledWith(
      "safety:profileMenu.hiddenFromToast",
      "success",
    );
  });

  it("names the cause when the server refuses", async () => {
    await pickHideFrom();
    const [, callbacks] = hideFromMock.mutate.mock.calls[0] ?? [];

    act(() => {
      callbacks?.onError?.(new ApiError(404, "Member not found"));
    });

    expect(toastSpy).toHaveBeenCalledWith(
      "members:profile.whoSeesWhat.hiddenFrom.error.notFound",
      "error",
    );
  });

  it("closes the menu once the item is picked", async () => {
    await pickHideFrom();

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("says the hide resets on reload in demo mode", async () => {
    demoModeMock.demoMode = true;
    await pickHideFrom();
    const [, callbacks] = hideFromMock.mutate.mock.calls[0] ?? [];

    act(() => {
      callbacks?.onSuccess?.();
    });

    expect(toastSpy).toHaveBeenCalledWith(
      "safety:profileMenu.hiddenFromDemoToast",
      "success",
    );
  });

  it("offers to show the profile again once it is hidden from this member", async () => {
    hiddenFromListMock.data = [
      { slug: "ana-lopes", firstName: "Ana", lastName: "Lopes" },
    ];
    const user = userEvent.setup();
    render(<ProfileSafetyMenu slug="ana-lopes" firstName="Ana" />);
    await user.click(
      screen.getByRole("button", { name: /safety:profileMenu.ariaLabel/ }),
    );
    expect(
      screen.queryByRole("menuitem", { name: /safety:profileMenu.hideFrom/ }),
    ).toBeNull();
    await user.click(
      screen.getByRole("menuitem", { name: /safety:profileMenu.showTo/ }),
    );

    expect(unhideFromMock.mutate).toHaveBeenCalledTimes(1);
    const [slug, callbacks] = unhideFromMock.mutate.mock.calls[0] ?? [];
    expect(slug).toBe("ana-lopes");

    act(() => {
      callbacks?.onSuccess?.();
    });

    expect(toastSpy).toHaveBeenCalledWith(
      "safety:profileMenu.shownToToast",
      "success",
    );
  });
});
