import type { Catalog } from "../../types";

/** pt-PT — see `en/topics.ts` for the scope-rule note (posts + curated
 * descriptions stay English; only chrome is translated here). */
export const topics: Catalog = {
  "common.eyebrow": "Tópico",

  "stats.posts": "Publicações",
  "stats.membersFollowing": "Pessoas a seguir",
  "stats.thisWeek": "Esta semana",
  "stats.verifiedResources": "Recursos verificados",
  "stats.coopsForming": "Cooperativas em formação",
  "stats.saferSpaceVenues": "Espaços mais seguros",
  "stats.newValue": "Novo",

  "header.followCta": "Seguir tópico",
  "header.followingCta": "A seguir",
  "header.writePostCta": "Escrever uma publicação",
  "header.followToast": "Agora a seguir #{tag}",
  "header.unfollowToast": "Já não segues #{tag}",
  "header.followFailedToast":
    "Não foi possível atualizar. Tenta novamente daqui a pouco.",
  "header.followCapToast":
    "Já segues tantos tópicos quantos uma conta pode ter. Deixa de seguir um para abrires espaço para este.",
  "header.followInvalidToast": "Essa etiqueta não é uma que possamos seguir.",

  "feed.filters.all": "Todas",
  "feed.filters.threads": "Threads",
  "feed.filters.recommendations": "Recomendações",
  "feed.filters.articles": "Artigos",
  "feed.filters.events": "Eventos",
  "feed.filters.resources": "Recursos",
  "feed.loadOlder_one": "Carregar {count} publicação mais antiga",
  "feed.loadOlder_other": "Carregar {count} publicações mais antigas",
  "feed.loadingMore": "A carregar…",
  "feed.loadMoreCta": "Carregar publicações mais antigas",

  "postKind.asking": "Pergunta",
  "postKind.recommend": "Recomendação",
  "postKind.warn": "Aviso",
  "postKind.article": "Artigo",
  "postKind.event": "Evento",
  "postKind.thread": "Thread",

  "sidebar.relatedTitle": "Tópicos relacionados",
  "sidebar.topVoicesTitle": "Vozes em destaque aqui",

  "fallback.sub":
    "Publicações, perguntas e recomendações com a etiqueta <strong>#{tag}</strong> de toda a comunidade QueerPulse.",
  "fallback.postMeta": "Sê quem começa",
  "fallback.postTitle":
    "Ainda ninguém publicou com <em>#{tag}</em>. Queres começar a conversa?",
  "fallback.postBody":
    "Os tópicos crescem quando alguém dá o primeiro passo. Publica uma pergunta, uma recomendação ou um recurso com #{tag} e aparece aqui mesmo.",
  "fallback.postStats": "<b>0</b> publicações · à tua espera",

  "notFound.title": "Este tópico não está aqui",
  "notFound.description":
    "Não encontrámos um tópico para essa etiqueta. Pode ter sido renomeado ou removido. Volta ao fórum para veres onde a conversa continua.",
  "notFound.backCta": "Voltar ao fórum",

  "error.title": "Não foi possível carregar este tópico",
  "error.description":
    "Algo correu mal do nosso lado. A culpa não é tua. Tenta novamente daqui a pouco.",
  "error.retryCta": "Tentar novamente",

  "directory.eyebrow": "Tópicos",
  "directory.loadError.title": "Não conseguimos carregar <em>os tópicos</em>",
  "directory.loadError.body":
    "A lista não chegou de volta. Os tópicos continuam todos lá. Tenta outra vez daqui a pouco.",
  "directory.title": "Cada conversa, pela etiqueta.",
  "directory.sub":
    "Segue um tópico e ficas a saber assim que alguém publicar nele.",
  "directory.search.placeholder": "Procurar tópicos",
  "directory.search.ariaLabel": "Procurar tópicos",
  "directory.postsCount_one": "{count} publicação",
  "directory.postsCount_other": "{count} publicações",
  "directory.empty.search.title": "Nenhum tópico corresponde",
  "directory.empty.search.description":
    "Tenta outro termo de pesquisa, ou limpa-o para ver todos os tópicos.",
  "directory.empty.search.cta": "Limpar pesquisa",
  "directory.empty.none.title": "Ainda não há tópicos",
  "directory.empty.none.description":
    "Ainda não há nada no diretório. Volta a verificar em breve.",
};
