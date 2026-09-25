import { describe, expect, it } from "vitest";
import type { EmailLocaleContent } from "./emailTemplate.types";
import {
  portugueseFromEnglish,
  switchToBlocks,
  switchToHtml,
  toWriteBody,
  unknownTokensIn,
} from "./emailTemplateDraft";

const english: EmailLocaleContent = {
  subject: "Hi {name}",
  mode: "blocks",
  html: null,
  blocks: [{ id: "p-1", type: "paragraph", text: "Join at {inviteLink}" }],
};

describe("emailTemplateDraft", () => {
  it("round-trips html mode without losing blocks", () => {
    const asHtml = switchToHtml(english, "<p>custom</p>");
    expect(asHtml).toMatchObject({
      mode: "html",
      html: "<p>custom</p>",
      blocks: english.blocks,
    });
    expect(switchToBlocks(asHtml)).toEqual(english);
  });

  it("starts Portuguese from English with new block ids", () => {
    const portuguese = portugueseFromEnglish(english);
    expect(portuguese.subject).toBe(english.subject);
    expect(portuguese.blocks[0]?.id).not.toBe("p-1");
  });

  it("trims the label and sends pt as null when absent", () => {
    const body = toWriteBody({
      label: "  Welcome  ",
      purpose: "invite_approved",
      isActive: true,
      locales: { en: english, pt: null },
    });
    expect(body.label).toBe("Welcome");
    expect(body.locales.pt).toBeNull();
  });

  it("scans the preheader and every text of the newer blocks", () => {
    const withNewBlocks: EmailLocaleContent = {
      subject: "Hello",
      preheader: "Until {expiresOn}",
      mode: "blocks",
      html: null,
      blocks: [
        {
          id: "hero",
          type: "hero",
          eyebrow: "",
          headline: "Welcome, *{name}*",
          text: "",
        },
        {
          id: "ticket",
          type: "ticket",
          label: "Invite",
          title: "Valid",
          text: "",
          buttonLabel: "Join",
          href: "{inviteLink}",
        },
        {
          id: "features",
          type: "featureList",
          items: [{ icon: "communities", title: "{unknownTitle}", text: "" }],
        },
        {
          id: "signature",
          type: "signature",
          name: "Team",
          role: "",
          note: "{unknownNote}",
          photoUrl: "",
        },
      ],
    };
    expect(unknownTokensIn(withNewBlocks, "invite_approved")).toEqual([
      "unknownTitle",
      "unknownNote",
    ]);
    expect(unknownTokensIn(withNewBlocks, "general")).toEqual([
      "expiresOn",
      "name",
      "inviteLink",
      "unknownTitle",
      "unknownNote",
    ]);
  });

  it("flags tokens a general template cannot use", () => {
    expect(unknownTokensIn(english, "general")).toEqual(["name", "inviteLink"]);
    expect(unknownTokensIn(english, "invite_approved")).toEqual([]);
  });
});
