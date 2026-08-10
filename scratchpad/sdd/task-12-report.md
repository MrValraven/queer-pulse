# Task 12 review — mutation hooks (dual-mode)

**Files:** `api/usePieceMutations.ts`, `api/usePitchMutations.ts`

**Spec compliance: ✅ with one Important gap**

Shapes match: `usePieceMutations()` → `{ commission, updatePiece, moveStage, assign, remove }`; `usePitchMutations()` → `{ triage, createPitch }`. Every mutation branches `if (demoMode)` first with no network call + `showToast`, then live calls the matching `pieces.api.ts` function. No `any`. Files at 108/67 lines, both under 200.

## Invalidation keys

`usePieceMutations.ts:27-33` (`invalidateDesk`) hits `["magazine-pieces"]` + `["magazine-desk-summary"]` + `["magazine-piece", id]` (when an id is given) on every one of commission/updatePiece/moveStage/assign/remove. `usePitchMutations.ts` triage hits pitches + pieces + desk-summary (correct: triaging as `commission` creates a piece); createPitch hits only pitches (correct: creating a pitch doesn't touch pieces or the summary). Key strings match exactly what `usePieces`/`usePitches`/`useDeskSummary` (Task 11) and presumably a future single-piece query use.

## Important — `usePieceMutations().commission` can silently leave the pitch inbox stale

`CreatePieceDto` (`pieces.api.ts:142-156`) has an optional `pitchId`. I checked the backend (`queerpulse-backend/src/magazine/magazine-piece.service.ts:160-162`):

```
if (dto.pitchId) {
  const pitch = await this.loadPitchOr404(dto.pitchId);
  pitch.status = 'commissioned';
```

So calling `commission.mutate({ ..., pitchId })` through `usePieceMutations` (as opposed to going through `usePitchMutations().triage` with `verdict: "commission"`) flips the source pitch's status server-side, but `commission`'s `onSuccess` only calls `invalidateDesk()` — i.e. `magazine-pieces` + `magazine-desk-summary` — never `magazine-pitches` (`usePieceMutations.ts:45`). If any future UI ever commissions directly from a pitch through this hook instead of through `usePitchMutations().triage`, the pitch inbox will keep showing that pitch as pending until something else happens to refetch it.

Whether this actually fires depends on which hook the not-yet-built commission UI (Task 19: pitch inbox) ends up calling for the "commission from pitch" action — if it always goes through `usePitchMutations().triage`, this is dormant. Given the DTO explicitly supports `pitchId` on `usePieceMutations.commission`, I'd add `void queryClient.invalidateQueries({ queryKey: ["magazine-pitches"] })` to `invalidateDesk` (or conditionally when `pitchId` is present) as a defensive fix, rather than rely on every future caller remembering to use the other hook.

## Minor

- `usePitchMutations.ts:32-36` — `triage`'s `TData` generic is `PitchDto | { id: string } | undefined`. It typechecks (structurally: `PieceRecordDto` — the actual live return type via `triagePitch`'s `PitchDto | PieceRecordDto` — satisfies `{ id: string }`, and nothing in the function ever returns `undefined`), but the `| undefined` member is dead: no code path returns it. A consumer that pattern-matches on `undefined` defensively would be handling a case that can't occur. Low-risk, but tighten to `PitchDto | { id: string }` for accuracy.
- Live-mode mutations never call `showToast` on success — only the demo branch does (`usePieceMutations.ts` all five mutations; `usePitchMutations.ts` both). This matches the plan's literal wording ("Demo mode = ... + showToast; live mode calls the api and invalidates"), and the global `mutationCache` (`shared/api/queryClient.ts:28`) only wires an `onError` handler, not `onSuccess`. So as written, a real user in live mode gets zero success feedback for commission/save/move/assign/delete/triage/create-pitch — only failures toast. This is spec-compliant, not a deviation, but worth flagging since it's a real UX asymmetry between demo and live that a later task (or a follow-up) should probably close, e.g. by adding `showToast` to the live branches too, mirroring the demo branches. Not marking this Critical/Important since the task file explicitly scopes toast to the demo path.

## Not applicable / no findings

- `assign`'s optional `editorId`/`writerId` pass straight through as `Partial<CreatePieceDto>` fields on `sendUpdatePiece` — types line up.
- `remove`'s `onSuccess` invalidates `["magazine-piece", id]` for a piece that no longer exists server-side; harmless (react-query will just get a 404 on next mount, if any component still holds that query — no such consumer exists yet).
- No `.tsx` under `src/features/magazine` calls either hook yet (Tasks 13–22, the desk UI, aren't built) — nothing to check at the integration/consumer level.
