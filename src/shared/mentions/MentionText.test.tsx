import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, test, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { MentionText } from "./MentionText";
import { renderWithLinks } from "../../features/messages/linkify";
import { InertMemberMentionsContext } from "./MentionLinkPolicyContext";
import {
  MentionNamesAuthorityContext,
  MentionNamesContext,
} from "./MentionNamesContext";
import { mentionNameKey } from "./mentionNameKey";
import { mentionRefsInAll, mentionRefsInMarkdownAll } from "./mentionRefs";
import { MarkdownLite } from "../markdown/MarkdownLite";
import { ResolvedMentionNamesProvider } from "./ResolvedMentionText";
import type { ResolvedMentionNameDTO } from "./mentionNames.api";

const mentionApiMocks = vi.hoisted(() => ({ getMentionNames: vi.fn() }));

vi.mock("./mentionNames.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./mentionNames.api")>()),
  ...mentionApiMocks,
}));

vi.mock("../../app/providers/authContext", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../app/providers/authContext")>()),
  useAuth: () => ({ loggedIn: true, checking: false }),
}));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

function renderInRouter(node: ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

function renderWithNames(node: ReactNode, entries: [string, string][]) {
  return render(
    <MemoryRouter>
      <MentionNamesContext.Provider value={new Map(entries)}>
        {node}
      </MentionNamesContext.Provider>
    </MemoryRouter>,
  );
}

test("linkifies a member mention to a router link", () => {
  renderInRouter(<MentionText text="hey @ana-lopes welcome" />);
  expect(screen.getByRole("link", { name: "@ana-lopes" })).toBeInTheDocument();
});

test("composes mentions with URL rendering without double-processing", () => {
  renderInRouter(
    <MentionText
      text="see b/queer-books at https://example.org/c/foo"
      renderText={renderWithLinks}
    />,
  );
  // the business mention linkifies as a router link...
  expect(
    screen.getByRole("link", { name: "b/queer-books" }),
  ).toBeInTheDocument();
  // ...the URL linkifies as an external new-tab anchor...
  const external = screen.getByRole("link", {
    name: "https://example.org/c/foo",
  });
  expect(external).toHaveAttribute("href", "https://example.org/c/foo");
  expect(external).toHaveAttribute("target", "_blank");
  // ...and the `c/foo` INSIDE the URL is NOT turned into a community mention.
  expect(screen.queryByRole("link", { name: "c/foo" })).toBeNull();
});

test("without renderText, text runs render unchanged (regression guard)", () => {
  const { container } = renderInRouter(
    <MentionText text="plain http://example.org text" />,
  );
  // renderText omitted → the URL is NOT linkified and there are no anchors...
  expect(container.querySelectorAll("a")).toHaveLength(0);
  // ...and the visible text is exactly the input.
  expect(container.textContent).toBe("plain http://example.org text");
});

test("a resolved member mention renders the name only, with the slug as title", () => {
  renderWithNames(<MentionText text="hey @ana-lopes welcome" />, [
    [mentionNameKey("member", "ana-lopes"), "Ana Lopes"],
  ]);
  const link = screen.getByRole("link", { name: "Ana Lopes" });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("title", "@ana-lopes");
  expect(screen.queryByRole("link", { name: "@ana-lopes" })).toBeNull();
});

test("a resolved community mention drops the c/ sigil and shows the name", () => {
  renderWithNames(<MentionText text="join c/queerpulse-social today" />, [
    [mentionNameKey("community", "queerpulse-social"), "QueerPulse Social"],
  ]);
  const link = screen.getByRole("link", { name: "QueerPulse Social" });
  expect(link).toHaveAttribute("title", "c/queerpulse-social");
});

test("an unresolved mention falls back to sigil+slug with no title", () => {
  renderWithNames(<MentionText text="hey @nobody-here" />, []);
  const link = screen.getByRole("link", { name: "@nobody-here" });
  expect(link).toBeInTheDocument();
  expect(link).not.toHaveAttribute("title");
});

test("a topic keeps its #tag even if a same-slug name exists in the map", () => {
  renderWithNames(<MentionText text="see #housing" />, [
    [mentionNameKey("topic", "housing"), "Housing Chat"],
  ]);
  expect(screen.getByRole("link", { name: "#housing" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Housing Chat" })).toBeNull();
});

test("linkify=false renders mentions as inert text, keeping the words", () => {
  renderInRouter(<MentionText text="hey @ana-lopes welcome" linkify={false} />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText("@ana-lopes")).toBeInTheDocument();
});

test("linkify=false still resolves a name when the provider knows it", () => {
  renderWithNames(<MentionText text="with c/lisboa-queer" linkify={false} />, [
    [mentionNameKey("community", "lisboa-queer"), "Lisboa Queer"],
  ]);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  // The raw sigil+slug stays reachable on hover, exactly as the linked form.
  expect(screen.getByText("Lisboa Queer")).toHaveAttribute(
    "title",
    "c/lisboa-queer",
  );
});

test("plain text around an unlinked mention is untouched", () => {
  const { container } = renderInRouter(
    <MentionText text="hey @ana-lopes welcome" linkify={false} />,
  );
  expect(container.textContent).toBe("hey @ana-lopes welcome");
});

test("PRD-423: an inert member mention shows the first name as plain text with no profile link or slug", () => {
  render(
    <MemoryRouter>
      <InertMemberMentionsContext.Provider value={true}>
        <MentionNamesContext.Provider
          value={new Map([[mentionNameKey("member", "ana-sousa"), "Ana"]])}
        >
          <MentionText text="hey @ana-sousa, see c/lisboa-queer" />
        </MentionNamesContext.Provider>
      </InertMemberMentionsContext.Provider>
    </MemoryRouter>,
  );
  expect(screen.queryByRole("link", { name: "Ana" })).not.toBeInTheDocument();
  expect(screen.getByText("Ana")).not.toHaveAttribute("title");
  // Other kinds keep their links.
  expect(
    screen.getByRole("link", { name: "c/lisboa-queer" }),
  ).toBeInTheDocument();
});

test("PRD-423: an inert member mention the chat cannot name reads as a neutral placeholder and keeps the handle out of the page", async () => {
  const { container } = render(
    <MemoryRouter>
      <I18nProvider>
        <InertMemberMentionsContext.Provider value={true}>
          <MentionNamesContext.Provider value={new Map()}>
            <MentionText text="hey @ana-sousa, see c/lisboa-queer" />
          </MentionNamesContext.Provider>
        </InertMemberMentionsContext.Provider>
      </I18nProvider>
    </MemoryRouter>,
  );
  // `messages` is a lazy namespace, so the string arrives a tick later.
  expect(await screen.findByText("@member")).toBeInTheDocument();
  expect(container.innerHTML).not.toContain("ana-sousa");
  expect(screen.queryByRole("link", { name: "@member" })).toBeNull();
  // Other kinds keep their links.
  expect(
    screen.getByRole("link", { name: "c/lisboa-queer" }),
  ).toBeInTheDocument();
});

function renderWithAuthority(
  node: ReactNode,
  isAuthoritative: boolean,
  entries: [string, string][] = [],
) {
  return render(
    <MemoryRouter>
      <MentionNamesAuthorityContext.Provider value={isAuthoritative}>
        <MentionNamesContext.Provider value={new Map(entries)}>
          {node}
        </MentionNamesContext.Provider>
      </MentionNamesAuthorityContext.Provider>
    </MemoryRouter>,
  );
}

test("an unresolved business under an authoritative map renders plain text", () => {
  const { container } = renderWithAuthority(
    <MentionText text="meet at b/caf later" />,
    true,
  );
  expect(screen.queryByRole("link")).toBeNull();
  expect(container.textContent).toBe("meet at b/caf later");
  expect(container.querySelector("[title]")).toBeNull();
});

test("an unresolved topic under an authoritative map still links", () => {
  renderWithAuthority(<MentionText text="about #queer-books" />, true);
  expect(
    screen.getByRole("link", { name: "#queer-books" }),
  ).toBeInTheDocument();
});

test("an unresolved mention under a non-authoritative map still links", () => {
  renderWithAuthority(<MentionText text="meet at b/caf later" />, false);
  expect(screen.getByRole("link", { name: "b/caf" })).toBeInTheDocument();
});

test("a resolved mention under an authoritative map links with its name", () => {
  renderWithAuthority(<MentionText text="meet at b/cafe-azul" />, true, [
    [mentionNameKey("business", "cafe-azul"), "Cafe Azul"],
  ]);
  expect(screen.getByRole("link", { name: "Cafe Azul" })).toHaveAttribute(
    "title",
    "b/cafe-azul",
  );
});

test("a bold mention in a markdown body links when its name resolved", () => {
  renderWithAuthority(<MarkdownLite text="hello **@ana**" />, true, [
    [mentionNameKey("member", "ana"), "Ana"],
  ]);
  expect(screen.getByRole("link", { name: "Ana" })).toBeInTheDocument();
});

test("markdown refs cover mentions the raw body hides behind markers", () => {
  const body = "hello **@ana** and *c/foo*";
  expect(mentionRefsInAll([body])).toEqual([]);
  expect(mentionRefsInMarkdownAll([body])).toEqual([
    "community:foo",
    "member:ana",
  ]);
});

test("a ref a settled lookup left unnamed stays plain while a new ref's lookup is in flight", async () => {
  let resolveSecondLookup: (names: ResolvedMentionNameDTO[]) => void = () =>
    undefined;
  mentionApiMocks.getMentionNames
    .mockResolvedValueOnce([])
    .mockImplementationOnce(
      () =>
        new Promise<ResolvedMentionNameDTO[]>((resolve) => {
          resolveSecondLookup = resolve;
        }),
    );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Thread({ texts }: { texts: string[] }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ResolvedMentionNamesProvider texts={texts}>
            {texts.map((text) => (
              <p key={text}>
                <MentionText text={text} />
              </p>
            ))}
          </ResolvedMentionNamesProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  const { rerender } = render(<Thread texts={["meet at b/caf"]} />);
  // No settled answer yet, so the ref keeps its link.
  expect(screen.getByRole("link", { name: "b/caf" })).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByRole("link", { name: "b/caf" })).toBeNull(),
  );
  expect(screen.getByText("b/caf")).toBeInTheDocument();

  // A new reply adds a ref: the first answer stays on screen as placeholder
  // data while the second request is in flight.
  rerender(<Thread texts={["meet at b/caf", "ask @ana"]} />);
  await waitFor(() =>
    expect(mentionApiMocks.getMentionNames).toHaveBeenCalledTimes(2),
  );
  expect(screen.queryByRole("link", { name: "b/caf" })).toBeNull();
  expect(screen.getByRole("link", { name: "@ana" })).toBeInTheDocument();

  resolveSecondLookup([{ kind: "member", slug: "ana", name: "Ana" }]);
  expect(await screen.findByRole("link", { name: "Ana" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "b/caf" })).toBeNull();
});
