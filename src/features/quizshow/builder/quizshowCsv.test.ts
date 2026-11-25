import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_LIMITS,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import {
  blankDraft,
  newQuestion,
  newWheel,
  type QuizshowDraft,
} from "./quizshowDraft";
import {
  QUIZSHOW_CSV_COLUMNS,
  csvCellOf,
  csvSeparatorForLanguage,
  csvSeparatorOf,
  decodeCsvBytes,
  exportQuizCsv,
  parseQuizCsv,
  quizCsvFileName,
  readCsvRecords,
} from "./quizshowCsv";
import { withImportedRounds } from "./quizshowPasteFormat";

const ISSUE = "quizshow:studio.paste.issue.";
const HEADER = QUIZSHOW_CSV_COLUMNS.join(",");

function text(en: string, pt: string) {
  return { en, pt };
}

function draftWith(
  rounds: Array<{
    title: { en: string; pt: string };
    questions: QuizshowQuestionInput[];
  }>,
  languages: QuizshowDraft["languages"] = "both",
): QuizshowDraft {
  const base = blankDraft();
  const template = base.rounds[0];
  if (template === undefined) throw new Error("blankDraft has a round");
  return {
    ...base,
    languages,
    screenLanguage: languages,
    rounds: rounds.map((round, roundIndex) => ({
      ...template,
      draftKey: `round-${roundIndex}`,
      title: round.title,
      questions: round.questions.map((question, questionIndex) => ({
        draftKey: `round-${roundIndex}-${questionIndex}`,
        question,
        mediaUrl: null,
      })),
    })),
  };
}

/** Every question type the CSV carries, with quotes, commas and line breaks in the cells. */
function richDraft(): QuizshowDraft {
  const multipleChoice: QuizshowQuestionInput = {
    ...newQuestion("multiple_choice", "quiz"),
    prompt: text('Who said "Yas, queen"?', 'Quem disse "Yas, queen"?'),
    options: [
      { id: "a", text: text("Ru, of course", "Ru, claro") },
      { id: "b", text: text("Line one\nline two", "Linha um\nlinha dois") },
      { id: "c", text: text("Cher", "Cher") },
    ],
    answer: { correctIndexes: [0, 2] },
    points: 2000,
    timeLimitSeconds: 30,
  };
  const trueFalse: QuizshowQuestionInput = {
    ...newQuestion("true_false", "quiz"),
    prompt: text("Stonewall was in 1969", "Stonewall foi em 1969"),
    answer: { isTrue: true },
  };
  const typed: QuizshowQuestionInput = {
    ...newQuestion("type_answer", "quiz"),
    prompt: text("Capital of Portugal?", "Capital de Portugal?"),
    answer: { text: text("Lisbon", "Lisboa") },
  };
  const closestAbsolute: QuizshowQuestionInput = {
    ...newQuestion("closest_number", "quiz"),
    prompt: text("Year of the first Pride?", "Ano da primeira Marcha?"),
    answer: { value: 1970, tolerance: { mode: "absolute", amount: 5 } },
  };
  const closestPercent: QuizshowQuestionInput = {
    ...newQuestion("closest_number", "quiz"),
    prompt: text("How many?", "Quantos?"),
    answer: { value: 250, tolerance: { mode: "percent", amount: 10 } },
  };
  const order: QuizshowQuestionInput = {
    ...newQuestion("order", "quiz"),
    prompt: text("Oldest first", "Mais antigo primeiro"),
    options: [
      { id: "a", text: text("1969", "1969") },
      { id: "b", text: text("1970", "1970") },
      { id: "c", text: text("1978", "1978") },
      { id: "d", text: text("1999", "1999") },
      { id: "e", text: text("2010", "2010") },
    ],
    answer: { orderedIds: ["a", "b", "c", "d", "e"] },
  };
  const poll: QuizshowQuestionInput = {
    ...newQuestion("poll", "quiz"),
    prompt: text("Best diva?", "Melhor diva?"),
    options: [
      { id: "a", text: text("Kylie", "Kylie") },
      { id: "b", text: text("Madonna", "Madonna") },
    ],
  };
  const prompt: QuizshowQuestionInput = {
    ...newQuestion("prompt", "drag_name"),
    prompt: text("A drag name for a cat", "Um nome drag para um gato"),
  };
  return draftWith([
    {
      title: text("Music, pop", "Música, pop"),
      questions: [multipleChoice, trueFalse, typed],
    },
    { title: text("", ""), questions: [closestAbsolute, closestPercent] },
    { title: text("", ""), questions: [order, poll] },
    { title: text("Party", "Festa"), questions: [prompt] },
  ]);
}

