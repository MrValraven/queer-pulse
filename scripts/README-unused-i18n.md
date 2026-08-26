# Unused i18n keys: the runbook

`scripts/report-unused-i18n.mjs` finds catalog keys nothing renders any more.
This is how to run it, how to read it, and what has to be true before anyone
deletes anything on its say-so.

It sits beside the script rather than in `docs/i18n/` on purpose: `.gitignore`
ignores `docs`, so only `STYLE-RULES.md` and `design-system.md` are tracked
there and anything else added would be local to one machine. Please leave it
here.

```
pnpm lint:i18n-unused                 # the full report
pnpm lint:i18n-unused --summary       # the per-namespace table only
pnpm lint:i18n-unused --namespace=magazine
pnpm lint:i18n-unused --patterns      # every dynamic key shape it found
node scripts/report-unused-i18n.mjs --explain=marketing:forOrgs.tiers.employer.list3
```

It reads only. It never edits a catalog, and it is not part of `pnpm build` or
`pnpm verify`. It takes about three seconds.

`--explain` is the one to reach for in review: it prints one key's verdict plus
the evidence behind it, so no verdict has to be taken on trust.

## The rule the tool obeys

Deleting a live key ships a raw key string to a member's screen. Keeping a dead
key costs a few bytes. So every ambiguity resolves towards "still in use". The
tool will sometimes call a dead key live. It must never call a live key dead,
and the tiers below exist because that promise is easy to make and hard to
keep.

## The three tiers, and which ones you may delete from

The report prints keys in three groups, in descending order of confidence. The
counts move daily as the catalogs change; the numbers here are the shape of the
thing, as of 2026-08-26, after the 894-key deletion pass.

### 1A. Unreachable (0 keys today). Safe, within the constructs below.

No string literal anywhere in the product source equals the key, and no key
shape the tool models can reach it.

