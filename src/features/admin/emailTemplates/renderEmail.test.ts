import { describe, expect, it } from "vitest";
import type { EmailLocaleContent } from "./emailTemplate.types";
import { renderEmail } from "./renderEmail";

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
