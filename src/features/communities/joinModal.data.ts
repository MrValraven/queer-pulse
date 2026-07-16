/**
 * i18n Pattern A — chrome list (join-flow involvement options), sole
 * consumer is `JoinModalSteps.tsx`. `value` is the stable stored enum id;
 * `labelKey`/`descKey` resolve through `t()` at render.
 */
export const INVOLVEMENT = [
  {
    value: "updates",
    labelKey: "communities:join.involvement.updates.label",
    descKey: "communities:join.involvement.updates.desc",
  },
  {
    value: "active",
    labelKey: "communities:join.involvement.active.label",
    descKey: "communities:join.involvement.active.desc",
  },
  {
    value: "organise",
    labelKey: "communities:join.involvement.organise.label",
    descKey: "communities:join.involvement.organise.desc",
  },
];
