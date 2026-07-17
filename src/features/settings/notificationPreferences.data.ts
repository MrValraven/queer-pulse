export interface MatrixRow {
  id: string;
  labelKey: string;
  subKey: string;
  app: boolean;
  email: boolean;
  push: boolean;
}

export const MATRIX_ROWS: MatrixRow[] = [
  {
    id: "dm",
    labelKey: "settings:notifPrefs.row.dm.label",
    subKey: "settings:notifPrefs.row.dm.sub",
    app: true,
    email: true,
    push: true,
  },
  {
    id: "forumReply",
    labelKey: "settings:notifPrefs.row.forumReply.label",
    subKey: "settings:notifPrefs.row.forumReply.sub",
    app: true,
    email: false,
    push: true,
  },
  {
    id: "forumMention",
    labelKey: "settings:notifPrefs.row.forumMention.label",
    subKey: "settings:notifPrefs.row.forumMention.sub",
    app: true,
    email: false,
    push: true,
  },
  {
    id: "rsvpReminder",
    labelKey: "settings:notifPrefs.row.rsvpReminder.label",
    subKey: "settings:notifPrefs.row.rsvpReminder.sub",
    app: true,
    email: true,
    push: false,
  },
  {
    id: "newEvent",
    labelKey: "settings:notifPrefs.row.newEvent.label",
    subKey: "settings:notifPrefs.row.newEvent.sub",
    app: true,
    email: false,
    push: false,
  },
  {
    id: "magazineIssue",
    labelKey: "settings:notifPrefs.row.magazineIssue.label",
    subKey: "settings:notifPrefs.row.magazineIssue.sub",
    app: false,
    email: true,
    push: false,
  },
  {
    id: "connectionRequest",
    labelKey: "settings:notifPrefs.row.connectionRequest.label",
    subKey: "settings:notifPrefs.row.connectionRequest.sub",
    app: true,
    email: false,
    push: false,
  },
  {
    id: "mentalHealthFund",
    labelKey: "settings:notifPrefs.row.mentalHealthFund.label",
    subKey: "settings:notifPrefs.row.mentalHealthFund.sub",
    app: true,
    email: true,
    push: false,
  },
];

export const ALWAYS_ON: { id: string; titleKey: string; descKey: string }[] = [
  {
    id: "securityAlerts",
    titleKey: "settings:notifPrefs.alwaysOn.securityAlerts.title",
    descKey: "settings:notifPrefs.alwaysOn.securityAlerts.desc",
  },
  {
    id: "dataExportReady",
    titleKey: "settings:notifPrefs.alwaysOn.dataExportReady.title",
    descKey: "settings:notifPrefs.alwaysOn.dataExportReady.desc",
  },
  {
    id: "moderationDecisions",
    titleKey: "settings:notifPrefs.alwaysOn.moderationDecisions.title",
    descKey: "settings:notifPrefs.alwaysOn.moderationDecisions.desc",
  },
];
