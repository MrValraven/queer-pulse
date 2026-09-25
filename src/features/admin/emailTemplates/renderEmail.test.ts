import { describe, expect, it } from "vitest";
import {
  bulletproofButtonHtml,
  linkFallbackHtml,
  preheaderHtml,
} from "./design/emailShared";
import type { EmailBlock, EmailLocaleContent } from "./emailTemplate.types";
import { renderEmail } from "./renderEmail";
import { blockToText } from "./renderEmailBlocks";

const values = {
  name: `Kai "K" <b>&</b>`,
  inviteLink: "https://queerpulse.test/invite/ABC?x=1&y=2",
  expiresOn: "1 October 2026",
};

function blocksContent(
  overrides: Partial<EmailLocaleContent> = {},
): EmailLocaleContent {
  return {
    subject: "Welcome, {name}",
    mode: "blocks",
    html: null,
    blocks: [
      { id: "h", type: "heading", level: 1, text: "Hi {name}" },
      { id: "b", type: "button", label: "Join", href: "{inviteLink}" },
      {
        id: "p",
        type: "paragraph",
        text: "**Bold** and *soft* [docs](https://queerpulse.test/help)\nuntil {expiresOn}",
      },
    ],
    ...overrides,
  };
}

describe("renderEmail", () => {
  it("escapes filled values in HTML and keeps them verbatim in subject and text", () => {
    const email = renderEmail(blocksContent(), values, "en");
    expect(email.html).toContain(
      "Hi Kai &quot;K&quot; &lt;b&gt;&amp;&lt;/b&gt;",
    );
    expect(email.html).not.toContain("<b>&</b>");
    expect(email.subject).toBe(`Welcome, Kai "K" <b>&</b>`);
    expect(email.text).toContain(`Hi Kai "K" <b>&</b>`);
  });

  it("fills the button link with an attribute-safe URL", () => {
    const email = renderEmail(blocksContent(), values, "en");
    expect(email.html).toContain(
      'href="https://queerpulse.test/invite/ABC?x=1&amp;y=2"',
    );
    expect(email.text).toContain(
      "Join: https://queerpulse.test/invite/ABC?x=1&y=2",
    );
  });

  it("renders paragraph mini-markup", () => {
    const { html } = renderEmail(blocksContent(), values, "en");
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<em>soft</em>");
    expect(html).toMatch(
      /<a href="https:\/\/queerpulse\.test\/help"[^>]*>docs<\/a>/,
    );
    expect(html).toContain("<br>until 1 October 2026");
  });

  it("renders heading *emphasis* as an escaped coral italic and strips it in text", () => {
    const email = renderEmail(
      blocksContent({
        blocks: [
          {
            id: "h",
            type: "heading",
            level: 1,
            text: "Welcome <i>in</i>, *{name}*",
          },
        ],
      }),
      values,
      "en",
    );
    expect(email.html).toContain(
      'Welcome &lt;i&gt;in&lt;/i&gt;, <em style="font-style:italic;color:#a84430;">Kai &quot;K&quot; &lt;b&gt;&amp;&lt;/b&gt;</em>',
    );
    expect(email.text).toContain(`Welcome <i>in</i>, Kai "K" <b>&</b>`);
    expect(email.text).not.toContain("*");
  });

  it("leaves a token with no value literal", () => {
    const { html } = renderEmail(blocksContent(), { name: "Alex" }, "en");
    expect(html).toContain("{expiresOn}");
  });

  it("wraps blocks in the shell with the footer in the email's language", () => {
    const email = renderEmail(blocksContent(), values, "pt");
    expect(email.html.startsWith("<!doctype html>")).toBe(true);
    expect(email.html).toContain('<html lang="pt">');
    expect(email.text).toContain(
      "Recebes isto porque pediste para entrar no QueerPulse.",
    );
  });

  it("passes HTML mode through without the shell, CSS braces untouched", () => {
    const email = renderEmail(
      blocksContent({
        mode: "html",
        html: '<style>p{margin:0}</style><p>Hi {name}</p><a href="{inviteLink}">Join</a>',
      }),
      values,
      "en",
    );
    expect(email.html.startsWith("<style>p{margin:0}</style>")).toBe(true);
    expect(email.html).toContain("Hi Kai &quot;K&quot;");
    expect(email.text).toContain(
      "Join (https://queerpulse.test/invite/ABC?x=1&y=2)",
    );
  });
});

type BlockOf<Type extends EmailBlock["type"]> = Extract<
  EmailBlock,
  { type: Type }
