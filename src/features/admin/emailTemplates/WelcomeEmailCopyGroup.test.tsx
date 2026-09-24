import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { makeJoinRequestRow } from "../joinRequestTestRow";
import type { EmailTemplateDTO } from "./emailTemplate.types";
import type { RenderedEmail } from "./renderEmail";
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

  it("renders nothing when no template is active", () => {
    templates = [];
    renderGroup();
    expect(
      screen.queryByRole("button", { name: /copy welcome email/i }),
    ).toBeNull();
  });
});
