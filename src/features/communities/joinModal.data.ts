/**
 * i18n Pattern A — chrome list (join-flow involvement options), sole
 * consumer is `JoinModalSteps.tsx`. `value` is the stable stored enum id;
 * `labelKey`/`descriptionKey` resolve through `t()` at render.
 */
export const INVOLVEMENT = [
  {
    value: "updates",
    labelKey: "communities:join.involvement.updates.label",
    descriptionKey: "communities:join.involvement.updates.desc",
  },
  {
    value: "active",
    labelKey: "communities:join.involvement.active.label",
    descriptionKey: "communities:join.involvement.active.desc",
  },
  {
    value: "organise",
    labelKey: "communities:join.involvement.organise.label",
    descriptionKey: "communities:join.involvement.organise.desc",
  },
];
