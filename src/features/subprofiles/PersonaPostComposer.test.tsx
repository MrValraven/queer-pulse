import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { PersonaPostView } from "./api/personaPosts.adapters";
import { PersonaPostComposer } from "./PersonaPostComposer";

const createPost = vi.fn();
const updatePost = vi.fn();
vi.mock("./api/usePersonaPostMutations", () => ({
  isPersonaPostGone: (error: unknown) =>
    error instanceof Error && "status" in error && error.status === 404,
  useCreatePersonaPost: () => ({ mutateAsync: createPost, isPending: false }),
  useUpdatePersonaPost: () => ({ mutateAsync: updatePost, isPending: false }),
}));

vi.mock("../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
    surface,
    onRemove,
  }: {
    target: { kind: string };
    surface: string;
    onRemove?: () => void;
  }) => (
    <div
      data-testid="studio-card"
      data-kind={target.kind}
      data-surface={surface}
    >
      {onRemove && (
        <button type="button" onClick={onRemove}>
          remove card
        </button>
      )}
    </div>
  ),
}));

const savedPost: PersonaPostView = {
  id: "post-1",
  body: "Rehearsal tonight",
  linkUrl: "https://example.org/tickets",
  link: { href: "https://example.org/tickets", host: "example.org" },
  imageUrl: null,
  createdAt: new Date().toISOString(),
  editedAt: null,
  isEdited: false,
  canEdit: true,
};

function renderComposer() {
  render(
    <TestProviders>
      <PersonaPostComposer subprofileId="p1" />
    </TestProviders>,
  );
}

beforeEach(() => {
  createPost.mockReset();
  updatePost.mockReset();
});

