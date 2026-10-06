import { describe, expect, it } from "vitest";
import {
  findPaymentDetails,
  fundingLinkHost,
  fundingLinkKey,
  isAllowedFundraisingHost,
  IBAN_LENGTH_BY_COUNTRY,
  parseHttpsUrl,
  stripLeadingWww,
} from "./fundingLink";

describe("fundingLink", () => {
  it("accepts https only", () => {
    expect(parseHttpsUrl("https://example.org/call")).not.toBeNull();
    expect(parseHttpsUrl("http://example.org/call")).toBeNull();
    expect(parseHttpsUrl("example.org/call")).toBeNull();
    expect(parseHttpsUrl("   ")).toBeNull();
  });

  it("reads the host without www and lowercased", () => {
    expect(fundingLinkHost("https://WWW.GoFundMe.com/f/rui")).toBe(
      "gofundme.com",
    );
  });

  it("normalises the link key the way the backend does", () => {
    expect(
      fundingLinkKey(
        "https://www.Example.org/calls/arts-2026/?utm_source=x&fbclid=y#apply",
      ),
    ).toBe("example.org/calls/arts-2026");
  });

  it("keeps a parameter that selects the page, sorted, in the link key", () => {
    expect(fundingLinkKey("https://example.org/c?id=2&a=1&utm_x=3")).toBe(
      "example.org/c?a=1&id=2",
    );
  });

  it("refuses credentials, bare hosts and empty host labels", () => {
    expect(parseHttpsUrl("https://gofundme.com@evil.io/")).toBeNull();
    expect(parseHttpsUrl("https://localhost/x")).toBeNull();
    expect(parseHttpsUrl("https://www./x")).toBeNull();
  });

  it("refuses an explicit port on a fundraiser link", () => {
    expect(isAllowedFundraisingHost("https://gofundme.com:8443/f")).toBe(false);
    expect(isAllowedFundraisingHost("https://gofundme.com:443/f")).toBe(true);
  });

  it("matches the fundraising allow-list exactly", () => {
    expect(isAllowedFundraisingHost("https://gofundme.com/f/rui")).toBe(true);
    expect(isAllowedFundraisingHost("https://www.ppl.pt/causas/x")).toBe(true);
    expect(isAllowedFundraisingHost("https://gofundme.com.evil.io/f")).toBe(
      false,
    );
    expect(isAllowedFundraisingHost("https://evilgofundme.com/f")).toBe(false);
    expect(isAllowedFundraisingHost("http://gofundme.com/f/rui")).toBe(false);
    expect(isAllowedFundraisingHost("https://pay.gofundme.com/f")).toBe(false);
  });

  it("finds an IBAN written compact, spaced or after a label", () => {
    expect(findPaymentDetails("PT50000201231234567890154")).toBe("iban");
    expect(findPaymentDetails("my IBAN PT50 0002 0123 1234 5678 9015 4")).toBe(
      "iban",
    );
    expect(findPaymentDetails("IBAN DE89 3704 0044 0532 0130 00")).toBe("iban");
  });

  it("finds real IBANs in any case and with any separator", () => {
    expect(findPaymentDetails("DE89370400440532013000")).toBe("iban");
    expect(findPaymentDetails("GB82WEST12345698765432")).toBe("iban");
    expect(findPaymentDetails("iban pt50000201231234567890154")).toBe("iban");
    expect(findPaymentDetails("IBANpt50000201231234567890154")).toBe("iban");
    expect(findPaymentDetails("PT50-0002-0123-1234-5678-9015-4")).toBe("iban");
    expect(findPaymentDetails("PT50.0002.0123.1234.5678.9015.4")).toBe("iban");
    expect(
      findPaymentDetails("PT50\u00A00002\u00A00123 1234  5678 9015 4"),
    ).toBe("iban");
    expect(
      findPaymentDetails(
        "PT50\u202F0002\u202F0123\u202F1234\u202F5678\u202F9015\u202F4",
      ),
    ).toBe("iban");
  });

  it("finds a real IBAN behind a look-alike", () => {
    expect(
      findPaymentDetails("PT2030 IBAN PT50 0002 0123 1234 5678 9015 4"),
    ).toBe("iban");
    expect(findPaymentDetails("Ref AB12 PT50000201231234567890154")).toBe(
      "iban",
    );
    expect(findPaymentDetails("EU2026 PT50000201231234567890154")).toBe("iban");
    expect(findPaymentDetails("xx99 PT50000201231234567890154")).toBe("iban");
  });

  it("leaves prose that only looks like an IBAN alone", () => {
    expect(
      findPaymentDetails("PT2030 printing queer share and with"),
    ).toBeNull();
    expect(
      findPaymentDetails("Horizon2020 funding for queer arts groups"),
    ).toBeNull();
    expect(
      findPaymentDetails("Covid19 relief for queer shelters now"),
    ).toBeNull();
    expect(
      findPaymentDetails("Pride2026 march and street party tickets"),
    ).toBeNull();
  });

  it("refuses a link whose encoded form outgrows the limit", () => {
    const longPath = "https://example.org/" + "\u00e9".repeat(700);
    expect(longPath.length).toBeLessThan(2048);
    expect(parseHttpsUrl(longPath)).toBeNull();
  });

  it("ignores a candidate with a wrong checksum", () => {
    expect(findPaymentDetails("PT50000201231234567890155")).toBeNull();
    expect(findPaymentDetails("EU2026 PROJECT FUNDING 2027 2028")).toBeNull();
  });

  it("finds a Portuguese mobile number in its usual spellings", () => {
    expect(findPaymentDetails("ligam para 912 345 678")).toBe("phone");
    expect(findPaymentDetails("+351 912345678")).toBe("phone");
    expect(findPaymentDetails("+351912345678")).toBe("phone");
    expect(findPaymentDetails("00351 962-345-678")).toBe("phone");
    expect(findPaymentDetails("91 234 5678")).toBe("phone");
    expect(findPaymentDetails("91 234 56 78")).toBe("phone");
    expect(findPaymentDetails("912.345.678")).toBe("phone");
  });

  it("leaves landlines, budgets, years and capitalised prose alone", () => {
    expect(findPaymentDetails("Call 212 345 678 for the venue")).toBeNull();
    expect(findPaymentDetails("A budget of 15000 for 2026")).toBeNull();
    expect(
      findPaymentDetails("EU2026 PROJECT FUNDING FOR COLLECTIVES"),
    ).toBeNull();
    expect(findPaymentDetails("Order 1912345678 arrived")).toBeNull();
  });

  it("finds real IBANs from several countries at their registry length", () => {
    expect(findPaymentDetails("FR1420041010050500013M02606")).toBe("iban");
    expect(findPaymentDetails("NL91ABNA0417164300")).toBe("iban");
    expect(findPaymentDetails("ES91 2100 0418 4502 0005 1332")).toBe("iban");
    expect(findPaymentDetails("BE68539007547034")).toBe("iban");
    expect(findPaymentDetails("IT60X0542811101000000123456")).toBe("iban");
  });

  it("leaves numbers in prose alone when no registry length fits", () => {
    expect(findPaymentDetails("PT2030 1000 2024 150 30 month")).toBeNull();
    expect(
      findPaymentDetails("Covid19 grants 2026 for 150 centres in 30 towns"),
    ).toBeNull();
  });

  it("reads a Portuguese IBAN at 25 characters only, whatever its checksum", () => {
    // 24 characters with a valid mod-97 checksum: one short of a PT IBAN.
    expect(findPaymentDetails("PT4000020123123456789012")).toBeNull();
    expect(findPaymentDetails("PT40 0002 0123 1234 5678 9012")).toBeNull();
    expect(IBAN_LENGTH_BY_COUNTRY.PT).toBe(25);
    expect(Object.keys(IBAN_LENGTH_BY_COUNTRY)).toHaveLength(89);
  });

  it("finds a mobile number with up to three separators between groups", () => {
    expect(findPaymentDetails("912  345  678")).toBe("phone");
    expect(findPaymentDetails("+351   912 - 345 - 678")).toBe("phone");
  });

  it("strips one leading www. the way the backend does", () => {
    expect(stripLeadingWww("www.gofundme.com")).toBe("gofundme.com");
    expect(stripLeadingWww("www.www.example.org")).toBe("www.example.org");
    expect(stripLeadingWww("ppl.pt")).toBe("ppl.pt");
  });
});
