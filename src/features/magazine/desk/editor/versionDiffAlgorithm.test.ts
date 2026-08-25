import { describe, expect, it } from "vitest";
import type { ArticleBlock } from "../../api/pieces.api";
import { computeVersionDiff } from "./versionDiffAlgorithm";

function paragraph(id: string, html: string): ArticleBlock {
  return { id, kind: "paragraph", html };
}

describe("computeVersionDiff", () => {
  it("marks a block unchanged when its text is identical", () => {
    const current = [paragraph("b1", "Same text.")];
    const version = [paragraph("b1", "Same text.")];
    expect(computeVersionDiff(current, version)).toEqual([
      {
        key: "b1",
        status: "unchanged",
        currentText: "Same text.",
        versionText: "Same text.",
      },
    ]);
  });

  it("marks a block changed when its text differs, matched by id", () => {
    const current = [paragraph("b1", "New wording.")];
    const version = [paragraph("b1", "Old wording.")];
    const rows = computeVersionDiff(current, version);
    expect(rows).toEqual([
      {
        key: "b1",
        status: "changed",
        currentText: "New wording.",
        versionText: "Old wording.",
      },
    ]);
  });

  it("marks a block only in current as added", () => {
    const current = [paragraph("b1", "Kept."), paragraph("b2", "New block.")];
    const version = [paragraph("b1", "Kept.")];
    const rows = computeVersionDiff(current, version);
    expect(rows).toEqual([
      {
        key: "b1",
        status: "unchanged",
        currentText: "Kept.",
        versionText: "Kept.",
      },
      {
        key: "b2",
        status: "added",
        currentText: "New block.",
        versionText: null,
      },
    ]);
  });

  it("marks a block only in the version as removed, appended after current rows", () => {
    const current = [paragraph("b1", "Kept.")];
    const version = [paragraph("b1", "Kept."), paragraph("b2", "Cut later.")];
    const rows = computeVersionDiff(current, version);
    expect(rows).toEqual([
      {
        key: "b1",
        status: "unchanged",
        currentText: "Kept.",
        versionText: "Kept.",
      },
      {
        key: "b2",
        status: "removed",
        currentText: null,
        versionText: "Cut later.",
      },
    ]);
  });

  it("falls back to positional matching when both sides lack an id", () => {
    const current: ArticleBlock[] = [
      { id: "", kind: "paragraph", html: "Now." },
    ];
    const version: ArticleBlock[] = [
      { id: "", kind: "paragraph", html: "Then." },
    ];
    const rows = computeVersionDiff(current, version);
    expect(rows).toEqual([
      {
        key: "__index_0",
        status: "changed",
        currentText: "Now.",
        versionText: "Then.",
      },
    ]);
  });

  it("returns an empty diff for two empty block lists", () => {
    expect(computeVersionDiff([], [])).toEqual([]);
  });
});
