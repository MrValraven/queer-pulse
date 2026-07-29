import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./JsonLd";
import {
  buildOrganizationSchema,
  buildFaqSchema,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "./jsonLd.data";

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
      { question: "What is a vouch?", answer: "An existing member invites you." },
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
});
