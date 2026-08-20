import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { SuggestResourceModal } from "./SuggestResourceModal";
import * as resourcesApi from "./api/resources.api";

let mockDemoMode = false;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

const toastSpy = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: toastSpy }),
}));

function renderModal(onClose = vi.fn()) {
  return render(
    <I18nProvider>
      <SuggestResourceModal category="legal_aid" onClose={onClose} />
    </I18nProvider>,
  );
}

beforeEach(() => {
  mockDemoMode = false;
  toastSpy.mockClear();
  vi.restoreAllMocks();
});

describe("SuggestResourceModal", () => {
  it("submits the suggestion with the pre-filled category and shows the success state", async () => {
    const submitSpy = vi
      .spyOn(resourcesApi, "submitResourceSuggestion")
      .mockResolvedValue({
        id: "rs-1",
        category: "legal_aid",
        name: "Porto Queer Legal Clinic",
        description: "Pro-bono workplace discrimination cases.",
        phone: null,
        email: null,
        website: null,
        createdAt: "2026-08-20T00:00:00.000Z",
      });
    const user = userEvent.setup();
    renderModal();

    await user.type(
      await screen.findByLabelText("Organisation name"),
      "Porto Queer Legal Clinic",
    );
    await user.type(
      screen.getByLabelText("What do they offer?"),
      "Pro-bono workplace discrimination cases.",
    );
    await user.click(screen.getByRole("button", { name: "Send suggestion" }));

    await waitFor(() =>
      expect(submitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "legal_aid",
          name: "Porto Queer Legal Clinic",
          description: "Pro-bono workplace discrimination cases.",
        }),
      ),
    );
    expect(
      await screen.findByText(/we'll take it from here/i),
    ).toBeInTheDocument();
  });

  it("keeps the submit button disabled until name and description are filled in", async () => {
    renderModal();
    expect(
      await screen.findByRole("button", { name: "Send suggestion" }),
    ).toBeDisabled();
  });

  it("toasts and stays on the form when the submission fails", async () => {
    vi.spyOn(resourcesApi, "submitResourceSuggestion").mockRejectedValue(
      new Error("network down"),
    );
    const user = userEvent.setup();
    renderModal();

    await user.type(
      await screen.findByLabelText("Organisation name"),
      "Porto Queer Legal Clinic",
    );
    await user.type(
      screen.getByLabelText("What do they offer?"),
      "Pro-bono workplace discrimination cases.",
    );
    await user.click(screen.getByRole("button", { name: "Send suggestion" }));

    await waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(
      screen.getByRole("button", { name: "Send suggestion" }),
    ).toBeInTheDocument();
  });
});
