/**
 * Static EN/PT push-copy catalog, bundled straight into the service worker
 * (imported statically by `sw.ts`, same as `pushPayload.ts`). It stays out of
 * the app's lazy i18n chunks, because those aren't reachable from a worker
 * context. Keep this small: only strings a push notification renders.
 *
 * The backend stays language-neutral (see the push-notifications-expansion
 * design doc): a sender attaches an opaque `l10n.titleKey`/`bodyKey` + params,
 * and `formatPushCopy` resolves them here in the recipient's language, falling
 * back to the payload's plain `title`/`body` (the English string every sender
 * still sets) when the key/lang can't be resolved. iOS renders the plain
 * fallback directly and never sees this catalog.
 */

export type PushLang = "en" | "pt";

/** Mirrors `src/shared/i18n/translate.ts`'s `{token}` interpolation exactly. */
const INTERPOLATION = /\{(\w+)\}/g;

/** Matches a still-unresolved `{token}` left over after interpolation. */
const UNRESOLVED_TOKEN = /\{\w+\}/;

/**
 * Task 22: a business reply's push names the staff member who wrote it,
 * beside the business, when both attribution switches allow it
 * (`push.listener.ts:477-533`).
 */
export const STAFF_TITLE_KEY = "push:messages.staffTitle";

/**
 * ENG-414: the event reminder's "view" action button label. LOCKSTEP with
 * the backend sender (`queerpulse-backend/src/events/event-reminders.service.ts`),
 * which sets it as the action's `titleKey`.
 */
export const EVENT_REMINDER_ACTION_DETAILS_KEY =
  "push:event.reminder.actionDetails";

