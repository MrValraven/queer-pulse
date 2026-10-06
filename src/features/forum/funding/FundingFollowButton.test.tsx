import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useTopicFollow } from "../../topics/api/useTopicFollow";
import { FundingFollowButton } from "./FundingFollowButton";

vi.mock("../../topics/api/useTopicFollow", () => ({ useTopicFollow: vi.fn() }));
const followMock = vi.mocked(useTopicFollow);
const toggle = vi.fn();

function state(isFollowing: boolean, isPending = false) {
  return {
    isFollowing,
    isPending,
    isFollowStateUnknown: false,
    refetchFollows: vi.fn(),
    toggle,
  };
}

describe("FundingFollowButton", () => {
  beforeEach(() => toggle.mockReset());

  it("follows the open-call topic", () => {
    followMock.mockReturnValue(state(false));
    render(
      <TestProviders>
        <FundingFollowButton />
      </TestProviders>,
    );
    expect(followMock).toHaveBeenCalledWith("open-call", {
      successToastKeys: {
        follow: "forum:funding.follow.followedToast",
        unfollow: "forum:funding.follow.unfollowedToast",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Follow new calls" }));
    expect(toggle).toHaveBeenCalled();
  });

  it("says when the member already follows", () => {
    followMock.mockReturnValue(state(true));
    render(
      <TestProviders>
        <FundingFollowButton />
      </TestProviders>,
    );
    expect(
      screen.getByRole("button", { name: "Following new calls" }),
    ).toBeInTheDocument();
  });

  it("keeps focus while the request runs and ignores a second press", () => {
    followMock.mockReturnValue(state(false, true));
    render(
      <TestProviders>
        <FundingFollowButton />
      </TestProviders>,
    );
    const button = screen.getByRole("button", { name: "Follow new calls" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    button.focus();
    fireEvent.click(button);
    expect(button).toHaveFocus();
    expect(toggle).not.toHaveBeenCalled();
  });
});
