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
  // Renamed from `hearBack` when the status page shipped. The old step promised
  // a message that no service exists to send, and then told anyone without an
  // inside contact that quiet meant give up. The mechanism is now real and the
  // step describes it: they hold a code, and the answer appears on their own
  // status page.
  {
    titleKey: "auth:requestInvite.whatNext.checkBack.title",
    bodyKey: "auth:requestInvite.whatNext.checkBack.body",
  },
];
