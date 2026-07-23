import { describe, expect, it } from "vitest";
import { cardToPartner } from "./partners.adapters";
import type { PartnerCardDTO } from "./partners.api";

const baseCardDto: PartnerCardDTO = {
  slug: "ilga-portugal",
  name: "ILGA Portugal",
  logo: "ILGA",
  region: "pt",
  regionLabel: "Portugal",
  city: "Lisbon",
  desc: "Portugal's leading LGBTQ+ rights organisation.",
  tags: ["Rights", "Legal", "Crisis support"],
  tier: "Founding partner",
  since: "Partnered since 2022 · 4 years",
  featured: false,
  testimonialQuote: null,
  testimonialAuthor: null,
  testimonialRole: null,
};

describe("cardToPartner", () => {
  it("carries featured through from the DTO", () => {
    expect(cardToPartner(baseCardDto).featured).toBe(false);
    expect(cardToPartner({ ...baseCardDto, featured: true }).featured).toBe(
      true,
    );
  });

  it("builds a testimonial with quote/author/role and derived initials when the DTO has quote+author", () => {
    const partner = cardToPartner({
      ...baseCardDto,
      testimonialQuote: "QueerPulse referrals changed how fast we can help.",
      testimonialAuthor: "Marta Luís",
      testimonialRole: "Programme Director",
    });
    expect(partner.testimonial).toEqual({
      quote: "QueerPulse referrals changed how fast we can help.",
      author: "Marta Luís",
      role: "Programme Director",
      initials: "ML",
    });
  });

  it("returns testimonial: null when the DTO is missing the quote or the author", () => {
    expect(
      cardToPartner({
        ...baseCardDto,
        testimonialQuote: null,
        testimonialAuthor: "Marta Luís",
        testimonialRole: "Programme Director",
      }).testimonial,
    ).toBeNull();
    expect(
      cardToPartner({
        ...baseCardDto,
        testimonialQuote: "QueerPulse referrals changed how fast we can help.",
        testimonialAuthor: null,
        testimonialRole: "Programme Director",
      }).testimonial,
    ).toBeNull();
  });
});
