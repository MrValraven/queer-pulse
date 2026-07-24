// Response shapes shared with the web client (the typed SDK target, docs/backend/24).
// Request DTOs with validation live in apps/api; these are the plain output types.

import type {
  CommunityType,
  ConnectionState,
  ReportStatus,
  RsvpStatus,
  SubmissionStatus,
  Visibility,
} from "./enums";

export type ReportSubjectType =
  | "user"
  | "profile"
  | "community_post"
  | "forum_post"
  | "message"
  | "gathering"
  | "article";

export interface ReportResponse {
  id: string;
  subjectType: ReportSubjectType;
  subjectId: string;
  reason: string;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
}

export type AppealStatus = "open" | "upheld" | "overturned";

export interface AppealResponse {
  id: string;
  reportId: string | null;
  body: string;
  status: AppealStatus;
  decision: string | null;
  createdAt: string;
}

export interface PageInfo {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Paginated<T> {
  data: T[];
  pageInfo: PageInfo;
}

export interface ProfileResponse {
  handle: string;
  displayName: string;
  pronouns: string | null;
  bio: string | null;
  avatarUrl: string | null;
  neighbourhood: string | null;
  interests: string[];
  visibility: Visibility;
  isVerified: boolean;
}

export interface SessionResponse {
  id: string;
  deviceLabel: string | null;
  userAgent: string;
  current: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface InviteResponse {
  id: string;
  code: string;
  email: string | null;
  maxUses: number;
  uses: number;
  expiresAt: string;
  revokedAt: string | null;
}

export interface ConnectionResponse {
  id: string;
  state: ConnectionState;
  direction: "incoming" | "outgoing";
  profile: ProfileResponse;
  createdAt: string;
  respondedAt: string | null;
}

export type CommunityMembershipState = "active" | "pending" | "left" | null;

export interface CommunitySummary {
  slug: string;
  name: string;
  description: string;
  type: CommunityType;
  visibility: Visibility;
  isLowVisibility: boolean;
  requiresApproval: boolean;
  membershipState: CommunityMembershipState;
  memberCount: number | null;
}

export interface AuthorSummary {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface CommunityPostResponse {
  id: string;
  body: string;
  author: AuthorSummary;
  replyCount: number;
  voteCount: number;
  createdAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  body: string;
  sender: AuthorSummary;
  createdAt: string;
}

export interface ConversationResponse {
  id: string;
  type: "dm" | "group";
  otherParticipant: AuthorSummary | null;
  lastMessage: MessageResponse | null;
  unreadCount: number;
  updatedAt: string;
}

export interface GatheringResponse {
  id: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  host: AuthorSummary | null;
  neighbourhood: string;
  venueName: string | null;
  /** Only present for the host or a confirmed (going) attendee. */
  addressPrivate: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number;
  rsvpCount: number;
  spotsLeft: number | null;
  isCancelled: boolean;
  isFree: boolean;
  priceCents: number;
  slidingScale: boolean;
  priceMinCents: number;
  visibility: Visibility;
  myRsvpStatus: RsvpStatus | null;
}

/** RSVP result. `clientSecret` is present when a Stripe payment must be completed. */
export interface RsvpResult {
  status: RsvpStatus;
  ticketCode: string | null;
  clientSecret: string | null;
}

// --- Magazine ---

export interface AuthorResponse {
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface IssueResponse {
  number: string;
  title: string;
  dek: string;
  publishedOn: string;
  coverUrl: string | null;
}

export interface ArticleListItem {
  slug: string;
  title: string;
  dek: string;
  author: AuthorSummary;
  issueNumber: string | null;
  tags: string[];
  readMinutes: number;
  publishedAt: string | null;
}

export interface ArticleResponse extends ArticleListItem {
  body: string;
}

export interface StorySubmissionResponse {
  id: string;
  format: string;
  workingTitle: string;
  pitch: string;
  status: SubmissionStatus;
  createdAt: string;
}

// --- Forum ---

export interface ForumThreadResponse {
  id: string;
  slug: string;
  title: string;
  author: AuthorSummary;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  canEdit: boolean;
}

export interface ForumPostResponse {
  id: string;
  threadId: string;
  author: AuthorSummary;
  body: string;
  voteCount: number;
  myVote: number;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
}

export interface ForumPostHistoryEntry {
  id: string;
  previousBody: string;
  previousTitle: string | null;
  author: AuthorSummary;
  createdAt: string;
}

export interface ForumPostHistoryResponse {
  revisions: ForumPostHistoryEntry[];
}

// --- Content / CMS ---

export interface PageResponse {
  slug: string;
  title: string;
  body: string;
  locale: string;
  publishedAt: string | null;
}

export interface PartnerResponse {
  slug: string;
  name: string;
  description: string;
  url: string | null;
  tier: string | null;
}

// --- Topics (hashtag directory + per-topic post feed) ---

export interface TopicResponse {
  tag: string;
  label: string;
  description: string;
  totalPosts: number;
}

export interface RelatedTopicResponse {
  tag: string;
  count: number;
}

export interface TopicDetailResponse extends TopicResponse {
  followerCount: number;
  postsThisWeek: number;
  relatedTopics: RelatedTopicResponse[];
}

export interface TopicPostResponse {
  id: string;
  topicId: string;
  author: string;
  authorInitials: string;
  authorTone: string;
  contextLabel: string | null;
  kind: string;
  category: string;
  title: string;
  body: string;
  reactionCount: number;
  reactionLabel: string;
  replyCount: number;
  replyLabel: string | null;
  tags: string[];
  href: string;
  createdAt: string;
}

// --- Resources ---

export interface ResourceResponse {
  slug: string;
  category: string;
  title: string;
  description: string;
  body: string;
  externalUrl: string | null;
}

export interface GlossaryTermResponse {
  slug: string;
  term: string;
  definition: string;
  category: string | null;
}

// --- Feed (read-time aggregation) ---

/** `new_member` backs the "People" tab: a recently-joined active member,
 *  surfaced by `NewMemberCard`. It carries no fields beyond the shared
 *  `FeedItem` shape — see the field mapping below. */
export type FeedItemType =
  "community_post" | "forum_thread" | "gathering" | "new_member";

/**
 * For `type: "new_member"`: `actor` is the member who joined (handle/
 * displayName/avatarUrl), `title` is their display name, `summary` is their
 * tagline/short bio (may be empty), `link` is their profile path, and
 * `createdAt` is when they joined. No dedicated fields were added — pronouns/
 * neighbourhood/interest chips shown by the demo `NewMemberCard` mock aren't
 * part of the aggregate and are simply omitted for live `new_member` items.
 */
export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  title: string;
  summary: string;
  link: string;
  actor: AuthorSummary | null;
}

// --- Media ---

export type MediaKind = "image" | "audio" | "video" | "pdf" | "doc";

export interface MediaUploadTicket {
  mediaId: string;
  uploadUrl: string;
  storageKey: string;
}

export interface MediaAssetResponse {
  id: string;
  kind: MediaKind;
  url: string | null;
  processingState: "pending" | "ready" | "failed";
}

// --- Search ---

export type SearchType = "member" | "gathering" | "community" | "article";

export interface SearchHit {
  type: SearchType;
  id: string;
  title: string;
  snippet: string;
  link: string;
}

export interface SearchResults {
  query: string;
  hits: SearchHit[];
}

// --- Settings / GDPR ---

export interface UserSettingsResponse {
  notifications: Record<string, boolean>;
  accessibility: Record<string, unknown>;
  privacy: Record<string, unknown>;
  locale: string;
}

export interface ConsentResponse {
  purpose: string;
  granted: boolean;
  policyVersion: string;
  updatedAt: string;
}

export interface DataExportResponse {
  generatedAt: string;
  data: Record<string, unknown>;
}

export interface DeletionRequestResponse {
  state: "scheduled" | "cancelled" | "completed";
  scheduledFor: string;
}
