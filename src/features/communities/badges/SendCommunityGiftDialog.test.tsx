import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimatePresence } from "motion/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { currentUserSlug } from "../../members/data/members";
import { SendCommunityGiftDialog } from "./SendCommunityGiftDialog";
import { sendCommunityGift } from "./api/communityBadges.api";
import {
  demoMemberGifts,
  demoSendGift,
  resetCommunityBadgesDemo,
  type CommunityBadgesDemoViewer,
} from "./communityBadgesDemoStore";
import { giftNoteLength } from "./sendCommunityGift.model";

const mocks = vi.hoisted(() => ({
  sendCommunityGift: vi.fn(),
  getCommunityGiftAllowance: vi.fn(),
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("./api/communityBadges.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  sendCommunityGift: mocks.sendCommunityGift,
  getCommunityGiftAllowance: mocks.getCommunityGiftAllowance,
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      const overrideMode = mocks.demoOverride.demoMode;
      return overrideMode === null
        ? value
        : { ...value, demoMode: overrideMode };
    },
  };
});

const RUNNERS = "queer-runners";
const recipient = { slug: "sofia", name: "Sofia" };
const demoMod: CommunityBadgesDemoViewer = {
  viewerSlug: currentUserSlug,
  role: "mod",
  isMember: true,
  isSpace: false,
};

