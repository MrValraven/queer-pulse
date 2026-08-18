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
  "format.readsThisWeek": "{reads} leituras esta semana",
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
  "masthead.nav.stories": "Histórias",
  "masthead.nav.write": "Escreve para nós",

  // ── MagazinePage ─────────────────────────────────────────────────────────
  "landing.meta.title": "A Revista: QueerPulse",
  "landing.meta.description":
    "Ensaios, reportagens, entrevistas e crítica da Lisboa queer: a revista da QueerPulse.",
  "landing.inIssueAriaLabel": "Nesta edição",
  "landing.inIssueLabel": "Nesta edição",
  "landing.nav.features": "Reportagens",
  "landing.nav.essays": "Ensaios",
  "landing.nav.interviews": "Entrevistas",
  "landing.nav.reviews": "Críticas",
  "landing.nav.communityLife": "Vida da comunidade",
  "landing.nav.letters": "Cartas",
  "landing.nav.archive": "Arquivo",

  // ── MagazineCover ────────────────────────────────────────────────────────
  "cover.coverAlt": "Retrato de capa",
  "cover.coverPlaceholder": "Retrato de capa: a toda a largura, luz dramática",
  "cover.coverImageLabel": "Capa · junho de 2026",
  "cover.kicker": "Reportagem de capa · Reportagem",
  "cover.byline": "Por",
  "cover.photographyBy": "Fotografia de",
  "cover.readFullFeatureCta": "Ler a reportagem completa",

  // ── MagazineSections ─────────────────────────────────────────────────────
  "sections.features.title": "As <em>reportagens</em> deste mês",
  "sections.features.allCta": "Todas as reportagens deste mês",
  "sections.essayOfMonthKicker": "Ensaio do mês",
  "sections.readEssayCta": "Ler o ensaio",
  "sections.essays.title": "<em>Ensaios</em>",
  "sections.essays.allCta": "Todos os ensaios",
  "sections.interviews.title": "<em>Entrevistas</em>",
  "sections.interviews.allCta": "Todas as entrevistas",
  "sections.reviews.title": "<em>Críticas</em>",
  "sections.reviews.allCta": "Todas as críticas",
  "sections.communityLife.title": "Vida <em>da comunidade</em>",
  "sections.communityLife.allCta": "Toda a vida da comunidade",
  "sections.letters.title": "Cartas <em>à redação</em>",
  "sections.archive.title": "Edições <em>anteriores</em>",
  "sections.archive.allCta": "Todas as edições anteriores",
  "sections.submit.title": "Escreve para <em>a revista.</em>",
  "sections.submit.body":
    "Publicamos ensaios, reportagens, críticas, entrevistas e opinião de pessoas da comunidade. Não é preciso qualquer credencial formal: só algo que valha a pena dizer.",
  "sections.submit.cta": "Propõe um texto",
  "sections.verdict.essential": "Essencial",
  "sections.verdict.recommended": "Recomendado",
  // Em modo live ainda não há edições publicadas — um "brevemente" honesto
  // substitui os carrosséis de artigos fictícios (o mock fica no modo demo).
  "sections.emptyLive.title": "A revista está quase a chegar",
  "sections.emptyLive.description":
    "A nossa primeira edição está a caminho. Estamos a juntar ensaios, reportagens, entrevistas e críticas da comunidade. Volta em breve, ou propõe-nos algo para publicar.",

  // ── ArticlePage ──────────────────────────────────────────────────────────
  "article.notFoundMetaTitle": "Artigo não encontrado: Revista QueerPulse",
  "article.notFoundTitle": "Não conseguimos encontrar este artigo.",
  "article.notFoundBody":
    "O artigo pode ter mudado de sítio, ou o link pode estar incompleto.",
  "article.notFoundCta": "Voltar à revista",
  "article.pageTitleSuffix": ": Revista QueerPulse",
  "article.backToMagazine": "Revista",
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

  // ── Chrome do leitor de deck — DeckViewer, DeckControls, DeckPresentButton,
  // componentes de slide, e o bloco FeaturedDeck ───────────────────────────
  "deck.present": "Apresentar",
  "deck.close": "Fechar",
  "deck.next": "Slide seguinte",
  "deck.prev": "Slide anterior",
  "deck.slideCounter": "{current} / {total}",
  "deck.goToSlide": "Ir para o slide {n}",
  "deck.tapToReveal": "Toque para revelar",
  "deck.beforeAfterHint": "Arraste para comparar",
  "deck.end": "Chegou ao fim",
  "deck.backToMagazine": "Voltar à revista",
  "deck.badge": "Interativo",
  "deck.start": "Começar a história",

  // ── Editor de decks — DeckMetaForm, DeckSlidesEditor, SlideEditorCard,
  // ImageUrlField, DeckEditorPage (uso interno) ───────────────────────────
  "deck.editor.imageUrlInvalid": "Indica um URL de imagem válido",
  "deck.editor.slug": "Slug",
  "deck.editor.title": "Título",
  "deck.editor.kicker": "Antetítulo",
  "deck.editor.section": "Secção",
  "deck.editor.byline": "Assinatura",
  "deck.editor.role": "Função",
  "deck.editor.readTime": "Tempo de leitura",
  "deck.editor.authorBio": "Biografia da autoria",
  "deck.editor.tags": "Etiquetas",
  "deck.editor.related": "Relacionados",
  "deck.editor.cover": "Imagem de capa",
  "deck.editor.coverDesc": "Descrição da capa",
  "deck.editor.slideNumber": "Slide {n}",
  "deck.editor.addSlide": "Adicionar slide",
  "deck.editor.addSlideLayout": "Modelo",
  "deck.editor.addSlideHint":
    "Cada slide é o verdadeiro componente do leitor. Esta pré-visualização não pode divergir.",
  "deck.editor.moveUp": "Mover para cima",
  "deck.editor.moveDown": "Mover para baixo",
  "deck.editor.removeSlide": "Remover slide",
  "deck.editor.summaryEmpty": "Slide vazio",
  "deck.editor.layout.text": "Texto",
  "deck.editor.layout.image": "Imagem",
  "deck.editor.layout.stat": "Estatística",
  "deck.editor.layout.beforeAfter": "Antes / depois",
  "deck.editor.layout.reveal": "Revelar",
  "deck.editor.field.eyebrow": "Antetítulo",
  "deck.editor.field.heading": "Título",
  "deck.editor.field.body": "Texto",
  "deck.editor.field.pull": "Citação em destaque",
  "deck.editor.field.align": "Alinhamento",
  "deck.editor.field.alignDefault": "Predefinido",
  "deck.editor.field.alignLeft": "Esquerda",
  "deck.editor.field.alignCenter": "Centro",
  "deck.editor.field.imageSrc": "URL da imagem",
  "deck.editor.field.alt": "Texto alternativo",
  "deck.editor.field.caption": "Legenda",
  "deck.editor.field.tint": "Cor",
  "deck.editor.field.value": "Valor",
  "deck.editor.field.unit": "Unidade",
  "deck.editor.field.label": "Etiqueta",
  "deck.editor.field.source": "Fonte",
  "deck.editor.field.before": "Antes",
  "deck.editor.field.after": "Depois",
  "deck.editor.field.prompt": "Instrução",
  "deck.editor.field.hidden": "Escondido até tocar",
  "deck.editor.tint.coral": "Coral",
  "deck.editor.tint.jade": "Jade",
  "deck.editor.tint.plum": "Ameixa",
  "deck.editor.tint.auth": "Sólida",
  "deck.editor.newTitle": "Novo deck",
  "deck.editor.editTitle": "Editar deck",
  "deck.editor.saveDraft": "Guardar rascunho",
  "deck.editor.publish": "Publicar",
  "deck.editor.unpublish": "Despublicar",
  "deck.editor.delete": "Eliminar",
  "deck.editor.leaveConfirm":
    "Tens alterações por guardar. Sair sem guardar?",
  "deck.editor.previewEmpty": "Adiciona um slide para pré-visualizar",
  "deck.editor.preview.title": "Pré-visualização",
  "deck.editor.preview.emptySlide": "Começa a preencher este slide para o veres aqui.",
  "deck.editor.budget.headingOver": "Demasiado longo. Vai cortar num telemóvel",
  "deck.editor.budget.headingOk": "Cabe no telemóvel mais estreito",
  "deck.editor.budget.bodyOver": "Um slide não é um parágrafo",
  "deck.editor.budget.bodyOk": "Curto o suficiente para ler de relance",
  "deck.editor.budget.count": "{count} / {max} caracteres",
  "deck.editor.saved": "Rascunho guardado",
  "deck.editor.publishedToast": "Deck publicado",
  "deck.editor.deletedToast": "Deck eliminado",
  "deck.editor.saveError":
    "Não foi possível guardar o teu deck. Tenta de novo.",
  "deck.editor.backToDashboard": "Voltar ao painel",
  "deck.editor.metaTitle": "Detalhes do deck",
  "deck.editor.untitled": "Deck sem título",
  "deck.editor.header.subtitle": "Deck · {count} slides",
  "deck.editor.unsavedChanges": "Alterações por guardar",
  "deck.editor.convert": "Transformar em texto",
  "deck.editor.slidesHeading": "Slides",
  "deck.editor.slidesCount": "{count} de {max} · clica num slide para editar",
  "deck.editor.slidesCapped": "Limite de 40 slides atingido",
  "deck.editor.publish.notNowNote":
    "Isto publica-se assim que carregares em Publicar. O agendamento de decks ainda não está disponível.",
  "deck.editor.publish.checklist.cover": "Slide de capa definido",
  "deck.editor.publish.checklist.source":
    "Fonte em todos os slides de estatística (opcional)",
  "deck.editor.publish.checklist.sourcePending":
    "Fonte em todos os slides de estatística (opcional, ainda nenhum)",
  "deck.editor.danger.title": "Zona de perigo",
  "deck.editor.danger.body":
    "Eliminar um deck remove-o de todos os sítios onde está ligado. Não é possível desfazer.",
  "deck.editor.danger.cta": "Eliminar este deck",
  "deck.editor.deleteModal.title": "Eliminar este deck?",
  "deck.editor.deleteModal.body":
    "Isto remove o deck e todos os seus slides. Quem já tiver o link vai ver um erro 404.",
  "deck.editor.convertModal.title": "Transformar isto em texto corrido?",
  "deck.editor.convertModal.body":
    "Converter um deck de slides num artigo completo ainda não está disponível. Quando estiver, isto vai passar o conteúdo do deck para o editor de artigos como rascunho inicial.",
  "deck.editor.convertModal.cta": "Converter em artigo",
  "deck.editor.convertModal.toast":
    "A conversão de deck para artigo ainda não está disponível.",

  // ── Issue chrome — partilhado por IssueCover, IssueContents, IssuesPage ──
  "issue.backToAllIssues": "Todas as edições",
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
  "issue.readCta": "Ler a edição {number}",
  "issue.orderPrintCta": "Encomendar a versão impressa · {price}",
  // Modo live: apresentado quando ainda não há uma edição publicada para ler.
  "issue.emptyLiveTitle": "Esta edição ainda não saiu",
  "issue.emptyLiveBody":
    "A edição atual ainda está a ser preparada. Volta em breve, ou propõe-nos um texto para publicar nela.",

  // ── IssueContents ────────────────────────────────────────────────────────
  "contents.heading.coverStory": "Reportagem de capa",
  "contents.heading.features": "Reportagens",
  "contents.heading.profiles": "Perfis",
  "contents.tocHeading": "Índice de <em>conteúdos</em>",
  "contents.pageLabel": "página",
  "contents.contributorsHeading": "Quem colaborou <em>nesta edição</em>",
  "contents.contributorsSubtitle_one":
    "{count} pessoa da comunidade fez a Edição {issue}: quem escreve, quem ilustra e quem editou tudo até dar liga.",
  "contents.contributorsSubtitle_other":
    "{count} pessoas da comunidade fizeram a Edição {issue}: quem escreve, quem ilustra e quem editou tudo até dar liga.",
  "contents.print.eyebrow": "Edição impressa",
  "contents.print.heading": "Segura-a <em>nas tuas mãos.</em>",
  "contents.print.body":
    "A Edição {issue} está disponível numa <b>tiragem limitada</b>: {pages} páginas, capa em risografia, impressa em Marvila. As pessoas da comunidade recebem-na ao preço de custo; as receitas financiam as pessoas colaboradoras da próxima edição.",
  "contents.print.orderCta": "Encomendar a edição impressa: {price}",
  "contents.print.readOnlineCta": "Ler online, grátis",
  "contents.print.imageAlt": "Simulação da edição impressa · Edição {issue}",

  // ── IssuesPage ───────────────────────────────────────────────────────────
  "issues.eyebrow": "Revista · todas as edições",
  "issues.heroTitle": "Nove edições, <em>trimestrais</em>, desde 2024.",
  "issues.heroDek":
    "Uma revista que não tem pressa. Impressão em risografia, grátis em PDF, paga em papel. Cada edição gira à volta de uma única pergunta: saúde, trabalho, a cidade, o que devemos umas às outras. As pessoas apoiantes recebem-na em casa, pelo correio.",
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
  "issues.archiveErrorTitle": "Não conseguimos carregar o arquivo.",
  "issues.archiveErrorBody":
    "Algo nos interrompeu a caminho das edições anteriores. Tenta novamente.",
  "issues.archiveRetryCta": "Tentar de novo",
  "issues.archiveEmptyTitle": "Ainda não há edições para mostrar.",
  "issues.archiveEmptyBody":
    "O arquivo ainda está a ser preparado. As primeiras edições chegam em breve.",

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
  "author.work.allArticlesCta_one": "Todos os {count} artigo",
  "author.work.allArticlesCta_other": "Todos os {count} artigos",
  "author.work.seeAllPicksCta": "Ver todas as escolhas",
  "author.work.findElsewhereHeading": "Encontra {name} <em>noutros sítios</em>",

  // ══════════════════ Painel de edição (uso interno) ═══════════════════════
  // Os REGISTOS de peças/propostas (títulos, notas, feed de atividade, nomes
  // de secções) ficam como dados em inglês — conteúdo editorial, não chrome.
  // Só a UI do painel, autorada pela plataforma, está traduzida abaixo.

  // ── Vocabulário de fase — indireção por chave (Stage mantém o id em inglês) ──
  "editor.stage.commissioned": "Encomendado",
  "editor.stage.drafting": "Em redação",
  "editor.stage.inReview": "Em revisão",
  "editor.stage.firstEdit": "Primeira edição",
  "editor.stage.copyedit": "Revisão de texto",
  "editor.stage.factCheck": "Verificação de factos",
  "editor.stage.sensitivityRead": "Leitura de sensibilidade",
  "editor.stage.ready": "Pronto",

  // ── Composição de dueInfo() / blockedLine() (editorDashboard.data.ts) ─────
  "editor.due.ready": "Pronto",
  "editor.due.today": "Hoje",
  "editor.due.late": "Atrasado · {days}d",
  "editor.due.inDays": "em {days}d",
  "editor.blocked.inYourCourt": "→ do teu lado",
  "editor.blocked.inEditorsCourt": "→ do lado de {editor}",
  "editor.blocked.waitingOnWriter": "à espera de {name}",

  // ── EditorDashboardHeader ──────────────────────────────────────────────
  "editor.header.eyebrow": "Editorial · painel da Edição {number}",
  "editor.header.title": "Edição {number} · <em>{theme}</em>",
  "editor.header.meta":
    "Fecha a <b>{closes}</b> · publica a <b>{publishes}</b> · <b>{editors}</b> em edição",
  "editor.header.viewingAs": "A ver como",
  "editor.header.viewingAsAria": "Ver o painel como esta pessoa editora",
  "editor.header.commissionCta": "+ Encomendar",

  // ── EditorStats ────────────────────────────────────────────────────────
  "editor.stats.piecesInFlight": "Peças em curso",
  "editor.stats.readyToLayOut": "Prontas para paginar",
  "editor.stats.behindSchedule": "Atrasadas",
  "editor.stats.pitchesInInbox": "Propostas na caixa de entrada",

  // ── EditorBulkBar ──────────────────────────────────────────────────────
  "editor.bulkBar.selected_one": "{count} proposta selecionada",
  "editor.bulkBar.selected_other": "{count} propostas selecionadas",
  "editor.bulkBar.accept": "Aceitar",
  "editor.bulkBar.maybe": "Talvez",
  "editor.bulkBar.decline": "Recusar",
  "editor.bulkBar.clear": "Limpar",
  "editor.bulkBar.note":
    "Aceitar ou recusar envia automaticamente uma resposta pré-definida a quem escreveu.",

  // ── EditorToolbar ──────────────────────────────────────────────────────
  "editor.toolbar.searchPlaceholder":
    "Pesquisar peças, propostas, pessoas colaboradoras…",
  "editor.toolbar.searchAria": "Pesquisar",
  "editor.toolbar.clearSearchAria": "Limpar pesquisa",
  "editor.toolbar.filterEditorAria": "Filtrar por pessoa editora",
  "editor.toolbar.allEditors": "Todas as pessoas editoras",
  "editor.toolbar.filterStatusAria": "Filtrar por estado",
  "editor.toolbar.status.all": "Todos os estados",
  "editor.toolbar.status.late": "Atrasadas",
  "editor.toolbar.status.blocked": "Do lado de uma pessoa editora",
  "editor.toolbar.status.ready": "Prontas",
  "editor.toolbar.filterSectionAria": "Filtrar por secção",
  "editor.toolbar.allSections": "Todas as secções",
  "editor.toolbar.sortAria": "Ordenar peças",
  "editor.toolbar.sort.due": "Ordenar · prazo",
  "editor.toolbar.sort.status": "Ordenar · fase",
  "editor.toolbar.sort.editor": "Ordenar · pessoa editora",
  "editor.toolbar.sort.section": "Ordenar · secção",
  "editor.toolbar.sort.words": "Ordenar · extensão",
  "editor.toolbar.myQueueOn": "A minha fila · ativa",
  "editor.toolbar.myQueue": "A minha fila",
  "editor.toolbar.shortcutsHint": "Prime <kbd>?</kbd> para atalhos",

  // ── EditorPiecesTable ──────────────────────────────────────────────────
  "editor.piecesTable.heading": "Peças · <em>em curso</em>",
  "editor.piecesTable.countLabel": "{count} · {sort}",
  "editor.piecesTable.columnPieceEditorArt": "Peça · pessoa editora · imagem",
  "editor.piecesTable.columnStage": "Fase",
  "editor.piecesTable.columnDue": "Prazo",
  "editor.piecesTable.emptyNoneTitle": "Ainda não há nada em curso",
  "editor.piecesTable.emptyNoneBody":
    "Não há peças no pipeline neste momento. Aceita uma proposta abaixo ou encomenda uma peça, e ela aparece aqui para editares.",
  "editor.piecesTable.emptyFilteredTitle": "Nenhuma peça corresponde",
  "editor.piecesTable.emptyFilteredBody":
    "Tenta limpar a pesquisa ou os filtros.",
  "editor.piecesTable.clearFiltersCta": "Limpar filtros",

  // ── EditorPieceRow ─────────────────────────────────────────────────────
  "editor.pieceRow.withEditor": "com {editor}",
  "editor.pieceRow.newVoice": "voz nova",
  "editor.pieceRow.open": "Abrir",
  "editor.pieceRow.moreActionsAria": "Mais ações",

  // ── EditorPopover (Popover / StageMenu / AssignMenu / MoreMenu) ───────────
  "editor.popover.movePiece": "Mover “{title}”",
  "editor.popover.current": "atual",
  "editor.popover.editorForPiece": "Pessoa editora desta peça",
  "editor.popover.piecesCount_one": "{count} peça",
  "editor.popover.piecesCount_other": "{count} peças",
  "editor.popover.piecesCountCurrent_one": "{count} peça · atual",
  "editor.popover.piecesCountCurrent_other": "{count} peças · atual",
  "editor.popover.handOffWithNote": "Passar com uma nota…",
  "editor.popover.nudge": "Lembrar {name}…",
  "editor.popover.handOffToCoEditor": "Passar à pessoa coeditora…",
  "editor.popover.previewInLayout": "Pré-visualizar na paginação",
  "editor.popover.duplicateBrief": "Duplicar o briefing",

  // ── EditorPitchInbox ───────────────────────────────────────────────────
  "editor.pitchInbox.heading": "Caixa de propostas · <em>{total}</em>",
  "editor.pitchInbox.subhead": "resposta média em 6 dias · triagem em lote ↓",
  "editor.pitchInbox.emptyMatch": "Nenhuma proposta corresponde a “{query}”",
  "editor.pitchInbox.selectAria": "Selecionar proposta de {name}",
  "editor.pitchInbox.showMore": "Mostrar mais {count} propostas",
  "editor.pitchInbox.yes": "Sim",
  "editor.pitchInbox.maybe": "Talvez",
  "editor.pitchInbox.no": "Não",

  // ── EditorNeedsStrip ───────────────────────────────────────────────────
  "editor.needsStrip.allClear":
    "Está tudo em dia, {name}. Nada atrasado e nada à tua espera. <emph>Boa.</emph>",
  "editor.needsStrip.heading": "Precisam de ti agora · <em>{count}</em>",
  "editor.needsStrip.yourCourt": "Do teu lado",
  "editor.needsStrip.writerHasntFiled": "Quem escreve ainda não entregou",
  "editor.needsStrip.overdueAt": "Atrasada em {stage}",
  "editor.needsStrip.sittingInCourt": "Do teu lado · {stage}",
  "editor.needsStrip.chase": "Lembrar {name}",
  "editor.needsStrip.pickUp": "Assumir",

  // ── EditorModals: Chase / Handoff / Shortcuts ─────────────────────────
  "editor.modals.chase.eyebrowFirstTime":
    "Lembrete · pessoa colaboradora pela primeira vez",
  "editor.modals.chase.eyebrow": "Lembrete · pessoa colaboradora",
  "editor.modals.chase.title": "Mensagem para {name}",
  "editor.modals.chase.cancel": "Cancelar",
  "editor.modals.chase.send": "Enviar lembrete",
  "editor.modals.chase.softHint":
    "Tom mais suave: esta é uma das primeiras peças desta pessoa connosco.",
  "editor.modals.chase.messageAria": "Mensagem para a pessoa colaboradora",
  "editor.modals.chase.offerExtension": "Propor uma prorrogação do prazo",
  "editor.modals.chase.bodyNewVoice":
    "Olá {name}, sem qualquer pressão, só a confirmar como vai “{title}”. Como é que estás a sentir-te? Se ajudar, marcamos uma chamada ou adiamos o prazo. Estamos mesmo felizes por te ter nesta edição.",
  "editor.modals.chase.bodyReturning":
    "Olá {name}, um lembrete simpático sobre “{title}”, agora em {stage} e com prazo a {due}. Diz-me se alguma coisa está a atrapalhar, e vemos como resolver.",
  "editor.modals.handoff.eyebrow": "Passar a peça",
  "editor.modals.handoff.title": "Passar “{title}”",
  "editor.modals.handoff.cancel": "Cancelar",
  "editor.modals.handoff.cta": "Passar",
  "editor.modals.handoff.handTo": "Passar a",
  "editor.modals.handoff.noteLabel": "Nota",
  "editor.modals.handoff.noteWriterWaiting":
    "@{editor} a passar-te isto. Está em {stage}, ainda à espera de quem escreve. Diz se quiseres mais contexto.",
  "editor.modals.handoff.noteReady":
    "@{editor} a passar-te isto. Está em {stage}, pronto para os teus olhos. Diz se quiseres mais contexto.",
  "editor.modals.shortcuts.eyebrow": "Teclado",
  "editor.modals.shortcuts.title": "Atalhos",
  "editor.modals.shortcuts.gotIt": "Percebido",
  "editor.modals.shortcuts.moveBetweenPieces": "Mover entre peças",
  "editor.modals.shortcuts.openFocusedPiece": "Abrir a peça em foco",
  "editor.modals.shortcuts.nudgeWriter": "Lembrar quem escreve a peça em foco",
  "editor.modals.shortcuts.acceptDeclineMaybe":
    "Aceitar / recusar / talvez a proposta do topo",
  "editor.modals.shortcuts.search": "Pesquisar",
  "editor.modals.shortcuts.thisHelp": "Esta ajuda",

  // ── EditorSideCards ────────────────────────────────────────────────────
  "editor.sideCards.progressHeading": "Progresso da Edição {number}",
  "editor.sideCards.piecesReady": "Peças prontas",
  "editor.sideCards.wordCount": "Contagem de palavras",
  "editor.sideCards.timeToClose": "Tempo até fechar",
  "editor.sideCards.daysLeft_one": "{count} dia",
  "editor.sideCards.daysLeft_other": "{count} dias",
  "editor.sideCards.editorLoadHeading": "Carga por pessoa editora",
  "editor.sideCards.you": "tu",
  "editor.sideCards.piecesWords": "{count} peças · {words}p",
  "editor.sideCards.lateCount_one": "{count} atrasada",
  "editor.sideCards.lateCount_other": "{count} atrasadas",
  "editor.sideCards.loadHintOtherMore":
    "{editor} está a ficar com mais {amount} palavras. Reatribui para equilibrar.",
  "editor.sideCards.loadHintBalanced":
    "A carga está equilibrada entre as pessoas editoras.",
  "editor.sideCards.sectionBudgetHeading": "Orçamento de secções",
  "editor.sideCards.slotsOpen_one": "{count} vaga por preencher",
  "editor.sideCards.slotsOpen_other": "{count} vagas por preencher",
  "editor.sideCards.needCount": "faltam {count}",
  "editor.sideCards.filledAria": "preenchida",
  "editor.sideCards.contributorsHeading": "Pessoas colaboradoras · esta edição",
  "editor.sideCards.newVoices": "vozes novas",
  "editor.sideCards.returning": "regressam",
  "editor.sideCards.contributorPay": "Pagamento a pessoas colaboradoras",
  "editor.sideCards.paid": "pago",
  "editor.sideCards.awaiting": "por confirmar",
  "editor.sideCards.toInvoice": "por faturar",
  "editor.sideCards.matching": "A corresponder: {names}",
  "editor.sideCards.noContributorMatch":
    "Nenhuma pessoa colaboradora corresponde",
  "editor.sideCards.seeContributorProfiles":
    "Ver perfis de pessoas colaboradoras",
  "editor.sideCards.recentActivity": "Atividade recente",
  "editor.sideCards.quickActions": "Ações rápidas",
  "editor.sideCards.sendPitchDecisions":
    "Enviar decisões de propostas em lote",
  "editor.sideCards.emailContributorsWaiting":
    "Enviar email às pessoas colaboradoras em espera",
  "editor.sideCards.previewIssueLayout":
    "Pré-visualizar a paginação da edição",
  "editor.sideCards.exportContributorList":
    "Exportar lista de pessoas colaboradoras (CSV)",

  // ── EditorDecksSection ──────────────────────────────────────────────────
  "editor.decks.title": "Decks interativos",
  "editor.decks.countLabel": "{count} decks",
  "editor.decks.columnTitle": "Título",
  "editor.decks.columnSection": "Secção",
  "editor.decks.columnStatus": "Estado",
  "editor.decks.emptyTitle": "Ainda não há decks",
  "editor.decks.emptyBody":
    "Os decks interativos que criares aparecem aqui. Começa um e publica-o quando estiver pronto.",
  "editor.decks.new": "Novo deck",
  "editor.decks.statusPublished": "Publicado",
  "editor.decks.statusDraft": "Rascunho",
  "editor.decks.edit": "Editar",

  // ── EditorDashboardPage ────────────────────────────────────────────────
  "editor.page.emptyTitle": "A secretária está livre",
  "editor.page.emptyDescription":
    "Não há peças em curso nem propostas à espera. Quando alguém propuser um texto ou encomendares uma peça, ela aparece aqui para fazeres a triagem e editares.",
  "editor.page.everyPitchLoaded":
    "Já viste todas as propostas carregadas neste protótipo",

  // ── useEditorDashboard / useEditorKeyboard toasts ──────────────────────
  "editor.toast.stageChanged": "“{title}” → {stage}",
  "editor.toast.reassigned": "Reatribuído a {editor}",
  "editor.toast.handedOff": "Passado a {editor} com uma nota",
  "editor.toast.triageAccepted": "Aceite",
  "editor.toast.triageMaybeSaved": "Guardado em Talvez",
  "editor.toast.triageDeclined": "Recusado",
  "editor.toast.triageSingle": "{verdict} · {name}",
  "editor.toast.bulkAccepted": "Aceite",
  "editor.toast.bulkMaybeMoved": "Movido para Talvez",
  "editor.toast.bulkDeclined": "Recusado",
  "editor.toast.bulkResult_one":
    "{verdict} {count} proposta · respostas pré-definidas enviadas",
  "editor.toast.bulkResult_other":
    "{verdict} {count} propostas · respostas pré-definidas enviadas",
  "editor.toast.nudgeSent": "Lembrete enviado a {name}",
  "editor.toast.briefDuplicated": "Briefing duplicado para rascunhos",
  "editor.toast.openingBulkTriage": "A abrir a triagem de propostas em lote",
  "editor.toast.draftingReminders":
    "A redigir lembretes para {count} pessoas colaboradoras",
  "editor.toast.contributorListExported":
    "Lista de pessoas colaboradoras exportada (CSV)",

  // ══════════════════ Redação (redesenho Fase 1) ═══════════════════════════
  // Os componentes desk/* mostram um painel mais recente e detalhado do que a
  // secção `editor.*` acima (outro conjunto de Stage, outra composição) —
  // estas chaves `desk.*` são o chrome desse painel. As strings de `Stage`
  // mostradas em bruto como texto (StagePill, FormatBadge, os cabeçalhos de
  // coluna/opções do select em PiecesBoard, a legenda de vaga em IssuePlan)
  // ficam por traduzir aqui, tal como a nota de `pitchTracker.stage.*` acima
  // — um id de fase que também serve de texto apresentado é um projeto maior
  // de indireção por chave, fora do âmbito desta ronda.

  // ── DeskHeader ───────────────────────────────────────────────────────────
  "desk.header.layout.pipeline": "Fluxo",
  "desk.header.layout.board": "Quadro",
  "desk.header.layout.issuePlan": "Plano da edição",
  "desk.header.eyebrow": "Edição {number} · {theme}",
  "desk.header.title": "A redação",
  "desk.header.meta": "Fecha a {closes} · publica a {publishes}",
  "desk.header.daysLeft": "{days} dias",
  "desk.header.toClose": "até fechar",
  "desk.header.slotsFilled": "{filled} de {slots} vagas preenchidas",
  "desk.header.viewingAs": "A ver como",
  "desk.header.viewingAsEditorAria": "Ver como esta pessoa editora",
  "desk.header.commissionCta": "Encomendar",
  "desk.header.produce": "Produção da edição",
  "desk.header.slotsFilledAria": "Vagas da edição preenchidas",
  "desk.header.layoutAria": "Esquema da redação",
  "desk.header.highlightsEyebrow": "Destaques autónomos",
  "desk.header.highlightsMeta":
    "Peças que saem por conta própria na plataforma, sem estarem presas a nenhuma edição.",

  // ── DeskTrackTabs (Destaques ⇄ Edição) ───────────────────────────────────
  "desk.trackTabs.highlights": "Destaques",
  "desk.trackTabs.issue": "Edição {number}",
  "desk.trackTabs.issueNoNumber": "Edição",

  // ── Reatribuição de via (ação na linha da peça) ──────────────────────────
  "desk.reassign.addToIssue": "Juntar à edição {number}",
  "desk.reassign.makeStandalone": "Tornar autónoma",
  "desk.reassign.addedToIssueToast": "Juntámos à edição {number}.",
  "desk.reassign.madeStandaloneToast": "Agora é um destaque autónomo.",
  "desk.reassign.failedToast": "Não deu para guardar. Tenta outra vez.",

  // ── NeedsStrip ───────────────────────────────────────────────────────────
  "desk.needsStrip.lateDue": "Atrasada · prazo {due}",
  "desk.needsStrip.waitingOnYou": "À tua espera",
  "desk.needsStrip.chase": "Insistir",
  "desk.needsStrip.pickUp": "Assumir",
  "desk.needsStrip.open": "Abrir",

  // ── DeskStats ────────────────────────────────────────────────────────────
  "desk.stats.inFlight": "em curso",
  "desk.stats.readyToLayOut": "prontas para paginar",
  "desk.stats.behindSchedule": "atrasadas",
  "desk.stats.pitchesWaiting": "propostas à espera",

  // ── DeskToolbar ──────────────────────────────────────────────────────────
  "desk.toolbar.searchPlaceholder": "Pesquisar peças, autoria, secções…",
  "desk.toolbar.searchAria": "Pesquisar",
  "desk.toolbar.formatAria": "Formato",
  "desk.toolbar.format.everything": "Tudo",
  "desk.toolbar.format.articles": "Artigos",
  "desk.toolbar.format.decks": "Decks",
  "desk.toolbar.myQueue": "A minha fila",
  "desk.toolbar.sortAria": "Ordenar",
  "desk.toolbar.sort.due": "Ordenar · prazo",
  "desk.toolbar.sort.stage": "Ordenar · estado",
  "desk.toolbar.sort.section": "Ordenar · secção",
  "desk.toolbar.shortcuts": "Atalhos",

  // ── SavedViews ───────────────────────────────────────────────────────────
  "desk.savedViews.saveThisView": "Guardar esta vista",

  // ── PiecesPipeline ───────────────────────────────────────────────────────
  "desk.pipeline.emptyTitle": "A secretária está livre",
  "desk.pipeline.emptyDescription": "Nada corresponde a este filtro agora.",
  "desk.pipeline.columnPiece": "Peça",
  "desk.pipeline.columnStage": "Estado",
  "desk.pipeline.columnWaitingOn": "À espera de",
  "desk.pipeline.columnDue": "Prazo",

  // ── PieceRow ─────────────────────────────────────────────────────────────
  "desk.pieceRow.newVoice": "Voz nova",
  "desk.pieceRow.writer": "Autor",
  "desk.pieceRow.you": "Tu",
  "desk.pieceRow.nobody": "Ninguém",
  "desk.pieceRow.edit": "Edição",
  "desk.pieceRow.chase": "Insistir",
  "desk.pieceRow.handOff": "Passar",

  // ── PiecesBoard ──────────────────────────────────────────────────────────
  "desk.board.columnEmpty": "Vazia",
  "desk.board.moveStageAria": "Mudar de estado",

  // ── IssuePlan ────────────────────────────────────────────────────────────
  "desk.issuePlan.slotsFilled": "{filled} de {target} · {note}",
  "desk.issuePlan.slotsOpen_one": "{count} vaga por preencher",
  "desk.issuePlan.slotsOpen_other": "{count} vagas por preencher",
  "desk.issuePlan.full": "Completa",
  "desk.issuePlan.commissionFor": "Encomendar para {section}",
  "desk.issuePlan.slidesCount_one": "{count} slide",
  "desk.issuePlan.slidesCount_other": "{count} slides",
  "desk.issuePlan.lateSuffix": " · atrasada",

  // ── PitchInbox ───────────────────────────────────────────────────────────
  "desk.pitchInbox.emptyTitle": "Caixa vazia",

  // ── PitchRow ─────────────────────────────────────────────────────────────
  "desk.pitchRow.selectAria": "Selecionar {title}",
  "desk.pitchRow.firstPitchSuffix": " · primeira proposta",
  "desk.pitchRow.betterAsDeck": "Melhor como deck",
  "desk.pitchRow.commission": "Encomendar",
  "desk.pitchRow.maybe": "Talvez",
  "desk.pitchRow.pass": "Recusar",

  // ── BulkTriageBar ────────────────────────────────────────────────────────
  "desk.bulkTriage.selected_one": "{count} proposta selecionada",
  "desk.bulkTriage.selected_other": "{count} propostas selecionadas",
  "desk.bulkTriage.ariaLabel": "Triagem de propostas em lote",
  "desk.bulkTriage.clearSelection": "Limpar seleção",
  "desk.bulkTriage.maybe": "Talvez",
  "desk.bulkTriage.passKindly": "Recusar com delicadeza",

  // ── DeskSidebar ──────────────────────────────────────────────────────────
  "desk.sidebar.issueStanding": "Como está a edição",
  "desk.sidebar.noPiecesYet": "Ainda não há peças no fluxo.",
  "desk.sidebar.editorLoad": "Carga dos editores",
  "desk.sidebar.noEditorsYet": "Ainda não há editores atribuídos.",
  "desk.sidebar.activity": "Atividade",
  "desk.sidebar.nothingHereYet": "Ainda não há nada aqui.",
  "desk.sidebar.someone": "Alguém",

  // ── DeskStates ───────────────────────────────────────────────────────────
  "desk.states.emptyIssueTitle": "A Edição {number} está vazia",
  "desk.states.emptyIssueDescription":
    "Ainda não foi encomendada nenhuma peça. Começa o fluxo com a tua primeira peça.",
  "desk.states.commissionPiece": "Encomendar uma peça",
  "desk.states.errorBand":
    "Não conseguimos aceder ao fluxo. A mostrar os últimos dados que tínhamos.",
  "desk.states.tryAgain": "Tentar novamente",

  // ── CommandPalette ───────────────────────────────────────────────────────
  "desk.palette.kindArticle": "Artigo",
  "desk.palette.kindDeck": "Deck",
  "desk.palette.kindAction": "Ação",
  "desk.palette.newPiece": "Nova peça",
  "desk.palette.goToDesk": "Ir para a redação",
  "desk.palette.ariaLabel": "Paleta de comandos",
  "desk.palette.searchPlaceholder": "Ir diretamente a uma peça, ou começar uma nova…",
  "desk.palette.searchAria": "Pesquisar na redação",
  "desk.palette.commandsAria": "Comandos",
  "desk.palette.noResults": "Nada corresponde a “{query}”.",

  // ── DeskNotifications ────────────────────────────────────────────────────
  "desk.notifications.ariaLabel": "Notificações da redação",
  "desk.notifications.sinceFriday": "Desde sexta",
  "desk.notifications.subhead":
    "O que aconteceu na redação enquanto estiveste fora.",
  "desk.notifications.empty":
    "Estás em dia. Nada de novo desde a última vez que viste.",
  "desk.notifications.markAllRead": "Marcar tudo como lido",

  // ── MagazineDeskShell (o painel lateral de quem edita) ───────────────────
  "deskShell.issueEyebrow": "Edição {number} · {theme}",
  "deskShell.menuAria": "Secções da redação",
  "deskShell.nav.desk": "Redação",
  "deskShell.nav.pitches": "Propostas",
  "deskShell.nav.issue": "Edição",
  "deskShell.bellCountAria": "Desde sexta: {count} novidades",
  "deskShell.openNow": "Abertos agora",
  "deskShell.newPiece": "Novo texto",
  "deskShell.kbdHintSuffix": "para saltar · ? para atalhos",
  "deskShell.backToPlatform": "Voltar ao QueerPulse",

  // ── DeskModals (chrome partilhado por Commission/Pass/Chase/Handoff/Shortcuts) ──
  "desk.modals.cancel": "Cancelar",
  "desk.modals.noteLabel": "A tua nota",
  "desk.modals.shortcuts.title": "Teclado",
  "desk.modals.shortcuts.gotIt": "Percebido",

  // ── CommissionModal ──────────────────────────────────────────────────────
  "desk.modals.commission.titleFromPitch": "Encomendar esta proposta",
  "desk.modals.commission.titleFromScratch": "Escrever o briefing",
  "desk.modals.commission.sendBrief": "Enviar o briefing",
  "desk.modals.commission.bodyFromPitch":
    "Estás a encomendar a proposta de {byline}. Define o essencial abaixo, e o briefing segue diretamente para essa pessoa.",
  "desk.modals.commission.bodyFromScratch":
    "Define o essencial abaixo, e levamos um briefing a quem escreve.",
  "desk.modals.commission.angleLabel": "O ângulo",
  "desk.modals.commission.sectionLabel": "Secção",
  "desk.modals.commission.wordsLabel": "Palavras",
  "desk.modals.commission.dueDateLabel": "Prazo",
  "desk.modals.commission.feeLabel": "Valor",
  "desk.modals.commission.feePlaceholder": "ex.: 150 €",
  "desk.modals.commission.trackLabel": "Onde sai",
  "desk.modals.commission.trackHighlights": "Autónoma",
  "desk.modals.commission.trackIssue": "Edição {number}",

  // ── PassModal ────────────────────────────────────────────────────────────
  "desk.modals.pass.title": "Recusar “{title}”",
  "desk.modals.pass.send": "Enviar",
  "desk.modals.pass.body":
    "Uma recusa cai melhor com um motivo genuíno. Escolhe um ponto de partida abaixo, ou escreve o teu próprio. De qualquer forma, quem escreveu ouve de uma pessoa real.",
  "desk.modals.pass.startingPoints": "Pontos de partida",

  // ── ChaseModal (Phase 7 Wave F: incorpora o PieceThread, sem passo de composição à parte) ─
  "desk.modals.chase.title": "Insistir com {name}",
  "desk.modals.chase.body": "Um lembrete rápido e humano para manter as coisas a andar com calma.",

  // ── HandoffModal ─────────────────────────────────────────────────────────
  "desk.modals.handoff.title": "Passar",
  "desk.modals.handoff.cta": "Passar",
  "desk.modals.handoff.body":
    "Passa “{title}” a outra pessoa editora. Ela continua exatamente onde ficaste.",
  "desk.modals.handoff.toLabel": "Para",

  // ── DeskView ─────────────────────────────────────────────────────────────
  "desk.view.notificationsAria": "Notificações",

  // ── EditorDashboardPage ──────────────────────────────────────────────────
  "desk.page.stubOpensLater": "Abre numa versão futura.",
  "desk.page.savingViewsUnavailable":
    "Ainda não é possível guardar vistas personalizadas.",
  "desk.page.notificationsNotWired":
    "As notificações ainda não estão ligadas à navegação real.",

  // ══════════════════ Ficha da peça (Fase 2) ════════════════════════════════
  // Briefing/Cuidado/Dinheiro/Histórico/Depois. O conteúdo do registo (texto
  // "what" do histórico, corpo das cartas, texto das correções, ângulo/pedidos
  // /evitar/imagem do briefing, notas por pessoa, notas de sinalização,
  // etiquetas da checklist de sensibilidade, nomes de estados) vem de
  // `record`/`DEMO_RECORD` — conteúdo editorial, não chrome — e fica
  // deliberadamente por traduzir. Só o chrome de plataforma (etiquetas,
  // botões, títulos de secção, texto estático) é traduzido abaixo.

  // ── PieceRecordPage ──────────────────────────────────────────────────────
  "piece.header.backToDesk": "Voltar à redação",
  "piece.header.openDraft": "Abrir o rascunho",
  "piece.header.publish": "Publicar",
  "piece.header.publishToast": "A publicação chega com a produção da edição",
  "piece.header.formatArticle": "Artigo",
  "piece.header.formatDeck": "Deck",
  "piece.header.inAnIssue": "Numa edição",
  "piece.header.notScheduled": "Ainda não agendada",
  "piece.header.notFoundTitle": "Não conseguimos abrir esta peça",
  "piece.header.notFoundDescription":
    "Pode ter sido removida, ou a ligação está desatualizada.",

  // ── PieceTabsNav ─────────────────────────────────────────────────────────
  "piece.tabs.ariaLabel": "Secções da ficha da peça",
  "piece.tabs.brief": "Briefing",
  "piece.tabs.care": "Cuidado",
  "piece.tabs.money": "Dinheiro",
  "piece.tabs.history": "Histórico",
  "piece.tabs.after": "Depois",

  // ── StageStepper ─────────────────────────────────────────────────────────
  "piece.stageStepper.heading": "Em que ponto está",

  // ── PublishGateCard ──────────────────────────────────────────────────────
  "piece.gate.heading": "Portão de publicação",
  "piece.gate.notAdvisory":
    "O portão não é uma sugestão. Nada aqui pode ser ultrapassado por uma só pessoa.",
  "piece.gate.publish": "Publicar",

  // ── MoneyMiniCard ────────────────────────────────────────────────────────
  "piece.moneyMini.heading": "Dinheiro",
  "piece.moneyMini.noFeeYet": "Ainda sem valor acordado",
  "piece.moneyMini.statusAgreed": "Valor acordado",
  "piece.moneyMini.statusApprovedUnpaid": "Aprovado, por pagar",
  "piece.moneyMini.statusPaid": "Pago",
  "piece.moneyMini.openMoney": "Abrir dinheiro",

  // ── BriefTab ─────────────────────────────────────────────────────────────
  "piece.brief.noBriefYet": "Ainda não há briefing registado.",
  "piece.brief.commissionHeading": "A encomenda",
  "piece.brief.commissioned": "Encomendada",
  "piece.brief.due": "Prazo",
  "piece.brief.noDateSet": "Sem data definida",
  "piece.brief.length": "Extensão",
  "piece.brief.noTargetSet": "Sem alvo definido",
  "piece.brief.filedAt": "Entregue",
  "piece.brief.notFiledYet": "Ainda não entregue",
  "piece.brief.fee": "Valor",
  "piece.brief.killFee": "Valor de cancelamento",
  "piece.brief.overWordsWarning":
    "Entregou {count} palavras acima do briefing. Corta antes da paginação, ou move uma secção para o deck.",
  "piece.brief.whatWeAskedFor": "O que pedimos",
  "piece.brief.avoidLabel": "Evitar.",
  "piece.brief.artLabel": "Imagem.",
  "piece.brief.sendToWriter": "Enviar à autoria",
  "piece.brief.saveAsTemplate": "Guardar como modelo",
  "piece.brief.similarHeading": "Já publicámos algo assim",
  "piece.brief.similarIssueBy": "· edição {issue} · {by}",
  "piece.brief.readButton": "Ler",

  // ── MoneyTab ─────────────────────────────────────────────────────────────
  "piece.money.noPaymentYet": "Ainda não há pagamento registado.",
  "piece.money.feeHeading": "Valor",
  "piece.money.agreedFee": "Valor acordado",
  "piece.money.expenses": "Despesas",
  "piece.money.noneFiled": "Nenhuma entregue",
  "piece.money.invoice": "Fatura",
  "piece.money.notReceived": "Não recebida",
  "piece.money.filed": "Entregue",
  "piece.money.notFiled": "Não entregue",
  "piece.money.terms": "Prazo de pagamento",
  "piece.money.payBy": "Pagar até",
  "piece.money.noDateSet": "Sem data definida",
  "piece.money.unpaidWarning":
    "Aprovado mas por pagar. Pagar a tempo é a parte deste trabalho pela qual a comunidade realmente nos avalia.",
  "piece.money.markForPayment": "Marcar para pagamento",
  "piece.money.tellTheWriter": "Avisar a autoria",

  // ── CareTab + CareSubjectRow ─────────────────────────────────────────────
  "piece.care.heading": "Cuidado e consentimento",
  "piece.care.noCareRecordYet":
    "Ainda não foi iniciado um registo de cuidado para esta peça.",
  "piece.care.sensitivityReadHeading": "Leitura de sensibilidade",
  "piece.care.readerMeta": "{role} · pedida a {askedOn} · prazo a {dueOn}",
  "piece.care.readProgress":
    "{done} de {total} · uma leitura não é um carimbo automático. {reader} pode devolvê-la a qualquer momento.",
  "piece.care.nudgeReader": "Insistir com a pessoa leitora",
  "piece.care.nudgedToast": "Insististe com {reader}.",
  "piece.care.askSecondReader": "Pedir uma segunda leitura",
  "piece.care.secondReaderToast": "Pedida uma segunda leitura.",
  "piece.care.noReadRequestedYet":
    "Ainda não foi pedida uma leitura de sensibilidade.",
  "piece.care.askForRead": "Pedir uma leitura de sensibilidade",
  "piece.care.askForReadToast": "Pedida uma leitura de sensibilidade.",
  "piece.care.peopleHeading": "Pessoas nesta peça",
  "piece.care.peopleSubline":
    "O consentimento é recolhido por pessoa, linha a linha. A publicação fica bloqueada até todas as linhas estarem resolvidas.",
  "piece.care.contentNotesHeading": "Notas de conteúdo",
  "piece.care.contentNotesSubline":
    "Mostradas às pessoas leitoras acima da peça. Escritas pela autoria, verificadas por ti.",
  "piece.care.addContentNote": "Adicionar",
  "piece.care.contentNoteAddedToast": "Nota de conteúdo adicionada.",
  "piece.care.safetyFlagsHeading": "Sinalizações de segurança",
  "piece.care.flagged": "Sinalizado",
  "piece.care.clear": "Sem sinalização",
  "piece.care.consentGiven": "Consentiu",
  "piece.care.consentPending": "Consentimento pendente",
  "piece.care.consentPseudonym": "Pseudónimo",
  "piece.care.rightOfReply": "Direito de resposta · {reply}",
  "piece.care.named": "Com nome",
  "piece.care.outPublicly": "Fora do armário",
  "piece.care.quotesReadBack": "Citações confirmadas",
  "piece.care.sendConsentForm": "Enviar formulário de consentimento",
  "piece.care.consentFormSentToast":
    "Formulário de consentimento enviado a {name}.",

  // ── HistoryTab ───────────────────────────────────────────────────────────
  "piece.history.heading": "Tudo o que aconteceu",
  "piece.history.unknownActor": "Desconhecido",
  "piece.history.footer":
    "As mudanças de estado, publicações e restauros são guardados durante toda a vida da revista.",

  // ── AfterTab ─────────────────────────────────────────────────────────────
  "piece.after.lettersHeading": "Cartas",
  "piece.after.noLettersYet": "Ainda sem cartas de leitores.",
  "piece.after.sendToAuthor": "Enviar à autoria",
  "piece.after.sendToAuthorToast": "O envio de mensagens à autoria ainda não está disponível.",
  "piece.after.runInLetters": "Publicar nas cartas",
  "piece.after.removeFromLetters": "Remover das cartas",
  "piece.after.correctionsHeading": "Correções",
  "piece.after.correctionPublished": "Publicada a {date}",
  "piece.after.correctionFiled": "Registada a {date}",
  "piece.after.correctionsFooter":
    "Uma correção é publicada como uma nota datada no rodapé da peça. Nunca corrigimos em silêncio.",
  "piece.after.correctionAriaLabel": "Texto da correção",
  "piece.after.correctionPlaceholder": "O que estava errado, e o que está certo.",
  "piece.after.publishCorrection": "Publicar correção",
  "piece.after.notifyPeopleNamed": "Avisar as pessoas identificadas",

  // ══════════════════ Assistente de Propor um Texto ════════════════════════
  // `INITIAL_DRAFT` (o exemplo de título/assinatura/resumo/corpo) fica como
  // conteúdo em inglês — um ensaio de exemplo, não chrome.

  // ── SubmitStoryIntro ───────────────────────────────────────────────────
  "submitStory.intro.eyebrow": "Propõe um texto",
  "submitStory.intro.title": "Tens algo que <em>vale a pena contar?</em>",
  "submitStory.intro.lead":
    "A revista da QueerPulse é escrita pela comunidade. Não precisas de uma assinatura habitual nem de um agente: só de uma história que importa e de uma forma honesta de a contar.",
  "submitStory.intro.lookingFor.specific.title": "O específico em vez do geral",
  "submitStory.intro.lookingFor.specific.body":
    "Um clube de jantares, uma rua, uma tarde. Confiamos que a história pequena carrega a grande.",
  "submitStory.intro.lookingFor.beyond.title": "Lisboa e para além dela",
  "submitStory.intro.lookingFor.beyond.body":
    "Enraizados aqui, mas publicamos também vozes da diáspora e de quem nos visita. O lugar importa; as fronteiras, menos.",
  "submitStory.intro.lookingFor.pay.title": "Pagamos, sempre",
  "submitStory.intro.lookingFor.pay.body":
    'Todas as peças publicadas são pagas de forma justa: valores partilhados à partida, nunca em troca de "visibilidade".',
  "submitStory.intro.stepsHeading": "O que acontece a seguir",
  "submitStory.intro.step.reply":
    "Uma resposta em duas semanas: sim, não, ou vamos falar.",
  "submitStory.intro.step.assigned":
    "Se for sim, é atribuída uma pessoa editora e combinam juntas o valor e o prazo.",
  "submitStory.intro.step.copyright":
    "Mantêm os direitos de autor. Nós apenas licenciamos o texto.",

  // ── SubmitStorySidebar ─────────────────────────────────────────────────
  "submitStory.sidebar.guidelinesHeading": "Linhas editoriais",
  "submitStory.sidebar.guideline.length.term": "800–2500 palavras",
  "submitStory.sidebar.guideline.length.detail":
    "para a maioria das secções. Reportagens longas até 4000.",
  "submitStory.sidebar.guideline.experience.term":
    "Escreve a partir da experiência.",
  "submitStory.sidebar.guideline.experience.detail":
    "Em primeira pessoa ou com reportagem próxima. Não é opinião de comentador.",
  "submitStory.sidebar.guideline.noPromo.term": "Sem conteúdo promocional.",
  "submitStory.sidebar.guideline.noPromo.detail":
    "A revista não publica publicidade nem peças patrocinadas.",
  "submitStory.sidebar.guideline.language.term": "Português ou inglês",
  "submitStory.sidebar.guideline.language.detail": "Publicamos nos dois.",
  "submitStory.sidebar.guideline.deadlines.term": "Os prazos são firmes.",
  "submitStory.sidebar.guideline.deadlines.detail":
    "Submissões atrasadas passam para a edição seguinte.",
  "submitStory.sidebar.afterSubmitHeading": "Depois de submeteres",
  "submitStory.sidebar.afterSubmit.response":
    "As pessoas editoras respondem no prazo de <strong>5 dias úteis</strong> com aceitação, um pedido de alterações, ou uma recusa com notas.",
  "submitStory.sidebar.afterSubmit.approve":
    "As peças aceites passam por uma ronda de edição. <strong>Aprovas a versão final</strong> antes de ser publicada.",
  "submitStory.sidebar.afterSubmit.licence":
    "Mantés os direitos de autor. <strong>A QueerPulse tem uma licença não exclusiva</strong> para publicar na revista e no arquivo.",
  "submitStory.sidebar.questionsHeading": "Perguntas?",
  "submitStory.sidebar.questionsBody":
    "Escreve à redação por email ou consulta edições anteriores para teres uma ideia do que publicamos.",
  "submitStory.sidebar.emailCta": "Email à redação",

  // ── SubmitStorySuccess ─────────────────────────────────────────────────
  "submitStory.success.title": "Estamos a <em>ler.</em>",
  "submitStory.success.sub":
    "Obrigada por confiares em nós com “{title}”. Aconteça o que acontecer, os direitos de autor são teus.",
  "submitStory.success.defaultTitle": "o teu texto",
  "submitStory.success.timeline.readsEvery":
    "Uma pessoa editora lê pessoalmente todas as propostas.",
  "submitStory.success.timeline.hearBy":
    "Tens resposta nossa até <strong>{date}</strong>: sim, não, ou vamos falar.",
  "submitStory.success.timeline.ifYes":
    "Se for sim, combinamos juntas o valor e o prazo.",
  "submitStory.success.backCta": "Voltar à revista",
  "submitStory.success.pastIssuesCta": "Ler edições anteriores",

  // ── SubmitStoryMeta ────────────────────────────────────────────────────
  "submitStory.meta.heading": "Detalhes <em>do texto</em>",
  "submitStory.meta.sectionLabel": "Secção",
  "submitStory.meta.sectionPlaceholder": "Escolhe uma secção…",
  "submitStory.meta.section.longRead": "Reportagem longa",
  "submitStory.meta.section.personalEssay": "Ensaio pessoal",
  "submitStory.meta.section.interview": "Entrevista",
  "submitStory.meta.section.opinion": "Opinião",
  "submitStory.meta.section.communityReport": "Reportagem da comunidade",
  "submitStory.meta.section.shortFiction": "Ficção curta",
  "submitStory.meta.section.photography": "Fotografia",
  "submitStory.meta.bylineLabel": "Assinatura",
  "submitStory.meta.bylineNoteLabel": "Nota da assinatura",
  "submitStory.meta.optional": "opcional",
  "submitStory.meta.bylineNotePlaceholder": "ex.: escreve sobre habitação",
  "submitStory.meta.tagsLabel": "Etiquetas",
  "submitStory.meta.commaSeparated": "separadas por vírgula",
  "submitStory.meta.tagsPlaceholder": "ex.: habitação, identidade, Lisboa",
  "submitStory.meta.statusDraft": "Rascunho",

  // ── SubmitStoryWriter ──────────────────────────────────────────────────
  "submitStory.writer.tool.bold": "Negrito",
  "submitStory.writer.tool.italic": "Itálico",
  "submitStory.writer.tool.link": "Link",
  "submitStory.writer.tool.heading": "Título",
  "submitStory.writer.tool.quote": "Citação em bloco",
  "submitStory.writer.tool.bullet": "Lista com marcadores",
  "submitStory.writer.tool.image": "Imagem",
  "submitStory.writer.autosaved": "Rascunho guardado",
  "submitStory.writer.saving": "A guardar…",
  "submitStory.writer.unsaved": "Por guardar",
  "submitStory.writer.headlineAria": "Título",
  "submitStory.writer.headlinePlaceholder": "O teu título",
  "submitStory.writer.standfirstAria": "Resumo",
  "submitStory.writer.standfirstPlaceholder":
    "Uma ou duas frases que atraiam quem lê…",
  "submitStory.writer.bodyAria": "Corpo do texto",
  "submitStory.writer.bodyPlaceholder": "Começa a escrever…",
  "submitStory.writer.wordCount_one": "{count} palavra",
  "submitStory.writer.wordCount_other": "{count} palavras",

  // ── SubmitStoryEditor ──────────────────────────────────────────────────
  "submitStory.editor.draftSaved":
    "Rascunho guardado. Fica aqui para quando voltares.",
  "submitStory.editor.draftSaveError":
    "Não foi possível guardar o rascunho. O teu navegador pode estar a bloquear o armazenamento.",
  "submitStory.resume.text":
    "Deixaste uma história por terminar. <b>Continuar de onde ficaste?</b>",
  "submitStory.resume.startFresh": "Começar de novo",
  "submitStory.resume.resume": "Retomar rascunho",
  "submitStory.editor.chooseSectionError":
    "Escolhe primeiro uma secção para a tua peça.",
  "submitStory.editor.needHeadlineError":
    "O teu texto precisa de um título antes de seguir para a redação.",
  "submitStory.editor.minWordsError":
    "Falta um pouco mais: pelo menos {min} palavras antes de submeteres.",
  "submitStory.editor.submitError":
    "Não foi possível submeter o teu texto agora. Tenta de novo.",
  "submitStory.editor.saveDraftCta": "Guardar rascunho",
  "submitStory.editor.submittingCta": "A submeter…",
  "submitStory.editor.submitCta": "Submeter para revisão",

  // ── SubmitStoryCover ───────────────────────────────────────────────────
  "submitStory.cover.previewAlt": "Pré-visualização da capa",
  "submitStory.cover.replaceCta": "Substituir",
  "submitStory.cover.removeCta": "Remover",
  "submitStory.cover.uploading": "A carregar…",
  "submitStory.cover.addCta": "Adicionar uma imagem de capa",
  "submitStory.cover.hint":
    "JPG, PNG ou WebP · mín. 1200 × 600px · aparece no topo do texto publicado",
  "submitStory.cover.uploadingProgress": "A carregar… {progress}%",
  "submitStory.cover.progressLabel": "Progresso do carregamento da capa",
  "submitStory.cover.errorFallback":
    "Não foi possível adicionar essa capa. Tenta de novo.",

  // ── submitStory.data.ts: ISSUE (o registo da edição aberta a propostas) ──
  "submitStory.issue.badge": "Edição {number}",
  "submitStory.issue.name": "Edição de {monthYear} · aberta a propostas",
  "submitStory.issue.deadline": "Prazo de submissão: {date}",

  // ══════════════════ Pitch Tracker ═════════════════════════════════════════
  // Ver a nota em en/magazine.ts: statusLabel/stage labels foram resolvidos
  // nesta ronda via label-key indirection. actions[].label continua por
  // traduzir (conteúdo/chrome misturado, com nomes/contagens embutidos).

  // ── PitchTrackerHeader ─────────────────────────────────────────────────
  "pitchTracker.header.eyebrow": "Revista · as tuas propostas",
  "pitchTracker.header.title": "Onde cada proposta <em>realmente está.</em>",
  "pitchTracker.header.lead":
    "{active} propostas ativas · {published} publicadas ao todo. A redação responde em <b>~ {days} dias</b>.",
  "pitchTracker.header.newPitchCta": "+ Nova proposta",

  // ── PitchTabs ──────────────────────────────────────────────────────────
  "pitchTracker.tabs.ariaLabel": "Estado da proposta",
  "pitchTracker.tabs.all": "Todas",
  "pitchTracker.tabs.review": "Em revisão",
  "pitchTracker.tabs.commissioned": "Encomendadas",
  "pitchTracker.tabs.published": "Publicadas",
  "pitchTracker.tabs.closed": "Fechadas",

  // ── PitchTrackerPage ───────────────────────────────────────────────────
  "pitchTracker.page.emptyTitle": "Nada nesta vista.",
  "pitchTracker.page.emptyBody":
    "Não há propostas aqui neste momento. Muda de separador, ou começa algo novo no botão Nova proposta acima.",
  "pitchTracker.page.withdrawnToast": "Proposta retirada",
  "pitchTracker.page.undoCta": "Desfazer",
  "pitchTracker.page.stubToast": "{label}: brevemente neste protótipo",

  // ── Shared stage-rail vocabulary (PitchStages.tsx) ──────────────────────
  "pitchTracker.stage.pitched": "Proposta enviada",
  "pitchTracker.stage.accepted": "Aceite",
  "pitchTracker.stage.firstDraft": "Primeiro rascunho",
  "pitchTracker.stage.firstEdit": "Primeira edição",
  "pitchTracker.stage.layOut": "Paginação",
  "pitchTracker.stage.published": "Publicado",
  "pitchTracker.stage.inReview": "Em revisão",
  "pitchTracker.stage.decision": "Decisão",
  "pitchTracker.stage.draft": "Rascunho",
  "pitchTracker.stage.edit": "Edição",
  "pitchTracker.stage.out": "No ar",
  "pitchTracker.stage.reviewed": "Revista",
  "pitchTracker.stage.closed": "Encerrada",

  // ── Live submissionToPitch adapter's generic per-status labels ──────────
  "pitchTracker.statusLabel.draft": "Rascunho",
  "pitchTracker.statusLabel.submitted": "Enviada · a aguardar revisão",
  "pitchTracker.statusLabel.inReview": "Em revisão",
  "pitchTracker.statusLabel.accepted": "Aceite",
  "pitchTracker.statusLabel.published": "Publicada",
  "pitchTracker.statusLabel.rejected": "Não aceite nesta edição",

  // ── Mock PITCHES per-pitch statusLabel (demo-only, pitch-specific copy) ──
  "pitchTracker.pitch.pharmacist.statusLabel": "Em edição · c/ Marta",
  "pitchTracker.pitch.fourDayWeek.statusLabel": "Em revisão",
  "pitchTracker.pitch.commissionedMap.statusLabel": "Encomendada",
  "pitchTracker.pitch.hostingBadly.statusLabel": "Publicada",
  "pitchTracker.pitch.risoPrinting.statusLabel": "Publicada",
  "pitchTracker.pitch.oweOurExes.statusLabel":
    "Não entra nesta edição · muito próxima",

  // ══════════════════ PrintOrderModal (edição impressa da Edição 09) ═══════
  "printOrder.dialogAria": "Encomendar a edição impressa",
  "printOrder.closeAria": "Fechar",
  "printOrder.success.title": "Está a <em>caminho de ti.</em>",
  "printOrder.success.body_one":
    "{count} exemplar de <b>{issue}</b> reservado desta tiragem. Enviamos um email para <b>{email}</b> quando sair de Marvila, normalmente dentro de uma semana. Obrigada por financiares as pessoas colaboradoras da próxima edição.",
  "printOrder.success.body_other":
    "{count} exemplares de <b>{issue}</b> reservados desta tiragem. Enviamos um email para <b>{email}</b> quando saírem de Marvila, normalmente dentro de uma semana. Obrigada por financiares as pessoas colaboradoras da próxima edição.",
  "printOrder.success.doneCta": "Concluído",
  "printOrder.eyebrow": "Edição impressa · {issue}",
  "printOrder.title": "Encomendar a <em>tiragem impressa.</em>",
  "printOrder.lead":
    "{pages} páginas, capa em risografia, impressa em Marvila. <b>{price} € ao custo</b>. As receitas financiam as pessoas colaboradoras da próxima edição.",
  "printOrder.copiesLabel": "Exemplares",
  "printOrder.fewerCopiesAria": "Menos exemplares",
  "printOrder.moreCopiesAria": "Mais exemplares",
  "printOrder.emailFieldLabel": "Email para atualizações do envio",
  "printOrder.emailFieldHelper":
    "Só o usamos para te avisar quando o teu exemplar for enviado.",
  "printOrder.emailPlaceholder": "tu@exemplo.com",
  "printOrder.cancelCta": "Cancelar",
  "printOrder.placingCta": "A colocar a tua encomenda…",
  "printOrder.placeCta": "Fazer encomenda: {total} €",

  // ══════════════════ Páginas de reportagem (Story showcase) ═════════════════
  // StoryPage/StoryTomasPage/StorySafetyPage e os respetivos *Article são
  // peças completas da revista (título, nome de autoria, categoria, tempo de
  // leitura, corpo do texto, citações, biografias) — conteúdo editorial, o
  // mesmo tratamento de `data/articles.tsx`. Só a palavra de ligação da
  // assinatura, o título partilhado "mais da comunidade", o CTA de perfil e
  // os CTAs finais do Outro são chrome, traduzidos abaixo.
  "story.wordsBy": "Texto de",
  "story.moreHeading": "Mais <em>da comunidade</em>",
  "story.viewProfileCta": "Ver perfil",
  "story.outro.studio.title":
    "Queres fazer parte do que <em>vai ser escrito a seguir?</em>",
  "story.outro.studio.sub":
    "As histórias são sobre as pessoas na sala. Junta-te a nós.",
  "story.outro.tomas.title":
    "Queres juntar-te à mesa do Tomás? <em>Junta-te à sala primeiro.</em>",
  "story.outro.tomas.sub":
    "O jantar, a rede, os encontros: tudo começa com um convite de alguém que te conhece.",
  "story.outro.safety.title": "Leste e parece-te <em>certo?</em>",
  "story.outro.safety.sub":
    "Não somos para todas as pessoas. Mas se isto faz sentido para ti, talvez sejas para nós.",
  "story.safety.byline": "A equipa da QueerPulse",

  // ══════════════════ Editor de artigos (ArticleEditorPage + desk/editor/*) ═
  // Chrome da superfície de escrita por blocos. O conteúdo do RichText do
  // título/resumo, o html de cada bloco (parágrafo/subtítulo/citação em
  // destaque/citação atribuída/legenda de imagem/P&R/estatísticas) e os
  // dados de exemplo DEMO_ARTICLE (blocos, versões, notas) são conteúdo
  // editorial — deliberadamente não traduzidos, o mesmo tratamento do resto
  // deste ficheiro. Só o chrome do próprio editor — etiquetas, botões,
  // marcadores de posição, estados vazios, aria-labels, nomes dos tipos de
  // bloco e mensagens de aviso — é traduzido abaixo.

  // ── ArticleEditorHeader / ArticleEditorPage ──────────────────────────────
  "write.header.backAria": "Voltar à ficha da peça",
  "write.header.untitled": "Rascunho sem título",
  "write.header.unsectioned": "Sem secção",
  "write.header.subtitle": "Artigo · {section} · {issue} · {saved}",
  "write.header.viewLabel": "Vista",
  "write.header.sendOn": "Enviar",
  "write.header.publish": "Publicar",
  "write.header.sendOnToast": "O envio ainda não está disponível.",
  "write.header.publishToast": "A publicação ainda não está disponível.",
  "write.header.savedSaving": "A guardar…",
  "write.header.savedError": "Não foi possível guardar, vamos tentar de novo",
  "write.header.savedOk": "Todas as alterações guardadas",
  "write.header.issueScheduled": "Agendado numa edição",

  // ── Alternador Rascunho/Composição/Leitura (editorMode.ts) ───────────────
  "write.mode.draft": "Rascunho",
  "write.mode.shape": "Composição",
  "write.mode.read": "Leitura",

  // ── ArticleEditorStatus ───────────────────────────────────────────────────
  "write.status.notFoundTitle": "Não conseguimos encontrar este rascunho",

  // ── ArticleDocument ───────────────────────────────────────────────────────
  "write.document.headlinePlaceholder": "Título",
  "write.document.standfirstPlaceholder":
    "Resumo: uma ou duas frases sob o título",
  "write.document.addBlockHint": "ou escreve / num parágrafo vazio",

  // ── Tipos de bloco (blockKinds.ts não é um componente — traduzidos em
  // cada local de apresentação: SlashMenu, a barra de adição do
  // ArticleDocument, e a etiqueta de tipo no ArticleBlockEditor) ──────────
  "write.blockKind.paragraph.label": "Parágrafo",
  "write.blockKind.paragraph.hint": "Texto",
  "write.blockKind.heading.label": "Subtítulo de secção",
  "write.blockKind.heading.hint": "H2",
  "write.blockKind.pullQuote.label": "Citação em destaque",
  "write.blockKind.pullQuote.hint": "Destaque",
  "write.blockKind.quote.label": "Citação atribuída",
  "write.blockKind.quote.hint": "Citada",
  "write.blockKind.image.label": "Imagem",
  "write.blockKind.image.hint": "Carregar",
  "write.blockKind.qa.label": "Entrevista P&R",
  "write.blockKind.qa.hint": "Par",
  "write.blockKind.stats.label": "Linha de estatísticas",
  "write.blockKind.stats.hint": "Números",

  // ── ArticleBlockEditor ────────────────────────────────────────────────────
  "write.block.moveUpAria": "Mover bloco para cima",
  "write.block.moveDownAria": "Mover bloco para baixo",
  "write.block.removeAria": "Remover bloco",
  "write.block.paragraphPlaceholder": "Escreve, ou prime / para um bloco",
  "write.block.headingPlaceholder": "Subtítulo de secção",
  "write.block.pullQuotePlaceholder": "Citação em destaque",

  // ── ArticleBlockKindFields ────────────────────────────────────────────────
  "write.block.quotePlaceholder": "Discurso citado",
  "write.block.attributionPlaceholder": "Atribuição",
  "write.block.attributionAria": "Atribuição da citação",
  "write.block.questionPlaceholder": "Pergunta",
  "write.block.whoPlaceholder": "Quem está a responder",
  "write.block.whoAria": "Nome da pessoa entrevistada",
  "write.block.answerPlaceholder": "Resposta",
  "write.block.statValuePlaceholder": "61%",
  "write.block.statLabelPlaceholder": "Etiqueta",
  "write.block.statValueAria": "Valor da estatística {number}",
  "write.block.statLabelAria": "Etiqueta da estatística {number}",
  "write.block.statRemoveAria": "Remover estatística {number}",
  "write.block.addStat": "Adicionar estatística",
  "write.block.imageUrlLabel": "URL da imagem",

  // ── ImageBlockControls ────────────────────────────────────────────────────
  "write.image.altLabel": "Texto alternativo",
  "write.image.altError": "Obrigatório para leitores de ecrã e legendas.",
  "write.image.tintLabel": "Cor",
  "write.image.tintAria": "Cor: {tint}",
  "write.image.tint.coral": "Coral",
  "write.image.tint.jade": "Jade",
  "write.image.tint.plum": "Ameixa",
  "write.image.tint.violet": "Violeta",
  "write.image.creditLabel": "Crédito",
  "write.image.creditError": "Obrigatório antes de publicar.",
  "write.image.rightsLabel": "Direitos",
  "write.image.rights.commissioned": "Encomendada",
  "write.image.rights.licensed": "Licenciada",
  "write.image.rights.courtesy": "Cortesia",
  "write.image.rights.cc": "Creative Commons",
  "write.image.cropAria": "Proporção de corte",
  "write.image.focalAria": "Ponto focal: {x}% horizontal, {y}% vertical",
  "write.image.captionPlaceholder": "Legenda",

  // ── SelectionToolbar ──────────────────────────────────────────────────────
  "write.selection.toolbarAria": "Formatação de texto",
  "write.selection.emphasis": "Ênfase",
  "write.selection.strong": "Negrito",
  "write.selection.link": "Hiperligação",

  // ── PublishRail ────────────────────────────────────────────────────────────
  "write.publish.title": "Publicar",
  "write.publish.whenLabel": "Quando é publicado",
  "write.publish.now": "Agora",
  "write.publish.schedule": "Agendar",
  "write.publish.withIssue": "Com a edição",
  "write.publish.scheduleNote":
    "O agendamento de data e hora chega em breve. Por agora, fica como rascunho.",
  "write.publish.issueNote": "Publica-se automaticamente quando a edição sai.",
  "write.publish.checklistHeading": "Antes de publicar · {done}/{total}",
  "write.publish.cta": "Publicar",
  "write.publish.checklist.standfirst": "Resumo escrito",
  "write.publish.checklist.alts": "Texto alternativo em todas as imagens",
  "write.publish.checklist.altsPending":
    "Texto alternativo em todas as imagens (ainda nenhuma)",
  "write.publish.checklist.sensitivity":
    "Leitura de sensibilidade: tratada na ficha da peça",
  "write.publish.checklist.source": "Fonte na linha de estatísticas (opcional)",

  // ── ArticleMetaRail ────────────────────────────────────────────────────────
  "write.meta.title": "Metadados da peça",
  "write.meta.sectionLabel": "Secção",
  "write.meta.bylineLabel": "Assinatura",
  "write.meta.bylineHelper": "Definida no separador Resumo da ficha da peça.",
  "write.meta.roleLabel": "Função",
  "write.meta.roleHelper":
    "Um qualificador da assinatura, por exemplo “Editora convidada”.",
  "write.meta.tagsLabel": "Etiquetas",
  "write.meta.tagsHelper": "Separadas por vírgulas.",
  "write.meta.slugLabel": "Slug",
  "write.meta.slugHelper": "Gerado pelo servidor.",
  "write.meta.wordCountLabel": "Contagem de palavras",
  "write.meta.readTimeLabel": "Tempo de leitura",

  // ── NotesRail ────────────────────────────────────────────────────────────
  "write.notes.title": "Notas",
  "write.notes.loading": "A carregar notas…",
  "write.notes.empty": "Sem notas neste rascunho.",
  "write.notes.you": "Tu",
  "write.notes.reply": "Responder",
  "write.notes.resolve": "Resolver",
  "write.notes.reopen": "Reabrir",
  "write.notes.resolvedChip": "Resolvida",
  "write.notes.addAria": "Adicionar uma nota",
  "write.notes.addPlaceholder": "Deixa uma nota neste rascunho…",
  "write.notes.addCta": "Adicionar nota",
  "write.notes.addToast": "Nota adicionada.",
  "write.notes.replyAria": "Responder a {who}",
  "write.notes.replyPlaceholder": "Escreve uma resposta…",
  "write.notes.replySend": "Enviar resposta",
  "write.notes.replyToast": "Resposta adicionada.",
  "write.notes.resolveToast": "Marcada como resolvida.",
  "write.notes.reopenToast": "Reaberta.",

  // ── VersionsRail (Fase 7 Onda E — captura + restauro + comparação) ────────
  "write.versions.title": "Histórico",
  "write.versions.loading": "A carregar versões…",
  "write.versions.empty": "Sem versões anteriores registadas.",
  "write.versions.you": "Tu",
  "write.versions.saveCta": "Guardar uma versão",
  "write.versions.saveToast": "Versão guardada.",
  "write.versions.manualSaveLabel": "Guardada manualmente",
  "write.versions.compare": "Comparar",
  "write.versions.restore": "Restaurar",
  "write.versions.restoreToast": "Versão \"{label}\" restaurada.",
  "write.versions.restoredFromLabel": "Restaurada a partir de {label}",
  "write.versions.restoreModal.title": "Restaurar \"{label}\"?",
  "write.versions.restoreModal.body":
    "Restaurar esta versão? O teu rascunho atual é guardado primeiro, por isso nada se perde.",
  "write.versions.restoreModal.cancel": "Cancelar",
  "write.versions.restoreModal.confirm": "Restaurar esta versão",
  "write.versions.restoreModal.restoring": "A restaurar…",
  "write.versions.diff.title": "Comparar versões",
  "write.versions.diff.sub": "\"{label}\" por {author} · {when}",
  "write.versions.diff.loading": "A carregar versão…",
  "write.versions.diff.error": "Não foi possível carregar esta versão.",
  "write.versions.diff.empty": "Nada para comparar. Esta versão não tem blocos.",
  "write.versions.diff.before": "Esta versão",
  "write.versions.diff.now": "Rascunho atual",
  "write.versions.diff.status.unchanged": "Sem alterações",
  "write.versions.diff.status.changed": "Alterado",
  "write.versions.diff.status.added": "Adicionado depois",
  "write.versions.diff.status.removed": "Removido depois",

  // ══════════════════ Produção da edição (Fase 5) ══════════════════════════
  // IssueProductionPage + desk/issue/* — ordem de publicação, capa e índice,
  // digest e redes, checklist/modal de lançamento, pesquisa no arquivo.
  // Títulos de peças, secções, resumos e linhas do arquivo são dados, não
  // chrome, e ficam por traduzir tal como no resto da redação.

  // ── Cabeçalho da IssueProductionPage + estado "não encontrada" ──────────
  "issue.header.backToDesk": "Voltar à redação",
  "issue.header.notFoundTitle": "Edição não encontrada",
  "issue.header.notFoundDescription":
    "Esta edição ainda não está em produção, ou o número não corresponde a nenhuma na redação.",
  "issue.header.title": "Edição {number} · {theme}",
  "issue.header.laidOut": "{ready} de {total} paginadas",
  "issue.header.proof": "Prova",
  "issue.header.proofToast": "Prova em PDF gerada para a gráfica",

  // ── ShipChecklistCard + ShipIssueModal ──────────────────────────────────
  "issue.ship.cta": "Lançar a edição",
  "issue.ship.checklistHeading": "Lista de lançamento",
  "issue.ship.modalTitle": "Lançar a edição {number}?",
  "issue.ship.modalSubWithDate":
    "As peças publicam-se todas juntas às 09:00 de {date}, pela ordem que definiste. O digest sai no mesmo momento.",
  "issue.ship.modalSubNoDate":
    "As peças publicam-se todas juntas às 09:00, pela ordem que definiste. O digest sai no mesmo momento.",
  "issue.ship.notYet": "Ainda não",
  "issue.ship.shipIt": "Lançar",
  "issue.ship.warnNote":
    "As peças que ainda estão atrás do portão de publicação ficam em espera e publicam-se mais tarde. A edição não espera por elas.",

  // ── IssueTabsNav ─────────────────────────────────────────────────────────
  "issue.tabs.ariaLabel": "Secções da produção da edição",
  "issue.tabs.runningOrder": "Ordem de publicação",
  "issue.tabs.coverContents": "Capa e índice",
  "issue.tabs.digestSocial": "Digest e redes",
  "issue.tabs.archive": "Arquivo",

  // ── PagesCard ────────────────────────────────────────────────────────────
  "issue.pages.heading": "Páginas",
  "issue.pages.editorial": "Editorial",
  "issue.pages.total": "Total",
  "issue.pages.spare_one": "{count} página de folga",
  "issue.pages.spare_other": "{count} páginas de folga",

  // ── RunningOrderTab ──────────────────────────────────────────────────────
  "issue.runOrder.deckNoPageCount": "Deck: sem contagem de páginas",
  "issue.runOrder.pagesPrefix": "pp. {pages}",
  "issue.runOrder.laidOut": "Paginada",
  "issue.runOrder.inLayout": "Em paginação",
  "issue.runOrder.moveEarlierAria":
    "Mover “{title}” para mais cedo na ordem de publicação",
  "issue.runOrder.moveLaterAria":
    "Mover “{title}” para mais tarde na ordem de publicação",
  "issue.runOrder.open": "Abrir",

  // ── CoverContentsTab ─────────────────────────────────────────────────────
  "issue.cover.heading": "Capa",
  "issue.cover.artPlaceholder": "Imagem de capa",
  "issue.cover.imageUrlLabel": "URL da imagem de capa",
  "issue.cover.imageUrlPlaceholder": "https://…",
  "issue.cover.coverlineLabel": "Frase de capa {n}",
  "issue.cover.hint":
    "As frases de capa não são títulos. Mais curtas, mais diretas, sem trocadilhos.",
  "issue.contents.heading": "Índice",
  "issue.contents.blurbLabel": "Resumo do índice",
  "issue.contents.blurbPlaceholder": "Uma frase, escrita pela redação.",

  // ── DigestSocialTab ──────────────────────────────────────────────────────
  "issue.digest.heading": "Digest para a comunidade",
  "issue.digest.hint":
    "Sai às 09:00 no dia em que a edição é publicada. A ordem aqui é a ordem no email.",
  "issue.digest.includeAria": "Incluir “{title}” no digest para a comunidade",
  "issue.digest.editBlurbAria": "Editar o resumo do digest de “{title}”",
  "issue.digest.save": "Guardar",
  "issue.digest.cancel": "Cancelar",
  "issue.digest.edit": "Editar",
  "issue.digest.sendTest": "Enviar-me um teste",
  "issue.digest.sendTestToast":
    "Um digest de teste está a caminho da tua caixa de entrada.",
  "issue.digest.scheduleWithIssue": "Agendar com a edição",
  "issue.digest.scheduleToast": "O digest sai junto com a edição.",
  "issue.digest.socialHeading": "Redes sociais",
  "issue.digest.socialAltHint":
    "O texto alternativo é copiado da imagem, por isso está sempre preenchido.",

  // ── ArchiveTab ───────────────────────────────────────────────────────────
  "issue.archive.heading": "Arquivo",
  "issue.archive.emptyTitle": "Ainda não há arquivo para pesquisar",
  "issue.archive.emptyDescription":
    "As edições anteriores aparecem aqui assim que forem indexadas. Verificado automaticamente no momento da encomenda.",
  "issue.archive.searchPlaceholder": "Já publicámos algo assim?",
  "issue.archive.searchAria":
    "Pesquisar no arquivo da revista por título, autoria ou etiqueta",
  "issue.archive.noMatches": "Nada corresponde a “{query}”.",
  "issue.archive.entryMeta": "edição {issue} · {by} · {tags}",
  "issue.archive.read": "Ler",
  "issue.archive.readToast": "Abrir “{title}” ainda não está disponível.",
  "issue.archive.checkedAutomatically":
    "Verificado automaticamente no momento da encomenda.",

  // ══════════════════ Espaço de trabalho da autoria (Fase 6) ═══════════════
  // `/magazine/writer` — a vista de uma pessoa colaboradora sobre as suas
  // próprias atribuições, propostas e pagamentos. O conteúdo dos registos
  // (títulos e notas de atribuições, nomes de secções, etiquetas de fase e
  // estado, texto de estado de propostas e pagamentos) vem da API como
  // conteúdo editorial e fica deliberadamente por traduzir, tal como no
  // painel de edição acima. Só o chrome autorado pela plataforma é traduzido
  // abaixo.

  // ── WriterWorkspacePage ──────────────────────────────────────────────────
  "writer.tabs.work": "O teu trabalho",
  "writer.tabs.pitches": "As tuas propostas",
  "writer.tabs.payments": "Pagamentos",
  "writer.tabs.ariaLabel": "Separadores do espaço de trabalho",
  "writer.page.errorTitle": "O teu espaço de trabalho não carregou",
  "writer.page.errorDescription":
    "Algo correu mal ao carregar as tuas atribuições. Tenta atualizar a página.",

  // ── AssignmentCard ───────────────────────────────────────────────────────
  "writer.work.emptyTitle": "Ainda não tens atribuições",
  "writer.work.emptyDescription":
    "Quando uma pessoa editora te encomendar algo, aparece aqui.",
  "writer.work.dueLabel": "Prazo",
  "writer.work.noDateSet": "Sem data definida",
  "writer.work.lengthLabel": "Extensão",
  "writer.work.length": "{words} / {target} palavras",
  "writer.work.notFiledYet": "Ainda não entregue",
  "writer.work.feeLabel": "Valor",
  "writer.work.paymentLabel": "Pagamento",
  "writer.work.fileDraft": "Entregar um rascunho",
  "writer.work.readBrief": "Ler o briefing",
  "writer.work.readBriefToast":
    "O briefing completo está na ficha da peça. Brevemente aqui.",
  "writer.work.messageEditor": "Mensagem à pessoa editora",
  "writer.work.activeBadge": "Ativa",
  "writer.work.setActive": "Usar para assinatura e termos",

  // ── WriterPitchesTab ─────────────────────────────────────────────────────
  "writer.pitches.emptyTitle": "Ainda não tens propostas",
  "writer.pitches.emptyDescription":
    "Envia uma abaixo. Uma pessoa lê todas as propostas, e responde em 5 dias.",
  "writer.pitches.sentMeta": "Enviada a {sent} · resposta em 5 dias",
  "writer.pitches.formHeading": "Propor um texto",
  "writer.pitches.titleLabel": "Título de trabalho",
  "writer.pitches.titlePlaceholder": "Como se chama a peça, mais ou menos?",
  "writer.pitches.noteLabel": "Do que se trata",
  "writer.pitches.notePlaceholder": "A ideia, porquê agora, e para quem é.",
  "writer.pitches.send": "Enviar",

  // ── WriterPaymentsTab ────────────────────────────────────────────────────
  "writer.payments.emptyTitle": "Ainda não tens pagamentos",
  "writer.payments.emptyDescription":
    "Assim que uma peça for entregue e aprovada, o pagamento aparece aqui.",
  "writer.payments.issueLabel": "Edição {issue}",
  "writer.payments.unscheduled": "Sem edição agendada",
  "writer.payments.terms":
    "Prazo de pagamento de 21 dias. Se estivermos atrasados, isso fica registado aqui antes de teres de perguntar.",

  // ── AgreedTermsCard ──────────────────────────────────────────────────────
  "writer.terms.heading": "O que acordaste",
  "writer.terms.body":
    "Toda a encomenda tem os mesmos termos: valor, valor de cancelamento, prazo, e o que acontece se a peça mudar de forma.",
  "writer.terms.killFeeLabel": "Valor de cancelamento",
  "writer.terms.rightsLabel": "Direitos",
  "writer.terms.editsLabel": "Edições",
  "writer.terms.emptyState": "Ainda sem nenhuma encomenda ativa. Os termos aparecem assim que houver uma.",

  // ── BylineSafetyCard ─────────────────────────────────────────────────────
  "writer.byline.heading": "A tua segurança",
  "writer.byline.body":
    "Escolhes a assinatura em cada peça, e podes alterá-la até ao momento em que é publicada.",
  "writer.byline.fieldLabel": "Assinatura para “{title}”",
  "writer.byline.anonymous": "Anónime",
  "writer.byline.emptyState":
    "Ainda não tens nenhuma atribuição ativa para definir uma assinatura.",

  // ── FileDraftModal ───────────────────────────────────────────────────────
  "writer.fileDraft.title": "Entregar “{title}”",
  "writer.fileDraft.cancel": "Cancelar",
  "writer.fileDraft.submit": "Entregar",
  "writer.fileDraft.body":
    "Cola o texto, arrasta um documento, ou escreve aqui. Chega à redação em blocos limpos, prontos a editar.",
  "writer.fileDraft.fieldLabel": "Rascunho",
  "writer.fileDraft.fieldHelper":
    "Enviar um documento chega em breve. Colar o texto já funciona.",
  "writer.fileDraft.placeholder": "Cola aqui o teu rascunho…",
  "writer.fileDraft.wordCountWithTarget":
    "A contagem de palavras é comparada com o teu briefing ({target} palavras). Passar do valor não é problema.",
  "writer.fileDraft.wordCountNoTarget":
    "A contagem de palavras é comparada com o teu briefing. Passar do valor não é problema.",

  // ── MessageEditorModal (Fase 7 Vaga F) ──────────────────────────────────
  "writer.messages.title": "Mensagens · {title}",

  // ── EditorMessageCard (cartão "Da tua pessoa editora", Fase 7 Vaga F) ──
  "writer.editorMessage.heading": "Da tua pessoa editora",
  "writer.editorMessage.fromLabel": "{name}",
  "writer.editorMessage.loading": "A carregar…",
  "writer.editorMessage.noMessagesYet": "Ainda sem mensagens. Diz olá.",
  "writer.editorMessage.emptyState": "Ainda sem nenhuma encomenda ativa.",

  // ── PieceThread (conversa partilhada pessoa editora↔quem escreve, Fase 7 Vaga F) ─
  "pieceThread.you": "Tu",
  "pieceThread.emptyTitle": "Ainda sem mensagens",
  "pieceThread.emptyDescription":
    "Diz olá. Insistências e perguntas vivem aqui agora, em vez do email.",
  "pieceThread.errorState": "Não foi possível carregar esta conversa. Tenta de novo daqui a pouco.",
  "pieceThread.composerAria": "Mensagem",
  "pieceThread.composerPlaceholder": "Escreve uma mensagem…",
  "pieceThread.send": "Enviar",
  "pieceThread.sentToast": "Mensagem enviada.",

  // ══════════════════ Candidatar a escrever ═══════════════════════════════
  "applyToWrite.intro.eyebrow": "Escreve para nós",
  "applyToWrite.intro.title": "Mostra-nos <em>o que sabes fazer.</em>",
  "applyToWrite.intro.lead":
    "Toda a história que chega a um editor começa aqui. Diz-nos porque queres escrever para a QueerPulse e partilha uma amostra da tua escrita: colada aqui, ou um link para algo que já publicaste.",
  "applyToWrite.form.pitchNoteLabel": "Porque queres escrever para nós?",
  "applyToWrite.form.pitchNotePlaceholder": "Uma ou duas frases chegam.",
  "applyToWrite.form.sampleTextLabel": "Cola uma amostra de escrita",
  "applyToWrite.form.sampleTextPlaceholder": "Cola aqui um texto teu.",
  "applyToWrite.form.sampleLinkLabel": "…ou liga a algo que já publicaste",
  "applyToWrite.form.sampleLinkPlaceholder": "https://",
  "applyToWrite.form.sampleRequiredError":
    "Inclui uma amostra de escrita: cola texto ou adiciona um link.",
  "applyToWrite.form.submitCta": "Enviar candidatura",
  "applyToWrite.form.submittingCta": "A enviar…",
  "applyToWrite.form.submitError": "Algo correu mal. Tenta novamente.",
  "applyToWrite.pending.title": "A tua candidatura está <em>em análise.</em>",
  "applyToWrite.pending.body":
    "Um editor vai ler a tua amostra e responder-te. Isto demora normalmente umas duas semanas.",
  "applyToWrite.declined.title": "Desta vez não",
  "applyToWrite.declined.body": "Obrigado por te candidatares. Desta vez não resultou.",
  "applyToWrite.declined.reviewNoteLabel": "Da parte dos editores:",
  "applyToWrite.declined.reapplyCta": "Candidatar de novo",
  "applyToWrite.approved.title": "Já és uma pessoa escritora da QueerPulse",
  "applyToWrite.approved.body":
    "A tua candidatura foi aprovada. Vai à página de submissão para enviares a tua primeira proposta.",
  "applyToWrite.approved.cta": "Começar a escrever",
  "applyToWrite.backCta": "Voltar à revista",
};
