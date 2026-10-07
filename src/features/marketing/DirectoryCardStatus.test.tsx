import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryCardMeta } from "./DirectoryCardMeta";
import { DirectoryCardStatus } from "./DirectoryCardStatus";
import { DirectoryCardVisit } from "./DirectoryCardVisit";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import { emptyHours } from "./listBusiness/listBusiness.data";

// English is the default language under vitest, and the `marketing` namespace
// loads lazily, so every copy assertion awaits it with `findBy`.
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

const basePlace: DirectoryPlace = {
  ...DIRECTORY_PLACES[0]!,
  operatingState: undefined,
  online: false,
  hasOnlineShop: false,
  onlineSummary: null,
};

const closedWeek = emptyHours();

describe("DirectoryCardStatus for online listings", () => {
  it("names the widest delivery and never says Closed", async () => {
    renderWithProviders(
      <DirectoryCardStatus
        place={{
          ...basePlace,
          online: true,
          hours: closedWeek,
          onlineSummary: {
            mainLink: null,
            fulfilment: ["shipsPortugal", "shipsEu"],
            sessionFormats: ["video"],
          },
        }}
      />,
    );
    expect(await screen.findByText("Ships across the EU")).toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });

  it("falls back to the first session format", async () => {
    renderWithProviders(
      <DirectoryCardStatus
        place={{
          ...basePlace,
          online: true,
          onlineSummary: {
            mainLink: null,
            fulfilment: [],
            sessionFormats: ["video"],
          },
        }}
      />,
    );
    expect(await screen.findByText("Video sessions")).toBeInTheDocument();
  });

  it("says nothing with neither", () => {
    const { container } = renderWithProviders(
      <DirectoryCardStatus
        place={{ ...basePlace, online: true, onlineSummary: null }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("DirectoryCardVisit", () => {
  const onlinePlace: DirectoryPlace = {
    ...basePlace,
    online: true,
    onlineSummary: {
      mainLink: { url: "fiosolto.pt", kind: "shop" },
      fulfilment: [],
      sessionFormats: [],
    },
  };

  it("opens an online listing's main link in a new tab without following the card", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const onCardClick = vi.fn();
    renderWithProviders(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={onCardClick}>
        <DirectoryCardVisit place={onlinePlace} />
      </div>,
    );
    // `fireEvent` returns false when the handler called preventDefault, which
    // is what keeps the card's own link from navigating.
    expect(fireEvent.click(screen.getByRole("link"))).toBe(false);
    expect(open).toHaveBeenCalledWith(
      "https://fiosolto.pt",
      "_blank",
      "noopener,noreferrer",
    );
    expect(onCardClick).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("opens the main link from the keyboard with Enter", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const onCardKeyDown = vi.fn();
    renderWithProviders(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onKeyDown={onCardKeyDown}>
        <DirectoryCardVisit place={onlinePlace} />
      </div>,
    );
    expect(fireEvent.keyDown(screen.getByRole("link"), { key: "Enter" })).toBe(
      false,
    );
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      "https://fiosolto.pt",
      "_blank",
      "noopener,noreferrer",
    );
    expect(onCardKeyDown).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("keeps a place's Visit as plain text pointing at its card", () => {
    renderWithProviders(
      <DirectoryCardVisit place={{ ...basePlace, hasOnlineShop: true }} />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("DirectoryCardMeta", () => {
  it("reads Online and the city", async () => {
    renderWithProviders(
      <DirectoryCardMeta
        place={{ ...basePlace, online: true, city: "Porto" }}
      />,
    );
    expect(await screen.findByText("Online · Porto")).toBeInTheDocument();
  });

  it("reads Online alone while the listing gives no city", async () => {
    renderWithProviders(
      <DirectoryCardMeta place={{ ...basePlace, online: true, city: "  " }} />,
    );
    expect(await screen.findByText("Online")).toBeInTheDocument();
    expect(screen.queryByText(basePlace.hood)).not.toBeInTheDocument();
  });

  it("adds Also online after a place's neighbourhood", async () => {
    renderWithProviders(
      <DirectoryCardMeta place={{ ...basePlace, hasOnlineShop: true }} />,
    );
    expect(await screen.findByText("Also online")).toBeInTheDocument();
    expect(screen.getByText(basePlace.hood)).toBeInTheDocument();
  });
});
