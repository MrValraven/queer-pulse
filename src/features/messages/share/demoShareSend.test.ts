import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import type { Conversation } from "../data";
import { fetchDemoThreadPage, readDemoThread } from "../api/demoThreadCache";
import type { ConversationWithPreview } from "../api/messages.adapters";
import type { MessagePage } from "../api/threadCacheTrim";
import {
  landDemoShare,
  resetLandedDemoShares,
  withLandedDemoShares,
} from "./demoShareSend";

beforeEach(() => resetLandedDemoShares());

const BODY =
  "ouve isto\nhttps://queerpulse.com/studio/track?id=demo-track-cidade-dos-santos-06";

describe("landDemoShare", () => {
  it("lands in a demo thread that was never opened", () => {
    const queryClient = new QueryClient();
    landDemoShare(
      queryClient,
      "priya",
      BODY,
      "client-1",
      "2030-01-01T10:00:00.000Z",
    );
    const newest = readDemoThread(queryClient, "priya")[0];
    expect(newest?.body).toBe(BODY);
    expect(newest?.clientMessageId).toBe("client-1");
    expect(newest?.canDelete).toBe(true);
  });

  it("lands in the rendered thread pages too", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<InfiniteData<MessagePage>>(
      ["messages", "priya", true],
      { pages: [{ items: [], nextCursor: null }], pageParams: [null] },
    );
    landDemoShare(
      queryClient,
      "priya",
      BODY,
      "client-2",
      "2030-01-01T10:00:00.000Z",
    );
    const rendered = queryClient.getQueryData<InfiniteData<MessagePage>>([
      "messages",
      "priya",
      true,
    ]);
    expect(rendered?.pages[0]?.items.map((item) => item.body)).toContain(BODY);
  });

  it("moves the inbox row to the top with the new preview", () => {
    const queryClient = new QueryClient();
    const rows = [
      { id: "jordan", preview: "See you" },
      { id: "priya", preview: "Sounds perfect, see you at 7!" },
    ] as Conversation[];
    queryClient.setQueryData(["conversations", true, "", "personal"], rows);
    landDemoShare(
      queryClient,
      "priya",
      "Look at this",
      "client-3",
      "2030-01-01T10:00:00.000Z",
    );
    const updated = queryClient.getQueryData<Conversation[]>([
      "conversations",
      true,
      "",
      "personal",
    ]);
    expect(updated?.[0]?.id).toBe("priya");
    expect(updated?.[0]?.preview).toBe("Look at this");
  });

  it("keeps one copy of the share when the thread refetches", async () => {
    const queryClient = new QueryClient();
    const renderedKey = ["messages", "priya", true];
    queryClient.setQueryData<InfiniteData<MessagePage>>(renderedKey, {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [null],
    });
    landDemoShare(
      queryClient,
      "priya",
      BODY,
      "client-4",
      "2030-01-01T10:00:00.000Z",
    );
    const refetchedPage = await fetchDemoThreadPage(
      queryClient,
      "priya",
      undefined,
    );
    queryClient.setQueryData<InfiniteData<MessagePage>>(renderedKey, {
      pages: [refetchedPage],
      pageParams: [undefined],
    });
    const rendered =
      queryClient.getQueryData<InfiniteData<MessagePage>>(renderedKey);
    const copies = (rendered?.pages ?? [])
      .flatMap((page) => page.items)
      .filter((item) => item.clientMessageId === "client-4");
    expect(copies).toHaveLength(1);
  });
});

describe("withLandedDemoShares", () => {
  const seededRows = () =>
    [
      { id: "jordan", preview: "See you" },
      { id: "noah", preview: "Are you still up for the volunteering shift?" },
      { id: "priya", preview: "Sounds perfect, see you at 7!" },
    ] as ConversationWithPreview[];

  it("puts the newest landed share on top of rows rebuilt from the seed", () => {
    const queryClient = new QueryClient();
    landDemoShare(
      queryClient,
      "priya",
      "Look at this",
      "client-5",
      "2030-01-01T10:00:00.000Z",
    );
    landDemoShare(
      queryClient,
      "noah",
      "And this one",
      "client-6",
      "2030-01-01T10:05:00.000Z",
    );
    const rows = withLandedDemoShares(seededRows());
    expect(rows.map((row) => row.id)).toEqual(["noah", "priya", "jordan"]);
    expect(rows[0]?.preview).toBe("And this one");
    expect(rows[1]?.preview).toBe("Look at this");
    expect(rows[1]?.updatedAt).toBe("2030-01-01T10:00:00.000Z");
  });

  it("leaves the rows as they are when nothing was shared", () => {
    const rows = seededRows();
    expect(withLandedDemoShares(rows)).toEqual(rows);
  });
});
