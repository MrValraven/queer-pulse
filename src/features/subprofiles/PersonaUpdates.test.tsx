import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { PersonaPostView } from "./api/personaPosts.adapters";
import type { PersonaPostsResult } from "./api/usePersonaPosts";
import { PersonaUpdates } from "./PersonaUpdates";

const post = (index: number): PersonaPostView => ({
  id: `post-${index}`,
  body: `Update number ${index}`,
  linkUrl: null,
  link: null,
  imageUrl: null,
  createdAt: new Date(Date.now() - index * 3_600_000).toISOString(),
  editedAt: null,
  isEdited: false,
  canEdit: false,
});

const fetchNextPage = vi.fn(() => Promise.resolve(null));
const deletePost = vi.fn();
let result: PersonaPostsResult;
vi.mock("./api/usePersonaPosts", () => ({
  usePersonaPosts: () => result,
}));
vi.mock("./api/usePersonaPostMutations", () => ({
  isPersonaPostGone: () => false,
  useCreatePersonaPost: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdatePersonaPost: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeletePersonaPost: () => ({ mutateAsync: deletePost, isPending: false }),
}));

function resultWith(
  posts: PersonaPostView[],
  hasMore = false,
): PersonaPostsResult {
  return {
    posts,
    hasLoaded: true,
    hasFailed: false,
    isRetrying: false,
    retry: vi.fn(),
    hasMore,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage,
  };
}

const persona = {
  id: "sp-diogo-nightform",
  kind: "musician",
  displayName: "NIGHTFORM",
};

const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
const scrollIntoView = vi.fn();

beforeEach(() => {
  fetchNextPage.mockClear();
  deletePost.mockReset();
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  if (originalScrollIntoView)
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      originalScrollIntoView,
    );
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

/** Opens a post's menu and confirms Delete update in the dialog. */
async function pressDeleteInDialog(times = 1) {
  fireEvent.click(
    await screen.findByRole("button", { name: "Update actions" }),
  );
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "Delete update" }),
  );
  const dialog = await screen.findByRole("dialog");
  const confirm = within(dialog).getByRole("button", { name: "Delete update" });
  for (let press = 0; press < times; press += 1) fireEvent.click(confirm);
}

describe("PersonaUpdates focus", () => {
  it("scrolls to the block and focuses its heading once the posts answer on #updates", async () => {
    result = { ...resultWith([]), hasLoaded: false };
    const tree = (
      <TestProviders initialEntries={["/p/nightform#updates"]}>
        <PersonaUpdates persona={persona} mode="public" surface="persona" />
      </TestProviders>
    );
    const { rerender, container } = render(tree);
    expect(container.querySelector("#updates")).toBeNull();
    expect(scrollIntoView).not.toHaveBeenCalled();
    result = resultWith([post(1)]);
    rerender(tree);
    const heading = await screen.findByRole("heading", { name: "Updates" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: "start" }),
    );
    heading.blur();
    result = resultWith([post(1), post(2)]);
    rerender(tree);
    expect(await screen.findByText("Update number 2")).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(heading).not.toHaveFocus();
  });

  it("deletes once when the confirm is pressed twice in a row", async () => {
    deletePost.mockReturnValue(new Promise(() => {}));
    result = resultWith([{ ...post(1), canEdit: true }]);
    render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="owner" surface="persona" />
      </TestProviders>,
    );
    await pressDeleteInDialog(2);
    await waitFor(() => expect(deletePost).toHaveBeenCalledTimes(1));
    expect(deletePost).toHaveBeenCalledTimes(1);
  });

  it("hands focus to the tab panel when deleting the only post empties the Studio block", async () => {
    deletePost.mockResolvedValue(undefined);
    result = resultWith([{ ...post(1), canEdit: true }]);
    const tree = (children: ReactNode) => (
      <TestProviders>
        <div role="tabpanel" tabIndex={0} aria-label="About">
          {children}
        </div>
      </TestProviders>
    );
    const block = (
      <PersonaUpdates persona={persona} mode="owner" surface="studio" />
    );
    const { rerender } = render(tree(block));
    await pressDeleteInDialog();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Updates" })).toHaveFocus(),
    );
    result = resultWith([]);
    rerender(tree(block));
    await waitFor(() =>
      expect(screen.getByRole("tabpanel", { name: "About" })).toHaveFocus(),
    );
  });

  it("leaves focus alone when the Studio block empties while focus sits on the page", async () => {
    result = resultWith([post(1)]);
    const tree = (children: ReactNode) => (
      <TestProviders>
        <div role="tabpanel" tabIndex={0} aria-label="About">
          {children}
        </div>
      </TestProviders>
    );
    const block = (
      <PersonaUpdates persona={persona} mode="owner" surface="studio" />
    );
    const { rerender } = render(tree(block));
    const heading = await screen.findByRole("heading", { name: "Updates" });
    await act(async () => {
      heading.focus();
      heading.blur();
      await Promise.resolve();
    });
    expect(document.body).toHaveFocus();
    result = resultWith([]);
    rerender(tree(block));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Updates" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("tabpanel", { name: "About" })).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
});

