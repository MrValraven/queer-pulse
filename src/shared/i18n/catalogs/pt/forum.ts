import type { Catalog } from "../../types";

/**
 * Cópia do Fórum ("os comuns"). `THREADS` (títulos, resumos, corpo dos posts,
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

  // ── As três pessoas moderadoras que publicam em nome do QueerPulse ───────
  "modRole.mariana": "moderação principal",
  "modRole.rui": "moderação",
  "modRole.ana": "moderação (meio período)",

  // ── Ordenação de respostas (o id canónico mantém-se em inglês) ───────────
  "replySort.oldest": "Mais antigas",
  "replySort.newest": "Mais recentes",
  "replySort.mostHelpful": "Mais úteis",

  // ── Hero da ForumPage ───────────────────────────────────────────────────
  "hero.eyebrow": "A Praça Pública · aberta a todas as pessoas da comunidade",
  "hero.title": "Os <em>comuns</em>",
  "hero.lead":
    "A única comunidade a que todas as pessoas aqui pertencem — perguntas, propostas, guias, e o trabalho lento de construir um movimento. Cuidem-se. Estás à procura de uma sala mais pequena?",
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
    "O fórum só é tão bom quanto aquilo que as pessoas trazem para ele. Não precisas de nada grandioso — uma pergunta, uma recomendação, algo que reparaste. Tudo conta. Aqui ficam algumas coisas que costumam ser úteis partilhar:",
  "firstPost.writeCta": "Escreve a tua primeira publicação",
  "firstPost.maybeLater": "Talvez mais tarde",
  "firstPost.dismissAria": "Dispensar",
  "firstPost.starter.gp": "Estou à procura de um médico de família que…",
  "firstPost.starter.recommendation": "Alguém conhece um bom…",
  "firstPost.starter.justMoved": "Acabei de me mudar para Lisboa e…",
  "firstPost.starter.anyoneTried": "Alguém já experimentou…",
  "firstPost.starter.flatmates": "Procuro colegas de casa em…",

  // ── ComposeThreadModal ──────────────────────────────────────────────────
  "compose.confirmTitle": "Publicado <em>nos comuns</em>",
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
  "compose.communityNone": "Nenhuma — publicação global",
  "compose.postFieldLabel": "Publicação",
  "compose.postPlaceholder": "Escreve a tua publicação…",
  "compose.cancel": "Cancelar",
  "compose.publishCta": "Publicar",

  // ── ComposeThreadModal · campo de etiquetas ─────────────────────────────
  "compose.tagsFieldLabel": "Etiquetas",
  "compose.tagsPlaceholder": "Adiciona uma etiqueta e pressiona Enter",
  "compose.tagsHint":
    "Até {max} etiquetas — mantém-nas simples, como #habitação ou #saúde.",
  "compose.removeTagAria": "Remover etiqueta {tag}",

  // ── Pesquisa do fórum ───────────────────────────────────────────────────
  "search.placeholder": "Pesquisar no fórum…",
  "search.ariaLabel": "Pesquisar no fórum",
  "search.clearAria": "Limpar pesquisa",

  // ── ForumThreadList ─────────────────────────────────────────────────────
  "threadList.top": "Melhores",
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
  "threadList.emptyAll.title": "Sossegado por aqui — por agora",
  "threadList.emptyAll.description":
    "Os comuns estão abertos a todas as pessoas da comunidade. Sê quem começa a conversa.",
  "threadList.emptyAll.action": "Escrever uma publicação",
  "threadList.pinnedBadge": "Fixado",
  "threadList.upvoteAria": "Votar a favor",
  "threadList.removeUpvoteAria": "Remover voto",
  "threadList.loadingMore": "A carregar…",
  "threadList.loadMoreCta": "Carregar mais publicações",

  // ── Frase partilhada de contagem de respostas ────────────────────────────
  repliesCount_one: "{formatted} resposta",
  repliesCount_other: "{formatted} respostas",

  // ── ReportReplyModal ────────────────────────────────────────────────────
  "reportReply.confirmTitle": "Obrigade — <em>estamos a tratar disso.</em>",
  "reportReply.confirmBody":
    "Uma pessoa moderadora vai dar uma vista de olhos. As denúncias mantêm-se privadas, e {name} não vai saber que foste tu a denunciar.",
  "reportReply.done": "Concluído",
  "reportReply.title": "Denunciar esta resposta",
  "reportReply.sub":
    "Conta a uma pessoa moderadora o que está errado com a resposta de {name}. Isto é privado — ninguém é notificado de que denunciaste.",
  "reportReply.reasonGroupAria": "Motivo da denúncia",
  "reportReply.cancel": "Cancelar",
  "reportReply.sending": "A enviar…",
  "reportReply.sendCta": "Enviar denúncia",

  // ── ThreadComposer ──────────────────────────────────────────────────────
  "threadComposer.replyingTo": "A responder a <strong>{name}</strong>",
  "threadComposer.placeholder": "Escreve uma resposta…",
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

  // ── Tópico fechado (a moderação fechou as respostas) ────────────────────
  "locked.title": "Este tópico está fechado a novas respostas",
  "locked.body":
    "Uma pessoa moderadora fechou este tópico, por isso as respostas estão em pausa. Podes continuar a ler tudo aqui.",
  "locked.replyBlockedToast": "Este tópico está fechado a novas respostas.",

  // ── ThreadTopbar · controlo de fecho da moderação ───────────────────────
  "topbar.lockThread": "Fechar tópico",
  "topbar.unlockThread": "Reabrir tópico",

  // ── ThreadPage ──────────────────────────────────────────────────────────
  "threadPage.breadcrumbForum": "Fórum",
  "threadPage.replyPostedToast": "Resposta publicada",
  "threadPage.replyFailedToast":
    "Não foi possível publicar a tua resposta — tenta novamente daqui a pouco.",
  "threadPage.notFound.title": "Este tópico não está aqui",
  "threadPage.notFound.description":
    "Pode ter sido removido ou o link pode estar quebrado. Volta ao fórum para encontrares as conversas atuais.",
  "threadPage.notFound.backCta": "Voltar ao fórum",

  // ── ThreadReplies / ModeratorByline ─────────────────────────────────────
  "byline.withRole":
    "Escrito por <name>{name}</name>, {role} · em nome da equipa",
  "byline.noRole": "Escrito por <name>{name}</name> · em nome da equipa",
  "replies.emptyTitle": "Ainda sem respostas",
  "replies.emptyDescription":
    "Esta publicação está à espera da primeira voz. Sê quem responde primeiro — uma resposta cuidada vale muito.",
  "replies.emptyAction": "Escrever uma resposta",
  "replies.mostHelpfulBadge": "Mais útil",
  "replies.opBadge": "OP",
  "replies.unlikeAria": "Remover gosto desta resposta",
  "replies.likeAria": "Gostar desta resposta",
  "replies.loadingMore": "A carregar…",
  "replies.loadMoreCta": "Carregar mais respostas",

  // ── Respostas encadeadas (ação responder + recolher/expandir + continuar) ─
  "replies.reply": "Responder",
  "replies.collapseAria": "Recolher conversa",
  "replies.expandAria": "Expandir conversa",
  "replies.continueThread": "Continuar esta conversa ({count})",
  "replies.hiddenCount_one": "{count} resposta escondida",
  "replies.hiddenCount_other": "{count} respostas escondidas",

  // ── ForumAuthor ─────────────────────────────────────────────────────────
  "author.officialTitle": "Conta oficial do QueerPulse",
  "author.officialBadge": "Oficial",
  "author.aboutTeamAria": "Sobre a equipa e a governação do QueerPulse",
  "author.viewProfileAria": "Ver o perfil de {name}",

  // ── PostActionsMenu (⋯ overflow menu) ────────────────────────────────────
  "postMenu.edit": "Editar",
  "postMenu.delete": "Eliminar",
  "postMenu.restore": "Restaurar",
  "postMenu.history": "Ver histórico de edições",
  "postMenu.ariaLabel": "Ações da publicação",

  // ── Edited mark / deleted-post tombstone ─────────────────────────────────
  "edited.mark": "(editado)",
  "tombstone.body": "Esta publicação foi eliminada.",
  "tombstone.author": "[eliminado]",
  "tombstone.removedByModerator": "Esta publicação foi removida por um moderador.",

  // ── Inline reply edit ────────────────────────────────────────────────────
  "replyEdit.save": "Guardar",
  "replyEdit.cancel": "Cancelar",
  "replyEdit.saving": "A guardar…",
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
    "Fica escondida do tópico. Podes restaurá-la mais tarde — não se perde nada.",
  "deleteConfirm.confirm": "Eliminar",
  "deleteConfirm.cancel": "Manter",
  "deleteConfirm.deleting": "A eliminar…",

  // ── Edit history modal ────────────────────────────────────────────────────
  "history.title": "Histórico de edições",
  "history.empty": "Não há versões anteriores para mostrar.",
  "history.titleChange": "Título anterior: {title}",
  "history.close": "Fechar",

  // ── Toasts (edit / delete / restore / lock) ──────────────────────────────
  "toast.editSaved": "A tua edição está publicada.",
  "toast.deleted": "Publicação eliminada.",
  "toast.restored": "Publicação restaurada.",
  "toast.threadLocked": "Tópico fechado a novas respostas.",
  "toast.threadUnlocked": "Tópico reaberto.",
  "toast.error": "Algo correu mal. Tenta novamente daqui a pouco.",
};