const en: Record<string, string> = {
  "push:event.reminder.body": "Starting soon. Tap to see the details.",
  // ENG-414: the reminder's "view" action button. The sender sets the English
  // `title` plus this `titleKey`; sw.ts localises the button from it.
  [EVENT_REMINDER_ACTION_DETAILS_KEY]: "Details",
  "push:messages.coalesced": "{count} new messages from {name}",
  [STAFF_TITLE_KEY]: "{name} from {business}",
  // PRD-333: a group burst names the group, since its senders differ.
  "push:messages.coalescedGroup": "{count} new messages in {group}",
  // ENG-227: attachment-only messages. The server picks the key from the
  // message kind, so the recipient reads the kind in their own language.
  "push:messages.attachment.photo": "Photo",
  "push:messages.attachment.gif": "GIF",
  "push:messages.attachment.document": "Document",
  "push:messages.attachment.sticker": "Sticker",
  "push:messages.group.attachment.photo": "{name}: Photo",
  "push:messages.group.attachment.gif": "{name}: GIF",
  "push:messages.group.attachment.document": "{name}: Document",
  "push:messages.group.attachment.sticker": "{name}: Sticker",
  // PRD-336: a group message that also `@`-mentions the recipient gets
  // exactly one push. This is that push's body, folding "you were mentioned"
  // and the message itself into one line. `{preview}` carries the message
  // text verbatim (already in whichever language the sender typed it), so
  // only the surrounding phrase is translated.
  "push:messages.group.mention.body": "{name} mentioned you: {preview}",
  "push:messages.group.mention.photo": "{name} mentioned you: Photo",
  "push:messages.group.mention.gif": "{name} mentioned you: GIF",
  "push:messages.group.mention.document": "{name} mentioned you: Document",
  "push:messages.group.mention.sticker": "{name} mentioned you: Sticker",
  "push:test.title": "Test notification",
  "push:test.body": "This is a test. Your notifications are working.",
  "push:connection.request.title": "New connection request",
  "push:connection.request.body": "{name} wants to connect with you.",
  "push:connection.accepted.title": "Connection accepted",
  "push:connection.accepted.body": "{name} accepted your connection request.",
  "push:mention.title": "You were mentioned",
  "push:mention.body": "{name} mentioned you.",
  "push:forumReply.title": "New reply",
  "push:forumReply.body": "{name} replied to you.",
  // ENG-413: the moderation verdict on a thread the member wrote. `{title}`
  // is the thread's own title. Word-for-word identical to the English
  // fallbacks in `PushNotificationListener.pushForumThreadReviewed`, since
  // iOS renders that fallback directly and never reads this catalog.
  "push:forumThreadReviewed.approved.title": "Your thread is live",
  "push:forumThreadReviewed.approved.body": "{title} is on the forum now.",
  "push:forumThreadReviewed.rejected.title": "About your thread",
  "push:forumThreadReviewed.rejected.body":
    "{title} was not published. Tap to read why.",
  "push:vouch.received.title": "You received a vouch",
  "push:vouch.received.body": "{name} vouched for you.",
  "push:event.updated.title": "Event updated",
  "push:event.updated.body":
    "{event} has new details. Tap to see what changed.",
  "push:event.cancelled.title": "Event cancelled",
  "push:event.cancelled.body": "{event} has been cancelled.",
  // ENG-141: a series cancellation is ONE message covering every date it took
  // off the calendar. Cancelling a weekly group thirty weeks out used to send
  // thirty separate pushes in a burst, one per occurrence.
  //
  // TWO KEYS, because this catalog is the service worker's and has no CLDR
  // plural support: `formatPushCopy` does plain `{token}` interpolation, so a
  // single "{count} later dates" string renders "1 later dates" for a
  // two-date series. The SENDER picks the key; it is the side that knows the
  // count. The singular drops the number entirely, since "1" says nothing the
  // word "next" does not.
  "push:event.cancelled.seriesBodyOne":
    "{event} has been cancelled, and so has the next date.",
  "push:event.cancelled.seriesBody":
    "{event} has been cancelled, and so have the next {count} dates.",
  "push:safeSpace.vouch.title": "New vouch for your safe space",
  "push:safeSpace.vouch.body": "{name} vouched for {space}.",
  "push:housing.match.title": "A home matches your search",
  "push:housing.match.body": "{title} in {area} matches a search you saved.",
  "push:housing.match.bodyNoArea": "{title} matches a search you saved.",
  "push:topic.newPost.title": "New post in a topic you follow",
  "push:topic.newPost.body": "{name} posted in #{topic}.",
  // PRD-208: a persona you follow published something.
  //
  // NAMES THE PERSONA, NEVER ITS OWNER. A persona is pseudonymous, and the
  // whole point of an unlinked one is that the human behind it is not
  // discoverable from it. `{persona}` is the persona's own public display
  // name; there is no actor, no avatar and no member name anywhere in this
  // path, and the sender deliberately carries no user id for this type.
  //
  // These three MUST stay word-for-word identical to the English fallbacks in
  // `PushNotificationListener.pushPersonaUpdate`, because iOS renders the
  // fallback directly and never reads this catalog. A divergence here means
  // the same notification reads differently depending on the phone.
  "push:personaUpdate.title": "New work from a persona you follow",
  "push:personaUpdate.body": "{persona} published something new.",
  "push:personaUpdate.bodyWithTitle": "{persona} published {itemTitle}.",
  // Shown INSTEAD of the real title/body when the member has turned on
  // "hide previews" (see pushPrivacy.ts). Says something arrived without
  // naming who it is from or what it said.
  "push:preview.hidden.title": "QueerPulse",
  "push:preview.hidden.body": "You have a new notification.",
  // The DM variant. "A message" is the most this can narrow without leaking:
  // it tells the member whether to unlock now, and tells a bystander only that
  // this platform has messages in it.
  "push:preview.hidden.message": "You have a new message.",
  // ENG-229: the same generic copy for a burst, so hiding previews keeps the
  // count and still names nobody.
  "push:preview.hidden.messages": "{count} new messages.",

  // ── Decisions on something the member submitted ───────────────────────────
  // The housing review queue (LOC-01) and the four approval queues (LOC-19).
  // Each of these is the platform's answer to a member's own submission, so
  // the copy names the thing they submitted and never leaves them guessing.
  "push:housing.decision.approved.title": "Your home is live",
  "push:housing.decision.approved.body": "{title} is now on the housing board.",
  "push:housing.decision.changesRequested.title": "Your listing needs a change",
  "push:housing.decision.changesRequested.body":
    "A moderator asked for a change to {title}. Open it to see what.",
  "push:housing.decision.rejected.title": "Your listing was not published",
  "push:housing.decision.rejected.body":
    "{title} was not published. Open it to see why.",
  "push:housing.decision.takenDown.title": "Your listing was removed",
  "push:housing.decision.takenDown.body":
    "{title} was removed from the housing board. Open it to see why.",
  "push:readingGroupProposal.approved.title": "Your reading group is live",
  "push:readingGroupProposal.approved.body":
    "{book} has its own space now, and you own it.",
  "push:readingGroupProposal.declined.title":
    "About your reading group proposal",
  "push:readingGroupProposal.declined.body":
    "We could not take {book} forward. Tap to read why.",
  "push:groupListing.live.title": "Your listing is live",
  "push:groupListing.live.body": "{title} is now on the group's board.",
  "push:groupListing.question.title": "A question about your listing",
  "push:groupListing.question.body":
    "Moderators need one thing cleared up about {title}.",
  "push:groupListing.hidden.title": "About your listing",
  "push:groupListing.hidden.body":
    "{title} was taken off the group's board. Tap to read why.",
  "push:groupListing.declined.title": "About your listing",
  "push:groupListing.declined.body":
    "{title} was not published. Tap to read why.",
  "push:landlordSuggestion.live.title": "Your landlord suggestion is live",
  "push:landlordSuggestion.live.body":
    "{name} is in the directory now. Thank you.",
  "push:landlordSuggestion.notLive.title": "About your landlord suggestion",
  "push:landlordSuggestion.notLive.body":
    "{name} did not make it into the directory. Tap to read why.",
  "push:landlordIntro.accepted.title": "Your introduction is being made",
  "push:landlordIntro.accepted.body":
    "Someone is putting you in touch with {name}.",
  "push:landlordIntro.declined.title": "About your introduction request",
  "push:landlordIntro.declined.body":
    "We could not make the introduction to {name}. Tap to read why.",
  // A gathering has named this member's venue (LOC-16). The one prompt to
  // confirm or detach before it reaches the venue's public page.
  "push:venue.attachment.title": "A gathering at your venue",
  "push:venue.attachment.body":
    '{listingName} has been named as the venue for "{eventTitle}".',
  // Platform staff offering a struggling community a hand (OPS-05). Reaches
  // only that community's owner, co-owners and moderators.
  "push:community.supportOffered.title": "An offer of support",
  "push:community.supportOffered.body":
    "Someone from QueerPulse has offered {communityName} a hand. Tap to read it.",
  // ENG-228: the security sign-in push. The English fallback in
  // `PushNotificationListener.pushSecurityNewSignIn` must stay word-for-word.
  "push:security.newSignIn.body": "A new device signed in to your account.",
  // PRD-334: someone added the member to a group conversation.
  "push:groupAdded.title": "Added to a group",
  "push:groupAdded.body": "{name} added you to {group}.",
  // A group with no title yet, so there is no {group} to name.
  "push:groupAdded.bodyUntitled": "{name} added you to a group.",
  // PRD-353: someone invited the member into a group. They were not seated
  // directly: their "who can add me" preference is `invite_only`, or they
  // left/were removed and are being asked back. Answered on the Requests tab, so this
  // deliberately does NOT say "added".
  "push:groupInvite.title": "New group invite",
  "push:groupInvite.body": "{name} invited you to {group}.",
  // A group with no title yet, so there is no {group} to name.
  "push:groupInvite.bodyUntitled": "{name} invited you to a group.",
  // An admin wrote up a place in the directory and put it in this member's
  // name. The answer, and the affirming pledge that rides with accepting,
  // live on the member's own places panel, so the push only says an offer is
  // waiting.
  "push:listingOwnerOffer.title": "Ownership offer",
  "push:listingOwnerOffer.body":
    "{name} has offered you ownership of {listingName}.",
  // QueerPulse Go together (design spec 2026-09-28). None of the three names
  // the gathering: `PushNotificationListener`'s English fallback titles and
  // bodies for all three must stay word-for-word identical to these, since
  // iOS renders that fallback directly and never reads this catalog.
  "push:goTogether.pairInvite.title": "Go together",
  "push:goTogether.pairInvite.body":
    "{name} wants to go to a gathering together",
  "push:goTogether.groupReady.title": "Go together",
  "push:goTogether.groupReady.body": "Your group for a gathering is ready",
  "push:goTogether.mutual.title": "Go together",
  "push:goTogether.mutual.body": "You and {name} both want to meet again",
  "push:goTogether.memberLeft.title": "Go together",
  "push:goTogether.memberLeft.body": "Someone left your group for a gathering",
  "push:goTogether.memberLeft.bodyMergeOffer":
    "Someone left your group. Another group has room for you",
  "push:goTogether.unmatched.title": "Go together",
  "push:goTogether.unmatched.body":
    "We couldn't find a group for you yet. We'll keep looking",
  "push:goTogether.unmatched.bodyFinal":
    "We weren't able to place you in a group this time",
  "push:goTogether.unmatched.bodyHostSwitchedOff":
    "The host switched Go together off for this gathering",
  "push:goTogether.meetAgain.title": "Go together",
  "push:goTogether.meetAgain.body": "Want to meet your group again?",
};

