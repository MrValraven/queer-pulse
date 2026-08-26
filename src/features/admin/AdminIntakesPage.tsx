import { useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminIntakesWaiting } from "./AdminIntakesWaiting";
import { AdminIntakesBrowse } from "./AdminIntakesBrowse";
import { AdminInquiriesBrowse } from "./AdminInquiriesBrowse";
import { useAdminIntakes } from "./api/useAdminIntakes";
import { useAdminInquiries } from "./api/useAdminInquiries";
import styles from "./AdminSubmissionList.module.css";

type ConsoleTab = "waiting" | "intakes" | "inquiries";

const TABS: ConsoleTab[] = ["waiting", "intakes", "inquiries"];

/**
 * The intake console (ACQ-03). Every generic intake form on the platform files
 * into one table, and every message sent through `/about/contact` files into
 * another; before this page, eleven of the twelve intake kinds and the whole
 * inquiry table had no reader at all. `/about/contact` is what the sign-in
 * page's "still stuck?" link, the under-18 notice and the request-invite
 * confirmation all point at, so those were the messages of people already
 * blocked.
 *
 * Three views. "Waiting" is the landing state and the only one that has to be
 * checked daily. "Intake forms" and "Inquiries" are the searchable archive
 * behind it, each filtered by kind and status server-side.
 *
 * Governance concerns keep their own page at `/admin/concerns`: they are
 * confidential and carry a richer worklist than the plain "somebody read this"
 * flip the other kinds need. They still appear in the waiting count here, as a
 * stub row that links across without repeating what was reported.
 *
 * QueerPulse sends no email. Every reply happens in a staff member's own inbox,
 * and this console says so rather than implying a send.
 */
export function AdminIntakesPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ConsoleTab>("waiting");

  // Both waiting queries run for the whole page: they are the landing view's
  // two lists AND the counts on the tab strip, so a filtered tab can never hide
  // the fact that something is waiting behind it.
  const waitingIntakes = useAdminIntakes({ kind: "all", status: "new" });
  const waitingInquiries = useAdminInquiries({ kind: "all", status: "new" });
  const waitingTotal = waitingIntakes.total + waitingInquiries.total;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminIntakes.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminIntakes.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminIntakes.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminIntakes.header.sub")}
        />
        <p className={styles.noEmailNote}>
          {t("admin:adminIntakes.header.noEmailNote")}
        </p>
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={TABS.map((value) => ({
            id: value,
            label: t(`admin:adminIntakes.tab.${value}`),
            count:
              value === "waiting"
                ? waitingTotal
                : value === "inquiries"
                  ? waitingInquiries.unhandledCount
                  : undefined,
          }))}
          active={tab}
          onChange={(value) => setTab(value as ConsoleTab)}
        />
      </FadeIn>

      <FadeIn delay={80}>
        {tab === "waiting" && (
          <AdminIntakesWaiting
            intakesQuery={waitingIntakes}
            inquiriesQuery={waitingInquiries}
          />
        )}
        {tab === "intakes" && <AdminIntakesBrowse />}
        {tab === "inquiries" && <AdminInquiriesBrowse />}
      </FadeIn>
    </AdminShell>
  );
}
