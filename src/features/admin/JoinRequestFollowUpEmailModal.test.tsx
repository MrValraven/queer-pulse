import { useContext, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nContext } from "../../app/providers/i18nContext";
import { TestProviders } from "../../test/TestProviders";
import { JoinRequestFollowUpEmailModal } from "./JoinRequestFollowUpEmailModal";

/**
 * Re-provides the real i18n context with a `translateIn` that never resolves,
 * so the modal stays in the state where the chosen language is still loading.
 */
function TranslateInStillLoading({ children }: { children: ReactNode }) {
  const context = useContext(I18nContext);
  if (!context) throw new Error("TranslateInStillLoading needs I18nProvider");
  return (
    <I18nContext.Provider value={{ ...context, translateIn: () => undefined }}>
      {children}
    </I18nContext.Provider>
  );
}

function renderModal(
  props: Partial<
    React.ComponentProps<typeof JoinRequestFollowUpEmailModal>
  > = {},
) {
  return render(
    <JoinRequestFollowUpEmailModal
      applicantName="Ana"
      hasApplicantName
      applicantEmail="ana@example.com"
      onClose={vi.fn()}
      {...props}
    />,
    { wrapper: TestProviders },
  );
}

describe("JoinRequestFollowUpEmailModal", () => {
  it("previews the email to the applicant, addressed by name", async () => {
    renderModal();
    expect(await screen.findByText("ana@example.com")).toBeInTheDocument();
    expect(await screen.findByDisplayValue(/^Hi Ana,/)).toBeInTheDocument();
    expect(
      screen.getByText("Your QueerPulse invite request"),
    ).toBeInTheDocument();
  });

  it("greets by first name while the title keeps the full name", async () => {
    renderModal({ applicantName: "Ana Sofia Reis" });
    expect(await screen.findByDisplayValue(/^Hi Ana,/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Ana Sofia Reis/ }),
    ).toBeInTheDocument();
  });

  it("greets without a name when the applicant left it blank", async () => {
    renderModal({
      applicantName: "New applicant",
      hasApplicantName: false,
      onWaitlist: vi.fn(),
    });
    const preview = await screen.findByRole<HTMLTextAreaElement>("textbox");
    expect(preview.value).toMatch(/^Hi there,/);
    expect(preview.value).not.toContain("Hi New");
    expect(
      screen.getByRole("heading", { name: "Email this applicant" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Waitlist this request" }),
    ).toBeInTheDocument();
  });

  it("keeps Open and Copy disabled with no textarea while the email text loads", async () => {
    render(
      <TranslateInStillLoading>
        <JoinRequestFollowUpEmailModal
          applicantName="Ana"
          hasApplicantName
          applicantEmail="ana@example.com"
          onClose={vi.fn()}
        />
      </TranslateInStillLoading>,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByRole("button", { name: "Copy email" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Open in email app" }),
    ).toBeDisabled();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("switches the preview to Portuguese", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(await screen.findByRole("button", { name: "Português" }));
    expect(await screen.findByDisplayValue(/^Olá Ana,/)).toBeInTheDocument();
    // Only the preview changes language; the dashboard (EN here) labels stay.
    expect(screen.getByRole("button", { name: "Copy email" })).toBeEnabled();
  });

  it("waitlists and closes from the hint on a pending card", async () => {
    const user = userEvent.setup();
    const onWaitlist = vi.fn();
    const onClose = vi.fn();
    renderModal({ onWaitlist, onClose });
    await user.click(
      await screen.findByRole("button", { name: "Waitlist Ana" }),
    );
    expect(onWaitlist).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("offers no waitlist button on a waitlisted card", async () => {
    renderModal({ onWaitlist: undefined });
    await screen.findByText("ana@example.com");
    expect(screen.queryByRole("button", { name: "Waitlist Ana" })).toBeNull();
  });
});
