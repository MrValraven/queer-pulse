import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import type { Thread } from "./forum.data";
import { useForumThreadTitleEdit } from "./useForumThreadTitleEdit";

const { showToastMock } = vi.hoisted(() => ({ showToastMock: vi.fn() }));
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));
vi.mock("./api/useForumMutations", () => ({
  useEditThreadTitle: () => ({
    isPending: false,
    mutate: (
      _variables: { title: string },
      options: { onError: (error: unknown) => void },
    ) =>
      options.onError(
        new ApiError(400, "Bad", { code: "funding_payment_details_in_body" }),
      ),
  }),
}));

const THREAD: Thread = {
  id: 35,
  slug: "help-rui",
  category: "funding",
  kind: "ask",
  title: "Help Rui",
  excerpt: "",
  author: {
    initials: "IT",
    name: "Inês T",
    background: "var(--plum)",
    color: "var(--paper)",
  },
  posted: "now",
  upvotes: 0,
  comments: 0,
  tags: [],
  body: [],
  replies: [],
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

describe("useForumThreadTitleEdit on a funding thread", () => {
  it("toasts the funding refusal's own copy when the server refuses the edit", () => {
    const { result } = renderHook(
      () =>
        useForumThreadTitleEdit({
          demoMode: false,
          allThreads: [THREAD],
          setExtraThreads: vi.fn(),
        }),
      { wrapper },
    );
    act(() => result.current.setEditingTitleThreadId(THREAD.id));
    act(() => result.current.saveThreadTitle("Help Rui, IBAN PT50 0000"));
    expect(showToastMock).toHaveBeenCalledWith(
      "Take the IBAN or phone number out. Donations go through the fundraising page.",
      "error",
    );
  });
});
