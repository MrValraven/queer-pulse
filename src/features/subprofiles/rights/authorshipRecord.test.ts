import { beforeAll, describe, expect, it } from "vitest";
import { webcrypto } from "node:crypto";
import {
  buildAuthorshipRecord,
  canonicalContent,
  sha256Hex,
} from "./authorshipRecord";
import type { SubprofileItemView } from "../api/subprofiles.adapters";

// jsdom (via vitest's "jsdom" environment) may not implement
// `crypto.subtle`, which `sha256Hex` needs. Fall back to Node's own
// WebCrypto implementation, guarded so a real browser implementation (or a
// future jsdom version that ships one) always wins: mirrors the guarded
// polyfill pattern in `src/test/setup.ts`.
beforeAll(() => {
  if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle) {
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
    });
  }
});

const poemItem: SubprofileItemView = {
  id: "item-poem-pecado",
  section: "poems",
  title: "Pecado",
  createdAt: "2025-07-14T09:32:00.000Z",
  subtitle: "",
  description: "",
  url: "",
  imageUrl: "",
  date: "",
  meta: "",
  tags: [],
  isFeatured: false,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: {
    poem: [
      {
        kind: "stanza",
        id: "s1",
        lines: [[{ text: "Na escuridão", marks: [] }]],
      },
    ],
  },
};

describe("canonicalContent", () => {
  it("is deterministic and includes the poem body for poem items", () => {
    expect(canonicalContent(poemItem)).toBe(canonicalContent(poemItem));
    expect(canonicalContent(poemItem)).toContain("Na escuridão");
  });

  it("joins title + subtitle + description for non-poem items", () => {
    const portfolioItem: SubprofileItemView = {
      ...poemItem,
      section: "portfolio",
      title: "Nightform",
      subtitle: "Oil on canvas",
      description: "A study in blue.",
      structured: null,
    };
    expect(canonicalContent(portfolioItem)).toBe(
      "Nightform\nOil on canvas\nA study in blue.",
    );
  });

  it("LF-normalizes CRLF line endings and trims surrounding whitespace", () => {
    const portfolioItem: SubprofileItemView = {
      ...poemItem,
      section: "portfolio",
      title: "  Nightform  ",
      subtitle: "Oil on canvas\r\nSecond line",
      description: "",
      structured: null,
    };
    expect(canonicalContent(portfolioItem)).toBe(
      "Nightform  \nOil on canvas\nSecond line",
    );
  });
});

describe("sha256Hex", () => {
  it("returns a stable, lowercase 64-char hex digest", async () => {
    const hash = await sha256Hex("abc");
    expect(hash).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

/** The English labels `ProtectWorkSection` resolves through `t`, inlined here
 *  so this pure builder can be tested without an i18n provider. */
const EN_LABELS = {
  heading: "AUTHORSHIP RECORD: QueerPulse",
  work: "Work",
  author: "Author",
  firstPublished: "First published",
  contentHash: "Content SHA-256",
  canonicalForm:
    "Canonical form: title + plain-text body, LF-normalized, trimmed",
};

describe("buildAuthorshipRecord", () => {
  it("includes author, first-published date, a 64-hex content hash, and the body", async () => {
    const record = await buildAuthorshipRecord({
      item: poemItem,
      authorName: "Tiago",
      labels: EN_LABELS,
    });
    expect(record).toContain("AUTHORSHIP RECORD");
    expect(record).not.toContain("—"); // no em dash
    expect(record).toContain("Tiago");
    expect(record).toContain("2025-07-14T09:32:00.000Z");
    expect(record).toMatch(/Content SHA-256: [0-9a-f]{64}/);
    expect(record).toContain("Na escuridão");
  });

  it("hashes the canonical content, not the record text itself", async () => {
    const content = canonicalContent(poemItem);
    const expectedHash = await sha256Hex(content);
    const record = await buildAuthorshipRecord({
      item: poemItem,
      authorName: "Tiago",
      labels: EN_LABELS,
    });
    expect(record).toContain(`Content SHA-256: ${expectedHash}`);
  });
});