>;

const escapedName = "Kai &quot;K&quot; &lt;b&gt;&amp;&lt;/b&gt;";
const escapedInviteLink = "https://queerpulse.test/invite/ABC?x=1&amp;y=2";

const heroBlock: BlockOf<"hero"> = {
  id: "hero",
  type: "hero",
  eyebrow: "Hello <you>, {name}",
  headline: "You are *in*, {name}",
  text: "Your invite **waits** until {expiresOn}",
};
const ticketBlock: BlockOf<"ticket"> = {
  id: "ticket",
  type: "ticket",
  label: "Your <pass>",
  title: "Valid until {expiresOn}",
  text: "For {name} only",
  buttonLabel: "Accept & join",
  href: "{inviteLink}",
};
const featureListBlock: BlockOf<"featureList"> = {
  id: "features",
  type: "featureList",
  items: [
    { icon: "communities", title: "Groups <3", text: "Find {name} a home" },
    { icon: "safety", title: "Safety", text: "Tools that protect you" },
  ],
};
const signatureBlock: BlockOf<"signature"> = {
  id: "signature",
  type: "signature",
  name: "Ana <Silva>",
  role: "Welcome team",
  note: "See you inside, {name}",
  photoUrl: "",
};

function newBlocksContent(preheader?: string): EmailLocaleContent {
  return blocksContent({
    preheader,
    blocks: [heroBlock, ticketBlock, featureListBlock, signatureBlock],
  });
}

describe("renderEmail preheader", () => {
  it("puts the hidden preheader first in the body, escaped and filled", () => {
    const { html } = renderEmail(
      newBlocksContent("Your invite, {name}"),
      values,
      "en",
    );
    const afterBody = html.split(/<body[^>]*>\n/)[1] ?? "";
    expect(afterBody).toMatch(
      /^<div style="max-height:0;overflow:hidden;mso-hide:all;[^"]*opacity:0;">/,
    );
    expect(afterBody).toContain(`Your invite, ${escapedName}&#847;&zwnj;`);
  });

  it("keeps the preheader rendered so a paste into a compose window keeps it", () => {
    const html = preheaderHtml("Hello", "#f7f3ee");
    expect(html).not.toContain("display:none");
    expect(html).not.toContain("visibility:hidden");
  });

  it("draws no preheader when the template has none", () => {
    const { html } = renderEmail(newBlocksContent(), values, "en");
    expect(html).not.toContain("max-height:0");
    expect(preheaderHtml("  ", "#ffffff")).toBe("");
  });
});

describe("renderEmail new blocks in the current design", () => {
  it("renders the hero with its escaped eyebrow, headline and text", () => {
    const { html } = renderEmail(newBlocksContent(), values, "en");
    expect(html).toContain(`Hello &lt;you&gt;, ${escapedName}`);
    expect(html).toMatch(
      /<h1[^>]*>You are <em style="font-style:italic;color:#a84430;">in<\/em>, Kai &quot;K&quot;/,
    );
    expect(html).toContain(
      "Your invite <strong>waits</strong> until 1 October 2026",
    );
  });

  it("renders the ticket with its text, a VML button and the link fallback", () => {
    const { html } = renderEmail(newBlocksContent(), values, "en");
    expect(html).toContain("Your &lt;pass&gt;");
    expect(html).toMatch(/<h2[^>]*>Valid until 1 October 2026<\/h2>/);
    expect(html).toContain(`For ${escapedName} only`);
    expect(html).toContain("Accept &amp; join");
    expect(html).toContain(`<v:roundrect`);
    expect(html).toContain(`href="${escapedInviteLink}" style="height:`);
    expect(html).toContain("Button not working? Paste this link");
    expect(html).toContain(`>${escapedInviteLink}</a>`);
  });

  it("writes the link fallback in the email's language", () => {
    const { html } = renderEmail(newBlocksContent(), values, "pt");
    expect(html).toContain(
      "O botão não funciona? Cola este link no navegador:",
    );
  });

  it("keeps an unfilled invite token in the fallback line", () => {
    const { html } = renderEmail(newBlocksContent(), {}, "en");
    expect(html).toContain(">{inviteLink}</a>");
  });

  it("renders feature rows with escaped titles and filled text", () => {
    const { html } = renderEmail(newBlocksContent(), values, "en");
    expect(html).toContain("Groups &lt;3");
    expect(html).toContain(`Find ${escapedName} a home`);
    expect(html).toContain("Tools that protect you");
  });

  it("renders the signature note, name and role", () => {
    const { html } = renderEmail(newBlocksContent(), values, "en");
    expect(html).toMatch(/font-style:italic;[^>]*>See you inside, Kai &quot;K/);
    expect(html).toContain("Ana &lt;Silva&gt;");
    expect(html).toContain("Welcome team");
  });

  it("prefixes hosted images with the asset origin", () => {
    const { html } = renderEmail(newBlocksContent(), values, "en", {
      assetOrigin: "https://preview.queerpulse.test/",
    });
    expect(html).toContain(
      'src="https://preview.queerpulse.test/email/icon-communities.png"',
    );
    expect(html).toContain(
      'src="https://preview.queerpulse.test/email/pulse-mark.gif"',
    );
  });

  it("defaults hosted images to the public site", () => {
    const { html } = renderEmail(newBlocksContent(), values, "en");
    expect(html).toContain(
      'src="https://queerpulse.com/email/icon-safety.png"',
    );
  });

  it("uses the signer's photo when one is set", () => {
    const { html } = renderEmail(
      blocksContent({
        blocks: [
          { ...signatureBlock, photoUrl: "https://cdn.test/ana.jpg?a=1&b=2" },
        ],
      }),
      values,
      "en",
    );
    expect(html).toContain('src="https://cdn.test/ana.jpg?a=1&amp;b=2"');
    expect(html).not.toContain("pulse-mark.gif");
  });
});

