import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryGallery } from "./DirectoryGallery";
import { DIRECTORY_PLACES } from "./directoryPlaces";

function renderGallery(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{node}</I18nProvider>
    </QueryClientProvider>,
  );
}

describe("DirectoryGallery", () => {
  it("renders a real photo when the place has uploaded images", () => {
    const place = {
      ...DIRECTORY_PLACES[0]!,
      photos: {
        wide: "https://img/x.jpg",
        d1: null,
        d2: null,
        vibe: null,
      },
      alt: {
        wide: "Studio main desk",
        d1: "",
        d2: "",
        vibe: "",
      },
    };

    renderGallery(<DirectoryGallery place={place} />);

    const heroImage = screen.getByAltText("Studio main desk");
    expect(heroImage).toHaveAttribute("src", "https://img/x.jpg");
  });

  it("falls back to the caption blocks when the place has no photos", () => {
    const place = DIRECTORY_PLACES[0]!;

    renderGallery(<DirectoryGallery place={place} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(place.gallery[0]!)).toBeInTheDocument();
  });
});
