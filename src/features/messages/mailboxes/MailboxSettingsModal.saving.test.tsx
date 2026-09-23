import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { API } from "../../../test/msw/handlers";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import type { MailboxAttribution } from "../api/mailboxes.api";

const apiMocks = vi.hoisted(() => ({
  getMailboxAttribution: vi.fn(),
  setMailboxStaffNames: vi.fn(),
  setMyStaffNaming: vi.fn(),
}));

vi.mock("../api/mailboxes.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/mailboxes.api")>()),
  ...apiMocks,
}));

const cafe: MailboxSummary = {
  identityId: "5f0c2a4e-1d7b-4c1e-9a52-0b6f3f1c2a02",
  kind: "listing",
  displayName: "Café Lisboa",
  handle: "cafe-lisboa",
  avatarUrl: null,
  unreadCount: 0,
  isOwner: true,
  isReadOnly: false,
  shouldShowStaffNames: true,
  shouldAllowMyName: true,
};

const serverAttribution: MailboxAttribution = {
  shouldShowStaffNames: true,
  shouldAllowMyName: true,
  isOwner: true,
};

beforeEach(() => {
  apiMocks.getMailboxAttribution.mockReset();
  apiMocks.setMailboxStaffNames.mockReset();
  apiMocks.setMyStaffNaming.mockReset();
  apiMocks.getMailboxAttribution.mockResolvedValue(serverAttribution);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Live mode: re-import every module that reads `VITE_API_URL`, so the
 *  modal's hook sees the stubbed mode. */
async function renderLiveModal() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { MailboxSettingsModal } = await import("./MailboxSettingsModal");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const { ToastProvider } =
    await import("../../../shared/components/feedback/ToastProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>
          <ToastProvider>{children}</ToastProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  render(<MailboxSettingsModal mailbox={cafe} onClose={() => {}} />, {
    wrapper,
  });
}

describe("MailboxSettingsModal while a change saves (live)", () => {
  it("holds the pressed switch still until its write settles, and leaves the other one free", async () => {
    let finishWrite: (value: MailboxAttribution) => void = () => {};
    apiMocks.setMailboxStaffNames.mockReturnValue(
      new Promise<MailboxAttribution>((resolve) => {
        finishWrite = resolve;
      }),
    );
    await renderLiveModal();
    const ownerSwitch = await screen.findByRole("switch", {
      name: "Show who replied",
    });
    const myNameSwitch = screen.getByRole("switch", {
      name: "Include my first name",
    });
    ownerSwitch.focus();
    fireEvent.click(ownerSwitch);
    await waitFor(() =>
      expect(ownerSwitch.closest("fieldset")).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );
    expect(ownerSwitch).toHaveAttribute("aria-checked", "false");
    expect(ownerSwitch).toHaveFocus();
    expect(myNameSwitch.closest("fieldset")).not.toHaveAttribute("aria-busy");

    // A second press while the first write is in flight sends nothing.
    fireEvent.click(ownerSwitch);
    expect(apiMocks.setMailboxStaffNames).toHaveBeenCalledTimes(1);
    expect(ownerSwitch).toHaveAttribute("aria-checked", "false");

    finishWrite({ ...serverAttribution, shouldShowStaffNames: false });
    await waitFor(() =>
      expect(ownerSwitch.closest("fieldset")).not.toHaveAttribute("aria-busy"),
    );
    expect(ownerSwitch).toHaveAttribute("aria-checked", "false");
  });
});
