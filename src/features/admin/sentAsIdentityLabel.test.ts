import { beforeAll, describe, expect, it } from "vitest";
import { sentAsIdentityLabel } from "./sentAsIdentityLabel";
import { catalogs, loadNamespace } from "../../shared/i18n/catalogs";
import type { TFunction, TranslateOptions } from "../../shared/i18n/types";

/**
 * Business mailboxes, design section 9 (I2 fix): the moderator-only line
 * naming the identity a message was sent as. Resolves against the real `en`
 * `admin` and `messages` catalogs (mirrors `adminMembers.adapters.test.ts`),
 * so a key or a kind label going missing from either catalog fails here too.
 */

function interpolate(template: string, options?: TranslateOptions): string {
  return Object.entries(options ?? {}).reduce(
    (accumulated, [token, tokenValue]) =>
      accumulated.replace(`{${token}}`, String(tokenValue)),
    template,
  );
}

let adminCatalog = catalogs.en.admin;
let messagesCatalog = catalogs.en.messages;
beforeAll(async () => {
  adminCatalog = await loadNamespace("en", "admin");
  messagesCatalog = await loadNamespace("en", "messages");
});

const t: TFunction = (key, options) => {
  const [namespace, path] = key.split(":");
  const catalog = namespace === "messages" ? messagesCatalog : adminCatalog;
  const value = catalog?.[path ?? ""] ?? key;
  return interpolate(value, options);
};

describe("sentAsIdentityLabel", () => {
  it("names the identity with its kind, for a listing", () => {
    expect(
      sentAsIdentityLabel({ displayName: "Café Lisboa", kind: "listing" }, t),
    ).toBe("Sent as Café Lisboa (Directory listing)");
  });

  it("names the identity with its kind, for a persona", () => {
    expect(
      sentAsIdentityLabel(
        { displayName: "Atelier Pulso", kind: "subprofile" },
        t,
      ),
    ).toBe("Sent as Atelier Pulso (Persona)");
  });

  it("names the identity with its kind, for a company", () => {
    expect(
      sentAsIdentityLabel({ displayName: "Estúdio Norte", kind: "company" }, t),
    ).toBe("Sent as Estúdio Norte (Company)");
  });

  // The identity row is gone: `kind` and `displayName` both read null. No
  // live kind is left to state, so the parenthetical is omitted entirely.
  it("falls back to a deleted-identity name and drops the kind, once the identity row is gone", () => {
    expect(sentAsIdentityLabel({ displayName: null, kind: null }, t)).toBe(
      "Sent as Deleted identity",
    );
  });
});
