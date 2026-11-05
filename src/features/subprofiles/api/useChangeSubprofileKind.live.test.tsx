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
import { mockSubprofileById } from "../data/subprofiles.data";
import type { SubprofileView } from "./subprofiles.adapters";

/**
 * The persona type change in LIVE mode through MSW: the hook posts the kind
 * to `/subprofiles/:id/kind`, hands back the owner view the server answers
 * with, writes it to the owner query only once `applyKindChange` runs, and
 * reads a 422 refusal as a `PersonaKindChangeError` with its details.
 * NIGHTFORM is a musician, in the Stage group with dj.
 */

const PERSONA_ID = "sp-diogo-nightform";
const KIND_ROUTE = `${API_V1}/subprofiles/:id/kind`;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

async function renderLiveChangeKind() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useChangeSubprofileKind } = await import("./useSubprofileMutations");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const { ToastProvider } =
    await import("../../../shared/components/feedback/ToastProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  const { subprofileQueryKey } = await import("./useSubprofile");
  const rendered = renderHook(() => useChangeSubprofileKind(PERSONA_ID), {
    wrapper,
  });
  const readOwnerCache = () =>
    client.getQueryData<SubprofileView>(subprofileQueryKey(false, PERSONA_ID));
  return { ...rendered, readOwnerCache };
}

describe("useChangeSubprofileKind (live mode via MSW)", () => {
  it("posts the kind and returns the owner view", async () => {
    let postedBody: unknown;
    server.use(
      http.post(KIND_ROUTE, async ({ request }) => {
        postedBody = await request.json();
        return HttpResponse.json({
          ...mockSubprofileById(PERSONA_ID)!,
          kind: "dj",
        });
      }),
    );
    const { result, readOwnerCache } = await renderLiveChangeKind();

    const saved = await act(() => result.current.mutateAsync("dj"));

    expect(postedBody).toEqual({ kind: "dj" });
    expect(saved).toMatchObject({ id: PERSONA_ID, kind: "dj" });
    expect(readOwnerCache()).toBeUndefined();

    act(() => result.current.applyKindChange(saved));
    expect(readOwnerCache()?.kind).toBe("dj");
  });

  it("turns a 422 studio refusal into PersonaKindChangeError", async () => {
    server.use(
      http.post(KIND_ROUTE, () =>
        HttpResponse.json(
          {
            code: "PERSONA_KIND_STUDIO_RELEASES",
            message: "This persona has Studio releases",
            releaseCount: 3,
            requestedHasStudio: false,
          },
          { status: 422 },
        ),
      ),
    );
    const { result } = await renderLiveChangeKind();

    await expect(result.current.mutateAsync("dj")).rejects.toMatchObject({
      name: "PersonaKindChangeError",
      details: {
        reason: "studio_releases",
        releaseCount: 3,
        requestedHasStudio: false,
      },
    });
  });
});