describe("PersonaUpdates", () => {
  it("shows nothing to a visitor when there are no posts", () => {
    result = resultWith([]);
    const { container } = render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="public" surface="persona" />
      </TestProviders>,
    );
    expect(container.querySelector("#updates")).toBeNull();
  });

  it("shows nothing for a persona of another kind", () => {
    result = resultWith([post(1)]);
    const { container } = render(
      <TestProviders>
        <PersonaUpdates
          persona={{ ...persona, kind: "therapist" }}
          mode="public"
          surface="persona"
        />
      </TestProviders>,
    );
    expect(container.querySelector("#updates")).toBeNull();
  });

  it("gives the owner the block and the composer with no posts yet", async () => {
    result = resultWith([]);
    render(
      <TestProviders>
        <PersonaUpdates
          persona={persona}
          mode="owner"
          surface="persona"
          isComposerShown
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Updates" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Post update" }),
    ).toBeInTheDocument();
  });

  it("gives a Studio owner with no posts the composer under the heading", async () => {
    result = resultWith([]);
    render(
      <TestProviders>
        <PersonaUpdates
          persona={persona}
          mode="owner"
          surface="studio"
          isComposerShown
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Updates" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your update")).toBeInTheDocument();
  });

  it("shows three posts, then the rest of the page, then asks for the next one", async () => {
    result = resultWith([post(1), post(2), post(3), post(4), post(5)], true);
    render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="public" surface="persona" />
      </TestProviders>,
    );
    expect(await screen.findByText("Update number 3")).toBeInTheDocument();
    expect(screen.queryByText("Update number 4")).not.toBeInTheDocument();
    const more = screen.getByRole("button", { name: "Show more updates" });
    fireEvent.click(more);
    expect(await screen.findByText("Update number 5")).toBeInTheDocument();
    expect(fetchNextPage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Show more updates" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("anchors the persona page block for the notification link", async () => {
    result = resultWith([post(1)]);
    const { container } = render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="public" surface="persona" />
      </TestProviders>,
    );
    await screen.findByText("Update number 1");
    expect(container.querySelector("section#updates")).not.toBeNull();
  });

  it("gives the owner Edit update and Delete update on their own post", async () => {
    result = resultWith([{ ...post(1), canEdit: true }]);
    render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="owner" surface="persona" />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Update actions" }),
    );
    expect(
      await screen.findByRole("menuitem", { name: "Edit update" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Delete update" }),
    ).toBeInTheDocument();
  });

  it("deletes after the confirm and hands focus to the heading", async () => {
    deletePost.mockResolvedValue(undefined);
    result = resultWith([{ ...post(1), canEdit: true }]);
    render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="owner" surface="persona" />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Update actions" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Delete update" }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete this update?")).toBeInTheDocument();
    expect(deletePost).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete update" }),
    );
    await waitFor(() =>
      expect(deletePost).toHaveBeenCalledWith({ postId: "post-1" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Updates" })).toHaveFocus(),
    );
  });

  it("gives the owner a retry line when the first read failed", async () => {
    const retry = vi.fn();
    result = { ...resultWith([]), hasLoaded: false, hasFailed: true, retry };
    render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="owner" surface="persona" />
      </TestProviders>,
    );
    expect(
      await screen.findByText("We couldn't load your updates"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("shows a visitor nothing when the first read failed", () => {
    result = { ...resultWith([]), hasLoaded: false, hasFailed: true };
    const { container } = render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="public" surface="persona" />
      </TestProviders>,
    );
    expect(container.querySelector("#updates")).toBeNull();
  });

  it("shows no owner actions while the owner views as a visitor", async () => {
    result = resultWith([{ ...post(1), canEdit: true }]);
    render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="visitor" surface="persona" />
      </TestProviders>,
    );
    await screen.findByText("Update number 1");
    expect(
      screen.queryByRole("button", { name: "Update actions" }),
    ).not.toBeInTheDocument();
  });

  it("shows posts with no menus and an inert link in the editor preview", async () => {
    result = resultWith([
      {
        ...post(1),
        canEdit: true,
        linkUrl: "https://example.org/tickets",
        link: { href: "https://example.org/tickets", host: "example.org" },
      },
    ]);
    render(
      <TestProviders>
        <PersonaUpdates persona={persona} mode="preview" surface="persona" />
      </TestProviders>,
    );
    expect(await screen.findByText("example.org")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Update actions" }),
    ).not.toBeInTheDocument();
  });
});