const pt: Record<string, string> = {
  "push:event.reminder.body": "A começar em breve. Toca para ver os detalhes.",
  [EVENT_REMINDER_ACTION_DETAILS_KEY]: "Detalhes",
  "push:messages.coalesced": "{count} novas mensagens de {name}",
  [STAFF_TITLE_KEY]: "{name}, de {business}",
  "push:messages.coalescedGroup": "{count} novas mensagens em {group}",
  "push:messages.attachment.photo": "Foto",
  "push:messages.attachment.gif": "GIF",
  "push:messages.attachment.document": "Documento",
  "push:messages.attachment.sticker": "Sticker",
  "push:messages.group.attachment.photo": "{name}: Foto",
  "push:messages.group.attachment.gif": "{name}: GIF",
  "push:messages.group.attachment.document": "{name}: Documento",
  "push:messages.group.attachment.sticker": "{name}: Sticker",
  // PRD-336: ver a nota no bloco EN. Uma mensagem de grupo que também te
  // menciona gera UMA notificação só.
  "push:messages.group.mention.body": "{name} mencionou-te: {preview}",
  "push:messages.group.mention.photo": "{name} mencionou-te: Foto",
  "push:messages.group.mention.gif": "{name} mencionou-te: GIF",
  "push:messages.group.mention.document": "{name} mencionou-te: Documento",
  "push:messages.group.mention.sticker": "{name} mencionou-te: Sticker",
  "push:test.title": "Notificação de teste",
  "push:test.body": "Isto é um teste. As tuas notificações estão a funcionar.",
  "push:connection.request.title": "Novo pedido de conexão",
  "push:connection.request.body": "{name} quer ligar-se a ti.",
  "push:connection.accepted.title": "Conexão aceite",
  "push:connection.accepted.body": "{name} aceitou o teu pedido de conexão.",
  "push:mention.title": "Foste mencionado",
  "push:mention.body": "{name} mencionou-te.",
  "push:forumReply.title": "Nova resposta",
  "push:forumReply.body": "{name} respondeu-te.",
  "push:forumThreadReviewed.approved.title": "O teu tópico está publicado",
  "push:forumThreadReviewed.approved.body": "{title} já está no fórum.",
  "push:forumThreadReviewed.rejected.title": "Sobre o teu tópico",
  "push:forumThreadReviewed.rejected.body":
    "{title} não foi publicado. Toca para leres porquê.",
  "push:vouch.received.title": "Recebeste um aval",
  "push:vouch.received.body": "{name} avalizou-te.",
  "push:event.updated.title": "Convívio atualizado",
  "push:event.updated.body":
    "{event} tem novos detalhes. Toca para ver o que mudou.",
  "push:event.cancelled.title": "Convívio cancelado",
  "push:event.cancelled.body": "{event} foi cancelado.",
  // ENG-141: duas chaves, sem plural CLDR neste catálogo. Ver a nota EN.
  // A forma escolhida evita também a concordância de género: o sujeito
  // misturava um título masculino com "datas", que é feminino.
  "push:event.cancelled.seriesBodyOne":
    "{event} foi cancelado, e a data seguinte também.",
  "push:event.cancelled.seriesBody":
    "{event} foi cancelado, e mais {count} datas seguintes também.",
  "push:safeSpace.vouch.title": "Novo aval para o teu espaço seguro",
  "push:safeSpace.vouch.body": "{name} avalizou {space}.",
  "push:housing.match.title": "Uma casa corresponde à tua procura",
  "push:housing.match.body":
    "{title} em {area} corresponde a uma procura que guardaste.",
  "push:housing.match.bodyNoArea":
    "{title} corresponde a uma procura que guardaste.",
  "push:topic.newPost.title": "Nova publicação num tópico que segues",
  "push:topic.newPost.body": "{name} publicou em #{topic}.",
  // PRD-208: ver a nota no bloco EN. Nomeia a persona, nunca quem está
  // por trás dela.
  "push:personaUpdate.title": "Novidades de uma persona que segues",
  "push:personaUpdate.body": "{persona} publicou algo novo.",
  "push:personaUpdate.bodyWithTitle": "{persona} publicou {itemTitle}.",
  "push:preview.hidden.title": "QueerPulse",
  "push:preview.hidden.body": "Tens uma notificação nova.",
  "push:preview.hidden.message": "Tens uma mensagem nova.",
  "push:preview.hidden.messages": "{count} mensagens novas.",

  // ── Decisões sobre algo que a pessoa submeteu ─────────────────────────────
  "push:housing.decision.approved.title": "A tua casa está publicada",
  "push:housing.decision.approved.body":
    "{title} já está no quadro de alojamento.",
  "push:housing.decision.changesRequested.title":
    "O teu anúncio precisa de uma alteração",
  "push:housing.decision.changesRequested.body":
    "A moderação pediu uma alteração a {title}. Abre para veres qual.",
  "push:housing.decision.rejected.title": "O teu anúncio não foi publicado",
  "push:housing.decision.rejected.body":
    "{title} não foi publicado. Abre para veres porquê.",
  "push:housing.decision.takenDown.title": "O teu anúncio foi retirado",
  "push:housing.decision.takenDown.body":
    "{title} foi retirado do quadro de alojamento. Abre para veres porquê.",
  "push:readingGroupProposal.approved.title":
    "O teu grupo de leitura está criado",
  "push:readingGroupProposal.approved.body":
    "{book} já tem espaço próprio, e é teu.",
  "push:readingGroupProposal.declined.title":
    "Sobre a tua proposta de grupo de leitura",
  "push:readingGroupProposal.declined.body":
    "Não conseguimos avançar com {book}. Toca para leres porquê.",
  "push:groupListing.live.title": "O teu anúncio está publicado",
  "push:groupListing.live.body": "{title} já está no quadro do grupo.",
  "push:groupListing.question.title": "Uma questão sobre o teu anúncio",
  "push:groupListing.question.body":
    "A moderação precisa de esclarecer uma coisa sobre {title}.",
  "push:groupListing.hidden.title": "Sobre o teu anúncio",
  "push:groupListing.hidden.body":
    "{title} foi retirado do quadro do grupo. Toca para leres porquê.",
  "push:groupListing.declined.title": "Sobre o teu anúncio",
  "push:groupListing.declined.body":
    "{title} não foi publicado. Toca para leres porquê.",
  "push:landlordSuggestion.live.title":
    "A tua sugestão de senhorio está publicada",
  "push:landlordSuggestion.live.body": "{name} já está no diretório. Obrigada.",
  "push:landlordSuggestion.notLive.title": "Sobre a tua sugestão de senhorio",
  "push:landlordSuggestion.notLive.body":
    "{name} não entrou no diretório. Toca para leres porquê.",
  "push:landlordIntro.accepted.title": "A tua apresentação está a ser feita",
  "push:landlordIntro.accepted.body":
    "Alguém vai pôr-te em contacto com {name}.",
  "push:landlordIntro.declined.title": "Sobre o teu pedido de apresentação",
  "push:landlordIntro.declined.body":
    "Não conseguimos fazer a apresentação a {name}. Toca para leres porquê.",
  "push:venue.attachment.title": "Um convívio no teu espaço",
  "push:venue.attachment.body":
    '{listingName} foi indicado como o espaço de "{eventTitle}".',
  "push:community.supportOffered.title": "Uma oferta de apoio",
  "push:community.supportOffered.body":
    "Alguém da QueerPulse ofereceu ajuda a {communityName}. Toca para leres.",
  "push:security.newSignIn.body":
    "Um novo dispositivo iniciou sessão na tua conta.",
  "push:groupAdded.title": "Adicionaram-te a um grupo",
  "push:groupAdded.body": "{name} adicionou-te a {group}.",
  "push:groupAdded.bodyUntitled": "{name} adicionou-te a um grupo.",
  "push:groupInvite.title": "Novo convite de grupo",
  "push:groupInvite.body": "{name} convidou-te para {group}.",
  "push:groupInvite.bodyUntitled": "{name} convidou-te para um grupo.",
  "push:listingOwnerOffer.title": "Oferta de propriedade",
  "push:listingOwnerOffer.body":
    "{name} ofereceu-te a propriedade de {listingName}.",
  "push:goTogether.pairInvite.title": "Vamos juntes",
  "push:goTogether.pairInvite.body": "{name} quer ir contigo a um convívio",
  "push:goTogether.groupReady.title": "Vamos juntes",
  "push:goTogether.groupReady.body": "O teu grupo para um convívio está pronto",
  "push:goTogether.mutual.title": "Vamos juntes",
  "push:goTogether.mutual.body": "Tu e {name} querem voltar a encontrar-se",
  "push:goTogether.memberLeft.title": "Vamos juntes",
  "push:goTogether.memberLeft.body":
    "Alguém saiu do teu grupo para um convívio",
  "push:goTogether.memberLeft.bodyMergeOffer":
    "Alguém saiu do teu grupo. Há outro grupo com lugar para ti",
  "push:goTogether.unmatched.title": "Vamos juntes",
  "push:goTogether.unmatched.body":
    "Ainda não encontrámos um grupo para ti. Vamos continuar a procurar",
  "push:goTogether.unmatched.bodyFinal":
    "Desta vez não foi possível juntar-te a um grupo",
  "push:goTogether.unmatched.bodyHostSwitchedOff":
    "Quem organiza desligou o Vamos juntes neste convívio",
  "push:goTogether.meetAgain.title": "Vamos juntes",
  "push:goTogether.meetAgain.body": "Queres voltar a encontrar o teu grupo?",
};

