import { describe, expect, it } from "vitest";
import { nextAmount } from "./skinDigits";
import { isControlValueValid } from "./skinTextCheck";

describe("skin control limits", () => {
  it("caps the integer digits of an amount when asked", () => {
    expect(nextAmount("1234567", "123456", 6)).toBeNull();
    expect(nextAmount("123456", "12345", 6)).toBe("123456");
    expect(nextAmount("123456,5", "123456", 6)).toBe("123456,5");
    expect(nextAmount("12345", "123456", 6)).toBe("12345");
    expect(nextAmount("1234567", "123456")).toBe("1234567");
  });

  it("checks an https link", () => {
    const control = { validate: "httpsUrl" } as const;
    expect(isControlValueValid(control, "https://forms.example.com/book")).toBe(
      true,
    );
    expect(isControlValueValid(control, "http://forms.example.com")).toBe(
      false,
    );
    expect(isControlValueValid(control, "forms.example.com")).toBe(false);
    expect(isControlValueValid(control, "https://localhost")).toBe(false);
    expect(isControlValueValid(control, "")).toBe(true);
  });

  it("checks a year", () => {
    const control = { validate: "year" } as const;
    expect(isControlValueValid(control, "2014")).toBe(true);
    expect(isControlValueValid(control, "1899")).toBe(false);
    expect(isControlValueValid(control, "3000")).toBe(false);
    expect(isControlValueValid(control, "14")).toBe(false);
  });
});
