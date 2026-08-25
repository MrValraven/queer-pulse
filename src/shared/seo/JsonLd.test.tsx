import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./JsonLd";
import {
  buildOrganizationSchema,
  buildFaqSchema,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
  buildLocalBusinessSchema,
} from "./jsonLd.data";
import type { DirectoryPlace } from "../../features/marketing/directoryPlaces";

const basePlace: DirectoryPlace = {
  slug: "atelier-pulso",
  name: "Atelier Pulso",
  cat: "Studio",
  hood: "Príncipe Real",
  owned: false,
  av: "AP",
  tint: "coral",
  desc: "A creative studio for queer artists.",
  tagline: "A creative studio for queer artists.",
  pills: [],
  rating: { score: "0", count: 0 },
  gallery: [],
  whatItIs: [],
  goodFor: [],
  hoursType: "studio",
  hoursNote: "",
  owner: {
    name: "",
    initials: "",
    tint: "coral",
    role: "",
    bio: "",
    inQueerPulse: false,
    first: "",
  },
  social: {},
  address: "Rua da Escola Politécnica 1",
  reviews: [],
};

function scriptContents(): string[] {
  return [
    ...document.head.querySelectorAll('script[type="application/ld+json"]'),
  ].map((node) => node.textContent ?? "");
}

describe("JsonLd", () => {
  it("injects the schema into head as valid JSON", () => {
    render(<JsonLd schema={buildOrganizationSchema()} />);
    const parsed = JSON.parse(scriptContents()[0]!) as Record<string, unknown>;
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("Organization");
    expect(parsed.name).toBe("QueerPulse");
  });

  it("removes the script on unmount", () => {
    const view = render(<JsonLd schema={buildOrganizationSchema()} />);
    expect(scriptContents()).toHaveLength(1);
    view.unmount();
    expect(scriptContents()).toHaveLength(0);
  });

  it("supports two schemas on one page without collision", () => {
    render(
      <>
        <JsonLd schema={buildOrganizationSchema()} />
        <JsonLd
          schema={buildBreadcrumbSchema([
            { name: "Resources", path: "/resources" },
          ])}
        />
      </>,
    );
    expect(scriptContents()).toHaveLength(2);
  });
});

describe("schema builders", () => {
  it("builds an FAQPage with one entry per question", () => {
    const schema = buildFaqSchema([
      {
        question: "What is a vouch?",
        answer: "An existing member invites you.",
      },
    ]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(1);
    // Non-null assertion: noUncheckedIndexedAccess types array indexing as
    // `T | undefined`; the length assertion above guarantees index 0 exists.
    expect(schema.mainEntity[0]!.acceptedAnswer.text).toBe(
      "An existing member invites you.",
    );
  });

  it("builds a MedicalWebPage with an absolute url", () => {
    const schema = buildMedicalWebPageSchema({
      name: "Trans healthcare in Lisbon",
      description: "Clinics, name changes and where to start.",
      path: "/resources/trans-healthcare",
    });
    expect(schema["@type"]).toBe("MedicalWebPage");
    expect(schema.url).toBe(
      "https://queerpulse.com/resources/trans-healthcare",
    );
  });

  it("numbers breadcrumb positions from one", () => {
    const schema = buildBreadcrumbSchema([
      { name: "Resources", path: "/resources" },
      { name: "Trans healthcare", path: "/resources/trans-healthcare" },
    ]);
    // Non-null assertions: noUncheckedIndexedAccess types array indexing as
    // `T | undefined`; the two-entry input above guarantees indices 0 and 1
    // exist.
    expect(schema.itemListElement[0]!.position).toBe(1);
    expect(schema.itemListElement[1]!.position).toBe(2);
    expect(schema.itemListElement[1]!.item).toBe(
      "https://queerpulse.com/resources/trans-healthcare",
    );
  });

  it("builds a LocalBusiness with only the fields the listing has", () => {
    const schema = buildLocalBusinessSchema(
      basePlace,
      "https://queerpulse.com/local/directory/atelier-pulso",
    );
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Rua da Escola Politécnica 1",
      addressLocality: "Príncipe Real",
      addressRegion: "Lisbon",
      addressCountry: "PT",
    });
    expect(schema.geo).toBeUndefined();
    expect(schema.image).toBeUndefined();
    expect(schema.telephone).toBeUndefined();
    expect(schema.aggregateRating).toBeUndefined();
    expect(schema.priceRange).toBeUndefined();
  });

  it("includes geo, image, telephone, aggregateRating and priceRange when present", () => {
    const schema = buildLocalBusinessSchema(
      {
        ...basePlace,
        latitude: 38.7169,
        longitude: -9.1399,
        photos: {
          wide: "https://cdn.example.com/wide.jpg",
          d1: null,
          d2: null,
          vibe: null,
        },
        social: { phone: "+351 21 000 0000" },
        rating: { score: "4.8", count: 12 },
        pills: ["Wheelchair access", "€€"],
      },
      "https://queerpulse.com/local/directory/atelier-pulso",
    );
    expect(schema.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 38.7169,
      longitude: -9.1399,
    });
    expect(schema.image).toBe("https://cdn.example.com/wide.jpg");
    expect(schema.telephone).toBe("+351 21 000 0000");
    expect(schema.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: 12,
    });
    expect(schema.priceRange).toBe("€€");
  });
});
