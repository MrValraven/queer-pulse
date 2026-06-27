import type { ReactNode } from "react";

export type Cat = "active" | "offer" | "closed" | "draft";
export type StageState = "" | "done" | "active" | "rejected";
export type BadgeKind =
  | "in-review"
  | "interview"
  | "offer"
  | "rejected"
  | "draft"
  | "attention";
export type LogoTint = "" | "jade" | "plum" | "draft";
export type AvatarTint = "coral" | "jade" | "plum";

export type ActionKind =
  | "message"
  | "followup"
  | "conversation"
  | "calendar"
  | "company"
  | "submission"
  | "note"
  | "negotiate"
  | "resume"
  | "offer"
  | "withdraw";

export interface Stage {
  label: string;
  state: StageState;
  /** Plain-language explanation of what this stage means + what happens next. */
  hint?: string;
}
export interface Action {
  label: string;
  kind: ActionKind;
  /** Renders as a quiet text link rather than the primary pill button. */
  muted?: boolean;
  /** Primary action uses a solid (vs outlined) button — for the key decision. */
  solid?: boolean;
}
export interface Recruiter {
  name: string;
  role: string;
  initials: string;
  tint: AvatarTint;
}
export interface SubmissionInfo {
  date: string;
  role: string;
  coverLetter: string;
  attachments: string[];
  answers: { q: string; a: string }[];
}
export interface CompanyInfo {
  about: string;
  size: string;
  sector: string;
  verified: number;
  location: string;
}
export interface NoteInfo {
  from: string;
  body: string;
}
export interface InterviewInfo {
  title: string;
  when: string;
  durationMin: number;
  location: string;
  attendees: string[];
  notes: string;
}
export interface OfferInfo {
  salary: string;
  holiday: string;
  start: string;
  respondBy: string;
  terms: string[];
  /** What comparable roles pay — your leverage in the conversation. */
  market: string;
}
export interface DraftInfo {
  percent: number;
  deadline: string;
  done: string[];
  remaining: string[];
}

/** One entry in the conversation history: a message either way, or a process event. */
export interface ThreadEntry {
  from: "you" | "them" | "system";
  name?: string;
  when: string;
  text: string;
}

export interface Application {
  id: string;
  cat: Cat;
  logo: string;
  logoTint: LogoTint;
  title: string;
  company: ReactNode;
  companyName: string;
  meta: string[];
  stages: Stage[];
  status: ReactNode;
  badge: { kind: BadgeKind; label: string; pulse?: boolean };
  actions: Action[];
  /** Card-level emphasis: a positive offer, or an overdue review that needs a nudge. */
  accent?: "offer" | "overdue";
  /** A decision-driving date, rendered as its own chip (coral when urgent). */
  deadline?: { text: string; urgent?: boolean };
  /** Conversation + process history shown in the message modal. */
  thread?: ThreadEntry[];
  recruiter?: Recruiter;
  submission?: SubmissionInfo;
  companyInfo?: CompanyInfo;
  note?: NoteInfo;
  interview?: InterviewInfo;
  offer?: OfferInfo;
  draft?: DraftInfo;
}

export interface NegotiationAngle {
  id: string;
  name: string;
  blurb: string;
  draft: string;
}