**The guarantee, stated honestly.** This tier used to say "needs no assumptions
at all". That was not true, and on 2026-08-26 it cost seventeen live keys a
near miss (see [The 1A miss](#the-1a-miss-2026-08-26)). What is actually true
is narrower:

> A key in 1A is unreachable **through the constructs this tool models**. It
> assumes nothing about your intentions, your types, or your backend. It does
> assume that a key is assembled in one of the ways listed below.

The constructs it models, in full:

1. A string literal equal to the key, anywhere in the product source, in any
   position: a `t()` argument, a `labelKey` field in a `*.data.ts`, a value in
   a `Record<Union, string>` map.
2. A template literal, with the constant evaluator resolving what it can within
   one file: literals, nested templates, `a ? b : c`, `a + b`, single-assignment
   `const`s, member access into a local object or array literal, `.map()` over
   a local array with a resolvable callback, and calls to locally declared
   functions with their arguments bound.
3. A **key-prefix literal**: a literal ending in `.` or `:` that is a proper
   prefix of a catalog key. Such a string cannot be a key, so it is treated as
   a prefix awaiting a suffix and becomes the shape `prefix*` with nothing
   proved about where the suffix comes from. This is rule 8, added after the
   miss.
4. CLDR plural expansion around any of the above.

**What still slips through**, and there is no point pretending otherwise:

- A prefix assembled as `base + "." + suffix` where `base` is itself
  unresolvable. The tool is left with `"."` as its only static text, which is
  below the minimum length that separates a key shape from a URL, so the shape
  is discarded. Rule 8 only sees a prefix the source spells with its separator
  attached.
- A prefix or a whole key that arrives from the backend, from another module's
  export, or through a React prop. The tool never crosses a module boundary.
- A key assembled anywhere other than the frontend source: a service worker
  payload, a seeded backend string, an email template.

There is still a structural argument that makes 1A strong: a key fragment from
the backend has to pass through a template literal or a prefix literal to
become a key, and both are now shapes the tool tracks. Checked by hand: no
adapter assigns a _full_ i18n key from a DTO field anywhere in the repo.

Validated by a 77-key stratified hand sample across every namespace and an
independent raw-text cross-check over the whole reported-dead list. The only
hits were cross-namespace name collisions (`auth:common.delete` looks used, but
the use sites all say `admin:common.delete`), which the tool gets right because
it matches namespace-and-key rather than by prefix.

### 1B. Reached only by a catch-all shape (15 keys). Safe, with one reading.

A wide shape covers these, but nothing in the source spells the fragment its
hole would need.

"Wide" is the point. One line in `PrivacyPage.tsx` says
``t(`marketing:${item.titleKey}`)``, which yields the shape `marketing:*` and
touches all 4,400 marketing keys. A shape like that constrains nothing, so
"reachable" barely means anything. `*.title` and `admin:*` are the same story.

The assumption this tier carries is that a multi-segment key fragment is never
invented outside the frontend source. Every 1B line prints the shape that
reached it, so you can check the assumption per key by opening one file. All
fifteen `marketing:forOrgs.tiers.{employer,partner,funder}.list1-5` keys live
here: the tier bullets moved to `orgTiers.data.ts` as plain strings and the
catalog copy stayed behind.

### 1C. Reached by a TIGHT shape (8 keys). Read every one. Never bulk-delete.

A shape that pins its namespace and leaves a one-segment hole reaches these: a
real enumeration. Either the key is dead, or that one value exists only on the
backend. The tool cannot tell those apart, and this tier is kept small on
purpose so a person can read all of it.

**The worked example, and the reason this tier exists.**
`src/features/admin/AdminSafeSpaceNominationDrawer.tsx:161` renders:

```tsx
{
  t(`safety:governance.audit.${entry.action}`);
}
```

`entry.action` is typed `string` on the audit DTO (`adminAudit.api.ts`,
`safeSpaceGovernance.api.ts`). The action codes `badge_restored`,
`badge_suspended`, `flag_raised`, `flag_resolved`, `flag_withdrawn`,
`nomination_awarded`, `nomination_declined` and `nomination_reopened` are
written down nowhere in the frontend. They come off the wire. All eight keys
are **live**, and no static analysis of this repository could know it.

Deleting that family would blank the audit trail in the safe-space nomination
drawer for a moderator, with no error anywhere. That is what tier 1C is
protecting against.

All eight entries in 1C today are that one family. The two that were genuinely
dead
(`marketing:changelog.entries.skills-and-learning-workshops-retired.{title,body}`,
orphaned when the workshops entry was dropped from `CHANGELOG_DATA`) went in
the 2026-08-26 deletion pass.

### Test-only (4 keys). A separate decision.

The product never names these; only a test does.
`common:greeting.welcome` (Translation.test.tsx) and
`shared:calendar.preset.{today,tomorrow,nextWeek}` (Calendar.test.tsx). Dead
product-side, but deleting one turns a test red. That failure is mechanical and
visible, unlike the member-facing kind, so it is a decision rather than a risk.

## The 1A miss (2026-08-26)

The one time this tool's strongest tier was wrong. It is written down because
the tier's whole purpose is to be deleted from without reading, and because the
habit that caught it is now step 3 of the procedure below.

**What it missed.** `src/features/governance/TransparencySections.tsx:22`:

```tsx
function labelLookup(
  allowedKeys: readonly string[],
  translate: (key: string) => string,
  prefix: string,
) {
  return (key: string) =>
    allowedKeys.includes(key) ? translate(`${prefix}${key}`) : undefined;
}
```

It is called three times with a bare prefix string literal
(`"governance:transparency.action."`, `".category."`, `".outcome."`) and an
`as const` allow-list from `./transparencyLabels.ts`. Because the namespace is
curried in as an argument rather than written into a template at the call site,
**both** halves of `` `${prefix}${key}` `` are unresolvable parameters. The
evaluator produced a value that was nothing but holes, `buildPattern` rejected
it as not-a-key, and the shape vanished rather than widening. Seventeen keys
that render three count tables on the **published** Transparency Report were
reported in tier 1A.

Deleting them would have blanked those tables on a public governing document,
with no error, no red test, and no type error, since catalogs are typed
`Record<string, string>`.

**How it was caught.** The agent running the approved 894-key deletion read
every family where **all** siblings were flagged, before deleting any of them.
`transparency.action.*`, `transparency.category.*` and `transparency.outcome.*`
were each flagged whole, which is the signature of a construct the tool cannot
see: real dead copy is usually orphaned in pieces, whereas a missed enumeration
loses its entire vocabulary at once. Opening one of the three led straight to
`labelLookup`.

**The fix**, and what it does not fix. Rule 8: a literal ending in `.` or `:`
that is a proper prefix of a catalog key becomes the shape `prefix*`, with
nothing proved about where the suffix comes from. All seventeen keys are now
LIVE-by-shape, because `transparencyLabels.ts` spells every suffix as a plain
literal, so the fragment pool answers the hole. The residual holes are listed
under 1A above; the pin is
`report-unused-i18n.test.mjs` → "the curried key prefix (the 1A miss)".

Rule 8 is deliberately restricted to prefixes that carry their separator. The
rejected alternatives, both measured on this repo:

| rule                            | literals accepted                                         | verdict                                                                                               |
| ------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| any proper prefix of a key      | 1,587, including `"m"`, `"a"`, `"c"`                      | most of the catalog becomes reachable; the report stops meaning anything                              |
| any segment-boundary prefix     | 400, including `"directory"`, `"governance"`, `"profile"` | ~9,000 keys drift out of 1A/1B for ordinary English words that are complete values in their own right |
| **ends in `.` or `:` (rule 8)** | **4**                                                     | the three transparency prefixes plus `community:readingGroups.listGroup.`                             |

Also rejected: following the `as const` allow-list across the import to
enumerate the exact suffixes. It would have been more precise, and here it was
unnecessary, because the allow-list members are string literals in the scanned
source and the existing fragment pool already proves them. More to the point,
the tool's soundness rests on never guessing, and a module-crossing resolver
that silently misses one array element (a spread, a re-export, a computed
member) would produce a **narrower** answer than the truth. That is the one
direction this tool must never be wrong in. A catch-all that covers everything
beneath the prefix cannot be wrong that way.

## Running a deletion pass

1. **Regenerate the list first.** Do not reuse a list from an earlier session.
   The catalogs move constantly: five keys were added while the tool's first
   report was being written, and several agents edit catalogs in parallel. A
   list more than a few hours old will name keys that have since been reused
   and miss keys that have since been orphaned.
2. Take 1A and 1B. Read the 1C keys by hand and leave the backend-valued ones
   alone.
3. **Before deleting, read every family where ALL siblings are flagged.** This
   is not optional and it is not busywork: it is the check that caught the 1A
   miss above. Copy that is genuinely dead tends to be orphaned in pieces, one
   or two keys out of a family. A whole vocabulary flagged at once
   (`*.action.{ban,dismiss,…}`, `*.category.{harassment,spam,…}`) is the
   signature of an enumeration the tool cannot see. Open one member, grep the
   last segment, and find out who renders it. Do this even when the family sits
   in 1A, especially when it sits in 1A.
4. **Delete from EN and PT together.** `src/shared/i18n/catalogs/parity.test.ts`
   asserts the two languages match key for key, so an EN-only deletion turns it
   red and a PT-only deletion leaves a key nothing can ever resolve.
5. Re-run the tool afterwards. The count should have fallen by what you removed
   and nothing should have moved into 1A that was not there before.
6. `pnpm lint && pnpm typecheck`. Catalogs are typed `Record<string, string>`,
   so a deleted key that some file still names will not be caught by the type
   checker; the tool is the check, which is why step 5 matters.
7. If you found a construct the tool could not see, **pin it** in
   `scripts/report-unused-i18n.test.mjs` and add it to the list in 1A above,
   whether or not you also taught the tool to resolve it.

## What the tool cannot see

- **Union types.** It cannot prove that a hole fed by `card.status` only ever
  takes the four values `CardStatus` allows. Such holes stay open, and the keys
  behind them are reported undecidable rather than guessed at.
- **Values crossing a module boundary, a React prop, or a DTO.** Same
  treatment. Rule 8 is the one construct where the tool stops needing to know:
  it reads the prefix off the call site and gives up on the suffix entirely.
- The cost is yield, never safety: 2,956 keys are "live by shape" rather than
  provably live, and the tool has essentially nothing to say about the `help`
  namespace, where 176 of 181 keys arrive through `FeatureHelp.tsx`'s shapes.

It reports its own limits: `--patterns` lists every shape it found with how many
keys each reaches, and the report hard-fails (exit 2) if any scanned file
produces parse diagnostics, because a partial AST silently drops literals and
that is the one way this tool could be quietly wrong.

## The regression pins

`scripts/report-unused-i18n.test.mjs` pins the cases that were hardest to get
right: all three false positives found during validation (a `.map()` over a
literal array, a helper returning from several branches, and a plural base whose
hole value only resolves through the unsuffixed form), the backend-only
`safety:governance.audit.*` family that has to land in 1C, and the curried key
prefix that produced the 1A miss. It asserts verdicts for named keys and never a
total, because a total would be flaky within a day. If a pinned key is
legitimately deleted, the test fails saying the fixture is out of date and asking
for a replacement, rather than looking like the tool broke.

The two pins that guard the tool's promise rather than its yield are the ones
asserting that `safety:governance.audit.badge_restored` and
`governance:transparency.action.warn` are **never** in tier 1A. Those are the
two ways this tool has been, or could have been, wrong in the direction that
deletes copy a member sees.

The tool excludes that fixture file from its own scan (`SELF_FIXTURE_FILE`).
Without that it reads its own fixtures as evidence and the test asserts against
a world it created.

## Why this is not a build gate, and should not become one

Someone will propose a ratchet. This is the answer.

**A hard "fail on any unused key" gate is wrong here** for the reason already on
the record: the i18n lint is a question rather than a gate. Chrome translates,
content stays English, and the count never reaches zero.

**An a11y-style ratchet is wrong here too, for a different reason.**
`scripts/report-a11y.mjs` holds at `BUDGET = 0` because the number underneath it
is monotone and honest: a new unlabeled control is unambiguously new debt, and
the only way the count rises is that somebody added some.

This count is neither monotone nor a measure of debt. It moves when:

- a catalog gains or loses a key, which happens several times a day;
- a dynamic key shape is added or removed **anywhere in the app**, because
  widening one template literal can shift hundreds of keys between "live by
  shape" and 1B at once;
- a backend enum grows, which changes nothing in this repo at all.

A gate that fails the build for any of those trains people to raise the budget,
which is how a ratchet dies. A red build has to mean one thing, and this number
cannot promise that.

There is a sequencing argument as well. A budget is only meaningful once the
number is near its floor. That was the argument for doing the 894-key deletion
pass before any ratchet, and it has now happened: 1A + 1B stands at 15. A
budget is finally arguable. It is still the weaker option, for the reason
above.

**If a ratchet is added anyway**, three conditions:

- budget against **1A + 1B only** (`--max=N`). Tier 1C is excluded by design,
  because backend-only values make its count meaningless as a debt signal.
- run it where `lint:a11y` runs. Keep it out of `scripts/build-gates.mjs`.
- give it real headroom, and treat a rise as a prompt to look rather than a
  failure to fix.

My own recommendation remains a deliberate run before a sweep, plus the pin
test in CI to keep the tool honest. The cost of a dead key is a few bytes. The
cost of a flaky gate is that the next person turns it off.
