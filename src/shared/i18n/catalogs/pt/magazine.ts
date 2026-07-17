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
  "landing.subpages.covers.blurb":
    "Todas as capas que já publicámos, num só lugar.",
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
  "cover.byline": "Por",
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
  // CAST_TARGETS.kindKey (audioPlayer.data.ts) — device protocol/type chrome.
  "audio.cast.kind.airplaySpeaker": "AirPlay · altifalante",
  "audio.cast.kind.castScreen": "Cast · ecrã",
  "audio.cast.kind.airplayTwoSpeakers": "AirPlay · 2 altifalantes",
  "audio.cast.kind.bluetoothHeadphones": "Bluetooth · auscultadores",
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
  "editor.pitchInbox.showMore": "Mostrar mais {count} propostas →",
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
    "Tom mais suave — esta é uma das primeiras peças desta pessoa connosco.",
  "editor.modals.chase.messageAria": "Mensagem para a pessoa colaboradora",
  "editor.modals.chase.offerExtension": "Propor uma prorrogação do prazo",
  "editor.modals.chase.bodyNewVoice":
    "Olá {name} — sem qualquer pressão, só a confirmar como vai “{title}”. Como é que estás a sentir-te? Se ajudar, marcamos uma chamada ou adiamos o prazo. Estamos mesmo felizes por te ter nesta edição.",
  "editor.modals.chase.bodyReturning":
    "Olá {name} — um lembrete simpático sobre “{title}”, agora em {stage} e com prazo a {due}. Diz-me se alguma coisa está a atrapalhar, e vemos como resolver.",
  "editor.modals.handoff.eyebrow": "Passar a peça",
  "editor.modals.handoff.title": "Passar “{title}”",
  "editor.modals.handoff.cancel": "Cancelar",
  "editor.modals.handoff.cta": "Passar",
  "editor.modals.handoff.handTo": "Passar a",
  "editor.modals.handoff.noteLabel": "Nota",
  "editor.modals.handoff.noteWriterWaiting":
    "@{editor} a passar-te isto — está em {stage}, ainda à espera de quem escreve. Diz se quiseres mais contexto.",
  "editor.modals.handoff.noteReady":
    "@{editor} a passar-te isto — está em {stage}, pronto para os teus olhos. Diz se quiseres mais contexto.",
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
    "Ver perfis de pessoas colaboradoras →",
  "editor.sideCards.recentActivity": "Atividade recente",
  "editor.sideCards.quickActions": "Ações rápidas",
  "editor.sideCards.sendPitchDecisions":
    "→ Enviar decisões de propostas em lote",
  "editor.sideCards.emailContributorsWaiting":
    "→ Enviar email às pessoas colaboradoras em espera",
  "editor.sideCards.previewIssueLayout":
    "→ Pré-visualizar a paginação da edição",
  "editor.sideCards.exportContributorList":
    "→ Exportar lista de pessoas colaboradoras (CSV)",

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

  // ══════════════════ Assistente de Propor um Texto ════════════════════════
  // `INITIAL_DRAFT` (o exemplo de título/assinatura/resumo/corpo) fica como
  // conteúdo em inglês — um ensaio de exemplo, não chrome.

  // ── SubmitStoryIntro ───────────────────────────────────────────────────
  "submitStory.intro.eyebrow": "Propõe um texto",
  "submitStory.intro.title": "Tens algo que <em>vale a pena contar?</em>",
  "submitStory.intro.lead":
    "A revista da QueerPulse é escrita pela comunidade. Não precisas de uma assinatura habitual nem de um agente — só de uma história que importa e de uma forma honesta de a contar.",
  "submitStory.intro.lookingFor.specific.title": "O específico em vez do geral",
  "submitStory.intro.lookingFor.specific.body":
    "Um clube de jantares, uma rua, uma tarde. Confiamos que a história pequena carrega a grande.",
  "submitStory.intro.lookingFor.beyond.title": "Lisboa e para além dela",
  "submitStory.intro.lookingFor.beyond.body":
    "Enraizados aqui, mas publicamos também vozes da diáspora e de quem nos visita. O lugar importa; as fronteiras, menos.",
  "submitStory.intro.lookingFor.pay.title": "Pagamos, sempre",
  "submitStory.intro.lookingFor.pay.body":
    'Todas as peças publicadas são pagas de forma justa — valores partilhados à partida, nunca em troca de "visibilidade".',
  "submitStory.intro.stepsHeading": "O que acontece a seguir",
  "submitStory.intro.step.reply":
    "Uma resposta em duas semanas — sim, não, ou vamos falar.",
  "submitStory.intro.step.assigned":
    "Se for sim, é atribuída uma pessoa editora e combinam juntas o valor e o prazo.",
  "submitStory.intro.step.copyright":
    "Mantêm os direitos de autor. Nós licenciamos, não somos donos do texto.",

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
  "submitStory.sidebar.guideline.language.detail": "— publicamos nos dois.",
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
    "Tens resposta nossa até <strong>{date}</strong> — sim, não, ou vamos falar.",
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
  "submitStory.writer.autosaved": "Guardado automaticamente",
  "submitStory.writer.unsaved": "Por guardar…",
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
  "submitStory.editor.draftSaved": "Rascunho guardado.",
  "submitStory.editor.chooseSectionError":
    "Escolhe primeiro uma secção para a tua peça.",
  "submitStory.editor.needHeadlineError":
    "O teu texto precisa de um título antes de seguir para a redação.",
  "submitStory.editor.minWordsError":
    "Falta um pouco mais — pelo menos {min} palavras antes de submeteres.",
  "submitStory.editor.submitError":
    "Não foi possível submeter o teu texto agora — tenta de novo.",
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
  "pitchTracker.page.stubToast": "{label} — brevemente neste protótipo",

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

  // ══════════════════ NewsletterSubscribe ═══════════════════════════════════
  "newsletter.subscribe.streamLabel.all": "as três newsletters",
  "newsletter.subscribe.streamLabel.dispatch": "o Dispatch da Comunidade",
  "newsletter.subscribe.streamLabel.long": "a mensal Reportagens longas",
  "newsletter.subscribe.streamLabel.trans": "o boletim do Trans Hub",
  "newsletter.subscribe.confirmToast":
    "Quase lá — confirma na tua caixa de entrada",
  "newsletter.subscribe.doneTitle": "Falta mais um <em>passo.</em>",
  "newsletter.subscribe.doneBody":
    "Vamos enviar <strong>{stream}</strong> para <strong>{email}</strong>.",
  "newsletter.subscribe.doneNext":
    "Confirma na tua caixa de entrada — o link expira em 48 horas. Podes mudar que newsletters recebes a partir de qualquer email.",
  "newsletter.subscribe.anotherCta": "Subscrever outro email",
  "newsletter.subscribe.emailPlaceholder": "tu@exemplo.com",
  "newsletter.subscribe.submitCta": "Subscrever →",
  "newsletter.subscribe.footAll": "Escolhe que newsletters queres no passo 2. ",
  "newsletter.subscribe.footOne":
    "Vais receber <strong>{stream}</strong> — ajusta no passo 2. ",
  "newsletter.subscribe.footShared":
    "Cancela a subscrição num toque a partir de qualquer email. Nunca partilhamos o teu endereço.",

  // ══════════════════ PrintOrderModal (edição impressa da Edição 09) ═══════
  "printOrder.dialogAria": "Encomendar a edição impressa",
  "printOrder.closeAria": "Fechar",
  "printOrder.success.title": "Está a <em>caminho de ti.</em>",
  "printOrder.success.body_one":
    "{count} exemplar de <b>{issue}</b> reservado desta tiragem. Enviamos um email para <b>{email}</b> quando sair de Marvila — normalmente dentro de uma semana. Obrigada por financiares as pessoas colaboradoras da próxima edição.",
  "printOrder.success.body_other":
    "{count} exemplares de <b>{issue}</b> reservados desta tiragem. Enviamos um email para <b>{email}</b> quando saírem de Marvila — normalmente dentro de uma semana. Obrigada por financiares as pessoas colaboradoras da próxima edição.",
  "printOrder.success.doneCta": "Concluído",
  "printOrder.eyebrow": "Edição impressa · {issue}",
  "printOrder.title": "Encomendar a <em>tiragem impressa.</em>",
  "printOrder.lead":
    "{pages} páginas, capa em risografia, impressa em Marvila. <b>{price} € ao custo</b> — as receitas financiam as pessoas colaboradoras da próxima edição.",
  "printOrder.copiesLabel": "Exemplares",
  "printOrder.fewerCopiesAria": "Menos exemplares",
  "printOrder.moreCopiesAria": "Mais exemplares",
  "printOrder.emailFieldLabel": "Email para atualizações do envio",
  "printOrder.emailFieldHelper":
    "Só o usamos para te avisar quando o teu exemplar for enviado.",
  "printOrder.emailPlaceholder": "tu@exemplo.com",
  "printOrder.cancelCta": "← Cancelar",
  "printOrder.placingCta": "A colocar a tua encomenda…",
  "printOrder.placeCta": "Fazer encomenda — {total} €",

  // ══════════════════ CoverGalleryPage ══════════════════════════════════════
  // Os registos de COVERS/STATS/ILLUS (tema de cada capa, créditos de autoria,
  // estatísticas de impressão) são conteúdo específico de cada edição —
  // ficam como dados em inglês.
  "coverGallery.backLink": "a Revista",
  "coverGallery.eyebrow": "Revista · todas as capas · 2024 → presente",
  "coverGallery.title": "Nove <em>capas,</em> uma por estação.",
  "coverGallery.dek":
    "Todas as capas da Revista QueerPulse, por ordem. Impressas em risografia em Lisboa, em formato A5. Cada uma foi feita por uma pessoa artista diferente, em conjunto com a redação. <em>A imprensa pode utilizar qualquer uma destas imagens</em> nos termos do nosso <a>dossiê de imprensa</a>.",
  "coverGallery.madeWithHeading": "Feitas <em>com</em>",
  "coverGallery.madeWithSub":
    "Pessoas artistas de capa, por ordem de capa. A maioria são pessoas da comunidade; duas foram encomendadas externamente.",

  // ══════════════════ Páginas de reportagem (Story showcase) ═════════════════
  // StoryPage/StoryTomasPage/StorySafetyPage e os respetivos *Article são
  // peças completas da revista (título, nome de autoria, categoria, tempo de
  // leitura, corpo do texto, citações, biografias) — conteúdo editorial, o
  // mesmo tratamento de `data/articles.tsx`. Só a palavra de ligação da
  // assinatura, o título partilhado "mais da comunidade", o CTA de perfil e
  // os CTAs finais do Outro são chrome, traduzidos abaixo.
  "story.wordsBy": "Texto de",
  "story.moreHeading": "Mais <em>da comunidade</em>",
  "story.viewProfileCta": "Ver perfil →",
  "story.outro.studio.title":
    "Queres fazer parte do que <em>vai ser escrito a seguir?</em>",
  "story.outro.studio.sub":
    "As histórias são sobre as pessoas na sala. Junta-te a nós.",
  "story.outro.tomas.title":
    "Queres juntar-te à mesa do Tomás? <em>Junta-te à sala primeiro.</em>",
  "story.outro.tomas.sub":
    "O jantar, a rede, os encontros — tudo começa com um convite de alguém que te conhece.",
  "story.outro.safety.title": "Leste e parece-te <em>certo?</em>",
  "story.outro.safety.sub":
    "Não somos para todas as pessoas. Mas se isto faz sentido para ti, talvez sejas para nós.",

  // ══════════════════ TagPage (secção Reportagens longas) ═══════════════════
  // O kicker/título/dek/assinatura de cada peça (TagPageHero destacada +
  // TagPageList, tag.data.tsx) é conteúdo editorial, deixado em inglês. Os
  // rótulos CHIPS de tópico funcionam também como o valor de filtro guardado,
  // comparado com `topics` de cada peça — nunca passar isso pelo catálogo
  // (partiria o filtro em modo pt). Só o chrome da secção é traduzido abaixo.
  "tag.hero.eyebrow": "Revista · categoria",
  "tag.hero.h1": "Reportagens <em>longas.</em>",
  "tag.hero.dek":
    "<b>Peças de vinte minutos ou mais.</b> Ensaios reportados, perfis com múltiplas fontes, e o tipo de trabalho longo que pede algo a quem lê. Jornalismo lento, de propósito. Peça nova a cada duas quintas-feiras.",
  "tag.hero.filterLabel": "Filtrar",
  "tag.hero.stats.piecesInSection": "Peças nesta secção",
  "tag.hero.stats.minAverageRead": "Min. de leitura em média",
  "tag.hero.stats.issuesRepresented": "Edições representadas",
  "tag.hero.stats.contributors": "Pessoas colaboradoras",
  "tag.hero.curatorEyebrow": "Nota editorial",
  "tag.hero.getLongReadsCta": "Recebe as reportagens longas por email →",
  "tag.list.emptyTitle": "Ainda não há reportagens longas nesta categoria",
  "tag.list.emptyDescription":
    "Ainda não há nada arquivado em <em>{topic}</em> nas reportagens longas. Explora todas as peças, ou recebe a próxima por email.",
  "tag.list.showAllCta": "Mostrar todas as reportagens longas",
  "tag.list.loadingMore": "A carregar reportagens longas mais antigas…",
  "tag.list.loadOlder_one": "Carregar {count} reportagem longa mais antiga",
  "tag.list.loadOlder_other":
    "Carregar {count} reportagens longas mais antigas",

  // ══════════════════ Arquivo da newsletter ═══════════════════════════════
  // O título/dek/meta de cada edição (newsletterArchive.data.tsx YEARS/LATEST,
  // e o corpo completo das edições enviadas em newsletterArchiveIssue.data.tsx)
  // é o conteúdo real da newsletter enviada — fica em inglês, como o corpo de
  // um artigo. Só o chrome da página do arquivo é traduzido abaixo.
  "newsletterArchive.hero.eyebrow": "Arquivo da newsletter · desde 2024",
  "newsletterArchive.hero.h1": "Todos os emails que já <em>enviámos.</em>",
  "newsletterArchive.hero.dek":
    "Três newsletters: um resumo comunitário quinzenal, um complemento mensal de reportagens longas e um boletim do Trans Hub. Todas gratuitas. Lê qualquer uma delas aqui — ou subscreve e enviamo-las diretamente.",
  "newsletterArchive.hero.stats.issuesInArchive": "Edições no arquivo",
  "newsletterArchive.hero.stats.activeStreams": "Newsletters ativas",
  "newsletterArchive.hero.stats.subscribersAllStreams":
    "Pessoas subscritoras em todas as newsletters",
  "newsletterArchive.hero.stats.languages": "Idiomas · EN & PT",
  "newsletterArchive.tabsAriaLabel": "Newsletters",
  "newsletterArchive.readInBrowserCta": "Ler no navegador →",
  "newsletterArchive.list.emptyTitle": "Ainda não há edições nesta newsletter",
  "newsletterArchive.list.emptyDescription":
    "Ainda não foi enviado nada nesta newsletter. Explora as três — há bastante no arquivo.",
  "newsletterArchive.list.clearFiltersCta": "Limpar filtros",
  "newsletterArchive.list.loadOlder_one": "Carregar {count} edição mais antiga",
  "newsletterArchive.list.loadOlder_other":
    "Carregar {count} edições mais antigas",
  "newsletterArchive.issue.backToArchive": "Voltar ao arquivo",
  "newsletterArchive.issue.browseFullArchive": "Explorar o arquivo completo",
  "newsletterArchive.issue.subscribeToThis": "Subscrever esta newsletter",

  // ══════════════════ Podcast (The Back Room) ═════════════════════════════
  // Os títulos/descrições/nomes de convidados/datas de cada episódio
  // (podcastShow.data.tsx) são o conteúdo editorial do programa — ficam em
  // inglês, como o corpo de um artigo. Só o chrome à volta é traduzido abaixo.
  "podcast.hero.eyebrow": "QueerPulse Audio · podcast",
  "podcast.hero.playLatestCta": "Reproduzir o mais recente",
  "podcast.hero.subscribeCta": "Subscrever",
  "podcast.listenOnLabel": "Ouve em",
  "podcast.aboutShowHeading": "Sobre o <em>programa</em>",
  "podcast.episodesHeading": "Episódios · {count}",
  "podcast.newestFirst": "Mais recentes primeiro",
  "podcast.viewEpisodeNotesCta": "Ver notas do episódio →",
  "podcast.playEpisodeAria": "Reproduzir episódio",
  "podcast.playEpisodeNumberAria": "Reproduzir episódio {number}",
  "podcast.showOlderEpisodes_one": "Mostrar {count} episódio mais antigo",
  "podcast.showOlderEpisodes_other": "Mostrar {count} episódios mais antigos",
  "podcast.sidebar.hostsHeading": "Apresentação",
  "podcast.sidebar.aboutShowHeading": "Sobre o programa",
  "podcast.sidebar.sponsoredLabel": "Patrocinado",
  "podcast.sidebar.guestHeading": "Queres ser convidade?",
  "podcast.sidebar.guestBody":
    "Isto acontece com frequência. Normalmente não aceitamos propostas diretas, mas se estás a fazer algo que vale mesmo a pena, conta-nos.",
  "podcast.sidebar.writeToTeamCta": "Escrever à equipa",
  "podcast.modal.listenToTitle": "Ouve <em>{show}</em>",
  "podcast.modal.sub":
    "Abre o programa na tua aplicação de podcasts, ou copia o feed.",
  "podcast.modal.copyCta": "Copiar",
  "podcast.modal.closeAria": "Fechar",
  "podcast.modal.rssCopiedToast": "Link do RSS copiado",

  // ── PLATFORMS.kindKey (PodcastShowModals.tsx category label) ────────────
  "podcast.platformKind.streaming": "Streaming",
  "podcast.platformKind.app": "Aplicação",
  "podcast.platformKind.rawFeed": "Feed direto",

  // ── SHOW_INFO.labelKey (PodcastShowSections.tsx sidebar facts) ──────────
  "podcast.showInfo.format": "Formato",
  "podcast.showInfo.schedule": "Periodicidade",
  "podcast.showInfo.length": "Duração",
  "podcast.showInfo.languages": "Idiomas",
  "podcast.showInfo.transcripts": "Transcrições",
  "podcast.showInfo.music": "Música",
};
