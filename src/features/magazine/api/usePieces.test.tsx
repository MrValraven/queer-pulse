import { renderHook, waitFor } from "@testing-library/react";
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
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API_V1 } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_PIECES } from "../data/desk.data";
// Statically imported so it shares this file's module graph (and therefore
// its `DemoModeContext` instance) with `TestProviders`, also a static
// import — see useLandingFeatures.test.tsx, which this mirrors. Only the
// live-mode suite below needs a fresh, dynamically re-imported instance.
import { usePieces } from "./usePieces";
import type { PieceListItemDto } from "./pieces.api";

/**
 * Demo-mode suite: proves `usePieces` returns the static desk fixtures
 * (`DEMO_PIECES`) with no network request. Live-mode suite proves the
 * demo→live branch hits `GET /magazine/admin/pieces` and adapts each
 * `PieceListItemDto` to the desk's `Piece` view shape via `pieceDtoToView`
 * (backend snake-ish stage codes → display-cased `Stage` labels, `waitingOn`
 * → `wait` with `"nobody"` dropped to `undefined`).
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://api.test");
  const { usePieces: usePiecesLive } = await import("./usePieces");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported
  // provider would hold a different DemoModeContext instance than the
  // freshly-imported usePieces resolves against.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return { usePieces: usePiecesLive, wrapper };
}

describe("usePieces (demo mode)", () => {
  it("returns the static DEMO_PIECES fixtures, with no network request", async () => {
    // No handler is registered for GET /magazine/admin/pieces — `onUnhandledRequest:
    // "error"` above means any real request at all fails the test, so a passing
    // result proves demo mode never touched the network.
    const { result } = renderHook(() => usePieces({}), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pieces).toHaveLength(DEMO_PIECES.length);
    expect(result.current.pieces[0]).toEqual(DEMO_PIECES[0]);
  });
});

describe("usePieces (live mode via MSW)", () => {
  it("fetches GET /magazine/admin/pieces and adapts the DTOs to the Piece view shape", async () => {
    const pieceDtos: PieceListItemDto[] = [
      {
        id: "piece-1",
        format: "article",
        title: "What we owe old friends",
        section: "Cover",
        kind: "Long read",
        byline: "Sara Pinheiro",
        editorId: "marta",
        writerId: null,
        stage: "in_review",
        due: "2026-08-12",
        late: false,
        waitingOn: "writer",
        words: 2800,
        slides: null,
        art: "in",
        fresh: false,
        issueId: null,
        articleId: null,
        deckId: null,
        contentsBlurb: "",
      },
      {
        id: "piece-2",
        format: "deck",
        title: "Nine rooms in Arroios",
        section: "Photo",
        kind: "Photo deck",
        byline: "Pedro Salgado",
        editorId: "marta",
        writerId: null,
        stage: "ready",
        due: null,
        late: false,
        waitingOn: "nobody",
        words: null,
        slides: 12,
        art: "none",
        fresh: true,
        issueId: null,
        articleId: null,
        deckId: null,
        contentsBlurb: "",
      },
    ];

    server.use(
      http.get(`${API_V1}/magazine/admin/pieces`, () =>
        HttpResponse.json({
          items: pieceDtos,
          total: pieceDtos.length,
          page: 1,
          pageSize: 200,
        }),
      ),
    );

    const { usePieces: usePiecesLive, wrapper } = await loadLive();
    const { result } = renderHook(() => usePiecesLive({}), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pieces).toHaveLength(2);

    // Backend stage code display-cased to the view's `Stage` label.
    expect(result.current.pieces[0]!.stage).toBe("In review");
    expect(result.current.pieces[1]!.stage).toBe("Ready");

    // `waitingOn: "writer"` maps straight through to `wait`.
    expect(result.current.pieces[0]!.wait).toBe("writer");
    // `waitingOn: "nobody"` is dropped to `undefined` on the view.
    expect(result.current.pieces[1]!.wait).toBeUndefined();

    expect(result.current.pieces[0]!.id).toBe("piece-1");
    expect(result.current.pieces[0]!.title).toBe("What we owe old friends");
    expect(result.current.pieces[0]!.words).toBe(2800);
    expect(result.current.pieces[1]!.slides).toBe(12);
  });
});
