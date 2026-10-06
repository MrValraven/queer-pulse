import { describe, expect, it } from "vitest";
import { FiShield, FiUsers } from "react-icons/fi";
import { createFormatters } from "../../../../shared/i18n/format";
import type {
  TFunction,
  TranslateOptions,
} from "../../../../shared/i18n/types";
import {
  dayLabel,
  findMemberLabel,
  groupByDay,
  localDayKey,
  toPlatformLogRow,
} from "./platformLog.adapters";
import type { PlatformLogEntryDTO } from "./platformLog.api";

const CATALOG: Record<string, string> = {
  "admin:platformLog.kind.mod.ban": "banned an account",
  "admin:platformLog.kind.mod.ban.target": "banned",
  "admin:platformLog.kind.generic.moderation": "took a moderation action",
  "admin:platformLog.kind.generic.moderation.target":
    "took a moderation action involving",
  "admin:platformLog.kind.settings.changed": "changed a platform setting",
  "admin:settings.key.registrationEnabled": "Registration",
  "admin:platformLog.kind.member.report_filed": "filed a report",
  "admin:platformLog.kind.member.report_filed_emergency":
    "filed an emergency report",
  "admin:platformLog.kind.governance.section_changed":
    "updated the {section} section of governance",
  "admin:platformLog.governanceSection.council": "Council",
  "admin:platformLog.party.anonymous": "Anonymous member",
  "admin:platformLog.party.erased": "Erased account",
  "admin:platformLog.party.system": "System",
  "admin:platformLog.subject.view": "View",
  "admin:platformLog.day.today": "Today",
  "admin:platformLog.day.yesterday": "Yesterday",
};

// Echoes the full key on a miss, like the real `t`.
const translate: TFunction = (key, options?: TranslateOptions) => {
  const template = CATALOG[key] ?? key;
  return Object.entries(options ?? {}).reduce(
    (text, [token, value]) => text.replace(`{${token}}`, String(value)),
    template,
  );
};

const fmt = createFormatters("en");

function entry(
  overrides: Partial<PlatformLogEntryDTO> = {},
): PlatformLogEntryDTO {
  return {
    id: "mod:row-1",
    occurredAt: "2026-10-05T12:00:00.123Z",
    category: "moderation",
    kind: "mod.ban",
    actor: { userId: "staff-1", name: "Júlia Saraiva", kind: "staff" },
    target: { userId: "member-1", name: "Bea Lopes", kind: "member" },
    subject: { label: "", route: "/admin/moderation" },
    params: {},
    note: "Repeated slurs.",
    ...overrides,
  };
}

describe("platform log adapters", () => {
  it("uses the with-target verb when the entry has a target", () => {
    const row = toPlatformLogRow(entry(), translate, fmt);
    expect(row.verb).toBe("banned");
    expect(row.icon).toBe(FiShield);
    expect(row.actor).toEqual({
      userId: "staff-1",
      label: "Júlia Saraiva",
      isFilterable: true,
    });
    expect(row.subject).toEqual({
      label: "View",
      to: "/admin/moderation",
      isFallback: true,
    });
  });

  it("uses the base verb without a target", () => {
    expect(toPlatformLogRow(entry({ target: null }), translate, fmt).verb).toBe(
      "banned an account",
    );
  });

  it("falls back to the category sentence for an unknown kind", () => {
    const withTarget = toPlatformLogRow(
      entry({ kind: "mod.brand_new_action" }),
      translate,
      fmt,
    );
    const withoutTarget = toPlatformLogRow(
      entry({ kind: "mod.brand_new_action", target: null }),
      translate,
      fmt,
    );
    expect(withTarget.verb).toBe("took a moderation action involving");
    expect(withoutTarget.verb).toBe("took a moderation action");
  });

  it("names a changed setting with the Settings History label", () => {
    const known = toPlatformLogRow(
      entry({
        category: "governance",
        kind: "settings.changed",
        target: null,
        params: { settingKey: "registrationEnabled" },
        subject: { label: "registrationEnabled", route: "/admin/settings" },
      }),
      translate,
      fmt,
    );
    const unknown = toPlatformLogRow(
      entry({
        category: "governance",
        kind: "settings.changed",
        target: null,
        params: { settingKey: "quietHoursEnabled" },
        subject: { label: "quietHoursEnabled", route: "/admin/settings" },
      }),
      translate,
      fmt,
    );
    expect(known.subject).toEqual({
      label: "Registration",
      to: "/admin/settings",
      isFallback: false,
    });
    expect(unknown.subject?.label).toBe("Quiet Hours Enabled");
  });

  it("labels anonymous, erased and system parties without making them filterable", () => {
    const anonymous = toPlatformLogRow(
      entry({ actor: { userId: null, name: "", kind: "anonymous" } }),
      translate,
      fmt,
    );
    const erased = toPlatformLogRow(
      entry({ actor: { userId: null, name: "", kind: "erased" } }),
      translate,
      fmt,
    );
    const system = toPlatformLogRow(
      entry({ actor: { userId: null, name: "", kind: "system" } }),
      translate,
      fmt,
    );
    expect(anonymous.actor).toEqual({
      userId: null,
      label: "Anonymous member",
      isFilterable: false,
    });
    expect(erased.actor.label).toBe("Erased account");
    expect(system.actor.label).toBe("System");
  });

  it("names an emergency report and localizes a governance section", () => {
    const report = toPlatformLogRow(
      entry({
        category: "members",
        kind: "member.report_filed",
        params: { severity: "emergency" },
        target: null,
      }),
      translate,
      fmt,
    );
    const governance = toPlatformLogRow(
      entry({
        category: "governance",
        kind: "governance.section_changed",
        params: { section: "council" },
        target: null,
      }),
      translate,
      fmt,
    );
    expect(report.verb).toBe("filed an emergency report");
    expect(report.icon).toBe(FiUsers);
    expect(governance.verb).toBe("updated the Council section of governance");
  });

  it("drops a subject with neither label nor route", () => {
    const row = toPlatformLogRow(
      entry({ subject: { label: "", route: null } }),
      translate,
      fmt,
    );
    expect(row.subject).toBeNull();
  });

  it("groups consecutive rows by local day and labels today and yesterday", () => {
    const now = new Date(2026, 9, 5, 15, 0);
    const today = toPlatformLogRow(
      entry({ id: "a", occurredAt: new Date(2026, 9, 5, 9).toISOString() }),
      translate,
      fmt,
    );
    const alsoToday = toPlatformLogRow(
      entry({ id: "b", occurredAt: new Date(2026, 9, 5, 8).toISOString() }),
      translate,
      fmt,
    );
    const yesterday = toPlatformLogRow(
      entry({ id: "c", occurredAt: new Date(2026, 9, 4, 20).toISOString() }),
      translate,
      fmt,
    );
    const groups = groupByDay([today, alsoToday, yesterday]);
    expect(yesterday.clockTime).toBe(fmt.time(new Date(2026, 9, 4, 20)));
    expect(groups.map((group) => group.rows.length)).toEqual([2, 1]);
    expect(dayLabel(localDayKey(now), now, translate, fmt)).toBe("Today");
    expect(dayLabel(groups[1]?.dayKey ?? "", now, translate, fmt)).toBe(
      "Yesterday",
    );
  });

  it("finds the filtered member's name as actor or target", () => {
    const rows = [toPlatformLogRow(entry(), translate, fmt)];
    expect(findMemberLabel(rows, "member-1")).toBe("Bea Lopes");
    expect(findMemberLabel(rows, "staff-1")).toBe("Júlia Saraiva");
    expect(findMemberLabel(rows, "nobody")).toBeNull();
  });
});
