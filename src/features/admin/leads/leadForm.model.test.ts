import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { LeadDTO } from "./api/leads.types";
import {
  createLeadBodyOf,
  emptyLeadFormValues,
  isLeadFormDirty,
  leadFieldErrorOf,
  leadFormValuesOf,
  leadUpdateBodyOf,
  localLeadFieldError,
  localLeadRefusalOf,
  newLeadLinkRow,
  sentLinksOf,
  withLinkScheme,
} from "./leadForm.model";

function leadWith(overrides: Partial<LeadDTO> = {}): LeadDTO {
  return {
    id: "lead-1",
    name: "Lua Marques",
    type: "artist",
    stage: "in_talks",
    location: "Lisbon",
    email: "a@b.org",
    phone: null,
    links: ["https://instagram.com/lua.demo"],
    followUpOn: "2026-11-03",
    isFollowUpDue: true,
    linkedPersona: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-20T10:00:00.000Z",
    entries: [],
    ...overrides,
  };
}

function refusalWith(status: number, body: Record<string, unknown>): ApiError {
  return new ApiError(status, "Conflict", {
    statusCode: status,
    message: "Conflict",
    ...body,
  });
}

describe("leadForm.model", () => {
  it("adds https to a link typed without a scheme", () => {
    expect(withLinkScheme("instagram.com/a")).toBe("https://instagram.com/a");
    expect(withLinkScheme("HTTP://x.org")).toBe("HTTP://x.org");
    expect(withLinkScheme("  ")).toBe("");
    expect(withLinkScheme(" https://x.org ")).toBe("https://x.org");
  });

  it("gives every new link row its own key", () => {
    expect(newLeadLinkRow().rowKey).not.toBe(newLeadLinkRow().rowKey);
    expect(newLeadLinkRow("x.org").text).toBe("x.org");
  });

  it("starts the add form with no type and one empty link row", () => {
    const values = emptyLeadFormValues();
    expect(values.type).toBeNull();
    expect(values.stage).toBe("to_contact");
    expect(values.links.map((row) => row.text)).toEqual([""]);
  });

  it("maps a refused link index back to its row past blank rows", () => {
    const rows = [
      newLeadLinkRow(""),
      newLeadLinkRow("instagram.com/a"),
      newLeadLinkRow(" "),
      newLeadLinkRow("https://cave23.example"),
    ];
    const sent = sentLinksOf(rows);
    expect(sent.links).toEqual([
      "https://instagram.com/a",
      "https://cave23.example",
    ]);
    const refusal = new ApiError(409, "Conflict", {
      statusCode: 409,
      message: "Conflict",
      code: "LEAD_LINK_TAKEN",
      index: 1,
      leadId: "lead-2",
      leadName: "Cave 23",
    });
    expect(leadFieldErrorOf(refusal, sent)).toMatchObject({
      field: "links",
      rowIndex: 3,
      openLeadId: "lead-2",
      openLeadName: "Cave 23",
      values: { name: "Cave 23" },
    });
  });

  it("puts a link refusal under the whole list when no row matches", () => {
    const refusal = refusalWith(400, { code: "LEAD_LINK_INVALID", index: -1 });
    expect(leadFieldErrorOf(refusal, sentLinksOf([]))).toMatchObject({
      field: "links",
      rowIndex: null,
    });
  });

  it("sends only the fields that changed", () => {
    const lead = leadWith();
    const values = { ...leadFormValuesOf(lead), email: "" };
    expect(leadUpdateBodyOf(lead, values)).toEqual({ email: null });
  });

  it("sends the whole link list when one link changed", () => {
    const lead = leadWith();
    const values = {
      ...leadFormValuesOf(lead),
      links: [newLeadLinkRow("soundcloud.com/lua.demo")],
    };
    expect(leadUpdateBodyOf(lead, values)).toEqual({
      links: ["https://soundcloud.com/lua.demo"],
    });
  });

  it("treats an unchanged form as clean", () => {
    const lead = leadWith();
    const values = leadFormValuesOf(lead);
    expect(isLeadFormDirty(lead, values)).toBe(false);
    const withTrailingRow = {
      ...values,
      links: [...values.links, newLeadLinkRow()],
    };
    expect(isLeadFormDirty(lead, withTrailingRow)).toBe(false);
    expect(isLeadFormDirty(lead, { ...values, email: " A@B.org " })).toBe(
      false,
    );
    expect(isLeadFormDirty(lead, { ...values, followUpOn: null })).toBe(true);
  });

  it("reads repeated link rows as the one link the lead stores", () => {
    const lead = leadWith();
    const values = {
      ...leadFormValuesOf(lead),
      links: [
        newLeadLinkRow("https://instagram.com/lua.demo"),
        newLeadLinkRow("https://www.instagram.com/lua.demo/?igsh=1"),
      ],
    };
    expect(isLeadFormDirty(lead, values)).toBe(false);
    expect(leadUpdateBodyOf(lead, values)).not.toHaveProperty("links");
  });

  it("sends every row, repeats included, when the links changed", () => {
    const lead = leadWith();
    const values = {
      ...leadFormValuesOf(lead),
      links: [
        newLeadLinkRow("https://instagram.com/lua.demo"),
        newLeadLinkRow("https://instagram.com/lua.demo"),
        newLeadLinkRow("soundcloud.com/lua.demo"),
      ],
    };
    expect(leadUpdateBodyOf(lead, values)).toEqual({
      links: [
        "https://instagram.com/lua.demo",
        "https://instagram.com/lua.demo",
        "https://soundcloud.com/lua.demo",
      ],
    });
  });

  it("keeps an invalid link dirty so the server can name it", () => {
    const lead = leadWith();
    const values = {
      ...leadFormValuesOf(lead),
      links: [
        newLeadLinkRow("https://instagram.com/lua.demo"),
        newLeadLinkRow("https://"),
      ],
    };
    expect(isLeadFormDirty(lead, values)).toBe(true);
  });

  it("seeds one empty link row for a lead with no links", () => {
    const values = leadFormValuesOf(leadWith({ links: [] }));
    expect(values.links.map((row) => row.text)).toEqual([""]);
    expect(values.note).toBe("");
  });

  it("builds a create body with blanks sent as null", () => {
    const values = {
      ...emptyLeadFormValues(),
      name: " Nova Onda ",
      type: "band" as const,
      note: "  ",
    };
    expect(createLeadBodyOf(values)).toEqual({
      name: "Nova Onda",
      type: "band",
      stage: "to_contact",
      location: null,
      email: null,
      phone: null,
      links: [],
      followUpOn: null,
      note: null,
    });
  });

  it("refuses a blank name and a missing type before sending", () => {
    const values = emptyLeadFormValues();
    expect(localLeadRefusalOf({ ...values, name: "  ", type: "dj" })).toBe(
      "LEAD_NAME_REQUIRED",
    );
    expect(localLeadRefusalOf({ ...values, name: "Nova", type: null })).toBe(
      "LEAD_TYPE_INVALID",
    );
    expect(localLeadRefusalOf({ ...values, name: "Nova", type: "dj" })).toBe(
      null,
    );
    expect(localLeadFieldError("LEAD_NAME_REQUIRED")).toEqual({
      field: "name",
      rowIndex: null,
      messageKey: "admin:leads.error.nameRequired",
      values: {},
      openLeadId: null,
      openLeadName: null,
    });
  });

  it("puts a form-level refusal on no field", () => {
    expect(
      leadFieldErrorOf(refusalWith(404, { code: "LEAD_NOT_FOUND" })).field,
    ).toBeNull();
    expect(leadFieldErrorOf(new ApiError(500, "Server")).field).toBeNull();
  });

  it("names the other lead only on a taken refusal", () => {
    const takenEmail = leadFieldErrorOf(
      refusalWith(409, {
        code: "LEAD_EMAIL_TAKEN",
        leadId: "lead-4",
        leadName: "Cave 23",
      }),
    );
    expect(takenEmail).toMatchObject({
      field: "email",
      openLeadId: "lead-4",
      openLeadName: "Cave 23",
      messageKey: "admin:leads.error.emailTaken",
    });
    const invalidEmail = leadFieldErrorOf(
      refusalWith(400, { code: "LEAD_EMAIL_INVALID", leadId: "lead-4" }),
    );
    expect(invalidEmail.openLeadId).toBeNull();
  });
});
