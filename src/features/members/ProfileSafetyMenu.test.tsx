import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
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

beforeEach(() => {
  toastSpy.mockClear();
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
