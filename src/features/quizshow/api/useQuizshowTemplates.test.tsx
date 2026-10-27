import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowTemplateRow } from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";
import type { QuizshowTemplateQuizResponse } from "../templates/quizshowTemplateResponse";
import { quizshowKeys } from "./quizshowKeys";
import { resetQuizshowDemoStore } from "./quizshowDemoStore";
import {
  demoGetTemplate,
  demoListTemplates,
  demoUnpublishTemplate,
} from "./quizshowDemoTemplates";
import {
  useCreateQuizshowTemplate,
  useDeleteQuizshowTemplate,
  usePublishQuizshowTemplate,
  useQuizshowTemplateCards,
  useQuizshowTemplateRows,
} from "./useQuizshowTemplates";
import { quizResponseOfTemplate } from "../templates/quizshowTemplateResponse";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

function cachedRows(queryClient: QueryClient): QuizshowTemplateRow[] {
  return (
    queryClient.getQueryData<{ items: QuizshowTemplateRow[] }>(
      quizshowKeys.templateRows(true),
    )?.items ?? []
  );
}

function isCached(queryClient: QueryClient, queryKey: readonly unknown[]) {
  return (
    queryClient.getQueryCache().find({ queryKey, exact: true }) !== undefined
  );
}

describe("quizshow templates in demo mode", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("lists published template cards for hosts and leaves the draft out", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useQuizshowTemplateCards({ isEnabled: true }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cardIds = result.current.data?.items.map((card) => card.id) ?? [];
    expect(cardIds).toHaveLength(5);
    expect(cardIds).not.toContain(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema);
  });

  it("lists drafts first for staff", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useQuizshowTemplateRows(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const rows = result.current.data?.items ?? [];
    expect(rows).toHaveLength(6);
    expect(rows[0]?.id).toBe(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema);
    expect(rows[0]?.status).toBe("draft");
    expect(rows.slice(1).every((row) => row.status === "published")).toBe(true);
  });

  it("creates a blank draft and caches it for the builder", async () => {
    const { queryClient, wrapper } = setup();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateQuizshowTemplate(), {
      wrapper,
    });

    const detail = await result.current.mutateAsync();

    // The caller opens the new draft, so only the staff list refetches.
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: quizshowKeys.templateRows(true),
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: quizshowKeys.templateCards(true),
    });

    const cached = queryClient.getQueryData<QuizshowTemplateQuizResponse>(
      quizshowKeys.template(detail.id, true),
    );
    expect(cached?.template.card.title.en).toBe("New template");
    expect(cached?.template.status).toBe("draft");
    expect(cached?.isAdultsEvent).toBe(true);
    expect(cached?.quiz.rounds).toEqual([]);
  });

  it("patches the row on publish and refreshes the host cards", async () => {
    const templateId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    demoUnpublishTemplate(templateId);
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(
      quizshowKeys.templateRows(true),
      demoListTemplates(),
    );
    expect(
      cachedRows(queryClient).find((row) => row.id === templateId),
    ).toEqual(expect.objectContaining({ status: "draft", publishedAt: null }));
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => usePublishQuizshowTemplate(), {
      wrapper,
    });

    const detail = await result.current.mutateAsync(templateId);

    const patchedRow = cachedRows(queryClient).find(
      (row) => row.id === templateId,
    );
    expect(patchedRow?.status).toBe("published");
    expect(patchedRow?.publishedAt).toBe(detail.publishedAt);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: quizshowKeys.templateCards(true),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: quizshowKeys.templateRows(true),
    });
    expect(
      queryClient.getQueryData(quizshowKeys.template(templateId, true)),
    ).toEqual(quizResponseOfTemplate(detail));
  });

  it("drops a deleted template from the list at once and removes its builder cache", async () => {
    const templateId = QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema;
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(
      quizshowKeys.templateRows(true),
      demoListTemplates(),
    );
    queryClient.setQueryData(
      quizshowKeys.template(templateId, true),
      quizResponseOfTemplate(demoGetTemplate(templateId)),
    );
    const { result } = renderHook(() => useDeleteQuizshowTemplate(), {
      wrapper,
    });

    await result.current.mutateAsync(templateId);

    const rowIds = cachedRows(queryClient).map((row) => row.id);
    expect(rowIds).toHaveLength(5);
    expect(rowIds).not.toContain(templateId);
    expect(isCached(queryClient, quizshowKeys.template(templateId, true))).toBe(
      false,
    );
  });
});
