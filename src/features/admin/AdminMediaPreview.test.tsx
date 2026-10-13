import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminMediaCard } from "./AdminMediaCard";
import { AdminMediaPreview } from "./AdminMediaPreview";
import type { AdminMediaObject } from "./api/adminMedia.api";

/**
 * The media console lists every stored object, and a listing menu can be a
 * PDF. The backend derives `contentType` from the key's extension over the
 * image types only, so a `.pdf` arrives with a null type. Those objects get a
 * document tile with the extension and file name, since an `<img>` pointed at
 * a PDF draws a broken image.
 */

function mediaObject(
  overrides: Partial<AdminMediaObject> = {},
): AdminMediaObject {
  return {
    key: "listing-menus/user-1/menu-autumn.pdf",
    size: 182_000,
    lastModified: "2026-09-30T10:00:00.000Z",
    kind: "listing-menus",
    uploaderId: null,
    contentType: null,
    fileUrl: "/files/listing-menus/user-1/menu-autumn.pdf",
    presignedUrl: "https://bucket.example/menu-autumn.pdf?signature=1",
    uploader: null,
    references: [],
    ...overrides,
  };
}

describe("AdminMediaPreview", () => {
  it("renders a document tile for a PDF on a grid card", async () => {
    const { container } = render(
      <TestProviders>
        <AdminMediaCard
          object={mediaObject()}
          onOpen={vi.fn()}
          onFilterByUploader={vi.fn()}
        />
      </TestProviders>,
    );

    expect(await screen.findByText("menu-autumn.pdf")).toBeInTheDocument();
    expect(screen.getByText("pdf")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders the image for an image object on a grid card", async () => {
    const imageObject = mediaObject({
      key: "listing-covers/user-1/cover.webp",
      kind: "listing-covers",
      contentType: "image/webp",
      fileUrl: "/files/listing-covers/user-1/cover.webp",
    });
    const { container } = render(
      <TestProviders>
        <AdminMediaCard
          object={imageObject}
          onOpen={vi.fn()}
          onFilterByUploader={vi.fn()}
        />
      </TestProviders>,
    );

    await screen.findByRole("button", { name: /cover\.webp/ });
    const image = container.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("src")).toContain(
      "/files/listing-covers/user-1/cover.webp",
    );
  });

  it("renders an image when given an image type, whatever the key's extension", () => {
    const { container } = render(
      <AdminMediaPreview
        object={mediaObject({ key: "work/user-1/odd-name" })}
        variant="drawer"
        realContentType="image/png"
      />,
    );

    expect(container.querySelector("img")).not.toBeNull();
  });

  it("keeps the drawer image when the declared type is an image and the stored type is not", () => {
    const { container } = render(
      <AdminMediaPreview
        object={mediaObject({
          key: "avatars/user-1/face.png",
          contentType: "image/png",
        })}
        variant="drawer"
        realContentType="text/html"
      />,
    );

    expect(container.querySelector("img")).not.toBeNull();
  });

  it("names a file with no extension in the drawer document tile", () => {
    const { container } = render(
      <AdminMediaPreview
        object={mediaObject({ key: "persona/abc/notes" })}
        variant="drawer"
      />,
    );

    expect(screen.getByText("notes")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });
});
