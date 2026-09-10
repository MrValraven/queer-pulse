import { beforeAll, describe, expect, it } from "vitest";
import {
  cardDtoToCommunity,
  draftToCreateDto,
  draftToUpdateDto,
  dtoToEditable,
  editableToDraft,
  postDtoToPost,
  postToThread,
  pulseEventToCommunityEvent,
} from "./communities.adapters";
import { catalogs, loadNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import type { Catalog, TFunction } from "../../../shared/i18n/types";
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
    // The wizard picks tags on chapter 1 (`StepWhy`), so the create payload
    // has to carry them: omitting them founded every community with an empty
    // tag list, and the founder's picks were silently dropped on save.
    expect(created.tags).toEqual(["sports-fitness"]);
  });
});

/**
 * The Events-tab row a community shows, on both lanes that build it.
 *
 * Both lanes now keep a gathering that is UNDERWAY, so an overnight party at
 * 23:00 and a festival on its second day reach this row. The `dd`/`mm` pill
 * states the OPENING day, which is honest but incomplete on its own, so the
 * meta line reads the whole run through `gatheringWhen`.
 */
describe("pulseEventToCommunityEvent", () => {
  // The real `gatherings` catalog, so a key that goes missing fails here too.
  let gatheringsCatalog: Catalog = catalogs.en.gatherings;
  beforeAll(async () => {
    gatheringsCatalog = await loadNamespace("en", "gatherings");
  });
  const t: TFunction = (key, options) => {
    const [, path] = key.split(":");
    const value = gatheringsCatalog[path ?? ""] ?? key;
    return Object.entries(options ?? {}).reduce(
      (accumulated, [token, replacement]) =>
        accumulated.replace(`{${token}}`, String(replacement)),
      value,
    );
  };
  const fmt = createFormatters("en-GB");

  // Neither lane's DTO carries a timezone, so the row reads on the reader's
  // clock and the suite runs on whatever zone the machine is set to. The
  // assertions below therefore pin the SHAPE of each line (a weekday, or a
  // dated range) rather than one machine's rendering of it.
  const START_AT = "2026-09-29T16:00:00.000Z";

  /** A gathering as either lane hands it to the adapter. */
  type GatheringInput = Parameters<typeof pulseEventToCommunityEvent>[0];
  const gathering = (
    overrides: Partial<GatheringInput> = {},
  ): GatheringInput => ({
    slug: "autumn-social",
    title: "Autumn social",
    startAt: START_AT,
    venue: "Casa do Pontal",
    isOnline: false,
    goingCount: 4,
    ...overrides,
  });

  const rowFor = (overrides: Partial<GatheringInput> = {}) =>
    pulseEventToCommunityEvent(
      gathering(overrides),
      fmt,
      t,
      "4 going",
      "Online",
    );

  it("prints the weekday and the venue for a gathering inside one day", () => {
    const weekday = fmt.date(new Date(START_AT), { weekday: "long" });
    expect(rowFor({ endAt: "2026-09-29T20:00:00.000Z" }).meta).toBe(
      `${weekday} · Casa do Pontal`,
    );
  });

  it("prints the whole run for a gathering that spans several days", () => {
    // A weekday range would not say which week, so a span falls back to dates.
    expect(rowFor({ endAt: "2026-10-02T14:00:00.000Z" }).meta).toMatch(
      /^\d{1,2} \w+ to \d{1,2} \w+ · Casa do Pontal$/,
    );
  });

  it("keeps the date pill on the gathering's opening day", () => {
    const row = rowFor({ endAt: "2026-10-02T14:00:00.000Z" });
    expect(row.dd).toBe(fmt.date(new Date(START_AT), { day: "numeric" }));
    expect(row.mm).toBe(fmt.date(new Date(START_AT), { month: "short" }));
  });

  it("carries the end instant onto the row", () => {
    const row = rowFor({ endAt: "2026-10-02T14:00:00.000Z" });
    expect(row.endAt?.toISOString()).toBe("2026-10-02T14:00:00.000Z");
  });

  it("reads exactly as it always did when the lane sends no end", () => {
    const weekday = fmt.date(new Date(START_AT), { weekday: "long" });
    const row = rowFor();
    expect(row.meta).toBe(`${weekday} · Casa do Pontal`);
    expect(row.endAt).toBeNull();
  });

  it("names an online gathering with no venue by the online label", () => {
    const weekday = fmt.date(new Date(START_AT), { weekday: "long" });
    expect(rowFor({ venue: null, isOnline: true }).meta).toBe(
      `${weekday} · Online`,
    );
  });
});