/** Exported read-only for the spec's EN/PT key-parity and copy checks. */
export const CATALOG: Readonly<
  Record<PushLang, Readonly<Record<string, string>>>
> = { en, pt };

/** Replace `{token}` placeholders; an unknown token is left intact. */
function interpolate(
  template: string,
  params?: Record<string, string>,
): string {
  if (!params) return template;
  return template.replace(INTERPOLATION, (match, token: string) => {
    const value = params[token];
    return value === undefined ? match : value;
  });
}

export interface PushCopySource {
  title: string;
  body: string;
  l10n?: {
    titleKey?: string;
    bodyKey?: string;
    params?: Record<string, string>;
  };
}

/**
 * Resolve the notification's rendered title/body for `lang`. Falls back to
 * the payload's plain `title`/`body` per field when its key is absent, the
 * key isn't in the catalog, or there is no `l10n` block at all. So a push
 * from before this feature (or a key the catalog hasn't caught up with) still
 * renders correctly.
 *
 * A resolved title that still holds an unresolved `{token}` also falls back
 * to the plain title. `pushCoalesce` folds a burst into a summary and
 * replaces the payload's params with `{ count, name }`, so a staff title
 * template carried through unchanged would read "Rui from {business}"; the
 * plain title is always the business name and is safe on its own.
 */
