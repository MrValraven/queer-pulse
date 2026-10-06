import type { Catalog } from "../../types";

/**
 * Cópia do Fórum ("a praça pública"). `THREADS` (títulos, resumos, corpo dos posts,
 * respostas, tags, datas "publicado há…") fica deliberadamente FORA deste
 * catálogo — em modo live vem de `GET /forum/threads` +
 * `GET /forum/threads/:slug/posts` (ver `api/forum.adapters.ts`): é conteúdo
 * escrito por pessoas da comunidade, nunca traduzido. Os `id` das categorias
 * mantêm-se os valores canónicos em inglês usados no resto da app para
 * filtrar/encaminhar — só o `nameKey` de apresentação é traduzido (indireção
 * chave-etiqueta).
 *
 * Registo: tu (nunca você). "Membros" torna-se "pessoas" (ver
 * docs/i18n/glossary-pt.md). Os cargos dos três moderadores que publicam em
 * nome da conta oficial ficam nominalizados ("moderação principal", não
 * "moderador/a principal") para não presumir o género de pessoas reais.
 */
export const forum: Catalog = {
  // ── Data relativa "publicado há…" (adaptador live; ver api/forum.adapters.ts)
  "time.justNow": "agora mesmo",

  // ── Categorias (o id mantém-se; isto é só a etiqueta de apresentação) ────
  "cat.all": "Todas as publicações",
  "cat.general": "Geral",
  "cat.housing": "Habitação",
  "cat.health": "Saúde e Bem-estar",
  "cat.arts": "Artes e Cultura",
  "cat.activism": "Ativismo e Propostas",
  "cat.guides": "Guias e Recursos",
  "cat.jobs": "Trabalho e Competências",
  "cat.trans": "Trans e Não-binárie",
  "cat.meetups": "Convívio e Apresentações",
  "cat.legal": "Legal e Migração",
  "cat.relationships": "Amor e Relações",
  "cat.funding": "Financiamento e Apoios",
  "cat.platform": "Plataforma e Sugestões",

  // ── As três pessoas moderadoras que publicam em nome do QueerPulse ───────
  "modRole.mariana": "moderação principal",
  "modRole.rui": "moderação",
  "modRole.ana": "moderação (meio período)",

  // ── Ordenação de respostas (o id canónico mantém-se em inglês) ───────────
  "replySort.oldest": "Mais antigas",
  "replySort.newest": "Mais recentes",
  "replySort.mostHelpful": "Mais úteis",
  "replySort.groupAria": "Ordenar as respostas",

  // ── Hero da ForumPage ───────────────────────────────────────────────────
  "hero.title": "A <em>praça</em> pública",
  "hero.lead":
    "A única comunidade a que todas as pessoas aqui pertencem: perguntas, propostas, guias, e o trabalho lento de construir um movimento. Cuidem-se. Procuras algo mais pequeno?",
  "hero.findCommunitiesCta": "Encontra as tuas comunidades",
  newPostCta: "+ Nova publicação",

  // ── ForumSidebar ────────────────────────────────────────────────────────
  "sidebar.categoriesLabel": "Categorias",
  "sidebar.emergencyResources": "Recursos de emergência",
  "sidebar.housingBoard": "Quadro de habitação",
  "sidebar.jobBoard": "Quadro de emprego",
  "sidebar.governance": "Governação e transparência",

  // ── FirstPostPrompt ─────────────────────────────────────────────────────
  "firstPost.eyebrow": "Ainda não publicaste nada",
  "firstPost.title": "Todas as pessoas foram <em>novas</em> um dia.",
  "firstPost.body":
    "O fórum só é tão bom quanto aquilo que as pessoas trazem para ele. Não precisas de nada grandioso: uma pergunta, uma recomendação, algo que reparaste. Tudo conta. Aqui ficam algumas coisas que costumam ser úteis partilhar:",
  "firstPost.writeCta": "Escreve a tua primeira publicação",
  "firstPost.maybeLater": "Talvez mais tarde",
  "firstPost.dismissAria": "Dispensar",
  "firstPost.starter.gp": "Estou à procura de um médico de família que…",
  "firstPost.starter.recommendation": "Alguém conhece um bom…",
  "firstPost.starter.justMoved": "Acabei de me mudar para Lisboa e…",
  "firstPost.starter.anyoneTried": "Alguém já experimentou…",
  "firstPost.starter.flatmates": "Procuro colegas de casa em…",

  // ── ComposeThreadModal ──────────────────────────────────────────────────
  "compose.confirmTitle": "Publicado <em>na praça pública</em>",
  "compose.confirmBody":
    "A tua publicação está em direto no topo do fórum. As pessoas podem responder, votar, e ajudar.",
  "compose.done": "Concluído",
  "compose.title": "Nova publicação",
  "compose.sub":
    "Faz uma pergunta, partilha um guia, ou lança uma proposta. Sê gentil, sê útil.",
  "compose.titleFieldLabel": "Título",
  "compose.titlePlaceholder": "Um título claro e específico",
  "compose.categoryFieldLabel": "Categoria",
  "compose.communityFieldLabel": "Publicar numa comunidade (opcional)",
  "compose.communityNone": "Nenhuma (publicação global)",
  "compose.postFieldLabel": "Publicação",
  "compose.postPlaceholder": "Escreve a tua publicação…",
  "compose.cancel": "Cancelar",
  "compose.publishCta": "Publicar",
  "compose.publishing": "A publicar…",
  "compose.publishRetryCta": "Tentar publicar outra vez",
  "compose.publishFailed":
    "Não conseguimos publicar. O teu rascunho continua aqui, podes tentar outra vez.",
  "compose.officialFieldLabel": "Publicar como QueerPulse Oficial",
  "compose.officialFieldHint":
    "Publica em nome da conta QueerPulse, em vez do teu nome.",

  // ── ComposeThreadModal · campo de etiquetas ─────────────────────────────
  "compose.tagsFieldLabel": "Etiquetas",
  "compose.tagsPlaceholder": "Pesquisar etiquetas",
  "compose.tagsSearchLabel": "Pesquisar etiquetas",
  "compose.tagsHint":
    "Até {max} etiquetas, escolhidas da lista para que as pessoas encontrem isto mais tarde.",
  "compose.removeTagAria": "Remover etiqueta {tag}",
  "compose.addTagAria": "Adicionar etiqueta {tag}",
  "compose.tagsNoMatch": "Nenhuma etiqueta corresponde a “{query}”.",
  "compose.popularTagsLabel": "Populares",
  "compose.browseTags": "Ver todas as etiquetas",
  "compose.hideTagList": "Esconder a lista de etiquetas",

  // ── Categorias do vocabulário de etiquetas (forumTags.data.ts) ──────────
  "tagCategory.life": "Vida & dinheiro",
  "tagCategory.health": "Saúde & cuidados",
  "tagCategory.community": "Comunidade",
  "tagCategory.culture": "Cultura",
  "tagCategory.activism": "Ativismo & financiamento",
  "tagCategory.platform": "QueerPulse",

  // ── Pesquisa do fórum ───────────────────────────────────────────────────
  "search.placeholder": "Pesquisar no fórum…",
  "search.ariaLabel": "Pesquisar no fórum",
  "search.clearAria": "Limpar pesquisa",
  // PRD-164: a caixa procura agora nos títulos E no texto de qualquer resposta.
  "search.hint":
    "Pesquisa nos títulos dos tópicos e nas respostas dentro deles, para que uma resposta escondida num comentário também apareça. Só no fórum.",

  // ── ForumThreadList ─────────────────────────────────────────────────────
  // `top` ordena agora pelos votos dos últimos 30 dias.
  "threadList.top": "Melhores do mês",
  "threadList.new": "Recentes",
  "threadList.active": "Ativos",
  "threadList.unanswered": "Sem resposta",
  "threadList.sortAria": "Ordenar publicações",
  "threadList.filteringByTag": "A filtrar por",
  "threadList.clearTag": "Limpar",
  "threadList.clearTagAria": "Limpar o filtro {tag}",
  "threadList.filterByTagAria": "Filtrar publicações por {tag}",
  "threadList.count_one": "{formatted} publicação",
  "threadList.count_other": "{formatted} publicações",
  "threadList.emptyFiltered.title": "Ainda nada nesta categoria",
  "threadList.emptyFiltered.description":
    "Não há publicações aqui neste momento. Experimenta outra categoria, ou começa tu a conversa.",
  "threadList.emptyFiltered.action": "Ver todas as publicações",
  "threadList.emptyAll.title": "Sossegado por aqui, por agora",
  "threadList.emptyAll.description":
    "A praça pública está aberta a todas as pessoas da comunidade. Sê quem começa a conversa.",
  "threadList.emptyAll.action": "Escrever uma publicação",
  "threadList.pinnedBadge": "Fixado",
  "threadList.withdrawnBadge": "Retirada",
  "threadList.upvoteAria": "Votar a favor",
  "threadList.removeUpvoteAria": "Remover voto",
  "threadList.loadingMore": "A carregar…",
  "threadList.loadMoreCta": "Carregar mais publicações",
  "threadList.unreadBadge_one": "{formatted} nova",
  "threadList.unreadBadge_other": "{formatted} novas",
  "threadList.unreadAria_one": "{formatted} resposta que ainda não leste",
  "threadList.unreadAria_other": "{formatted} respostas que ainda não leste",
  "threadList.unreadCap": "99+",

  // ── Marca de sondagem numa linha de tópico (PRD-172) ─────────────────────
  // A linha diz que há uma sondagem e quantas respostas oferece. Nunca leva
  // contagem: a página do tópico pode ainda estar a guardá-la.
  "threadList.pollBadge_one": "Sondagem · {formatted} resposta",
  "threadList.pollBadge_other": "Sondagem · {formatted} respostas",

  // ── Frase partilhada de contagem de respostas ────────────────────────────
  repliesCount_one: "{formatted} resposta",
  repliesCount_other: "{formatted} respostas",

  // ── ReportReplyModal ────────────────────────────────────────────────────
  "reportReply.confirmTitle": "Obrigade. <em>Estamos a tratar disso.</em>",
  "reportReply.confirmBody":
    "Uma pessoa moderadora vai dar uma vista de olhos. As denúncias mantêm-se privadas, e {name} não vai saber que foste tu a denunciar.",
  "reportReply.done": "Concluído",
  "reportReply.title": "Denunciar esta resposta",
  "reportReply.titlePost": "Denunciar esta publicação",
  "reportReply.subPost":
    "Conta a uma pessoa moderadora o que está errado com a publicação de {name}. Isto é privado. Ninguém é notificado de que denunciaste.",
  "reportReply.sub":
    "Conta a uma pessoa moderadora o que está errado com a resposta de {name}. Isto é privado. Ninguém é notificado de que denunciaste.",
  "reportReply.reasonGroupAria": "Motivo da denúncia",
  "reportReply.cancel": "Cancelar",
  "reportReply.sending": "A enviar…",
  "reportReply.sendCta": "Enviar denúncia",
  "reportReply.errorTitle": "Não foi enviada",
  "reportReply.errorBody":
    "Não foi possível enviar a tua denúncia agora. Nada foi submetido. Verifica a tua ligação e tenta novamente.",
  "reportReply.retryCta": "Tentar novamente",

  // ── ThreadComposer ──────────────────────────────────────────────────────
  "threadComposer.replyingTo": "A responder a <strong>{name}</strong>",
  "threadComposer.placeholder": "Escreve uma resposta…",
  "threadComposer.textareaAria": "Escreve uma resposta a este tópico",
  "threadComposer.postReplyCta": "Publicar resposta",

  // ── ThreadOpCard ────────────────────────────────────────────────────────
  "threadOp.postedPrefix": "Publicado {time}",
  "threadOp.viewsCount_one": "{formatted} visualização",
  "threadOp.viewsCount_other": "{formatted} visualizações",
  "threadOp.saved": "Guardado",
  "threadOp.bookmark": "Guardar",
  "threadOp.report": "Denunciar",
  "threadOp.voteAria": "Votar a favor desta publicação",
  "threadOp.unvoteAria": "Remover o teu voto",
  "threadOp.unavailable":
    "A publicação inicial não está disponível para ti. As respostas abaixo continuam aqui para leres.",

  // ── Avisos de conteúdo numa publicação publicada ─────────────────────────
  // A própria etiqueta e o controlo para voltar a esconder usam as chaves da
  // pré-visualização (`composePage.preview.*`), para que o cartão montado a
  // escrever seja o cartão que o fórum publica. Só a linha de revelar é nova.
  "contentWarning.reveal": "Mostrar mesmo assim: {warnings}",

  // ── Sondagem na publicação inicial ───────────────────────────────────────
  "poll.voteCta": "Votar",
  "poll.changeVoteCta": "Mudar a tua resposta",
  "poll.optionVotes_one": "{formatted} voto",
  "poll.optionVotes_other": "{formatted} votos",
  "poll.totalVotes_one": "{formatted} resposta",
  "poll.totalVotes_other": "{formatted} respostas",
  // Fica onde estaria um total enquanto o servidor o guarda. Nunca pode ser
  // trocada por um número: a contagem chega a `null`, que é o servidor a
  // recusar dizer, e "0 respostas" seria uma afirmação que ninguém fez.
  "poll.resultsAfterVoting": "As respostas aparecem depois de votares.",
  "poll.closed": "A votação fechou",
  "poll.closesAt": "A votação fecha {date}",
  "poll.voteFailed":
    "A tua resposta não passou. Tenta outra vez daqui a pouco.",
  "poll.voteFailedClosed":
    "A votação já fechou, por isso as respostas são finais.",

  // ── Metadados discretos na publicação inicial ────────────────────────────
  "opMeta.neighbourhood": "Sobre {name}",
  "opMeta.language": "Escrito em {language}",
  // Os três valores abaixo entram dentro de `opMeta.language`, por isso ficam
  // em minúsculas no meio da frase.
  "opMeta.languagePt": "português",
  "opMeta.languageEn": "inglês",
  "opMeta.languageBoth": "português e inglês",

  // ── Tópico fechado (a moderação fechou as respostas) ────────────────────
  "locked.title": "Este tópico está fechado a novas respostas",
  "locked.body":
    "Uma pessoa moderadora fechou este tópico, por isso as respostas estão em pausa. Podes continuar a ler tudo aqui.",
  "locked.reasonBody":
    "Uma pessoa moderadora fechou este tópico: {reason}. Podes continuar a ler tudo aqui.",
  "locked.replyBlockedToast": "Este tópico está fechado a novas respostas.",

  // ── Um tópico que a autoria fechou a respostas ───────────────────────────
  // O fecho da moderação e a data marcada pela autoria são factos diferentes,
  // por isso este aviso não traz reparo: ninguém fez nada de errado.
  "closed.title": "Esta conversa fechou",
  "closed.body":
    "A autoria marcou uma data para as respostas pararem. Tudo o que está acima continua aqui para ler.",
  "closed.bodyOn":
    "As respostas pararam a {date}. Tudo o que está acima continua aqui para ler.",

  // ── Um tópico que o fórum ainda não vê (vista da autoria) ────────────────
  // A autoria chega ao seu próprio tópico agendado ou em revisão por link, e
  // todos os caminhos de leitura da comunidade o escondem. Isto diz qual dos
  // três estados é e quando, para o silêncio se ler como o plano.
  "unpublished.scheduledTitle": "Agendado",
  "unpublished.scheduledBody":
    "Isto fica visível a {date}. Até lá és a única pessoa que o consegue abrir.",
  "unpublished.scheduledBodyNoDate":
    "Isto está à espera da hora de publicação. Até lá és a única pessoa que o consegue abrir.",
  "unpublished.moderatorReviewTitle": "À espera de revisão",
  "unpublished.moderatorReviewBody":
    "Alguém da comunidade enviou isto para revisão. Aprova ou recusa em <link>Revisão do fórum</link>.",
  "unpublished.moderatorRejectedTitle": "Devolvido a quem o escreveu",
  "unpublished.moderatorRejectedBody":
    "A equipa editorial devolveu isto. Fica fora do fórum até quem o escreveu voltar a enviar.",
  "unpublished.moderatorScheduledBody":
    "Isto fica visível a {date}. Até lá só quem o escreveu e a moderação o conseguem abrir.",
  "unpublished.moderatorScheduledBodyNoDate":
    "Isto está à espera da hora de publicação. Até lá só quem o escreveu e a moderação o conseguem abrir.",
  "unpublished.reviewTitle": "Com a equipa editorial",
  "unpublished.reviewBody":
    "Enviaste isto para revisão. Entra no fórum assim que alguém aprovar.",
  "unpublished.rejectedTitle": "Devolvido a ti",
  "unpublished.rejectedBody":
    "A equipa editorial devolveu isto. Podes editar e enviar outra vez quando quiseres.",

  // ── ThreadTopbar · controlo de fecho da moderação ───────────────────────
  "topbar.lockThread": "Fechar tópico",
  "topbar.unlockThread": "Reabrir tópico",

  // ── LockThreadModal (nota opcional ao fechar um tópico) ─────────────────
  "lockReason.title": "Fechar este tópico",
  "lockReason.sub":
    "As pessoas continuam a poder ler tudo aqui; isto só pausa novas respostas. Diz-lhes porquê, se for útil.",
  "lockReason.label": "Motivo (opcional)",
  "lockReason.placeholder":
    "ex.: resolvido, fora do tema, movido para uma comunidade",
  "lockReason.cancel": "Cancelar",
  "lockReason.confirm": "Fechar tópico",
  "lockReason.locking": "A fechar…",

  // ── ThreadTopbar · controlo de autoria oficial (admin) ──────────────────
  "topbar.markOfficial": "Marcar como QueerPulse Oficial",
  "topbar.unmarkOfficial": "Remover QueerPulse Oficial",

  // ── ThreadPage ──────────────────────────────────────────────────────────
  "threadPage.breadcrumbForum": "Fórum",
  "threadPage.coAuthor.confirmTitle": "Tirar o teu nome desta conversa?",
  "threadPage.coAuthor.confirmBody":
    "A conversa continua publicada só com o nome de {author}. Não te podes voltar a adicionar.",
  "threadPage.coAuthor.confirmBodyMasked":
    "O teu nome sai desta conversa. Não dá para desfazer.",
  "threadPage.coAuthor.confirmCta": "Tirar o meu nome",
  "threadPage.coAuthor.cancel": "Deixar como está",
  "threadPage.coAuthor.removedToast": "O teu nome já não aparece na conversa.",
  "threadPage.coAuthor.removeFailed": "Não resultou. Tentas outra vez?",
  "threadPage.coAuthor.menuItem": "Tirar o meu nome da coautoria",
  "threadPage.replyPostedToast": "Resposta publicada",
  "threadPage.replyFailedToast":
    "Não foi possível publicar a tua resposta. Tenta novamente daqui a pouco.",
  "threadPage.notFound.title": "Este tópico não está aqui",
  "threadPage.notFound.description":
    "Pode ter sido removido ou o link pode estar quebrado. Volta ao fórum para encontrares as conversas atuais.",
  "threadPage.notFound.backCta": "Voltar ao fórum",
  "threadPage.error.title": "Não foi possível carregar este tópico",
  "threadPage.error.description":
    "Algo correu mal do nosso lado. A culpa não é tua. Tenta novamente daqui a pouco.",
  "threadPage.error.retryCta": "Tentar novamente",
  "threadPage.replyForbiddenToast":
    "Não podes responder aqui. O tópico pode ter sido fechado ou pertence a uma comunidade a que ainda não te juntaste.",
  "threadPage.private.title": "Este tópico está numa comunidade privada",
  "threadPage.private.description":
    "Só quem é membro dessa comunidade o pode ler. Se for um sítio onde gostavas de estar, podes pedir para entrar.",
  "threadPage.private.browseCta": "Ver comunidades",

  // ── ThreadReplies / ModeratorByline ─────────────────────────────────────
  "byline.withRole":
    "Escrito por <name>{name}</name>, {role} · em nome da equipa",
  "byline.noRole": "Escrito por <name>{name}</name> · em nome da equipa",
  // Só a moderação vê isto: fica ao lado da autoria real de um tópico que o
  // fórum está a ler sem nome.
  "byline.postedAnonymously": "Publicado anonimamente",
  "replies.emptyTitle": "Ainda sem respostas",
  "replies.emptyDescription":
    "Esta publicação está à espera da primeira voz. Sê quem responde primeiro. Uma resposta cuidada vale muito.",
  "replies.emptyAction": "Escrever uma resposta",
  "replies.mostHelpfulBadge": "Mais útil",
  "replies.opBadge": "OP",
  "replies.unlikeAria": "Remover gosto desta resposta",
  "replies.likeAria": "Gostar desta resposta",
  "replies.loadingMore": "A carregar…",
  "replies.loadMoreCta": "Carregar mais respostas",

  // ── Respostas encadeadas (ação responder + recolher/expandir + continuar) ─
  "replies.reply": "Responder",
  "replies.collapseAria": "Recolher respostas a {name} ({count})",
  "replies.continueThread": "Continuar esta conversa ({count})",
  "replies.replyingTo": "Em resposta a {name}",
  "replies.hiddenCount_one": "{count} resposta escondida",
  "replies.hiddenCount_other": "{count} respostas escondidas",

  // ── ForumAuthor ─────────────────────────────────────────────────────────
  "author.officialTitle": "Conta oficial do QueerPulse",
  "author.officialBadge": "Oficial",
  "author.aboutTeamAria": "Sobre a equipa e a governação do QueerPulse",
  "author.viewProfileAria": "Ver o perfil de {name}",
  "author.you": "Tu",

  // ── PostActionsMenu (⋯ overflow menu) ────────────────────────────────────
  "postMenu.edit": "Editar",
  "postMenu.moveCategory": "Mover para outra categoria",
  "postMenu.delete": "Eliminar",
  "postMenu.restore": "Restaurar",
  "postMenu.history": "Ver histórico de edições",
  "postMenu.pin": "Fixar",
  "postMenu.unpin": "Desafixar",
  "postMenu.report": "Denunciar",
  "postMenu.ariaLabel": "Ações da publicação",

  // ── Edited mark / deleted-post tombstone ─────────────────────────────────
  "edited.mark": "(editado)",
  "tombstone.body": "Esta publicação foi eliminada.",
  "tombstone.author": "[eliminado]",
  "tombstone.removedByModerator":
    "Esta publicação foi removida por um moderador.",

  // ── Inline reply edit ────────────────────────────────────────────────────
  "replyEdit.save": "Guardar",
  "replyEdit.cancel": "Cancelar",
  "replyEdit.textareaAria": "Edita a tua resposta",

  // ── OP (original post) edit ──────────────────────────────────────────────
  "opEdit.title": "Editar publicação",
  "opEdit.titleLabel": "Título",
  "opEdit.bodyLabel": "Publicação",
  "opEdit.save": "Guardar alterações",
  "opEdit.cancel": "Cancelar",
  "opEdit.saving": "A guardar…",

  // ── Delete confirmation ───────────────────────────────────────────────────
  "deleteConfirm.title": "Eliminar esta publicação?",
  "deleteConfirm.body":
    "Fica escondida do tópico. Podes restaurá-la mais tarde. Não se perde nada.",
  "deleteConfirm.confirm": "Eliminar",
  "deleteConfirm.cancel": "Manter",
  "deleteConfirm.deleting": "A eliminar…",

  // ── Retirar um tópico inteiro (PRD-160) ──────────────────────────────────
  "deleteThread.title": "Retirar esta publicação?",
  "deleteThread.body":
    "Sai o tópico inteiro: o título, a tua publicação inicial e a ligação que as pessoas seguem para chegar aqui. As respostas continuam escritas onde estão, e ninguém volta a chegar-lhes pelo fórum. Não podes desfazer isto.",
  "deleteThread.confirm": "Retirar",
  "deleteThread.cancel": "Manter",
  "deleteThread.deleting": "A retirar…",

  // ── Mudar um tópico de categoria (PRD-163) ───────────────────────────────
  "moveCategory.title": "Mudar esta publicação de categoria",
  "moveCategory.body":
    "As pessoas encontram o fórum por categoria, por isso uma publicação arrumada no sítio certo é uma publicação que recebe resposta. Escolhe onde ela pertence.",
  "moveCategory.fieldLabel": "Categoria",
  "moveCategory.save": "Mudar",
  "moveCategory.saving": "A mudar…",
  "moveCategory.cancel": "Deixar aqui",
  "moveCategory.badgeAria": "Tirar esta publicação de {category}",

  // ── Edit history modal ────────────────────────────────────────────────────
  "history.title": "Histórico de edições",
  "history.empty": "Não há versões anteriores para mostrar.",
  "history.titleChange": "Título anterior: {title}",
  "history.close": "Fechar",

  // ── Toasts (edit / delete / restore / lock / pin) ─────────────────────────
  "toast.editSaved": "A tua edição está publicada.",
  "toast.deleted": "Publicação eliminada.",
  "toast.threadDeleted": "Essa publicação já não está no fórum.",
  "toast.categoryMoved": "Movida para {category}.",
  "toast.restored": "Publicação restaurada.",
  "toast.threadLocked": "Tópico fechado a novas respostas.",
  "toast.threadUnlocked": "Tópico reaberto.",
  "toast.threadPinned": "Tópico fixado no topo do fórum.",
  "toast.threadUnpinned": "Tópico desafixado.",
  "toast.threadMarkedOfficial": "Publicado como QueerPulse Oficial.",
  "toast.threadUnmarkedOfficial": "Revertido para o autor original.",
  "toast.pinCapReached":
    "Só podes fixar 3 tópicos ao mesmo tempo. Desafixa um primeiro.",
  "toast.error": "Algo correu mal. Tenta novamente daqui a pouco.",

  // ── Following a thread (SOC-13) ───────────────────────────────────────────
  "follow.followCta": "Seguir",
  "follow.unfollowCta": "A seguir",
  "follow.followedToast": "Vais saber das novas respostas aqui.",
  "follow.unfollowedToast": "Deixaste de seguir este tópico.",

  // ── Accepted answer (SOC-13) ──────────────────────────────────────────────
  "replies.acceptedBadge": "Resposta aceite",
  "replies.markAnswer": "Marcar como resposta",
  "replies.unmarkAnswer": "Desmarcar resposta",
  "replies.quote": "Citar",
  "answer.acceptedToast": "Marcada como a resposta.",
  "answer.clearedToast": "Marca de resposta removida.",

  // ── Tag editing (SOC-13) ──────────────────────────────────────────────────
  "tagsEdit.title": "Editar etiquetas",
  "tagsEdit.body":
    "As etiquetas são como as pessoas encontram este tópico mais tarde. Escolhe até cinco da lista.",
  "tagsEdit.editCta": "Editar etiquetas",
  "tagsEdit.addCta": "Adicionar etiquetas",
  "tagsEdit.save": "Guardar etiquetas",
  "tagsEdit.saving": "A guardar…",
  "tagsEdit.cancel": "Cancelar",
  "tagsEdit.savedToast": "Etiquetas atualizadas.",

  // ── Composer photo + autosave (SOC-13) ────────────────────────────────────
  "compose.imageAttachCta": "Adicionar uma foto",
  "compose.imageUploading": "A carregar…",
  "compose.imageRemoveAria": "Remover a foto anexada",
  "compose.imageAttachThreadAria": "Adicionar uma foto a esta publicação",
  "compose.imageAttachReplyAria": "Adicionar uma foto a esta resposta",
  "post.imageAlt": "Foto anexada a esta publicação",
  "draft.saving": "A guardar…",
  "draft.saved": "Rascunho guardado",
  "draft.restored": "Rascunho recuperado",
  "draft.unsaved": "Ainda não guardado",
  "draft.threadKind": "PUBLICAÇÃO",
  "draft.replyKind": "RESPOSTA",
  // Row title for an autosaved inline nested reply, so the drafts list says
  // who the half-written answer was for (PRD-166).
  "draft.inlineReplyTitle": "Resposta a {name}",
  // Row title for a saved post the member has not titled yet: they picked a
  // community or some tags before writing anything.
  "draft.untitledThreadTitle": "Publicação por acabar",

  // ── The forum's own sight of an unsent draft (PRD-165) ────────────────────
  // O cartão de rascunho no fórum: uma faixa por baixo da pesquisa.
  "draftNotice.cardLabel": "A tua publicação por acabar",
  "draftNotice.eyebrow": "Publicação por acabar",
  "draftNotice.autosaved": "Guardado",
  "draftNotice.untitled": "Publicação sem título",
  "draftNotice.emptyBody": "Ainda sem texto. As tuas escolhas estão guardadas.",
  "draftNotice.continueCta": "Continuar a escrever",
  "draftNotice.factsLabel": "Neste rascunho",
  "draftNotice.moreFacts": "+{count}",
  "draftNotice.moreFactsLabel_one": "mais {count} detalhe",
  "draftNotice.moreFactsLabel_other": "mais {count} detalhes",
  "draftNotice.fact.townSquare": "A praça",
  "draftNotice.fact.tags_one": "{count} etiqueta",
  "draftNotice.fact.tags_other": "{count} etiquetas",
  "draftNotice.fact.photos_one": "{count} foto",
  "draftNotice.fact.photos_other": "{count} fotos",
  "draftNotice.fact.poll": "Votação",

  // ── Cartão de pré-visualização de link numa publicação (PRD-171) ─────────
  "linkPreview.aria": "Pré-visualização do link: {title}",
  "linkPreview.ariaGeneric": "Pré-visualização de link de {site}",

  // ── Página de composição (/forum/new) ─────────────────────────────────────
  // A página inteira que substitui a janela de composição. Só copy: todos os
  // valores canónicos (ids de tipo, de categoria, de aviso, nomes de bairro)
  // ficam em inglês nos dois catálogos, porque é o que o estado, o rascunho e
  // a chamada de publicação transportam. Os grupos seguem a página de cima
  // para baixo, depois a coluna lateral, depois as janelas.

  // ── A faixa de cabeçalho da página ───────────────────────────────────────
  // `head.title` leva um <em> de propósito: a tipografia de destaque pede a
  // segunda palavra em itálico coral, por isso a ênfase fica dentro da frase
  // traduzida e passa pelo <Translation> com um mapa de componentes.
  "composePage.head.crumbForum": "Fórum",
  "composePage.head.crumbCurrent": "Novo post",
  "composePage.head.title": "Novo <em>post</em>",
  "composePage.head.lead":
    "Não tenhas pressa. Tudo fica guardado enquanto escreves, e nada sai até tu decidires.",

  // ── Tipo de publicação ───────────────────────────────────────────────────
  // Os botões no topo da página. O esquema é o esboço que entra num corpo
  // vazio, por isso leva quebras de linha reais e os mesmos títulos
  // **a negrito** que o corpo desenha.
  "composePage.kind.groupLabel": "Que tipo de publicação",
  "composePage.kind.question.name": "Pergunta",
  "composePage.kind.question.titlePlaceholder":
    "O que queres saber? Um ponto de interrogação ajuda.",
  "composePage.kind.question.bodyPlaceholder":
    "Dá o contexto: o que já tentaste, o que te disseram e o que ajudaria mesmo.",
  "composePage.kind.question.tip":
    "Perguntas com contexto têm resposta 3× mais depressa.",
  "composePage.kind.question.scaffold":
    "**O que estou a tentar fazer**\n\n\n**O que já tentei**\n\n\n**O que ajudaria**\n",
  "composePage.kind.guide.name": "Guia",
  "composePage.kind.guide.titlePlaceholder":
    "Diz para que serve, p. ex. “Encontrar médico de família em Lisboa: o guia honesto”",
  "composePage.kind.guide.bodyPlaceholder":
    "Começa por dizer para quem é, depois os passos. Podes voltar e atualizar.",
  "composePage.kind.guide.tip":
    "Guias podem ser afixados e atualizados. Diz a data em que era verdade.",
  "composePage.kind.guide.scaffold":
    "**Para quem é**\n\n\n**Passo a passo**\n1. \n2. \n3. \n\n**Cuidados a ter**\n",
  "composePage.kind.proposal.name": "Proposta",
  "composePage.kind.proposal.titlePlaceholder":
    "Diz a ideia numa linha, p. ex. “Noite de cinema queer mensal no São Jorge”",
  "composePage.kind.proposal.bodyPlaceholder":
    "O que é, porquê agora e o que precisas das pessoas para acontecer.",
  "composePage.kind.proposal.tip":
    "Termina com um pedido claro. Os votos dizem-te quem viria; as respostas, quem ajuda.",
  "composePage.kind.proposal.scaffold":
    "**A ideia**\n\n\n**Porquê agora**\n\n\n**O que preciso**\n- \n\n**Como ajudar**\n",
  "composePage.kind.share.name": "Partilha",
  "composePage.kind.share.titlePlaceholder": "O que estás a partilhar?",
  "composePage.kind.share.bodyPlaceholder":
    "Diz o que é e porque vale o tempo das pessoas.",
  "composePage.kind.share.tip":
    "Um link, uma foto, algo que reparaste. Tudo conta.",
  "composePage.kind.none.titlePlaceholder": "Um título claro e específico",
  "composePage.kind.none.bodyPlaceholder":
    "Escreve. Diz o que aconteceu, o que precisas ou o que sabes.",
  "composePage.kind.none.tip": "Escolhe um e a página adapta-se.",
  "composePage.kind.call.name": "Concurso aberto",
  "composePage.kind.call.titlePlaceholder":
    "por exemplo, Residência artística 2027, candidaturas abertas",
  "composePage.kind.call.bodyPlaceholder":
    "Para quem é, o que financia e o que aprendeste ao candidatar-te.",
  "composePage.kind.call.tip":
    "Junta o prazo e o concurso sai sozinho dos concursos abertos quando passar.",
  "composePage.kind.call.scaffold":
    "**Quem se pode candidatar**\n\n\n**O que financia**\n\n\n**Dicas de quem já se candidatou**\n",
  "composePage.kind.ask.name": "Angariação",
  "composePage.kind.ask.titlePlaceholder":
    "Diz para que é o dinheiro, por exemplo “Ajuda o Rui com a recuperação da cirurgia”",
  "composePage.kind.ask.bodyPlaceholder":
    "Para quem é, o que aconteceu e o que o dinheiro vai cobrir.",
  "composePage.kind.ask.tip":
    "A moderação verifica cada angariação antes de ser publicada.",
  "composePage.kind.ask.scaffold":
    "**O que aconteceu**\n\n\n**O que o dinheiro cobre**\n\n\n**Outras formas de ajudar**\n",

  // ── Sugestões de arranque (composição vazia) ─────────────────────────────
  "composePage.prompts.asking": "As pessoas perguntam sobre…",
  "composePage.prompts.noReplies": "ainda sem respostas",
  "composePage.prompts.startFrom": "Ou começa por…",
  "composePage.prompts.starterGp": "Procuro um médico de família que…",
  "composePage.prompts.starterRecommendation": "Alguém conhece um bom…",
  "composePage.prompts.starterNewInLisbon": "Acabei de me mudar para Lisboa e…",
  "composePage.prompts.starterTried": "Alguém já experimentou…",
  "composePage.prompts.starterFlatmates": "Procuro colegas de casa em…",

  // ── Campo do título ──────────────────────────────────────────────────────
  // `titleTip.*` é o conselho em direto debaixo do campo.
  "composePage.title.ariaLabel": "Título",
  "composePage.titleTip.keepGoing":
    "Continua. Títulos específicos têm resposta.",
  "composePage.titleTip.shouting":
    "Tudo em maiúsculas lê-se como gritar. Maiúscula só no início chega.",
  "composePage.titleTip.questionMark":
    "Termina a pergunta com um ponto de interrogação, para saberem que estás a perguntar.",
  "composePage.titleTip.sayTheSubject":
    "Diz do que se trata. As pessoas percorrem a lista pelo título.",
  "composePage.titleTip.clear": "Claro e específico.",

  // ── Barra do corpo e Escrever / Pré-visualizar ───────────────────────────
  // ⌘ é tipografia permitida (docs/STYLE-RULES.md), por isso as duas dicas
  // de atalho ficam dentro da etiqueta.
  "composePage.toolbar.label": "Formatação",
  "composePage.toolbar.bold": "Negrito (⌘B)",
  "composePage.toolbar.italic": "Itálico (⌘I)",
  "composePage.toolbar.heading": "Título de secção",
  "composePage.toolbar.bulletList": "Lista com marcas",
  "composePage.toolbar.numberedList": "Lista numerada",
  "composePage.toolbar.quote": "Citação",
  "composePage.toolbar.link": "Ligação",
  "composePage.mode.groupLabel": "Escrever ou pré-visualizar",
  "composePage.mode.write": "Escrever",
  "composePage.mode.preview": "Pré-visualizar",

  // ── Campo do corpo ───────────────────────────────────────────────────────
  // Os três valores `placeholder*` são as palavras que um comando da barra
  // insere quando nada está selecionado, por isso ficam em minúsculas a meio
  // da frase, tirando o título, que começa uma linha.
  "composePage.body.ariaLabel": "Publicação",
  "composePage.body.previewEmpty": "Ainda não há nada para pré-visualizar.",
  "composePage.body.scaffold": "Começar com um esquema",
  "composePage.body.markdownHint":
    "Markdown simples: **negrito**, *itálico*, - listas, > citações. Links expandem.",
  "composePage.body.wordCount_one": "{count} palavra",
  "composePage.body.wordCount_other": "{count} palavras",
  "composePage.body.placeholderText": "texto",
  "composePage.body.placeholderHeading": "Título",
  "composePage.body.placeholderLinkText": "texto da ligação",

  // ── Fotos ────────────────────────────────────────────────────────────────
  // `{position}` começa em 1 e `{total}` é quantas fotos estão em espera.
  "composePage.photo.limitReached": "Até quatro fotos por publicação.",
  "composePage.photo.gridLabel": "Fotos nesta publicação",
  "composePage.photo.altNeeded": "Falta descrição",
  "composePage.photo.altDone": "Descrição feita",
  "composePage.photo.altLabel": "Descrição da foto {position} de {total}",
  "composePage.photo.altPlaceholder":
    "Descreve esta foto para quem não a pode ver",
  "composePage.photo.moveEarlier": "Mover a foto {position} para trás",
  "composePage.photo.moveLater": "Mover a foto {position} para a frente",
  "composePage.photo.remove": "Remover a foto {position}",
  "composePage.photo.attach": "Adicionar foto",
  "composePage.photo.inputLabel": "Escolher fotos",
  "composePage.photo.uploading": "A adicionar a tua foto…",

  // ── Avisos debaixo do corpo ──────────────────────────────────────────────
  "composePage.nudge.contact.title":
    "Isso parece um número de telefone ou um email.",
  "composePage.nudge.contact.body":
    "Todos os membros conseguem ler esta conversa. Pensa em pedir às pessoas para te enviarem mensagem direta.",
  "composePage.nudge.crisis.title": "Se precisas de ajuda agora,",
  "composePage.nudge.crisis.body": "o fórum é lento. Estes respondem hoje.",
  "composePage.nudge.crisis.sosVozAmiga": "SOS Voz Amiga",
  "composePage.nudge.crisis.ilgaPortugal": "ILGA Portugal",
  "composePage.nudge.crisis.emergencies": "Emergências",
  "composePage.nudge.privateCommunity.title":
    "Estás a publicar dentro de {community}.",
  "composePage.nudge.privateCommunity.body":
    "Só os membros conseguem ler ou encontrar esta conversa. Fica fora da praça.",
  "composePage.nudge.privateCommunity.bodyCrossPosted":
    "Os membros leem aqui e uma cópia aparece na praça para toda a gente.",
  "composePage.nudge.missingAlt.title": "Uma foto não tem descrição.",
  "composePage.nudge.missingAlt.body":
    "Quem usa leitor de ecrã e quem tem ligação lenta recebe só o texto. Uma linha em cada uma chega.",
  "composePage.nudge.longGuide.title": "Guia longo, sem títulos.",
  "composePage.nudge.longGuide.body":
    "Com {count} palavras, alguns **Títulos** tornam isto fácil de percorrer. O botão H adiciona um.",
  "composePage.nudge.doxxing.title": "Estás a dizer onde alguém mora?",
  "composePage.nudge.doxxing.body":
    "Uma morada com um nome é doxxing, mesmo quando a pessoa merece o aviso. Descreve a situação e deixa os moderadores guardar os detalhes.",
  "composePage.nudge.doxxing.acknowledge":
    "Confirmo que esta é a minha morada, ou um espaço público",
  "composePage.nudge.listLabel": "Antes de publicares",
  "composePage.nudge.dismiss": "Esconder esta nota",
  "composePage.nudge.crisis.callAria": "Ligar para {service}: {number}",

  // ── A fila de blocos e os avisos de conteúdo que abre ────────────────────
  // `block.contentWarning` é também o título do painel, para o botão e o
  // painel que abre dizerem as mesmas palavras.
  "composePage.block.contentWarning": "Aviso de conteúdo",
  "composePage.block.poll": "Adicionar votação",
  "composePage.warning.medical": "Detalhe médico",
  "composePage.warning.violence": "Violência",
  "composePage.warning.substances": "Substâncias",
  "composePage.warning.family": "Rejeição familiar",
  "composePage.warning.sexual": "Conteúdo sexual",
  "composePage.warning.selfHarm": "Suicídio ou automutilação",
  "composePage.warning.housingLoss": "Perda de casa",
  "composePage.warning.police": "Polícia",
  "composePage.warning.hint":
    "O cartão fica com uma etiqueta CW e o excerto fica escondido até alguém escolher lê-lo.",

  // ── Votação ──────────────────────────────────────────────────────────────
  // `poll.closes.*` é construído com t(`…poll.closes.${value}`) sobre
  // `PollCloses`, por isso os quatro sufixos têm de existir.
  "composePage.poll.title": "Votação",
  "composePage.poll.hint":
    "De {min} a {max} opções. Os resultados aparecem depois de votares.",
  "composePage.poll.optionLabel": "Opção {number}",
  "composePage.poll.removeOption": "Remover a opção {number}",
  "composePage.poll.addOption": "Adicionar opção",
  "composePage.poll.maxReached": "{max} opções é o limite.",
  "composePage.poll.allowMultiple": "Permitir mais do que uma escolha",
  "composePage.poll.closesLabel": "Fecha",
  "composePage.poll.closes.never": "Nunca",
  "composePage.poll.closes.3d": "3 dias",
  "composePage.poll.closes.1w": "1 semana",
  "composePage.poll.closes.2w": "2 semanas",

  // ── Onde fica? (a grelha de categorias) ──────────────────────────────────
  // Uma linha debaixo de cada categoria.
  "composePage.section.category.title": "Onde fica?",
  "composePage.section.category.hint":
    "As pessoas encontram o fórum por categoria.",
  "composePage.category.general.description":
    "Tudo o que não cabe noutro sítio",
  "composePage.category.housing.description":
    "Casas, quartos, senhorios, burlas",
  "composePage.category.health.description":
    "Médicos, clínicas, terapia, saúde mental",
  "composePage.category.arts.description":
    "Cinema, música, exposições, criação",
  "composePage.category.activism.description": "Ideias, campanhas e propostas",
  "composePage.category.guides.description": "Manuais e índices vivos",
  "composePage.category.jobs.description": "Vagas, competências, ofícios",
  "composePage.category.trans.description": "Saúde, legal, comunidade",
  "composePage.category.meetups.description": "Diz olá, encontra com quem ir",
  "composePage.category.legal.description":
    "Vistos, residência, mudança de nome, direitos",
  "composePage.category.relationships.description":
    "Namoro, relações, família, amizade",
  "composePage.category.funding.description":
    "Concursos abertos, candidaturas, angariação de fundos e como financiar o teu projeto.",
  "composePage.category.platform.description":
    "Erros, ideias, como funciona o site",
  "composePage.category.fallbackDescription":
    "Um sítio para publicações sobre este tema",
  "composePage.category.suggestion": "Parece ser {category}",
  "composePage.category.recentIn": "Há pouco em {category}",

  // ── Quem vê? (a lista de público) ────────────────────────────────────────
  "composePage.section.audience.title": "Quem vê?",
  "composePage.section.audience.hint":
    "Toda a gente, ou uma das tuas comunidades.",
  "composePage.audience.townSquare": "A praça",
  "composePage.audience.townSquareSub": "Todos os membros veem no fórum.",
  "composePage.audience.private": "Privada",
  "composePage.audience.privateSub":
    "Só os membros conseguem ler ou encontrar isto.",
  "composePage.audience.openSub": "Qualquer membro consegue ler aqui.",
  "composePage.audience.memberCount_one": "{count} membro",
  "composePage.audience.memberCount_other": "{count} membros",
  "composePage.audience.crossPost": "Mostrar também na praça",
  "composePage.audience.crossPostHint":
    "Os membros de fora da comunidade veem no fórum, e a comunidade fica com a sua própria cópia.",

  // ── Detalhes ─────────────────────────────────────────────────────────────
  // `details.language.*` é construído com t(`…details.language.${choice}`)
  // sobre as três escolhas e sobre a língua detetada, e `closeAfter.*` com
  // t(`…closeAfter.${choice}`) sobre `CloseAfter`, por isso todos os sufixos
  // têm de existir. `section.optional` é partilhado pelos cabeçalhos de
  // Detalhes e Etiquetas. Todos os outros bairros são nomes próprios e ficam
  // como valores.
  "composePage.section.details.title": "Detalhes",
  "composePage.section.details.hint":
    "Só aparece aqui o que se aplica a esta publicação.",
  "composePage.section.optional": "opcional",
  "composePage.details.language": "Idioma",
  "composePage.details.language.pt": "Português",
  "composePage.details.language.en": "Inglês",
  "composePage.details.language.both": "PT + EN",
  "composePage.details.languageDetected": "Isto parece estar em {language}.",
  "composePage.details.neighbourhood": "Bairro",
  "composePage.details.neighbourhoodHint":
    "Coloca isto no mapa e nos filtros locais.",
  "composePage.details.closeAfter": "Fechar automaticamente",
  "composePage.details.closeAfterHint":
    "Uma publicação com prazo fecha-se sozinha, e recebes um aviso para a renovar.",
  "composePage.closeAfter.never": "Nunca",
  "composePage.closeAfter.2w": "2 semanas",
  "composePage.closeAfter.30d": "30 dias",
  "composePage.closeAfter.90d": "90 dias",
  "composePage.closeAfter.poll": "Quando a votação fechar",
  "composePage.neighbourhood.other": "Outro",

  // ── Etiquetas ────────────────────────────────────────────────────────────
  "composePage.section.tags.title": "Etiquetas",
  "composePage.section.tags.hint": "Como as pessoas encontram isto mais tarde.",
  "composePage.tags.counter": "{count}/{max}",
  "composePage.tags.full": "Já tens as {max} etiquetas.",
  "composePage.tags.suggestLabel": "Sugestões",

  // ── A coluna lateral ─────────────────────────────────────────────────────
  "composePage.rail.label": "Pré-visualização e verificações",
  "composePage.rail.lead":
    "Vê como vai ficar, se já foi perguntado e o que ainda falta.",
  "composePage.rail.tabsLabel": "Que painel mostrar",
  "composePage.rail.tabPreview": "Pré-visualizar",
  "composePage.rail.tabSimilar": "Parecidas",
  "composePage.rail.tabChecklist": "Pronto",
  "composePage.rail.note":
    "Sê gentil, sê útil. Podes editar depois de publicares e podes retirar a tua publicação.",
  "composePage.rail.houseRules": "Regras da casa",

  // ── A publicar como ──────────────────────────────────────────────────────
  // `{categories}` chega já unido por `Intl.ListFormat`.
  "composePage.postingAs.heading": "A publicar como",
  "composePage.postingAs.officialSwitch": "Publicar como QueerPulse Official",
  "composePage.postingAs.officialSub":
    "Em nome da equipa, por {name}. A assinatura diz isso.",
  "composePage.postingAs.anonymousSub":
    "O teu nome fica escondido. Os moderadores continuam a ver que és tu.",
  "composePage.postingAs.yourNameSub": "O teu nome, ligado ao teu perfil",
  "composePage.postingAs.anonymousLabel": "Publicar sem o meu nome",
  "composePage.postingAs.anonymousHint":
    "Os moderadores continuam a ver quem escreveu, para a conversa continuar segura.",
  "composePage.postingAs.anonymousElsewhere":
    "Disponível em {categories}, onde um nome pode custar a alguém a casa, os cuidados de saúde ou a segurança.",
  "composePage.postingAs.anonymousBlockedByOfficial":
    "Desliga a assinatura QueerPulse Official para publicares sem o teu nome.",
  "composePage.postingAs.anonymousBlockedByAsk":
    "As angariações levam sempre o teu nome, para quem doa saber em quem confia.",
  "composePage.postingAs.coAuthorLabel": "Escreve com outra pessoa",
  "composePage.postingAs.coAuthorHint":
    "Essa pessoa pode editar o rascunho e aparece na assinatura.",
  "composePage.postingAs.coAuthorEmpty":
    "Ainda não há ninguém para juntar. Os coautores vêm dos membros com quem já escreves.",

  // ── O cartão de pré-visualização ─────────────────────────────────────────
  "composePage.postingAs.coAuthorSearch": "Procurar nas tuas conexões",
  "composePage.postingAs.coAuthorLoading": "A carregar as tuas conexões",
  "composePage.postingAs.coAuthorLoadError": "As tuas conexões não carregaram.",
  "composePage.postingAs.coAuthorChange": "Mudar",
  "composePage.postingAs.coAuthorRemove": "Tirar {name} da coautoria",
  "composePage.postingAs.coAuthorKeep": "Manter {name}",
  "composePage.preview.heading": "Como vai ficar",
  "composePage.preview.titlePlaceholder": "O teu título aparece aqui",
  "composePage.preview.excerptPlaceholder":
    "As primeiras linhas da tua publicação passam a ser o resumo que as pessoas leem na lista.",
  "composePage.preview.contentWarningPill": "Aviso · {warnings}",
  "composePage.preview.showAnyway": "Mostrar mesmo assim",
  "composePage.preview.hideAgain": "Esconder outra vez",
  "composePage.preview.officialName": "QueerPulse Official",
  "composePage.preview.officialVia": "via {name}",
  "composePage.preview.anonymousName": "Uma pessoa",
  "composePage.preview.withCoAuthor": "com {name}",
  "composePage.preview.pollPickOne": "Escolhe uma",
  "composePage.preview.pollPickMany": "Escolhe as que se aplicarem",
  "composePage.preview.pollNoVotes": "Ainda sem votos",
  "composePage.preview.seenByEveryone": "Visto por toda a gente na praça",
  "composePage.preview.seenByCommunity": "Visto pelos membros de {community}",
  "composePage.preview.seenByCommunityMembers_one":
    "Visto por {formatted} membro de {community}",
  "composePage.preview.seenByCommunityMembers_other":
    "Visto por {formatted} membros de {community}",
  "composePage.preview.seenByEveryoneAndCommunity":
    "Visto por toda a gente, e fixado em {community}",
  "composePage.preview.linkUnfurlPlaceholder":
    "A pré-visualização do link aparece aqui depois de publicares.",

  // ── Já se fala disto? ────────────────────────────────────────────────────
  // `replyInsteadContext` é acrescentado, invisível, a seguir ao texto do
  // botão, para o nome acessível ler "Responder lá em vez disso: <título>".
  "composePage.similar.heading": "Já se fala disto?",
  "composePage.similar.count_one": "{formatted} encontrada",
  "composePage.similar.count_other": "{formatted} encontradas",
  "composePage.similar.prompt":
    "Enquanto escreves o título, aparecem aqui conversas que já cobrem o assunto, para te juntares em vez de começares do zero.",
  "composePage.similar.empty":
    "Nada parecido ainda. Parece que és a primeira pessoa.",
  "composePage.similar.why":
    "Se uma destas é a tua pergunta, responder lá traz-te resposta mais depressa e mantém o fórum arrumado.",
  "composePage.similar.duplicateFlag": "A mesma pergunta",
  "composePage.similar.replyInstead": "Responder lá em vez disso",
  "composePage.similar.replyInsteadContext": ": {title}",
  "composePage.similar.announce_one": "{formatted} conversa já cobre isto",
  "composePage.similar.announce_other": "{formatted} conversas já cobrem isto",

  // ── Pronto a publicar (a lista) ──────────────────────────────────────────
  // `stateDone` / `stateToDo` ficam invisíveis em cada linha, e `progress` /
  // `allRequiredDone` é a única linha em direto de todo o bloco.
  "composePage.checklist.title": "Um título claro",
  "composePage.checklist.body": "Contexto suficiente para responder",
  "composePage.checklist.bodyHint_one": "falta {count} caractere",
  "composePage.checklist.bodyHint_other": "faltam {count} caracteres",
  "composePage.checklist.category": "Uma categoria",
  "composePage.checklist.kind": "Tipo de publicação",
  "composePage.checklist.tag": "Uma ou duas etiquetas",
  "composePage.checklist.heading": "Pronto a publicar",
  "composePage.checklist.stateDone": "feito",
  "composePage.checklist.stateToDo": "ainda por fazer",
  "composePage.checklist.progress":
    "{done} de {total} passos obrigatórios feitos",
  "composePage.checklist.allRequiredDone": "Está feito tudo o que é preciso.",

  // ── O rodapé e o que trava a publicação ──────────────────────────────────
  "composePage.foot.ready": "Pronto a publicar",
  "composePage.foot.seeAbove": "Vê a nota acima para publicares.",
  "composePage.foot.notReady":
    "Adiciona um título, contexto suficiente e uma categoria para publicares.",
  "composePage.foot.shortcutHint": "para publicar",
  "composePage.foot.statusLabel": "Estado do rascunho",
  "composePage.blocker.duplicateTitle":
    "Parece repetida. Responde lá, ou muda o título.",
  "composePage.blocker.unacknowledgedDoxxing":
    "Confirma a verificação da morada acima para publicar.",
  "composePage.blocker.pollNeedsTwoOptions":
    "Uma votação precisa de pelo menos duas opções.",
  "composePage.blocker.tooManyPhotos":
    "Quatro fotos é o limite. Remove uma para publicar.",
  "composePage.blocker.fundingIncomplete":
    "Junta o link, a entidade, o âmbito e o prazo (ou marca Sem prazo fixo).",
  "composePage.blocker.fundingAskIncomplete":
    "Junta o link, o objetivo, para que é e para quem é.",
  "composePage.blocker.fundingLinkInvalid":
    "O link tem de começar por https://.",
  "composePage.blocker.fundingAmountOrder":
    "Usa euros inteiros, com o montante máximo igual ou acima do mínimo.",
  "composePage.blocker.fundingDeadlineRange":
    "Escolhe um prazo entre agora e daqui a dois anos.",
  "composePage.blocker.fundingEndsOnRange":
    "Escolhe um último dia dentro do próximo ano.",
  "composePage.blocker.fundingDuplicate":
    "Este concurso já foi publicado. Escolhe Publicar na mesma para o publicares outra vez.",
  "composePage.blocker.fundingHostNotAllowed":
    "As angariações só podem ter link para {hosts}.",
  "composePage.blocker.fundingPaymentDetails":
    "Tira o IBAN ou o número de telemóvel. As doações passam pela página de angariação.",
  "composePage.blocker.fundingVerification":
    "As angariações precisam de um telemóvel verificado.",

  // ── O menu de publicação ─────────────────────────────────────────────────
  // Construído com t(`…publishMenu.${mode}.label`) sobre `PublishMode`, por
  // isso os três modos precisam das duas metades.
  "composePage.publishMenu.triggerAria": "Mais formas de publicar",
  "composePage.publishMenu.now.label": "Publicar agora",
  "composePage.publishMenu.now.sub":
    "Fica online logo. Tens trinta segundos para desfazer.",
  "composePage.publishMenu.schedule.label": "Agendar…",
  "composePage.publishMenu.schedule.sub":
    "Escolhe o dia e a hora. Bom para anúncios.",
  "composePage.publishMenu.review.label":
    "Pedir a um moderador para ler primeiro",
  "composePage.publishMenu.review.sub":
    "Para guias e assuntos delicados. Normalmente dentro de um dia.",

  // ── Partilhado pelas janelas ─────────────────────────────────────────────
  "composePage.overlay.back": "Voltar",
  "composePage.overlay.close": "Fechar",

  // ── Guardar isto como rascunho? ──────────────────────────────────────────
  // `confirmClose.body` leva um trecho <b> e é desenhado com <Translation>.
  "composePage.confirmClose.title": "Guardar isto como rascunho?",
  "composePage.confirmClose.body":
    "Guardamos <b>{summary}</b> tal como está. Vai estar aqui da próxima vez que abrires Nova publicação, em qualquer dispositivo.",
  "composePage.confirmClose.bodyUntitled":
    "Guardamos o que escreveste tal como está. Vai estar aqui da próxima vez que abrires Nova publicação, em qualquer dispositivo.",
  "composePage.confirmClose.discard": "Descartar",
  "composePage.confirmClose.keepWriting": "Continuar a escrever",
  "composePage.confirmClose.keepDraft": "Guardar rascunho",

  // ── A revisão da primeira publicação ─────────────────────────────────────
  "composePage.firstPost.title":
    "A tua primeira publicação. <em>Damos uma vista de olhos?</em>",
  "composePage.firstPost.sub":
    "Só desta vez, para saberes exatamente o que sai e quem vê.",
  "composePage.firstPost.rowTitle": "Título",
  "composePage.firstPost.rowCategory": "Categoria",
  "composePage.firstPost.rowAudience": "Quem vê",
  "composePage.firstPost.rowPostingAs": "A publicar como",
  "composePage.firstPost.rowWarnings": "Avisos de conteúdo",
  "composePage.firstPost.rowPhotos": "Fotos",
  "composePage.firstPost.photoCount_one": "{count} foto",
  "composePage.firstPost.photoCount_other": "{count} fotos",
  "composePage.firstPost.skip": "Não mostrar outra vez",
  "composePage.firstPost.confirm": "Está certo, publicar",

  // ── Agendar ──────────────────────────────────────────────────────────────
  "composePage.schedule.title": "Agendar esta publicação",
  "composePage.schedule.sub":
    "Publica-se sozinha à hora que escolheres, com o mesmo nome e o mesmo público. Até lá fica nos teus rascunhos.",
  "composePage.schedule.fieldLabel": "Dia e hora",
  "composePage.schedule.helper": "As horas aparecem no teu fuso horário.",
  "composePage.schedule.errorMissing": "Escolhe primeiro um dia e uma hora.",
  "composePage.schedule.errorPast":
    "Escolhe um momento que ainda esteja para chegar.",
  "composePage.schedule.errorTooFar":
    "O agendamento vai até um ano à frente. Escolhe um dia mais perto.",
  "composePage.schedule.confirm": "Agendar",

  // ── Responder lá em vez disso? ───────────────────────────────────────────
  "composePage.replyInstead.title": "Responder <em>lá</em>?",
  "composePage.replyInstead.body":
    "O teu texto passa para <b>{title}</b> como resposta. Quem já segue essa conversa fica a saber, e esse costuma ser o caminho mais rápido para uma resposta.",
  "composePage.replyInstead.previewLabel": "A tua resposta",
  "composePage.replyInstead.emptyPreview": "Ainda não escreveste nada.",
  "composePage.replyInstead.keep": "Manter a minha publicação",
  "composePage.replyInstead.move": "Mover como resposta",

  // ── Atalhos de teclado ───────────────────────────────────────────────────
  "composePage.shortcuts.title": "Atalhos de teclado",
  "composePage.shortcuts.publish": "Publicar",
  "composePage.shortcuts.close": "Fechar. O teu rascunho fica guardado.",
  "composePage.shortcuts.format": "Negrito ou itálico",
  "composePage.shortcuts.mention":
    "Mencionar um membro ou adicionar uma etiqueta",
  "composePage.shortcuts.move": "Andar entre categorias e públicos",
  "composePage.shortcuts.nextField":
    "Campo seguinte. O foco fica dentro da página.",
  "composePage.shortcuts.thisList": "Esta lista",

  // ── Publicado ────────────────────────────────────────────────────────────
  // As três chaves `*Title` levam o trecho coral <em>.
  "composePage.success.townSquare": "a praça",
  "composePage.success.nowTitle": "Publicado em <em>{audience}</em>",
  "composePage.success.nowBody":
    "A tua conversa está no topo do fórum. Os membros podem responder, votar e ajudar. Tens trinta segundos para a retirar.",
  "composePage.success.nowBodyPermanent":
    "Os membros já foram avisados. A partir de agora, edita ou retira a publicação na própria conversa.",
  "composePage.success.unpublish": "Despublicar",
  "composePage.success.scheduledTitle": "Agendado para <em>{when}</em>",
  "composePage.success.scheduledBody":
    "Fica nos teus rascunhos até lá. Podes editar ou cancelar por lá.",
  "composePage.success.reviewTitle": "Enviado para <em>a moderação</em>",
  "composePage.success.reviewBody":
    "Alguém da equipa lê dentro de um dia, normalmente mais cedo. Vais ter resposta de qualquer forma e, até lá, fica nos teus rascunhos.",
  "composePage.success.shareLabel": "Partilhar esta publicação",
  "composePage.success.copyLink": "Copiar link",
  "composePage.success.linkCopiedToast": "Link copiado.",
  "composePage.success.linkCopyFailedToast":
    "Não deu para copiar. Seleciona o link e copia à mão.",
  "composePage.success.whatsApp": "WhatsApp",
  "composePage.success.opensInNewTab": "(abre num separador novo)",
  "composePage.success.pinToProfile": "Afixar no meu perfil",
  "composePage.success.postToCommunity": "Publicar também numa comunidade",
  "composePage.success.followReplies": "Avisa-me quando alguém responder",
  "composePage.success.viewPost": "Ver publicação",

  // ── Financiamento e Apoios (concursos abertos, angariações) ──────────────
  "funding.eligibility.individuals": "Pessoas a título individual",
  "funding.eligibility.collectives": "Coletivos",
  "funding.eligibility.associations": "Associações (incluindo IPSS)",
  "funding.eligibility.companies": "Empresas",
  "funding.eligibility.students": "Estudantes",
  "funding.scope.local": "Local",
  "funding.scope.national": "Nacional",
  "funding.scope.eu": "UE",
  "funding.scope.international": "Internacional",
  "funding.purpose.healthcare": "Saúde",
  "funding.purpose.housing": "Habitação",
  "funding.purpose.legal": "Custos jurídicos",
  "funding.purpose.emergency": "Emergência",
  "funding.purpose.project": "Um projeto",
  "funding.purpose.event": "Um evento",
  "funding.beneficiary.self": "Para mim",
  "funding.beneficiary.someoneIKnow": "Para alguém que conheço",
  "funding.beneficiary.project": "O próprio projeto",
  "funding.view.heading": "Encontrar financiamento",
  "funding.view.all": "Tudo",
  "funding.view.open": "Concursos abertos",
  "funding.view.closing": "A fechar em breve",
  "funding.view.asks": "Angariações",
  "funding.view.discussion": "Conversa",
  "funding.filter.eligibilityLabel": "Quem se pode candidatar",
  "funding.filter.scopeLabel": "Onde",
  "funding.filter.anyScope": "Qualquer lado",
  "funding.filter.clear": "Limpar filtros",
  "funding.amount.range": "{min} a {max}",
  "funding.amount.upTo": "Até {max}",
  "funding.amount.from": "A partir de {min}",
  "funding.deadline.rolling": "Sem prazo fixo",
  "funding.deadline.stale": "Sem prazo fixo, atualizado a {date}",
  "funding.deadline.closesOn": "Fecha a {date}",
  "funding.deadline.closesInDays_one": "Fecha daqui a {count} dia",
  "funding.deadline.closesInDays_other": "Fecha daqui a {count} dias",
  "funding.deadline.closesInHours_one": "Fecha daqui a {count} hora",
  "funding.deadline.closesInHours_other": "Fecha daqui a {count} horas",
  "funding.deadline.closesWithinHour": "Fecha dentro de uma hora",
  "funding.deadline.closed": "Fechou a {date}",
  "funding.row.eligibilityAria": "Quem se pode candidatar",
  "funding.facts.heading": "Sobre este concurso",
  "funding.facts.funder": "Entidade",
  "funding.facts.amount": "Montante",
  "funding.facts.deadline": "Prazo",
  "funding.facts.lisbonTime": "{date}, hora de Lisboa",
  "funding.facts.yourTime": "No teu fuso horário: {date}",
  "funding.facts.eligibility": "Quem se pode candidatar",
  "funding.facts.scope": "Onde",
  "funding.facts.openCall": "Abrir o concurso",
  "funding.facts.seeCall": "Ver o concurso",
  "funding.facts.seeCallAria":
    "Ver o concurso em {host} (abre num novo separador)",
  "funding.facts.openCallAria":
    "Abrir o concurso em {host} (abre num novo separador)",
  "funding.facts.saveHint": "Guarda-o e lembramos-te 7 dias e 1 dia antes.",
  "funding.facts.editDetails": "Editar detalhes",
  "funding.compose.heading": "Sobre o concurso",
  "funding.compose.link": "Link para o concurso",
  "funding.compose.linkHint":
    "A página da própria entidade, a começar por https://",
  "funding.compose.funder": "Entidade financiadora",
  "funding.compose.amountMin": "De (€)",
  "funding.compose.amountMax": "Até (€)",
  "funding.compose.amountHint":
    "Euros inteiros. Deixa em branco se o concurso não disser.",
  "funding.compose.deadline": "Prazo, hora de Lisboa",
  "funding.compose.rolling": "Sem prazo fixo",
  "funding.compose.eligibility": "Quem se pode candidatar",
  "funding.compose.scope": "Onde",
  "funding.compose.callGuidance":
    "Apoios verdadeiros nunca cobram para te candidatares.",
  "funding.compose.checking": "A ver se este concurso já foi publicado…",
  "funding.compose.duplicate":
    "Este concurso já foi publicado: {title}. Queres responder lá?",
  "funding.compose.goToIt": "Ir para lá",
  "funding.compose.postAnyway": "Publicar na mesma",
  "funding.compose.askHeading": "Sobre a angariação",
  "funding.compose.askLink": "Link para a página de angariação",
  "funding.compose.askLinkHint": "Uma destas: {hosts}",
  "funding.compose.goal": "Objetivo (€)",
  "funding.compose.purpose": "Para que é",
  "funding.compose.beneficiary": "Para quem é",
  "funding.compose.endsOn": "Último dia (opcional)",
  "funding.compose.endsOnHint":
    "Sem data, termina sozinha 90 dias depois de aprovada.",
  "funding.compose.askReview":
    "A moderação verifica cada angariação antes de ser publicada.",
  "funding.gate.title": "Verifica o teu telemóvel para começar uma angariação",
  "funding.gate.body":
    "As angariações precisam de um telemóvel verificado para quem doa saber em quem confia.",
  "funding.gate.cta": "Pedir verificação",
  "funding.gate.checking": "A confirmar a tua verificação…",
  "funding.ask.heading": "Sobre esta angariação",
  "funding.ask.goal": "Objetivo",
  "funding.ask.purpose": "Para",
  "funding.ask.endsOn": "Último dia",
  "funding.ask.safetyStrip":
    "O QueerPulse nunca mexe em dinheiro. As doações vão para {host}. Verificada pela moderação a {date}.",
  "funding.ask.safetyStripPending":
    "O QueerPulse nunca mexe em dinheiro. As doações vão para {host}. A moderação verifica-a antes de ser publicada.",
  "funding.ask.donate": "Doar em {host}",
  "funding.ask.donateAria": "Doar em {host} (abre num novo separador)",
  "funding.ask.markGoalReached": "Marcar objetivo atingido",
  "funding.ask.close": "Fechar angariação",
  "funding.ask.confirmGoalTitle":
    "Marcar esta angariação como objetivo atingido?",
  "funding.ask.confirmCloseTitle": "Fechar esta angariação?",
  "funding.ask.confirmBody":
    "Sai da lista de angariações e o botão para doar desaparece. Não dá para desfazer.",
  "funding.ask.confirmGoal": "Marcar objetivo atingido",
  "funding.ask.confirmClose": "Fechar",
  "funding.ask.endedGoal": "Objetivo atingido. Agradecemos a quem contribuiu.",
  "funding.ask.ended": "Esta angariação terminou.",
  "funding.ask.sentBack":
    "Enviada de novo para a moderação. A tua edição esconde a angariação até ser verificada outra vez.",
  "funding.ask.goalToast": "Marcada como objetivo atingido",
  "funding.ask.closedToast": "Angariação fechada",
  "funding.ask.endFailed": "Não foi possível guardar. Tenta outra vez.",
  "funding.row.goal": "Objetivo de {amount}",
  "funding.row.onHost": "em {host}",
  "funding.row.checked": "Verificada pela moderação",
  "funding.row.ended": "Terminada",
  "funding.error.kindCategory":
    "Concursos e angariações ficam em Financiamento e Apoios.",
  "funding.error.detailsRequired":
    "Faltam alguns detalhes. Revê os campos acima.",
  "funding.error.detailsNotAllowed":
    "Só concursos e angariações levam estes detalhes.",
  "funding.error.linkInvalid":
    "Esse link não funcionou. Usa o endereço completo, a começar por https://.",
  "funding.error.linkHostNotAllowed":
    "As angariações só podem ter link para {hosts}.",
  "funding.error.paymentDetails":
    "Tira o IBAN ou o número de telemóvel. As doações passam pela página de angariação.",
  "funding.error.askNotAnonymous":
    "As angariações não podem ser anónimas, para quem doa saber em quem confia.",
  "funding.error.verificationRequired":
    "As angariações precisam de um telemóvel verificado para quem doa saber em quem confia.",
  "funding.error.askLimit":
    "Já tens uma angariação aberta ou à espera de revisão. Termina-a antes de começares outra.",
  "funding.edit.title": "Editar detalhes do concurso",
  "funding.edit.save": "Guardar detalhes",
  "funding.edit.cancel": "Cancelar",
  "funding.edit.saved": "Detalhes guardados",
  "funding.edit.failed": "Não foi possível guardar. Tenta outra vez.",
  "funding.edit.titleAsk": "Editar detalhes da angariação",
  "funding.edit.askReviewNote":
    "Ao guardar, a angariação volta à moderação antes de aparecer outra vez.",
  "funding.follow.follow": "Seguir novos concursos",
  "funding.follow.following": "A seguir novos concursos",
  "funding.empty.open.title": "Não há concursos abertos agora",
  "funding.empty.open.body":
    "Quando alguém partilha uma bolsa, um apoio ou uma residência, aparece aqui.",
  "funding.empty.closing.title": "Nada fecha esta semana",
  "funding.empty.closing.body":
    "Os concursos com prazo nos próximos 7 dias aparecem aqui.",
  "funding.empty.asks.title": "Não há angariações agora",
  "funding.empty.asks.body":
    "Quem tem a conta verificada pode pedir apoio à comunidade. A moderação revê cada pedido primeiro.",
  "funding.empty.discussion.title": "Ainda não há conversas",
  "funding.empty.discussion.body":
    "Dúvidas sobre candidaturas, orçamentos e associações ficam aqui.",
  "funding.empty.clearFilters": "Limpar filtros",
  "funding.empty.seeAll": "Ver todas as publicações de financiamento",
  "funding.empty.postCall": "Partilhar um concurso aberto",
  "funding.ask.authorControls": "A tua angariação",
  "funding.follow.followedToast": "Vais saber dos novos concursos",
  "funding.follow.unfollowedToast": "Deixas de saber dos novos concursos",
};
