import { describe, expect, it } from "vitest";
import {
  matchedChatNamesByKey,
  withMatchedChatMentionNames,
} from "./matchedChatMentionText";
import { buildMatchedChatComposerMentions } from "./matchedChatComposerMentions";

const SOFIA = "m-2f8b6d1a4c93e75b0d6a2f19";
const SOFIA_TWO = "m-7c3a9e5b1f06d28c4a7e3b52";
const RUI = "m-0e6d2b8f4a71c39e5b0d8a63";

describe("withMatchedChatMentionNames (PRD-423)", () => {
  const names = new Map([[SOFIA, "Sofia Lopes"]]);

  it("names a known key by first name and an unknown one by the generic label", () => {
    expect(
      withMatchedChatMentionNames(
        `hi @${SOFIA}, and @${RUI}.`,
        names,
        "@member",
      ),
    ).toBe("hi @Sofia, and @member.");
  });

  it("leaves text with no key token, and a token glued to other text, alone", () => {
    expect(
      withMatchedChatMentionNames("hi @sofia-lopes", names, "@member"),
    ).toBe("hi @sofia-lopes");
    expect(withMatchedChatMentionNames(`mail@${SOFIA}`, names, "@member")).toBe(
      `mail@${SOFIA}`,
    );
  });

  it("reads names from a row's preview and roster", () => {
    expect(
      matchedChatNamesByKey({
        memberPreview: [{ handle: SOFIA, name: "Sofia" }],
        members: [{ slug: RUI, name: "Rui" }],
      }),
    ).toEqual(
      new Map([
        [SOFIA, "Sofia"],
        [RUI, "Rui"],
      ]),
    );
  });
});

describe("buildMatchedChatComposerMentions (Minor 6)", () => {
  const mentions = buildMatchedChatComposerMentions([
    { slug: SOFIA, name: "Sofia" },
    { slug: SOFIA_TWO, name: "Sofia" },
    { slug: RUI, name: "Rui" },
  ]);

  it("inserts first names, numbering a shared one", () => {
    expect(
      mentions.formatInsertedMember({
        kind: "member",
        slug: SOFIA_TWO,
        name: "Sofia",
        initials: "S",
      }),
    ).toBe("@Sofia (2)");
    expect(
      mentions.formatInsertedMember({
        kind: "member",
        slug: RUI,
        name: "Rui",
        initials: "R",
      }),
    ).toBe("@Rui");
  });

  it("encodes display names to key tokens, longest first and at a boundary", () => {
    expect(mentions.encode("@Sofia (2) and @Sofia, @Rui! @Ruiz stays")).toBe(
      `@${SOFIA_TWO} and @${SOFIA}, @${RUI}! @Ruiz stays`,
    );
  });

  it("decodes key tokens back to the same display text", () => {
    const display = "@Sofia (2) and @Sofia, @Rui!";
    expect(mentions.decode(mentions.encode(display))).toBe(display);
    expect(mentions.decode(`see @${RUI}`)).toBe("see @Rui");
  });
});
