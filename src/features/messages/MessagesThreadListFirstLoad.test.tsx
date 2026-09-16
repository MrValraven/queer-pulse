import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MessagesThreadList } from "./MessagesThreadList";

/**
 * DES-194: the inbox's first load rendered total silence to a screen reader.
 * The skeleton rows are all `aria-hidden` (MessagesSkeleton.tsx), and
 * nothing wrapping them carried `aria-busy` or an aria-live announcement.
 * The fix mirrors the pattern the search-results loading state already
 * established (ThreadSearchModal/MessagesSearchResults): `aria-busy` on the
 * list container, plus a kept-mounted visually-hidden `role="status"`
 * region that actually carries text while loading.
 */

const NOOP = () => {};

function renderThreadList(loading: boolean) {
  return render(
    <MessagesThreadList
      loading={loading}
      threads={[]}
      activeId=""
      readIds={new Set()}
      query=""
      onQueryChange={NOOP}
      onOpen={NOOP}
      onCompose={NOOP}
      onComposeGroup={NOOP}
      onDelete={NOOP}
      onSelectResult={NOOP}
      deletePending={false}
      onMarkThreadRead={NOOP}
      onMarkThreadUnread={NOOP}
      showRailChrome={false}
    />,
    { wrapper: TestProviders },
  );
}

describe("MessagesThreadList first-load announcement (DES-194)", () => {
  it("marks the list container busy and announces loading while the first inbox load is in flight", async () => {
    renderThreadList(true);

    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    // The skeleton rows themselves are `aria-hidden`, so a screen reader
    // relies entirely on this live region actually carrying text; an empty
    // one is the DES-194 bug all over again. `findByText` waits for that
    // text, since the "messages" i18n namespace loads via a dynamic import
    // and the translated string lands a tick after the initial synchronous
    // render.
    expect(
      await screen.findByText("Loading your conversations…"),
    ).toBeInTheDocument();
  });

  it("clears aria-busy and the announcement once the inbox has loaded", async () => {
    renderThreadList(false);

    // Let the same dynamic i18n import resolve before asserting an absence,
    // or a false negative here would just mean "translations aren't in yet".
    await screen.findByText("No conversations yet");
    expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    expect(screen.queryByText("Loading your conversations…")).toBeNull();
  });
});
