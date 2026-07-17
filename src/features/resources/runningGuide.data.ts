export interface PaceGroup {
  nameKey: string;
  paceKey: string;
  whoKey: string;
}

export interface BringItem {
  titleKey: string;
  noteKey: string;
}

export const PACE_GROUPS: PaceGroup[] = [
  {
    nameKey: "resources:runningGuide.pace1.name",
    paceKey: "resources:runningGuide.pace1.pace",
    whoKey: "resources:runningGuide.pace1.who",
  },
  {
    nameKey: "resources:runningGuide.pace2.name",
    paceKey: "resources:runningGuide.pace2.pace",
    whoKey: "resources:runningGuide.pace2.who",
  },
  {
    nameKey: "resources:runningGuide.pace3.name",
    paceKey: "resources:runningGuide.pace3.pace",
    whoKey: "resources:runningGuide.pace3.who",
  },
];

export const BRING: BringItem[] = [
  {
    titleKey: "resources:runningGuide.bring1.title",
    noteKey: "resources:runningGuide.bring1.note",
  },
  {
    titleKey: "resources:runningGuide.bring2.title",
    noteKey: "resources:runningGuide.bring2.note",
  },
  {
    titleKey: "resources:runningGuide.bring3.title",
    noteKey: "resources:runningGuide.bring3.note",
  },
  {
    titleKey: "resources:runningGuide.bring4.title",
    noteKey: "resources:runningGuide.bring4.note",
  },
];
