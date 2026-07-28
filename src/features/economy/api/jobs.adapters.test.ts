import { describe, expect, it } from "vitest";
import {
  applicationToView,
  deadlineText,
  formatPay,
  jobCardToJob,
  jobDetailToJob,
  logoFromName,
  parseDeadline,
  parsePosted,
  postedText,
  postJobStateToCreateJobDto,
} from "./jobs.adapters";
import { createFormatters } from "../../../shared/i18n/format";
import { catalogs } from "../../../shared/i18n/catalogs";
import type { TFunction } from "../../../shared/i18n/types";
import type {
  JobApplicationDTO,
  JobCardDTO,
  JobDetailDTO,
  JobPay,
} from "./jobs.api";
import type { CompanyProfile } from "../companies.data";
import type { PostJobState } from "../usePostJobForm";

/**
 * A minimal `t` over the real `en` catalog — asserts against the shipped copy
 * rather than a fixture, so a key that goes missing fails here too.
 */
const t: TFunction = (key, options) => {
  const [ns, path] = key.split(":");
  const value = catalogs.en[ns as "economy"]?.[path ?? ""] ?? key;
  return Object.entries(options ?? {}).reduce(
    (acc, [token, val]) => acc.replace(`{${token}}`, String(val)),
    value,
  );
};
const fmt = createFormatters("en-GB");

const basePay: JobPay = {
  salary: null,
  rateMin: null,
  rateMax: null,
  currency: null,
  ratePer: null,
  hidePay: false,
  barter: false,
};

describe("logoFromName", () => {
  it("takes the first letter of the first two words", () => {
    expect(logoFromName("Atelier Pulso")).toBe("AP");
  });
  it("takes the first two letters of a single word", () => {
    expect(logoFromName("Rádio")).toBe("RÁ");
  });
  it("falls back to ? on an empty string", () => {
    expect(logoFromName("   ")).toBe("?");
  });
});

describe("formatPay", () => {
  it("hidePay + barter → barter/to discuss", () => {
    expect(formatPay({ ...basePay, hidePay: true, barter: true }, t, fmt)).toBe(
      "Barter / to discuss",
    );
  });
  it("hidePay without barter → Competitive", () => {
    expect(formatPay({ ...basePay, hidePay: true }, t, fmt)).toBe(
      "Competitive",
    );
  });
  it("explicit salary string wins", () => {
    expect(formatPay({ ...basePay, salary: "€2,000/mo" }, t, fmt)).toBe(
      "€2,000/mo",
    );
  });
  it("no rates + barter → Open to barter", () => {
    expect(formatPay({ ...basePay, barter: true }, t, fmt)).toBe(
      "Open to barter",
    );
  });
  it("no rates, no barter → To discuss", () => {
    expect(formatPay(basePay, t, fmt)).toBe("To discuss");
  });
  it("a min/max range renders each bound through fmt.currency (never a hand-rolled € prefix) plus the translated period suffix", () => {
    const result = formatPay(
      {
        ...basePay,
        rateMin: 20,
        rateMax: 40,
        currency: "£",
        ratePer: "Hour",
      },
      t,
      fmt,
    );
    expect(result).toBe(
      `${fmt.currency(20, "GBP")}–${fmt.currency(40, "GBP")} /hr`,
    );
  });
  it("a single min rate with a To-discuss period drops the period", () => {
    expect(
      formatPay({ ...basePay, rateMin: 500, ratePer: "To discuss" }, t, fmt),
    ).toBe(fmt.currency(500, "EUR"));
  });
});

describe("parseDeadline", () => {
  it("null → null", () => expect(parseDeadline(null)).toBeNull());
  it("invalid ISO → null", () =>
    expect(parseDeadline("not-a-date")).toBeNull());
  it("valid ISO → a Date", () =>
    expect(parseDeadline("2026-06-30")?.getUTCFullYear()).toBe(2026));
});

describe("deadlineText", () => {
  it("null → the Open chrome string", () =>
    expect(deadlineText(null, t, fmt)).toBe("Open"));
  it("a Date → a locale-formatted day + short month", () =>
    expect(deadlineText(new Date("2026-06-30"), t, fmt)).toBe("30 Jun"));
});

describe("postedText", () => {
  it("a Date → 'Posted <locale date>'", () =>
    expect(postedText(new Date("2026-06-01"), t, fmt)).toBe(
      "Posted 1 June 2026",
    ));
  it("null → 'Posted recently'", () =>
    expect(postedText(null, t, fmt)).toBe("Posted recently"));
  it("parsePosted rejects an invalid ISO", () =>
    expect(parsePosted("nope")).toBeNull());
});

const card: JobCardDTO = {
  slug: "designer-role",
  title: "Brand Designer",
  company: { slug: "atelier-pulso", nameText: "Atelier Pulso" },
  category: "Arts & Culture",
  commitment: "Freelance",
  seniority: "Mid",
  format: "hybrid",
  location: "Lisbon",
  city: "Lisbon",
  timezone: null,
  pay: { ...basePay, salary: "€2k" },
  deadline: "2026-06-30",
  startDate: null,
  desc: "Make lovely things.",
  tags: ["figma", "brand"],
  queerRun: true,
  qrLabel: null,
  status: "open",
  createdAt: "2026-06-01",
};

