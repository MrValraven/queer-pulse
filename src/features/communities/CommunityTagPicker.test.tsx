import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommunityTagPicker } from "./CommunityTagPicker";
import { COMMUNITY_TAGS, MAX_COMMUNITY_TAGS } from "./communityTags.data";

/** The first `MAX_COMMUNITY_TAGS` catalog entries, used as an at-limit
 *  selection. Any tag past this slice is unselected in every test below. */
const TAGS_AT_LIMIT = COMMUNITY_TAGS.slice(0, MAX_COMMUNITY_TAGS);
const TAGS_AT_LIMIT_IDS = TAGS_AT_LIMIT.map((tag) => tag.id);
const FIRST_UNSELECTED_TAG = COMMUNITY_TAGS[MAX_COMMUNITY_TAGS]!;

type PickerProps = Parameters<typeof CommunityTagPicker>[0];

function renderPicker(props: Partial<PickerProps> = {}) {
  const onChange = vi.fn<(next: string[]) => void>();
  render(
    <TestProviders>
      <CommunityTagPicker
        label="Tags"
        selectedIds={[]}
        onChange={onChange}
        {...props}
      />
    </TestProviders>,
  );
  return { onChange };
}

/** Opens the picker when it started collapsed (any non-empty selection), so
 *  every catalog chip is on screen, selected and unselected alike. */
async function openPicker() {
  const user = userEvent.setup();
  const toggle = screen.queryByRole("button", { name: "Add more tags" });
  if (toggle) await user.click(toggle);
  return user;
}

describe("CommunityTagPicker", () => {
  it("at the limit every unselected chip is disabled", async () => {
    renderPicker({ selectedIds: TAGS_AT_LIMIT_IDS });
    await openPicker();

    const unselectedChip = await screen.findByRole("button", {
      name: FIRST_UNSELECTED_TAG.enLabel,
    });
    expect(unselectedChip).toBeDisabled();

    const selectedChip = screen.getByRole("button", {
      name: TAGS_AT_LIMIT[0]!.enLabel,
    });
    expect(selectedChip).toBeEnabled();
  });

  it("at the limit a selected chip still toggles off", async () => {
    const { onChange } = renderPicker({ selectedIds: TAGS_AT_LIMIT_IDS });
    const user = await openPicker();

    const selectedTag = TAGS_AT_LIMIT[0]!;
    await user.click(screen.getByRole("button", { name: selectedTag.enLabel }));

    expect(onChange).toHaveBeenCalledWith(
      TAGS_AT_LIMIT_IDS.filter((id) => id !== selectedTag.id),
    );
  });

  it("at the limit the count explains how to pick another", async () => {
    renderPicker({ selectedIds: TAGS_AT_LIMIT_IDS });
    await openPicker();

    expect(
      await screen.findByText(
        `${MAX_COMMUNITY_TAGS} of ${MAX_COMMUNITY_TAGS} chosen. Remove one to pick another.`,
      ),
    ).toBeInTheDocument();
  });

  it("below the limit every chip is enabled", async () => {
    const belowLimitIds = TAGS_AT_LIMIT_IDS.slice(0, 2);
    renderPicker({ selectedIds: belowLimitIds });
    await openPicker();

    const unselectedChip = await screen.findByRole("button", {
      name: FIRST_UNSELECTED_TAG.enLabel,
    });
    expect(unselectedChip).toBeEnabled();

    const selectedChip = screen.getByRole("button", {
      name: TAGS_AT_LIMIT[0]!.enLabel,
    });
    expect(selectedChip).toBeEnabled();
  });
});
