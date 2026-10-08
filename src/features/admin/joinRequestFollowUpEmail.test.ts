import { describe, expect, it } from "vitest";
import {
  followUpClipboardText,
  followUpMailto,
} from "./joinRequestFollowUpEmail";

const message = {
  subject: "Your QueerPulse invite request",
  body: "Hi Ana & Rui,\n\nAre you #1? 100% yes.",
};

describe("followUpMailto", () => {
  it("encodes subject and body so & # ? % and newlines survive", () => {
    const href = followUpMailto("ana@example.com", message);
    const url = new URL(href);
    expect(url.protocol).toBe("mailto:");
    expect(url.searchParams.get("subject")).toBe(message.subject);
    expect(url.searchParams.get("body")).toBe(message.body);
  });

  it("keeps a plus-addressed email intact", () => {
    const href = followUpMailto("sam+qp@example.com", message);
    const [addressPart = ""] = href.split("?");
    expect(decodeURIComponent(addressPart)).toBe("mailto:sam+qp@example.com");
  });

  it("cannot be steered by an address carrying query syntax", () => {
    const href = followUpMailto("a&body=pwned?x@example.com", message);
    const url = new URL(href);
    expect(url.searchParams.get("body")).toBe(message.body);
    expect(url.searchParams.getAll("body")).toHaveLength(1);
  });
});

describe("followUpClipboardText", () => {
  it("puts the subject, a blank line, then the body", () => {
    expect(followUpClipboardText(message)).toBe(
      `${message.subject}\n\n${message.body}`,
    );
  });
});
