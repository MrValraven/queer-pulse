import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import type { useEditPost } from "./api/useForumMutations";
import { useReplyModeration } from "./useReplyModeration";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

describe("useReplyModeration on a fundraiser", () => {
  it("hands a refused reply edit's error on, so the payment refusal can say why", () => {
    const refusal = new ApiError(400, "Bad", {
      code: "funding_payment_details_in_body",
    });
    const editPost = {
      isPending: false,
      mutate: (
        _variables: { postId: string; body: string },
        options: { onError: (error: unknown) => void },
      ) => options.onError(refusal),
    } as unknown as ReturnType<typeof useEditPost>;
    const onMutateError = vi.fn();
    const setLocalReplies = vi.fn();
    const { result } = renderHook(
      () =>
        useReplyModeration({
          demoMode: false,
          localReplies: [],
          setLocalReplies,
          replyKey: (reply) => reply.id,
          editPost,
          onMutateError,
        }),
      { wrapper },
    );
    act(() => result.current.saveReplyEdit("post-7", "MB Way 912 345 678"));
    expect(onMutateError).toHaveBeenCalledWith(refusal);
    // The optimistic edit is rolled back to the list as it was.
    expect(setLocalReplies).toHaveBeenLastCalledWith([]);
  });
});
