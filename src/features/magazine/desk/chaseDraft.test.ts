import { describe, expect, it } from "vitest";
import type { Language, TranslateOptions } from "../../../shared/i18n/types";
import type { Piece } from "../data/desk.data";
import { buildChaseDraft } from "./chaseDraft";

/** Local noon, so no timezone can push the calendar day either way. */
const TODAY = new Date(2026, 7, 10, 12, 0, 0);

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "The long goodbye",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Sam Okafor",
    editorId: "marta",
    stage: "Drafting",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

const EN_STRINGS: Record<string, string> = {
  "magazine:desk.due.today": "Today",
  "magazine:desk.due.tomorrow": "Tomorrow",
  "magazine:desk.due.inDays_one": "in {count} day",
  "magazine:desk.due.inDays_other": "in {count} days",
  "magazine:desk.due.daysLate_one": "{count} day late",
  "magazine:desk.due.daysLate_other": "{count} days late",
  "magazine:desk.chase.draft.greetingNamed": "Hi {writer},",
  "magazine:desk.chase.draft.greetingAnonymous": "Hi,",
  "magazine:desk.chase.draft.dueToday": "is due today",
  "magazine:desk.chase.draft.dueTomorrow": "is due tomorrow",
  "magazine:desk.chase.draft.dueInDays_one": "is due in {count} day",
  "magazine:desk.chase.draft.dueInDays_other": "is due in {count} days",
  "magazine:desk.chase.draft.dueLate_one": "was due {count} day ago",
  "magazine:desk.chase.draft.dueLate_other": "was due {count} days ago",
  "magazine:desk.chase.draft.dueRaw": "is due {text}",
  "magazine:desk.chase.draft.dueLateRaw": "was due {text}",
  "magazine:desk.chase.draft.dueSoon":
    'checking in on "{title}". It {dueClause}. How is it going?',
  "magazine:desk.chase.draft.late":
    '"{title}" {dueClause}. Can you send me an update on where it stands?',
  "magazine:desk.chase.draft.noDate":
    'checking in on "{title}". How is it going?',
};

const PT_STRINGS: Record<string, string> = {
  "magazine:desk.due.today": "Hoje",
  "magazine:desk.due.tomorrow": "Amanhã",
  "magazine:desk.due.inDays_one": "daqui a {count} dia",
  "magazine:desk.due.inDays_other": "daqui a {count} dias",
  "magazine:desk.due.daysLate_one": "{count} dia de atraso",
  "magazine:desk.due.daysLate_other": "{count} dias de atraso",
  "magazine:desk.chase.draft.greetingNamed": "Olá, {writer}!",
  "magazine:desk.chase.draft.greetingAnonymous": "Olá!",
  "magazine:desk.chase.draft.dueToday": "está marcada para hoje",
  "magazine:desk.chase.draft.dueTomorrow": "está marcada para amanhã",
  "magazine:desk.chase.draft.dueInDays_one":
    "está marcada para daqui a {count} dia",
  "magazine:desk.chase.draft.dueInDays_other":
    "está marcada para daqui a {count} dias",
  "magazine:desk.chase.draft.dueLate_one": "devia ter chegado há {count} dia",
  "magazine:desk.chase.draft.dueLate_other":
    "devia ter chegado há {count} dias",
  "magazine:desk.chase.draft.dueRaw": "está marcada para {text}",
  "magazine:desk.chase.draft.dueLateRaw": "devia ter chegado {text}",
  "magazine:desk.chase.draft.dueSoon":
    "Estou só a ver como vai «{title}». A entrega {dueClause}. Como está a correr?",
  "magazine:desk.chase.draft.late":
    "A «{title}» {dueClause}. Podes dizer-me como está?",
  "magazine:desk.chase.draft.noDate":
    "Estou só a ver como vai «{title}». Como está a correr?",
};

/** A minimal stand-in for the real `t()`: same `{token}` interpolation and
 *  `_one`/`_other` plural-key lookup, over a fixed table per language, so
 *  this test reads the exact strings the keys file hands the catalogs. */