describe("readCsvRecords", () => {
  it("reads quotes, doubled quotes, commas and line breaks inside cells", () => {
    const { records, unclosedQuoteLine } = readCsvRecords(
      'a,"b, c","say ""hi""","one\r\ntwo"\r\nnext,row\n',
    );
    expect(unclosedQuoteLine).toBeNull();
    expect(records).toEqual([
      { line: 1, cells: ["a", "b, c", 'say "hi"', "one\ntwo"] },
      { line: 3, cells: ["next", "row"] },
    ]);
  });

  it("reports a quote that never closes", () => {
    expect(readCsvRecords('a,"open\nstill').unclosedQuoteLine).toBe(1);
  });
});

describe("csvCellOf", () => {
  it("quotes only the cells that need it", () => {
    expect(csvCellOf("plain")).toBe("plain");
    expect(csvCellOf("a, b")).toBe('"a, b"');
    expect(csvCellOf('say "hi"')).toBe('"say ""hi"""');
    expect(csvCellOf("one\ntwo")).toBe('"one\ntwo"');
  });

  it("quotes a cell holding a semicolon in a semicolon file, and a comma only in a comma file", () => {
    expect(csvCellOf("a; b", ";")).toBe('"a; b"');
    expect(csvCellOf("a, b", ";")).toBe("a, b");
    expect(csvCellOf("a; b")).toBe("a; b");
    expect(csvCellOf('say "hi"', ";")).toBe('"say ""hi"""');
  });
});

describe("csvSeparatorForLanguage", () => {
  it("writes semicolons for Portuguese and commas for every other language", () => {
    expect(csvSeparatorForLanguage("pt")).toBe(";");
    expect(csvSeparatorForLanguage("en")).toBe(",");
  });
});

