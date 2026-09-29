import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useRef, type ReactNode } from "react";
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
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../test/msw/server";
import { API, API_V1 } from "../../test/msw/handlers";
import type { Thread } from "./forum.data";

/**
 * PRD-408: the credited co-author can take their own name off a thread. The
 * item shows in the opening post's ⋯ menu only when the server flags the viewer
 * as the co-author, and confirming it calls DELETE
 * /forum/threads/:slug/co-author, then refetches the thread so the byline drops
 * the second name.
 */

const SLUG = "shared-thread";
const REMOVE_LABEL =
  /remove my co-author credit|threadPage\.coAuthor\.menuItem/i;
const CONFIRM_LABEL = /remove my name|threadPage\.coAuthor\.confirmCta/i;
const CANCEL_LABEL = /keep it|threadPage\.coAuthor\.cancel/i;
const MASKED_BODY = /can't undo this|threadPage\.coAuthor\.confirmBodyMasked/i;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

function makeThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 7,
    slug: SLUG,
    category: "general",
    title: "Written together",
    excerpt: "",
    author: {
      initials: "RV",
      name: "Rita Valente",
      background: "var(--plum)",
      color: "var(--cream)",
      slug: "rita",
    },
    posted: "2h",
    upvotes: 0,
    comments: 0,
    tags: [],
    body: [],
    replies: [],
    coAuthor: { name: "Joana Reis", slug: "joana" },
    ...overrides,
  };
}

/** Loads the hook in a fresh module graph and wraps it in the smallest page
 *  that uses it: a focusable byline holding the credit, a plain button standing
 *  in for the ⋯ menu item, and the dialog the item opens. `isLive` stubs a real
 *  API origin, which turns demo mode off and the live mutation path on. */
async function loadCredit(isLive: boolean) {
  vi.resetModules();
  if (isLive) vi.stubEnv("VITE_API_URL", API);
  const { ThreadCoAuthorCredit } = await import("./ThreadCoAuthorCredit");
  const { useCoAuthorCreditRemoval } =
    await import("./useCoAuthorCreditRemoval");
  const { DemoModeProvider } =
    await import("../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../app/providers/I18nProvider");
  const { ToastProvider } =
    await import("../../shared/components/feedback/ToastProvider");
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DemoModeProvider>
          <I18nProvider>
            <ToastProvider>{children}</ToastProvider>
          </I18nProvider>
        </DemoModeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  function CreditHarness({ thread }: { thread: Thread }) {
    const bylineRef = useRef<HTMLDivElement>(null);
    const removal = useCoAuthorCreditRemoval({ thread, bylineRef });
    return (
      <div>
        <div ref={bylineRef} tabIndex={-1} data-testid="byline">
          <ThreadCoAuthorCredit thread={thread} />
        </div>
        {removal.action && (
          <button type="button" onClick={removal.action.run}>
            {removal.action.label}
          </button>
        )}
        {removal.dialog}
      </div>
    );
  }
  return { CreditHarness, wrapper, queryClient };
}

describe("useCoAuthorCreditRemoval", () => {
  it("offers the menu item only to the co-author", async () => {
    const { CreditHarness, wrapper } = await loadCredit(false);

    const { unmount } = render(
      <CreditHarness thread={makeThread({ viewerIsCoAuthor: false })} />,
      { wrapper },
    );
    expect(screen.queryByRole("button", { name: REMOVE_LABEL })).toBeNull();
    unmount();

    const { unmount: unmountCredited } = render(
      <CreditHarness thread={makeThread({ viewerIsCoAuthor: true })} />,
      { wrapper },
    );
    expect(
      screen.getByRole("button", { name: REMOVE_LABEL }),
    ).toBeInTheDocument();
    unmountCredited();

    // An anonymous thread withholds the co-author block from everyone, the
    // credited member included; the item still has to reach them.
    render(
      <CreditHarness
        thread={makeThread({
          viewerIsCoAuthor: true,
          isAnonymous: true,
          coAuthor: undefined,
        })}
      />,
      { wrapper },
    );
    expect(
      screen.getByRole("button", { name: REMOVE_LABEL }),
    ).toBeInTheDocument();
  });

  it("names the author in the confirm on an ordinary byline", async () => {
    const { CreditHarness, wrapper } = await loadCredit(false);
    render(<CreditHarness thread={makeThread({ viewerIsCoAuthor: true })} />, {
      wrapper,
    });
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Rita Valente");
  });

  it.each([
    [
      "anonymous",
      { isAnonymous: true, coAuthor: undefined } satisfies Partial<Thread>,
    ],
    [
      "official",
      {
        author: {
          initials: "Q",
          name: "QueerPulse",
          background: "var(--plum)",
          color: "var(--cream)",
          slug: "queerpulse",
          official: true,
        },
      } satisfies Partial<Thread>,
    ],
    [
      "erased",
      {
        author: {
          initials: "M",
          name: "Member",
          background: "var(--plum)",
          color: "var(--cream)",
          slug: "",
        },
      } satisfies Partial<Thread>,
    ],
  ])(
    "keeps the confirm nameless on an %s byline",
    async (_bylineKind, overrides) => {
      const { CreditHarness, wrapper } = await loadCredit(false);
      const thread = makeThread({ viewerIsCoAuthor: true, ...overrides });
      render(<CreditHarness thread={thread} />, { wrapper });
      fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveTextContent(MASKED_BODY);
      expect(dialog).not.toHaveTextContent(thread.author.name);
    },
  );

  it("hands focus to the byline when the member keeps their name", async () => {
    const { CreditHarness, wrapper } = await loadCredit(false);
    render(<CreditHarness thread={makeThread({ viewerIsCoAuthor: true })} />, {
      wrapper,
    });
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: CANCEL_LABEL }));
    await waitFor(() => expect(screen.getByTestId("byline")).toHaveFocus());
  });

  it("confirming calls the delete route and refreshes the thread", async () => {
    let deleteCalls = 0;
    server.use(
      http.delete(`${API_V1}/forum/threads/${SLUG}/co-author`, () => {
        deleteCalls += 1;
        return HttpResponse.json({ slug: SLUG, coAuthor: null });
      }),
    );
    const { CreditHarness, wrapper, queryClient } = await loadCredit(true);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    render(<CreditHarness thread={makeThread({ viewerIsCoAuthor: true })} />, {
      wrapper,
    });
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: CONFIRM_LABEL }),
    );

    await waitFor(() => expect(deleteCalls).toBe(1));
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["forum-thread-meta"],
      }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["forum-threads"],
    });
  });
});