beforeEach(() => {
  mocks.sendCommunityGift.mockReset();
  mocks.getCommunityGiftAllowance.mockReset();
  mocks.demoOverride.demoMode = true;
  resetCommunityBadgesDemo();
  queryClient.clear();
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function dialogTree(
  recipientOfDialog: { slug: string; name: string },
  onClose: () => void,
) {
  return (
    <TestProviders queryClient={queryClient}>
      <MotionProvider>
        <AnimatePresence>
          <SendCommunityGiftDialog
            slug={RUNNERS}
            recipient={recipientOfDialog}
            onClose={onClose}
          />
        </AnimatePresence>
      </MotionProvider>
    </TestProviders>
  );
}

async function renderDialog(onClose: () => void = () => {}) {
  const view = render(dialogTree(recipient, onClose));
  await awaitCatalog("communities");
  return {
    showRecipient: (nextRecipient: { slug: string; name: string }) =>
      view.rerender(dialogTree(nextRecipient, onClose)),
  };
}

function sendButton(): HTMLElement {
  return screen.getByRole("button", { name: "Send gift" });
}

describe("SendCommunityGiftDialog", () => {
  it("shows the remaining allowance", async () => {
    await renderDialog();

    expect(
      await screen.findByText("You can send 8 more gifts this week."),
    ).toBeInTheDocument();
  });

  it("holds Send until a gift is picked", async () => {
    const user = userEvent.setup();
    await renderDialog();
    await screen.findByText("You can send 8 more gifts this week.");

    expect(sendButton()).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Star" }));
    expect(sendButton()).toBeEnabled();
  });

  it("sends the picked gift with its note and closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    await renderDialog(onClose);
    await screen.findByText("You can send 8 more gifts this week.");

    await user.click(screen.getByRole("radio", { name: "Star" }));
    await user.type(screen.getByRole("textbox"), "Thank you for Saturday");
    await user.click(sendButton());

    await waitFor(() => {
      const toastRegions = screen.getAllByRole("status");
      expect(
        toastRegions.some(
          (region) => within(region).queryByText(/Gift sent to Sofia/) !== null,
        ),
      ).toBe(true);
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const received = demoMemberGifts(RUNNERS, demoMod, "sofia").gifts;
    expect(received.some((gift) => gift.giftKey === "star")).toBe(true);
  });

  it("names the reset date and holds Send at the weekly limit", async () => {
    for (let sentCount = 0; sentCount < 8; sentCount += 1) {
      demoSendGift(RUNNERS, demoMod, {
        recipientSlug: "sofia",
        giftKey: "heart",
      });
    }
    await renderDialog();

    const usedLine = await screen.findByText(
      /You've sent 10 gifts here this week\. You can send the next one on .+\./,
    );
    expect(usedLine.textContent).not.toContain("{date}");
    expect(usedLine.textContent).not.toMatch(/\b0\d:\d{2}/);
    await waitFor(() =>
      expect(screen.queryByRole("radio", { name: "Star" })).toBeNull(),
    );
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(sendButton()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("asks for a gift until one is picked", async () => {
    const user = userEvent.setup();
    await renderDialog();
    await screen.findByText("You can send 8 more gifts this week.");

    expect(screen.getByText("Pick a gift to send.")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Star" }));
    await waitFor(() =>
      expect(screen.queryByText("Pick a gift to send.")).toBeNull(),
    );
  });

  it("keeps the dialog open with the refusal line", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getCommunityGiftAllowance.mockResolvedValue({
      limit: 10,
      used: 2,
      remaining: 8,
      resetsAt: null,
    });
    mocks.sendCommunityGift.mockRejectedValue(
      new ApiError(400, "x", { code: "gift_recipient_not_member" }),
    );
    const user = userEvent.setup();
    const onClose = vi.fn();
    await renderDialog(onClose);
    await screen.findByText("You can send 8 more gifts this week.");

    await user.click(screen.getByRole("radio", { name: "Star" }));
    await user.click(sendButton());

    const refusal = await within(screen.getByRole("dialog")).findByRole(
      "alert",
    );
    expect(refusal.textContent).not.toBe("");
    expect(sendCommunityGift).toHaveBeenCalledWith(RUNNERS, {
      recipientSlug: "sofia",
      giftKey: "star",
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(sendButton()).toBeInTheDocument();
  });

  it("starts empty again when the dialog is reopened for another member", async () => {
    const user = userEvent.setup();
    const { showRecipient } = await renderDialog();
    await screen.findByText("You can send 8 more gifts this week.");
    await user.click(screen.getByRole("radio", { name: "Star" }));
    await user.type(screen.getByRole("textbox"), "For Sofia only");

    showRecipient({ slug: "monica", name: "Monica" });

    expect(
      await screen.findByText("Send a gift to Monica"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(sendButton()).toBeDisabled();
  });

  it("sends once when Send is clicked twice in one tick", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getCommunityGiftAllowance.mockResolvedValue({
      limit: 10,
      used: 2,
      remaining: 8,
      resetsAt: null,
    });
    mocks.sendCommunityGift.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    await renderDialog();
    await screen.findByText("You can send 8 more gifts this week.");
    await user.click(screen.getByRole("radio", { name: "Star" }));

    const button = sendButton();
    await act(async () => {
      button.click();
      button.click();
      await Promise.resolve();
    });

    expect(sendCommunityGift).toHaveBeenCalledTimes(1);
  });

  it("re-reads the allowance when the weekly cap was reached", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getCommunityGiftAllowance
      .mockResolvedValueOnce({
        limit: 10,
        used: 9,
        remaining: 1,
        resetsAt: null,
      })
      .mockResolvedValue({
        limit: 10,
        used: 10,
        remaining: 0,
        resetsAt: "2026-12-01T10:00:00.000Z",
      });
    mocks.sendCommunityGift.mockRejectedValue(
      new ApiError(429, "x", {
        code: "gift_weekly_limit_reached",
        limit: 10,
        resetsAt: "2026-12-01T10:00:00.000Z",
      }),
    );
    const user = userEvent.setup();
    await renderDialog();
    await screen.findByText("You can send 1 more gift this week.");

    await user.click(screen.getByRole("radio", { name: "Star" }));
    await user.click(sendButton());

    expect(
      await screen.findByText(/You've sent 10 gifts here this week/),
    ).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });

  it("keeps Cancel waiting while a send is in flight", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getCommunityGiftAllowance.mockResolvedValue({
      limit: 10,
      used: 2,
      remaining: 8,
      resetsAt: null,
    });
    mocks.sendCommunityGift.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    const onClose = vi.fn();
    await renderDialog(onClose);
    await screen.findByText("You can send 8 more gifts this week.");
    await user.click(screen.getByRole("radio", { name: "Star" }));
    await user.click(sendButton());

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("counts an emoji as one character in the note", () => {
    expect(giftNoteLength(`${String.fromCodePoint(0x1f389)} hi`)).toBe(4);
  });
});
