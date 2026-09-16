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

  it("flags a WhatsApp push (EN + PT slang)", () => {
    expect(detectContactSafetySignals("let's continue on WhatsApp")).toContain(
      "offPlatform",
    );
    expect(detectContactSafetySignals("fala comigo no whatsapp")).toContain(
      "offPlatform",
    );
    expect(detectContactSafetySignals("manda-me zap")).toContain("offPlatform");
    expect(
      detectContactSafetySignals("here's my number, wa.me/351912345678"),
    ).toContain("offPlatform");
  });

  it("flags a Telegram push (EN + PT)", () => {
    expect(detectContactSafetySignals("manda mensagem no telegram")).toContain(
      "offPlatform",
    );
    expect(detectContactSafetySignals("t.me/thisuser")).toContain(
      "offPlatform",
    );
  });

  it("does not flag 'telegram' or 't.me' inside an unrelated word", () => {
    // "telegrama" is the ordinary Portuguese word for a telegram/cable.
    expect(detectContactSafetySignals("recebi um telegrama")).not.toContain(
      "offPlatform",
    );
    // "t.me" as a bare substring, with nothing to do with Telegram's domain.
    expect(
      detectContactSafetySignals("check format.mediumsite.com for the draft"),
    ).not.toContain("offPlatform");
  });

  it("does not flag 'crypto' inside an unrelated word", () => {
    expect(
      detectContactSafetySignals("I'm reading a book on cryptography"),
    ).not.toContain("externalPayment");
  });

  it("still flags 'crypto' as its own word", () => {
    expect(detectContactSafetySignals("can you pay in crypto?")).toContain(
      "externalPayment",
    );
  });

  it("flags an Instagram push, but not the word 'insta' inside a longer word", () => {
    expect(detectContactSafetySignals("adiciona-me no insta")).toContain(
      "offPlatform",
    );
    expect(detectContactSafetySignals("DM me on IG")).toContain("offPlatform");
    // known trade-off: hyphenated "insta-" still counts as the word
    expect(
      detectContactSafetySignals("this café is so insta-worthy"),
    ).toContain("offPlatform");
    expect(
      detectContactSafetySignals("I'll install it in an instant"),
    ).not.toContain("offPlatform");
  });

  it("flags Signal only in unambiguous app phrasing, never the bare word", () => {
    expect(detectContactSafetySignals("let's talk on Signal")).toContain(
      "offPlatform",
    );
    expect(detectContactSafetySignals("here's my signal.me link")).toContain(
      "offPlatform",
    );
    expect(
      detectContactSafetySignals("no signal here, one bar at best"),
    ).not.toContain("offPlatform");
  });

  it("flags Snapchat", () => {
    expect(detectContactSafetySignals("add me on Snapchat")).toContain(
      "offPlatform",
    );
  });

  it("does not flag ordinary chat as an off-platform push", () => {
    expect(
      detectContactSafetySignals("see you at 6pm outside the café!"),
    ).not.toContain("offPlatform");
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

  it("does not flag an ISO date as a phone number", () => {
    expect(detectContactSafetySignals("vemo-nos em 2026-09-15")).not.toContain(
      "phone",
    );
    expect(detectContactSafetySignals("data: 2026.09.15")).not.toContain(
      "phone",
    );
  });

  it("does not flag a day-first date as a phone number", () => {
    expect(
      detectContactSafetySignals("visita marcada para 15/09/2026"),
    ).not.toContain("phone");
    expect(
      detectContactSafetySignals("let's meet on 15-09-2026"),
    ).not.toContain("phone");
    expect(
      detectContactSafetySignals("podemos ver a casa a 15.09.2026"),
    ).not.toContain("phone");
  });

  it("does not flag a space-grouped price or amount as a phone number", () => {
    expect(
      detectContactSafetySignals("renda de 1 200 € por mês"),
    ).not.toContain("phone");
    expect(
      detectContactSafetySignals("o depósito é de € 1 200,50"),
    ).not.toContain("phone");
    expect(
      detectContactSafetySignals("preço total: 1.200,00 combinado"),
    ).not.toContain("phone");
    expect(
      detectContactSafetySignals("preço: 1 200 000 € pela casa"),
    ).not.toContain("phone");
  });

  it("still flags a PT mobile number even next to a date or a price", () => {
    // The date/price masking must not eat a real phone number sitting
    // beside one in the same message.
    expect(
      detectContactSafetySignals(
        "vemo-nos a 2026-09-15, liga-me para 912 345 678",
      ),
    ).toContain("phone");
    expect(
      detectContactSafetySignals("renda 1 200 €, chama 912 345 678"),
    ).toContain("phone");
  });

  it("still flags PT mobiles and international numbers with a + prefix", () => {
    expect(detectContactSafetySignals("912 345 678")).toContain("phone");
    expect(detectContactSafetySignals("+351 912 345 678")).toContain("phone");
    expect(detectContactSafetySignals("+1 415 555 2671")).toContain("phone");
    expect(detectContactSafetySignals("ligar para 913-456-789")).toContain(
      "phone",
    );
  });

  it("does not let a price's thousands-style grouping swallow an adjacent phone number", () => {
    // A price regex without a bound on how many groups it absorbs can walk
    // straight through a phone number that happens to also be grouped in
    // exact 3-digit runs (a PT mobile looks exactly like thousands
    // grouping). Each of these still has a real phone number in it.
    expect(detectContactSafetySignals("sinal €50 912 345 678")).toContain(
      "phone",
    );
    expect(detectContactSafetySignals("€ 1 200 912 345 678")).toContain(
      "phone",
    );
    expect(detectContactSafetySignals("912345678 850€")).toContain("phone");
    expect(detectContactSafetySignals("paguei $20. 415 555 2671")).toContain(
      "phone",
    );
  });
});
