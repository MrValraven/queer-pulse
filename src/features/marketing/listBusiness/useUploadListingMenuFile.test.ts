import { describe, expect, it } from "vitest";
import {
  MENU_FILE_MAX_BYTES,
  MenuFileUploadError,
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
});
