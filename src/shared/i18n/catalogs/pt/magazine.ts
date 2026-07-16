import type { Catalog } from "../../types";

/**
 * Revista — pt-PT inclusivo. Mesmas chaves que `en/magazine.ts`.
 *
 * Corpo dos artigos, títulos, resumos, citações em destaque, biografias de
 * autoria e assinaturas são conteúdo editorial: em modo live vêm da API como
 * texto de quem escreveu, por isso ficam em inglês nos ficheiros de dados e
 * NÃO passam por este catálogo. Só o chrome da plataforma (navegação,
 * cabeçalhos de secção, CTAs, UI de formulários/editor, vocabulário de
 * estado, vazios/erros) vive aqui.
 *
 * Registo `tu`, caloroso, nunca `você`. "Members" → *pessoas*, nunca
 * *Membros*.
 */
export const magazine: Catalog = {
  // ── Composição partilhada de formato (magazineFormat.ts) ─────────────────
  "format.minRead": "leitura de {count} min",
  "format.minReadApprox": "~ leitura de {count} min",
  "format.words_one": "{count} palavra",
  "format.words_other": "{count} palavras",
  "format.readsThisWeek": "{count} leituras esta semana",
  "format.published": "Publicado a {date}",
  "format.issueArticles_one": "Edição {issue} · {count} artigo",
  "format.issueArticles_other": "Edição {issue} · {count} artigos",
  "format.issueLabel": "Edição {number}",
  "format.min": "{count} min",

  // ── MagazineMasthead ─────────────────────────────────────────────────────
  "masthead.sectionsAriaLabel": "Secções da revista",
  "masthead.tagline": "Publicada no primeiro dia de cada mês",
  "masthead.nav.current": "Edição atual",
  "masthead.nav.issues": "Edições",
  "masthead.nav.covers": "Capas",
  "masthead.nav.longreads": "Reportagens longas",
  "masthead.nav.stories": "Histórias",
  "masthead.nav.newsletter": "Newsletter",
  "masthead.nav.write": "Escreve para nós",

  // ── MagazinePage ─────────────────────────────────────────────────────────
  "landing.meta.title": "A Revista — QueerPulse",
  "landing.meta.description":
    "Ensaios, reportagens, entrevistas e crítica da Lisboa queer — a revista da QueerPulse.",
  "landing.inIssueAriaLabel": "Nesta edição",
  "landing.inIssueLabel": "Nesta edição",
  "landing.nav.features": "Reportagens",
  "landing.nav.essays": "Ensaios",
  "landing.nav.interviews": "Entrevistas",
  "landing.nav.reviews": "Críticas",
  "landing.nav.communityLife": "Vida da comunidade",
  "landing.nav.letters": "Cartas",
  "landing.nav.archive": "Arquivo",
  "landing.subpageIndexTitle": "Mais da Revista",
  "landing.subpages.covers.label": "Galeria de capas",
  "landing.subpages.covers.blurb": "Todas as capas que já publicámos, num só lugar.",
  "landing.subpages.longreads.label": "Reportagens longas",
  "landing.subpages.longreads.blurb":
    "As nossas reportagens e ensaios mais longos e aprofundados.",
  "landing.subpages.newsletter.label": "Newsletter",
  "landing.subpages.newsletter.blurb":
    "Edições anteriores da newsletter da QueerPulse.",

  // ── MagazineCover ────────────────────────────────────────────────────────
  "cover.coverAlt": "Retrato de capa",
  "cover.coverPlaceholder": "Retrato de capa — a toda a largura, luz dramática",
  "cover.coverImageLabel": "Capa · junho de 2026",
  "cover.kicker": "Reportagem de capa · Reportagem",
  "cover.photographyBy": "Fotografia de",
  "cover.readFullFeatureCta": "Ler a reportagem completa",

  // ── MagazineSections ─────────────────────────────────────────────────────
  "sections.features.title": "As <em>reportagens</em> deste mês",
  "sections.features.allCta": "Todas as reportagens deste mês →",
  "sections.essayOfMonthKicker": "Ensaio do mês",
  "sections.readEssayCta": "Ler o ensaio",
  "sections.essays.title": "<em>Ensaios</em>",
  "sections.essays.allCta": "Todos os ensaios →",
  "sections.interviews.title": "<em>Entrevistas</em>",
  "sections.interviews.allCta": "Todas as entrevistas →",
  "sections.reviews.title": "<em>Críticas</em>",
  "sections.reviews.allCta": "Todas as críticas →",
  "sections.communityLife.title": "Vida <em>da comunidade</em>",
  "sections.communityLife.allCta": "Toda a vida da comunidade →",
  "sections.letters.title": "Cartas <em>à redação</em>",
  "sections.archive.title": "Edições <em>anteriores</em>",
  "sections.archive.allCta": "Todas as edições anteriores →",
  "sections.submit.title": "Escreve para <em>a revista.</em>",
  "sections.submit.body":
    "Publicamos ensaios, reportagens, críticas, entrevistas e opinião de pessoas da comunidade. Não é preciso qualquer credencial formal — só algo que valha a pena dizer.",
  "sections.submit.cta": "Propõe um texto",
  "sections.verdict.essential": "Essencial",
  "sections.verdict.recommended": "Recomendado",

  // ── ArticlePage ──────────────────────────────────────────────────────────
  "article.notFoundMetaTitle": "Artigo não encontrado — Revista QueerPulse",
  "article.notFoundTitle": "Não conseguimos encontrar este artigo.",
  "article.notFoundBody":
    "O artigo pode ter mudado de sítio, ou o link pode estar incompleto.",
  "article.notFoundCta": "Voltar à revista",
  "article.pageTitleSuffix": " — Revista QueerPulse",
  "article.backToMagazine": "← Revista",
  "article.relatedHeading": "Continua a <em>ler</em>",

  // ── relationReason() (data/articles.tsx) ────────────────────────────────
  "relation.sameAuthor": "Mesma autoria",
  "relation.sameTag": "Mesma etiqueta: {tag}",
  "relation.sameSection": "Mesma secção: {section}",
  "relation.editorsPick": "Escolha da redação",

  // ── ArticleToolbar ───────────────────────────────────────────────────────
  "toolbar.ariaLabel": "Ferramentas de leitura",
  "toolbar.textSizeGroupAriaLabel": "Ajustar o tamanho do texto",
  "toolbar.decreaseTextSizeAriaLabel": "Diminuir o tamanho do texto",
  "toolbar.increaseTextSizeAriaLabel": "Aumentar o tamanho do texto",
  "toolbar.removeFromReadingListAriaLabel": "Remover da lista de leitura",
  "toolbar.saveToReadingListAriaLabel": "Guardar na lista de leitura",
  "toolbar.savedCta": "Guardado",
  "toolbar.saveCta": "Guardar",
  "toolbar.copyLinkAriaLabel": "Copiar um link para este artigo",
  "toolbar.shareCta": "Partilhar",
  "toolbar.savedHint": "Na tua lista",
  "toolbar.savedToast": "Guardado na tua lista de leitura",
  "toolbar.removedToast": "Removido da tua lista de leitura",
  "toolbar.linkCopiedToast": "Link copiado",
  "toolbar.linkCopyErrorToast": "Não foi possível copiar o link",
  "toolbar.fallbackTitle": "Este artigo",

  // ── Issue chrome — partilhado por IssueCover, IssueContents, IssuesPage ──
  "issue.backToAllIssues": "← Todas as edições",
  "issue.currentPill": "Atual",
  "issue.badge": "Edição <em>{number}</em>",
  "issue.stats.featuresCount_one": "{count} reportagem",
  "issue.stats.featuresCount_other": "{count} reportagens",
  "issue.stats.pagesCount_one": "{count} página",
  "issue.stats.pagesCount_other": "{count} páginas",
  "issue.stats.contributorsCount_one": "{count} pessoa colaboradora",
  "issue.stats.contributorsCount_other": "{count} pessoas colaboradoras",
  "issue.stats.longReadCount_one": "{count} reportagem longa",
  "issue.stats.longReadCount_other": "{count} reportagens longas",
  "issue.stats.publishedPrefix": "Publicado a",
  "issue.coverAlt": "Capa da edição {number}",
  "issue.letterEyebrow": "Carta da direção editorial",
  "issue.readCta": "Ler a edição {number} →",
  "issue.orderPrintCta": "Encomendar a versão impressa · {price}",

  // ── IssueContents ────────────────────────────────────────────────────────
  "contents.heading.coverStory": "Reportagem de capa",
  "contents.heading.features": "Reportagens",
  "contents.heading.profiles": "Perfis",
  "contents.tocHeading": "Índice de <em>conteúdos</em>",
  "contents.pageLabel": "página",
  "contents.contributorsHeading": "Quem colaborou <em>nesta edição</em>",
  "contents.contributorsSubtitle_one":
    "{count} pessoa da comunidade fez a Edição {issue} — quem escreve, quem ilustra e quem editou tudo até dar liga.",
  "contents.contributorsSubtitle_other":
    "{count} pessoas da comunidade fizeram a Edição {issue} — quem escreve, quem ilustra e quem editou tudo até dar liga.",
  "contents.print.eyebrow": "Edição impressa",
  "contents.print.heading": "Segura-a <em>nas tuas mãos.</em>",
  "contents.print.body":
    "A Edição {issue} está disponível numa <b>tiragem limitada</b> — {pages} páginas, capa em risografia, impressa em Marvila. As pessoas da comunidade recebem-na ao preço de custo; as receitas financiam as pessoas colaboradoras da próxima edição.",
  "contents.print.orderCta": "Encomendar a edição impressa — {price}",
  "contents.print.readOnlineCta": "Ler online, grátis",
  "contents.print.imageAlt": "Simulação da edição impressa · Edição {issue}",

  // ── IssuesPage ───────────────────────────────────────────────────────────
  "issues.eyebrow": "Revista · todas as edições",
  "issues.heroTitle": "Nove edições, <em>trimestrais</em>, desde 2024.",
  "issues.heroDek":
    "Uma revista que não tem pressa. Impressão em risografia, grátis em PDF, paga em papel. Cada edição gira à volta de uma única pergunta — saúde, trabalho, a cidade, o que devemos umas às outras. As pessoas apoiantes recebem-na em casa, pelo correio.",
  "issues.stats.issuesPublished_one": "{count} edição publicada",
  "issues.stats.issuesPublished_other": "{count} edições publicadas",
  "issues.stats.articlesArchived_one": "{count} artigo arquivado",
  "issues.stats.articlesArchived_other": "{count} artigos arquivados",
  "issues.stats.contributorsAllTime_one": "{count} pessoa colaboradora ao todo",
  "issues.stats.contributorsAllTime_other":
    "{count} pessoas colaboradoras ao todo",
  "issues.stats.languagesTranslated_one": "{count} idioma traduzido",
  "issues.stats.languagesTranslated_other": "{count} idiomas traduzidos",
  "issues.current.eyebrow": "Edição atual · publicada a {date}",
  "issues.current.coverPlaceholder": "Capa da edição {number}",
  "issues.archiveHeading": "O <em>arquivo</em> completo",
  "issues.viewCoversCta": "Capas",
  "issues.viewListCta": "Lista",

  // ── AuthorPage ───────────────────────────────────────────────────────────
  "author.notFoundTitle": "Não conseguimos encontrar esta pessoa autora.",
  "author.notFoundBody":
    "Pode ter seguido caminho, ou o link pode estar incompleto.",
  "author.notFoundCta": "Voltar à revista",

  // ── AuthorHeader ─────────────────────────────────────────────────────────
  "author.followingToast": "A seguir {name}",
  "author.unfollowedToast": "Deixaste de seguir {name}",
  "author.followingCta": "A seguir",
  "author.followWriterCta": "Seguir esta pessoa",
  "author.portraitAlt": "Retrato de {slug}",
  "author.portraitPlaceholder": "Retrato",

  // ── AuthorWork ───────────────────────────────────────────────────────────
  "author.work.mostRecentHeading": "Mais recente · <em>em destaque</em>",
  "author.work.featuredImageAlt":
    "Imagem principal da história em destaque de {name}",
  "author.work.featuredImagePlaceholder": "História em destaque",
  "author.work.selectedWorkHeading": "Trabalho selecionado",
  "author.work.allArticlesCta_one": "Todos os {count} artigo →",
  "author.work.allArticlesCta_other": "Todos os {count} artigos →",
  "author.work.seeAllPicksCta": "Ver todas as escolhas →",
  "author.work.findElsewhereHeading": "Encontra {name} <em>noutros sítios</em>",

  // ── AudioPlayerPage tabs ─────────────────────────────────────────────────
  "audio.tabs.showNotes": "Notas do episódio",
  "audio.tabs.chapters": "Capítulos · {count}",
  "audio.tabs.transcript": "Transcrição",

  // ── AudioPlayerControls ──────────────────────────────────────────────────
  "audio.controls.previousChapter": "Capítulo anterior",
  "audio.controls.back15s": "-15s",
  "audio.controls.pause": "Pausar",
  "audio.controls.play": "Reproduzir",
  "audio.controls.forward30s": "+30s",
  "audio.controls.nextChapter": "Capítulo seguinte",
  "audio.controls.saveCta": "Guardar",
  "audio.controls.likeCta": "Gosto",
  "audio.controls.sleepCta": "Suspender",
  "audio.controls.cancelSleepTimer": "Cancelar temporizador",

  // ── AudioPlayerMain ──────────────────────────────────────────────────────
  "audio.linkCopiedToast": "Link copiado",
  "audio.backToShow": "← Voltar ao podcast",
  "audio.shareTitle": "Partilhar",
  "audio.castTitle": "Cast / AirPlay",
  "audio.seekAriaLabel": "Avançar ou recuar",

  // ── AudioPlayerModals ────────────────────────────────────────────────────
  "audio.modal.closeAriaLabel": "Fechar",
  "audio.cast.connectedToast": "Ligado a {name}",
  "audio.cast.streamingTitle": "A transmitir para <em>{name}</em>",
  "audio.cast.playingOnDevice":
    "{kind} · o áudio está agora a tocar neste dispositivo.",
  "audio.cast.chooseAnotherCta": "Escolher outro",
  "audio.cast.doneCta": "Concluído",
  "audio.cast.eyebrow": "Cast · AirPlay",
  "audio.cast.nearbyDevicesTitle": "Dispositivos por perto",
  "audio.cast.pickDeviceSub":
    "Escolhe um altifalante ou ecrã para transmitir este episódio.",
  "audio.sleep.eyebrow": "Temporizador de suspensão",
  "audio.sleep.title": "Parar de reproduzir depois de…",
  "audio.sleep.sub":
    "A reprodução esbate-se e pausa quando o temporizador chega a zero.",
  "audio.sleep.minutesLabel": "minutos",
  "audio.sleep.turnOffCta": "Desligar temporizador",
  "audio.transcriptModal.eyebrow": "Transcrição · Episódio {number}",
  "audio.transcriptModal.title": "Pré-visualizar e transferir",
  "audio.transcriptModal.sub":
    "Transcrição completa com identificação de quem fala e marcas temporais.",
  "audio.transcriptModal.downloadCta": "Transferir .txt",
  "audio.transcriptModal.closeCta": "Fechar",

  // ── AudioPlayerTabs ──────────────────────────────────────────────────────
  "audio.tabs.searchPlaceholder": "Pesquisar na transcrição",
  "audio.tabs.autoScroll": "Deslocamento automático",
  "audio.tabs.autoScrollOn": "Deslocamento automático · ativo",
  "audio.tabs.downloadCta": "Transferir",
  "audio.tabs.nowPlaying": "Agora",
};
