# Task 11 review — read hooks (dual-mode)

**Files:** `api/pieces.adapters.ts`, `api/usePieces.ts`, `api/usePitches.ts`, `api/useDeskSummary.ts`

**Spec compliance: ✅**

All three hooks mirror `useEditorDecks.ts`: `useQuery` keyed `[name, demoMode, ...args]`, demo branch returns mock, live branch calls the api + adapts. Static import from `desk.data.ts` is correct per the spec's own carve-out (small typed data, no need for the dynamic-import trick `useEditorDecks` uses for the heavier mock registry). All files well under 200 lines (58/63/27/53). No `any`.

## PieceFilters.stage type question — verdict: not a real issue

`usePieces.ts:17` declares `stage?: PieceStage`, importing `PieceStage` directly from `./pieces.api`. `pieces.api.ts:134` declares `ListPiecesFilters.stage?: PieceStage` — the exact same type alias, same module. `PieceFilters` is field-for-field identical to `ListPiecesFilters` (format/editor/stage/section/issue/q/savedView, all importing the same `PieceFormat`/`PieceStage`/`SavedViewId` aliases), and the docstring at `usePieces.ts:10-13` says this is deliberate so the object can be passed straight through to `getPieces`. There is no looseness — tsc being clean here is correct, not a fluke. Whoever raised the "contradiction" misread two independently-declared-but-identical types as a mismatch.

## Stage map completeness — verified exhaustive by the type system, not just by eye

`STAGE_DTO_TO_VIEW: Record<PieceListItemDto["stage"], Stage>` (`pieces.adapters.ts:12`) — `Record<PieceStage, Stage>` forces TS to require every `PieceStage` key at the literal's declaration site, so omitting one would be a compile error, not just a runtime gap. All 7 present and correctly mapped: commissioned→Commissioned, drafting→Drafting, in_review→"In review", edit→Edit, sensitivity_read→"Sensitivity read", layout→Layout, ready→Ready. Same guarantee applies to the inverse map `STAGE_VIEW_TO_DTO` in `useDeskSummary.ts:8`.

## Findings

**Critical:** none.

**Important:** none.

**Minor:**
- `pieces.adapters.ts:41` — `art: "na"` is a hardcoded stub with an honest `// TODO Phase 2` comment (backend doesn't model art tracking yet). Correctly flagged, not a bug, just noting it's a known view/data gap for whoever builds Task 17/18 (board move + art columns) against live data.
- `usePieces.ts:38` — the `issue` filter is a documented no-op in demo mode (`Piece` has no `issueId` on the view model). Consistent with the honesty rule (no silent fake filtering), but worth flagging to whoever wires `IssuePlan` (Task 18) that the saved "issue" filter will look like it does nothing while `VITE_DEMO=1`.
- Cross-cutting, not this task's fault: `pieceDtoToView`'s `due` field passes the backend's raw `due: string | null` straight through, whereas demo data uses hand-authored short strings ("4 Aug", "ready"). If the backend ever sends an ISO date, live-mode due-date display will look different from demo. No display-formatting logic lives in these files to check one way or the other — flagging as ⚠️ cannot-verify from this file set (depends on backend response shape / a formatter not yet built).

**Pitch adapter (`pitchDtoToView`, `pieces.adapters.ts:48`):** byline←from, note, tags, fresh copied directly; `suggest: "deck"` only when `suggestFormat === "deck"`, else `undefined` — matches spec and the `Pitch` view type exactly.

**Not yet consumed:** no `.tsx` in `src/features/magazine` currently imports `usePieces`/`usePitches`/`useDeskSummary` — expected, since the desk UI (Tasks 13–22) hasn't been built yet. Nothing to verify at the integration level; this review is hook-internals-only.