describe("blockToText for the new blocks", () => {
  it("joins the hero parts with blank lines and fills placeholders", () => {
    expect(blockToText(heroBlock, values)).toBe(
      `Hello <you>, ${values.name}\n\nYou are in, ${values.name}\n\nYour invite waits until 1 October 2026`,
    );
  });

  it("skips empty hero parts", () => {
    const block: BlockOf<"hero"> = { ...heroBlock, eyebrow: "", text: " " };
    expect(blockToText(block, values)).toBe(`You are in, ${values.name}`);
  });

  it("ends the ticket with the button label and the raw link", () => {
    expect(blockToText(ticketBlock, values)).toBe(
      `Your <pass>\n\nValid until 1 October 2026\n\nFor ${values.name} only\n\nAccept & join: ${values.inviteLink}`,
    );
  });

  it("lists feature rows as dashes", () => {
    expect(blockToText(featureListBlock, values)).toBe(
      `- Groups <3: Find ${values.name} a home\n- Safety: Tools that protect you`,
    );
  });

  it("puts the signature parts on separate lines, skipping empties", () => {
    expect(blockToText({ ...signatureBlock, role: "" }, values)).toBe(
      `See you inside, ${values.name}\nAna <Silva>`,
    );
  });
});

describe("email shared helpers", () => {
  const buttonOptions = {
    label: "Join <now>",
    href: "https://queerpulse.test/join?a=1&b=2",
    fillColor: "#d5431e",
    textColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    fontSizePx: 16,
    heightPx: 52,
    radiusPx: 26,
  };

  it("draws a VML button for Outlook that carries the escaped href", () => {
    const html = bulletproofButtonHtml(buttonOptions);
    expect(html).toContain("<!--[if mso]><v:roundrect");
    expect(html).toContain(
      'href="https://queerpulse.test/join?a=1&amp;b=2" style="height:52px;',
    );
    expect(html).toContain('arcsize="50%"');
    expect(html).toContain("<!--[if !mso]><!--><a href=");
    expect(html).toContain("Join &lt;now&gt;</center>");
    expect(html).toContain("Join &lt;now&gt;</a><!--<![endif]-->");
  });

  it("stretches a full-width button", () => {
    const html = bulletproofButtonHtml({
      ...buttonOptions,
      isFullWidth: true,
      widthPx: 480,
    });
    expect(html).toContain('width="100%"');
    expect(html).toContain("display:block;width:100%;");
    expect(html).toContain("width:480px;");
  });

  it("skips the link fallback for a link that is neither http(s) nor a token", () => {
    const options = {
      language: "en" as const,
      textColor: "#6a6a6d",
      linkColor: "#a84430",
      fontFamily: "Arial, sans-serif",
    };
    expect(linkFallbackHtml({ ...options, href: "mailto:hi@x.test" })).toBe("");
    expect(linkFallbackHtml({ ...options, href: "" })).toBe("");
    expect(
      linkFallbackHtml({ ...options, href: "https://x.test/a" }),
    ).toContain("word-break:break-all;");
  });
});
