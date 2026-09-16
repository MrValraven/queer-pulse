import { describe, expect, it } from "vitest";
import {
  MESSAGE_BODY_MAX_LENGTH,
  getMessageBodyLength,
  isMessageBodyOverLimit,
  shouldShowMessageLengthCounter,
} from "./messageBodyLimit";

describe("getMessageBodyLength", () => {
  it("trims before measuring, matching the server's TrimMessageBody transform", () => {
    expect(getMessageBodyLength("  hello  ")).toBe(5);
    expect(getMessageBodyLength("\n\n   \n")).toBe(0);
  });

  it("counts a surrogate-pair emoji as one character, matching validator's isLength", () => {
    // String.fromCodePoint (not a string-literal escape) keeps this file free
    // of a raw emoji glyph for the `local/no-emoji` lint rule while still
    // producing the real two-UTF-16-code-unit surrogate pair at runtime,
    // exactly like a pasted emoji would.
    const grinningFaceEmoji = String.fromCodePoint(0x1f600);
    expect(grinningFaceEmoji.length).toBe(2);
    expect(getMessageBodyLength(grinningFaceEmoji)).toBe(1);
  });

  it("stays at the limit for 5000 repeated emoji, each counted as one character", () => {
    const grinningFaceEmoji = String.fromCodePoint(0x1f600);
    const fiveThousandEmoji = grinningFaceEmoji.repeat(MESSAGE_BODY_MAX_LENGTH);
    expect(getMessageBodyLength(fiveThousandEmoji)).toBe(
      MESSAGE_BODY_MAX_LENGTH,
    );
    expect(isMessageBodyOverLimit(fiveThousandEmoji)).toBe(false);
  });

  it("counts a mix of plain text and emoji correctly", () => {
    const grinningFaceEmoji = String.fromCodePoint(0x1f600);
    const textWithEmoji = `hello ${grinningFaceEmoji} world`;
    // "hello " (6) + emoji (1) + " world" (6) = 13.
    expect(getMessageBodyLength(textWithEmoji)).toBe(13);
  });
});

describe("isMessageBodyOverLimit", () => {
  it("is false at and under the limit", () => {
    const atLimit = "a".repeat(MESSAGE_BODY_MAX_LENGTH);
    expect(isMessageBodyOverLimit(atLimit)).toBe(false);
    expect(isMessageBodyOverLimit("short")).toBe(false);
  });

  it("is true one character past the limit", () => {
    const overLimit = "a".repeat(MESSAGE_BODY_MAX_LENGTH + 1);
    expect(isMessageBodyOverLimit(overLimit)).toBe(true);
  });

  it("measures the trimmed body", () => {
    // The server trims before validating, so the client has to read the
    // body the same way: an at-limit body padded with whitespace should
    // still read as at-limit, matching what the server would accept.
    const paddedAtLimit = `  ${"a".repeat(MESSAGE_BODY_MAX_LENGTH)}  `;
    expect(isMessageBodyOverLimit(paddedAtLimit)).toBe(false);
  });

  it("honors a custom maxLength", () => {
    expect(isMessageBodyOverLimit("abcdef", 5)).toBe(true);
    expect(isMessageBodyOverLimit("abcde", 5)).toBe(false);
  });
});

describe("shouldShowMessageLengthCounter", () => {
  it("stays hidden for an ordinary short message", () => {
    expect(shouldShowMessageLengthCounter("just chatting")).toBe(false);
  });

  it("appears once within 500 characters of the limit", () => {
    const justOutside = "a".repeat(MESSAGE_BODY_MAX_LENGTH - 501);
    const justInside = "a".repeat(MESSAGE_BODY_MAX_LENGTH - 500);
    expect(shouldShowMessageLengthCounter(justOutside)).toBe(false);
    expect(shouldShowMessageLengthCounter(justInside)).toBe(true);
  });

  it("stays shown past the limit", () => {
    const overLimit = "a".repeat(MESSAGE_BODY_MAX_LENGTH + 50);
    expect(shouldShowMessageLengthCounter(overLimit)).toBe(true);
  });
});
