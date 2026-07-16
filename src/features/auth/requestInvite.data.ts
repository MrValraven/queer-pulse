/**
 * "What happens next" reassurance shown on the request-invite confirmation.
 * i18n Pattern A — chrome, keyed for the component to resolve via `t()`.
 */
export interface NextStep {
  titleKey: string;
  bodyKey: string;
}

export const WHAT_NEXT: NextStep[] = [
  {
    titleKey: "auth:requestInvite.whatNext.readsIt.title",
    bodyKey: "auth:requestInvite.whatNext.readsIt.body",
  },
  {
    titleKey: "auth:requestInvite.whatNext.connection.title",
    bodyKey: "auth:requestInvite.whatNext.connection.body",
  },
  {
    titleKey: "auth:requestInvite.whatNext.hearBack.title",
    bodyKey: "auth:requestInvite.whatNext.hearBack.body",
  },
];
