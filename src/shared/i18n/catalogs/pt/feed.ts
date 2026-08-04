import type { Catalog } from "../../types";

/**
 * Cópia da página Feed. Corpos de publicações/autores/datas, e as
 * especificidades de convívios/artigos/pessoas (`FEED_POST`, `NEW_THIS_WEEK`,
 * os convívios próximos da barra lateral, os títulos de `SavedArticleCard`/
 * `RecapCard`) ficam deliberadamente FORA deste catálogo — em modo live vêm de
 * `GET /feed` (ver `api/feed.adapters.ts`): é conteúdo escrito por pessoas da
 * comunidade, nunca traduzido. Os valores de `FEED_TABS` mantêm-se os ids
 * canónicos em inglês usados no resto da app para filtrar/persistir — só as
 * etiquetas `tab.*` abaixo são traduzidas (indireção chave-etiqueta; ver o
 * comentário de `FEED_TAB_COPY` em feed.data.ts).
 *
 * Registo: tu (nunca você). "Membros" torna-se "pessoas". Nas ações de
 * moderação (silenciar/bloquear), as confirmações usam a segunda pessoa
 * ("Silenciaste {name}") em vez de um particípio passado concordado em
 * género, para nunca presumir o género de quem foi silenciade/bloqueade.
 */
