import { describe, expect, it } from "vitest";
import {
  localizedResultToSearchItem,
  resultToSearchItem,
} from "./search.adapters";
import type { SearchResultDTO } from "./search.api";

const describeTopicPosts = (totalPosts: number) =>
  `${totalPosts} publicações · com curadoria`;

const topicHit: SearchResultDTO = {
  type: "topic",
  slug: "pride",
  name: "#pride",
  sub: "347 posts",
  postCount: 347,
};

describe("localizedResultToSearchItem (PRD-327)", () => {
  it("phrases a topic hit's subline from its post count", () => {
    const item = localizedResultToSearchItem(describeTopicPosts)(topicHit);

    expect(item.sub).toBe("347 publicações · com curadoria");
    expect(item.kw).toContain("publicações");
  });

  it("keeps the server sub for a topic hit from an older response", () => {
    const { postCount: _postCount, ...olderHit } = topicHit;

    const item = localizedResultToSearchItem(describeTopicPosts)(olderHit);

    expect(item.sub).toBe("347 posts");
  });

  it("maps every other result type as resultToSearchItem does", () => {
    const memberHit: SearchResultDTO = {
      type: "member",
      slug: "ada",
      name: "Ada Lovelace",
      sub: "engineer · Lisbon",
      avatarUrl: "https://example.test/ada.jpg",
    };

    expect(localizedResultToSearchItem(describeTopicPosts)(memberHit)).toEqual(
      resultToSearchItem(memberHit),
    );
  });
});
