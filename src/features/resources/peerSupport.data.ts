export interface PeerStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

/** i18n Pattern A — platform-authored guidance chrome, resolved via `t()`. */
export const WHAT_IT_IS_KEYS = [
  "resources:peerSupport.what.p1",
  "resources:peerSupport.what.p2",
];

/** i18n Pattern A — `n` is the stable display number; `titleKey`/`bodyKey` resolve via `t()`. */
export const STEPS: PeerStep[] = [
  {
    n: "01",
    titleKey: "resources:peerSupport.step.01.title",
    bodyKey: "resources:peerSupport.step.01.body",
  },
  {
    n: "02",
    titleKey: "resources:peerSupport.step.02.title",
    bodyKey: "resources:peerSupport.step.02.body",
  },
  {
    n: "03",
    titleKey: "resources:peerSupport.step.03.title",
    bodyKey: "resources:peerSupport.step.03.body",
  },
  {
    n: "04",
    titleKey: "resources:peerSupport.step.04.title",
    bodyKey: "resources:peerSupport.step.04.body",
  },
];
