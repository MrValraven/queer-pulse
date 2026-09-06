import { describe, expect, it } from "vitest";
import {
  cardDtoToCommunity,
  draftToCreateDto,
  draftToUpdateDto,
  dtoToEditable,
  editableToDraft,
  postDtoToPost,
  postToThread,
} from "./communities.adapters";
import type { Post } from "../community.model";
import type { CommunityDetailDTO, CommunityPostDTO } from "./communities.api";

// The adapters localize their own copy now, so they take a `t`. The stub
// echoes the key: these assertions are about the post/reply FLAGS, not copy.
const translate = ((key: string) => key) as Parameters<typeof postDtoToPost>[2];

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    author: { initials: "RV", name: "Rita V", tint: "plum" },
    body: "First line is the heading\nSecond line is more body.",
    kind: "post",
    pinned: false,
    reactions: [{ key: "heart", count: 3, reacted: true }],
    replies: [
      {
        id: "reply-1",
        author: { initials: "JD", name: "Jo D", tint: "jade" },
        text: "hi",
        time: "1m",
      },
    ],
    time: "2m",
    createdAt: "2026-07-23T10:00:00Z",
    communitySlug: "lisbon",
    ...overrides,
  };
}

describe("postToThread", () => {
  it("derives the heading from the first body line and maps ids", () => {
    const thread = postToThread(makePost());
    expect(thread.id).toBe("post-1");
    expect(thread.title).toBe("First line is the heading");
    expect(thread.post).toContain("Second line");
    expect(thread.replies[0]?.id).toBe("reply-1");
  });

  it("maps the Heart reaction to the votes/voted upvote state", () => {
    const thread = postToThread(makePost());
    expect(thread.votes).toBe(3);
    expect(thread.voted).toBe(true);
  });

  it("defaults votes to 0 when there is no Heart reaction", () => {
    const thread = postToThread(makePost({ reactions: [] }));
    expect(thread.votes).toBe(0);
    expect(thread.voted).toBe(false);
  });
});

function post(overrides: Partial<CommunityPostDTO> = {}): CommunityPostDTO {
  return {
    id: "post-42",
    author: { slug: "rita", firstName: "Rita", lastName: "V", avatarUrl: null },
    body: "hello world",
    image: null,
    kind: "post",
    pinned: false,
    createdAt: "2026-07-23T10:00:00Z",
    editedAt: null,
    deleted: false,
    canEdit: true,
    canDelete: true,
    canRestore: false,
    canViewHistory: false,
    reactions: [],
    replies: [
      {
        id: "reply-1",
        author: {
          slug: "sam",
          firstName: "Sam",
          lastName: "T",
          avatarUrl: null,
        },
        text: "nice",
        createdAt: "2026-07-23T10:05:00Z",
        editedAt: null,
        deleted: false,
        canEdit: false,
        canDelete: true,
        canRestore: false,
        canViewHistory: false,
      },
    ],
    replyCount: 1,
    ...overrides,
  };
}

describe("communities adapters carry the post/reply flags", () => {
  it("postDtoToPost carries the OP flags + reply flags", () => {
    const mapped = postDtoToPost(post(), "queer-runners", translate);
    expect(mapped.canEdit).toBe(true);
    expect(mapped.replies[0]?.canDelete).toBe(true);
    expect(mapped.replies[0]?.id).toBe("reply-1");
  });

  it("postToThread attaches OP id + flags and maps replies", () => {
    const thread = postToThread(
      postDtoToPost(post({ id: "op-1" }), "queer-runners", translate),
    );
    expect(thread.id).toBe("op-1");
    expect(thread.canDelete).toBe(true);
    expect(thread.replies[0]?.id).toBe("reply-1");
    expect(thread.replies[0]?.canEdit).toBe(false);
  });
});

/**
 * PRD-146: `welcomeMessage` and `avatarImageUrl` were accepted by the backend's
 * create/update DTOs and rendered by the welcome card, but no form set them and
 * the adapter layer dropped them, so neither could ever leave the browser. This
 * pins the whole round trip an owner actually takes: read the detail, edit it,
 * send the patch.
 */
function detail(
  overrides: Partial<CommunityDetailDTO> = {},
): CommunityDetailDTO {
  return {
    slug: "queer-runners",
    name: "Queer Runners",
    type: "sports",
    tagline: "We run slow and talk a lot",
    accessTier: "public",
    ref: "QP-C-0003",
    memberCount: 42,
    activeThisWeek: 7,
    postsThisWeek: 3,
    myRole: "owner",
    coverImageUrl: "https://api.example/files/community-covers/u1/cover.jpg",
    tags: ["sports-fitness"],
    avatarImageUrl: "https://api.example/files/community-avatars/u1/mark.png",
    purpose: "A running group",
    whoFor: "Anyone who runs",
    rosterVisible: true,
    features: ["discussion"],
    rules: ["Be kind"],
    owner: null,
    createdAt: "2026-03-01T09:00:00Z",
    myJoinRequestStatus: null,
    welcomeMessage: "Glad you are here. Read the shared values first.",
    ...overrides,
  };
}

describe("the welcome greeting and the avatar survive the owner's round trip", () => {
  it("dtoToEditable seeds both from the detail DTO", () => {
    const editable = dtoToEditable(detail());
    expect(editable.avatarImageUrl).toBe(
      "https://api.example/files/community-avatars/u1/mark.png",
    );
    expect(editable.welcomeMessage).toBe(
      "Glad you are here. Read the shared values first.",
    );
  });

  it("reads an absent greeting or avatar as an empty field, never undefined", () => {
    const editable = dtoToEditable(
      detail({ avatarImageUrl: null, welcomeMessage: null }),
    );
    expect(editable.avatarImageUrl).toBe("");
    expect(editable.welcomeMessage).toBe("");
  });

  it("editableToDraft then draftToUpdateDto sends both back unchanged", () => {
    const patch = draftToUpdateDto(editableToDraft(dtoToEditable(detail())));
    expect(patch.avatarImageUrl).toBe(
      "https://api.example/files/community-avatars/u1/mark.png",
    );
    expect(patch.welcomeMessage).toBe(
      "Glad you are here. Read the shared values first.",
    );
  });

  it("clears both with an explicit null rather than dropping the field", () => {
    const draft = editableToDraft(
      dtoToEditable(detail({ avatarImageUrl: null, welcomeMessage: null })),
    );
    const patch = draftToUpdateDto(draft);
    expect(patch.avatarImageUrl).toBeNull();
    expect(patch.welcomeMessage).toBeNull();
  });

  it("cardDtoToCommunity carries the mark onto the card view-model", () => {
    // The same defect one layer over: the card DTO carried `avatarImageUrl`
    // and this mapper dropped it, so the mark could reach the detail hero and
    // never a card. `CommunityCardShell` reads exactly this field.
    const community = cardDtoToCommunity(detail(), translate);
    expect(community.avatarImageUrl).toBe(
      "https://api.example/files/community-avatars/u1/mark.png",
    );
  });

  it("reads a community with no mark as null, so a card draws none", () => {
    const community = cardDtoToCommunity(
      detail({ avatarImageUrl: null }),
      translate,
    );
    expect(community.avatarImageUrl).toBeNull();
  });

  it("draftToCreateDto carries what the wizard collected", () => {
    const draft = editableToDraft(dtoToEditable(detail()));
    const created = draftToCreateDto({ ...draft, handle: "queer-runners" });
    expect(created.avatarImageUrl).toBe(
      "https://api.example/files/community-avatars/u1/mark.png",
    );
    expect(created.welcomeMessage).toBe(
      "Glad you are here. Read the shared values first.",
    );
  });
});
