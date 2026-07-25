import { nextLocalId } from "./useMessagesController";

it("mints unique, stable-prefixed local ids", () => {
  const first = nextLocalId();
  const second = nextLocalId();
  expect(first).not.toBe(second);
  expect(first.startsWith("local-")).toBe(true);
});
