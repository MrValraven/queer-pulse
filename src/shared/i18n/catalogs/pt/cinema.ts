import type { Catalog } from "../../types";

/**
 * Cinema — pt-PT inclusivo. Mesmas chaves que `en/cinema.ts`.
 *
 * Notas de tradução:
 * - "Cinema" e "Studio" são nomes de marca/produto — nunca traduzidos (ver
 *   docs/i18n/glossary-pt.md).
 * - "Filmmaker(s)" → *cineasta(s)* — já neutro em português, evita
 *   "realizador/a" genderizado.
 * - "Sustain"/"sustainer" segue o precedente já lançado em `pt/studio.ts`
 *   (`shell.sustainCta`): verbo "Contribuir", substantivo "sustentador(es)".
 * - "Membership" → *Adesão*, alinhado com `pt/marketing.ts`.
 * - Registo `tu`, caloroso, nunca `você`.
 * - Títulos de filmes, sinopses, biografias e ensaios de curadoria fictícios
 *   NÃO são traduzidos — em modo live vêm da API como texto de quem os
 *   escreveu.
 */
export const cinema: Catalog = {
  // ── Estrutura (CinemaShell.tsx) — nav flutuante escura + rodapé do Cinema ─
  "nav.thisWeek": "Esta semana",
  "nav.browse": "Explorar",
  "nav.collections": "Coleções",
  "nav.madeHere": "Feito aqui",
  "nav.openCalls": "Chamadas abertas",
  "nav.about": "Sobre",
  "nav.membership": "Adesão",
  "nav.submitCta": "Submeter um filme",
  "nav.sustainCta": "Contribuir · {price}/mês",
  "brand.tag": "Cinema",
  "footer.tagline":
    "Uma rede profissional queer com raízes em Lisboa. O Cinema é uma das suas salas.",
  "footer.cinema.heading": "Cinema",
  "footer.cinema.thisWeek": "Esta semana",
  "footer.cinema.browseAll": "Ver tudo",
  "footer.cinema.collections": "Coleções",
  "footer.cinema.membership": "Adesão",
  "footer.filmmakers.heading": "Cineastas",
  "footer.filmmakers.submit": "Submeter",
  "footer.filmmakers.revenueSplit": "Divisão de receita",
  "footer.filmmakers.rights": "Direitos",
  "footer.about.heading": "Sobre",
  "footer.about.publicLedger": "Registo público",
  "footer.about.access": "Acesso",
  "footer.about.queerpulse": "QueerPulse",
  "footer.copyright": "© {year} QueerPulse Cinema Co-op CRL — Lisboa",
  "footer.split": "80% de cada aluguer vai para quem fez o filme.",

  // ── Página de entrada (CinemaPage.tsx) ─────────────────────────────────────
  "meta.title":
    "QueerPulse Cinema — uma cooperativa de cinema queer, feita pela comunidade",
  "meta.description":
    "Vê cinema queer em streaming, descobre coleções com curadoria e apoia filmes feitos aqui — o QueerPulse Cinema, uma cooperativa de cinema comunitária em Lisboa.",

  // CinemaHero.tsx — CinemaMast / AskStrip / CinemaCover
  "mast.issueLabel": "Programação — Semana {week} · {year}",
  "mast.tagline":
    "Um teatro, um arquivo, uma cooperativa. <em>Oitenta por cento de cada aluguer</em> vai para quem fez o filme.",
  "mast.sectionNav.thisWeek": "Esta semana",
  "mast.sectionNav.browseAll": "Ver tudo",
  "mast.sectionNav.collections": "Coleções",
  "mast.sectionNav.documentaries": "Documentários",
  "mast.sectionNav.features": "Longas-metragens",
  "mast.sectionNav.shorts": "Curtas-metragens",
  "mast.sectionNav.series": "Séries",
  "mast.sectionNav.openCalls": "Chamadas abertas",
  "ask.text":
    "Não sabes o que ver? Diz-nos como te sentes e escolhemos um filme por ti — sem algoritmos, só curadoria.",
  "ask.cta": "Pergunta à sala →",
  "cover.nowShowing": "Em exibição",
  "cover.freeForSustainers": "Grátis para sustentadores",
  "cover.liveQna": "Q&A ao vivo · qua. 21:00",
  "cover.watchNowCta": "Ver agora",
  "cover.rentCta": "Alugar · {price}",
  "cover.rsvpCta": "Confirmar presença no Q&A",
  "cover.splitNote":
    "Se alugares, <strong>{filmmakerShare} vai diretamente para a Maria.</strong> {platformShare} cobre pagamentos e alojamento.",

  // CinemaCatalog.tsx — ProgrammeSection / CollectionsSection / MadeHereSection
  "access.free": "Grátis",
  "access.sustainer": "Sustentador",
  "access.rent": "Alugar · {price}",
  "format.feature": "Longa-metragem",
  "format.documentary": "Documentário",
  "format.short": "Curta-metragem",
  "format.series": "Série",
  "format.experimental": "Experimental",
  "programme.title": "A <em>programação</em> desta semana",
  "programme.lead":
    "Seis filmes, escolhidos a dedo. Disponíveis toda a semana. Renovação à segunda-feira ao meio-dia, hora de Lisboa.",
  "programme.allCta": "Toda a programação →",
  "programme.notebook.eyebrow": "Bloco de notas da <em>curadoria</em>",
  "programme.notebook.week": "semana {week}",
  "programme.notebook.readMoreCta": "Ler a nota completa →",
  "collectionsSection.title": "Explora uma <em>coleção</em>",
  "collectionsSection.lead":
    "A curadoria constrói isto devagar, ao longo de meses. Não são playlists — são argumentos.",
  "collectionsSection.allCta": "Todas as coleções →",
  "collectionsSection.totalSuffix": "no total",
  "madeHere.title": "Feito <em>aqui</em>",
  "madeHere.lead":
    "Curtas e médias-metragens de pessoas da QueerPulse. Grátis para ver, pago para fazer.",
  "madeHere.exploreCta": "Explorar o Feito aqui →",

  // CinemaClosing.tsx — LiveSection / LedgerSection / OpenCallsStrip / AboutStrip / CinemaOutro
  "live.title": "Ao vivo <em>esta semana</em>",
  "live.lead":
    "Estreias, Q&As, sessões em grupo. Organizadas por pessoas da comunidade, abertas por definição.",
  "live.fullCalendarCta": "Calendário completo →",
  "live.badge.premiere": "Estreia",
  "live.badge.watchParty": "Sessão em grupo",
  "live.badge.inTheRoom": "Na sala",
  "live.rsvpCta": "Confirmar presença",
  "ledger.eyebrow": "Como funciona",
  "ledger.title": "A sala <em>paga</em> a quem faz o filme.",
  "ledger.body":
    "O QueerPulse Cinema funciona como cooperativa. 80% de cada aluguer ou compra vai para quem fez o filme. 100% de cada gorjeta. O resto cobre pagamentos, alojamento e legendagem. O registo é público. A divisão não é negociável.",
  "ledger.submitCta": "Submete o teu filme →",
  "ledger.sustainCta": "Torna-te sustentador · {price}/mês",
  "ledger.readDeedCta": "Lê a escritura da cooperativa",
  "ledger.rightsCta": "Direitos de cineastas →",
  "ledger.card.heading": "Registo público · este mês",
  "ledger.card.paidToFilmmakers": "Pago a cineastas",
  "ledger.card.filmsStreamed": "Filmes em streaming",
  "ledger.card.averageShare": "Percentagem média para cineastas",
  "ledger.card.openCommissions": "Encomendas em aberto",
  "ledger.card.footnote":
    "Atualizado toda a segunda-feira ao meio-dia, hora de Lisboa. Auditado trimestralmente.",
  "openCallsStrip.eyebrow_one": "{count} chamada aberta agora",
  "openCallsStrip.eyebrow_other": "{count} chamadas abertas agora",
  "openCallsStrip.title": "Faz a <em>próxima</em>.",
  "openCallsStrip.body":
    "Encomendas, residências e mentorias — financiadas por sustentadores, pagas pela cooperativa. <em>{count} chamadas abertas · {amount} disponíveis esta temporada.</em>",
  "openCallsStrip.cta": "Ver todas as chamadas abertas →",
  "aboutStrip.eyebrow": "A cooperativa",
  "aboutStrip.title": "Um teatro, um arquivo, <em>uma sala</em>.",
  "aboutStrip.body":
    "Programado por pessoas queer, pago a pessoas queer, governado por quem faz os filmes e por quem sustenta o projeto. Lê o que o QueerPulse Cinema realmente é — a escritura, a divisão, o conselho de curadoria.",
  "aboutStrip.cta": "Lê a história da cooperativa →",
  "outro.title": "Vê <em>em conjunto</em>.",
  "outro.sub": "O Cinema é uma sala com gente dentro. A sala está aberta.",
  "outro.sustainCta": "Contribuir para o Cinema",

  // ── Explorar (CinemaBrowsePage.tsx, CinemaBrowseControls.tsx) ─────────────
  "browse.hero.eyebrow": "O catálogo completo",
  "browse.hero.title": "Explora <em>tudo</em>",
  "browse.hero.lead":
    "{count} filmes, programados por pessoas queer e pagos a pessoas queer. Filtra por acesso, formato, idioma e estado de espírito — nunca por um algoritmo.",
  "browse.filters.heading": "Filtrar <em>e</em> ordenar",
  "browse.filters.clearAll": "Limpar tudo",
  "browse.filters.groupAccess": "Acesso",
  "browse.filters.groupFormat": "Formato",
  "browse.filters.groupMadeBy": "Feito por",
  "browse.filters.groupCountry": "País de origem",
  "browse.filters.groupAccessibility": "Acessibilidade",
  "browse.filters.groupMood": "Estado de espírito",
  "browse.filters.accessRent": "Alugar",
  "browse.madeBy.trans": "Cineastas trans",
  "browse.madeBy.lesbian": "Cineastas lésbicas",
  "browse.madeBy.gay": "Cineastas gays",
  "browse.madeBy.nonBinary": "Cineastas não-bináries",
  "browse.madeBy.qpMembers": "Pessoas da QueerPulse",
  "browse.country.portugal": "Portugal",
  "browse.country.brazil": "Brasil",
  "browse.country.france": "França",
  "browse.country.japan": "Japão",
  "browse.country.uk": "Reino Unido",
  "browse.country.senegal": "Senegal",
  "browse.country.egypt": "Egito",
  "browse.accessibility.ptSubtitles": "Legendas em PT",
  "browse.accessibility.enSubtitles": "Legendas em EN",
  "browse.accessibility.audioDescription": "Audiodescrição",
  "browse.accessibility.signLanguage": "Língua gestual",
  "browse.mood.slow": "Calmo",
  "browse.mood.tender": "Terno",
  "browse.mood.political": "Político",
  "browse.mood.funny": "Divertido",
  "browse.mood.healing": "Reparador",
  "browse.mood.joyful": "Alegre",
  "browse.sort.curated": "Escolha da curadoria",
  "browse.sort.newest": "Mais recentes primeiro",
  "browse.sort.oldest": "Mais antigos primeiro",
  "browse.sort.az": "Título A–Z",
  "browse.activeLabel": "Ativos:",
  "browse.removeChipAriaLabel": "Remover {chip}",
  "browse.results.showing_one": "A mostrar <strong>{count} filme</strong>",
  "browse.results.showing_other": "A mostrar <strong>{count} filmes</strong>",
  "browse.results.matchingFilters": " que correspondem aos teus filtros",
  "browse.results.inCatalogue": " no catálogo",
  "browse.empty.title": "Nenhum filme corresponde a estes filtros",
  "browse.empty.description":
    "Tenta afrouxar um filtro ou dois — o catálogo é vasto, mas estas escolhas são específicas.",
  "browse.empty.clearCta": "Limpar filtros",

  // ── Chrome partilhado de relação entre filmes (data.ts filmRelationReason) ─
  "film.relation.sameCountry": "Mesmo país · {country}",
  "film.relation.sameForm": "Mesmo formato · {format}",
  "film.relation.curatorsPick": "Escolha da curadoria",

  // ── Página do filme (FilmPage.tsx, FilmHero*.tsx, FilmBody.tsx) — só chrome;
  // título/sinopse/biografias da equipa/citação da curadoria/data do evento
  // são conteúdo deste filme e ficam em inglês ───────────────────────────────
  "film.crumb.backCta": "← Voltar à sala",
  "film.split.eyebrow": "A divisão",
  "film.split.title":
    "Oitenta por cento de cada aluguer vai para <em>quem fez o filme.</em>",
  "film.split.body":
    "Sem exceções, sem escalões, sem tarifas negociadas. O mesmo acordo para quem estreia como para quem já venceu festivais. O registo é público; a escritura é vinculativa.",
  "film.split.breakdownHeading": "Aluguer de {price} · para onde vai",
  "film.split.amountTo": "{amount} para {name}",
  "film.split.explainer":
    "Quando alugas por {rentPrice}, <strong>{filmmakerShare} vai para {name}.</strong> {paymentFee} cobre o processamento de pagamentos. {hostingFee} cobre alojamento e legendagem. A divisão é igual para todas as pessoas cineastas.",
  "film.split.readDeedCta": "Lê a escritura →",
  "film.related.title": "Mais da <em>programação</em>",
  "film.related.sub":
    "Filmes que partilham uma curadoria, um país ou uma pergunta.",

  "film.hero.coverWeek": "Filme de capa · semana {week}",
  "film.hero.programmedBy": "Com curadoria de",
  "film.hero.rsvpCta": "Confirmar presença →",
  "film.facts.language": "Idioma",
  "film.facts.captions": "Legendas",

  "film.poster.trailerCta": "Reproduzir · trailer {duration}",
  "film.tipjar.heading": "↳ dar gorjeta a quem fez o filme",
  "film.tipjar.note": "100% vai para {name}. Sem taxas.",
  "film.tipjar.footnote_one":
    "<strong>{count} pessoa</strong> deu gorjeta esta semana.",
  "film.tipjar.footnote_other":
    "<strong>{count} pessoas</strong> deram gorjeta esta semana.",
  "film.tipjar.tippedToast": "Gorjeta de {amount} enviada a {name}",

  "film.watchTabs.watch.label": "Ver",
  "film.watchTabs.watch.sub": "incluído · sustentador",
  "film.watchTabs.rent.sub": "{hours} h",
  "film.watchTabs.buy.label": "Comprar · {price}",
  "film.watchTabs.buy.sub": "para sempre",
  "film.watch.mainCta": "▶  Ver o filme completo · {duration}",
  "film.watchlist.add": "Adicionar à lista para ver",
  "film.watchlist.remove": "Remover da lista para ver",
  "film.watchlist.addedToast": "Adicionado à tua lista para ver",
  "film.watchlist.removedToast": "Removido da tua lista para ver",
  "film.share.title": "Partilhar",
  "film.share.ariaLabel": "Copiar link para este filme",
  "film.share.copiedToast": "Link copiado",
  "film.share.copyErrorToast": "Não foi possível copiar o link",

  "film.body.filmWords.title": "As <em>palavras</em> do próprio filme",
  "film.body.cast.title": "Elenco &amp; <em>equipa</em>",
  "film.body.tag.member": "Pessoa da QueerPulse",
  "film.body.filmmaker.stat.films_one": "<em>{count}</em> filme no Cinema",
  "film.body.filmmaker.stat.films_other": "<em>{count}</em> filmes no Cinema",
  "film.body.filmmaker.stat.earned": "ganho aqui",
  "film.body.filmmaker.viewProfileCta": "Ver perfil",
  "film.body.filmmaker.followCta": "Seguir quem fez o filme",
  "film.body.filmmaker.followingCta": "A seguir",
  "film.body.filmmaker.followedToast": "A seguir {name}",
  "film.body.filmmaker.unfollowedToast": "Deixaste de seguir {name}",

  // ── Detalhe da coleção (CinemaCollectionPage.tsx + Header/Essay/Films/Aside)
  // — só o chrome; o ensaio/estatísticas/lista de filmes/preços de cada
  // coleção são conteúdo dessa coleção e ficam em inglês (vêm de
  // GET /cinema/collections/:slug em modo live) ──────────────────────────────
  "collection.notFound.eyebrow": "Coleção não encontrada",
  "collection.notFound.title":
    "Não conseguimos encontrar <em>essa coleção</em>",
  "collection.notFound.body":
    "Pode ter sido renomeada ou retirada. Explora o catálogo completo para veres para onde foram os filmes.",
  "collection.notFound.browseCta": "Ver todos os filmes",
  "collection.outro.title": "Um cinema que <em>argumenta</em>.",
  "collection.outro.sub":
    "As coleções são argumentos da curadoria. Quem sustenta financia as próximas.",
  "collection.backCta": "← Voltar ao Cinema",
  "collection.details.heading": "Detalhes da coleção",
  "collection.details.startWatchingCta": "Começar a ver",
  "collection.details.saveCta": "+ Guardar coleção",
  "collection.films.watchCta": "Ver",
  "collection.films.watchNowCta": "Ver agora",
  "collection.films.seeAllFallback": "Ver todos os filmes",
  "collection.aside.progressHeading": "O teu progresso",
  "collection.aside.progressHint": "Inicia sessão para veres onde ficaste",
  "collection.aside.signInCta": "Iniciar sessão para acompanhar o progresso",
  "collection.aside.relatedHeading": "Coleções relacionadas",

  // ── Índice de coleções (CinemaCollectionsPage.tsx, CinemaCollectionsSections.tsx)
  // — chips de filtro + chrome da página; a citação do cabeçalho, a
  // descrição/estatísticas/curadoria de cada coleção e o texto da proposta
  // de coleção são conteúdo editorial desta página e ficam em inglês ────────
  "collectionsIndex.filter.all": "Todas",
  "collectionsIndex.filter.new": "Novo",
  "collectionsIndex.filter.shortCollections": "Coleções curtas",
  "collectionsIndex.filterLabel": "Filtrar:",
  "collectionsIndex.summary_one":
    "{count} coleção · {filmTotal} filmes no total",
  "collectionsIndex.summary_other":
    "{count} coleções · {filmTotal} filmes no total",
  "collectionsIndex.empty.title":
    "<em>Ainda</em> não há coleções neste filtro.",
  "collectionsIndex.empty.body":
    "O conselho está sempre a construir. Tenta outra lente.",
  "collectionsIndex.empty.resetCta": "Mostrar todas as coleções",
  "collectionsIndex.outro.title": "Começa a <em>vaguear</em>.",
  "collectionsIndex.outro.sub":
    "As coleções são como argumentamos sobre cinema. Escolhe uma e começa.",
  "collectionsIndex.outro.cta": "Abrir uma coleção →",
  "collectionsIndex.card.curatedBy": "Com curadoria de",
  "collectionsIndex.propose.toast":
    "Envia a tua tese de 200 palavras para curators@queerpulse.co — o conselho responde em 3 semanas.",
  "collectionsIndex.propose.cta": "Propor uma coleção",
  "collectionsIndex.propose.meetCouncilCta": "Conhecer o conselho",

  // ── Perfil de curadoria (CinemaCuratorPage.tsx, CuratorHero/Main/Aside.tsx)
  // — só o chrome; a biografia, a citação, as notas de programação e as
  // entradas do bloco de notas de cada pessoa são conteúdo do seu próprio
  // perfil e ficam em inglês (vêm de GET /cinema/curators/:slug em modo live) ─
  "curator.notFound.title": "Curadoria não encontrada",
  "curator.notFound.description":
    "Esta página de curadoria não existe ou foi movida. Conhece o conselho na página Sobre do Cinema.",
  "curator.notFound.backCta": "Voltar ao Cinema",
  "curator.crumb.council": "Conselho",
  "curator.crumb.backCta": "← Voltar ao conselho",
  "curator.outro.openCollectionCta": "Abrir a coleção →",
  "curator.main.coverFilmsTitle": "Filmes de capa <em>recentes</em>",
  "curator.main.programmesTotal_one": "{count} programação no total",
  "curator.main.programmesTotal_other": "{count} programações no total",
  "curator.main.collectionsByTitle": "Coleções <em>de {name}</em>",
  "curator.main.notebookTitle": "Do <em>bloco de notas</em>",
  "curator.main.notebookEntries_one": "{count} entrada",
  "curator.main.notebookEntries_other": "{count} entradas",
  "curator.aside.otherCuratorsHeading": "Outras pessoas da curadoria",
  "curator.aside.contactHeading": "Contacto",
  "curator.aside.contactBody":
    "Para questões de imprensa, propostas de exibição ou sugestões de coleção — contacta {name} através da cooperativa.",
  "curator.aside.contactCta": "Contactar {name}",
  "curator.aside.proposeHeading": "Propor uma coleção",
  "curator.aside.proposeBody":
    "Tens uma tese? Um conjunto de filmes que argumentam algo em conjunto? Escreve ao conselho.",
  "curator.aside.proposeCta": "Propor →",

  // ── Perfil de cineasta (CinemaFilmmakerPage.tsx, FilmmakerHero/Main/Aside.tsx)
  // — só o chrome; a biografia, a declaração, a filmografia, os festivais e
  // os eventos de cada pessoa são conteúdo do seu próprio perfil e ficam em
  // inglês (vêm de GET /cinema/filmmakers/:slug em modo live) ───────────────
  "filmmaker.notFound.title": "Perfil de cineasta não encontrado",
  "filmmaker.notFound.description":
    "Esta página não existe ou foi movida. Explora o Cinema para encontrares trabalho de pessoas cineastas queer em toda a cooperativa.",
  "filmmaker.crumb.backCta": "← Voltar ao Cinema",
  "filmmaker.outro.title": "Faz algo. <em>Recebe por isso.</em>",
  "filmmaker.outro.sub":
    "Submete o teu filme ao Cinema. A divisão é igual para todas as pessoas.",
  "filmmaker.hero.tipCta":
    "↳ Dar gorjeta a {name} · 100% vai diretamente para essa pessoa",
  "filmmaker.hero.requestScreeningCta": "Pedir uma exibição",
  "filmmaker.hero.connectCta": "Ligar-te na QueerPulse",
  "filmmaker.main.filmographyTitle": "Filmografia <em>no Cinema</em>",
  "filmmaker.main.filmsTotal_one": "{count} filme no total",
  "filmmaker.main.filmsTotal_other": "{count} filmes no total",
  "filmmaker.main.festivalCircuitTitle": "Circuito de <em>festivais</em>",
  "filmmaker.main.upcomingEventsTitle": "Próximos eventos <em>de {name}</em>",
  "filmmaker.aside.tipHeading": "Dar gorjeta a {name}",
  "filmmaker.aside.tipSub":
    "100% vai para {name} — a cooperativa não retém nada de uma gorjeta. As gorjetas ajudam a continuar a fazer trabalho.",
  "filmmaker.aside.sendCta": "Enviar {amount}",
  "filmmaker.aside.tippedToast": "{amount} a caminho de {name} — obrigado",
  "filmmaker.aside.tippedNote_one":
    "<strong>{count} pessoa</strong> deu gorjeta a {name} este mês.",
  "filmmaker.aside.tippedNote_other":
    "<strong>{count} pessoas</strong> deram gorjeta a {name} este mês.",
  "filmmaker.aside.splitHeading": "A divisão da cooperativa",
  "filmmaker.aside.splitBody":
    "Quando alugas qualquer filme de {name}, <strong>80%</strong> vai para essa pessoa. Quando compras, o mesmo. As gorjetas são 100%. A divisão é igual para todas as pessoas cineastas no Cinema.",
  "filmmaker.aside.seeOpenCallsCta": "Ver chamadas abertas",

  // ── Feito aqui / Shorts (CinemaShortsPage.tsx + Header/Intro/Curated/
  // Shelves/Catalog/Parts/Community.tsx) — só o chrome + vocabulário de
  // filtro/ordenação/idioma; a nota semanal da curadoria, o filme em
  // destaque, as sessões em grupo, as opções de votação e os números de
  // transparência são conteúdo editorial/comunitário desta página e ficam
  // em inglês ─────────────────────────────────────────────────────────────
  "shorts.toast.savedToWatchlist": "Adicionado à tua lista para ver",
  "shorts.toast.linkCopiedShare": "Link copiado — partilha “{label}”",
  "shorts.outro.title": "Dá uma gorjeta a <em>quem fez o filme</em>.",
  "shorts.outro.sub":
    "100% vai para essa pessoa. Sem taxas. Sem mínimo. Vê primeiro, decide depois.",
  "shorts.outro.browseCta": "Ver todos os filmes da comunidade",
  "shorts.header.eyebrow": "Filmes da comunidade · todos grátis para ver",
  "shorts.header.sub":
    "Curtas, médias-metragens e documentários feitos por pessoas da QueerPulse. <em>Grátis para ver, pago para fazer.</em> Dá uma gorjeta a quem fez o filme — 100% vai para essa pessoa.",
  "shorts.curatorNote.readPastNotesCta": "ler notas anteriores",
  "shorts.accessNote.body":
    "<strong>Todos os filmes têm legendas.</strong> As notas de conteúdo aparecem em cada filme, e os trabalhos com audiodescrição estão marcados com <em>AD</em>. Filtra pelas tuas necessidades de acesso abaixo.",
  "shorts.spotlight.mostWatchedBadge": "Mais visto esta semana",
  "shorts.spotlight.communityPickKicker":
    "Escolha da comunidade · semana {week}",
  "shorts.spotlight.watchNowCta": "Ver agora · grátis",
  "shorts.spotlight.becomeSustainerCta": "Torna-te um →",
  "shorts.shelf.newThisWeek.title": "Novo <em>esta semana</em>",
  "shorts.shelf.newThisWeek.sub":
    "Filmes submetidos e aprovados nos últimos 7 dias",
  "shorts.shelf.newThisWeek.cta": "Ver todos os novos →",
  "shorts.shelf.becauseYouTipped.title":
    "Porque deste gorjeta a <em>{filmTitle}</em>",
  "shorts.shelf.becauseYouTipped.sub": "Mais de {maker}, e filmes no mesmo tom",
  "shorts.shelf.becauseYouTipped.cta": "Página de {maker} →",
  "shorts.shelf.firstFilm.title": "O primeiro <em>filme de alguém</em>",
  "shorts.shelf.firstFilm.sub":
    "As estreias merecem uma primeira audiência — sê tu essa pessoa",
  "shorts.shelf.firstFilm.cta": "Ver todas as estreias →",
  "shorts.shelf.mostTipped.title": "Mais <em>gorjetas</em>",
  "shorts.shelf.mostTipped.sub":
    "Filmes com quem as pessoas foram generosas este mês",
  "shorts.shelf.mostTipped.cta": "Ver todos os filmes →",
  "shorts.shelf.continueWatching.title": "Continuar <em>a ver</em>",
  "shorts.shelf.continueWatching.sub": "Retoma onde ficaste",
  "shorts.shelf.continueWatching.cta": "A tua biblioteca →",
  "shorts.shelf.continueWatching.minutesLeft":
    "{minutes} min restantes · {maker}",
  "shorts.shelf.programmes.title": "Ver por <em>programação</em>",
  "shorts.shelf.programmes.sub":
    "Conjuntos de curtas com curadoria de membros — uma forma de começar quando não sabes por onde ir",
  "shorts.shelf.programmes.cta": "Todas as programações →",
  "shorts.shelf.programmes.shareAriaLabel": "Partilhar programação",
  "shorts.shelf.meetMakers.title": "Conhece quem <em>faz os filmes</em>",
  "shorts.shelf.meetMakers.sub":
    "Todos os filmes aqui têm uma pessoa por trás — diz olá",
  "shorts.shelf.meetMakers.cta": "Todas as pessoas cineastas →",
  "shorts.catalog.title": "Explora o <em>catálogo completo</em>",
  "shorts.catalog.sub":
    "Todos os filmes da comunidade — filtra, ordena e pesquisa à tua maneira",
  "shorts.catalog.cta": "Abrir em Explorar →",
  "shorts.catalog.searchPlaceholder": "Pesquisar filmes, pessoas ou temas…",
  "shorts.catalog.searchAriaLabel": "Pesquisar filmes",
  "shorts.catalog.languageLabel": "Idioma",
  "shorts.catalog.languageAriaLabel": "Filtrar por idioma",
  "shorts.catalog.sortLabel": "Ordenar",
  "shorts.catalog.sortAriaLabel": "Ordenar filmes",
  "shorts.catalog.surpriseCta": "Surpreende-me",
  "shorts.catalog.surpriseToast": "Experimenta este → {title}",
  "shorts.catalog.allFilmsChip": "Todos os filmes",
  "shorts.catalog.empty.title": "Nada corresponde — ainda",
  "shorts.catalog.empty.body":
    "Nenhum filme corresponde a essa combinação. Alivia um filtro, ou diz-nos o que gostavas que existisse — encomendamos a partir de pedidos de membros.",
  "shorts.catalog.empty.clearCta": "Limpar filtros",
  "shorts.catalog.empty.suggestCta": "Sugerir um filme",
  "shorts.catalog.count_one": "<em>{count}</em> filme · todos grátis para ver",
  "shorts.catalog.count_other":
    "<em>{count}</em> filmes · todos grátis para ver",
  "shorts.card.saveAriaLabel": "Guardar na lista para ver",
  "shorts.card.watches_one": "{count} visualização",
  "shorts.card.watches_other": "{count} visualizações",
  "shorts.card.contentNoteLabel": "nota de conteúdo",
  "shorts.card.contentNoteHeading": "Nota de conteúdo",
  "shorts.card.noContentNotes": "sem notas de conteúdo",
  "shorts.watchParties.title": "Ver <em>em conjunto</em>",
  "shorts.watchParties.sub":
    "Salas ao vivo onde o conjunto todo passa de uma vez — quem fez os filmes está no chat",
  "shorts.watchParties.hostCta": "Organizar uma →",
  "shorts.watchParties.nextBadge": "A seguir",
  "shorts.watchParties.goingCount_one": "{count} confirmada",
  "shorts.watchParties.goingCount_other": "{count} confirmadas",
  "shorts.watchParties.goingCta": "Confirmado",
  "shorts.watchParties.rsvpFreeCta": "Confirmar presença · grátis",
  "shorts.watchParties.rsvpToast": "Vais participar · {title}",
  "shorts.vote.title": "Programa o <em>próximo conjunto</em>",
  "shorts.vote.yourPickLabel": "A tua escolha",
  "shorts.vote.voteCta": "Votar",
  "shorts.vote.countedToast": "Voto contabilizado — obrigado",
  "shorts.transparency.ledgerCta": "Ver o registo aberto",
  "shorts.submitCta.seeGrantsCta": "Ver bolsas abertas",
  "shorts.filterCat.runtime": "Duração",
  "shorts.filterCat.type": "Tipo",
  "shorts.filterCat.access": "Acesso",
  "shorts.filterCat.more": "Mais",
  "shorts.filter.rtU10": "Menos de 10 min",
  "shorts.filter.rt1030": "10–30 min",
  "shorts.filter.rt30": "30 min+",
  "shorts.filter.kDoc": "Documentário",
  "shorts.filter.kNar": "Narrativa",
  "shorts.filter.kEss": "Ensaio / experimental",
  "shorts.filter.aAd": "Com audiodescrição",
  "shorts.filter.aCnf": "Sem notas de conteúdo",
  "shorts.filter.mGrant": "Com financiamento",
  "shorts.filter.mLisbon": "Lisboa",
  "shorts.filter.mSaved": "Guardados",
  "shorts.lang.any": "Qualquer idioma",
  "shorts.lang.pt": "Português",
  "shorts.lang.es": "Espanhol",
  "shorts.lang.ptbr": "Português-BR",
  "shorts.lang.en": "Legendas em inglês",
  "shorts.sort.newest": "Mais recentes primeiro",
  "shorts.sort.mostWatched": "Mais vistos",
  "shorts.sort.mostTipped": "Mais gorjetas",
  "shorts.sort.shortest": "Mais curtos primeiro",
  "shorts.sort.staffPicks": "Escolhas da equipa",

  // ── Sobre (CinemaAboutPage.tsx, CinemaAboutSections.tsx, cinemaAbout.data.tsx) ─
  "about.hero.eyebrow": "QueerPulse Cinema · a cooperativa",
  "about.hero.title": "Um teatro, um arquivo, <em>uma cooperativa</em>.",
  "about.hero.sub":
    "O QueerPulse Cinema não é uma plataforma de streaming. É uma sala — programada por pessoas queer, <em>paga a pessoas queer</em>, governada por quem faz os filmes e por quem a sustenta.",
  "about.deed.label": "A <em>escritura</em> · em linguagem simples",
  "about.deed.p1":
    "O QueerPulse Cinema existe porque as plataformas de streaming não foram feitas para nós. Ficam com 70%. Mostram os nossos filmes entre coisas que nunca escolheríamos. Enterram as nossas comunidades em etiquetas de identidade única e armadilhas algorítmicas.",
  "about.deed.p2":
    "Por isso construímos algo diferente. <strong>80% de cada aluguer ou compra</strong> vai para quem fez o filme, pago na segunda-feira seguinte. 100% de cada gorjeta vai diretamente para essa pessoa. A divisão é igual para todas as pessoas cineastas, sem exceções, nunca.",
  "about.deed.p3":
    "O contrato não é exclusivo. <em>Ficas com o teu filme.</em> Podes mostrá-lo em qualquer outro lugar. Não impomos exclusividade, nem território exclusivo, nem direito de preferência. Não somos donos dele — estamo-lo a exibir.",
  "about.deed.p4":
    "O conselho de curadoria — seis pessoas, com rotação anual — programa o catálogo. Recebem um estipêndio votado por sustentadores do escalão patrono. O registo é público. O fundo de encomendas é público. O cálculo da divisão é público.",
  "about.deed.p5": "<em>É este o acordo, por inteiro.</em>",
  "about.principles.title": "Seis <em>princípios</em>",
  "about.principles.p1.title": "Quem faz o filme <em>vem primeiro</em>",
  "about.principles.p1.body":
    "80% de cada transação, pago semanalmente. 100% das gorjetas. A divisão é igual para todas as pessoas. Sem exceções. Sem renegociação. <em>Está na escritura.</em>",
  "about.principles.p2.title": "Programar é <em>autoria</em>",
  "about.principles.p2.body":
    "A curadoria não modera. É autora — escreve introduções, constrói argumentos, programa sequências. Os nomes de quem cura estão em tudo o que escolhem.",
  "about.principles.p3.title": "O acesso é <em>prioridade</em>",
  "about.principles.p3.body":
    "Todos os filmes têm legendas. A audiodescrição cresce todas as semanas. Notas de conteúdo com marcação temporal em cada título. Faixas de língua gestual sempre que possível. Isto não é um extra.",
  "about.principles.p4.title": "Não-exclusivo, <em>sempre</em>",
  "about.principles.p4.body":
    "Nunca somos donos do filme. Quem o fez pode mostrá-lo onde, quando e em que formato quiser. Sem exclusividade territorial. Sem aprisionamento. O contrato termina com um aviso de 30 dias, de qualquer uma das partes.",
  "about.principles.p5.title": "O registo é <em>público</em>",
  "about.principles.p5.body":
    "Todos os meses publicamos: total pago a cineastas, total de visualizações, percentagem média para cineastas, saldo do fundo de encomendas. Auditado trimestralmente. Sem asteriscos.",
  "about.principles.p6.title": "A porta <em>continua aberta</em>",
  "about.principles.p6.body":
    "Os filmes da comunidade são sempre gratuitos. Os eventos abertos são sempre gratuitos. A quota de sustentador nunca é condição para ver algo feito aqui, para a comunidade.",
  "about.split.title": "A divisão, <em>explicada</em>",
  "about.split.body1":
    "Quando alugas um filme por {rentPrice}, {filmmakerShare} vai para quem o fez. São 80%. Os restantes 20% cobrem o processamento de pagamentos (Stripe/IBAN, cerca de 12%) e os custos de alojamento de vídeo e legendagem (cerca de 8%).",
  "about.split.body2":
    "Numa compra direta de {buyPrice}, aplica-se a mesma divisão 80/20: <em>{buyFilmmakerShare} para quem fez o filme.</em> Nas gorjetas, 100% vai para essa pessoa — não retemos nada de uma gorjeta.",
  "about.split.body3":
    "O fundo da biblioteca de sustentadores é distribuído mensalmente com base nos minutos vistos, com 80% a ir para quem faz os filmes a partir da receita das subscrições, depois dos custos da plataforma.",
  "about.split.viewAccountsCta": "Ver as contas públicas completas →",
  "about.split.exampleHeading": "Exemplo: aluguer de {price}",
  "about.split.divideLabel": "Como se divide {price}",
  "about.split.legend.filmmaker": "Quem fez o filme (80%)",
  "about.split.legend.paymentFees": "Taxas de pagamento (12%)",
  "about.split.legend.hosting": "Alojamento (8%)",
  "about.split.tipsNote":
    "As gorjetas são 100% para quem fez o filme. Sem dedução.",
  "about.council.title": "O conselho de <em>curadoria</em>",
  "about.council.sub":
    "Seis pessoas que programam o cinema. Alternam todos os anos — nomeadas pela comunidade, confirmadas por voto de sustentadores. Cada uma traz uma geografia, um foco e um olhar diferentes.",
  "about.gov.ledgerTitle": "Registo <em>público</em> · {month}",
  "about.gov.ledger.sustainers": "Sustentadores",
  "about.gov.ledger.paidToFilmmakers": "Pago a cineastas este mês",
  "about.gov.ledger.filmsStreamed": "Filmes em streaming este mês",
  "about.gov.ledger.averageShare": "Percentagem média para cineastas",
  "about.gov.ledger.commissioningPool":
    "Fundo de encomendas (temporada {season})",
  "about.gov.ledger.filmsInCatalogue": "Filmes no catálogo",
  "about.gov.fullAccountsCta": "Contas completas →",
  "about.gov.decisionsTitle": "Como se <em>tomam as decisões</em>",
  "about.gov.decision.programme": "Decisões de programação",
  "about.gov.decision.programmeValue": "Conselho de <em>curadoria</em>",
  "about.gov.decision.stipend": "Estipêndio da curadoria",
  "about.gov.decision.stipendValue": "Voto de <em>patronos</em>",
  "about.gov.decision.revenueSplit": "Divisão de receita",
  "about.gov.decision.revenueSplitValue": "Não <em>negociável</em>",
  "about.gov.decision.openCallBriefs": "Termos das chamadas abertas",
  "about.gov.decision.openCallBriefsValue": "Conselho + <em>comunidade</em>",
  "about.gov.decision.annualAssembly": "Assembleia anual",
  "about.gov.decision.annualAssemblyValue": "Todos os <em>patronos</em>",
  "about.gov.decision.audit": "Auditoria",
  "about.gov.decision.auditValue": "<em>Trimestral</em>",
  "about.gov.rightsCta": "Direitos de cineastas →",
  "about.outro.title": "Contribui para <em>a sala</em>.",
  "about.outro.sub":
    "{price}/mês. Cancela quando quiseres. Cada sustentador mantém a porta aberta.",
  "about.outro.cta": "Torna-te sustentador",
};
