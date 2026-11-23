import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { resetCommunityBadgesDemo } from "./badges/communityBadgesDemoStore";
import type { Reply, Thread } from "./communityDetails";
import { CommunityThreadHead } from "./CommunityThreadHead";
import { CommunityThreadReplyRow } from "./CommunityThreadReplyRow";

const COMMUNITY_SLUG = "queer-runners";

const threadByMonica: Thread = {
  votes: 3,
  title: "Sunday long run",
  author: { initials: "MO", name: "Monica", tint: "plum", slug: "monica" },
  time: "2h ago",
  replyCount: 1,
  post: "Who is in for the long run?",
  replies: [],
};

const replyBySofia: Reply = {
  initials: "SO",
  name: "Sofia",
  tint: "jade",
  text: "Count me in",
  id: "reply-1",
  authorSlug: "sofia",
};

const replyByYou: Reply = {
  initials: "YO",
  name: "You",
  tint: "coral",
  text: "See you there",
  id: "reply-2",
};

const noop = () => {};

beforeEach(() => {
  resetCommunityBadgesDemo();
});

async function renderHead(data: Thread) {
  render(
    <TestProviders>
      <MotionProvider>
        <CommunityThreadHead
          data={data}
          communitySlug={COMMUNITY_SLUG}
          isOpen={false}
          onToggleOpen={noop}
          voted={false}
          onToggleVote={noop}
          opDeleted={false}
          opEditedAt={null}
          opPinned={false}
          opCanEdit={false}
          opCanDelete={false}
          opCanRestore={false}
          opCanViewHistory={false}
          opCanPin={false}
          opCanReport={false}
          onEditOp={noop}
          onDeleteOp={noop}
          onRestoreOp={noop}
          onHistoryOp={noop}
          onTogglePinOp={noop}
          onReportOp={noop}
        />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("communities", "forum");
}

async function renderReplyRow(reply: Reply, onStartEdit = noop) {
  render(
    <TestProviders>
      <MotionProvider>
        <CommunityThreadReplyRow
          reply={reply}
          communitySlug={COMMUNITY_SLUG}
          demoMode
          isEditing={false}
          isSavingEdit={false}
          canReport={false}
          onStartEdit={onStartEdit}
          onCancelEdit={noop}
          onSaveEdit={noop}
          onDelete={noop}
          onRestore={noop}
          onHistory={noop}
          onReport={noop}
        />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("communities", "forum");
}

describe("community thread name lines", () => {
  it("shows the thread author's worn badge in the meta row", async () => {
    await renderHead(threadByMonica);

    expect(screen.getByText("Monica")).toBeInTheDocument();
    expect(screen.getByText("Old friend")).toBeInTheDocument();
  });

  it("shows a thread reply author's badge", async () => {
    await renderReplyRow(replyBySofia);

    expect(screen.getByText("Sofia")).toBeInTheDocument();
    expect(screen.getByText("In the conversation")).toBeInTheDocument();
  });

  it("keeps the reply row's actions after the move", async () => {
    const onStartEdit = vi.fn();
    await renderReplyRow(replyByYou, onStartEdit);

    await userEvent.click(screen.getByRole("button", { name: "Post actions" }));
    const menu = screen.getByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Edit" }));

    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });
});