describe("exportQuizCsv and parseQuizCsv", () => {
  it("round-trips every type, quotes, commas, line breaks and EN | PT cells", () => {
    const draft = richDraft();
    const csv = exportQuizCsv(draft);
    const result = parseQuizCsv(csv, draft.languages);
    expect(result.issues).toEqual([]);
    const reimported = withImportedRounds(
      { ...draft, rounds: [] },
      result.rounds,
    );
    expect(exportQuizCsv(reimported)).toBe(csv);
    expect(reimported.rounds.map((round) => round.kind)).toEqual([
      "quiz",
      "quiz",
      "quiz",
      "drag_name",
    ]);
    expect(reimported.rounds.map((round) => round.title)).toEqual(
      draft.rounds.map((round) => round.title),
    );
    expect(
      reimported.rounds.map((round) =>
        round.questions.map(({ question }) => question),
      ),
    ).toEqual(
      draft.rounds.map((round) =>
        round.questions.map(({ question }) => question),
      ),
    );
  });

  it("writes a semicolon file for Portuguese that reads back to the same quiz", () => {
    const draft = richDraft();
    const csv = exportQuizCsv(draft, ";");
    const header = csv.split("\r\n")[0] ?? "";
    expect(header).toBe(
      (exportQuizCsv(draft).split("\r\n")[0] ?? "").replaceAll(",", ";"),
    );
    expect(csvSeparatorOf(csv)).toBe(";");
    const result = parseQuizCsv(csv, draft.languages);
    expect(result.issues).toEqual([]);
    const reimported = withImportedRounds(
      { ...draft, rounds: [] },
      result.rounds,
    );
    expect(exportQuizCsv(reimported, ";")).toBe(csv);
    expect(
      reimported.rounds.map((round) =>
        round.questions.map(({ question }) => question),
      ),
    ).toEqual(
      draft.rounds.map((round) =>
        round.questions.map(({ question }) => question),
      ),
    );
  });

  it("quotes a multiple-choice correct cell and a cell with a semicolon in a semicolon file", () => {
    const question: QuizshowQuestionInput = {
      ...newQuestion("multiple_choice", "quiz"),
      prompt: text("Pick; two", "Escolhe; duas"),
      options: [
        { id: "a", text: text("A", "A") },
        { id: "b", text: text("B", "B") },
        { id: "c", text: text("C", "C") },
        { id: "d", text: text("D", "D") },
      ],
      answer: { correctIndexes: [0, 2] },
    };
    const draft = draftWith([
      { title: text("Round", "Ronda"), questions: [question] },
    ]);
    const row = exportQuizCsv(draft, ";").split("\r\n")[1] ?? "";
    expect(row).toContain('"Pick; two";"Escolhe; duas"');
    expect(row).toContain(';"1;3";');
    const result = parseQuizCsv(exportQuizCsv(draft, ";"), "both");
    expect(result.issues).toEqual([]);
    expect(result.rounds[0]?.questions[0]?.question.prompt).toEqual(
      text("Pick; two", "Escolhe; duas"),
    );
  });

  it("writes option_5 and option_6 only when an order question needs them", () => {
    expect(exportQuizCsv(richDraft()).split("\r\n")[0]).toContain(
      "option_5,option_6",
    );
    const short = draftWith([
      { title: text("A", "A"), questions: [newQuestion("poll", "quiz")] },
    ]);
    expect(exportQuizCsv(short).split("\r\n")[0]).toBe(HEADER);
  });

  it("writes EN | PT cells and a one-language cell for a one-language quiz", () => {
    const question: QuizshowQuestionInput = {
      ...newQuestion("type_answer", "quiz"),
      prompt: text("", "Capital?"),
      answer: { text: text("", "Lisboa") },
    };
    const draft = draftWith(
      [{ title: text("", "Ronda"), questions: [question] }],
      "pt",
    );
    const csv = exportQuizCsv(draft);
    expect(csv.split("\r\n")[1]).toBe(
      "Ronda,type_answer,,Capital?,,,,,Lisboa,1000,",
    );
    const result = parseQuizCsv(csv, "pt");
    expect(result.rounds[0]?.title).toEqual(text("", "Ronda"));
    expect(result.rounds[0]?.questions[0]?.question.answer).toEqual({
      text: text("", "Lisboa"),
    });
  });

  it("leaves wheel rows out", () => {
    const draft = richDraft();
    const csv = exportQuizCsv({
      ...draft,
      rounds: [newWheel(), ...draft.rounds],
    });
    expect(csv).toBe(exportQuizCsv(draft));
  });
});

