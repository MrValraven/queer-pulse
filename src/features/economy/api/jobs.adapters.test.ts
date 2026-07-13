import { describe, expect, it } from "vitest";
import {
  applicationToView,
  formatDeadline,
  formatPay,
  formatPosted,
  jobCardToJob,
  jobDetailToJob,
  logoFromName,
  postJobStateToCreateJobDto,
} from "./jobs.adapters";
import type {
  JobApplicationDTO,
  JobCardDTO,
  JobDetailDTO,
  JobPay,
} from "./jobs.api";
import type { CompanyProfile } from "../companies.data";
import type { PostJobState } from "../usePostJobForm";

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
    expect(formatPay({ ...basePay, hidePay: true, barter: true })).toBe(
      "Barter / to discuss",
    );
  });
  it("hidePay without barter → Competitive", () => {
    expect(formatPay({ ...basePay, hidePay: true })).toBe("Competitive");
  });
  it("explicit salary string wins", () => {
    expect(formatPay({ ...basePay, salary: "€2,000/mo" })).toBe("€2,000/mo");
  });
  it("no rates + barter → Open to barter", () => {
    expect(formatPay({ ...basePay, barter: true })).toBe("Open to barter");
  });
  it("no rates, no barter → To discuss", () => {
    expect(formatPay(basePay)).toBe("To discuss");
  });
  it("a min/max range with currency and period", () => {
    expect(
      formatPay({
        ...basePay,
        rateMin: 20,
        rateMax: 40,
        currency: "£",
        ratePer: "Hour",
      }),
    ).toContain("£20–£40");
  });
  it("a single min rate with a To-discuss period drops the period", () => {
    expect(formatPay({ ...basePay, rateMin: 500, ratePer: "To discuss" })).toBe(
      "€500",
    );
  });
});

describe("formatDeadline", () => {
  it("null → Open", () => expect(formatDeadline(null)).toBe("Open"));
  it("invalid ISO → Open", () =>
    expect(formatDeadline("not-a-date")).toBe("Open"));
  it("valid ISO → day + short month", () =>
    expect(formatDeadline("2026-06-30")).toBe("30 Jun"));
});

describe("formatPosted", () => {
  it("valid ISO → 'Posted <long date>'", () =>
    expect(formatPosted("2026-06-01")).toBe("Posted 1 June 2026"));
  it("invalid ISO → 'Posted recently'", () =>
    expect(formatPosted("nope")).toBe("Posted recently"));
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
    const job = jobCardToJob(card);
    expect(job.slug).toBe("designer-role");
    expect(job.org).toBe("Atelier Pulso");
    expect(job.cat).toBe("arts"); // "Arts & Culture" → first token
    expect(job.logo).toBe("AP");
    expect(job.qr).toBe(true);
    expect(job.qrLabel).toBe("Queer-run"); // derived from queerRun when null
    expect(job.salary).toBe("€2k");
    expect(job.deadline).toBe("30 Jun");
    expect(job.detail.about).toEqual(["Make lovely things."]);
  });

  it("falls back to the title for the logo when company is null", () => {
    const job = jobCardToJob({ ...card, company: null, title: "Solo Studio" });
    expect(job.org).toBe("");
    expect(job.logo).toBe("SS");
    expect(job.qrLabel).toBe("Queer-run");
  });

  it("labels a non-queer-run listing Inclusive", () => {
    const job = jobCardToJob({ ...card, queerRun: false, qrLabel: null });
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
    const job = jobDetailToJob(detail);
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
