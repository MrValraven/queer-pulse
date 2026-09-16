import { describe, expect, it } from "vitest";
import { assessLinkSafety } from "./linkSafety";

describe("assessLinkSafety", () => {
  it("does not flag an ordinary external link", () => {
    const result = assessLinkSafety("https://example.com/pride-brunch");
    expect(result.isSuspicious).toBe(false);
    expect(result.reasons).toEqual([]);
    expect(result.displayHost).toBe("example.com");
  });

  it("never flags a QueerPulse link", () => {
    expect(
      assessLinkSafety("https://queerpulse.com/messages").isSuspicious,
    ).toBe(false);
    expect(
      assessLinkSafety("https://www.queerpulse.com/messages").isSuspicious,
    ).toBe(false);
  });

  it("flags a known shortener host", () => {
    const result = assessLinkSafety("https://bit.ly/abc123");
    expect(result.isSuspicious).toBe(true);
    expect(result.reasons).toContain("shortener");
  });

  it("does not flag a host that merely contains a shortener's name", () => {
    const result = assessLinkSafety("https://not-bit.ly.example.com/x");
    expect(result.reasons).not.toContain("shortener");
  });

  it("flags a punycode/IDN host", () => {
    // A Cyrillic "а" standing in for a Latin "a" — the browser's URL parser
    // normalizes this straight to its punycode form.
    const result = assessLinkSafety("https://аpple.com/reset");
    expect(result.isSuspicious).toBe(true);
    expect(result.reasons).toContain("punycode");
  });

  it("flags an explicit xn-- host", () => {
    const result = assessLinkSafety("https://xn--pple-43d.com/reset");
    expect(result.reasons).toContain("punycode");
  });

  it("does not flag an ordinary Portuguese domain with a diacritic", () => {
    // QueerPulse serves Portugal: this is a plain accented word, normalized
    // by `URL` to an `xn--` host exactly like a homograph attack would be.
    const result = assessLinkSafety("https://câmara-lisboa.pt/agenda");
    expect(result.isSuspicious).toBe(false);
    expect(result.reasons).not.toContain("punycode");
  });

  it("does not flag an ordinary Spanish, French or German domain with a diacritic", () => {
    expect(assessLinkSafety("https://niño.es/eventos").reasons).not.toContain(
      "punycode",
    );
    expect(assessLinkSafety("https://société.fr/agenda").reasons).not.toContain(
      "punycode",
    );
    expect(assessLinkSafety("https://müller.de/kontakt").reasons).not.toContain(
      "punycode",
    );
  });

  it("does not flag a legitimate domain in a single non-Latin script", () => {
    // A real Cyrillic-script domain (no Latin characters mixed in, and not a
    // near-miss of any known brand once folded) is an ordinary foreign-script
    // domain, not a homograph.
    const result = assessLinkSafety("https://пример.рф/страница");
    expect(result.reasons).not.toContain("punycode");
  });

  it("flags an IPv4 literal host", () => {
    const result = assessLinkSafety("http://203.0.113.5/login");
    expect(result.isSuspicious).toBe(true);
    expect(result.reasons).toContain("ipAddress");
  });

  it("flags a bracketed IPv6 literal host", () => {
    const result = assessLinkSafety("http://[2001:db8::1]/login");
    expect(result.reasons).toContain("ipAddress");
  });

  it("does not flag an ordinary numeric-looking but non-IP host", () => {
    const result = assessLinkSafety("https://123movies.example.com/x");
    expect(result.reasons).not.toContain("ipAddress");
  });

  it("flags userinfo (credentials) before the host", () => {
    const result = assessLinkSafety("http://paypal.com@evil-example.com/pay");
    expect(result.isSuspicious).toBe(true);
    expect(result.reasons).toContain("credentialsInUrl");
    // The dialog must show the REAL destination, not the decoy before the @.
    expect(result.displayHost).toBe("evil-example.com");
  });

  it("flags a lookalike of a known brand (character swap)", () => {
    const result = assessLinkSafety("https://revoiut.com/confirm-deposit");
    expect(result.isSuspicious).toBe(true);
    expect(result.reasons).toContain("lookalike");
  });

  it("flags a lookalike using a digit/letter swap", () => {
    const result = assessLinkSafety("https://paypa1.com/verify");
    expect(result.reasons).toContain("lookalike");
  });

  it("does not flag an ordinary short word against a short brand target", () => {
    // "olx", "cgd", "wise" and "uber" are all 3-4 characters: a fixed 1-2
    // edit budget applied to a target this short reads almost any short word
    // as a lookalike. Each of these previously flagged against one of those
    // four targets.
    expect(assessLinkSafety("https://box.com").reasons).not.toContain(
      "lookalike",
    );
    expect(assessLinkSafety("https://visa.com").reasons).not.toContain(
      "lookalike",
    );
    expect(assessLinkSafety("https://user.com").reasons).not.toContain(
      "lookalike",
    );
    expect(assessLinkSafety("https://site.com").reasons).not.toContain(
      "lookalike",
    );
    expect(assessLinkSafety("https://old.com").reasons).not.toContain(
      "lookalike",
    );
  });

  it("does not flag an exact match of a known brand's domain", () => {
    const result = assessLinkSafety("https://paypal.com/signin");
    expect(result.reasons).not.toContain("lookalike");
    expect(result.isSuspicious).toBe(false);
  });

  it("does not flag a genuine subdomain of a known brand's domain", () => {
    const result = assessLinkSafety("https://accounts.google.com/signin");
    expect(result.reasons).not.toContain("lookalike");
  });

  it("does not flag an unrelated short host as a coincidental lookalike", () => {
    const result = assessLinkSafety("https://example.com/uber-cool-party");
    expect(result.reasons).not.toContain("lookalike");
  });

  it("can flag more than one reason at once", () => {
    const result = assessLinkSafety("http://user:pass@revoiut.com/pay");
    expect(result.reasons).toEqual(
      expect.arrayContaining(["credentialsInUrl", "lookalike"]),
    );
  });

  it("does not throw and reads as not suspicious for an unparseable href", () => {
    const result = assessLinkSafety("not a url");
    expect(result.isSuspicious).toBe(false);
    expect(result.reasons).toEqual([]);
  });
});