describe("parseQuizCsv issues", () => {
  it("needs a header row", () => {
    const result = parseQuizCsv("Music,multiple_choice,Q,,a,b,,,1,,", "en");
    expect(result.rounds).toEqual([]);
    expect(result.issues).toEqual([
      {
        line: 1,
        reasonKey: `${ISSUE}missingHeader`,
        values: { columns: HEADER },
      },
    ]);
  });

  it("names the row and the reason of each bad row, and keeps the good rows", () => {
    const rows = [
      HEADER,
      "R,multiple_choice,Q,,a,b,,,,,",
      "R,multiple_choice,Q,,a,b,,,1;2,,",
      "R,true_false,Q,,,,,,maybe,,",
      "R,closest_number,Q,,,,,,1969 ~90%,,",
      "R,order,Q,,a,b,c,,1;1;2,,",
      "R,riddle,Q,,,,,,,,",
      "R,type_answer,Q,,,,,,yes,750,",
      "R,type_answer,Q,,,,,,yes,,300",
      "R,type_answer,Good,,,,,,yes,500,10",
      "M,type_answer,Mixed,,,,,,yes,,",
      "M,prompt,Party,,,,,,,,",
    ];
    const result = parseQuizCsv(rows.join("\n"), "en");
    expect(
      result.issues.map(
        (issue) => `${issue.line} ${issue.reasonKey.slice(ISSUE.length)}`,
      ),
    ).toEqual([
      "2 badCorrect.multiple_choice",
      "3 allCorrect",
      "4 badCorrect.true_false",
      "5 badCorrect.closest_number",
      "6 badCorrect.order",
      "7 unknownType",
      "8 badPoints",
      "9 badTimeLimit",
      "12 mixedRound",
    ]);
    expect(result.rounds).toHaveLength(1);
    expect(result.rounds[0]?.questions.map(({ line }) => line)).toEqual([10]);
    expect(result.rounds[0]?.questions[0]?.question.prompt.en).toBe("Good");
  });

  it("reads an order with an empty correct cell as listed, and orders by the cell otherwise", () => {
    const rows = [HEADER, "1,order,Q,,x,y,z,,,,", "2,order,Q,,x,y,z,,3;1;2,,"];
    const result = parseQuizCsv(rows.join("\r\n"), "en");
    expect(result.issues).toEqual([]);
    const [listed, reordered] = result.rounds.map(
      (round) => round.questions[0]?.question,
    );
    expect(listed?.options.map((option) => option.text.en)).toEqual([
      "x",
      "y",
      "z",
    ]);
    expect(reordered?.options.map((option) => option.text.en)).toEqual([
      "z",
      "x",
      "y",
    ]);
    expect(reordered?.answer).toEqual({ orderedIds: ["c", "a", "b"] });
  });

  it("never throws on garbage", () => {
    const garbage = [
      "",
      '"',
      '""""',
      ",,,,\n,,,,",
      `${HEADER}\n"unclosed,`,
      `${HEADER}\n,,,,,,,,,,,,,,,,,,,,,,`,
      `\uFEFF${HEADER}\r\r\r`,
      "\u0000\u0001\u0002",
    ];
    for (const input of garbage) {
      expect(() => parseQuizCsv(input, "both")).not.toThrow();
    }
    expect(() => parseQuizCsv(null as unknown as string, "en")).not.toThrow();
  });
});

describe("quizCsvFileName", () => {
  it("takes out characters a file system refuses and falls back for a blank title", () => {
    expect(quizCsvFileName('Pride: "Quiz" / Night', "quiz")).toBe(
      "Pride Quiz Night.csv",
    );
    expect(quizCsvFileName("   ", "quiz")).toBe("quiz.csv");
  });
});

