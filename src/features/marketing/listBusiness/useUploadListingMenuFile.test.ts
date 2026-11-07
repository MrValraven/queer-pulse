import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { ImageProcessingError } from "../../members/api/uploadProcessing";
import { DocumentProcessingError } from "../../messages/documentUploadProcessing";
import {
  MENU_FILE_MAX_BYTES,
  MenuFileUploadError,
  menuUploadFailure,
  validateMenuFile,
} from "./useUploadListingMenuFile";

function fakeFile(type: string, size: number, name = "menu.pdf"): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("validateMenuFile", () => {
  it("accepts a PDF under the cap", () => {
    expect(() =>
      validateMenuFile(fakeFile("application/pdf", 1024)),
    ).not.toThrow();
  });

  it("accepts a JPEG, PNG or WebP photo", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(() =>
        validateMenuFile(fakeFile(type, 1024, "board.jpg")),
      ).not.toThrow();
    }
  });

  it("refuses a spreadsheet with the type code", () => {
    try {
      validateMenuFile(fakeFile("text/csv", 10, "menu.csv"));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(MenuFileUploadError);
      expect((error as MenuFileUploadError).code).toBe("type");
    }
  });

  it("refuses a file over 10 MB with the size code", () => {
    try {
      validateMenuFile(fakeFile("application/pdf", MENU_FILE_MAX_BYTES + 1));
      expect.unreachable();
    } catch (error) {
      expect((error as MenuFileUploadError).code).toBe("size");
    }
  });

  it("lets a photo over 10 MB through, since the image pipeline shrinks it first", () => {
    expect(() =>
      validateMenuFile(
        fakeFile("image/jpeg", MENU_FILE_MAX_BYTES + 1, "board.jpg"),
      ),
    ).not.toThrow();
  });
});

describe("menuUploadFailure", () => {
  it("passes an image or validation error through unchanged", () => {
    const imageError = new ImageProcessingError(
      "members:upload.error.tooLarge",
    );
    expect(menuUploadFailure(imageError)).toBe(imageError);
    const typeError = new MenuFileUploadError("type");
    expect(menuUploadFailure(typeError)).toBe(typeError);
  });

  it("passes a document error through, keeping its key", () => {
    const documentError = new DocumentProcessingError(
      "messages:attachments.documentError.storageFault",
    );
    expect(menuUploadFailure(documentError)).toBe(documentError);
  });

  it("swaps the message-document wording for a refused type", () => {
    const failure = menuUploadFailure(
      new DocumentProcessingError(
        "messages:attachments.documentError.storageRejectedType",
      ),
    ) as DocumentProcessingError;
    expect(failure.i18nKey).toBe(
      "marketing:listBusiness.menu.fileError.rejected",
    );
  });

  it.each([
    [400, "marketing:listBusiness.menu.fileError.rejected"],
    [413, "marketing:listBusiness.menu.fileError.size"],
    [429, "marketing:listBusiness.menu.fileError.tooManyUploads"],
    [500, "shared:apiError.serverFault"],
    [404, "shared:apiError.notFound"],
  ])("names the presign status %i", (status, key) => {
    const failure = menuUploadFailure(
      new ApiError(status, "x"),
    ) as DocumentProcessingError;
    expect(failure).toBeInstanceOf(DocumentProcessingError);
    expect(failure.i18nKey).toBe(key);
    expect(failure.values).toMatchObject({ max: "10 MB" });
  });

  it("names a restricted account", () => {
    const failure = menuUploadFailure(
      new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
    ) as DocumentProcessingError;
    expect(failure.i18nKey).toBe("shared:apiError.accountRestricted");
  });

  it("names the lost connection for a network failure", () => {
    const failure = menuUploadFailure(
      new TypeError("Failed to fetch"),
    ) as DocumentProcessingError;
    expect(failure.i18nKey).toBe("shared:apiError.noConnection");
  });
});
