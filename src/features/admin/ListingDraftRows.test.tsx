import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ListingDraftRows } from "./ListingDraftRows";
import type { AdminListingDraftDTO } from "./api/adminListingDrafts.api";

const DAY_MS = 86_400_000;

function makeDraft(
  overrides: Partial<AdminListingDraftDTO> = {},
): AdminListingDraftDTO {
  return {
    id: "listing-draft-test",
    name: "Tasca da Graça",
    hood: "Graça",
    path: "claim",
    step: 2,
    owner: {
      userId: "user-marta",
      slug: "marta",
      firstName: "Marta",
      lastName: "Fonseca",
      avatarUrl: null,
    },
    createdAt: new Date(Date.now() - 3 * DAY_MS).toISOString(),
    updatedAt: new Date(Date.now() - 1 * DAY_MS).toISOString(),
    ...overrides,
  };
}

function renderRows(drafts: AdminListingDraftDTO[]) {
  return render(
    <TestProviders>
      <ListingDraftRows drafts={drafts} />
    </TestProviders>,
  );
}

describe("ListingDraftRows", () => {
  it("shows the step reached, the owner and a reach-out action", async () => {
    renderRows([makeDraft()]);
    expect(await screen.findByText(/Step 3 of 6/)).toBeInTheDocument();
    expect(screen.getByText("Tasca da Graça")).toBeInTheDocument();
    expect(screen.getByText("Started by Marta Fonseca")).toBeInTheDocument();
    expect(screen.getByText("Recently edited")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Message Marta/ }),
    ).toBeInTheDocument();
  });

  it("marks a draft untouched for a week or more as stalled", async () => {
    renderRows([
      makeDraft({
        updatedAt: new Date(Date.now() - 12 * DAY_MS).toISOString(),
      }),
    ]);
    expect(await screen.findByText("Quiet for 12 days")).toBeInTheDocument();
  });

  it("names an untitled draft and offers no contact for an erased owner", async () => {
    renderRows([makeDraft({ name: "  ", owner: null })]);
    expect(await screen.findByText("Untitled place")).toBeInTheDocument();
    expect(
      screen.getByText("Started by a member who has since left"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Message/ })).toBeNull();
  });

  it("opens the message modal pre-filled with a starter message", async () => {
    const user = userEvent.setup();
    renderRows([makeDraft()]);
    await user.click(
      await screen.findByRole("button", { name: /Message Marta/ }),
    );
    const dialog = await screen.findByRole("dialog");
    const textarea = within(dialog).getByRole("textbox");
    expect((textarea as HTMLTextAreaElement).value).toContain(
      "started listing Tasca da Graça",
    );
  });

  it("renders the empty line when nobody has a draft open", async () => {
    renderRows([]);
    expect(
      await screen.findByText("No unfinished drafts right now."),
    ).toBeInTheDocument();
  });
});