function makeT(language: Language) {
  const table = language === "pt" ? PT_STRINGS : EN_STRINGS;
  return (key: string, options?: TranslateOptions): string => {
    const pluralKey =
      options?.count !== undefined
        ? `${key}_${options.count === 1 ? "one" : "other"}`
        : key;
    const template = table[pluralKey] ?? table[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_match, token: string) =>
      String(options?.[token] ?? `{${token}}`),
    );
  };
}

describe("buildChaseDraft", () => {
  it("drafts a due-today chase", () => {
    const piece = makePiece({ dueDate: "2026-08-10" });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, checking in on "The long goodbye". It is due today. How is it going?',
    );
  });

  it("drafts a due-tomorrow chase", () => {
    const piece = makePiece({ dueDate: "2026-08-11" });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, checking in on "The long goodbye". It is due tomorrow. How is it going?',
    );
  });

  it("drafts a due-in-N-days chase", () => {
    const piece = makePiece({ dueDate: "2026-08-13" });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, checking in on "The long goodbye". It is due in 3 days. How is it going?',
    );
  });

  it("drafts a late chase as 'was due N days ago'", () => {
    const piece = makePiece({ dueDate: "2026-08-07" });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, "The long goodbye" was due 3 days ago. Can you send me an update on where it stands?',
    );
  });

  it("keeps the singular for exactly one day late", () => {
    const oneDayLate = makePiece({ dueDate: "2026-08-09" });
    expect(buildChaseDraft(oneDayLate, TODAY, makeT("en"), "en")).toContain(
      "was due 1 day ago",
    );
  });

  it("drafts a no-date chase when the piece carries no due date", () => {
    const piece = makePiece();
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, checking in on "The long goodbye". How is it going?',
    );
  });

  it("reads a raw due string it cannot parse as a date, plain", () => {
    const piece = makePiece({ due: "early September" });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, checking in on "The long goodbye". It is due early September. How is it going?',
    );
  });

  it("reads a late raw due string as late", () => {
    const piece = makePiece({ due: "early September", late: true });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, "The long goodbye" was due early September. Can you send me an update on where it stands?',
    );
  });

  it("has nothing left to chase once the piece is Ready or Published", () => {
    const piece = makePiece({
      dueDate: "2026-08-07",
      stage: "Ready",
    });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi Sam, checking in on "The long goodbye". How is it going?',
    );
  });

  it("falls back to the first name from a multi-word byline", () => {
    const piece = makePiece({ byline: "Sam Okafor-Reyes" });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toContain(
      "Hi Sam,",
    );
  });

  it("greets plainly in English when the byline has no name to read", () => {
    const piece = makePiece({ byline: "" });
    expect(buildChaseDraft(piece, TODAY, makeT("en"), "en")).toBe(
      'Hi, checking in on "The long goodbye". How is it going?',
    );
  });

  it("greets plainly in Portuguese when the byline has no name to read", () => {
    const piece = makePiece({ byline: "" });
    expect(buildChaseDraft(piece, TODAY, makeT("pt"), "pt")).toBe(
      "Olá! Estou só a ver como vai «The long goodbye». Como está a correr?",
    );
  });

  it("drafts the Portuguese due-soon chase with its own due clause", () => {
    const piece = makePiece({ dueDate: "2026-08-11" });
    expect(buildChaseDraft(piece, TODAY, makeT("pt"), "pt")).toBe(
      "Olá, Sam! Estou só a ver como vai «The long goodbye». A entrega está marcada para amanhã. Como está a correr?",
    );
  });

  it("drafts the Portuguese late chase as 'devia ter chegado há N dias'", () => {
    const piece = makePiece({ dueDate: "2026-08-07" });
    expect(buildChaseDraft(piece, TODAY, makeT("pt"), "pt")).toBe(
      "Olá, Sam! A «The long goodbye» devia ter chegado há 3 dias. Podes dizer-me como está?",
    );
  });

  it("drafts the Portuguese no-date chase", () => {
    const piece = makePiece();
    expect(buildChaseDraft(piece, TODAY, makeT("pt"), "pt")).toBe(
      "Olá, Sam! Estou só a ver como vai «The long goodbye». Como está a correr?",
    );
  });
});
