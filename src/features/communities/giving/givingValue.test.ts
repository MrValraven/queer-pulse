import { describe, expect, it } from "vitest";
import { FiCreditCard, FiLink, FiSmartphone } from "react-icons/fi";
import { SiPaypal } from "react-icons/si";
import { socialPlatform } from "../../../shared/social/socialPlatforms";
import {
  formatGivingValue,
  formatIban,
  formatMbwayNumber,
  givingValueError,
  normalizeGivingLink,
  normalizeIban,
  normalizeMbwayNumber,
} from "./givingValue";
import {
  givingLinkHost,
  givingMethodIcon,
  givingMethodTitle,
  givingPlatformForUrl,
} from "./givingPlatforms";

const VALID_IBAN = "PT50000201231234567890154";

describe("normalizeMbwayNumber", () => {
  it("keeps the 9 national digits of a Portuguese mobile", () => {
    expect(normalizeMbwayNumber("912 345 678")).toBe("912345678");
    expect(normalizeMbwayNumber("+351 912 345 678")).toBe("912345678");
    expect(normalizeMbwayNumber("00351912345678")).toBe("912345678");
    expect(normalizeMbwayNumber("912.345.678\n")).toBe("912345678");
    expect(normalizeMbwayNumber("912-345-678")).toBe("912345678");
    expect(normalizeMbwayNumber("96 123 4567")).toBe("961234567");
    expect(normalizeMbwayNumber("93 123 45 67")).toBe("931234567");
  });

  it("refuses landlines, other prefixes, short numbers and loose groupings", () => {
    expect(normalizeMbwayNumber("212345678")).toBeNull(); // landline
    expect(normalizeMbwayNumber("94 123 4567")).toBeNull(); // 94 is no mobile prefix
    expect(normalizeMbwayNumber("91234567")).toBeNull();
    expect(normalizeMbwayNumber("9 1 2 3 4 5 6 7 8")).toBeNull();
    expect(normalizeMbwayNumber("call 912345678")).toBeNull();
  });
});

describe("normalizeIban", () => {
  it("returns the compact uppercase IBAN", () => {
    expect(normalizeIban("pt50 0002 0123 1234 5678 9015 4")).toBe(VALID_IBAN);
    expect(normalizeIban("IBAN: PT50 0002 0123 1234 5678 9015 4")).toBe(
      VALID_IBAN,
    );
    expect(normalizeIban("iban PT50.0002.0123.1234.5678.9015.4")).toBe(
      VALID_IBAN,
    );
    expect(normalizeIban("PT50 0002-0123 1234 5678 9015 4\n")).toBe(VALID_IBAN);
  });

  it("refuses a bad checksum, length or country", () => {
    expect(normalizeIban("PT50000201231234567890155")).toBeNull(); // checksum
    expect(normalizeIban("PT5000020123123456789015")).toBeNull(); // length
    expect(normalizeIban("ZZ50000201231234567890154")).toBeNull(); // unknown country
  });
});

describe("normalizeGivingLink", () => {
  it("keeps an https link as typed, trimmed", () => {
    expect(normalizeGivingLink(" https://ko-fi.com/runners ")).toBe(
      "https://ko-fi.com/runners",
    );
  });

  it("adds https:// to a bare host", () => {
    expect(normalizeGivingLink("ko-fi.com/runners")).toBe(
      "https://ko-fi.com/runners",
    );
    expect(normalizeGivingLink("www.patreon.com")).toBe(
      "https://www.patreon.com",
    );
  });

  it("refuses other schemes, credentials and long links", () => {
    expect(normalizeGivingLink("http://ko-fi.com/runners")).toBeNull();
    expect(normalizeGivingLink("javascript:alert(1)")).toBeNull();
    expect(normalizeGivingLink("mailto:team@example.org")).toBeNull();
    expect(normalizeGivingLink("https://user:secret@example.org")).toBeNull();
    expect(
      normalizeGivingLink(`https://example.org/${"a".repeat(500)}`),
    ).toBeNull();
  });

  it("refuses ASCII whitespace or control characters inside a link", () => {
    expect(normalizeGivingLink("https://ko-fi.com/a b")).toBeNull();
    expect(normalizeGivingLink("https://ko-fi.com/a\tb")).toBeNull();
    expect(normalizeGivingLink("https://ko-fi.com/x\u0001")).toBeNull();
    expect(normalizeGivingLink("https://ko-fi.com/x\u007f")).toBeNull();
    expect(normalizeGivingLink("ko-fi.com/a b")).toBeNull();
  });

  it("accepts an uppercase https scheme as typed, like the server", () => {
    expect(normalizeGivingLink("HTTPS://ko-fi.com/x")).toBe(
      "HTTPS://ko-fi.com/x",
    );
  });
});

describe("givingValueError", () => {
  it("names the first problem", () => {
    expect(givingValueError("mbway", "")).toBe("required");
    expect(givingValueError("link", "   ")).toBe("required");
    expect(givingValueError("iban", "PT50 0002")).toBe("invalidIban");
    expect(givingValueError("mbway", "212345678")).toBe("invalidMbway");
    expect(givingValueError("link", "http://ko-fi.com")).toBe("invalidLink");
    // 495 characters typed, 503 once https:// is added.
    expect(givingValueError("link", `ko-fi.com/${"a".repeat(485)}`)).toBe(
      "tooLong",
    );
    expect(givingValueError("iban", VALID_IBAN)).toBeNull();
  });
});

describe("formatting", () => {
  it("groups MB WAY and IBAN values and leaves links alone", () => {
    expect(formatMbwayNumber("912345678")).toBe("912 345 678");
    expect(formatIban(VALID_IBAN)).toBe("PT50 0002 0123 1234 5678 9015 4");
    expect(formatGivingValue("link", "https://ko-fi.com/runners")).toBe(
      "https://ko-fi.com/runners",
    );
  });
});

describe("givingPlatforms", () => {
  it("titles a method from its label, platform, host or kind", () => {
    expect(
      givingMethodTitle({
        kind: "link",
        label: null,
        value: "https://www.patreon.com/x",
      }),
    ).toBe("Patreon");
    expect(
      givingMethodTitle({
        kind: "link",
        label: null,
        value: "https://example.org/help",
      }),
    ).toBe("example.org");
    expect(
      givingMethodTitle({ kind: "iban", label: null, value: VALID_IBAN }),
    ).toBe("IBAN");
    expect(
      givingMethodTitle({
        kind: "mbway",
        label: "Rita (treasurer)",
        value: "912345678",
      }),
    ).toBe("Rita (treasurer)");
  });

  it("matches subdomains and falls back to the social registry", () => {
    expect(givingPlatformForUrl("https://paypal.me/runners")?.icon).toBe(
      SiPaypal,
    );
    expect(givingPlatformForUrl("https://you.bandcamp.com")?.label).toBe(
      "Bandcamp",
    );
    expect(givingPlatformForUrl("https://notpatreon.com")).toBeNull();
    expect(givingLinkHost("https://www.Example.org/x")).toBe("example.org");
  });

  it("draws an icon per kind", () => {
    expect(
      givingMethodIcon({ kind: "link", value: "https://ko-fi.com/x" }),
    ).toBe(socialPlatform("kofi").icon);
    expect(
      givingMethodIcon({ kind: "link", value: "https://example.org" }),
    ).toBe(FiLink);
    expect(givingMethodIcon({ kind: "mbway", value: "912345678" })).toBe(
      FiSmartphone,
    );
    expect(givingMethodIcon({ kind: "iban", value: VALID_IBAN })).toBe(
      FiCreditCard,
    );
  });
});