describe("jobCardToJob", () => {
  it("maps card fields and derives cat slug + logo + qrLabel", () => {
    const job = jobCardToJob(card, t);
    expect(job.slug).toBe("designer-role");
    expect(job.organization).toBe("Atelier Pulso");
    expect(job.category).toBe("arts"); // "Arts & Culture" → first token
    expect(job.logo).toBe("AP");
    expect(job.qr).toBe(true);
    expect(job.qrLabel).toBe("Queer-run"); // derived from queerRun when null
    expect(job.salary).toBe("€2k");
    expect(job.deadline).toBeInstanceOf(Date);
    expect(deadlineText(job.deadline, t, fmt)).toBe("30 Jun");
    expect(job.detail.about).toEqual(["Make lovely things."]);
  });

  it("falls back to the title for the logo when company is null", () => {
    const job = jobCardToJob(
      { ...card, company: null, title: "Solo Studio" },
      t,
    );
    expect(job.organization).toBe("");
    expect(job.logo).toBe("SS");
    expect(job.qrLabel).toBe("Queer-run");
  });

  it("labels a non-queer-run listing Inclusive", () => {
    const job = jobCardToJob({ ...card, queerRun: false, qrLabel: null }, t);
    expect(job.qrLabel).toBe("Inclusive");
  });
});

describe("jobDetailToJob", () => {
  it("layers the full detail body over the card mapping", () => {
    const detail: JobDetailDTO = {
      ...card,
      detail: {
        about: ["Long about."],
        dayToDay: ["Standups"],
        lookingFor: ["Curiosity"],
        offer: ["Flexibility"],
        reviewerNote: "Vetted.",
      },
      benefits: [],
      inclusivity: [],
      screening: [],
      contacts: [],
      email: null,
      link: null,
      poster: null,
      isPoster: false,
      myApplicationStatus: null,
    };
    const job = jobDetailToJob(detail, t);
    expect(job.detail.about).toEqual(["Long about."]);
    expect(job.detail.dayToDay).toEqual(["Standups"]);
    expect(job.detail.reviewerNote).toBe("Vetted.");
  });
});

describe("postJobStateToCreateJobDto", () => {
  const company = {
    slug: "atelier-pulso",
    badges: [{ label: "Queer-run co-op" }],
  } as unknown as CompanyProfile;

  const state: PostJobState = {
    category: "Design & creative",
    commitment: "Freelance / gig",
    seniority: "Any level",
    format: "In-person (Lisbon)",
    city: "Porto",
    timezone: "No preference",
    title: "  Illustrator  ",
    description: "  Draw things.  ",
    deadline: "",
    startDate: "",
    currency: "€",
    rateMin: "500",
    rateMax: "",
    ratePer: "Month",
    hidePay: false,
    barter: false,
    benefits: [],
    inclusivity: [],
    tags: ["illustration"],
    screening: ["", "portfolio?"],
    contacts: ["Platform message"],
    email: "",
    link: "",
    agreed: true,
  };

  it("trims, maps the format, derives queerRun, and resolves the city", () => {
    const dto = postJobStateToCreateJobDto(state, company, "");
    expect(dto.title).toBe("Illustrator");
    expect(dto.description).toBe("Draw things.");
    expect(dto.format).toBe("in_person");
    expect(dto.location).toBe("Porto"); // in-person → uses city
    expect(dto.queerRun).toBe(true); // "Queer-run co-op" badge matches /queer/i
    expect(dto.qrLabel).toBe("Queer-run");
    expect(dto.rateMin).toBe(500);
    expect(dto.rateMax).toBeUndefined();
    expect(dto.timezone).toBeUndefined(); // "No preference" dropped
    expect(dto.screening).toEqual(["portfolio?"]); // blanks filtered
    expect(dto.companySlug).toBe("atelier-pulso");
    expect(dto.agreement).toBe(true);
  });

  it("uses the format string as location for remote roles and omits queerRun", () => {
    const remote = { ...state, format: "Remote", city: "" };
    const plain = { slug: "x", badges: [] } as unknown as CompanyProfile;
    const dto = postJobStateToCreateJobDto(remote, plain, "");
    expect(dto.format).toBe("remote");
    expect(dto.location).toBe("Remote");
    expect(dto.queerRun).toBe(false);
    expect(dto.qrLabel).toBeUndefined();
  });
});

describe("applicationToView", () => {
  it("normalizes the applicant ref and passes null through", () => {
    const dto: JobApplicationDTO = {
      id: "app-1",
      job: { slug: "designer-role", title: "Brand Designer" },
      applicant: {
        slug: "ines",
        firstName: "Inês",
        lastName: "Santos",
        avatarUrl: null,
      },
      answers: [{ question: "Why?", answer: "Because." }],
      coverNote: "Hi!",
      status: "submitted",
      createdAt: "2026-06-02",
    };
    const view = applicationToView(dto);
    expect(view.jobSlug).toBe("designer-role");
    expect(view.applicant?.name).toBe("Inês Santos");
    expect(view.applicant?.initials).toBe("IS");

    const anon = applicationToView({ ...dto, applicant: null });
    expect(anon.applicant).toBeNull();
  });
});
