import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { resetCommunityBadgesDemo } from "./badges/communityBadgesDemoStore";
import type { Post } from "./community.model";
import { roleLookup } from "./communityPeople";
import { getLiving } from "./livingCommunities.data";
import { PulsePost } from "./PulsePost";

const mocks = vi.hoisted(() => ({
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      const overrideMode = mocks.demoOverride.demoMode;
      return overrideMode === null
        ? value
        : { ...value, demoMode: overrideMode };
    },
  };
});

const COMMUNITY_SLUG = "queer-runners";

beforeEach(() => {
  resetCommunityBadgesDemo();
  mocks.demoOverride.demoMode = null;
});

afterEach(() => {
  mocks.demoOverride.demoMode = null;
});

function demoPost(postId: string): Post {
  const living = getLiving(COMMUNITY_SLUG);
  const post = [...(living?.pinned ?? []), ...(living?.pulse ?? [])].find(
    (candidate) => candidate.id === postId,
  );
  if (!post) throw new Error(`Missing demo post ${postId}`);
  return post;
}

async function renderPost(post: Post) {
  const view = render(
    <TestProviders>
      <MotionProvider>
        <PulsePost
          post={post}
          roleOf={roleLookup(getLiving(COMMUNITY_SLUG)?.roster ?? [])}
          isMember
          viewer={null}
        />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("communities");
  return view;
}

function getPostHeader(): HTMLElement {
  const header = document.querySelector("header");
  if (!header) throw new Error("The post has no header");
  return header;
}

describe("PulsePost name lines", () => {
  it("shows the author's worn badge after the role pill", async () => {
    await renderPost(demoPost("run-p1"));

    const header = getPostHeader();
    const rolePill = within(header).getByText("Owner");
    const chip = within(header).getByText("Old friend");
    expect(
      rolePill.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows a reply author's worn badge", async () => {
    await renderPost(demoPost("run-p2"));

    // The reply by carla wears "Regular"; the post author (sofia) wears a
    // different badge, so this chip can only be the reply's.
    expect(screen.getByText("Regular")).toBeInTheDocument();
    expect(screen.getByText("In the conversation")).toBeInTheDocument();
  });

  it("rings the author's avatar", async () => {
    await renderPost(demoPost("run-p1"));

    // The avatar is the header's first child, wrapped by the ring.
    const avatarSlot = getPostHeader().firstElementChild;
    expect(avatarSlot?.className).toMatch(/ringPlum/);
  });

  it("shows nothing beside an author who wears nothing", async () => {
    await renderPost(demoPost("run-p4"));

    expect(screen.queryByText("Regular")).toBeNull();
    expect(screen.queryByText("Old friend")).toBeNull();
    expect(screen.queryByText("In the conversation")).toBeNull();
    expect(screen.queryByText("Helping hands")).toBeNull();
  });

  it("shows the live author's badge from the post", async () => {
    mocks.demoOverride.demoMode = false;
    const livePost: Post = {
      ...demoPost("run-p4"),
      author: {
        ...demoPost("run-p4").author,
        flair: {
          name: "Night owls",
          starterKey: null,
          iconKey: "award",
          tint: "violet",
        },
        hasRecentGift: false,
      },
    };
    await renderPost(livePost);

    expect(screen.getByText("Night owls")).toBeInTheDocument();
  });
});
