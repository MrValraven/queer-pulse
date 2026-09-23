import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MyUploadThumb } from "./MyUploadThumb";
import { documentExtensionOf, type MyMediaItem } from "./api/myMedia.api";

const BASE_ITEM: MyMediaItem = {
  key: "listing-menus/u/f.pdf",
  kind: "listing-menu",
  size: 12_000,
  lastModified: "2026-08-09T10:00:00.000Z",
  fileUrl: "https://images.unsplash.com/menu.pdf",
  references: [],
};

describe("documentExtensionOf", () => {
  it("reads the extension off a menu PDF key", () => {
    expect(documentExtensionOf("listing-menus/u/f.pdf")).toBe("PDF");
  });

  it("is case-insensitive", () => {
    expect(documentExtensionOf(".XLSX")).toBe("XLSX");
  });

  it("returns null for a non-document key, even a listing-photo webp", () => {
    expect(documentExtensionOf("listing-photos/u/f.webp")).toBeNull();
  });
});

describe("MyUploadThumb", () => {
  it("renders a document tile with the extension label, no <img>, for a PDF", () => {
    const { container } = render(
      <TestProviders>
        <MyUploadThumb item={BASE_ITEM} />
      </TestProviders>,
    );
    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("renders an <img> with the resolved src for a photo upload", () => {
    const photoItem: MyMediaItem = {
      ...BASE_ITEM,
      key: "listing-photos/u/f.webp",
      kind: "listing-photo",
      fileUrl: "https://images.unsplash.com/photo.webp",
    };
    const { container } = render(
      <TestProviders>
        <MyUploadThumb item={photoItem} />
      </TestProviders>,
    );
    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      "https://images.unsplash.com/photo.webp",
    );
  });
});
