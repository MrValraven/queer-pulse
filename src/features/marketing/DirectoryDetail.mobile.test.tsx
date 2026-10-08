import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DemoModeProvider } from "../../app/providers/DemoModeProvider";
import { AuthProvider } from "../../app/providers/AuthProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { DirectoryActionBar } from "./DirectoryActionBar";
import { DirectorySpaceHeader } from "./DirectorySpaceHeader";
import { MOBILE_DIRECTORY_PLACES } from "./directoryMobilePlaces.data";
import type { DirectoryPlace } from "./directoryPlaces";

vi.mock("./LocationMiniMap", () => ({
  LocationMiniMap: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="img" aria-label={ariaLabel} />
  ),
}));

function renderDetail(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <DemoModeProvider>
          <AuthProvider>
            <ToastProvider>
              <MemoryRouter>{node}</MemoryRouter>
            </ToastProvider>
          </AuthProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

const fixture = (slug: string): DirectoryPlace =>
  MOBILE_DIRECTORY_PLACES.find((place) => place.slug === slug)!;

describe("DirectorySpaceHeader eyebrow for an out-and-about listing", () => {
  it("prints where it works and no empty segment when there is no meeting point", async () => {
    renderDetail(<DirectorySpaceHeader place={fixture("muda-comigo")} />);
    const eyebrow = (await screen.findByText(/Works across Lisbon/)).closest(
      "div",
    );
    expect(eyebrow?.textContent).not.toMatch(/·\s*·/);
    expect(eyebrow?.textContent).toMatch(/Works across Lisbon$/);
  });

  it("prints the neighbourhood and city when it has a meeting point", async () => {
    renderDetail(
      <DirectorySpaceHeader place={fixture("lisboa-arco-iris-walks")} />,
    );
    expect(await screen.findByText(/Mouraria · /)).toBeInTheDocument();
  });
});

describe("DirectoryActionBar Directions for an out-and-about listing", () => {
  it("leaves Directions off with no meeting point", async () => {
    renderDetail(<DirectoryActionBar place={fixture("corte-movel")} />);
    expect(await screen.findByRole("button", { name: /save/i })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Directions" }),
    ).not.toBeInTheDocument();
  });

  it("keeps Directions with a meeting point", async () => {
    renderDetail(
      <DirectoryActionBar place={fixture("lisboa-arco-iris-walks")} />,
    );
    expect(
      await screen.findByRole("link", { name: "Directions" }),
    ).toBeInTheDocument();
  });
});
