import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { FadeIn } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import {
  findMemberLabel,
  toPlatformLogRow,
  type PlatformLogPartyView,
} from "./api/platformLog.adapters";
import { usePlatformLog } from "./api/usePlatformLog";
import { PlatformLogFilterBar } from "./PlatformLogFilterBar";
import { PlatformLogList } from "./PlatformLogList";
import {
  readPlatformLogFilters,
  writePlatformLogFilters,
  type PlatformLogFilters,
} from "./platformLogFilters";
import { rowForViewer } from "./platformLogViewer";

const NO_FILTERS: PlatformLogFilters = {
  categories: [],
  range: "all",
  memberId: null,
};

interface PickedMember {
  userId: string;
  label: string;
}

/**
 * `/admin/log`: every staff action plus the member events the platform
 * already keeps as public record. Moderators reach it too; the server limits
 * them to staff actions, and the Members chip is hidden for them here.
 */
export function AdminPlatformLogPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { role, staffRoles } = useAuth();
  const { demoMode } = useDemoMode();
  const isAdmin = demoMode || role === "admin";
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => readPlatformLogFilters(searchParams, isAdmin),
    [searchParams, isAdmin],
  );
  const query = usePlatformLog(filters, isAdmin);
  const memberId = filters.memberId;
  const rows = useMemo(() => {
    const viewer = { isAdmin, staffRoles, memberId };
    return (query.data?.pages ?? [])
      .flatMap((page) => page.data)
      .map((entry) => rowForViewer(toPlatformLogRow(entry, t, fmt), viewer));
  }, [query.data, t, fmt, isAdmin, staffRoles, memberId]);
  // The name clicked in a row, so the member chip can say who it filters by
  // while the narrowed log is still loading.
  const [pickedMember, setPickedMember] = useState<PickedMember | null>(null);
  const memberChipRef = useRef<HTMLSpanElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const shouldFocusMemberChipRef = useRef(false);
  const memberName = memberId
    ? (findMemberLabel(rows, memberId) ??
      (pickedMember?.userId === memberId ? pickedMember.label : null))
    : null;

  // Picking a name swaps the list for a skeleton, which unmounts the button
  // that held focus. Focus lands on the new member chip instead.
  useEffect(() => {
    if (!shouldFocusMemberChipRef.current || !memberId) return;
    shouldFocusMemberChipRef.current = false;
    memberChipRef.current?.focus();
  }, [memberId]);

  const updateFilters = (next: PlatformLogFilters) => {
    setSearchParams(writePlatformLogFilters(next));
  };

  const filterByMember = (party: PlatformLogPartyView) => {
    if (!party.userId || party.userId === memberId) return;
    setPickedMember({ userId: party.userId, label: party.label });
    shouldFocusMemberChipRef.current = true;
    updateFilters({ ...filters, memberId: party.userId });
  };

  const hasActiveFilters =
    filters.categories.length > 0 || filters.range !== "all" || !!memberId;
  const clearFilters = () => {
    // The empty state's button unmounts once the wider log starts loading.
    filterBarRef.current?.focus();
    updateFilters(NO_FILTERS);
  };

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:platformLog.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:platformLog.eyebrow")}
          title={
            <Translation
              i18nKey="admin:platformLog.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={
            <Translation
              i18nKey="admin:dashboard.feed.transparency"
              components={{ strong: <b /> }}
            />
          }
        />
      </FadeIn>
      <FadeIn delay={60}>
        <PlatformLogFilterBar
          filters={filters}
          isAdmin={isAdmin}
          memberName={memberName}
          memberChipRef={memberChipRef}
          filterBarRef={filterBarRef}
          onChange={updateFilters}
        />
      </FadeIn>
      <PlatformLogList
        rows={rows}
        query={query}
        onFilterMember={filterByMember}
        onClearFilters={hasActiveFilters ? clearFilters : undefined}
      />
    </AdminShell>
  );
}
