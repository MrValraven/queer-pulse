import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DemoModeProvider } from "../../app/providers/DemoModeProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { DirectorySpaceMain } from "./DirectorySpaceMain";
import { DIRECTORY_PLACES } from "./directoryPlaces";

function renderMain(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <DemoModeProvider>
          <ToastProvider>{node}</ToastProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

describe("DirectorySpaceMain hours", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an Open now chip when real hours say it is open", () => {
    vi.setSystemTime(new Date(2026, 5, 5, 20, 0)); // Fri 5 Jun 2026, 20:00
    const place = {
      ...DIRECTORY_PLACES[0]!,
      hours: { Fri: { open: true, from: "18:00", to: "23:00" } },
    };

    renderMain(<DirectorySpaceMain place={place} preview />);

    expect(screen.getByText(/open now/i)).toBeInTheDocument();
  });

  it("renders the template hours table with no chip for demo places", () => {
    const place = DIRECTORY_PLACES[0]!;

    renderMain(<DirectorySpaceMain place={place} preview />);

    expect(screen.queryByText(/open now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/closed now/i)).not.toBeInTheDocument();
  });
});