export const feed: Catalog = {
  // ── Etiquetas dos separadores (o id canónico mantém-se em inglês) ───────
  "tab.all": "Tudo",
  "tab.communities": "Comunidades",
  "tab.gatherings": "Convívios",
  "tab.people": "Pessoas",
  "tab.posts": "Publicações",

  // ── Cópia de vazio/erro por separador (FEED_TAB_COPY) — mantida distinta ─
  "tab.all.empty.title": "O teu feed está tranquilo",
  "tab.all.empty.description":
    "Quando as pessoas e comunidades que segues publicarem, se encontrarem, ou receberem alguém novo, isso aparece aqui.",
  "tab.all.empty.action": "Encontrar pessoas para seguir",
  "tab.all.error.title": "Não foi possível carregar o teu feed",
  "tab.all.error.description":
    "Algo impediu a ligação à comunidade. Tenta outra vez.",

  "tab.communities.empty.title": "Ainda sem pulso das comunidades",
  "tab.communities.empty.description":
    "Junta-te a uma comunidade e os seus planos, notas fixadas, e conversas vão reunir-se aqui.",
  "tab.communities.empty.action": "Explorar comunidades",
  "tab.communities.error.title": "Não foi possível chegar às tuas comunidades",
  "tab.communities.error.description":
    "O pulso das tuas comunidades não chegou. Tenta novamente daqui a pouco.",

  "tab.gatherings.empty.title": "Ainda nada marcado",
  "tab.gatherings.empty.description":
    "Quando um convívio em que participas for anunciado ou resumido, vais encontrá-lo aqui.",
  "tab.gatherings.empty.action": "Ver o que há",
  "tab.gatherings.error.title": "Não foi possível carregar os convívios",
  "tab.gatherings.error.description":
    "Não conseguimos chegar ao que aí vem. Tenta outra vez.",

  "tab.people.empty.title": "Ainda sem caras novas",
  "tab.people.empty.description":
    "À medida que pessoas da tua rede chegarem ou partilharem algo, vão aparecer aqui.",
  "tab.people.empty.action": "Conhecer a comunidade",
  "tab.people.error.title": "Não foi possível carregar caras novas",
  "tab.people.error.description":
    "Não conseguimos chegar às chegadas mais recentes. Tenta novamente daqui a pouco.",

  "tab.posts.empty.title": "Sossegado por aqui, por agora",
  "tab.posts.empty.description":
    "Segue mais pessoas, ou começa tu a conversa, e as publicações vão preencher este espaço.",
  "tab.posts.empty.action": "Ir para o fórum",
  "tab.posts.error.title": "Não foi possível carregar publicações",
  "tab.posts.error.description":
    "A conversa não chegou desta vez. Tenta outra vez.",

  "common.viewEverything": "Ver tudo",
  "common.tryAgain": "Tentar outra vez",

  // ── Paginação por scroll (FeedLoadMore) ─────────────────────────────────
  "loadMore.cta": "Carregar mais",
  "loadMore.loading": "A carregar mais…",

  // ── Saudação ─────────────────────────────────────────────────────────────
  "greeting.morning": "Bom dia",
  "greeting.afternoon": "Boa tarde",
  "greeting.evening": "Boa noite",
  "greeting.dateLine": "{weekday} · {city} · {date}",
  "greeting.city": "Lisboa",
  "greeting.newMessages_one": "{count} mensagem nova",
  "greeting.newMessages_other": "{count} mensagens novas",
  "greeting.messagesLink": "Mensagens",

  // ── FeedCards: GatheringCard ────────────────────────────────────────────
  "card.gathering.upcomingIn_one": "Em breve · {count} dia",
  "card.gathering.upcomingIn_other": "Em breve · {count} dias",
  "card.gathering.goingCount": "+{count} vão",
  "card.gathering.youAreGoing": "Vais",

  // ── FeedCards: NewMemberCard ────────────────────────────────────────────
  "card.newMember.tag": "Nova pessoa",
  "card.newMember.joined": "Entrou {when}",
  "card.newMember.today": "hoje",

  // ── FeedCards: SavedArticleCard / RecapCard ─────────────────────────────
  "card.savedArticle.eyebrow": "Dos teus guardados",
  "card.recap.eyebrow": "Resumo do convívio",

  // ── Etiquetas de ação partilhadas ────────────────────────────────────────
  "action.connect": "Ligar",
  "action.viewProfile": "Ver perfil",
  "action.cancel": "Cancelar",
  "action.reply": "Responder",
  "action.save": "Guardar",
  "action.saved": "Guardado",
  "action.done": "Concluído",
  "action.continueReading": "Continuar a ler",
  "action.readRecap": "Ler o resumo",

  // ── Composer de resposta ────────────────────────────────────────────────
  "composer.srLabel": "Escrever uma resposta",
  "composer.placeholder": "Escreve uma resposta…",

  // ── PostCard / PostActions ──────────────────────────────────────────────
  "post.unlikeAria": "Remover gosto da publicação",
  "post.likeAria": "Gostar da publicação",
  "post.replyCount": "Responder · {count}",
  "post.replyAria": "Responder à publicação",
  "post.unsaveAria": "Remover dos guardados",
  "post.saveAria": "Guardar publicação",
  "post.emptyReplies.title": "Ainda sem respostas",
  "post.emptyReplies.description": "Sê quem diz a primeira coisa simpática.",

  // ── FeedModeration: MoreMenu / BlockConfirmModal / ReportModal ──────────
  "moderation.reportPost": "Denunciar publicação",
  "moderation.mute": "Silenciar {name}",
  "moderation.unmute": "Deixar de silenciar {name}",
  "moderation.block": "Bloquear {name}",
  "moderation.unblock": "Desbloquear {name}",
  "moderation.mutedToast": "Silenciaste {name}",
  "moderation.unmutedToast": "Deixaste de silenciar {name}",
  "moderation.unblockedToast": "Desbloqueaste {name}",
  "moderation.postOptionsAria": "Opções da publicação",
  "moderation.notNowToast": "Lembramos-te mais tarde",

  "moderation.blockConfirm.title": "Bloqueaste <em>{name}</em>",
  "moderation.blockConfirm.body":
    "Já não te pode enviar mensagens, ver o teu perfil, ou encontrar-te aqui{reportNote}. Podes desfazer isto a qualquer momento nas tuas ligações.",
  "moderation.blockConfirm.alsoReported":
    ", e a nossa equipa de segurança já tem a tua denúncia",
  "moderation.blockDialog.title": "Bloquear {name}?",
  "moderation.blockDialog.sub":
    "Não vai poder enviar-te mensagens, ver o teu perfil, ou encontrar-te — e qualquer ligação entre vocês será removida. Isto funciona nos dois sentidos.",
  "moderation.blockDialog.alsoReportLabel":
    "Denunciar também {name} à nossa equipa de segurança",
  "moderation.blockDialog.submitCta": "Bloquear {name}",

  "moderation.reportConfirm.title":
    "Obrigade — <em>estamos a tratar disso</em>",
  "moderation.reportConfirm.body":
    "A nossa equipa de moderação vai rever esta publicação sobre {name}. Para algo urgente, contacta-nos diretamente em {email}.",
  "moderation.reportDialog.title": "Denunciar esta publicação",
  "moderation.reportDialog.sub":
    "Diz-nos o que está errado. As denúncias são confidenciais e revistas pela nossa equipa de segurança.",
  "moderation.reportDialog.detailPlaceholder": "Adiciona detalhes (opcional)",
  "moderation.reportDialog.submitCta": "Submeter denúncia",
  "moderation.sending": "A enviar…",

  // ── FeedSidebar ─────────────────────────────────────────────────────────
  "sidebar.upcomingHeading": "Em breve",
  "sidebar.upcomingEmpty": "Ainda não tens convívios marcados.",
  "sidebar.seeCalendar": "Ver calendário completo",
  "sidebar.newThisWeekHeading": "Novidades esta semana",
  "sidebar.newMembersEmpty": "Ainda não há pessoas novas para mostrar.",
  "sidebar.browseMembers": "Ver todas as pessoas",
  "sidebar.connectionsHeading": "As tuas ligações",
  "sidebar.connectionsEmpty": "Ainda não te ligaste a ninguém.",
  "sidebar.connectionsCount_one": "{count} ligação",
  "sidebar.connectionsCount_other": "{count} ligações",
  "sidebar.manage": "Gerir",
};
