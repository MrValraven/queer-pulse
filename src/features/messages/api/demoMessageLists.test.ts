import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  patchMessageDelete,
  patchMessagePinned,
  patchMessageStarred,
} from "../../../shared/api/messageCache";
import { conversations } from "../data";
import {
  buildDemoStarredMessages,
  demoPinnedMessages,
  readDemoStarredMessages,
} from "./demoMessageLists";
import { ensureDemoThreadStore, readDemoThread } from "./demoThreadCache";

function snapshotAll(queryClient: QueryClient) {
  return conversations.map((conversation) => ({
    conversation,
    newestFirst: readDemoThread(queryClient, conversation.id),
  }));
}

const aMinuteFromNow = () => new Date(Date.now() + 60_000).toISOString();

describe("demoPinnedMessages", () => {
  it("lists the seeded pin of a demo group", () => {
    const pins = demoPinnedMessages(
      readDemoThread(new QueryClient(), "brunch-crew"),
    );
    expect(pins.map((message) => message.id)).toEqual(["demo-msg-brunch-015"]);
  });

  it("puts a pin made this session first and drops a deleted pin", () => {
    const queryClient = new QueryClient();
    ensureDemoThreadStore(queryClient, "brunch-crew");
    patchMessagePinned(
      queryClient,
      "brunch-crew",
      "demo-msg-brunch-003",
      aMinuteFromNow(),
    );
    expect(
      demoPinnedMessages(readDemoThread(queryClient, "brunch-crew")).map(
        (message) => message.id,
      ),
    ).toEqual(["demo-msg-brunch-003", "demo-msg-brunch-015"]);

    patchMessageDelete(
      queryClient,
      "brunch-crew",
      "demo-msg-brunch-015",
      new Date().toISOString(),
    );
    expect(
      demoPinnedMessages(readDemoThread(queryClient, "brunch-crew")).map(
        (message) => message.id,
      ),
    ).toEqual(["demo-msg-brunch-003"]);
  });
});

describe("demo starred messages", () => {
  it("lists the seeded star shaped like the server's hit", () => {
    const response = readDemoStarredMessages(new QueryClient());
    expect(response.items.map((item) => item.id)).toEqual([
      "demo-msg-anika-001",
    ]);
    const [hit] = response.items;
    expect(hit).toMatchObject({
      conversationId: "anika",
      kind: "user",
      attachment: null,
      starredAt: hit!.createdAt,
    });
    expect(hit!.snippet.length).toBeLessThanOrEqual(160);
    expect(response.conversations).toHaveLength(1);
    const [group] = response.conversations;
    expect(group).toMatchObject({
      conversationId: "anika",
      isOfficial: false,
      kind: "direct",
      title: null,
      avatarUrl: null,
    });
    expect(group!.otherParticipant?.handle).toBe("anika");
    expect(group!.otherParticipant?.displayName).toBe("Anika Kovač");
  });

  it("files a group star under the group and orders newest star first", () => {
    const queryClient = new QueryClient();
    ensureDemoThreadStore(queryClient, "brunch-crew");
    patchMessageStarred(
      queryClient,
      "brunch-crew",
      "demo-msg-brunch-003",
      true,
    );

    const response = buildDemoStarredMessages(
      snapshotAll(queryClient),
      new Map([["demo-msg-brunch-003", aMinuteFromNow()]]),
    );
    expect(response.items.map((item) => item.id)).toEqual([
      "demo-msg-brunch-003",
      "demo-msg-anika-001",
    ]);
    expect(
      response.conversations.find(
        (group) => group.conversationId === "brunch-crew",
      ),
    ).toEqual({
      conversationId: "brunch-crew",
      otherParticipant: null,
      isOfficial: false,
      kind: "group",
      title: "Pride Brunch Crew",
      avatarUrl: null,
    });
  });

  it("drops a star once its message is deleted or unstarred", () => {
    const queryClient = new QueryClient();
    ensureDemoThreadStore(queryClient, "anika");
    patchMessageStarred(queryClient, "anika", "demo-msg-anika-001", false);
    expect(
      buildDemoStarredMessages(snapshotAll(queryClient), new Map()).items,
    ).toEqual([]);

    patchMessageStarred(queryClient, "anika", "demo-msg-anika-001", true);
    patchMessageDelete(
      queryClient,
      "anika",
      "demo-msg-anika-001",
      new Date().toISOString(),
    );
    const response = buildDemoStarredMessages(
      snapshotAll(queryClient),
      new Map(),
    );
    expect(response.items).toEqual([]);
    expect(response.conversations).toEqual([]);
  });
});
