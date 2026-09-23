import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import { CreateSpaceForm } from "./CreateSpaceForm";
import type {
  CommunityDetailDTO,
  CreateSubcommunityBody,
} from "./api/communities.api";

type MutateOptions = {
  onSuccess?: (detail: CommunityDetailDTO) => void;
  onError?: (error: unknown) => void;
};

const mutate =
  vi.fn<(body: CreateSubcommunityBody, options: MutateOptions) => void>();
let isPending = false;

vi.mock("./api/useCreateSubcommunity", () => ({
  useCreateSubcommunity: () => ({ mutate, isPending }),
}));

function detailFor(body: CreateSubcommunityBody): CommunityDetailDTO {
  return {
    slug: body.handle,
    name: body.name,
    type: "sports",
    tagline: body.tagline,
    accessTier: body.accessTier,
    ref: "QP-C-DEMO",
    memberCount: 1,
    activeThisWeek: 1,
    postsThisWeek: 0,
    myRole: "owner",
    coverImageUrl: null,
    avatarImageUrl: null,
    purpose: body.purpose,
    whoFor: body.whoFor ?? "",
    rosterVisible: true,
    features: ["discussion", "events", "roster"],
    rules: body.rules,
    owner: null,
    createdAt: new Date().toISOString(),
    myJoinRequestStatus: null,
  };
}

function renderForm() {
  const onCreated = vi.fn<(slug: string) => void>();
  render(
    <TestProviders>
      <CreateSpaceForm
        parentSlug="queer-runners"
        parentName="Queer Runners Lisboa"
        parentTier="request"
        onCreated={onCreated}
      />
    </TestProviders>,
  );
  return { onCreated };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("Name"), "  Trail Runners  ");
  await user.type(screen.getByLabelText("Web address"), "  Trail Runners  ");
  await user.type(screen.getByLabelText("Tagline"), "  For the hills  ");
  await user.type(
    screen.getByLabelText("What it's for"),
    "  Long weekend runs.  ",
  );
}

describe("CreateSpaceForm", () => {
  beforeEach(() => {
    mutate.mockReset();
    isPending = false;
  });

  it("disables tiers more open than the parent and explains why", async () => {
    renderForm();

    const publicTier = await screen.findByRole("radio", {
      name: "Open to all",
    });
    expect(publicTier).toBeDisabled();
    expect(
      screen.getByText("A space can't be more open than Queer Runners Lisboa."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("radio", { name: "Request to join" }),
    ).toBeEnabled();
    expect(screen.getByRole("radio", { name: "Invite-only" })).toBeEnabled();
    expect(screen.getByRole("radio", { name: "Private" })).toBeEnabled();
  });

  it("submits trimmed fields and the rules actually added", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillRequiredFields(user);

    await user.type(
      screen.getByLabelText("Add a rule"),
      "  Be extra kind on the trail  ",
    );
    await user.click(screen.getByRole("button", { name: "Add a rule" }));

    await user.click(screen.getByRole("button", { name: "Create space" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    const [body] = mutate.mock.calls[0]!;
    expect(body).toMatchObject({
      handle: "trail-runners",
      name: "Trail Runners",
      tagline: "For the hills",
      purpose: "Long weekend runs.",
      accessTier: "request",
      rules: ["Be extra kind on the trail"],
    });
  });

  it("toasts that the community can't open spaces on a SUBCOMMUNITIES_NOT_ALLOWED 409", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillRequiredFields(user);
    mutate.mockImplementation((_body, { onError }) => {
      onError?.(
        new ApiError(409, "Not allowed", {
          code: "SUBCOMMUNITIES_NOT_ALLOWED",
        }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Create space" }));

    expect(
      await screen.findByText("This community can't open spaces right now."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Couldn't create the space. Try again."),
    ).not.toBeInTheDocument();
    // The form keeps what the moderator typed: nothing on it was wrong.
    expect(screen.getByLabelText("Name")).toHaveValue("  Trail Runners  ");
  });

  it("toasts a generic failure for any other error", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillRequiredFields(user);
    mutate.mockImplementation((_body, { onError }) => {
      onError?.(new ApiError(500, "Server error"));
    });

    await user.click(screen.getByRole("button", { name: "Create space" }));

    expect(
      await screen.findByText("Couldn't create the space. Try again."),
    ).toBeInTheDocument();
  });

  it("on success toasts, resets the form and hands the new slug up", async () => {
    const user = userEvent.setup();
    const { onCreated } = renderForm();
    await fillRequiredFields(user);
    mutate.mockImplementation((body, { onSuccess }) => {
      onSuccess?.(detailFor(body));
    });

    await user.click(screen.getByRole("button", { name: "Create space" }));

    expect(await screen.findByText("Space created")).toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledWith("trail-runners");
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });
});
