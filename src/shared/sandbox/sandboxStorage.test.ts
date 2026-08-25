import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installSandboxStorage } from "./sandboxStorage";

let originalLocal: PropertyDescriptor | undefined;
let originalSession: PropertyDescriptor | undefined;
let originalCookie: PropertyDescriptor | undefined;

beforeEach(() => {
  originalLocal = Object.getOwnPropertyDescriptor(window, "localStorage");
  originalSession = Object.getOwnPropertyDescriptor(window, "sessionStorage");
  originalCookie = Object.getOwnPropertyDescriptor(document, "cookie");
});

afterEach(() => {
  if (originalLocal)
    Object.defineProperty(window, "localStorage", originalLocal);
  if (originalSession)
    Object.defineProperty(window, "sessionStorage", originalSession);
  if (originalCookie) Object.defineProperty(document, "cookie", originalCookie);
  else Reflect.deleteProperty(document, "cookie");
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("installSandboxStorage", () => {
  it("seeds the shim from existing localStorage then keeps writes in-memory", () => {
    window.localStorage.setItem("qp.seed", "keepme");
    installSandboxStorage();
    // seeded snapshot is visible
    expect(window.localStorage.getItem("qp.seed")).toBe("keepme");
    // new writes work and read back
    window.localStorage.setItem("qp.new", "v");
    expect(window.localStorage.getItem("qp.new")).toBe("v");
    expect(window.localStorage.length).toBe(2);
    window.localStorage.removeItem("qp.seed");
    expect(window.localStorage.getItem("qp.seed")).toBeNull();
  });

  it("shims sessionStorage too", () => {
    installSandboxStorage();
    window.sessionStorage.setItem("s", "1");
    expect(window.sessionStorage.getItem("s")).toBe("1");
  });
});

describe("installSandboxStorage cookies", () => {
  it("seeds from document.cookie then keeps writes in-memory", () => {
    document.cookie = "qp.seedCookie=keep";
    installSandboxStorage();
    expect(document.cookie).toContain("qp.seedCookie=keep");
    document.cookie = "qp.newCookie=v; Path=/; Max-Age=3600";
    expect(document.cookie).toContain("qp.newCookie=v");
    // attributes are not echoed back, only key=value
    expect(document.cookie).not.toContain("Path=/");
  });

  it("deletes a cookie set with Max-Age=0", () => {
    installSandboxStorage();
    document.cookie = "qp.tmp=1";
    expect(document.cookie).toContain("qp.tmp=1");
    document.cookie = "qp.tmp=; Max-Age=0";
    expect(document.cookie).not.toContain("qp.tmp=");
  });

  it("does not treat a cookie whose name/value looks like an expiry as a delete", () => {
    installSandboxStorage();
    document.cookie = "tokenExpires=1970";
    expect(document.cookie).toContain("tokenExpires=1970");
    document.cookie = "config=maxHold";
    expect(document.cookie).toContain("config=maxHold");
  });
});