describe("PersonaPostComposer", () => {
  it("counts to 500 and blocks an empty update", async () => {
    renderComposer();
    const body = await screen.findByLabelText("Your update");
    expect(body).toHaveAttribute("maxLength", "500");
    expect(screen.getByText("0 of 500")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Post update" }));
    expect(createPost).not.toHaveBeenCalled();
    expect(screen.getByText("Write something first")).toBeInTheDocument();
    fireEvent.change(body, { target: { value: "Rehearsal tonight" } });
    expect(screen.getByText("17 of 500")).toBeInTheDocument();
  });

  it("asks for an https link once Add link is open", async () => {
    renderComposer();
    fireEvent.change(await screen.findByLabelText("Your update"), {
      target: { value: "Tickets" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add link" }));
    fireEvent.change(await screen.findByLabelText("Link"), {
      target: { value: "http://example.org/tickets" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post update" }));
    expect(createPost).not.toHaveBeenCalled();
    const linkError = screen.getByText(
      "Use a full web address, starting with https://",
    );
    expect(linkError).toBeInTheDocument();
    const linkField = screen.getByLabelText("Link");
    expect(linkField).toHaveAttribute("aria-invalid", "true");
    expect(
      linkField.getAttribute("aria-describedby") &&
        linkError.closest(
          `[id="${linkField.getAttribute("aria-describedby")}"]`,
        ),
    ).not.toBeNull();
    expect(screen.getByLabelText("Your update")).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("names the open toggles Remove link and Remove photo", async () => {
    renderComposer();
    await screen.findByLabelText("Your update");
    const addLink = screen.getByRole("button", { name: "Add link" });
    fireEvent.click(addLink);
    expect(addLink).toHaveAccessibleName("Remove link");
    expect(addLink).toHaveAttribute("aria-expanded", "true");
    const addPhoto = screen.getByRole("button", { name: "Add photo" });
    fireEvent.click(addPhoto);
    expect(addPhoto).toHaveAccessibleName("Remove photo");
    expect(screen.queryByText("Add a photo")).not.toBeInTheDocument();
    fireEvent.click(addLink);
    expect(addLink).toHaveAccessibleName("Add link");
  });

  it("drops the link when Add link closes again", async () => {
    createPost.mockResolvedValue({ id: "new" });
    renderComposer();
    fireEvent.change(await screen.findByLabelText("Your update"), {
      target: { value: "Tickets" },
    });
    const addLink = screen.getByRole("button", { name: "Add link" });
    fireEvent.click(addLink);
    fireEvent.change(await screen.findByLabelText("Link"), {
      target: { value: "mailto:band@example.org" },
    });
    fireEvent.click(addLink);
    fireEvent.click(screen.getByRole("button", { name: "Post update" }));
    await waitFor(() =>
      expect(createPost).toHaveBeenCalledWith({ body: "Tickets" }),
    );
  });

  it("posts a trimmed update and clears the field", async () => {
    createPost.mockResolvedValue({ id: "new" });
    renderComposer();
    const body = await screen.findByLabelText("Your update");
    fireEvent.change(body, { target: { value: "  Rehearsal tonight  " } });
    fireEvent.click(screen.getByRole("button", { name: "Post update" }));
    await waitFor(() =>
      expect(createPost).toHaveBeenCalledWith({ body: "Rehearsal tonight" }),
    );
    await waitFor(() => expect(body).toHaveValue(""));
    expect(screen.getByText("Update posted")).toBeInTheDocument();
  });

  it("posts once when Post update is pressed twice in a row", async () => {
    let finishCreate: (value: { id: string }) => void = () => {};
    createPost.mockReturnValue(
      new Promise((resolve) => {
        finishCreate = resolve;
      }),
    );
    renderComposer();
    fireEvent.change(await screen.findByLabelText("Your update"), {
      target: { value: "Doors at eight" },
    });
    const postButton = screen.getByRole("button", { name: "Post update" });
    fireEvent.click(postButton);
    fireEvent.click(postButton);
    expect(createPost).toHaveBeenCalledTimes(1);
    finishCreate({ id: "new" });
    expect(await screen.findByText("Update posted")).toBeInTheDocument();
    expect(createPost).toHaveBeenCalledTimes(1);
  });

  it("tells its parent when an edit finds the post gone", async () => {
    updatePost.mockRejectedValue(new ApiError(404, "not_found", {}));
    const onGone = vi.fn();
    render(
      <TestProviders>
        <PersonaPostComposer
          subprofileId="p1"
          post={savedPost}
          onDone={vi.fn()}
          onGone={onGone}
        />
      </TestProviders>,
    );
    fireEvent.change(await screen.findByLabelText("Your update"), {
      target: { value: "Doors at nine" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save update" }));
    await waitFor(() => expect(onGone).toHaveBeenCalledTimes(1));
  });

  it("shows the daily limit line when the server refuses", async () => {
    createPost.mockRejectedValue(
      new ApiError(429, "limit", { code: "persona_post_daily_limit" }),
    );
    renderComposer();
    fireEvent.change(await screen.findByLabelText("Your update"), {
      target: { value: "One more" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post update" }));
    expect(
      await screen.findByText(
        "That's 10 updates in a day for this persona. Post again tomorrow",
      ),
    ).toBeInTheDocument();
  });

  it("closes an edit with no change and sends nothing", async () => {
    const onDone = vi.fn();
    const onCancel = vi.fn();
    render(
      <TestProviders>
        <PersonaPostComposer
          subprofileId="p1"
          post={savedPost}
          onDone={onDone}
          onCancel={onCancel}
        />
      </TestProviders>,
    );
    expect(await screen.findByLabelText("Your update")).toHaveValue(
      "Rehearsal tonight",
    );
    fireEvent.click(screen.getByRole("button", { name: "Save update" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(updatePost).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe("PersonaPostComposer edits", () => {
  function renderEdit() {
    updatePost.mockResolvedValue(savedPost);
    render(
      <TestProviders>
        <PersonaPostComposer
          subprofileId="p1"
          post={{ ...savedPost, imageUrl: "https://cdn.example.org/photo.jpg" }}
          onDone={vi.fn()}
          onCancel={vi.fn()}
        />
      </TestProviders>,
    );
  }

  it("sends the link removal when Remove link closes the field", async () => {
    renderEdit();
    await screen.findByLabelText("Your update");
    expect(screen.getByLabelText("Link")).toHaveValue(
      "https://example.org/tickets",
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove link" }));
    fireEvent.click(screen.getByRole("button", { name: "Save update" }));
    await waitFor(() =>
      expect(updatePost).toHaveBeenCalledWith({
        postId: "post-1",
        body: { linkUrl: null },
      }),
    );
  });

  it("sends the photo removal when Remove photo closes the field", async () => {
    renderEdit();
    await screen.findByLabelText("Your update");
    fireEvent.click(screen.getByRole("button", { name: "Remove photo" }));
    fireEvent.click(screen.getByRole("button", { name: "Save update" }));
    await waitFor(() =>
      expect(updatePost).toHaveBeenCalledWith({
        postId: "post-1",
        body: { imageKey: null },
      }),
    );
  });

  it("sends only the changed body on an edit", async () => {
    updatePost.mockResolvedValue(savedPost);
    const onDone = vi.fn();
    render(
      <TestProviders>
        <PersonaPostComposer
          subprofileId="p1"
          post={savedPost}
          onDone={onDone}
        />
      </TestProviders>,
    );
    fireEvent.change(await screen.findByLabelText("Your update"), {
      target: { value: "Rehearsal moved to Friday" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save update" }));
    await waitFor(() =>
      expect(updatePost).toHaveBeenCalledWith({
        postId: "post-1",
        body: { body: "Rehearsal moved to Friday" },
      }),
    );
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it("previews a Studio link with one remove control, the Remove link toggle", async () => {
    renderComposer();
    fireEvent.change(await screen.findByLabelText("Your update"), {
      target: { value: "out now" },
    });
    const addLink = screen.getByRole("button", { name: "Add link" });
    fireEvent.click(addLink);
    const linkField = screen.getByPlaceholderText("https://");
    fireEvent.change(linkField, {
      target: {
        value:
          "https://queerpulse.com/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10",
      },
    });
    expect(screen.getByTestId("studio-card")).toHaveAttribute(
      "data-surface",
      "composer",
    );
    expect(screen.queryByRole("button", { name: "remove card" })).toBeNull();
    fireEvent.click(addLink);
    expect(addLink).toHaveAccessibleName("Add link");
    fireEvent.click(addLink);
    expect(screen.getByPlaceholderText("https://")).toHaveValue("");
  });

  it("previews only an absolute https Studio link, the form the save takes", async () => {
    renderComposer();
    await screen.findByLabelText("Your update");
    fireEvent.click(screen.getByRole("button", { name: "Add link" }));
    fireEvent.change(screen.getByPlaceholderText("https://"), {
      target: {
        value: "/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10",
      },
    });
    expect(screen.queryByTestId("studio-card")).toBeNull();
  });
});
