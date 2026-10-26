import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { EmailCodeFieldFailure } from "./api/emailCodeFailure";
import { EmailCodeStep, type EmailCodeStepProps } from "./EmailCodeStep";

/**
 * `auth` is a lazy i18n namespace, so copy resolves a render after mount:
 * every first query is a findBy.
 */
function renderStep(overrides: Partial<EmailCodeStepProps> = {}) {
  const props: EmailCodeStepProps = {
    sentTo: "sam@example.com",
    code: "",
    onCodeChange: vi.fn(),
    onComplete: vi.fn(),
    failure: null,
    isVerifying: false,
    isResending: false,
    hasResent: false,
    resendAvailableAt: null,
    onResend: vi.fn(),
    onSubmitCode: vi.fn(),
    onUseDifferentEmail: vi.fn(),
    ...overrides,
  };
  const rendered = render(
    <TestProviders>
      <EmailCodeStep {...props} />
    </TestProviders>,
  );
  const rerenderWith = (next: Partial<EmailCodeStepProps>) =>
    rendered.rerender(
      <TestProviders>
        <EmailCodeStep {...props} {...next} />
      </TestProviders>,
    );
  return { ...rendered, props, rerenderWith };
}

describe("EmailCodeStep", () => {
  it("names the address and the ten-minute window", async () => {
    renderStep();
    const sentTo = await screen.findByText(
      (_, element) =>
        element?.tagName === "P" &&
        element.textContent ===
          "We sent a code to sam@example.com. It works for 10 minutes.",
    );
    expect(within(sentTo).getByText("sam@example.com").tagName).toBe("STRONG");
  });

  it("keeps Send a new code disabled during the countdown", async () => {
    renderStep({
      resendAvailableAt: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(
      await screen.findByRole("button", { name: "Send a new code" }),
    ).toBeDisabled();
    const countdown = screen.getByText(
      (_, element) =>
        element?.tagName === "P" &&
        /^You can send a new code in .* seconds\.$/.test(
          element.textContent ?? "",
        ),
    );
    expect(within(countdown).getByText("60")).toBeInTheDocument();
  });

  it("renders the reason copy for each failure kind", async () => {
    const expired: EmailCodeFieldFailure = {
      kind: "reason",
      reason: "code_expired",
    };
    const { rerenderWith } = renderStep({ failure: expired });
    expect(
      await screen.findByText(
        "This code has expired. Codes work for 10 minutes, so send a new one.",
      ),
    ).toBeInTheDocument();

    rerenderWith({ failure: { kind: "network" } });
    expect(
      await screen.findByText(
        "We could not reach QueerPulse. Check your connection and try again.",
      ),
    ).toBeInTheDocument();

    rerenderWith({ failure: { kind: "unexpected", status: 500 } });
    expect(
      await screen.findByText(
        "QueerPulse answered with an error we did not expect (500). Try again in a minute.",
      ),
    ).toBeInTheDocument();
  });

  it("links account_recovery_review to the contact page", async () => {
    renderStep({
      failure: { kind: "reason", reason: "account_recovery_review" },
    });
    const link = await screen.findByRole("link", { name: "Write to us" });
    expect(link).toHaveAttribute("href", "/about/contact");
  });

  it("hides Use a different email when no handler is given", async () => {
    renderStep({ onUseDifferentEmail: undefined });
    await screen.findByRole("button", { name: "Send a new code" });
    expect(
      screen.queryByRole("button", { name: "Use a different email" }),
    ).not.toBeInTheDocument();
  });

  it("disables Send a new code and Use a different email during a check", async () => {
    renderStep({ code: "123456", isVerifying: true });
    expect(
      await screen.findByRole("button", { name: "Send a new code" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Use a different email" }),
    ).toBeDisabled();
  });

  it("moves focus to the first code box when a new code arrives", async () => {
    const { rerenderWith } = renderStep({
      code: "12",
      resendAvailableAt: "2026-10-26T12:00:00.000Z",
    });
    const resend = await screen.findByRole("button", {
      name: "Send a new code",
    });
    resend.focus();
    expect(resend).toHaveFocus();

    rerenderWith({ code: "", resendAvailableAt: "2026-10-26T12:01:00.000Z" });
    expect(await screen.findByLabelText("Digit 1 of 6")).toHaveFocus();
  });

  it("Check this code is enabled only with six digits", async () => {
    const { rerenderWith, props } = renderStep({ code: "12345" });
    expect(
      await screen.findByRole("button", { name: "Check this code" }),
    ).toBeDisabled();

    rerenderWith({ code: "123456" });
    const check = screen.getByRole("button", { name: "Check this code" });
    expect(check).toBeEnabled();
    fireEvent.click(check);
    expect(props.onSubmitCode).toHaveBeenCalledTimes(1);
  });
});
