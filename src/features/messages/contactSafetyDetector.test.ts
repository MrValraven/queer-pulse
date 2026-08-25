import { describe, expect, it } from "vitest";
import { detectContactSafetySignals } from "./contactSafetyDetector";

describe("detectContactSafetySignals", () => {
  it("flags nothing for ordinary chat", () => {
    expect(
      detectContactSafetySignals("See you at 6pm outside the café!"),
    ).toEqual([]);
    expect(detectContactSafetySignals("")).toEqual([]);
    expect(detectContactSafetySignals("   ")).toEqual([]);
  });

  it("flags a phone number", () => {
    expect(detectContactSafetySignals("call me on +351 912 345 678")).toContain(
      "phone",
    );
  });

  it("flags an email address", () => {
    expect(
      detectContactSafetySignals("reach me at alex.doe@example.com"),
    ).toContain("email");
  });

  it("flags an IBAN", () => {
    expect(
      detectContactSafetySignals("transfer to PT50 0002 0123 1234 5678 9015 4"),
    ).toContain("banking");
  });

  it("flags a banking keyword without a pasted IBAN", () => {
    expect(
      detectContactSafetySignals("send me your bank account details"),
    ).toContain("banking");
    expect(
      detectContactSafetySignals("manda-me os teus dados bancários"),
    ).toContain("banking");
  });

  it("flags an external-payment prompt (EN + PT)", () => {
    expect(detectContactSafetySignals("just PayPal me the deposit")).toContain(
      "externalPayment",
    );
    expect(
      detectContactSafetySignals("preciso do pagamento antecipado por MB WAY"),
    ).toEqual(expect.arrayContaining(["externalPayment"]));
  });

  it("can flag more than one signal in the same message", () => {
    const signals = detectContactSafetySignals(
      "Pay me via PayPal first, my email is host@example.com, call +351 912 345 678",
    );
    expect(signals).toEqual(
      expect.arrayContaining(["phone", "email", "externalPayment"]),
    );
  });

  it("does not flag a short, ordinary number", () => {
    // A price or a small count shouldn't read as a phone number.
    expect(detectContactSafetySignals("it costs 350€ a month")).not.toContain(
      "phone",
    );
  });
});
