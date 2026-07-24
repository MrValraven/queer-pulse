import { describe, expect, it } from "vitest";
import { cardToPartner } from "./partners.adapters";
import type { PartnerCardDTO } from "./partners.api";

const baseCardDto: PartnerCardDTO = {
  slug: "northside-lgbti-association",
  name: "Northside LGBTI+ Association",
  logo: "NA",
  region: "pt",
  regionLabel: "Portugal",
  city: "Lisbon",
  desc: "An illustrative advocacy and support partner.",
  tags: ["Rights", "Legal", "Crisis support"],
  tier: "Operational · founding",
  since: "Illustrative partner",
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
      testimonialAuthor: "Alex Rivers",
      testimonialRole: "Programme Director",
    });
    expect(partner.testimonial).toEqual({
      quote: "QueerPulse referrals changed how fast we can help.",
      author: "Alex Rivers",
      role: "Programme Director",
      initials: "AR",
    });
  });

  it("returns testimonial: null when the DTO is missing the quote or the author", () => {
    expect(
      cardToPartner({
        ...baseCardDto,
        testimonialQuote: null,
        testimonialAuthor: "Alex Rivers",
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
