/**
 * Static EN/PT push-copy catalog, bundled straight into the service worker
 * (imported statically by `sw.ts`, same as `pushPayload.ts`) — it must NOT go
 * through the app's lazy i18n chunks, because those aren't reachable from a
 * worker context. Keep this small: only strings a push notification renders.
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

const en: Record<string, string> = {
  "push:event.reminder.body": "Starting soon — tap to see the details.",
  "push:messages.coalesced": "{count} new messages from {name}",
  "push:test.title": "Test notification",
  "push:test.body": "This is a test — your notifications are working.",
  "push:connection.request.title": "New connection request",
  "push:connection.request.body": "{name} wants to connect with you.",
  "push:connection.accepted.title": "Connection accepted",
  "push:connection.accepted.body": "{name} accepted your connection request.",
  "push:mention.title": "You were mentioned",
  "push:mention.body": "{name} mentioned you.",
  "push:forumReply.title": "New reply",
  "push:forumReply.body": "{name} replied to you.",
  "push:vouch.received.title": "You received a vouch",
  "push:vouch.received.body": "{name} vouched for you.",
  "push:event.updated.title": "Event updated",
  "push:event.updated.body": "{event} has new details — tap to see what changed.",
  "push:event.cancelled.title": "Event cancelled",
  "push:event.cancelled.body": "{event} has been cancelled.",
  "push:safeSpace.vouch.title": "New vouch for your safe space",
  "push:safeSpace.vouch.body": "{name} vouched for {space}.",
  "push:housing.match.title": "A home matches your search",
  "push:housing.match.body": "{title} in {area} matches a search you saved.",
  "push:housing.match.bodyNoArea": "{title} matches a search you saved.",
  "push:topic.newPost.title": "New post in a topic you follow",
  "push:topic.newPost.body": "{name} posted in #{topic}.",
  // Shown INSTEAD of the real title/body when the member has turned on
  // "hide previews" (see pushPrivacy.ts). Says something arrived without
  // naming who it is from or what it said.
  "push:preview.hidden.title": "QueerPulse",
  "push:preview.hidden.body": "You have a new notification.",
};

const pt: Record<string, string> = {
  "push:event.reminder.body": "A começar em breve — toca para ver os detalhes.",
  "push:messages.coalesced": "{count} novas mensagens de {name}",
  "push:test.title": "Notificação de teste",
  "push:test.body": "Isto é um teste — as tuas notificações estão a funcionar.",
  "push:connection.request.title": "Novo pedido de ligação",
  "push:connection.request.body": "{name} quer ligar-se a ti.",
  "push:connection.accepted.title": "Ligação aceite",
  "push:connection.accepted.body": "{name} aceitou o teu pedido de ligação.",
  "push:mention.title": "Foste mencionado",
  "push:mention.body": "{name} mencionou-te.",
  "push:forumReply.title": "Nova resposta",
  "push:forumReply.body": "{name} respondeu-te.",
  "push:vouch.received.title": "Recebeste um aval",
  "push:vouch.received.body": "{name} avalizou-te.",
  "push:event.updated.title": "Convívio atualizado",
  "push:event.updated.body": "{event} tem novos detalhes — toca para ver o que mudou.",
  "push:event.cancelled.title": "Convívio cancelado",
  "push:event.cancelled.body": "{event} foi cancelado.",
  "push:safeSpace.vouch.title": "Novo aval para o teu espaço seguro",
  "push:safeSpace.vouch.body": "{name} avalizou {space}.",
  "push:housing.match.title": "Uma casa corresponde à tua procura",
  "push:housing.match.body": "{title} em {area} corresponde a uma procura que guardaste.",
  "push:housing.match.bodyNoArea": "{title} corresponde a uma procura que guardaste.",
  "push:topic.newPost.title": "Nova publicação num tópico que segues",
  "push:topic.newPost.body": "{name} publicou em #{topic}.",
  "push:preview.hidden.title": "QueerPulse",
  "push:preview.hidden.body": "Tens uma notificação nova.",
};

const CATALOG: Record<PushLang, Record<string, string>> = { en, pt };

/** Replace `{token}` placeholders; an unknown token is left intact. */
function interpolate(template: string, params?: Record<string, string>): string {
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
 * key isn't in the catalog, or there is no `l10n` block at all — so a push
 * from before this feature (or a key the catalog hasn't caught up with) still
 * renders correctly.
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

  return {
    title:
      titleTemplate !== undefined ? interpolate(titleTemplate, params) : payload.title,
    body: bodyTemplate !== undefined ? interpolate(bodyTemplate, params) : payload.body,
  };
}
