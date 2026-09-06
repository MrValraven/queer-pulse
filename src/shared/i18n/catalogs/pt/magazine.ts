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
  // Segunda linha do logótipo ("QueerPulse" fica sempre em inglês, nome
  // próprio, ver glossário pt-PT).
  "masthead.brandMagazine": "Revista",
  "masthead.tagline": "Publicada no primeiro dia de cada mês",
  "masthead.nav.current": "Edição atual",
  "masthead.nav.issues": "Edições",
  "masthead.nav.stories": "Histórias",
  "masthead.nav.authors": "Autoria",
  "masthead.nav.write": "Escreve para nós",
  "masthead.nav.sections": "Secções",
  "masthead.nav.search": "Pesquisar",

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

  // ── A capa organizada pela redação (MagazineLiveSections /
  //    MagazineFrontLead, CON-13).
  "front.leadKicker": "Reportagem de capa",
  "front.coverLabel": "Capa · Edição {number}",
  "front.moreInIssue": "Mais <em>nesta edição</em>",
  "front.fromTheMagazine": "Da revista",

  // ── MagazineCover ────────────────────────────────────────────────────────
  "cover.coverAlt": "Retrato de capa",
  "cover.coverPlaceholder": "Retrato de capa: a toda a largura, luz dramática",
  "cover.coverImageLabel": "Capa · junho de 2026",
  "cover.kicker": "Reportagem de capa · Reportagem",
  "cover.byline": "Por",
  "cover.photographyBy": "Fotografia de",
  "cover.readFullFeatureCta": "Ler a reportagem completa",

  // ── MagazineSections ─────────────────────────────────────────────────────
  "sections.live.title": "As <em>últimas</em> da revista",
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

  // ── Muro de acesso a membros (MagazineSignInWall, CON-07) ────────────────
  // Um 401 dos endpoints da revista significa "não tens sessão iniciada", e
  // nunca "não há nada publicado". Aparece a quem chega de fora por um link
  // partilhado, com um CTA de entrada que traz a pessoa de volta a esta página.
  "signInWall.title": "A revista é para membros",
  "signInWall.description":
    "Os ensaios, reportagens, entrevistas e críticas da comunidade ficam do lado de dentro, para quem escreve saber quem está a ler. Inicia sessão para continuar a leitura.",
  "signInWall.signInCta": "Iniciar sessão para ler",
  "signInWall.requestInviteCta": "Pedir um convite",

  // ── ArticlePage ──────────────────────────────────────────────────────────
  "article.notFoundMetaTitle": "Artigo não encontrado: Revista QueerPulse",
  "article.notFoundTitle": "Não conseguimos encontrar este artigo.",
  "article.notFoundBody":
    "O artigo pode ter mudado de sítio, ou o link pode estar incompleto.",
  "article.notFoundCta": "Voltar à revista",
  "article.pageTitleSuffix": ": Revista QueerPulse",
  "article.backToMagazine": "Revista",
  "article.relatedHeading": "Continua a <em>ler</em>",

  // ── ArticleNotes: notas de conteúdo (CON-06) e correções (CON-02) ────────
  "article.contentNotesHeading": "Notas de conteúdo",
  "article.contentNotesDismissAria":
    "Esconder as notas de conteúdo deste artigo",
  "article.correctionsHeading": "Correções",

  // ── CON-16: o aviso datado do ciclo de vida e o seletor de idioma ────────
  // Só interface. O jornalismo nunca entra neste catálogo: uma tradução é um
  // artigo próprio, com assinatura própria (ver o modelo `locale` /
  // `translation_of`), que é precisamente o objetivo do CON-16.
  "article.lifecycle.publishedOn": "Publicado a {date}",
  "article.lifecycle.readReplacement": "Ler {title}",
  "article.lifecycle.reviewDue": "Vamos rever este texto a {date}.",
  "article.lifecycle.under_review.heading": "Estamos a rever este texto",
  "article.lifecycle.under_review.changedOn": "em revisão desde {date}",
  "article.lifecycle.under_review.fallbackNote":
    "Alguma coisa que este texto descreve mudou. Estamos a revê-lo agora, por isso partes dele podem já estar desatualizadas.",
  "article.lifecycle.archived.heading": "Do arquivo",
  "article.lifecycle.archived.changedOn": "arquivado a {date}",
  "article.lifecycle.archived.fallbackNote":
    "Guardamos este texto como registo do seu tempo. Já não é atualizado, por isso lê-o como história.",
  "article.lifecycle.superseded.heading": "Há um texto mais recente",
  "article.lifecycle.superseded.changedOn": "substituído a {date}",
  "article.lifecycle.superseded.fallbackNote":
    "Um texto mais recente cobre este assunto. Este fica aqui como registo.",
  "article.language.label": "Ler em",
  "article.language.onlyIn": "Por agora, este texto só existe em {language}.",
  "article.language.inProgress": "{language} em curso",
  "article.language.translatedBy": "Tradução de {name}",

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
  "deck.tapToReveal": "Toca para revelar",
  "deck.beforeAfterHint": "Arrasta para comparar",
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
  "deck.editor.saveDraft": "Guardar rascunho",
  "deck.editor.publish": "Publicar",
  "deck.editor.unpublish": "Despublicar",
  "deck.editor.delete": "Eliminar",
  "deck.editor.leaveConfirm": "Tens alterações por guardar. Sair sem guardar?",
  "deck.editor.previewEmpty": "Adiciona um slide para pré-visualizar",
  "deck.editor.preview.title": "Pré-visualização",
  "deck.editor.preview.emptySlide":
    "Começa a preencher este slide para o veres aqui.",
  "deck.editor.budget.headingOver": "Demasiado longo. Vai cortar num telemóvel",
  "deck.editor.budget.headingOk": "Cabe no telemóvel mais estreito",
  "deck.editor.budget.bodyOver": "Um slide não é um parágrafo",
  "deck.editor.budget.bodyOk": "Curto o suficiente para ler de relance",
  "deck.editor.budget.count": "{count} / {max} caracteres",
  "deck.editor.saved": "Rascunho guardado",
  "deck.editor.publishedToast": "Deck publicado",
  "deck.editor.scheduledToast": "Deck agendado",
  "deck.editor.unpublishedToast": "Deck despublicado",
  "deck.editor.deletedToast": "Deck eliminado",
  "deck.editor.saveError":
    "Não foi possível guardar o teu deck. Tenta de novo.",
  "deck.editor.publishNotReadyError":
    "Adiciona pelo menos um slide, e texto alternativo em cada imagem, antes de publicar.",
  // ENG-112: um deck publicado ou ligado a uma peça já não pode ser eliminado,
  // por isso a recusa tem de dizer qual dos dois casos é e o que o desbloqueia.
  "deck.editor.deleteBlockedPublished":
    "Despublica este deck antes de o eliminares.",
  "deck.editor.deleteBlockedLinked":
    "Este deck pertence a uma peça da redação. Elimina a peça para remover os dois.",
  "deck.editor.backToDashboard": "Voltar ao painel",
  "deck.editor.metaTitle": "Detalhes do deck",
  "deck.editor.untitled": "Deck sem título",
  "deck.editor.header.subtitle": "Deck com {count} slides",
  "deck.editor.unsavedChanges": "Alterações por guardar",
  "deck.editor.convert": "Transformar em texto",
  "deck.editor.slidesHeading": "Slides",
  "deck.editor.slidesCount": "{count} de {max} · clica num slide para editar",
  "deck.editor.slidesCapped": "Limite de 40 slides atingido",
  // A PRD-131 ligou o agendamento de decks, por isso o painel passa a dizer o
  // que vai mesmo acontecer: sair com a edição, esperar por uma data, ou já.
  "deck.editor.publish.issueLinked":
    "Publica-se automaticamente quando a edição {number} sair.",
  "deck.editor.publish.issueUnlinked":
    "Este deck ainda não está numa edição. Adiciona-o a uma no registo da peça, ou publica-o agora ou numa data.",
  "deck.editor.publish.scheduledFor":
    "Agendado para {date} às {time}. Ninguém o vê até lá.",
  "deck.editor.publish.checklist.cover": "Slide de capa definido",
  "deck.editor.publish.checklist.source":
    "Fonte em todos os slides de estatística (opcional)",
  "deck.editor.publish.checklist.sourcePending":
    "Fonte em todos os slides de estatística (opcional, ainda nenhum)",
  "deck.editor.danger.title": "Zona de perigo",
  "deck.editor.danger.body":
    "Eliminar um deck remove-o de todos os sítios onde está ligado. Não é possível desfazer.",
  "deck.editor.danger.blockedPublished":
    "Este deck está publicado. Despublica-o primeiro e depois poderá ser eliminado.",
  "deck.editor.danger.blockedLinked":
    "Este deck pertence a uma peça da redação. Elimina a peça, que remove o deck com ela.",
  "deck.editor.danger.cta": "Eliminar este deck",
  "deck.editor.deleteModal.title": "Eliminar este deck?",
  // Substitui o texto antigo, que prometia um 404 a quem lê. A ENG-112 impede
  // eliminar um deck publicado, por isso ninguém chega a esse estado.
  "deck.editor.deleteModal.detail_one":
    "Eliminar remove {title} e o seu {count} slide. Não há como voltar atrás, e não fica nenhuma cópia.",
  "deck.editor.deleteModal.detail_other":
    "Eliminar remove {title} e os seus {count} slides. Não há como voltar atrás, e não fica nenhuma cópia.",
  "deck.editor.deleteModal.draftOnly":
    "Só um deck em rascunho pode ser eliminado, por isso ninguém fora da redação perde nada.",
  "deck.editor.convertModal.title": "Transformar isto em texto corrido?",
  "deck.editor.convertModal.successToast": "Convertido num rascunho de artigo.",
  "deck.editor.convertModal.partialToast":
    "Convertido, mas {dropped} não passaram e foram descartados.",
  "deck.editor.convertModal.errorToast":
    "Não foi possível converter este deck. Tenta novamente.",
  "deck.editor.convertModal.body":
    "Os slides de texto e imagem passam diretamente para blocos de artigo, e cada estatística vira um bloco de estatísticas. Os slides interativos (antes/depois, revelar) não têm equivalente em artigo e serão descartados. Isto não pode ser desfeito.",
  "deck.editor.convertModal.cta": "Converter em artigo",

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

  // ── IssueContentsPanel (live) ────────────────────────────────────────────
  // A ordem curada pela redação e os resumos de cada peça, na própria página
  // da edição. Esta curadoria destinava-se a um email; a QueerPulse não envia
  // nenhum, por isso nada aqui pode prometer um envio.
  "contents.liveHeading": "Nesta <em>edição</em>",
  "contents.liveMeta_one": "{count} peça, na ordem escolhida pela redação",
  "contents.liveMeta_other": "{count} peças, na ordem escolhida pela redação",

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
  "issues.archiveAriaLabel": "O arquivo completo",
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
  // CON-11 — a assinatura como pessoa real: a ligação à conta de membro por
  // trás dela e o editor para quem a pode preencher.
  "author.viewMemberProfile": "Ver o perfil de membro de {name}",
  "author.editBylineCta": "Editar esta assinatura",
  "author.editMyBylineCta": "Editar o meu perfil de autoria",
  "author.editor.eyebrow": "Revista · assinatura",
  "author.editor.title": "Perfil de autoria",
  "author.editor.sub":
    "É isto que quem lê vê ao lado do teu nome em cada peça que publicas.",
  "author.editor.nameLabel": "Nome na assinatura",
  "author.editor.nameHelper":
    "Aparece nas peças publicadas. Só a equipa editorial o pode mudar.",
  "author.editor.nameRequired": "Uma assinatura precisa de um nome.",
  "author.editor.bioLabel": "Biografia",
  "author.editor.bioHelper":
    "Duas linhas sobre quem escreve, mostradas na página de autoria e sob cada peça.",
  "author.editor.portraitLabel": "Retrato",
  "author.editor.portraitAlt": "Pré-visualização do retrato",
  "author.editor.saveCta": "Guardar",
  "author.editor.savingCta": "A guardar…",
  "author.editor.cancelCta": "Cancelar",
  "author.editor.savedToast": "Perfil de autoria atualizado.",
  "author.editor.errorToast": "Não conseguimos guardar. Tenta novamente.",

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
  "author.work.noArticlesYet":
    "{name} ainda não publicou nada. Volta a passar por aqui em breve.",

  // ── AuthorsDirectoryPage ─────────────────────────────────────────────────
  "authorsDirectory.eyebrow": "Revista · autoria",
  "authorsDirectory.title": "Toda a gente que escreve para a revista.",
  "authorsDirectory.sub":
    "Repórteres, ensaístas e entrevistadores, todos num só lugar. Escolhe um nome para leres o trabalho.",
  "authorsDirectory.errorTitle": "Não conseguimos carregar a autoria.",
  "authorsDirectory.errorBody":
    "Algo nos interrompeu a caminho daqui. Tenta novamente.",
  "authorsDirectory.emptyTitle": "Ainda não há autoria para mostrar.",
  "authorsDirectory.emptyBody":
    "O diretório ainda está a ser preparado. As assinaturas chegam em breve.",
  // CON-11 — o diretório mostra pessoas, não apenas nomes.
  "authorsDirectory.noBio": "Ainda sem biografia.",
  "authorsDirectory.pieceCount_one": "{count} peça",
  "authorsDirectory.pieceCount_other": "{count} peças",
  "authorsDirectory.memberChip": "Membro",

  // ── ProfileWritingSection (CON-11) ───────────────────────────────────────
  "profileWriting.selfTitle": "A tua <em>escrita</em>",
  "profileWriting.visitorTitle": "A <em>escrita</em> de {firstName}",
  "profileWriting.sub_one": "{count} peça publicada na revista.",
  "profileWriting.sub_other": "{count} peças publicadas na revista.",
  "profileWriting.allCta_one": "Ver a {count} peça",
  "profileWriting.allCta_other": "Ver todas as {count} peças",

  // ── MagazineSectionsPage (CNT-20) ────────────────────────────────────────
  "sections.eyebrow": "Revista · secções",
  "sections.title": "Explora por secção.",
  "sections.sub":
    "Cada parte da revista, da capa às features até à última palavra. Escolhe uma secção para veres o que já saiu.",
  "sections.errorTitle": "Não conseguimos carregar as secções.",
  "sections.errorBody":
    "Algo nos interrompeu a caminho daqui. Tenta novamente.",
  "sections.emptyTitle": "Ainda não há secções para mostrar.",
  "sections.emptyBody": "A taxonomia de secções ainda está a ser preparada.",
  "sections.articleCount_one": "{count} peça",
  "sections.articleCount_other": "{count} peças",

  // ── MagazineSectionArticlesPage (CNT-20) ─────────────────────────────────
  "sectionArticles.eyebrow": "Revista · secção",
  "sectionArticles.backCta": "Todas as secções",
  "sectionArticles.errorTitle": "Não conseguimos carregar esta secção.",
  "sectionArticles.errorBody":
    "Algo nos interrompeu a caminho daqui. Tenta novamente.",
  "sectionArticles.emptyTitle": "Ainda nada publicado aqui.",
  "sectionArticles.emptyBody":
    "Esta secção ainda espera pela primeira peça. Volta em breve.",

  // ── Pesquisa na revista + etiquetas (CON-12) ─────────────────────────────
  // As etiquetas são vocabulário editorial e aparecem como foram escritas;
  // só o chrome à volta delas é traduzido.
  "tags.listAriaLabel": "Etiquetas desta peça",
  "search.formAriaLabel": "Pesquisar na revista",
  "search.fieldAriaLabel": "Pesquisar na revista",
  "search.placeholder": "Um nome, um lugar, um tema",
  "search.submitCta": "Pesquisar",
  "search.metaTitle": "Pesquisar na revista",
  "search.metaDescription":
    "Pesquisa todas as peças que a revista publicou e explora por etiqueta.",
  "search.eyebrow": "Revista · pesquisa",
  "search.heading": "Pesquisa na revista.",
  "search.taggedLabel": "Com a etiqueta",
  "search.resultCount_one": "{count} peça encontrada",
  "search.resultCount_other": "{count} peças encontradas",
  "search.promptTitle": "O que procuras?",
  "search.promptBody":
    "Pesquisa em tudo o que já publicámos, títulos e textos. Ou segue uma etiqueta a partir de qualquer artigo para veres o que mais saiu sobre isso.",
  "search.errorTitle": "Não conseguimos fazer essa pesquisa.",
  "search.errorBody":
    "Algo nos interrompeu a caminho. As tuas palavras continuam no campo, por isso tenta novamente.",
  "search.retryCta": "Tentar novamente",
  "search.emptyTitle": "Nada corresponde a isso.",
  "search.emptyBody":
    "Ainda não publicámos sobre isto, ou por aqui tem outro nome. Tenta menos palavras ou explora por secção.",

  // ══════════════════ Painel de edição (uso interno) ═══════════════════════
  // Os REGISTOS de peças/propostas (títulos, notas, feed de atividade, nomes
  // de secções) ficam como dados em inglês — conteúdo editorial, não chrome.
  // Só a UI do painel, autorada pela plataforma, está traduzida abaixo.

  // ── Vocabulário de fase — indireção por chave (Stage mantém o id em inglês) ──

  // ── Composição de dueInfo() / blockedLine() (editorDashboard.data.ts) ─────

  // ── EditorDashboardHeader ──────────────────────────────────────────────
  "editor.header.title": "Edição {number} · <em>{theme}</em>",
  "editor.header.meta":
    "Fecha a <b>{closes}</b> · publica a <b>{publishes}</b> · <b>{editors}</b> em edição",

  // ── EditorStats ────────────────────────────────────────────────────────

  // ── EditorBulkBar ──────────────────────────────────────────────────────

  // ── EditorToolbar ──────────────────────────────────────────────────────

  // ── EditorPiecesTable ──────────────────────────────────────────────────

  // ── EditorPieceRow ─────────────────────────────────────────────────────

  // ── EditorPopover (Popover / StageMenu / AssignMenu / MoreMenu) ───────────

  // ── EditorPitchInbox ───────────────────────────────────────────────────

  // ── EditorNeedsStrip ───────────────────────────────────────────────────

  // ── EditorModals: Chase / Handoff / Shortcuts ─────────────────────────

  // ── EditorSideCards ────────────────────────────────────────────────────

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

  // ── useEditorDashboard / useEditorKeyboard toasts ──────────────────────

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
  "desk.header.writeCta": "Escrever",

  // ── Escrever (uma peça que a própria pessoa editora escreve) ─────────────
  "desk.write.untitledTitle": "Peça sem título",
  "desk.write.editorNotReady":
    "Ainda estamos a carregar o teu perfil de edição. Tenta outra vez daqui a pouco.",
  "desk.write.noSection":
    "Ainda não há secções configuradas, por isso esta peça não teria onde sair.",
  // PRD-130: distintas do `noSection` acima, que é o caso honesto de "esta
  // revista não tem nenhuma configurada". Estas duas são a lista de secções
  // ainda a caminho, e a lista de secções que falhou.
  "desk.write.sectionsLoading":
    "Ainda estamos a carregar a lista de secções. Tenta outra vez daqui a pouco.",
  "desk.write.sectionsUnavailable":
    "Não foi possível carregar a lista de secções, por isso esta peça não tem onde sair. Recarrega a secretária e tenta outra vez.",
  "desk.header.produce": "Produção da edição",
  "desk.header.slotsFilledAria": "Vagas da edição preenchidas",
  "desk.header.layoutAria": "Esquema da redação",
  "desk.header.metaPublishesOnly": "Sai a {publishes}",
  "desk.header.unassignedEyebrow": "Ainda sem edição",
  "desk.header.unassignedMeta":
    "Peças à espera de destino. Junta uma a uma edição quando souberes onde sai.",

  // ── Seletor de edição + criação (cabeçalho da redação) ───────────────────
  "desk.header.workingOn": "A trabalhar em",
  "desk.header.workingOnAria": "Edição em que estás a trabalhar",
  "desk.header.issueOption": "Edição {number} · {title}",
  "desk.header.newIssueCta": "Nova edição",

  // ── DeskTrackTabs (Sem edição ⇄ Edição) ──────────────────────────────────
  "desk.trackTabs.unassigned": "Sem edição",
  "desk.trackTabs.issue": "Edição {number}",
  "desk.trackTabs.issueNoNumber": "Edição",

  // ── Atribuição a uma edição (ação na linha da peça + seletor) ────────────
  "desk.reassign.addToIssue": "Juntar a uma edição…",
  "desk.reassign.moveIssue": "Mudar de edição…",
  "desk.reassign.addedToIssueToast": "Juntámos à edição {number}.",
  "desk.reassign.madeUnassignedToast": "Voltou para as peças sem edição.",
  "desk.reassign.failedToast": "Não deu para guardar. Tenta outra vez.",

  "desk.assignIssue.title": "Em que edição é que isto sai?",
  "desk.assignIssue.subPieces_one": "{count} peça",
  "desk.assignIssue.subPieces_other": "{count} peças",
  "desk.assignIssue.issueOption": "Edição {number} · {title}",
  "desk.assignIssue.issueOptionMeta": "{filled} de {slots} vagas preenchidas",
  "desk.assignIssue.unassignedOption": "Nenhuma edição",
  "desk.assignIssue.unassignedOptionMeta":
    "Deixa por agora nas peças sem edição.",
  "desk.assignIssue.currentSuffix": "onde está agora",
  "desk.assignIssue.confirm_one": "Mudar",
  "desk.assignIssue.confirm_other": "Mudar {count} peças",

  // ── Modal de nova edição ─────────────────────────────────────────────────
  "desk.newIssue.title": "Criar uma edição da revista",
  "desk.newIssue.sub":
    "O resto (capa, ordem de publicação, resumo) trata-se na página da própria edição, assim que ela existir.",
  "desk.newIssue.numberLabel": "Número",
  "desk.newIssue.numberHelper": "Só dígitos. “1” passa a “01”.",
  "desk.newIssue.publishesLabel": "Sai a",
  "desk.newIssue.publishesHelper":
    "Opcional. Deixa em aberto e define a data quando souberes.",
  "desk.newIssue.titleLabel": "Título",
  "desk.newIssue.titlePlaceholder": "O caminho mais longo",
  "desk.newIssue.themeLabel": "Tema",
  "desk.newIssue.themeHelper":
    "Uma ou duas palavras. Aparece ao lado do número.",
  "desk.newIssue.themePlaceholder": "Cuidar depois",
  "desk.newIssue.create": "Criar edição",
  "desk.newIssue.creating": "A criar…",
  "desk.newIssue.createdToast": "Edição {number} criada. Já estás nela.",
  "desk.newIssue.duplicateNumberError": "A edição {number} já existe.",
  "desk.newIssue.saveFailedError": "Não deu para guardar. Tenta outra vez.",

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
  "desk.savedViews.lateOrAtRisk": "Atrasadas ou em risco",
  "desk.savedViews.waitingOnArt": "À espera de imagens",
  "desk.savedViews.needsSensitivityRead": "Precisa de leitura de sensibilidade",
  "desk.savedViews.unpaidAfterFiling": "Por pagar depois da entrega",

  // ── PiecesPipeline ───────────────────────────────────────────────────────
  "desk.pipeline.emptyTitle": "A secretária está livre",
  "desk.pipeline.emptyDescription": "Nada corresponde a este filtro agora.",
  "desk.pipeline.columnPiece": "Peça",
  "desk.pipeline.columnStage": "Estado",
  "desk.pipeline.columnWaitingOn": "À espera de",
  "desk.pipeline.columnDue": "Prazo",
  "desk.pipeline.selectAllAria": "Selecionar todas as peças à vista",

  // ── PieceRow ─────────────────────────────────────────────────────────────
  "desk.pieceRow.newVoice": "Voz nova",
  "desk.pieceRow.writer": "Autor",
  "desk.pieceRow.you": "Tu",
  "desk.pieceRow.nobody": "Ninguém",
  "desk.pieceRow.edit": "Edição",
  "desk.pieceRow.chase": "Insistir",
  "desk.pieceRow.handOff": "Passar",
  "desk.pieceRow.selectAria": "Selecionar {title}",

  // ── PiecesBoard ──────────────────────────────────────────────────────────
  "desk.board.columnEmpty": "Vazia",
  "desk.board.moveStageAria": "Mudar de estado",

  // ── IssuePlan ────────────────────────────────────────────────────────────
  "desk.issuePlan.slotsFilled": "{filled} de {target} · {note}",
  "desk.issuePlan.slotsOpen_one": "{count} vaga por preencher",
  "desk.issuePlan.slotsOpen_other": "{count} vagas por preencher",
  "desk.issuePlan.full": "Completa",
  "desk.issuePlan.commissionFor": "Encomendar para {section}",
  "desk.issuePlan.slidesCount_one": "{count} slide no deck",
  "desk.issuePlan.slidesCount_other": "{count} slides no deck",
  "desk.issuePlan.lateSuffix": " · atrasada",

  // ── PitchInbox ───────────────────────────────────────────────────────────
  "desk.pitchInbox.heading": "Caixa de propostas",
  "desk.pitchInbox.countLabel_one": "{count} proposta",
  "desk.pitchInbox.countLabel_other": "{count} propostas",
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

  // ── Atribuição em lote a uma edição (linhas do fluxo) ────────────────────
  "desk.bulkAssign.selected_one": "{count} peça selecionada",
  "desk.bulkAssign.selected_other": "{count} peças selecionadas",
  "desk.bulkAssign.ariaLabel": "Atribuir peças a uma edição em lote",
  "desk.bulkAssign.clearSelection": "Limpar seleção",
  "desk.bulkAssign.assignToIssue": "Atribuir a uma edição…",
  "desk.bulkAssign.assignedToast_one":
    "{count} peça passou para a edição {number}.",
  "desk.bulkAssign.assignedToast_other":
    "{count} peças passaram para a edição {number}.",
  "desk.bulkAssign.unassignedToast_one":
    "{count} peça voltou para as peças sem edição.",
  "desk.bulkAssign.unassignedToast_other":
    "{count} peças voltaram para as peças sem edição.",

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
    "Ainda não há nada nesta edição. Começa o fluxo com a tua primeira peça.",
  "desk.states.writePiece": "Escrever uma peça",
  "desk.states.commissionPiece": "Encomendar uma peça",
  "desk.states.errorBand":
    "Não conseguimos aceder ao fluxo. A mostrar os últimos dados que tínhamos.",
  "desk.states.tryAgain": "Tentar novamente",

  // ── CommandPalette ───────────────────────────────────────────────────────
  "desk.palette.kindArticle": "Artigo",
  "desk.palette.kindDeck": "Deck",
  "desk.palette.kindAction": "Ação",
  "desk.palette.writePiece": "Escrever uma peça",
  "desk.palette.goToDesk": "Ir para a redação",
  "desk.palette.ariaLabel": "Paleta de comandos",
  "desk.palette.searchPlaceholder":
    "Ir diretamente a uma peça, ou começar uma nova…",
  "desk.palette.searchAria": "Pesquisar na redação",
  "desk.palette.commandsAria": "Comandos",
  "desk.palette.noResults": "Nada corresponde a “{query}”.",

  // ── MagazineDeskShell (o painel lateral de quem edita) ───────────────────
  "deskShell.issueEyebrow": "Edição {number} · {theme}",
  "deskShell.menuAria": "Secções da redação",
  "deskShell.nav.desk": "Redação",
  "deskShell.nav.issue": "Edição",
  "deskShell.nav.lifecycle": "Arquivo",
  "deskShell.openNow": "Abertos agora",
  "deskShell.writePiece": "Escrever",
  "deskShell.kbdHintSuffix": "para saltar · ? para atalhos",
  "deskShell.backToPlatform": "Voltar ao QueerPulse",

  // ── DeskModals (chrome partilhado por Commission/Pass/Chase/Handoff/Shortcuts) ──
  "desk.modals.cancel": "Cancelar",
  "desk.modals.noteLabel": "A tua nota",
  "desk.modals.shortcuts.title": "Teclado",
  "desk.modals.shortcuts.gotIt": "Percebido",
  // O atalho em si ("j / k", "⌘K") é mostrado tal e qual e fica fora do
  // catálogo: o nome de uma tecla é igual em todas as línguas. Só o que ele
  // faz é texto.
  "desk.modals.shortcuts.moveBetween": "Mover entre peças",
  "desk.modals.shortcuts.openFocused": "Abrir a peça em foco",
  "desk.modals.shortcuts.chaseWriter": "Dar um toque a quem escreve",
  "desk.modals.shortcuts.writeYourself": "Escrever tu uma peça",
  "desk.modals.shortcuts.triageTopPitch": "Triar a proposta do topo",
  "desk.modals.shortcuts.jumpAnywhere":
    "Saltar para qualquer lado, ou começar uma peça",
  "desk.modals.shortcuts.thisList": "Esta lista",

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
  "desk.modals.commission.trackUnassigned": "Nenhuma edição",
  "desk.modals.commission.trackIssue": "Edição {number}",
  // PRD-130: o seletor de secção e o botão de enviar o briefing ficam
  // desativados em conjunto sempre que a lista de secções está vazia, e isto
  // diz porquê em vez de abrir um menu sem nada.
  "desk.modals.commission.sectionsUnavailable":
    "A lista de secções ainda não carregou, por isso este briefing ainda não tem onde sair.",
  "desk.modals.commission.sectionsEmptyOption": "Sem secções disponíveis",

  // ── PassModal ────────────────────────────────────────────────────────────
  "desk.modals.pass.title": "Recusar “{title}”",
  "desk.modals.pass.send": "Enviar",
  "desk.modals.pass.body":
    "Uma recusa cai melhor com um motivo genuíno. Escolhe um ponto de partida abaixo, ou escreve o teu próprio. De qualquer forma, quem escreveu ouve de uma pessoa real.",
  "desk.modals.pass.startingPoints": "Pontos de partida",
  // Cada `label` dá nome a um chip; cada `body` é semeado na nota editável que
  // quem escreveu acaba por ler, por isso tem de funcionar como prosa real de
  // quem edita. O chip do template de deck reutiliza
  // `desk.pitchRow.betterAsDeck`, por isso só o corpo está aqui.
  "desk.modals.pass.templates.notForUs.label": "Não é para nós",
  "desk.modals.pass.templates.notForUs.body":
    "Agradeço-te teres confiado isto a nós. Não encaixa na QueerPulse. Não somos a casa que esta peça merece, e prefiro dizer-to já do que deixá-la à espera. Manda-nos a próxima, por favor.",
  "desk.modals.pass.templates.notNow.label": "Agora não",
  "desk.modals.pass.templates.notNow.body":
    "Gosto muito disto, mas a edição 14 está cheia e o calendário joga contra. Posso voltar a falar contigo para a edição 16, quando o tema estiver mais perto? Sem compromisso de nenhum dos lados.",
  "desk.modals.pass.templates.anotherSection.label": "Experimenta outra secção",
  "desk.modals.pass.templates.anotherSection.body":
    "Isto não resulta como reportagem de fundo, mas assentaria lindamente na secção Serviço: mais curto, mais prático, com a mesma investigação. Queres que a encomende assim?",
  "desk.modals.pass.templates.betterAsDeck.body":
    "A investigação é forte, mas o formato não é o certo: isto pede um deck. Se te apetecer, encomendava-o em oito ou nove slides.",

  // ── ChaseModal (Phase 7 Wave F: incorpora o PieceThread, sem passo de composição à parte) ─
  "desk.modals.chase.title": "Insistir com {name}",
  "desk.modals.chase.body":
    "Um lembrete rápido e humano para manter as coisas a andar com calma.",

  // ── HandoffModal ─────────────────────────────────────────────────────────
  "desk.modals.handoff.title": "Passar",
  "desk.modals.handoff.cta": "Passar",
  "desk.modals.handoff.body":
    "Passa “{title}” a outra pessoa editora. Ela continua exatamente onde ficaste.",
  "desk.modals.handoff.toLabel": "Para",

  // ── Editorial pipeline stage names (desk/stageLabels.ts) ─────────────────
  // Substitui a nota "left unswept here" no cabeçalho desta secção: os ids de
  // `Stage` em bruto que o StagePill, o StageStepper, os cabeçalhos de coluna e
  // o seletor de fase do PiecesBoard, os cartões do IssuePlan e o toast "Movida
  // para {stage}" do `usePieceMutations` mostravam tal e qual passam a resolver
  // por uma só tabela.
  //
  // Ficam de propósito separadas de `pitchTracker.stage.*`. Esse conjunto é o
  // percurso da proposta visto por QUEM PROPÕE (Proposta / Aceite / Primeiro
  // rascunho); este é o circuito editorial da redação. Três delas coincidem em
  // inglês por acaso, e em português divergem. Juntá-las prenderia o vocabulário
  // de quem propõe a um fluxo interno. O género concorda com "peça" (feminino).
  "desk.stage.commissioned": "Encomendada",
  "desk.stage.drafting": "Em rascunho",
  "desk.stage.inReview": "Em análise",
  "desk.stage.edit": "Edição",
  "desk.stage.sensitivityRead": "Leitura de sensibilidade",
  "desk.stage.layout": "Paginação",
  "desk.stage.ready": "Pronta",
  "desk.stage.published": "Publicada",

  // ── Desk mutation toasts (usePieceMutations / usePitchMutations) ─────────
  // O `TRIAGE_TOAST_KEY.commission` aponta de propósito para
  // `desk.pieceToast.commissioned`: o veredito É uma encomenda, mesmo texto.
  // Continuam distintas de `piece.brief.commissioned`, que é uma ETIQUETA de
  // campo no separador Briefing e pede outra forma em português.
  "desk.pieceToast.commissioned": "Encomendada",
  "desk.pieceToast.draftStarted": "Rascunho começado",
  "desk.pieceToast.movedToStage": "Movida para {stage}",
  "desk.pieceToast.handedOff": "Passada a outra pessoa",
  "desk.pieceToast.deleted": "Apagada",
  "desk.pitchToast.maybe": "Marcada como talvez",
  "desk.pitchToast.passed": "Proposta recusada",
  "desk.pitchToast.added": "Proposta adicionada",

  // ── DeskView ─────────────────────────────────────────────────────────────

  // ── EditorDashboardPage ──────────────────────────────────────────────────
  "desk.page.savingViewsUnavailable":
    "Ainda não é possível guardar vistas personalizadas.",

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

  // ── Publish / unpublish from the piece record (PRD-119, PRD-120) ─────────
  // O controlo de cuidado é imposto no servidor, por isso este texto tem duas
  // tarefas: dizer o que está a reter a peça antes de se carregar em alguma
  // coisa, e mostrar com honestidade a recusa da redação quando ela vem à
  // mesma (outra pessoa abriu um item de cuidado entre o render e o clique).
  "piece.publish.openCareTab": "Abrir o separador Cuidado",
  "piece.publish.unpublish": "Despublicar",
  "piece.publish.viewLive": "Ver publicado",
  "piece.publish.viewLiveAria": "Ver “{title}” como quem lê o vê",
  "piece.publish.liveSince": "Publicado desde {date}",
  "piece.publish.scheduledFor": "Agendado para {date}",
  "piece.publish.blockedByGate_one":
    "A publicação está bloqueada: {count} item de cuidado ainda está por resolver.",
  "piece.publish.blockedByGate_other":
    "A publicação está bloqueada: {count} itens de cuidado ainda estão por resolver.",
  "piece.publish.blockedToast_one":
    "Resolve o {count} item de cuidado por resolver antes de publicar.",
  "piece.publish.blockedToast_other":
    "Resolve os {count} itens de cuidado por resolver antes de publicar.",
  "piece.publish.publishedToast": "Publicado. Já está disponível para quem lê.",
  "piece.publish.unpublishedToast":
    "Retirado. Já não está acessível a quem lê.",
  "piece.publish.failedToast":
    "Não foi possível publicar esta peça. Tenta novamente.",
  "piece.publish.unpublishFailedToast":
    "Não foi possível retirar esta peça. Tenta novamente.",
  "piece.publish.refusedCareGateHeading": "Retida pelo controlo de cuidado",
  "piece.publish.refusedCareGateToast":
    "Esta peça continua retida pelo controlo de cuidado.",
  "piece.publish.refusedNotReadyHeading": "Ainda não está pronta para publicar",
  "piece.publish.refusedNotReadyToast":
    "Esta peça ainda não está pronta para publicar.",
  "piece.publish.refusedNoDetail":
    "A redação não indicou o motivo. Recarrega o registo e tenta novamente.",
  "piece.publish.confirmPublishTitle": "Publicar “{title}”?",
  "piece.publish.confirmPublishSub": "Fica disponível a quem lê de imediato.",
  "piece.publish.confirmPublishBody":
    "Quem escreveu é avisado de que saiu. Podes retirá-la a qualquer momento, e nada é apagado quando o fizeres.",
  "piece.publish.confirmPublishCta": "Publicar",
  "piece.publish.confirmUnpublishTitle": "Retirar “{title}”?",
  "piece.publish.confirmUnpublishSub": "Quem lê perde o acesso de imediato.",
  "piece.publish.confirmUnpublishBody":
    "Nada é apagado. A peça volta a Pronta e podes voltar a publicá-la quando quiseres.",
  "piece.publish.confirmUnpublishCta": "Retirar",
  "piece.publish.confirmCancel": "Ainda não",

  // ── Piece record demo toasts (api/useRecordMutations.ts) ─────────────────
  // Só em modo demonstração, onde o registo é estático e a mutação resolve sem
  // rede. A demonstração é uma superfície real, por isso são traduzidas.
  "piece.recordToast.saved": "Guardado",
  "piece.recordToast.markedPaid": "Marcado como pago",
  "piece.recordToast.letterAdded": "Carta adicionada",
  "piece.recordToast.markedRunInLetters": "Marcada para sair nas cartas",
  "piece.recordToast.removedFromLetters": "Removida das cartas",
  "piece.recordToast.correctionPublished": "Correção publicada",

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
  "piece.money.noFeeAgreed": "Sem valor acordado",
  "piece.money.feeAsFiled": "Valor, como foi registado: {text}",
  "piece.money.expensesAsFiled": "Despesas, como foram registadas: {text}",
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
  "piece.after.sendToAuthorToast":
    "O envio de mensagens à autoria ainda não está disponível.",
  "piece.after.runInLetters": "Publicar nas cartas",
  "piece.after.removeFromLetters": "Remover das cartas",
  "piece.after.correctionsHeading": "Correções",
  "piece.after.correctionPublished": "Publicada a {date}",
  "piece.after.correctionFiled": "Registada a {date}",
  "piece.after.correctionsFooter":
    "Uma correção é publicada como uma nota datada no rodapé da peça. Nunca corrigimos em silêncio.",
  "piece.after.correctionAriaLabel": "Texto da correção",
  "piece.after.correctionPlaceholder":
    "O que estava errado, e o que está certo.",
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
    "Obrigade por confiares em nós com “{title}”. Aconteça o que acontecer, os direitos de autor são teus.",
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
  "pitchTracker.header.newPitchCta": "+ Nova proposta",
  // A PRD-129 substituiu `pitchTracker.header.lead`, que interpolava três
  // números fixos do protótipo e prometia um prazo de resposta que nada mede.
  // Dois fragmentos com plural sobre contagens reais, mostrados por `Translation`.
  "pitchTracker.header.leadActive_one":
    "{count} proposta com a redação neste momento",
  "pitchTracker.header.leadActive_other":
    "{count} propostas com a redação neste momento",
  "pitchTracker.header.leadPublished_one":
    "<b>{count} publicada</b> desde sempre",
  "pitchTracker.header.leadPublished_other":
    "<b>{count} publicadas</b> desde sempre",

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
  "pitchTracker.page.loadErrorTitle":
    "Não conseguimos carregar as tuas propostas",
  "pitchTracker.page.loadErrorBody":
    "Tudo o que enviaste continua com a redação. Tenta novamente daqui a pouco.",

  // ── Withdrawing a pitch (PRD-125) ────────────────────────────────────────
  // Modo real. O `pitchTracker.page.withdrawnToast` acima continua a ser o
  // toast da DEMONSTRAÇÃO, com Desfazer; retirar a sério é definitivo, por isso
  // diz isso e não oferece Desfazer. O caso "já decidida" é o 409 que a redação
  // devolve quando chegou lá primeiro, que é um desfecho real e não uma falha.
  "pitchTracker.card.withdrawCta": "Retirar",
  "pitchTracker.withdraw.confirmTitle": "Retirar esta proposta?",
  "pitchTracker.withdraw.confirmBody":
    "A redação deixa de a ver e a proposta sai do teu acompanhamento. Não é possível anular, mas podes sempre voltar a propor a história.",
  "pitchTracker.withdraw.confirmCta": "Retirar proposta",
  "pitchTracker.withdraw.doneToast": "Proposta retirada.",
  "pitchTracker.withdraw.decidedToast":
    "A redação já respondeu a esta proposta, por isso já não pode ser retirada.",
  "pitchTracker.withdraw.failedToast":
    "Não conseguimos retirar essa proposta. Tenta novamente daqui a pouco.",

  // ── PitchCard ─────────────────────────────────────────────────────────
  // Autoria e texto da nota são palavras próprias de quem edita (conteúdo);
  // só a expressão de chrome "{author} escreveu:" à volta é traduzida.
  "pitchTracker.card.noteWrote": "{author} escreveu:",
  "pitchTracker.card.deskAuthor": "A redação",

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
  "pitchTracker.statusLabel.commissioned": "Encomendada",

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
    "{count} exemplar de <b>{issue}</b> reservado desta tiragem. Enviamos um email para <b>{email}</b> quando sair de Marvila, normalmente dentro de uma semana. Obrigade por financiares as pessoas colaboradoras da próxima edição.",
  "printOrder.success.body_other":
    "{count} exemplares de <b>{issue}</b> reservados desta tiragem. Enviamos um email para <b>{email}</b> quando saírem de Marvila, normalmente dentro de uma semana. Obrigade por financiares as pessoas colaboradoras da próxima edição.",
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
  "write.header.sendOnTo": "Enviar para {stage}",
  "write.header.publish": "Publicar",
  "write.header.unpublish": "Despublicar",
  "write.header.statusPublished": "Publicado",
  "write.header.statusScheduled": "Agendado",
  "write.header.statusDraft": "Rascunho",
  "write.header.publishedToast": "Artigo publicado",
  "write.header.scheduledToast": "Artigo agendado",
  "write.header.unpublishedToast": "Artigo despublicado",
  "write.header.publishError": "Não foi possível publicar, tenta novamente",
  "write.header.publishNotReadyError":
    "Adiciona um standfirst e texto alternativo em todas as imagens antes de publicar.",
  "write.header.savedSaving": "A guardar…",
  "write.header.savedError": "Não foi possível guardar, vamos tentar de novo",
  "write.header.savedOk": "Todas as alterações guardadas",
  "write.header.savedUnsaved": "Alterações por guardar",
  "write.header.retrySave": "Tentar guardar de novo",
  "write.header.leaveConfirm":
    "Há edições que ainda não chegaram ao servidor. Queres sair do editor?",
  "write.header.issueScheduled": "Agendado numa edição",
  "write.header.savedConflict": "Gravação em pausa",

  // ── Save conflict (ENG-111) ──────────────────────────────────────────────
  // Outra pessoa gravou este artigo depois de este separador o ter carregado.
  // A gravação automática pára em vez de escrever por cima, por isso o texto
  // tem de ser claro: recarregar custa as edições deste separador.
  "write.conflict.heading": "Este rascunho avançou",
  "write.conflict.body":
    "Outra pessoa gravou este artigo depois de o teres aberto, por isso parámos de gravar em vez de escrever por cima do trabalho dela. Ao recarregar, ficas com a versão atual e perdes as edições deste separador, por isso copia primeiro o que quiseres guardar.",
  "write.conflict.reloadCta": "Recarregar o rascunho atual",

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

  // ── ImageBlockControls ────────────────────────────────────────────────────
  "write.image.sourceLabel": "A imagem",
  "write.image.sourceHelper":
    "Carrega a arte para este sítio. Recorte livre: o enquadramento e o ponto focal abaixo decidem como aparece.",
  "write.image.sourcePlaceholder": "Ainda sem imagem",
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
  "write.selection.linkFieldLabel": "Endereço da hiperligação",
  "write.selection.linkPlaceholder": "https://exemplo.com",
  "write.selection.linkApply": "Adicionar hiperligação",
  "write.selection.linkCancel": "Cancelar hiperligação",
  "write.selection.linkInvalid":
    "Usa um endereço completo, como https://exemplo.com, ou um email, como mailto:ola@exemplo.com.",

  // ── PublishRail ────────────────────────────────────────────────────────────
  "write.publish.title": "Publicar",
  "write.publish.whenLabel": "Quando é publicado",
  "write.publish.now": "Agora",
  "write.publish.schedule": "Agendar",
  "write.publish.withIssue": "Com a edição",
  "write.publish.scheduleLabel": "Publicar às",
  "write.publish.scheduleNote":
    "Publica-se automaticamente na data e hora escolhidas.",
  "write.publish.scheduleInvalid": "Escolhe uma data e hora no futuro.",
  "write.publish.issueNote": "Publica-se automaticamente quando a edição sai.",
  "write.publish.checklistHeading": "Antes de publicar · {done}/{total}",
  "write.publish.cta": "Publicar",
  "write.publish.scheduleCta": "Agendar",
  "write.publish.unpublishCta": "Despublicar",
  "write.publish.checklist.standfirst": "Resumo escrito",
  "write.publish.checklist.alts": "Texto alternativo em todas as imagens",
  "write.publish.checklist.altsPending":
    "Texto alternativo em todas as imagens (ainda nenhuma)",
  "write.publish.checklist.sensitivity":
    "Leitura de sensibilidade: tratada na ficha da peça",
  "write.publish.checklist.source": "Fonte na linha de estatísticas (opcional)",
  // ENG-111: a recusa do próprio servidor, mostrada no painel. O toast de
  // "ainda não está pronto" reutiliza o `write.header.publishNotReadyError`
  // acima, que já diz exatamente o que falta acrescentar.
  "write.publish.gate.careHeading":
    "O controlo de cuidado desta peça ainda está aberto.",
  "write.publish.gate.notReadyHeading":
    "O rascunho gravado ainda não está pronto para publicar.",
  "write.publish.gate.careToast":
    "A publicação está bloqueada enquanto o controlo de cuidado estiver aberto.",

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
  "write.meta.metaDescriptionLabel": "Meta descrição",
  "write.meta.metaDescriptionHelper":
    "Aparece nos resultados de pesquisa e nas pré-visualizações de partilha. Opcional.",
  "write.meta.heroImageLabel": "Arte de abertura",
  "write.meta.heroImageHelper":
    "A imagem que abre a peça e acompanha todos os cartões que apontam para ela. Pelo menos 1200 por 600.",
  "write.meta.heroImagePlaceholder": "Ainda sem arte de abertura",
  "write.meta.socialImageLabel": "Imagem para partilha",
  "write.meta.socialImageHelper":
    "URL da imagem usada quando este artigo é partilhado. Opcional.",
  "write.meta.canonicalUrlLabel": "URL canónico",
  "write.meta.canonicalUrlHelper":
    "Só é necessário se este artigo for republicado de outro sítio. Opcional.",
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
  "write.versions.restoreToast": 'Versão "{label}" restaurada.',
  "write.versions.restoredFromLabel": "Restaurada a partir de {label}",
  "write.versions.restoreModal.title": 'Restaurar "{label}"?',
  "write.versions.restoreModal.body":
    "Restaurar esta versão? O teu rascunho atual é guardado primeiro, por isso nada se perde.",
  "write.versions.restoreModal.cancel": "Cancelar",
  "write.versions.restoreModal.confirm": "Restaurar esta versão",
  "write.versions.restoreModal.restoring": "A restaurar…",
  "write.versions.diff.title": "Comparar versões",
  "write.versions.diff.sub": '"{label}" por {author} · {when}',
  "write.versions.diff.loading": "A carregar versão…",
  "write.versions.diff.error": "Não foi possível carregar esta versão.",
  "write.versions.diff.empty":
    "Nada para comparar. Esta versão não tem blocos.",
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
  // ENG-110 / PRD-126: lançar agenda em vez de publicar quando a edição tem uma
  // data futura, e o desfecho é relatado depois em vez de ser assumido. Nada
  // aqui pode descrever uma entrega: a CON-05 retirou o digest por email e a
  // QueerPulse não envia nenhum.
  "issue.ship.schedulesForNote":
    "Lançar a edição não publica nada hoje. Cada peça elegível fica agendada para ficar disponível às 09:00 de {date}.",
  "issue.ship.publishesNowNote":
    "Cada peça elegível fica disponível a quem lê assim que lançares a edição.",
  "issue.ship.lastShipHeading": "Último lançamento a {date}",
  "issue.ship.lastShipPublished_one": "{count} peça é publicada a {date}.",
  "issue.ship.lastShipPublished_other":
    "{count} peças são publicadas a {date}.",
  "issue.ship.heldHeading_one": "{count} peça ficou retida",
  "issue.ship.heldHeading_other": "{count} peças ficaram retidas",
  "issue.ship.heldLastTimeHeading_one":
    "O último lançamento reteve {count} peça",
  "issue.ship.heldLastTimeHeading_other":
    "O último lançamento reteve {count} peças",

  // ── Issue production toasts ──────────────────────────────────────────────
  // O `issuePanelSaved` renomeia de propósito o antigo "Digest guardado": a
  // CON-05 retirou o digest por email e esse separador é agora o painel da
  // edição. Um toast a nomear uma superfície que já não existe é uma mentira.
  "issue.toast.runOrderSaved": "Alinhamento guardado",
  "issue.toast.issuePanelSaved": "Painel da edição guardado",
  "issue.toast.coverSaved": "Capa guardada",
  "issue.toast.shipped": "Edição lançada",
  "issue.toast.contentsBlurbSaved": "Descrição do índice guardada",

  // ── IssueTabsNav ─────────────────────────────────────────────────────────
  "issue.tabs.ariaLabel": "Secções da produção da edição",
  "issue.tabs.runningOrder": "Ordem de publicação",
  "issue.tabs.coverContents": "Capa e índice",
  "issue.tabs.digestSocial": "Painel da edição e redes",
  "issue.tabs.archive": "Arquivo",

  // ── PagesCard ────────────────────────────────────────────────────────────
  "issue.publishDate.heading": "Data de publicação",
  "issue.publishDate.set": "Esta edição está marcada para {date}.",
  "issue.publishDate.unset":
    "Ainda sem data. Define-a quando souberes, ou deixa que o envio marque a de hoje.",
  "issue.publishDate.save": "Guardar data",
  "issue.publishDate.clear": "Limpar data",
  "issue.publishDate.saving": "A guardar\u2026",
  "issue.publishDate.savedToast": "Edição marcada para {date}.",
  "issue.publishDate.clearedToast":
    "Data removida. A edição ficou outra vez sem data.",
  "issue.pages.heading": "Páginas",
  "issue.pages.editorial": "Editorial",
  "issue.pages.total": "Total",
  "issue.pages.spare_one": "{count} página de folga",
  "issue.pages.spare_other": "{count} páginas de folga",

  // ── IssueCostsCard (CON-18) ──────────────────────────────────────────────
  "issue.costs.heading": "Quanto custou esta edição",
  "issue.costs.fees": "Valores",
  "issue.costs.expenses": "Despesas",
  "issue.costs.total": "Total",
  "issue.costs.paid": "Pago",
  "issue.costs.outstanding": "Ainda em dívida",
  "issue.costs.nothingPriced": "Ainda nada nesta edição tem valor definido.",
  "issue.costs.loadFailed": "Não foi possível carregar os custos agora.",
  "issue.costs.unpriced_one":
    "{count} pagamento não tem valor, por isso fica fora destes totais.",
  "issue.costs.unpriced_other":
    "{count} pagamentos não têm valor, por isso ficam fora destes totais.",
  "issue.costs.coverage_one":
    "{payments} pagamentos em {count} peça desta edição.",
  "issue.costs.coverage_other":
    "{payments} pagamentos em {count} peças desta edição.",

  // ── RunningOrderTab ──────────────────────────────────────────────────────
  "issue.runOrder.deckNoPageCount": "Deck: sem contagem de páginas",
  "issue.runOrder.pagesPrefix": "pp. {pages}",
  "issue.runOrder.laidOut": "Paginada",

  // ── Painel de juntar peças (produção da edição, ordem de publicação) ─────
  "issue.addPieces.title": "Juntar peças a esta edição",
  "issue.addPieces.sub":
    "Vai buscar às peças que ainda não têm edição. Entram no fim da ordem de publicação.",
  "issue.addPieces.addCtaEmpty": "Juntar à edição {number}",
  "issue.addPieces.addCta_one": "Juntar 1 à edição {number}",
  "issue.addPieces.addCta_other": "Juntar {count} à edição {number}",
  "issue.addPieces.searchPlaceholder": "Procurar peças sem edição…",
  "issue.addPieces.searchLabel": "Procurar peças sem edição",
  "issue.addPieces.noMatches": "Nada corresponde a essa procura.",
  "issue.addPieces.emptyTitle": "Está tudo arrumado",
  "issue.addPieces.emptyDescription":
    "Não há peças à espera de edição. Encomenda uma na redação para começar.",
  "issue.addPieces.addedToast_one": "{count} peça juntou-se à edição {number}.",
  "issue.addPieces.addedToast_other":
    "{count} peças juntaram-se à edição {number}.",
  "issue.addPieces.failedToast": "Não deu para guardar. Tenta outra vez.",

  "issue.runOrder.inLayout": "Em paginação",
  "issue.runOrder.moveEarlierAria":
    "Mover “{title}” para mais cedo na ordem de publicação",
  "issue.runOrder.moveLaterAria":
    "Mover “{title}” para mais tarde na ordem de publicação",
  "issue.runOrder.open": "Abrir",
  "issue.runOrder.movedAnnouncement":
    "“{title}” passou para a posição {position} de {total}",

  // ── CoverContentsTab ─────────────────────────────────────────────────────
  "issue.cover.heading": "Capa",
  "issue.cover.artPlaceholder": "Imagem de capa",
  // A PRD-128 substituiu o campo de URL em bruto por um carregamento a sério,
  // por isso a etiqueta nomeia a imagem em vez do endereço de onde era colada.
  "issue.cover.imageLabel": "Imagem de capa",
  "issue.cover.imageHelper":
    "A imagem que apresenta a edição em todos os sítios onde aparece. Pelo menos 1200 por 600.",
  "issue.cover.imagePlaceholder": "Ainda sem imagem de capa",
  "issue.cover.coverlineLabel": "Frase de capa {n}",
  "issue.cover.hint":
    "As frases de capa não são títulos. Mais curtas, mais diretas, sem trocadilhos.",
  "issue.contents.heading": "Índice",
  "issue.contents.blurbLabel": "Resumo do índice",
  "issue.contents.blurbPlaceholder": "Uma frase, escrita pela redação.",

  // ── DigestSocialTab ──────────────────────────────────────────────────────
  // CON-05: esta secção curava um EMAIL. A QueerPulse não envia nenhum, por
  // isso a mesma curadoria passa a alimentar o painel "Nesta edição" na página
  // pública da edição, mais um aviso na app quando a edição sai. Nenhuma
  // string aqui pode descrever um envio por email.
  "issue.digest.heading": "Painel da edição",
  "issue.digest.hint":
    "É isto que as pessoas veem na página da edição. A ordem aqui é a ordem de leitura.",
  "issue.digest.includeAria": "Mostrar “{title}” no painel da edição",
  "issue.digest.editBlurbAria":
    "Editar o resumo de “{title}” no painel da edição",
  "issue.digest.save": "Guardar",
  "issue.digest.cancel": "Cancelar",
  "issue.digest.edit": "Editar",
  "issue.digest.previewPanel": "Ver a página de quem lê",
  "issue.digest.announceScheduled": "A anunciar com a edição",
  "issue.digest.announceOffToast":
    "Publicar esta edição deixa de avisar a comunidade.",
  "issue.digest.alreadyAnnounced": "Anunciado à comunidade a {date}",
  "issue.digest.announceWithIssue": "Anunciar com a edição",
  "issue.digest.announceOnToast":
    "A comunidade recebe um aviso quando esta edição sair.",
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
  "writer.page.heading": "O teu espaço de trabalho",
  "writer.page.openCount_one": "{count} trabalho em aberto",
  "writer.page.openCount_other": "{count} trabalhos em aberto",
  "writer.page.nextDue": "próxima entrega {date}",
  "writer.page.nothingOpen": "Nada em aberto de momento",
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
  "writer.work.messageEditor": "Mensagem à pessoa editora",
  "writer.work.activeBadge": "Ativa",
  "writer.work.setActive": "Usar para assinatura e termos",
  // Substitui o enum `magazine_payment.status` em bruto que quem escreve lia no
  // seu próprio cartão ("approved_unpaid"). Fica separado de
  // `piece.moneyMini.status*`, que é o mesmo facto do lado de quem edita.
  "writer.work.paymentStatus.agreed": "Acordado",
  "writer.work.paymentStatus.approvedUnpaid": "Aprovado, por pagar",
  "writer.work.paymentStatus.paid": "Pago",

  // ── BriefDetailModal ─────────────────────────────────────────────────────
  "writer.brief.title": "Briefing: {title}",
  "writer.brief.angleLabel": "Ângulo",
  "writer.brief.wantsLabel": "O que queremos",
  "writer.brief.avoidLabel": "O que evitar",
  "writer.brief.wordCountLabel": "Extensão pretendida",
  "writer.brief.rateLabel": "Valor",
  "writer.brief.killFeeLabel": "Valor de cancelamento",
  "writer.brief.commissionedByLabel": "Encomendado por",
  "writer.brief.commissionedOnLabel": "Encomendado a",
  "writer.brief.noBrief": "Ainda não foi escrito um briefing para esta peça.",
  "writer.brief.close": "Fechar",

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
  "writer.pitches.sentToast": "Proposta enviada.",

  // ── WriterPaymentsTab ────────────────────────────────────────────────────
  "writer.payments.emptyTitle": "Ainda não tens pagamentos",
  "writer.payments.emptyDescription":
    "Assim que uma peça for entregue e aprovada, o pagamento aparece aqui.",
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
  "writer.terms.emptyState":
    "Ainda sem nenhuma encomenda ativa. Os termos aparecem assim que houver uma.",

  // ── BylineSafetyCard ─────────────────────────────────────────────────────
  "writer.byline.heading": "A tua segurança",
  "writer.byline.body":
    "Escolhes a assinatura em cada peça, e podes alterá-la até ao momento em que é publicada.",
  "writer.byline.fieldLabel": "Assinatura para “{title}”",
  "writer.byline.anonymous": "Anónime",
  "writer.byline.emptyState":
    "Ainda não tens nenhuma atribuição ativa para definir uma assinatura.",
  "writer.byline.updatedToast": "Assinatura atualizada.",

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
  "writer.fileDraft.filedToast": "Rascunho entregue.",
  "writer.fileDraft.filing": "A entregar…",
  "writer.fileDraft.failed":
    "A entrega não foi concluída. O teu texto continua aqui, tenta entregar outra vez.",
  // Entregar deixou de ser uma substituição às cegas: quem escreve escolhe o
  // que acontece ao rascunho que está na redação, e uma versão gravada depois
  // de abrir a janela trava a entrega até essa versão ter sido vista.
  "writer.fileDraft.conflictHeading": "Este rascunho mudou desde que o abriste",
  "writer.fileDraft.conflictBody":
    "A pessoa que te edita guardou este artigo depois de o abrires. Recarrega o rascunho para veres essa versão antes de entregares, para não se perder nada. O teu texto fica na caixa.",
  "writer.fileDraft.conflictReload": "Recarregar o rascunho",
  "writer.fileDraft.currentDraftWords":
    "O rascunho que está na redação agora: {words} palavras, edições incluídas.",
  "writer.fileDraft.loadCurrentDraft": "Começar a partir do rascunho atual",
  "writer.fileDraft.modeLabel": "O que acontece ao rascunho",
  "writer.fileDraft.modeAppend": "Acrescentar o meu texto ao fim",
  "writer.fileDraft.modeReplace": "Substituir todo o rascunho pelo meu texto",
  "writer.fileDraft.modeAppendHelper":
    "Entregar o mesmo texto duas vezes acrescenta-o uma vez. Nada do que já está na redação é alterado.",
  "writer.fileDraft.modeReplaceHelper":
    "A versão de quem te edita é guardada primeiro, para que possa ser reposta a partir do histórico de versões.",

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
  "pieceThread.errorState":
    "Não foi possível carregar esta conversa. Tenta de novo daqui a pouco.",
  "pieceThread.composerAria": "Mensagem",
  "pieceThread.composerPlaceholder": "Escreve uma mensagem…",
  "pieceThread.send": "Enviar",
  "pieceThread.sentToast": "Mensagem enviada.",

  // ══════════════════ Candidatar a escrever ═══════════════════════════════
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
  "applyToWrite.declined.body":
    "Obrigade por te candidatares. Desta vez não resultou.",
  "applyToWrite.declined.reviewNoteLabel": "Da parte dos editores:",
  "applyToWrite.declined.reapplyCta": "Candidatar de novo",
  "applyToWrite.approved.title": "Já és uma pessoa escritora da QueerPulse",
  "applyToWrite.approved.body":
    "A tua candidatura foi aprovada. Vai à página de submissão para enviares a tua primeira proposta.",
  "applyToWrite.approved.cta": "Começar a escrever",

  // ── ArticleComments (comments/) — comentários de leitores (CNT-10) ──────
  "comments.empty":
    "Ainda não há comentários: sê a primeira pessoa a dizer algo.",
  "comments.reply": "Responder",
  "comments.edit": "Editar",
  "comments.delete": "Eliminar",
  "comments.editedMark": "(editado)",
  "comments.tombstone": "Este comentário foi eliminado.",
  "comments.composer.placeholder": "Adicionar um comentário…",
  "comments.composer.replyPlaceholder": "Escrever uma resposta…",
  "comments.composer.editPlaceholder": "Editar o teu comentário…",
  "comments.composer.post": "Publicar comentário",
  "comments.composer.postReply": "Publicar resposta",
  "comments.composer.saveEdit": "Guardar",
  "comments.composer.cancel": "Cancelar",
  "comments.report.cta": "Denunciar",
  "comments.report.title": "Denunciar este comentário",
  "comments.report.sub":
    "Diz-nos o que está errado com o comentário de {name}.",
  "comments.report.reasonGroupAria": "Motivo da denúncia",
  "comments.report.cancel": "Cancelar",
  "comments.report.sendCta": "Enviar denúncia",
  "comments.report.sending": "A enviar…",
  "comments.report.confirmTitle": "Denúncia <em>enviada</em>",
  "comments.report.confirmBody":
    "Obrigade. Um moderador vai rever o comentário de {name}.",
  "comments.report.done": "Concluído",
  "comments.report.errorTitle": "Algo correu mal",
  "comments.report.errorBody":
    "Não foi possível enviar a tua denúncia. Tenta novamente.",
  "comments.report.retryCta": "Tentar novamente",

  // ── Painel partilhado de falha ao carregar (MagazineLoadError, FE-CNT-08) ─
  "load.errorMetaTitle": "Não foi possível carregar: Revista QueerPulse",
  "load.errorTitle": "Não conseguimos carregar isto.",
  "load.errorBody":
    "Algo nos interrompeu pelo caminho. O artigo continua lá, por isso tenta outra vez.",
  "load.retryCta": "Tentar de novo",
  "load.backCta": "Voltar à revista",

  // ── Metadados das páginas públicas de leitura (FE-CNT-12) ────────────────
  "author.notFoundMetaTitle": "Autoria não encontrada: Revista QueerPulse",
  "author.metaTitle": "{name}: Revista QueerPulse",
  "author.metaDescription":
    "Tudo o que {name} escreveu para a Revista QueerPulse.",
  "issue.metaTitle": "Edição {number}, {title}: Revista QueerPulse",
  "issue.metaTitleNumberOnly": "Edição {number}: Revista QueerPulse",
  "issue.metaTitleFallback": "A edição: Revista QueerPulse",
  "issue.metaDescription": "Uma edição da Revista QueerPulse, de capa a capa.",
  "sectionArticles.metaTitle": "{section}: Revista QueerPulse",
  "sectionArticles.metaDescription": "Tudo o que publicámos em {section}.",

  // ── Adaptadores do modo live (magazine.adapters.tsx, FE-CNT-16) ──────────
  "live.issueBadge": "Edição {number}",
  "live.issueBadgeCurrent": "Edição {number} · Atual",
  "live.issueBadgeInaugural": "Edição {number} · Inaugural",
  "live.issueCover": "Edição {number} · {title}",
  "live.publishedOn": "Publicado a {date}",
  "live.fromTheMagazine": "Da revista",
  "live.sectionFallback": "Reportagem",
  "live.featureIssue": "Reportagem · Edição {number}",
  "live.readMinutes": "{minutes} min",
  "live.web": "Web",

  // ── Editor de artigos: menu de barra e anulação da remoção de bloco ──────
  "write.slash.menuAria": "Inserir um bloco",
  "write.block.removedToast": "Bloco removido.",
  "write.block.undoRemove": "Anular",

  // ── Comentários: confirmação de eliminação (FE-CNT-11) ───────────────────
  "comments.deleteConfirm.title": "Eliminar este comentário?",
  "comments.deleteConfirm.body":
    "Passa a mostrar uma nota a dizer que o comentário foi eliminado. Isto não pode ser anulado.",
  "comments.deleteConfirm.cta": "Eliminar comentário",

  // ── CON-16: a secretaria do arquivo (/magazine/editor/lifecycle) ─────────
  "lifecycle.pageTitle": "Arquivo · Revista QueerPulse",
  "lifecycle.heading": "O arquivo",
  "lifecycle.blurb":
    "Onde está hoje cada texto publicado e quais prometemos rever. Retirar um texto mantém-no legível e dá ao leitor uma nota datada, para que nada do que alguém partilhou se torne um link morto.",
  "lifecycle.horizon": "{days} dias",
  "lifecycle.horizonAria": "Até onde a fila de revisão olha",
  "lifecycle.saved": "Guardado. Os leitores já veem isto no texto.",
  "lifecycle.saveFailed": "Não foi possível guardar. Tenta outra vez.",

  "lifecycle.state.live": "No ar",
  "lifecycle.state.underReview": "Em revisão",
  "lifecycle.state.archived": "Arquivado",
  "lifecycle.state.superseded": "Substituído",
  "lifecycle.hint.live":
    "Atual. Mantemos o texto como está e não aparece nenhum aviso.",
  "lifecycle.hint.underReview":
    "Estamos a confrontá-lo com a lei ou o serviço tal como estão agora. O leitor é avisado de que partes podem estar desatualizadas.",
  "lifecycle.hint.archived":
    "Do seu tempo. Fica como registo, deixa de ser atualizado e lê-se como história.",
  "lifecycle.hint.superseded":
    "Um texto mais recente substitui-o. O aviso leva o leitor diretamente para lá.",

  "lifecycle.counts.overdue": "Em atraso",

  "lifecycle.queue.heading": "Para rever",
  "lifecycle.queue.blurb":
    "Textos que prometemos voltar a verificar, a promessa mais antiga primeiro. A maioria continua no ar, porque ainda ninguém olhou.",
  "lifecycle.queue.empty": "Nada a rever neste período.",
  "lifecycle.flagged.heading": "Com aviso",
  "lifecycle.flagged.blurb":
    "Tudo aquilo em que o leitor vê neste momento uma nota. Um texto pode estar aqui e na fila acima ao mesmo tempo.",
  "lifecycle.flagged.empty": "Todos os textos publicados estão no ar.",

  "lifecycle.row.published": "publicado a {date}",
  "lifecycle.row.replacedBy": "Substituído por {title}",
  "lifecycle.row.dueIn": "Faltam {days} dias",
  "lifecycle.row.overdueBy": "{days} dias de atraso",
  "lifecycle.row.noReview": "Sem revisão marcada",
  "lifecycle.row.edit": "Definir estado",
  "lifecycle.row.editAria": "Definir o estado de {title}",

  "lifecycle.modal.eyebrow": "Ciclo de vida",
  "lifecycle.modal.sub":
    "É isto que o leitor vê no topo do texto. De qualquer forma, o texto continua publicado e continua no arquivo.",
  "lifecycle.modal.stateLabel": "Onde está este texto",
  "lifecycle.modal.replacementLabel": "O texto que o substitui",
  "lifecycle.modal.replacementHelper":
    "O slug dele, a parte a seguir a ?id= no endereço.",
  "lifecycle.modal.replacementRequired":
    "Um texto substituído precisa de um sítio para onde enviar o leitor.",
  "lifecycle.modal.noteLabel": "O que dizer ao leitor",
  "lifecycle.modal.noteHelper":
    "Uma frase tua. Se ficar em branco, o texto recebe a formulação geral deste estado.",
  "lifecycle.modal.reviewLabel": "Rever de novo a",
  "lifecycle.modal.reviewHelper":
    "O dia em que isto volta à redação. O leitor também vê a promessa.",
  "lifecycle.modal.cancel": "Cancelar",
  "lifecycle.modal.save": "Guardar estado",

  "lifecycle.row.languages": "Idiomas",
  "lifecycle.row.languagesAria": "Idiomas de {title}",
  "lifecycle.languages.eyebrow": "Idiomas",
  "lifecycle.languages.sub":
    "Uma tradução é um texto próprio: endereço próprio, assinatura própria de quem traduz e data de publicação própria. Sai quando a tradução estiver pronta.",
  "lifecycle.languages.published": "Publicado",
  "lifecycle.languages.drafting": "Ainda a escrever",
  "lifecycle.languages.translator": "tradução de {name}",
  "lifecycle.languages.emptyTitle": "Por enquanto, um idioma",
  "lifecycle.languages.emptyBody":
    "Abre uma tradução aqui em baixo e ela chega à redação já com os parágrafos do original no lugar.",
  "lifecycle.languages.localeLabel": "Traduzir para",
  "lifecycle.languages.localePlaceholder": "Escolhe um idioma",
  "lifecycle.languages.translatorLabel": "Quem vai traduzir",
  "lifecycle.languages.translatorHelper":
    "O nome tal como deve aparecer nos créditos. Podes deixar em branco e creditar depois.",
  "lifecycle.languages.open": "Abrir tradução",
  "lifecycle.languages.opened": "Tradução aberta em {slug}.",
  "lifecycle.languages.openFailed": "Não foi possível abrir. Tenta outra vez.",
  "lifecycle.languages.allDone":
    "Este texto já existe em todos os idiomas em que publicamos.",

  // ── Reader: the decks index (PRD-105) ───────────────────────────────────
  "decks.metaTitle": "Decks interativos",
  "decks.metaDescription":
    "Todos os decks interativos que a revista publicou, do mais recente ao mais antigo.",
  "decks.eyebrow": "Revista · decks",
  "decks.title": "Decks interativos.",
  "decks.sub":
    "Histórias que a revista conta slide a slide: reportagens, ensaios fotográficos e peças de dados que percorres ao teu ritmo.",
  "decks.count_one": "{count} deck",
  "decks.count_other": "{count} decks",
  "decks.emptyTitle": "Ainda não há decks.",
  "decks.emptyBody":
    "A revista ainda não publicou nenhum deck interativo. Quando publicar, fica aqui.",
  "decks.errorTitle": "Não conseguimos carregar os decks.",
  "decks.errorBody": "Algo nos interrompeu a caminho daqui. Tenta novamente.",
  "decks.retryCta": "Tentar novamente",
  "decks.loadMoreCta": "Carregar mais decks",
  "decks.loadingMore": "A carregar…",
  "decks.frontRailTitle": "Decks <em>interativos</em>",
  "decks.allCta": "Ver todos os decks",
  "masthead.nav.decks": "Decks",

  // ── Reader: the deck page's own share and meta (DES-103) ────────────────
  "deck.share": "Partilhar",
  "deck.shareCopied": "Link copiado",
  "deck.metaDescription":
    "Uma apresentação interativa de {byline}, na revista QueerPulse.",

  // ── Reader: paged article lists (PRD-103) ───────────────────────────────
  "articleRows.loadMoreCta": "Carregar mais",
  "articleRows.loadingMore": "A carregar…",
  "search.byAuthorLabel": "Escrito por",

  // ── Reader: long-read aids (PRD-113) ────────────────────────────────────
  "toolbar.shareArticleAriaLabel": "Partilhar este artigo",
  "reader.progressAriaLabel": "Progresso de leitura",
  "reader.contentsAriaLabel": "Índice do artigo",
  "reader.contentsCta": "Índice",
  "reader.resumeText": "Ficaste a {percent}% deste texto.",
  "reader.resumeCta": "Continuar onde ficaste",
  "reader.resumeDismissAriaLabel": "Dispensar",

  // ── Reader comments: paging and the blanked-row label ───────────────────
  "comments.headingThreads_one": "{count} conversa",
  "comments.headingThreads_other": "{count} conversas",
  "comments.loadMore": "Carregar mais",
  "comments.loadingMore": "A carregar…",
  "comments.unknownAuthor": "[eliminado]",
  "comments.report.subUnknown":
    "Diz-nos o que está errado com este comentário.",
  "comments.report.confirmBodyUnknown":
    "Obrigade. Um moderador vai rever este comentário.",

  // ── Submit a story: the real open issue (PRD-106) ───────────────────────
  "submitStory.issue.nameUndated": "Aberta a propostas",
  "submitStory.issue.noneOpen":
    "Neste momento não há nenhuma edição aberta a propostas. Envia a tua proposta na mesma e a redação vai lê-la para a próxima.",
  "issue.submissionDeadline.heading": "Propostas",
  "issue.submissionDeadline.label": "Prazo de submissão",
  "issue.submissionDeadline.hint":
    "A data que quem escreve vê no formulário de envio de histórias. Deixa vazio e o formulário não mostra prazo nenhum.",
  "issue.submissionDeadline.savedToast": "Prazo de submissão guardado",

  // ── Pitch tracker (DES-100) ─────────────────────────────────────────────
  "pitchTracker.card.submittedOn": "Enviada a {date}",
};
