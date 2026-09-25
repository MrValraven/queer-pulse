import { describe, expect, it } from "vitest";
import type { EmailDesignInput } from "../emailDesign.types";
import type { EmailBlock } from "../emailTemplate.types";
import { renderStageEmail } from "./stageDesign";

const ORIGIN = "https://assets.queerpulse.test";
const INVITE_LINK = "https://queerpulse.test/auth/invite/ABC?x=1&y=2";

const WELCOME_BLOCKS: EmailBlock[] = [
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

function inputWith(
  overrides: Partial<EmailDesignInput> = {},
): EmailDesignInput {
  return {
    blocks: WELCOME_BLOCKS,
    subject: "Your QueerPulse invite is ready",
    preheader: "Your invite is inside. It works until 2 October 2026.",
    values: {
      name: "Alex",
      inviteLink: INVITE_LINK,
      expiresOn: "2 October 2026",
    },
    language: "en",
    assetOrigin: ORIGIN,
    ...overrides,
  };
}

describe("renderStageEmail", () => {
  it("renders the welcome content as a whole document", () => {
    const html = renderStageEmail(inputWith());
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("</html>");
    expect(html).toContain(
      'Valid until <span style="white-space:nowrap;">2 October 2026</span>',
    );
    expect(html).toContain("What&#39;s waiting inside");
  });

  it("escapes a hostile name", () => {
    const html = renderStageEmail(
      inputWith({
        values: {
          name: `Kai "K" <b>&</b>`,
          inviteLink: INVITE_LINK,
          expiresOn: "2 October 2026",
        },
      }),
    );
    expect(html).toContain("Kai &quot;K&quot; &lt;b&gt;&amp;&lt;/b&gt;");
    expect(html).not.toContain("<b>&</b>");
  });

  it("lifts the leading hero headline into the masthead", () => {
    const html = renderStageEmail(inputWith());
    const headlineIndex = html.indexOf("Welcome in, ");
    expect(headlineIndex).toBeGreaterThan(-1);
    expect(html.indexOf("hero-pulse.gif")).toBeGreaterThan(headlineIndex);
    expect(html).toContain("<h1 ");
  });

  it("puts the filled invite link on the ticket button", () => {
    const html = renderStageEmail(inputWith());
    expect(html).toContain(
      'href="https://queerpulse.test/auth/invite/ABC?x=1&amp;y=2"',
    );
    expect(html).toContain("Join QueerPulse");
    expect(html).not.toContain("{inviteLink}");
  });

  it("puts the ticket button before the fine print on the stub", () => {
    const html = renderStageEmail(inputWith());
    const titleIndex = html.indexOf("Valid until ");
    const buttonIndex = html.indexOf(">Join QueerPulse</a>");
    const finePrintIndex = html.indexOf("This link is yours alone.");
    expect(titleIndex).toBeGreaterThan(-1);
    expect(buttonIndex).toBeGreaterThan(titleIndex);
    expect(finePrintIndex).toBeGreaterThan(buttonIndex);
  });

  it("builds every hosted image URL from the asset origin", () => {
    const html = renderStageEmail(inputWith());
    const sources = [...html.matchAll(/<img src="([^"]+)"/g)].map(
      (match) => match[1] ?? "",
    );
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(source.startsWith(`${ORIGIN}/email/`)).toBe(true);
    }
  });

  it("draws the preheader", () => {
    const html = renderStageEmail(inputWith());
    expect(html).toContain(
      "Your invite is inside. It works until 2 October 2026.",
    );
    expect(html).toContain("display:none");
  });

  it("keeps the logo and the pulse band without a leading hero", () => {
    const html = renderStageEmail(
      inputWith({ blocks: WELCOME_BLOCKS.slice(1) }),
    );
    expect(html).toContain("logo-on-dark.png");
    expect(html).toContain("hero-pulse.gif");
    expect(html).not.toContain("<h1 ");
  });
});