describe("fix round 1", () => {
  function issuesOf(csv: string, languages: QuizshowDraft["languages"] = "en") {
    return parseQuizCsv(csv, languages).issues.map(
      (issue) => `${issue.line} ${issue.reasonKey.slice(ISSUE.length)}`,
    );
  }

  it("guards formula cells on export and reads them back", () => {
    const typed: QuizshowQuestionInput = {
      ...newQuestion("type_answer", "quiz"),
      prompt: text('=HYPERLINK("http://example.test","x")', "@SUM(1)"),
      answer: { text: text("-1", "+1") },
    };
    const negative: QuizshowQuestionInput = {
      ...newQuestion("closest_number", "quiz"),
      prompt: text("-5 or so?", "-5 mais ou menos?"),
      answer: { value: -5, tolerance: { mode: "absolute", amount: 2 } },
    };
    const draft = draftWith([
      { title: text("=1+1", "=1+1"), questions: [typed, negative] },
    ]);
    const csv = exportQuizCsv(draft);
    const [, typedRow, negativeRow] = csv.split("\r\n");
    expect(typedRow?.startsWith("'=1+1 | =1+1,type_answer,")).toBe(true);
    expect(typedRow).toContain(`"'=HYPERLINK(""http://example.test"",""x"")"`);
    expect(typedRow).toContain(",'@SUM(1),");
    expect(typedRow).toContain(",'-1 | +1,");
    // A closest answer stays a plain number so a spreadsheet app reads it as one.
    expect(negativeRow).toContain(",-5 ~2,");
    expect(negativeRow).toContain(",'-5 or so?,'-5 mais ou menos?,");
    const result = parseQuizCsv(csv, draft.languages);
    expect(result.issues).toEqual([]);
    const reimported = withImportedRounds(
      { ...draft, rounds: [] },
      result.rounds,
    );
    expect(exportQuizCsv(reimported)).toBe(csv);
    expect(reimported.rounds[0]?.title).toEqual(text("=1+1", "=1+1"));
    expect(
      reimported.rounds[0]?.questions.map(({ question }) => question),
    ).toEqual([typed, negative]);
  });

  it("writes a bar inside a text as \\| and reads it back", () => {
    const question: QuizshowQuestionInput = {
      ...newQuestion("type_answer", "quiz"),
      prompt: text("Pipe?", "Pipe?"),
      answer: { text: text("a | b", "c | d") },
    };
    const draft = draftWith([
      { title: text("A|B", "C|D"), questions: [question] },
    ]);
    const csv = exportQuizCsv(draft);
    expect(csv).toContain("A\\|B | C\\|D,");
    expect(csv).toContain(",a \\| b | c \\| d,");
    const reimported = withImportedRounds(
      { ...draft, rounds: [] },
      parseQuizCsv(csv, "both").rounds,
    );
    expect(exportQuizCsv(reimported)).toBe(csv);
  });

  it("reads a semicolon file from a Portuguese spreadsheet app", () => {
    const header = QUIZSHOW_CSV_COLUMNS.join(";");
    expect(csvSeparatorOf(`\uFEFF${header}\r\n`)).toBe(";");
    expect(csvSeparatorOf(HEADER)).toBe(",");
    const result = parseQuizCsv(
      `${header}\r\nMúsica;multiple_choice;Quem?;;Cher;Madonna;;;"2";;\r\n`,
      "pt",
    );
    expect(result.issues).toEqual([]);
    expect(result.rounds[0]?.questions[0]?.question.answer).toEqual({
      correctIndexes: [1],
    });
  });

  it("decodes UTF-8 and falls back to Windows-1252", () => {
    const utf8 = new TextEncoder().encode("Música");
    expect(decodeCsvBytes(utf8)).toBe("Música");
    // "Música" as Windows-1252: ú is the single byte 0xFA, invalid as UTF-8.
    const windows1252 = new Uint8Array([0x4d, 0xfa, 0x73, 0x69, 0x63, 0x61]);
    expect(decodeCsvBytes(windows1252)).toBe("Música");
  });

  it("opens a quoted cell only at the start of a cell", () => {
    const { records } = readCsvRecords('a 5" tall,"b",  "c, d"\n');
    expect(records).toEqual([{ line: 1, cells: ['a 5" tall', "b", "c, d"] }]);
  });

  it("names a gap between options and a text past its limit", () => {
    const longPrompt = "p".repeat(QUIZSHOW_LIMITS.promptMax + 1);
    const longOption = "o".repeat(QUIZSHOW_LIMITS.optionTextMax + 1);
    const longTitle = "t".repeat(QUIZSHOW_LIMITS.roundTitleMax + 1);
    const rows = [
      HEADER,
      "R,multiple_choice,Q,,a,,c,,1,,",
      `R,multiple_choice,${longPrompt},,a,b,,,1,,`,
      `R,multiple_choice,Q,,a,${longOption},,,1,,`,
      `R,type_answer,Q,,,,,,${"x".repeat(QUIZSHOW_LIMITS.answerTextMax + 1)},,`,
      `${longTitle},type_answer,Q,,,,,,ok,,`,
    ];
    expect(issuesOf(rows.join("\n"))).toEqual([
      "2 emptyOption",
      "3 tooLong",
      "4 tooLong",
      "5 tooLong",
      "6 tooLong",
    ]);
  });

  it("counts lines from the file with a byte order mark and CR-only line ends", () => {
    const csv = `\uFEFF${HEADER}\rR,riddle,Q,,,,,,,,\r\rR,"multi\rline",Q,,,,,,,,\r`;
    expect(issuesOf(csv)).toEqual(["2 unknownType", "4 unknownType"]);
  });

  it("writes tiny closest numbers in plain digits", () => {
    const question: QuizshowQuestionInput = {
      ...newQuestion("closest_number", "quiz"),
      prompt: text("Small?", "Pequeno?"),
      answer: { value: 0.0000001, tolerance: { mode: "percent", amount: 10 } },
    };
    const csv = exportQuizCsv(
      draftWith([{ title: text("S", "S"), questions: [question] }]),
    );
    expect(csv).toContain(",0.0000001 ~10%,");
    expect(
      parseQuizCsv(csv, "both").rounds[0]?.questions[0]?.question.answer,
    ).toEqual(question.answer);
  });

  it("reads a long file in one pass", () => {
    const rows = Array.from(
      { length: 5000 },
      (_unused, index) =>
        `${Math.floor(index / 20)},closest_number,Q${index},,,,,,${index} ~1,,`,
    );
    const result = parseQuizCsv([HEADER, ...rows].join("\r\n"), "en");
    expect(result.rounds).toHaveLength(250);
    expect(() => parseQuizCsv(`"${"a".repeat(1_000_000)}`, "en")).not.toThrow();
  });
});

