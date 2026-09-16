import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { MessageResponse } from "../../../shared/contracts/contracts";
import { EDIT_WINDOW_MS } from "../demoTimeline.data";
import {
  assertDemoActionAllowed,
  DemoActionRefusedError,
  demoActionRefusal,
  type DemoGuardedAction,
} from "./demoActionGuards";
import { readDemoThread } from "./demoThreadCache";

const NOW_MS = Date.parse("2026-09-15T12:00:00.000Z");

/** A seeded demo message with every permission granted, then `overrides`. */
function permittedMessage(
  overrides: Partial<MessageResponse> = {},
): MessageResponse {
  const seeded = readDemoThread(new QueryClient(), "anika")[0]!;
  return {
    ...seeded,
    kind: "user",
    canEdit: true,
    canDelete: true,
    canPin: true,
    createdAt: new Date(NOW_MS - 60_000).toISOString(),
    ...overrides,
  };
}

const GUARDED_ACTIONS: DemoGuardedAction[] = ["edit", "delete", "pin", "star"];

describe("demoActionRefusal", () => {
  it("accepts every guarded action on a permitted message", () => {
    for (const action of GUARDED_ACTIONS) {
      expect(demoActionRefusal(permittedMessage(), action, NOW_MS)).toBeNull();
    }
  });

  it("refuses every guarded action on a missing message", () => {
    for (const action of GUARDED_ACTIONS) {
      expect(demoActionRefusal(undefined, action, NOW_MS)).toBe("missing");
    }
  });

  it("refuses every guarded action on a system message", () => {
    const pill = permittedMessage({ kind: "system" });
    for (const action of GUARDED_ACTIONS) {
      expect(demoActionRefusal(pill, action, NOW_MS)).toBe("system");
    }
  });

  it("refuses an edit without canEdit", () => {
    const message = permittedMessage({ canEdit: false });
    expect(demoActionRefusal(message, "edit", NOW_MS)).toBe("notPermitted");
  });

  it("refuses an edit past the edit window and accepts one at its edge", () => {
    const expired = permittedMessage({
      createdAt: new Date(NOW_MS - EDIT_WINDOW_MS - 1).toISOString(),
    });
    expect(demoActionRefusal(expired, "edit", NOW_MS)).toBe("editWindowClosed");
    const atEdge = permittedMessage({
      createdAt: new Date(NOW_MS - EDIT_WINDOW_MS).toISOString(),
    });
    expect(demoActionRefusal(atEdge, "edit", NOW_MS)).toBeNull();
  });

  it("refuses a delete without canDelete", () => {
    const message = permittedMessage({ canDelete: false });
    expect(demoActionRefusal(message, "delete", NOW_MS)).toBe("notPermitted");
  });

  it("refuses a pin without canPin", () => {
    const message = permittedMessage({ canPin: false });
    expect(demoActionRefusal(message, "pin", NOW_MS)).toBe("notPermitted");
  });

  it("allows a star without any permission flag", () => {
    const message = permittedMessage({
      canEdit: false,
      canDelete: false,
      canPin: false,
    });
    expect(demoActionRefusal(message, "star", NOW_MS)).toBeNull();
  });
});

describe("assertDemoActionAllowed", () => {
  it("throws a refusal for a pin on the seeded tombstone", () => {
    const queryClient = new QueryClient();
    expect(() =>
      assertDemoActionAllowed(
        queryClient,
        "brunch-crew",
        "demo-msg-brunch-005",
        "pin",
      ),
    ).toThrow(DemoActionRefusedError);
  });

  it("throws once the seeded edited message leaves its edit window", () => {
    const queryClient = new QueryClient();
    const later = Date.now() + EDIT_WINDOW_MS + 60_000;
    try {
      assertDemoActionAllowed(
        queryClient,
        "anika",
        "demo-msg-anika-004",
        "edit",
        later,
      );
      expect.unreachable("the edit should have been refused");
    } catch (error) {
      expect(error).toBeInstanceOf(DemoActionRefusedError);
      expect((error as DemoActionRefusedError).reason).toBe("editWindowClosed");
    }
  });

  it("allows an edit of the seeded edited message inside its window", () => {
    expect(() =>
      assertDemoActionAllowed(
        new QueryClient(),
        "anika",
        "demo-msg-anika-004",
        "edit",
      ),
    ).not.toThrow();
  });
});
