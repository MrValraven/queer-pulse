import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuizshowJoinResponse } from "../../../shared/contracts/quizshow";
import { usePlayJoin } from "./usePlayJoin";

/** The hook's two inputs; the code goes null when the player is back on the code form. */
interface JoinProps {
  code: string | null;
  attemptKey: string;
}

interface PendingJoin {
  code: string;
  resolve: (join: QuizshowJoinResponse) => void;
}

const joinMock = vi.hoisted(() => ({
  pendingJoins: [] as PendingJoin[],
}));

vi.mock("../api/useQuizshowMutations", () => {
  const mutateAsync = (body: { code: string }) =>
    new Promise<QuizshowJoinResponse>((resolve) => {
      joinMock.pendingJoins.push({ code: body.code, resolve });
    });
  return { useJoinQuizshow: () => ({ mutateAsync }) };
});

function joinResponseFor(code: string): QuizshowJoinResponse {
  return {
    sessionId: `session-${code}`,
    eventSlug: "quiz-night",
    eventTitle: "Quiz night",
    status: "lobby",
    isRejoin: false,
  };
}

function pendingJoinFor(code: string): PendingJoin {
  const pendingJoin = joinMock.pendingJoins.find(
    (candidate) => candidate.code === code,
  );
  if (pendingJoin === undefined) throw new Error(`No join posted for ${code}`);
  return pendingJoin;
}

beforeEach(() => {
  joinMock.pendingJoins = [];
});

describe("usePlayJoin", () => {
  it("a slower older join does not replace the newer one", async () => {
    const initialProps: JoinProps = { code: "OLDER1", attemptKey: "a" };
    const { result, rerender } = renderHook(
      ({ code, attemptKey }: JoinProps) => usePlayJoin(code, attemptKey),
      { initialProps },
    );
    expect(result.current.isPending).toBe(true);

    // Back to the code form, then a second code on the same page instance.
    rerender({ code: null, attemptKey: "b" });
    rerender({ code: "NEWER2", attemptKey: "c" });
    expect(joinMock.pendingJoins.map((pending) => pending.code)).toEqual([
      "OLDER1",
      "NEWER2",
    ]);

    await act(async () => {
      pendingJoinFor("NEWER2").resolve(joinResponseFor("NEWER2"));
      await Promise.resolve();
    });
    expect(result.current.join?.sessionId).toBe("session-NEWER2");

    await act(async () => {
      pendingJoinFor("OLDER1").resolve(joinResponseFor("OLDER1"));
      await Promise.resolve();
    });
    expect(result.current.join?.sessionId).toBe("session-NEWER2");
    expect(result.current.isPending).toBe(false);
  });
});
