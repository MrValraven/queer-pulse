import { describe, expect, it } from "vitest";
import type { EmailDesignInput } from "../emailDesign.types";
import type { EmailBlock } from "../emailTemplate.types";
import { renderLetterEmail } from "./letterDesign";

const ASSET_ORIGIN = "https://assets.queerpulse.test";

const welcomeBlocks: EmailBlock[] = [
  {
    id: "hero",
    type: "hero",
    eyebrow: "You're in",
    headline: "Welcome in, *{name}*.",
    text: "We read your request, and we would love to have you here.",
  },
  {
    id: "ticket",
    type: "ticket",
    label: "Your invite",
    title: "Valid until {expiresOn}",
    text: "This link is yours alone.",
    buttonLabel: "Join QueerPulse",
    href: "{inviteLink}",
  },
  { id: "divider", type: "divider" },
  { id: "inside", type: "heading", level: 2, text: "What's waiting inside" },
  {
    id: "features",
    type: "featureList",
    items: [
      { icon: "communities", title: "Communities", text: "Find your people." },
      { icon: "gatherings", title: "Gatherings", text: "Meetups near you." },
    ],
  },
  {
    id: "signature",
    type: "signature",
    name: "The QueerPulse team",
    role: "",
    note: "See you inside.",
    photoUrl: "",
  },
];

function letterInput(
  overrides: Partial<EmailDesignInput> = {},
): EmailDesignInput {
  return {
    blocks: welcomeBlocks,
    subject: "Your QueerPulse invite is ready",
    preheader: "Your invite is inside. It works until 2 October 2026.",
    values: {
      name: "Alex",
      inviteLink: "https://queerpulse.test/auth/invite/ABC?x=1&y=2",
      expiresOn: "2 October 2026",
    },
    language: "en",
    assetOrigin: ASSET_ORIGIN,
    ...overrides,
  };
}

describe("renderLetterEmail", () => {
  it("renders the welcome content as a whole document", () => {
    const html = renderLetterEmail(letterInput());
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("</html>");
    expect(html).toContain("Valid until 2 October 2026");
    expect(html).toContain("See you inside.");
  });

  it("escapes a hostile name", () => {
    const html = renderLetterEmail(
      letterInput({
        values: { ...letterInput().values, name: `Kai "K" <b>&</b>` },
      }),
    );
    expect(html).toContain("Kai &quot;K&quot; &lt;b&gt;&amp;&lt;/b&gt;");
    expect(html).not.toContain("<b>&</b>");
  });

  it("draws the hero headline with its italic name", () => {
    const html = renderLetterEmail(letterInput());
    expect(html).toMatch(/<h1[^>]*>Welcome in, <em[^>]*>Alex<\/em>\.<\/h1>/);
  });

  it("puts the filled invite link on the ticket button", () => {
    const html = renderLetterEmail(letterInput());
    expect(html).toContain(
      'href="https://queerpulse.test/auth/invite/ABC?x=1&amp;y=2"',
    );
    expect(html).toContain("Join QueerPulse");
  });

  it("builds every hosted image from the given asset origin", () => {
    const html = renderLetterEmail(letterInput());
    const imageSources = [...html.matchAll(/<img src="([^"]+)"/g)].map(
      (match) => match[1] ?? "",
    );
    expect(imageSources.length).toBeGreaterThan(0);
    for (const source of imageSources) {
      expect(source.startsWith(`${ASSET_ORIGIN}/email/`)).toBe(true);
    }
  });

  it("includes the preheader", () => {
    const html = renderLetterEmail(letterInput());
    expect(html).toContain(
      "Your invite is inside. It works until 2 October 2026.",
    );
  });

  it("opens with a byline in the email's language for a signer with a photo", () => {
    const photoUrl = "https://photos.queerpulse.test/robin.jpg";
    const signed = welcomeBlocks.map((block) =>
      block.type === "signature"
        ? { ...block, name: "Robin Vale", photoUrl }
        : block,
    );
    const englishHtml = renderLetterEmail(letterInput({ blocks: signed }));
    expect(englishHtml).toContain("A note from");
    expect(englishHtml).toContain(`<img src="${photoUrl}"`);
    expect(
      renderLetterEmail(letterInput({ blocks: signed, language: "pt" })),
    ).toContain("Uma nota de");
  });

  it("draws no byline without a photo, and keeps the sign-off", () => {
    const html = renderLetterEmail(letterInput());
    expect(html).not.toContain("A note from");
    expect(html).toContain("See you inside.");
    expect(html.match(/The QueerPulse team/g)).toHaveLength(1);
    const unsigned = welcomeBlocks.filter(
      (block) => block.type !== "signature",
    );
    expect(renderLetterEmail(letterInput({ blocks: unsigned }))).not.toContain(
      "A note from",
    );
  });
});
