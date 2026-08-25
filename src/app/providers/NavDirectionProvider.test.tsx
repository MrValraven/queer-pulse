import { describe, expect, it } from "vitest";
import { classifyNavDirection } from "./navDirection";

describe("classifyNavDirection", () => {
  it("classifies a link deeper within the same tab as a push", () => {
    expect(classifyNavDirection("/feed", "/feed/123", "PUSH")).toBe("push");
  });

  it("classifies browser/back-button navigation as a pop", () => {
    expect(classifyNavDirection("/feed/123", "/feed", "POP")).toBe("pop");
  });

  it("classifies a push that crosses tab roots as a tab-switch", () => {
    expect(classifyNavDirection("/feed", "/members", "PUSH")).toBe(
      "tab-switch",
    );
  });

  it("classifies a replace navigation as replace, even to the same path", () => {
    expect(classifyNavDirection("/feed", "/feed", "REPLACE")).toBe("replace");
  });

  it("classifies a push into untabbed territory as a plain push", () => {
    expect(classifyNavDirection("/feed", "/settings", "PUSH")).toBe("push");
  });

  it("always classifies REPLACE as replace, even across tab roots", () => {
    expect(classifyNavDirection("/feed", "/members", "REPLACE")).toBe(
      "replace",
    );
  });
});
