import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryCardMeta } from "./DirectoryCardMeta";
import { DirectoryCardStatus } from "./DirectoryCardStatus";
import { MOBILE_DIRECTORY_PLACES } from "./directoryMobilePlaces.data";
import type { DirectoryPlace } from "./directoryPlaces";
import { emptyMobileDetails } from "./listBusiness/listingMobile.data";

function renderWithProviders(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{node}</I18nProvider>
    </QueryClientProvider>,
  );
}

const fixture = (slug: string): DirectoryPlace =>
  MOBILE_DIRECTORY_PLACES.find((place) => place.slug === slug)!;

describe("DirectoryCardMeta for an out-and-about listing", () => {
  it("names the meeting point's neighbourhood", async () => {
    renderWithProviders(
      <DirectoryCardMeta place={fixture("lisboa-arco-iris-walks")} />,
    );
    expect(await screen.findByText("Meets in Mouraria")).toBeInTheDocument();
  });

  it("says Works across Lisbon for the whole city and leaves Also travels to off", async () => {
    renderWithProviders(<DirectoryCardMeta place={fixture("muda-comigo")} />);
    expect(await screen.findByText("Works across Lisbon")).toBeInTheDocument();
    expect(screen.queryByText(/Almada/)).not.toBeInTheDocument();
  });

  it("names two parishes and counts the rest", async () => {
    renderWithProviders(<DirectoryCardMeta place={fixture("corte-movel")} />);
    expect(
      await screen.findByText("Works in Arroios, Estrela +1"),
    ).toBeInTheDocument();
  });

  it("names one or two parishes with no count", async () => {
    const place = {
      ...fixture("corte-movel"),
      mobileDetails: {
        ...emptyMobileDetails(),
        allOfCity: false,
        parishes: ["Beato"],
      },
    };
    renderWithProviders(<DirectoryCardMeta place={place} />);
    expect(await screen.findByText("Works in Beato")).toBeInTheDocument();
  });

  it("keeps the Also online pill for one that sells online", async () => {
    renderWithProviders(
      <DirectoryCardMeta place={fixture("lisboa-arco-iris-walks")} />,
    );
    expect(await screen.findByText("Also online")).toBeInTheDocument();
  });
});

describe("DirectoryCardStatus for an out-and-about listing", () => {
  it("says By appointment and never Closed", async () => {
    renderWithProviders(<DirectoryCardStatus place={fixture("muda-comigo")} />);
    expect(await screen.findByText("By appointment")).toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });

  it("reads the hours of one that has them", async () => {
    const { container } = renderWithProviders(
      <DirectoryCardStatus place={fixture("corte-movel")} />,
    );
    expect(await screen.findByText(/Open|Closed|Closing/)).toBeInTheDocument();
    expect(container.textContent).not.toContain("By appointment");
  });
});
