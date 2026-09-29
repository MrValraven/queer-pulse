import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { routes } from "../../../app/routeMap";
import {
  DEMO_EDITORS,
  DEMO_PIECES,
  type Issue,
  type IssueSummary,
  type Piece,
} from "../../../features/magazine/data/desk.data";
import type { usePieceMutations } from "../../../features/magazine/api/usePieceMutations";
import type { DeskTrack } from "../../../features/magazine/desk/deskTrack";
import { useDeskEntryParams } from "../../../features/magazine/desk/useDeskEntryParams";
import { useDeskIssueSelection } from "../../../features/magazine/desk/useDeskIssueSelection";
import { useDeskWriteAction } from "../../../features/magazine/desk/useDeskWriteAction";
import { MagazineSidebar } from "./MagazineSidebar";
import { magazineWriteHref } from "./magazineWriteHref";

/**
 * The shell's Write and the desk meet only through the URL: the rail links to
 * `?write=new` and the desk's entry hook starts the draft in whatever scope
 * the URL then holds. This harness runs the desk's real scope, write and
 * entry hooks under the real rail, with the draft mutation mocked, so the
 * test sees which issue a rail Write files onto.
 */

function makeIssueSummary(id: string, number: string): IssueSummary {
  return {
    id,
    number,
    title: `Issue ${number}`,
    theme: `Theme ${number}`,
    publishedOn: null,
    closesOn: null,
    filled: 0,
    slots: 15,
  };
}

/** Newest first, the order the switcher gets them. 12 is the current issue. */
const ISSUES: IssueSummary[] = [
  makeIssueSummary("issue-12", "12"),
  makeIssueSummary("issue-11", "11"),
];

const CURRENT_ISSUE: Issue = {
  id: "issue-12",
  number: "12",
  theme: "Theme 12",
  closes: "",
  publishes: "",
  daysLeft: 0,
  filled: 0,
  slots: 15,
};

function DeskWriteHarness({ startDraft }: { startDraft: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { deskIssue } = useDeskIssueSelection({
    issues: ISSUES,
    currentIssue: CURRENT_ISSUE,
    searchParams,
    setSearchParams,
  });
  const track: DeskTrack =
    searchParams.get("track") === "issue" ? "issue" : "everything";
  const pieceMutations = {
    startDraft: { mutate: startDraft, isPending: false },
  } as unknown as ReturnType<typeof usePieceMutations>;
  const { startWriting } = useDeskWriteAction({
    activeMe: "marta",
    editors: DEMO_EDITORS,
    sections: [{ name: "Essays" }],
    areSectionsLoading: false,
    hasSectionsError: false,
    issue: deskIssue,
    track,
    pieceMutations,
    showToast: () => undefined,
    translate: (key) => key,
  });
  useDeskEntryParams({
    searchParams,
    setSearchParams,
    onWrite: startWriting,
    isWriteReady: true,
    onCommission: () => undefined,
  });
  return null;
}

describe("the rail's Write on the desk", () => {
  it("files the draft onto the issue the desk is showing", async () => {
    const startDraft = vi.fn();
    render(
      <TestProviders
        initialEntries={[`${routes.magazineEditor}?issue=11&track=issue`]}
      >
        <MagazineSidebar pieces={[]} me="marta" />
        <DeskWriteHarness startDraft={startDraft} />
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Write" }));

    await waitFor(() => expect(startDraft).toHaveBeenCalledTimes(1));
    expect(startDraft).toHaveBeenCalledWith(
      expect.objectContaining({ issueId: "issue-11" }),
      expect.anything(),
    );
  });

  it("links to the desk's current search plus the write flag", () => {
    render(
      <TestProviders
        initialEntries={[
          `${routes.magazineEditor}?issue=11&track=issue&focus=late`,
        ]}
      >
        <MagazineSidebar pieces={[]} me="marta" />
      </TestProviders>,
    );

    const href = screen
      .getByRole("link", { name: "Write" })
      .getAttribute("href");
    const params = new URLSearchParams(href?.split("?")[1] ?? "");
    expect(params.get("issue")).toBe("11");
    expect(params.get("track")).toBe("issue");
    expect(params.get("focus")).toBe("late");
    expect(params.get("write")).toBe("new");
  });
});

describe("the rail's waiting-on-you pill", () => {
  it("links to the Everything scope with Your turn on, named by its count", () => {
    const waitingPiece: Piece = {
      ...(DEMO_PIECES[0] as Piece),
      id: "waiting-on-marta",
      stage: "Edit",
      wait: "you",
      editorId: "marta",
    };
    render(
      <TestProviders initialEntries={[routes.magazineEditor]}>
        <MagazineSidebar pieces={[waitingPiece]} me="marta" />
      </TestProviders>,
    );

    const pill = screen.getByRole("link", { name: "1 waiting on you" });
    const params = new URLSearchParams(
      pill.getAttribute("href")?.split("?")[1] ?? "",
    );
    expect(params.get("track")).toBe("everything");
    expect(params.get("focus")).toBe("your-turn");
  });
});

describe("magazineWriteHref", () => {
  it("opens the desk on its default scope from any other page", () => {
    expect(
      magazineWriteHref({
        pathname: "/magazine/issue/11",
        search: "?tab=plan",
      }),
    ).toBe(`${routes.magazineEditor}?write=new`);
  });

  it("keeps one write flag when the desk URL already carries one", () => {
    const href = magazineWriteHref({
      pathname: routes.magazineEditor,
      search: "?issue=11&write=new",
    });
    const params = new URLSearchParams(href.split("?")[1] ?? "");
    expect(params.getAll("write")).toEqual(["new"]);
    expect(params.get("issue")).toBe("11");
  });
});