describe("fix round 3", () => {
  it("keeps text that already starts with a guard quote through the round trip", () => {
    const typed: QuizshowQuestionInput = {
      ...newQuestion("type_answer", "quiz"),
      prompt: text("'=x", "'+y"),
      answer: { text: text("'-5", "'=x") },
    };
    const draft = draftWith([
      { title: text("'-5", "'=x"), questions: [typed] },
    ]);
    const csv = exportQuizCsv(draft);
    const row = csv.split("\r\n")[1] ?? "";
    expect(row.startsWith("''-5 | '=x,type_answer,''=x,''+y,")).toBe(true);
    expect(row).toContain(",''-5 | '=x,");
    const result = parseQuizCsv(csv, draft.languages);
    expect(result.issues).toEqual([]);
    expect(result.rounds[0]?.title).toEqual(text("'-5", "'=x"));
    expect(result.rounds[0]?.questions[0]?.question).toEqual(typed);
    const reimported = withImportedRounds(
      { ...draft, rounds: [] },
      result.rounds,
    );
    expect(exportQuizCsv(reimported)).toBe(csv);
  });

  it("reads a decimal comma in a semicolon file", () => {
    const header = QUIZSHOW_CSV_COLUMNS.join(";");
    const result = parseQuizCsv(
      `${header}\r\nR;closest_number;Q;;;;;;2,5 ~0,5;;\r\n`,
      "en",
    );
    expect(result.issues).toEqual([]);
    expect(result.rounds[0]?.questions[0]?.question.answer).toEqual({
      value: 2.5,
      tolerance: { mode: "absolute", amount: 0.5 },
    });
    // A comma file keeps the comma as a separator, so a quoted decimal comma is refused.
    expect(
      parseQuizCsv(`${HEADER}\r\nR,closest_number,Q,,,,,,"2,5",,\r\n`, "en")
        .issues[0]?.reasonKey,
    ).toBe(`${ISSUE}badCorrect.closest_number`);
  });

  it("drops a UTF-8 byte order mark before the Windows-1252 fallback", () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x4d, 0xfa, 0x73]);
    expect(decodeCsvBytes(bytes)).toBe("Mús");
  });

  it("keeps rounds apart when titles repeat next to each other or are digits only", () => {
    const question: QuizshowQuestionInput = {
      ...newQuestion("true_false", "quiz"),
      prompt: text("Yes?", "Sim?"),
      answer: { isTrue: true },
    };
    const titles = [
      text("Music", ""),
      text("Music", ""),
      text("Music", ""),
      text("1984", ""),
      text("1984", ""),
      text("", ""),
      text("Film", "Cinema"),
      text("Film", "Cinema"),
    ];
    const draft = draftWith(
      titles.map((title) => ({ title, questions: [question] })),
    );
    const csv = exportQuizCsv(draft);
    const result = parseQuizCsv(csv, draft.languages);
    expect(result.issues).toEqual([]);
    expect(result.rounds.map((round) => round.title)).toEqual(titles);
    const reimported = withImportedRounds(
      { ...draft, rounds: [] },
      result.rounds,
    );
    expect(exportQuizCsv(reimported)).toBe(csv);
  });
});
