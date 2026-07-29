import type { Catalog } from "../../types";

/**
 * Cópia das notificações, indexada pelo valor do `notifications_type_enum` do
 * backend. A API envia `type` + `payload` e nenhum texto — é esta cópia que a
 * pessoa lê. Ver `en/notifications.ts` para as notas de contrato.
 *
 * Registo: tu (nunca você). Formas inclusivas por reformulação neutra primeiro
 * — nenhuma destas frases concorda em género com a pessoa destinatária. Ver
 * `docs/i18n/glossary-pt.md`: Gatherings → Convívios, Vouch → Avalizar,
 * "bem-vinde" como forma neutra.
 */
export const notifications: Catalog = {
  "type.connection_request.text": "Alguém quer ligar-se a ti.",
  "type.connection_request.textNamed":
    "<profile>{name}</profile> quer ligar-se a ti.",
  "type.connection_request.meta": "Pedido de ligação",

  "type.connection_accepted.text": "O teu pedido de ligação foi aceite.",
  "type.connection_accepted.textNamed":
    "<profile>{name}</profile> aceitou o teu pedido de ligação.",
  "type.connection_accepted.meta": "Ligação",

  "type.vouch_received.text": "Alguém te avalizou.",
  "type.vouch_received.textNamed": "<profile>{name}</profile> avalizou-te.",
  "type.vouch_received.meta": "Aval",

  "type.promoted_to_member.text": "Já fazes parte da comunidade. Bem-vinde.",
  "type.promoted_to_member.meta": "Adesão",

  "type.new_message.text": "Tens uma nova mensagem.",
  "type.new_message.meta": "Mensagem privada",

  "type.introduction_made.text":
    "Uma apresentação que fizeste foi concretizada.",
  "type.introduction_made.textNamed":
    "Uma apresentação que fizeste a <profile>{name}</profile> foi concretizada.",
  "type.introduction_made.meta": "Apresentação",

  "type.mention.text": "Foste mencionado numa discussão.",
  "type.mention.textNamed":
    "<profile>{name}</profile> mencionou-te numa discussão.",
  "type.mention.meta": "Menção",

  // As notificações "mention" ramificam consoante `payload.entityKind` — o
  // que foi mencionado, não quem. O "type.mention.*" acima cobre uma pessoa
  // (e qualquer registo antigo de antes de existir `entityKind`); estas
  // cobrem o resto.
  "type.mention.community.text":
    "A tua comunidade c/{entityRef} foi mencionada numa discussão.",
  "type.mention.community.textNamed":
    "<profile>{name}</profile> mencionou a tua comunidade c/{entityRef}.",
  "type.mention.community.meta": "Menção de comunidade",

  "type.mention.business.text":
    "O teu negócio b/{entityRef} foi mencionado numa discussão.",
  "type.mention.business.textNamed":
    "<profile>{name}</profile> mencionou o teu negócio b/{entityRef}.",
  "type.mention.business.meta": "Menção de negócio",

  "type.mention.event.text":
    "O teu convívio e/{entityRef} foi mencionado numa discussão.",
  "type.mention.event.textNamed":
    "<profile>{name}</profile> mencionou o teu convívio e/{entityRef}.",
  "type.mention.event.meta": "Menção de convívio",

  "type.mention.thread.text":
    "O teu tópico t/{entityRef} foi mencionado numa discussão.",
  "type.mention.thread.textNamed":
    "<profile>{name}</profile> mencionou o teu tópico t/{entityRef}.",
  "type.mention.thread.meta": "Menção de tópico",

  "type.event_invite.text": "Tens um convite para um convívio.",
  "type.event_invite.textNamed":
    "<profile>{name}</profile> convidou-te para um convívio.",
  "type.event_invite.meta": "Convite para convívio",

  "type.event_reminder.text":
    "Está a aproximar-se um convívio em que vais estar.",
  "type.event_reminder.meta": "Lembrete de convívio",

  "type.waitlist_promoted.text":
    "Abriu uma vaga — já não estás em lista de espera.",
  "type.waitlist_promoted.meta": "Lista de espera",

  "type.event_cancelled.text": "Um convívio em que vais estar foi cancelado.",
  "type.event_cancelled.meta": "Atualização de convívio",

  "type.unknown.text": "Tens uma nova notificação.",
  "type.unknown.meta": "Notificação",

  // Chrome da página de notificações
  "page.title": "Notificações",
  "page.markAllRead": "Marcar tudo como lido",
  "page.dayRecent": "Hoje e recentes",
  "page.dayEarlier": "Anteriores",
  "page.empty.title": "Tudo em dia",
  "page.empty.description": "Sem notificações nesta categoria.",
  "page.error.title": "Não conseguimos carregar as tuas notificações",
  "page.error.description":
    "Algo correu mal ao contactar o servidor. Isto não é uma caixa vazia — tenta novamente daqui a pouco.",
  "page.error.retry": "Tentar novamente",

  // Separadores de filtro (notificationTabs em data.tsx + o separador Menções)
  "tabs.all": "Todas",
  "tabs.messages": "Mensagens",
  "tabs.events": "Encontros",
  "tabs.community": "Comunidade",
  "tabs.platform": "Plataforma",
  "tabs.mentions": "Menções",

  // Rótulos de ação partilhados pela lista de notificações de demonstração
  "actions.reply": "Responder",
  "actions.viewThread": "Ver conversa",
  "actions.viewEvent": "Ver encontro",
  "actions.accept": "Aceitar",
  "actions.decline": "Recusar",
  "actions.readNow": "Ler agora",
  "actions.seeDetails": "Ver detalhes",
  "actions.seeBarterBoard": "Ver quadro de trocas",
  "actions.readMessage": "Ler mensagem",
  "actions.viewReplies": "Ver respostas",
  "actions.readReport": "Ler relatório",

  // Lista de notificações de demonstração (notificationsList.data.tsx)
  "list.1.text":
    "<strong>{name}</strong> respondeu à tua mensagem sobre o encontro de domingo à mesa.",
  "list.1.meta": "Mensagem privada",
  "list.2.text":
    "A tua inscrição em <strong>{title}</strong> foi confirmada. O encontro é no dia {date}, em {venue}.",
  "list.2.meta": "Encontro · Convívio",
  "list.3.text":
    "<strong>{name}</strong> convidou-te a juntares-te ao grupo de leitura <strong>{group}</strong>.",
  "list.3.meta": "Grupo de leitura · Convite",
  "list.3.joinedToast": "Juntaste-te ao grupo de leitura {group}",
  "list.3.declinedToast": "Convite recusado",
  "list.4.text":
    "<strong>{name}</strong> mencionou-te no tópico do Fórum: “{quote}”",
  "list.4.meta": "Fórum · Menção",
  "list.5.text":
    "<strong>{title}</strong> já está disponível. Destaque de capa: {cover}",
  "list.5.meta": "Revista · junho de 2026",
  "list.6.text":
    "Lembrete: o grupo de leitura <strong>{group}</strong> reúne-se {when} às {time}, na Mouraria. {spots}",
  "list.6.meta": "Grupo de leitura · Lembrete",
  "list.6.spots_one": "Ainda há {count} vaga aberta.",
  "list.6.spots_other": "Ainda há {count} vagas abertas.",
  "list.7.text": "<strong>{name}</strong> aceitou o teu pedido de ligação.",
  "list.7.meta": "Ligação",
  "list.8.text":
    "Nova funcionalidade da plataforma: <strong>{feature}</strong> já suporta pacotes de serviços. Podes oferecer pacotes de várias sessões.",
  "list.8.meta": "Atualização da plataforma",
  "list.9.text":
    "O <strong>{event}</strong> a que foste tem uma conversa de continuação marcada para {date}.",
  "list.9.meta": "Encontro · Continuação",
  "list.10.text":
    "<strong>{name}</strong> enviou-te uma mensagem sobre o {event} de {day}.",
  "list.10.meta": "Mensagem privada",
  "list.11.text_one":
    "O teu post no Fórum (“{postTitle}”) recebeu {count} resposta.",
  "list.11.text_other":
    "O teu post no Fórum (“{postTitle}”) recebeu {count} respostas.",
  "list.11.meta": "Fórum · Atividade",
  "list.12.text":
    "O <strong>{report}</strong> já foi publicado. As estatísticas de moderação e as contas já estão disponíveis.",
  "list.12.meta": "Governação · Relatório trimestral",

  // Conversa de menções (MentionsPanel.tsx / mentions.data.tsx)
  "mentions.day.today": "Hoje",
  "mentions.day.yesterday": "Ontem",
  "mentions.day.thisWeek": "Esta semana",
  "mentions.eyebrow": "Menções · {handle}",
  "mentions.heading": "Quando alguém <em>te menciona.</em>",
  "mentions.lead":
    "Posts, respostas e artigos que te mencionam com @. Distinto das Notificações — esta é só a conversa de menções.",
  "mentions.tabs.all": "Todas",
  "mentions.tabs.unread": "Não lidas",
  "mentions.tabs.posts": "Em posts",
  "mentions.tabs.articles": "Em artigos",
  "mentions.tabs.events": "Em encontros",
  "mentions.unreadSummary_one": "{count} não lida",
  "mentions.unreadSummary_other": "{count} não lidas",
  "mentions.oldestFrom": "· a mais antiga de {when}",
  "mentions.allCaughtUp": "Tudo em dia",
  "mentions.markAllRead": "Marcar tudo como lido",
  "mentions.markAllReadToast": "Tudo marcado como lido",
  "mentions.empty.title": "Sem menções por aqui",
  "mentions.empty.description":
    "Não há nada nesta vista por agora. Quando alguém te mencionar, aparece aqui — não precisas de andar à procura.",
  "mentions.composer.placeholder": "Responder a {name}…",
  "mentions.row.read": "Lida",
  "mentions.row.going": "Vais",
  "mentions.row.rsvpGoingToast": "Vais · convite de {name}",
  "mentions.row.rsvpWithdrawnToast": "Presença retirada",
  "mentions.row.genericToast": "{label} · {name}",
  "mentions.actions.reply": "Responder",
  "mentions.actions.openThread": "Abrir conversa",
  "mentions.actions.markRead": "Marcar como lida",
  "mentions.actions.openArticle": "Abrir artigo",
  "mentions.actions.rsvp": "Confirmar presença",
  "mentions.actions.openPost": "Abrir post",
  "mentions.where.prefix": "Em",
  "mentions.context.reply": "numa resposta",
  "mentions.context.articleComment": "num comentário a um artigo",
  "mentions.context.namedInvite": "num convite de {name}",
  "mentions.context.communityPost": "num post da comunidade {community}",
  "mentions.context.thread": "numa conversa",
  "mentions.context.eventInvite": "num convite para um encontro",
  "mentions.context.communityReply": "numa resposta na comunidade {community}",

  // Pré-visualização de notificação (NotificationDeepLinkPage.tsx / Cards.tsx)
  "deepLink.back": "← Notificações",
  "deepLink.types.connection": "Ligação",
  "deepLink.types.gathering": "Encontro",
  "deepLink.types.reply": "Resposta",
  "deepLink.types.mention": "Menção",
  "deepLink.types.moderation": "Moderação",
  "deepLink.summary.connection": "{name} quer ligar-se a ti",
  "deepLink.summary.gathering": "A tua presença em {event} foi aceite",
  "deepLink.summary.reply": "{name} respondeu ao teu post",
  "deepLink.summary.mention": "{name} mencionou-te num post",
  "deepLink.summary.moderation":
    "Uma atualização sobre a tua conta — recurso {ref}",
  "deepLink.connection.toastConnected": "Ligação feita com {name}",
  "deepLink.connection.toastDeclined": "Pedido recusado",
  "deepLink.connection.connectedTitle": "A ligação está <em>feita</em>",
  "deepLink.connection.connectedBody":
    "{name} já faz parte da tua rede. Mensagens e novidades marcadas já estão abertas entre vocês.",
  "deepLink.connection.viewConnections": "Ver as tuas ligações",
  "deepLink.connection.wantsToConnect": "{name} quer <em>ligar-se</em>",
  "deepLink.connection.noteIntro": "Enviou-te uma nota com o pedido:",
  "deepLink.connection.mutualConnections_one": "{count} ligação em comum →",
  "deepLink.connection.mutualConnections_other": "{count} ligações em comum →",
  "deepLink.connection.accept": "Aceitar",
  "deepLink.connection.decline": "Recusar",
  "deepLink.connection.notNow": "Agora não — decidir depois",
  "deepLink.connection.remindLaterToast": "Lembramos-te mais tarde",
  "deepLink.gathering.badge": "Vais",
  "deepLink.gathering.guestListConfirmed": "Estás na lista de convidados.",
  "deepLink.gathering.confirmedByHost":
    "A tua presença foi confirmada por quem organiza.",
  "deepLink.gathering.addToCalendar": "Adicionar ao calendário",
  "deepLink.gathering.addedToastCalendar": "Adicionado ao teu calendário",
  "deepLink.gathering.viewDetails": "Ver detalhes do encontro",
  "deepLink.reply.yourPost": "O teu post",
  "deepLink.reply.theirReply": "Resposta de {name}",
  "deepLink.reply.meta": "Respondeu ao teu post · {when}",
  "deepLink.mention.theirPost": "Post de {name}",
  "deepLink.mention.meta": "Mencionou-te num post · {when}",
  "deepLink.composer.placeholder": "Responder a {name}…",
  "deepLink.composer.send": "Enviar",
  "deepLink.sentReply.you": "Tu",
  "deepLink.sentReply.justNow": "Agora mesmo",
  "deepLink.moderation.heading": "Uma atualização sobre a tua conta",
  "deepLink.moderation.reference":
    "Referência <refNum>{ref}</refNum> · Atualizado a {updated}",
  "deepLink.moderation.viewOutcome": "Ver o resultado do recurso",
  "deepLink.moderation.howItWorks": "Como funciona a moderação",
};
