import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { GuideRatingWidget } from "./GuideRatingWidget";

let mockDemoMode = false;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

const fetchGuideRating = vi.fn();
const rateGuide = vi.fn();
vi.mock("./api/resources.api", () => ({
  fetchGuideRating: (contentKey: string) => fetchGuideRating(contentKey),
  rateGuide: (contentKey: string, value: string) =>
    rateGuide(contentKey, value),
}));

function renderWidget(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{node}</I18nProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockDemoMode = false;
  fetchGuideRating.mockReset();
  rateGuide.mockReset();
  fetchGuideRating.mockResolvedValue({
    contentKey: "legal.workplace.dismissal",
    helpfulCount: 0,
    notHelpfulCount: 0,
    myVote: null,
  });
});

describe("GuideRatingWidget live mode", () => {
  it("posts the clicked value and shows the thanks-state", async () => {
    rateGuide.mockResolvedValue({
      contentKey: "legal.workplace.dismissal",
      helpfulCount: 1,
      notHelpfulCount: 0,
      myVote: "helpful",
    });
    const user = userEvent.setup();
    renderWidget(
      <GuideRatingWidget contentKey="legal.workplace.dismissal" />,
    );

    const helpfulBtn = await screen.findByText("Yes");
    await user.click(helpfulBtn);

    expect(rateGuide).toHaveBeenCalledWith(
      "legal.workplace.dismissal",
      "helpful",
    );
    expect(
      await screen.findByText("Thanks for the feedback."),
    ).toBeInTheDocument();
  });

  it("lets the caller change their answer, exercising toggle-clear", async () => {
    fetchGuideRating.mockResolvedValue({
      contentKey: "legal.workplace.dismissal",
      helpfulCount: 1,
      notHelpfulCount: 0,
      myVote: "helpful",
    });
    rateGuide.mockResolvedValue({
      contentKey: "legal.workplace.dismissal",
      helpfulCount: 0,
      notHelpfulCount: 0,
      myVote: null,
    });
    const user = userEvent.setup();
    renderWidget(
      <GuideRatingWidget contentKey="legal.workplace.dismissal" />,
    );

    await screen.findByText("Thanks for the feedback.");
    await user.click(screen.getByText("Change your answer"));
    await user.click(screen.getByText("Yes"));

    expect(rateGuide).toHaveBeenCalledWith(
      "legal.workplace.dismissal",
      "helpful",
    );
    await waitFor(() =>
      expect(screen.getByText("Was this helpful?")).toBeInTheDocument(),
    );
  });
});

describe("GuideRatingWidget demo mode", () => {
  it("toggles locally without calling the API", async () => {
    mockDemoMode = true;
    const user = userEvent.setup();
    renderWidget(
      <GuideRatingWidget contentKey="legal.workplace.dismissal" />,
    );

    await user.click(await screen.findByText("Yes"));

    expect(fetchGuideRating).not.toHaveBeenCalled();
    expect(rateGuide).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Thanks for the feedback."),
    ).toBeInTheDocument();
  });
});
