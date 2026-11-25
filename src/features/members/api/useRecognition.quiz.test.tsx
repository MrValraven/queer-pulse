import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { QUIZ_WIN_BADGES_DEMO_CHAMPION_ID } from "../../quizshow/winBadges/quizWinBadgesDemo.data";
import { resetQuizWinBadgesDemoStore } from "../../quizshow/winBadges/quizWinBadgesDemoStore";
import { earnedBadges } from "../badges.data";
import { useRecognition } from "./useRecognition";
import { useSetBadgeVisibility } from "./useRecognitionMutations";

const championBadgeKey = `quiz:${QUIZ_WIN_BADGES_DEMO_CHAMPION_ID}`;

function wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

beforeEach(() => {
  resetQuizWinBadgesDemoStore();
});

describe("useRecognition with quiz badges in demo", () => {
  it("lists the demo member's two quiz badges in demo", async () => {
    const { result } = renderHook(() => useRecognition(), { wrapper });
    await waitFor(() => {
      const names = result.current.badges.earned.map((badge) => badge.name);
      expect(names).toContain("Quiz Night Champion");
      expect(names).toContain("Trivia Sharpshooter");
    });
    const champion = result.current.badges.earned.find(
      (badge) => badge.key === championBadgeKey,
    );
    expect(champion?.quiz?.winCount).toBe(2);
  });

  it("counts quiz badges in the earned count", async () => {
    const { result } = renderHook(() => useRecognition(), { wrapper });
    await waitFor(() => {
      expect(result.current.badges.earnedCount).toBe(earnedBadges.length + 2);
    });
    expect(result.current.badges.earned).toHaveLength(earnedBadges.length + 2);
  });

  it("gives another viewer the masked projection", async () => {
    const { result } = renderHook(() => useRecognition("sofia"), { wrapper });
    await waitFor(() => {
      const champion = result.current.badges.earned.find(
        (badge) => badge.key === championBadgeKey,
      );
      expect(champion).toBeDefined();
      expect(champion?.quiz?.wins.some((win) => win.eventName === null)).toBe(
        true,
      );
    });
  });

  it("drops a hidden quiz badge for another viewer after the switch", async () => {
    const { result } = renderHook(
      () => ({
        otherViewer: useRecognition("sofia"),
        setVisibility: useSetBadgeVisibility(),
      }),
      { wrapper },
    );
    await waitFor(() => {
      expect(
        result.current.otherViewer.badges.earned.some(
          (badge) => badge.key === championBadgeKey,
        ),
      ).toBe(true);
    });
    await act(async () => {
      await result.current.setVisibility.mutateAsync({
        badgeKey: championBadgeKey,
        hiddenFromProfile: true,
      });
    });
    await waitFor(() => {
      expect(
        result.current.otherViewer.badges.earned.some(
          (badge) => badge.key === championBadgeKey,
        ),
      ).toBe(false);
    });
  });
});
