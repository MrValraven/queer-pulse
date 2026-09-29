import { act, renderHook } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
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
import type {
  SkinData,
  SubprofileDTO,
  UpdateSubprofileDTO,
} from "./subprofiles.api";
import { subprofileToView, type SubprofileView } from "./subprofiles.adapters";

/**
 * ENG-451 for the owner page's skin writes (the cover reposition, the
 * therapist capacity switch), LIVE mode through MSW. The PATCH replaces the
 * whole `skinData` column, so the hook reads the owner view afresh at save
 * time, merges into that blob, and sends the fresh `editVersion` as the
 * precondition. A conflict gets one fresh read and one retry.
 */

const PERSONA_ID = "sp-diogo-nightform";
const OWNER_URL = `${API_V1}/subprofiles/:id`;
const OWNER_QUERY_KEY = ["subprofile", false, PERSONA_ID];
const CO_OWNER_BLOCK: SkinData = { colophon: "Set by a co-owner" };

const conflictResponse = (currentEditVersion: number) =>
  HttpResponse.json(
    {
      code: "PERSONA_EDIT_CONFLICT",
      message: "Someone else saved this persona first",
      currentEditVersion,
    },
    { status: 409 },
  );

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => window.localStorage.clear());
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

/** The value itself, or a thrown error naming what the spec expected. */
function required<Value>(value: Value | undefined, label: string): Value {
  if (value === undefined) throw new Error(`Expected ${label}`);
  return value;
}

/** The owner view the server holds, with the given skin blob and version. */
function storedView(skinData: SkinData, editVersion: number): SubprofileDTO {
  return { ...mockSubprofileById(PERSONA_ID)!, skinData, editVersion };
}

/**
 * Serve each GET from `freshReads` in order (the last one repeats) and answer
 * each PATCH from `patchAnswers` in order: "conflict" answers 409, "save"
 * echoes the body onto the stored view with the next version. Every PATCH
 * body is recorded.
 */
function serveOwnerView(
  freshReads: SubprofileDTO[],
  patchAnswers: Array<"conflict" | "save">,
) {
  const patchBodies: UpdateSubprofileDTO[] = [];
  let readCount = 0;
  server.use(
    http.get(OWNER_URL, () => {
      const read = freshReads[Math.min(readCount, freshReads.length - 1)];
      readCount += 1;
      return HttpResponse.json(read);
    }),
    http.patch(OWNER_URL, async ({ request }) => {
      const body = (await request.json()) as UpdateSubprofileDTO;
      const answer = patchAnswers[patchBodies.length] ?? "save";
      patchBodies.push(body);
      const latest = required(
        freshReads[freshReads.length - 1],
        "a stored owner view",
      );
      if (answer === "conflict") {
        return conflictResponse(required(latest.editVersion, "an editVersion"));
      }
      const { expectedEditVersion, ...changes } = body;
      return HttpResponse.json({
        ...latest,
        ...changes,
        editVersion: (expectedEditVersion ?? 0) + 1,
      });
    }),
  );
  return {
    patchBodies,
    patchBody: (index: number) =>
      required(patchBodies[index], `PATCH body ${index}`),
    readCount: () => readCount,
  };
}

async function renderLivePatch() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useOwnerSkinPatch } = await import("./useOwnerSkinPatch");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  const rendered = renderHook(() => useOwnerSkinPatch(PERSONA_ID), {
    wrapper,
  });
  return { ...rendered, queryClient };
}

const withCoverOffset = (freshSkinData: SkinData | null): SkinData => ({
  ...(freshSkinData ?? {}),
  coverOffsetY: 30,
});

