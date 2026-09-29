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
 *  panel's hook sees the stubbed mode. */
async function renderLivePanel(mailbox: MailboxSummary = cafe) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { MailboxSettingsPanel } = await import("./MailboxSettingsPanel");
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
  render(<MailboxSettingsPanel mailbox={mailbox} />, {
    wrapper,
  });
}

describe("MailboxSettingsPanel while a change saves (live)", () => {
  it("holds the pressed switch still until its write settles, and leaves the other one free", async () => {
    let finishWrite: (value: MailboxAttribution) => void = () => {};
    apiMocks.setMailboxStaffNames.mockReturnValue(
      new Promise<MailboxAttribution>((resolve) => {
        finishWrite = resolve;
      }),
    );
    await renderLivePanel();
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

describe("MailboxSettingsPanel who may change the switch (live)", () => {
  it("lets a co-manager of a listing with no owner change it, with no owner-only note (PRD-432)", async () => {
    apiMocks.getMailboxAttribution.mockResolvedValue({
      ...serverAttribution,
      isOwner: false,
      isAllowedToChangeStaffNames: true,
      staffNamesLockedReason: null,
    });
    await renderLivePanel({ ...cafe, isOwner: false });
    const ownerSwitch = await screen.findByRole("switch", {
      name: "Show who replied",
    });
    await waitFor(() => expect(ownerSwitch).toBeEnabled());
    expect(
      screen.queryByText("Only the owner can change this."),
    ).not.toBeInTheDocument();
  });

  it("shows an unlinked persona's switch off and locked, with the reason, even for its owner (ENG-456)", async () => {
    apiMocks.getMailboxAttribution.mockResolvedValue({
      ...serverAttribution,
      isAllowedToChangeStaffNames: false,
      staffNamesLockedReason: "unlinkedPersona",
    });
    await renderLivePanel({
      ...cafe,
      kind: "subprofile",
      displayName: "Atelier Pulso",
      staffNamesLockedReason: "unlinkedPersona",
    });
    const ownerSwitch = await screen.findByRole("switch", {
      name: "Show who replied",
    });
    expect(ownerSwitch).toBeDisabled();
    expect(ownerSwitch).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByText(
        "This persona keeps who runs it private, so replies never show a first name.",
      ),
    ).toBeInTheDocument();
    // The reason takes the help line's place: no example name is offered.
    expect(
      screen.queryByText(/Customers see a first name beside each reply/),
    ).not.toBeInTheDocument();
    // The member's own switch could never take effect here, so it is left
    // out.
    expect(
      screen.queryByRole("switch", { name: "Include my first name" }),
    ).not.toBeInTheDocument();
  });

  it("shows a non-owner no owner-only note until the server answers, then shows it for an owned listing", async () => {
    let answerRead: (value: MailboxAttribution) => void = () => {};
    apiMocks.getMailboxAttribution.mockReturnValue(
      new Promise<MailboxAttribution>((resolve) => {
        answerRead = resolve;
      }),
    );
    await renderLivePanel({ ...cafe, isOwner: false });
    const ownerSwitch = await screen.findByRole("switch", {
      name: "Show who replied",
    });
    // The list's seed cannot tell an owned listing from an ownerless one.
    expect(ownerSwitch).toBeDisabled();
    expect(
      screen.queryByText("Only the owner can change this."),
    ).not.toBeInTheDocument();

    answerRead({
      ...serverAttribution,
      isOwner: false,
      isAllowedToChangeStaffNames: false,
      staffNamesLockedReason: null,
    });
    expect(
      await screen.findByText("Only the owner can change this."),
    ).toBeInTheDocument();
    expect(ownerSwitch).toBeDisabled();
  });
});
