import type { BadgeTone } from "../../shared/components/ui";
import type { MyReportEntry } from "./api/useMyReports";
import type { ReportSubjectType } from "./reportReasons";

/** `ReportDTO.status` (open/resolved/escalated, per `reports.api.ts`) → the
 *  shared `<Badge>` tone + a copy key. An unrecognised status still renders
 *  (falls back to `ghost`/a raw-key label) rather than throwing. */
export const REPORT_STATUS_TONE: Record<string, BadgeTone> = {
  open: "amber",
  resolved: "jade",
  escalated: "danger",
};

export const REPORT_STATUS_LABEL_KEY: Record<string, string> = {
  open: "safety:myReports.status.open",
  resolved: "safety:myReports.status.resolved",
  escalated: "safety:myReports.status.escalated",
};

/**
 * PRD-460: what kind of thing a filed report is about, shown as the first
 * item of `MyReportRow`'s meta line ("About a message · QPR-2026-4A1C ·
 * Filed 2 days ago"). i18n Pattern A. A full `Record` over `ReportSubjectType`
 * on purpose: a new subject type added to the union fails to compile here
 * until it has a label, so a missing case fails loudly at build time.
 *
 * Deliberately stays at "what kind of thing": naming the actual person or
 * post would need a server-resolved `subjectLabel` with its own privacy
 * rules (an erased author, hidden content), which is a follow-up.
 * Unlinked public-form filings (ENG-483) always carry `member` or `venue`
 * here, which reads true even with no linked account: "About a member" /
 * "About a place".
 */
export const REPORT_SUBJECT_LABEL_KEY: Record<ReportSubjectType, string> = {
  member: "safety:myReports.subject.member",
  post: "safety:myReports.subject.post",
  reply: "safety:myReports.subject.reply",
  venue: "safety:myReports.subject.venue",
  message: "safety:myReports.subject.message",
  community: "safety:myReports.subject.community",
  housing: "safety:myReports.subject.housing",
  flatmate: "safety:myReports.subject.flatmate",
  landlord: "safety:myReports.subject.landlord",
  listing: "safety:myReports.subject.listing",
  event: "safety:myReports.subject.event",
  business: "safety:myReports.subject.business",
  company: "safety:myReports.subject.company",
  job: "safety:myReports.subject.job",
  subprofile: "safety:myReports.subject.subprofile",
  review: "safety:myReports.subject.review",
  magazine_comment: "safety:myReports.subject.magazine_comment",
  listing_public_question: "safety:myReports.subject.listing_public_question",
  event_photo: "safety:myReports.subject.event_photo",
  landlord_recommendation: "safety:myReports.subject.landlord_recommendation",
  volunteering: "safety:myReports.subject.volunteering",
  conversation: "safety:myReports.subject.conversation",
  identity: "safety:myReports.subject.identity",
};

/** Demo-mode fallback for `useMyReports` — a few plausible entries so the page
 *  and the profile sheet both have something to render in the prototype. The
 *  references match the real `formatReportReference` shape (`QPR-<year>-<4 hex>`,
 *  backend `report-reference.ts`) so the demo teaches the format a member will
 *  actually be quoting back to the safety team. Dates stay RELATIVE here
 *  because the rows are about elapsed time ("filed 2 days ago"), which a
 *  hand-dated fixture would silently turn into "filed 8 months ago". */
export const DEMO_MY_REPORTS: MyReportEntry[] = [
  {
    id: "demo-report-1",
    reference: "QPR-2026-4A1C",
    subjectType: "post",
    reasonCode: "off_topic",
    status: "resolved",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-report-2",
    reference: "QPR-2026-7BE2",
    subjectType: "member",
    reasonCode: "unwanted_contact",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
];