describe("useOwnerSkinPatch (live mode via MSW)", () => {
  it("merges into the fresh skinData, keeping a block the page did not know about", async () => {
    const served = serveOwnerView([storedView(CO_OWNER_BLOCK, 4)], ["save"]);
    const { result } = await renderLivePatch();

    await act(async () => {
      await result.current.patchSkin(withCoverOffset, {
        availability: "Open",
      });
    });

    expect(served.patchBodies).toHaveLength(1);
    expect(served.patchBody(0).skinData).toEqual({
      colophon: "Set by a co-owner",
      coverOffsetY: 30,
    });
    expect(served.patchBody(0).availability).toBe("Open");
  });

  it("sends the fresh version and writes the saved view into the owner query", async () => {
    const served = serveOwnerView([storedView(CO_OWNER_BLOCK, 7)], ["save"]);
    const { result, queryClient } = await renderLivePatch();
    // The page's cached copy is older than what the server now holds.
    queryClient.setQueryData(
      OWNER_QUERY_KEY,
      subprofileToView(storedView({}, 2)),
    );

    let savedVersion: number | undefined;
    await act(async () => {
      savedVersion = (await result.current.patchSkin(withCoverOffset))
        .editVersion;
    });

    expect(served.readCount()).toBe(1);
    expect(served.patchBody(0).expectedEditVersion).toBe(7);
    expect(savedVersion).toBe(8);
    expect(
      queryClient.getQueryData<SubprofileView>(OWNER_QUERY_KEY)?.editVersion,
    ).toBe(8);
    expect(result.current.isSaving).toBe(false);
  });

  it("reads again and retries once on a conflict, merging into the newer blob", async () => {
    const newerBlock: SkinData = { ...CO_OWNER_BLOCK, access: ["Step-free"] };
    const served = serveOwnerView(
      [storedView(CO_OWNER_BLOCK, 3), storedView(newerBlock, 5)],
      ["conflict", "save"],
    );
    const { result } = await renderLivePatch();

    await act(async () => {
      await result.current.patchSkin(withCoverOffset);
    });

    expect(served.readCount()).toBe(2);
    expect(served.patchBodies.map((body) => body.expectedEditVersion)).toEqual([
      3, 5,
    ]);
    expect(served.patchBody(1).skinData).toEqual({
      colophon: "Set by a co-owner",
      access: ["Step-free"],
      coverOffsetY: 30,
    });
  });

  it("rejects on a second conflict so the caller can show its error", async () => {
    const served = serveOwnerView(
      [storedView(CO_OWNER_BLOCK, 3), storedView(CO_OWNER_BLOCK, 6)],
      ["conflict", "conflict"],
    );
    const { result } = await renderLivePatch();

    await act(async () => {
      await expect(
        result.current.patchSkin(withCoverOffset),
      ).rejects.toMatchObject({
        status: 409,
        data: { code: "PERSONA_EDIT_CONFLICT" },
      });
    });

    expect(served.patchBodies).toHaveLength(2);
    expect(result.current.isSaving).toBe(false);
  });

  it("rejects any other failure without a retry", async () => {
    const served = serveOwnerView([storedView(CO_OWNER_BLOCK, 3)], ["save"]);
    server.use(
      http.patch(OWNER_URL, () =>
        HttpResponse.json({ message: "Upstream down" }, { status: 500 }),
      ),
    );
    const { result } = await renderLivePatch();

    await act(async () => {
      await expect(
        result.current.patchSkin(withCoverOffset),
      ).rejects.toMatchObject({ status: 500 });
    });

    expect(served.readCount()).toBe(1);
  });

  it("rejects a failed fresh read without a PATCH and leaves the owner query as it was", async () => {
    const served = serveOwnerView([storedView(CO_OWNER_BLOCK, 3)], ["save"]);
    server.use(
      http.get(OWNER_URL, () =>
        HttpResponse.json({ message: "Upstream down" }, { status: 503 }),
      ),
    );
    const { result, queryClient } = await renderLivePatch();
    queryClient.setQueryData(
      OWNER_QUERY_KEY,
      subprofileToView(storedView({}, 2)),
    );

    await act(async () => {
      await expect(
        result.current.patchSkin(withCoverOffset),
      ).rejects.toMatchObject({ status: 503 });
    });

    expect(served.patchBodies).toHaveLength(0);
    const ownerQuery = queryClient.getQueryState(OWNER_QUERY_KEY);
    expect(ownerQuery?.status).toBe("success");
    expect(
      queryClient.getQueryData<SubprofileView>(OWNER_QUERY_KEY)?.editVersion,
    ).toBe(2);
  });
});
