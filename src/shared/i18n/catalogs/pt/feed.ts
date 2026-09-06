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
  "tab.connections": "Ligações",
  "tab.gatherings": "Convívios",
  "tab.people": "Pessoas",
  "tab.posts": "Publicações",
  "tab.listAria": "Filtrar o teu feed",

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

  "tab.connections.empty.title": "Ainda nada das tuas ligações",
  "tab.connections.empty.description":
    "Assim que te ligares a pessoas aqui, o que publicarem ou organizarem aparece nesta aba.",
  "tab.connections.empty.action": "Encontrar pessoas para te ligares",
  "tab.connections.error.title":
    "Não foi possível carregar o feed das tuas ligações",
  "tab.connections.error.description":
    "Não conseguimos chegar à atividade das tuas ligações. Tenta outra vez.",

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

  // ── FeedCards: GatheringCard ────────────────────────────────────────────

  // ── FeedCards: NewMemberCard ────────────────────────────────────────────
  "card.newMember.today": "hoje",

  // ── FeedCards: SavedArticleCard / RecapCard ─────────────────────────────
  "card.savedArticle.eyebrow": "Dos teus guardados",
  "card.recap.eyebrow": "Resumo do convívio",

  // ── Etiquetas de ação partilhadas ────────────────────────────────────────
  "action.connect": "Ligar",
  "action.cancel": "Cancelar",
  "action.reply": "Responder",
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

  "moderation.blockConfirm.title": "Bloqueaste <em>{name}</em>",
  "moderation.blockConfirm.body":
    "Já não te pode enviar mensagens, ver o teu perfil, ou encontrar-te aqui{reportNote}. Podes desfazer isto a qualquer momento nas tuas ligações.",
  "moderation.blockConfirm.alsoReported":
    ", e a nossa equipa de segurança já tem a tua denúncia",
  "moderation.blockDialog.title": "Bloquear {name}?",
  "moderation.blockDialog.sub":
    "Não vai poder enviar-te mensagens, ver o teu perfil, ou encontrar-te, e qualquer ligação entre vocês será removida. Isto funciona nos dois sentidos.",
  "moderation.blockDialog.alsoReportLabel":
    "Denunciar também {name} à nossa equipa de segurança",
  "moderation.blockDialog.submitCta": "Bloquear {name}",

  "moderation.reportConfirm.title": "Obrigade, <em>estamos a tratar disso</em>",
  // Ver o comentário na versão EN: as linhas de banda espelham o
  // `SLA_WINDOW_MS` do `report-severity.ts` do backend.
  "moderation.reportConfirm.body":
    "A nossa equipa de moderação vai rever esta publicação sobre {name}.",
  "moderation.reportConfirm.band.emergency":
    "Foi para a banda de emergência: o motivo que escolheste é um dos dois que são vistos dentro de uma hora.",
  "moderation.reportConfirm.band.high":
    "Foi para a banda de prioridade alta, que é revista dentro de 24 horas.",
  "moderation.reportConfirm.band.medium":
    "Está na fila normal, que é revista dentro de três dias.",
  "moderation.reportConfirm.band.low":
    "Está na fila normal, que é revista dentro de sete dias.",
  "moderation.reportDialog.title": "Denunciar esta publicação",
  "moderation.reportDialog.sub":
    "Diz-nos o que está errado. As denúncias são confidenciais e revistas pela nossa equipa de segurança.",
  "moderation.reportDialog.detailPlaceholder": "Adiciona detalhes (opcional)",
  "moderation.reportDialog.submitCta": "Submeter denúncia",
  "moderation.reportDialog.retryCta": "Tentar outra vez",
  "moderation.reportDialog.failed":
    "Não conseguimos enviar essa denúncia. Ainda não foi submetida. Verifica a tua ligação e tenta outra vez.",
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

  // ── Chrome dos cartões redesenhados (eyebrows, ações, provas/estatísticas) ─
  "card.eyebrow.newMember": "Nova pessoa",
  "card.eyebrow.gathering": "Convívio",
  "card.eyebrow.community": "Comunidade",
  "card.eyebrow.communityPost": "De uma comunidade tua",
  "card.eyebrow.forumThread": "Tópico do fórum",
  "card.forumThread.anonymousAuthor": "Uma pessoa",
  "action.viewProfileAria": "Ver o perfil de {name}",
  "action.sayHi": "Dizer olá",
  "action.follow": "Seguir",
  "action.following": "A seguir",
  "action.profile": "Perfil",
  "action.join": "Juntar-me",
  "action.peekInside": "Espreitar",
  "action.about": "Sobre",
  "action.saveSpot": "Guardar lugar",
  "action.maybe": "Talvez",
  "action.details": "Detalhes",
  "action.countMeIn": "Conta comigo · {count}",
  "action.openThread": "Abrir conversa",
  "proof.communitiesInCommon": "{count} comunidades em comum",
  "gathering.spots": "{going} vão · {spots} vagas livres",
  "gathering.full": "{going} vão · esgotado",
  "gathering.hostedBy": "Organizado por {host}",
  "card.gathering.anonymousHost": "QueerPulse",
  "community.meta": "{count} membros · {visibility} · {city}",
  "community.newThisWeek": "{count} novidades esta semana",
  "community.posts7d": "{count} publicações em 7 dias",
  "post.inCommunity": "em {community} · {count} respostas",
  "banner.joined": "{count} pessoas juntaram-se perto de ti esta semana",
  "banner.sharing": "{count} partilham as tuas comunidades",

  // ── Porque este item está no feed (SOC-04) ──────────────────────────────
  "reason.membership": "Fazes parte de {subject}",
  "reason.connection": "De {subject}, nas tuas ligações",
  "reason.topic": "Segues {subject}",
  "reason.recent": "Novo em toda a QueerPulse",

  // ── Ações diretas no cartão (SOC-04) ────────────────────────────────────
  "action.react": "Conta comigo",
  "action.reactionFailed": "A reação não ficou guardada. Tentar de novo?",
  "action.replySent": "Resposta publicada.",
  "action.replyFailed": "A resposta não foi enviada. Tentar de novo?",

  // ── Silenciar fontes no feed (SOC-18) ───────────────────────────────────
  "mute.showLess": "Mostrar menos de {name}",
  "mute.showAgain": "Voltar a mostrar {name}",
  "mute.mutedToast": "Vais ver menos de {name}. Continuas a ser membro.",
  "mute.unmutedToast": "{name} voltou ao teu feed.",
  "mute.failedToast": "Não foi possível guardar. Tentar de novo?",
  "mute.sidebarHeading": "Feed mais calmo",
  "mute.sidebarBlurb":
    "Baixa o volume de uma comunidade ou de um tópico sem sair.",
  "mute.manageLink": "Fontes que baixaste de volume",
  "mute.pageTitle": "Fontes que baixaste de volume",
  "mute.pageBlurb":
    "Estas aparecem menos no teu feed. Continuas a ser membro de todas as comunidades aqui, mantens o acesso completo e ninguém foi avisado.",
  "mute.backToFeed": "Voltar ao teu feed",
  "mute.emptyTitle": "Nada baixado de volume",
  "mute.emptyDescription":
    "Quando uma comunidade ou um tópico for mais do que queres no teu feed, escolhe \u2018Mostrar menos\u2019 num dos cartões. Vai aparecer aqui para o poderes trazer de volta.",
  "mute.kind.community": "Comunidade",
  "mute.kind.forum_thread": "Tópico",
  "mute.mutedOn": "Baixado a {date}",
  "mute.unmute": "Voltar a mostrar",

  // ── A revista como fonte do feed (PRD-107) ──────────────────────────────
  "card.eyebrow.article": "Da revista",
  "card.article.anonymousByline": "QueerPulse",
  "article.byline": "Por {name}",
  "article.inLanguage": "Este artigo está em {language}.",
  "action.readPiece": "Ler o artigo",
};
