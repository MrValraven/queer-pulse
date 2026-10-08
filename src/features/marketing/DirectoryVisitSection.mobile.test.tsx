import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DemoModeProvider } from "../../app/providers/DemoModeProvider";
import { AuthProvider } from "../../app/providers/AuthProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { DirectoryVisitSection } from "./DirectoryVisitSection";
import { MOBILE_DIRECTORY_PLACES } from "./directoryMobilePlaces.data";

vi.mock("./LocationMiniMap", () => ({
  LocationMiniMap: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="img" aria-label={ariaLabel} />
  ),
}));

describe("DirectoryVisitSection for an out-and-about listing", () => {
  it("reads area text, then Meeting point, then the map, with no hood subline", async () => {
    const place = MOBILE_DIRECTORY_PLACES.find(
      (candidate) => candidate.slug === "lisboa-arco-iris-walks",
    )!;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <DemoModeProvider>
            <AuthProvider>
              <ToastProvider>
                <MemoryRouter>
                  <DirectoryVisitSection place={place} />
                </MemoryRouter>
              </ToastProvider>
            </AuthProvider>
          </DemoModeProvider>
        </I18nProvider>
      </QueryClientProvider>,
    );
    const meetingPoint = await screen.findByText("Meeting point");
    const map = screen.getByRole("img");
    expect(container.querySelector("p[class*='subLine']")).toBeNull();
    expect(
      meetingPoint.compareDocumentPosition(map) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