export function formatPushCopy(
  payload: PushCopySource,
  lang: PushLang,
): { title: string; body: string } {
  const table = CATALOG[lang] ?? CATALOG.en;
  const titleKey = payload.l10n?.titleKey;
  const bodyKey = payload.l10n?.bodyKey;
  const params = payload.l10n?.params;

  const titleTemplate = titleKey !== undefined ? table[titleKey] : undefined;
  const bodyTemplate = bodyKey !== undefined ? table[bodyKey] : undefined;
  const interpolatedTitle =
    titleTemplate !== undefined
      ? interpolate(titleTemplate, params)
      : undefined;

  return {
    title:
      interpolatedTitle !== undefined &&
      !UNRESOLVED_TOKEN.test(interpolatedTitle)
        ? interpolatedTitle
        : payload.title,
    body:
      bodyTemplate !== undefined
        ? interpolate(bodyTemplate, params)
        : payload.body,
  };
}

/** A notification action as the validated payload carries it (ENG-414). */
export interface PushActionSource {
  action: string;
  title: string;
  titleKey?: string;
}

/**
 * ENG-414: resolve each action button's label for `lang`, with the same
 * lookup and fallback `formatPushCopy` uses for the body. A `titleKey` found
 * in the catalog wins; a missing key, an unknown key or an unknown language
 * keeps the action's plain English `title`. The result drops `titleKey`, so
 * only the fields `showNotification` reads reach it.
 */
export function formatPushActions(
  actions: readonly PushActionSource[] | undefined,
  lang: PushLang,
): { action: string; title: string }[] | undefined {
  if (!actions) return undefined;
  const table = CATALOG[lang] ?? CATALOG.en;
  return actions.map(({ action, title, titleKey }) => {
    const localizedTitle = titleKey !== undefined ? table[titleKey] : undefined;
    return { action, title: localizedTitle ?? title };
  });
}
