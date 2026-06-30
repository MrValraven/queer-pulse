export interface MatrixRow {
  label: string;
  sub: string;
  app: boolean;
  email: boolean;
  push: boolean;
}

export const MATRIX_ROWS: MatrixRow[] = [
  {
    label: "Direct message received",
    sub: "Someone sends you a DM",
    app: true,
    email: true,
    push: true,
  },
  {
    label: "Forum reply to your post",
    sub: "Someone replies to a thread you started",
    app: true,
    email: false,
    push: true,
  },
  {
    label: "Forum mention",
    sub: "Someone uses @yourname in a post",
    app: true,
    email: false,
    push: true,
  },
  {
    label: "Event RSVP reminder",
    sub: "24h before an event you've signed up for",
    app: true,
    email: true,
    push: false,
  },
  {
    label: "New event in your area",
    sub: "Events matching your interests",
    app: true,
    email: false,
    push: false,
  },
  {
    label: "Magazine new issue",
    sub: "When the monthly issue goes live",
    app: false,
    email: true,
    push: false,
  },
  {
    label: "Connection request",
    sub: "A member wants to connect with you",
    app: true,
    email: false,
    push: false,
  },
  {
    label: "Mental health fund update",
    sub: "If you're using the fund, status changes",
    app: true,
    email: true,
    push: false,
  },
];
