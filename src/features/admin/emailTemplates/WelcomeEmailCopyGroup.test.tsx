import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appOrigin } from "../../../shared/lib/inviteUrl";
import { TestProviders } from "../../../test/TestProviders";
import { makeJoinRequestRow } from "../joinRequestTestRow";
import type { EmailTemplateDTO } from "./emailTemplate.types";
import { renderEmail, type RenderedEmail } from "./renderEmail";
import { welcomeEmailValues } from "./welcomeEmailValues";
import { WelcomeEmailCopyGroup } from "./WelcomeEmailCopyGroup";

const showToast = vi.fn();
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

const copyRichEmail =
  vi.fn<(email: RenderedEmail) => Promise<"rich" | "plain" | "failed">>();
const copyPlainText = vi.fn<(text: string) => Promise<boolean>>();
vi.mock("./copyEmail", () => ({
  copyRichEmail: (email: RenderedEmail) => copyRichEmail(email),
  copyPlainText: (text: string) => copyPlainText(text),
}));

let templates: EmailTemplateDTO[] = [];
vi.mock("./api/emailTemplateHooks", () => ({
  useModEmailTemplates: () => ({ data: templates }),
}));

const englishOnly: EmailTemplateDTO = {
  id: "welcome",
  label: "Welcome",
  purpose: "invite_approved",
  locales: {
    en: {
      subject: "Hi {name}",
      mode: "blocks",
      html: null,
      blocks: [
        { id: "b", type: "button", label: "Join", href: "{inviteLink}" },
      ],
    },
  },
};

const approved = makeJoinRequestRow({
  id: "req-1",
  name: "Kai Mendes",
  email: "kai@example.test",
  inviteCode: "ABC123",
  inviteStatus: "valid",
  inviteExpiresAt: "2026-10-01T12:00:00Z",
});

/** The preview iframe, found by the title that names the applicant. */
function previewFrameIn(dialog: HTMLElement) {
  return within(dialog).getByTitle("Welcome email for Kai Mendes");
}

function renderGroup(item = approved) {
  render(
    <TestProviders>
      <WelcomeEmailCopyGroup item={item} />
    </TestProviders>,
  );
}

beforeEach(() => {
  templates = [englishOnly];
  showToast.mockReset();
  copyRichEmail.mockReset().mockResolvedValue("rich");
  copyPlainText.mockReset().mockResolvedValue(true);
});

describe("WelcomeEmailCopyGroup", () => {
  it("copies the filled email and names the address to paste it to", async () => {
    renderGroup();
    await userEvent.click(
      screen.getByRole("button", { name: /copy welcome email/i }),
    );
    const email = copyRichEmail.mock.calls[0]?.[0];
    expect(email?.subject).toBe("Hi Kai");
    expect(email?.html).toMatch(/href="[^"]*ABC123"/);
    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining("kai@example.test"),
      "success",
    );
    expect(showToast.mock.calls[0]?.[0]).not.toMatch(/sent/i);
  });

  it("says so when only plain text could be copied", async () => {
    copyRichEmail.mockResolvedValue("plain");
    renderGroup();
    await userEvent.click(
      screen.getByRole("button", { name: /copy welcome email/i }),
    );
    expect(showToast).toHaveBeenCalledWith(
      expect.stringMatching(/plain text/i),
      "success",
    );
  });

  it("offers no language switch for an English-only template", () => {
    renderGroup();
    expect(screen.queryByRole("button", { name: /portuguese/i })).toBeNull();
  });

  it("renders nothing for an expired or used invite", () => {
    renderGroup(makeJoinRequestRow({ ...approved, inviteStatus: "expired" }));
    expect(
      screen.queryByRole("button", { name: /copy welcome email/i }),
    ).toBeNull();
  });

  it("previews the email filled with the applicant's real details", async () => {
    renderGroup();
    await userEvent.click(
      screen.getByRole("button", { name: /preview email/i }),
    );
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: /Kai Mendes/ }),
    ).toBeInTheDocument();
    expect(within(dialog).getAllByText(/Hi Kai/).length).toBeGreaterThan(0);
    expect(dialog.textContent).not.toMatch(/Alex/);
    const previewHtml = previewFrameIn(dialog).getAttribute("srcdoc") ?? "";
    expect(previewHtml).toContain(
      welcomeEmailValues(approved, "en").inviteLink,
    );
    expect(previewHtml).toMatch(/href="[^"]*ABC123"/);
    expect(previewHtml).not.toMatch(/Alex/);
    expect(previewHtml).not.toMatch(/SAMPLE/);
  });

  it("copies the same email from the preview as from the card", async () => {
    renderGroup();
    await userEvent.click(
      screen.getByRole("button", { name: /copy welcome email/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /preview email/i }),
    );
    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /copy email/i }),
    );
    expect(copyRichEmail).toHaveBeenCalledTimes(2);
    const fromCard = copyRichEmail.mock.calls[0]?.[0];
    const fromPreview = copyRichEmail.mock.calls[1]?.[0];
    expect(fromPreview?.html).toBe(fromCard?.html);
    expect(fromPreview?.subject).toBe(fromCard?.subject);
    // The preview shows the same email, with hosted images from this app.
    const expectedPreview = renderEmail(
      englishOnly.locales.en,
      welcomeEmailValues(approved, "en"),
      "en",
      { assetOrigin: appOrigin() },
    );
    expect(previewFrameIn(dialog).getAttribute("srcdoc")).toBe(
      expectedPreview.html,
    );
    expect(showToast).toHaveBeenLastCalledWith(
      expect.stringContaining("kai@example.test"),
      "success",
    );
    expect(dialog).toBeInTheDocument();
  });

  it("renders nothing when no template is active", () => {
    templates = [];
    renderGroup();
    expect(
      screen.queryByRole("button", { name: /copy welcome email/i }),
    ).toBeNull();
  });
});
