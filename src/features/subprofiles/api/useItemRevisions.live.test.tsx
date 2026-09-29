import { act, renderHook } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";

/**
 * ENG-451, LIVE mode through MSW: an item revision restore carries the
 * editor's `editVersion` when the caller passes one, and hands back the
 * version the server answered only in that case.
 */

const RESTORE_ROUTE = `${API_V1}/subprofiles/:subprofileId/items/:itemId/revisions/:revisionId/restore`;
const RESTORE_TARGET = {
  subprofileId: "sp-restore",
  itemId: "itm-poem",
  revisionId: "rev-2",
};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

/** Serves the restore route, recording each request body as text. */
function serveRestore(answer: () => Response): string[] {
  const sentBodies: string[] = [];
  server.use(
    http.post(RESTORE_ROUTE, async ({ request }) => {
      sentBodies.push(await request.text());
      return answer();
    }),
  );
  return sentBodies;
}

async function renderLiveRestore() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useRestoreItemRevision } = await import("./useItemRevisions");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return renderHook(() => useRestoreItemRevision(), { wrapper });
}

describe("useRestoreItemRevision (live mode via MSW)", () => {
  it("sends the expected version and hands back the version the server answered", async () => {
    const sentBodies = serveRestore(() =>
      HttpResponse.json({ ok: true, editVersion: 5 }),
    );
    const { result } = await renderLiveRestore();

    let restored: { editVersion: number | null } | undefined;
    await act(async () => {
      restored = await result.current.mutateAsync({
        ...RESTORE_TARGET,
        expectedEditVersion: 4,
      });
    });

    expect(sentBodies).toEqual([JSON.stringify({ expectedEditVersion: 4 })]);
    expect(restored?.editVersion).toBe(5);
  });

  it("sends no body without a version and hands back no version, so an unconditional restore moves nothing", async () => {
    const sentBodies = serveRestore(() =>
      HttpResponse.json({ ok: true, editVersion: 5 }),
    );
    const { result } = await renderLiveRestore();

    let restored: { editVersion: number | null } | undefined;
    await act(async () => {
      restored = await result.current.mutateAsync(RESTORE_TARGET);
    });

    expect(sentBodies).toEqual([""]);
    expect(restored?.editVersion).toBeNull();
  });

  it("rejects with the edit conflict when someone saved the persona meanwhile", async () => {
    serveRestore(() =>
      HttpResponse.json(
        {
          code: "PERSONA_EDIT_CONFLICT",
          message: "This persona changed.",
          currentEditVersion: 7,
        },
        { status: 409 },
      ),
    );
    const { result } = await renderLiveRestore();

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.mutateAsync({
          ...RESTORE_TARGET,
          expectedEditVersion: 4,
        });
      } catch (error) {
        caught = error;
      }
    });

    // Matched by shape: `vi.resetModules` gives the hook its own `ApiError`
    // class, so an `instanceof` check from this file would read false.
    expect(caught).toMatchObject({
      status: 409,
      data: { code: "PERSONA_EDIT_CONFLICT", currentEditVersion: 7 },
    });
  });
});
