import { act, renderHook, waitFor } from "@testing-library/react";
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
import { mockSubprofileById } from "../data/subprofiles.data";

/**
 * ENG-451 Reload, LIVE mode through MSW, with the owner query the editor page
 * reads mounted beside the reload. The harness applies the page's own gate
 * (`SubprofileEditorPage`: the error state replaces the editor only when the
 * query has no persona), so each spec can observe whether the editor, and
 * the unsaved edits in it, would stay on screen.
 */

const PERSONA_ID = "sp-diogo-nightform";
const OWNER_READ = `${API_V1}/subprofiles/:id`;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

async function renderLiveEditorData() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useSubprofile, useSubprofileReload } =
    await import("./useSubprofile");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  const rendered = renderHook(
    () => {
      const query = useSubprofile(PERSONA_ID);
      const reload = useSubprofileReload(PERSONA_ID);
      return {
        query,
        reload,
        isErrorStateShown: query.isError && !query.data,
      };
    },
    { wrapper },
  );
  await waitFor(() =>
    expect(rendered.result.current.query.data?.displayName).toBe("NIGHTFORM"),
  );
  return rendered;
}

describe("useSubprofileReload (live mode via MSW)", () => {
  it("rejects on a failed fetch and leaves the owner query, and so the editor, untouched", async () => {
    const { result } = await renderLiveEditorData();
    server.use(
      http.get(OWNER_READ, () =>
        HttpResponse.json({ message: "Upstream down" }, { status: 503 }),
      ),
    );

    await act(async () => {
      await expect(result.current.reload()).rejects.toMatchObject({
        status: 503,
      });
    });

    expect(result.current.query.isError).toBe(false);
    expect(result.current.query.data?.displayName).toBe("NIGHTFORM");
    expect(result.current.isErrorStateShown).toBe(false);
  });

  it("resolves the fresh view and writes it into the owner query", async () => {
    const { result } = await renderLiveEditorData();
    const fresh = {
      ...mockSubprofileById(PERSONA_ID)!,
      displayName: "NIGHTFORM (renamed)",
      editVersion: 9,
    };
    server.use(http.get(OWNER_READ, () => HttpResponse.json(fresh)));

    let reloadedName: string | undefined;
    await act(async () => {
      reloadedName = (await result.current.reload())?.displayName;
    });

    expect(reloadedName).toBe("NIGHTFORM (renamed)");
    await waitFor(() => expect(result.current.query.data?.editVersion).toBe(9));
    expect(result.current.query.isError).toBe(false);
  });

  it("maps a 404 to null and stores it, which is the page's not-found state", async () => {
    const { result } = await renderLiveEditorData();
    server.use(
      http.get(OWNER_READ, () => new HttpResponse(null, { status: 404 })),
    );

    let reloaded: unknown = "unset";
    await act(async () => {
      reloaded = await result.current.reload();
    });

    expect(reloaded).toBeNull();
    await waitFor(() => expect(result.current.query.data).toBeNull());
    expect(result.current.query.isError).toBe(false);
  });

  it("keeps the editor on a failed background refetch of the owner query", async () => {
    const { result } = await renderLiveEditorData();
    server.use(
      http.get(OWNER_READ, () =>
        HttpResponse.json({ message: "Upstream down" }, { status: 500 }),
      ),
    );

    await act(async () => {
      await result.current.query.refetch();
    });

    expect(result.current.query.isError).toBe(true);
    expect(result.current.query.data?.displayName).toBe("NIGHTFORM");
    expect(result.current.isErrorStateShown).toBe(false);
  });
});
