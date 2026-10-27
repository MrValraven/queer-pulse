export interface ReportTipRow {
  id: string;
  label: string;
  color: string;
  value: number;
}

export interface ReportTip {
  weekLabel: string;
  rows: ReportTipRow[];
  total: number;
}
