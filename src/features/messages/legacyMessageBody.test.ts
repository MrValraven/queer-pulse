import { afterEach, describe, expect, it } from "vitest";
import { messages as enMessages } from "../../shared/i18n/catalogs/en/messages";
import { messages as ptMessages } from "../../shared/i18n/catalogs/pt/messages";
import { STORAGE_KEY } from "../../shared/i18n/locale";
import type { Catalog, TFunction } from "../../shared/i18n/types";
import {
  ATTACHMENT_LABEL_FALLBACK,
  RAW_ATTACHMENT_FALLBACK_KEYS,
  isRawAttachmentFallbackKey,
  readableAttachmentBody,
  shouldShowEditedMark,
} from "./legacyMessageBody";

const RAW_DOCUMENT_KEY = "messages:attachments.documentFallbackText";
const RAW_IMAGE_KEY = "messages:attachments.fallbackText";

/** A translator over one real `messages` catalog, echoing unknown keys the
 *  way the provider does while a namespace is still loading. */
function catalogT(catalog: Catalog): TFunction {
  return (key) => catalog[key.replace(/^messages:/, "")] ?? key;
}

const echoT: TFunction = (key) => key;

afterEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

describe("RAW_ATTACHMENT_FALLBACK_KEYS", () => {
  it("lists exactly the two keys legacy rows stored", () => {
    expect([...RAW_ATTACHMENT_FALLBACK_KEYS].sort()).toEqual(
      [RAW_DOCUMENT_KEY, RAW_IMAGE_KEY].sort(),
    );
    expect(Object.isFrozen(RAW_ATTACHMENT_FALLBACK_KEYS)).toBe(true);
  });

  it("recognizes only an exact key", () => {
    expect(isRawAttachmentFallbackKey(RAW_DOCUMENT_KEY)).toBe(true);
    expect(isRawAttachmentFallbackKey(RAW_IMAGE_KEY)).toBe(true);
    expect(isRawAttachmentFallbackKey("File")).toBe(false);
    expect(isRawAttachmentFallbackKey(` ${RAW_IMAGE_KEY}`)).toBe(false);
  });
});

describe("ATTACHMENT_LABEL_FALLBACK stays equal to the catalogs", () => {
  it("matches the English catalog", () => {
    expect(ATTACHMENT_LABEL_FALLBACK.image.en).toBe(
      enMessages["attachments.fallbackText"],
    );
    expect(ATTACHMENT_LABEL_FALLBACK.gif.en).toBe(
      enMessages["viewer.gifBadge"],
    );
    expect(ATTACHMENT_LABEL_FALLBACK.document.en).toBe(
      enMessages["attachments.documentFallbackText"],
    );
  });

  it("matches the Portuguese catalog", () => {
    expect(ATTACHMENT_LABEL_FALLBACK.image.pt).toBe(
      ptMessages["attachments.fallbackText"],
    );
    expect(ATTACHMENT_LABEL_FALLBACK.gif.pt).toBe(
      ptMessages["viewer.gifBadge"],
    );
    expect(ATTACHMENT_LABEL_FALLBACK.document.pt).toBe(
      ptMessages["attachments.documentFallbackText"],
    );
  });
});

describe("readableAttachmentBody", () => {
  it("names a raw-key document through the translator", () => {
    expect(
      readableAttachmentBody("document", RAW_DOCUMENT_KEY, {
        t: catalogT(enMessages),
      }),
    ).toBe("File");
    expect(
      readableAttachmentBody("document", RAW_DOCUMENT_KEY, {
        t: catalogT(ptMessages),
      }),
    ).toBe("Ficheiro");
  });

  it("names a raw-key photo and GIF by their own kind", () => {
    const t = catalogT(ptMessages);
    expect(readableAttachmentBody("image", RAW_IMAGE_KEY, { t })).toBe("Foto");
    expect(readableAttachmentBody("gif", RAW_IMAGE_KEY, { t })).toBe("GIF");
  });

  it("falls back to the catalog copy when the translator echoes the key", () => {
    expect(
      readableAttachmentBody("document", RAW_DOCUMENT_KEY, {
        t: echoT,
        language: "pt",
      }),
    ).toBe("Ficheiro");
  });

  it("uses the given language without a translator", () => {
    expect(
      readableAttachmentBody("image", RAW_IMAGE_KEY, { language: "en" }),
    ).toBe("Photo");
    expect(
      readableAttachmentBody("image", RAW_IMAGE_KEY, { language: "pt" }),
    ).toBe("Foto");
  });

  it("reads the persisted language when none is given", () => {
    window.localStorage.setItem(STORAGE_KEY, "pt");
    expect(readableAttachmentBody("document", RAW_DOCUMENT_KEY)).toBe(
      "Ficheiro",
    );
    window.localStorage.setItem(STORAGE_KEY, "en");
    expect(readableAttachmentBody("document", RAW_DOCUMENT_KEY)).toBe("File");
  });

  it("infers the label from the key when the kind is unknown", () => {
    expect(
      readableAttachmentBody(undefined, RAW_DOCUMENT_KEY, { language: "pt" }),
    ).toBe("Ficheiro");
    expect(
      readableAttachmentBody(undefined, RAW_IMAGE_KEY, { language: "pt" }),
    ).toBe("Foto");
  });

  it("leaves a text, system or sticker message's body as stored", () => {
    for (const kind of ["user", "system", "sticker"] as const) {
      expect(
        readableAttachmentBody(kind, RAW_DOCUMENT_KEY, { language: "pt" }),
      ).toBe(RAW_DOCUMENT_KEY);
    }
  });

  it("keeps the server's mapped English label and ordinary bodies", () => {
    expect(readableAttachmentBody("document", "File", { language: "pt" })).toBe(
      "File",
    );
    expect(
      readableAttachmentBody("image", "Beach day", { language: "pt" }),
    ).toBe("Beach day");
  });
});

describe("shouldShowEditedMark", () => {
  const editedAt = "2026-09-01T10:00:00Z";

  it("shows the mark on an edited text message", () => {
    expect(shouldShowEditedMark({ editedAt, kind: undefined })).toBe(true);
    expect(shouldShowEditedMark({ editedAt, kind: "image" })).toBe(true);
  });

  it("never shows the mark on a sticker, even one a legacy edit stamped", () => {
    expect(shouldShowEditedMark({ editedAt, kind: "sticker" })).toBe(false);
  });

  it("shows nothing on an unedited message", () => {
    expect(shouldShowEditedMark({ editedAt: undefined, kind: "user" })).toBe(
      false,
    );
  });
});
