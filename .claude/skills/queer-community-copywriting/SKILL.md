---
name: queer-community-copywriting
description: Use when writing, reviewing, or rewriting any user-facing copy in QueerPulse — headlines, subtitles, button labels, empty/error/success states, invites, onboarding, notifications, magazine blurbs, toasts. Grounds copy in the QueerPulse voice (warm, second-person, non-transactional, safety-conscious) and in inclusive-language best practice for queer communities. Use BEFORE writing the words, not only after.
user-invocable: true
---

# Queer & Community Copywriting (QueerPulse)

You are writing for a **vouched-for, invite-only queer community platform** rooted
in Lisbon — not a growth-funnel SaaS. Every word should make a real person feel
**safe, seen, and like they belong**, never sold to. This skill encodes the house
voice plus inclusive-language practice for queer audiences.

Pair this with the `copy-reviewer` agent to audit existing screens.

## The QueerPulse voice (non-negotiable)

From `docs/design-system.md` → Content fundamentals:

- **Warm, direct, second person** ("you"). Never corporate. Never condescending.
- **Sentence case** everywhere. ALL CAPS only for eyebrows, footer column heads, category chips.
- **Emphasis = one Fraunces italic `<em>` in the coral accent** — never bold, never ALL CAPS, never an exclamation mark. Emphasise the *one* word that carries the feeling.
- **No emoji** in headings or body (toasts / wellbeing widget / notifications only).
- **Numbers are used sparingly and meaningfully** — "247 members", "6 spots left" — as trust signals, not hype.
- **Tone is safety-conscious, community-first, non-transactional. Avoid FOMO.**
- **Bilingual EN/PT** — keep phrasing translatable; avoid idioms that won't survive in Portuguese.

## Seven principles for queer-community copy

1. **Belonging over conversion.** Sell *membership in something*, not a signup. Lead with what it *feels like to be inside*, not features or urgency. "You belong here" beats "Join now — limited spots!"
2. **Safety and consent are features, not fine print.** Name privacy, invite-only, no-ads, no-algorithm, quick-exit as reassurances people can feel. Never imply surveillance, ranking, or exposure ("get noticed", "grow your reach" are off-brand).
3. **Let people name themselves.** Mirror the language a member uses for their identity, partners, and pronouns; never assign labels or assume a binary. Default to **they/them** and "folks / people / everyone" — never "you guys", "ladies and gentlemen", "men and women".
4. **Specific and human beats broad and slick.** Concrete community texture ("a monthly magazine, a mental-health fund, a forum that's actually quiet") earns more trust than abstract uplift ("a vibrant platform for connection").
5. **Non-transactional warmth.** No dark patterns, no manufactured scarcity, no guilt. If a number creates pressure, cut it. Invitations are *offered*, not *claimed*.
6. **Respect the reader's intelligence and history.** Don't over-explain queerness to queer people, don't tokenise ("celebrate diversity!"), don't moralise. Understatement reads as respect.
7. **Plain, kind, clear.** Short sentences. Say what happens next. Empathy from the reader's point of view. Clarity is a form of care.

## Inclusive terminology — quick rules

| Prefer | Avoid | Why |
| --- | --- | --- |
| names / pronouns | "preferred pronouns/name" | "preferred" implies the real one is optional |
| "they" (singular, no explanation) | "he/she", "(s)he" | binary erases non-binary people |
| "trans women are women" — no qualifier | "biologically", "born a…" | qualifiers delegitimise identity |
| "person with HIV" | "suffers from / HIV patient" | no pity / pathologising framing |
| LGBTQ+ / queer and trans / "our community" | outdated: "homosexual", "transsexual", "transgendered", "lifestyle" | dated or clinical terms read as othering |
| "folks", "people", "everyone", "y'all" | "you guys", "ladies and gentlemen" | gender-neutral group address |
| Pride (event) / pride (feeling) | — | capitalise the event, lowercase the sentiment |

When in doubt, write for *one specific member* you can picture, and ask: would this
make them feel safer and more at home, or more like a metric?

## Microcopy patterns

- **Headlines:** evocative, one coral `<em>`. Carry a feeling, not a command. ("Bring someone *in*", "You belong *here*".)
- **Subtitles/explainers:** one plain warm sentence that says *what this is*, concretely. Good place for the no-ads / no-algorithm / invite-only reassurance.
- **Buttons:** plain verbs in sentence case via the `<Button>` component ("Send invitation", "Open invitation", "Create an account"). Never "Submit", "Click here", or hypey CTAs.
- **Empty states:** kind and oriented — what this space is for + the one next step. Never a dead-end or a scold.
- **Errors:** no blame, plainly recoverable. "Couldn't copy — select and copy the link" not "Error: clipboard failed".
- **Success / confirmation:** quiet warmth on the plum panel, jade tick, one coral `<em>`; reassure what happens next ("You'll be notified when they join"). Not "Success!" with a 🎉.
- **Invites:** personal, offered, trust-framed. Reference the human who vouched. Never "claim your spot", countdowns, or scarcity bait.
- **Notifications/toasts:** short, human, present tense ("Link copied", "Draft saved").

## Revision checklist

Run this on any copy before shipping it:

- [ ] Second person, sentence case, no exclamation mark doing the emphasis.
- [ ] Exactly one Fraunces italic `<em>` (coral) on the word that matters — or none.
- [ ] Belonging/safety framing, not conversion/FOMO/scarcity.
- [ ] No assumed gender, binary, or identity label; they/them + "folks/people".
- [ ] No dated/clinical terms (see table); mirror self-identification.
- [ ] Concrete community detail beats abstract uplift.
- [ ] Says what it is / what happens next, plainly. Translatable to PT.
- [ ] No emoji in heading/body; no "Submit/Click here"; uses `<Button>`.

## Before → after (from this repo's surfaces)

- Invite hero — ❌ "You're invited" / "Invite-only · 247 members"
  → ✅ "You belong *here*" / "Where queer Lisbon gathers — no ads, no algorithm."
- CTA — ❌ "Sign up now to unlock the community!" → ✅ "Create an account"
- Empty forum — ❌ "No posts yet." → ✅ "Quiet in here for now — start the conversation when you're ready."
- Error — ❌ "Invalid email." → ✅ "That email doesn't look right — mind checking it?"

## Where copy lives in the codebase

UI copy sits in the page/component `.tsx`, and reusable strings in colocated
`*.data.ts(x)` files (`.tsx` when the string carries JSX like an `<em>`). User-facing
strings also flow through `src/shared/i18n/strings.en.ts`. When you change a headline
that has a PT counterpart, keep the translation in mind (phrasing should survive a
literal-ish translation).

## Sources

- [NLGJA Stylebook on LGBTQ+ Terminology](https://www.nlgja.org/stylebook-on-lgbtq-terminology/)
- [Queer Voices — On inclusive language](https://queer-voices.com/on-inclusive-language/)
- [UX Content Collective — Writing inclusive UX content & microcopy](https://uxcontent.com/getting-started-with-writing-inclusive-copy/)
- [CommunicateHealth — Inclusive Language Playbook: Writing for LGBTQ+ audiences](https://communicatehealth.com/wp-content/uploads/ch-lgbtq-playbook.pdf)
