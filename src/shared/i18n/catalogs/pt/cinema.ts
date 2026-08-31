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
  "footer.about.queerpulse": "QueerPulse",
  "footer.copyright": "© {year} QueerPulse Cinema Co-op CRL, Lisboa",
  "footer.split": "80% de cada aluguer vai para quem fez o filme.",

  // ── Página de entrada (CinemaPage.tsx) ─────────────────────────────────────
  "meta.title":
    "QueerPulse Cinema: uma cooperativa de cinema queer, feita pela comunidade",
  "meta.description":
    "Vê cinema queer em streaming, descobre coleções com curadoria e apoia filmes feitos aqui. O QueerPulse Cinema, uma cooperativa de cinema comunitária em Lisboa.",

  // CinemaHero.tsx — CinemaMast / AskStrip / CinemaCover
  "mast.issueLabel": "Programação: Semana {week} · {year}",
  "mast.dateRange": "{start} a {end}",
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
    "Não sabes o que ver? Diz-nos como te sentes e escolhemos um filme por ti, escolhido pela curadoria em vez de um algoritmo.",
  "ask.cta": "Pergunta à sala",
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
  "programme.allCta": "Toda a programação",
  "programme.notebook.eyebrow": "Bloco de notas da <em>curadoria</em>",
  "programme.notebook.week": "semana {week}",
  "programme.notebook.readMoreCta": "Ler a nota completa",
  "collectionsSection.title": "Explora uma <em>coleção</em>",
  "collectionsSection.lead":
    "A curadoria constrói isto devagar, ao longo de meses. Cada uma é um argumento.",
  "collectionsSection.allCta": "Todas as coleções",
  "collectionsSection.totalSuffix": "no total",
  "madeHere.title": "Feito <em>aqui</em>",
  "madeHere.lead":
    "Curtas e médias-metragens de pessoas da QueerPulse. Grátis para ver, pago para fazer.",
  "madeHere.exploreCta": "Explorar o Feito aqui",

  // CinemaClosing.tsx — LiveSection / LedgerSection / OpenCallsStrip / AboutStrip / CinemaOutro
  "live.title": "Ao vivo <em>esta semana</em>",
  "live.lead":
    "Estreias, Q&As, sessões em grupo. Organizadas por pessoas da comunidade, abertas por definição.",
  "live.fullCalendarCta": "Calendário completo",
  "live.badge.premiere": "Estreia",
  "live.badge.watchParty": "Sessão em grupo",
  "live.badge.inTheRoom": "Na sala",
  "live.rsvpCta": "Confirmar presença",
  "ledger.eyebrow": "Como funciona",
  "ledger.title": "A sala <em>paga</em> a quem faz o filme.",
  "ledger.body":
    "O QueerPulse Cinema funciona como cooperativa. 80% de cada aluguer ou compra vai para quem fez o filme. 100% de cada gorjeta. O resto cobre pagamentos, alojamento e legendagem. O registo é público. A divisão não é negociável.",
  "ledger.submitCta": "Submete o teu filme",
  "ledger.sustainCta": "Torna-te sustentador · {price}/mês",
  "ledger.readDeedCta": "Lê a escritura da cooperativa",
  "ledger.rightsCta": "Direitos de cineastas",
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
    "Encomendas, residências e mentorias: financiadas por sustentadores, pagas pela cooperativa. <em>{count} chamadas abertas · {amount} disponíveis esta temporada.</em>",
  "openCallsStrip.cta": "Ver todas as chamadas abertas",
  "aboutStrip.eyebrow": "A cooperativa",
  "aboutStrip.title": "Um teatro, um arquivo, <em>uma sala</em>.",
  "aboutStrip.body":
    "Programado por pessoas queer, pago a pessoas queer, governado por quem faz os filmes e por quem sustenta o projeto. Lê o que o QueerPulse Cinema realmente é: a escritura, a divisão, o conselho de curadoria.",
  "aboutStrip.cta": "Lê a história da cooperativa",
  "outro.title": "Vê <em>em conjunto</em>.",
  "outro.sub": "O Cinema é uma sala com gente dentro. A sala está aberta.",
  "outro.sustainCta": "Contribuir para o Cinema",

  // ── Explorar (CinemaBrowsePage.tsx, CinemaBrowseControls.tsx) ─────────────
  "browse.hero.eyebrow": "O catálogo completo",
  "browse.hero.title": "Explora <em>tudo</em>",
  "browse.hero.lead":
    "{count} filmes, programados por pessoas queer e pagos a pessoas queer. Filtra por acesso, formato, idioma e estado de espírito, guiado pela curadoria em vez de um algoritmo.",
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
    "Tenta afrouxar um filtro ou dois. O catálogo é vasto, mas estas escolhas são específicas.",
  "browse.empty.clearCta": "Limpar filtros",

  // ── Chrome partilhado de relação entre filmes (data.ts filmRelationReason) ─
  "film.relation.sameCountry": "Mesmo país · {country}",
  "film.relation.sameForm": "Mesmo formato · {format}",
  "film.relation.curatorsPick": "Escolha da curadoria",

  // ── Legendas de placeholder partilhadas do ImageSlot — rótulos da própria
  // plataforma mostrados no quadro de imagem vazio/falhado (o src do slot é
  // uma capa real em ambos os modos; esta é a legenda de recurso quando a
  // imagem não carrega). ────────────────────────────────────────────────────
  "slot.poster": "cartaz",
  "slot.coverFilm": "filme de capa · cartaz",
  "slot.programmeCover": "capa da programação",
  "slot.spotlightPoster": "cartaz em destaque",
  "slot.curatorPortrait": "retrato da curadoria · 3:4",
  "slot.filmPoster": "cartaz do filme · 3:4",
  "slot.filmmakerPortrait": "retrato de cineasta · 3:4",
  "slot.filmFrame": "fotograma do filme · imagem cinematográfica",

  // ── Página do filme (FilmPage.tsx, FilmHero*.tsx, FilmBody.tsx) — só chrome;
  // título/sinopse/biografias da equipa/citação da curadoria/data do evento
  // são conteúdo deste filme e ficam em inglês ───────────────────────────────
  "film.crumb.backCta": "Voltar à sala",
  "film.split.eyebrow": "A divisão",
  "film.split.title":
    "Oitenta por cento de cada aluguer vai para <em>quem fez o filme.</em>",
  "film.split.body":
    "Sem exceções, sem escalões, sem tarifas negociadas. O mesmo acordo para quem estreia como para quem já venceu festivais. O registo é público; a escritura é vinculativa.",
  "film.split.breakdownHeading": "Aluguer de {price} · para onde vai",
  "film.split.amountTo": "{amount} para {name}",
  "film.split.explainer":
    "Quando alugas por {rentPrice}, <strong>{filmmakerShare} vai para {name}.</strong> {paymentFee} cobre o processamento de pagamentos. {hostingFee} cobre alojamento e legendagem. A divisão é igual para todas as pessoas cineastas.",
  "film.split.readDeedCta": "Lê a escritura",
  "film.related.title": "Mais da <em>programação</em>",
  "film.related.sub":
    "Filmes que partilham uma curadoria, um país ou uma pergunta.",

  "film.hero.coverWeek": "Filme de capa · semana {week}",
  "film.hero.programmedBy": "Com curadoria de",
  "film.hero.rsvpCta": "Confirmar presença",
  "film.facts.language": "Idioma",
  "film.facts.captions": "Legendas",

  "film.poster.trailerCta": "Reproduzir · trailer {duration}",
  "film.tipjar.heading": "dar gorjeta a quem fez o filme",
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
  "film.watch.mainCta": "Ver o filme completo · {duration}",
  "film.watchlist.add": "Adicionar à lista para ver",
  "film.watchlist.remove": "Remover da lista para ver",
  "film.watchlist.addedToast": "Adicionado à tua lista para ver",
  "film.watchlist.removedToast": "Removido da tua lista para ver",
  "film.share.title": "Partilhar",
  "film.share.ariaLabel": "Copiar link para este filme",
  "film.share.copiedToast": "Link copiado",
  "film.share.copyErrorToast": "Não foi possível copiar o link",

  "film.body.filmWords.title": "As <em>palavras</em> do próprio filme",
  "film.body.cast.title": "Elenco & <em>equipa</em>",
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
  "collection.backCta": "Voltar ao Cinema",
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
  "collectionsIndex.outro.cta": "Abrir uma coleção",
  "collectionsIndex.card.curatedBy": "Com curadoria de",
  "collectionsIndex.propose.toast":
    "Envia a tua tese de 200 palavras para hello@queerpulse.com. O conselho responde em 3 semanas.",
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
  "curator.crumb.backCta": "Voltar ao conselho",
  "curator.outro.openCollectionCta": "Abrir a coleção",
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
    "Para questões de imprensa, propostas de exibição ou sugestões de coleção, contacta {name} através da cooperativa.",
  "curator.aside.contactCta": "Contactar {name}",
  "curator.aside.proposeHeading": "Propor uma coleção",
  "curator.aside.proposeBody":
    "Tens uma tese? Um conjunto de filmes que argumentam algo em conjunto? Escreve ao conselho.",
  "curator.aside.proposeCta": "Propor",

  // ── Perfil de cineasta (CinemaFilmmakerPage.tsx, FilmmakerHero/Main/Aside.tsx)
  // — só o chrome; a biografia, a declaração, a filmografia, os festivais e
  // os eventos de cada pessoa são conteúdo do seu próprio perfil e ficam em
  // inglês (vêm de GET /cinema/filmmakers/:slug em modo live) ───────────────
  "filmmaker.notFound.title": "Perfil de cineasta não encontrado",
  "filmmaker.notFound.description":
    "Esta página não existe ou foi movida. Explora o Cinema para encontrares trabalho de pessoas cineastas queer em toda a cooperativa.",
  "filmmaker.crumb.backCta": "Voltar ao Cinema",
  "filmmaker.outro.title": "Faz algo. <em>Recebe por isso.</em>",
  "filmmaker.outro.sub":
    "Submete o teu filme ao Cinema. A divisão é igual para todas as pessoas.",
  "filmmaker.hero.tipCta":
    "Dar gorjeta a {name} · 100% vai diretamente para essa pessoa",
  "filmmaker.hero.requestScreeningCta": "Pedir uma exibição",
  "filmmaker.hero.connectCta": "Ligar-te na QueerPulse",
  "filmmaker.main.filmographyTitle": "Filmografia <em>no Cinema</em>",
  "filmmaker.main.filmsTotal_one": "{count} filme no total",
  "filmmaker.main.filmsTotal_other": "{count} filmes no total",
  "filmmaker.main.festivalCircuitTitle": "Circuito de <em>festivais</em>",
  "filmmaker.main.upcomingEventsTitle": "Próximos eventos <em>de {name}</em>",
  "filmmaker.aside.tipHeading": "Dar gorjeta a {name}",
  "filmmaker.aside.tipSub":
    "100% vai para {name}. A cooperativa não retém nada de uma gorjeta. As gorjetas ajudam a continuar a fazer trabalho.",
  "filmmaker.aside.sendCta": "Enviar {amount}",
  "filmmaker.aside.tippedToast": "{amount} a caminho de {name}. Obrigade",
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
  "shorts.toast.linkCopiedShare": "Link copiado. Partilha “{label}”",
  "shorts.outro.title": "Dá uma gorjeta a <em>quem fez o filme</em>.",
  "shorts.outro.sub":
    "100% vai para essa pessoa. Sem taxas. Sem mínimo. Vê primeiro, decide depois.",
  "shorts.outro.browseCta": "Ver todos os filmes da comunidade",
  "shorts.header.eyebrow": "Filmes da comunidade · todos grátis para ver",
  "shorts.header.sub":
    "Curtas, médias-metragens e documentários feitos por pessoas da QueerPulse. <em>Grátis para ver, pago para fazer.</em> Dá uma gorjeta a quem fez o filme. 100% vai para essa pessoa.",
  "shorts.curatorNote.readPastNotesCta": "ler notas anteriores",
  "shorts.accessNote.body":
    "<strong>Todos os filmes têm legendas.</strong> As notas de conteúdo aparecem em cada filme, e os trabalhos com audiodescrição estão marcados com <em>AD</em>. Filtra pelas tuas necessidades de acesso abaixo.",
  "shorts.spotlight.mostWatchedBadge": "Mais visto esta semana",
  "shorts.spotlight.communityPickKicker":
    "Escolha da comunidade · semana {week}",
  "shorts.spotlight.watchNowCta": "Ver agora · grátis",
  "shorts.spotlight.tipCollectiveCta": "Dar uma gorjeta ao coletivo",
  "shorts.spotlight.becomeSustainerCta": "Torna-te um",
  "shorts.shelf.newThisWeek.title": "Novo <em>esta semana</em>",
  "shorts.shelf.newThisWeek.sub":
    "Filmes submetidos e aprovados nos últimos 7 dias",
  "shorts.shelf.newThisWeek.cta": "Ver todos os novos",
  "shorts.shelf.becauseYouTipped.title":
    "Porque deste gorjeta a <em>{filmTitle}</em>",
  "shorts.shelf.becauseYouTipped.sub": "Mais de {maker}, e filmes no mesmo tom",
  "shorts.shelf.becauseYouTipped.cta": "Página de {maker}",
  "shorts.shelf.firstFilm.title": "O primeiro <em>filme de alguém</em>",
  "shorts.shelf.firstFilm.sub":
    "As estreias merecem uma primeira audiência. Sê tu essa pessoa",
  "shorts.shelf.firstFilm.cta": "Ver todas as estreias",
  "shorts.shelf.mostTipped.title": "Mais <em>gorjetas</em>",
  "shorts.shelf.mostTipped.sub":
    "Filmes com quem as pessoas foram generosas este mês",
  "shorts.shelf.mostTipped.cta": "Ver todos os filmes",
  "shorts.shelf.continueWatching.title": "Continuar <em>a ver</em>",
  "shorts.shelf.continueWatching.sub": "Retoma onde ficaste",
  "shorts.shelf.continueWatching.cta": "A tua biblioteca",
  "shorts.shelf.continueWatching.minutesLeft":
    "{minutes} min restantes · {maker}",
  "shorts.shelf.programmes.title": "Ver por <em>programação</em>",
  "shorts.shelf.programmes.sub":
    "Conjuntos de curtas com curadoria de membros, uma forma de começar quando não sabes por onde ir",
  "shorts.shelf.programmes.cta": "Todas as programações",
  "shorts.shelf.programmes.shareAriaLabel": "Partilhar programação",
  "shorts.shelf.meetMakers.title": "Conhece quem <em>faz os filmes</em>",
  "shorts.shelf.meetMakers.sub":
    "Todos os filmes aqui têm uma pessoa por trás. Diz olá",
  "shorts.shelf.meetMakers.cta": "Todas as pessoas cineastas",
  "shorts.catalog.title": "Explora o <em>catálogo completo</em>",
  "shorts.catalog.sub":
    "Todos os filmes da comunidade: filtra, ordena e pesquisa à tua maneira",
  "shorts.catalog.cta": "Abrir em Explorar",
  "shorts.catalog.searchPlaceholder": "Pesquisar filmes, pessoas ou temas…",
  "shorts.catalog.searchAriaLabel": "Pesquisar filmes",
  "shorts.catalog.languageLabel": "Idioma",
  "shorts.catalog.sortLabel": "Ordenar",
  "shorts.catalog.surpriseCta": "Surpreende-me",
  "shorts.catalog.surpriseToast": "Experimenta este: {title}",
  "shorts.catalog.allFilmsChip": "Todos os filmes",
  "shorts.catalog.empty.title": "Nada corresponde, ainda",
  "shorts.catalog.empty.body":
    "Nenhum filme corresponde a essa combinação. Alivia um filtro, ou diz-nos o que gostavas que existisse. Encomendamos a partir de pedidos de membros.",
  "shorts.catalog.empty.clearCta": "Limpar filtros",
  "shorts.catalog.empty.suggestCta": "Sugerir um filme",
  "shorts.catalog.count_one": "<em>{count}</em> filme · todos grátis para ver",
  "shorts.catalog.count_other":
    "<em>{count}</em> filmes · todos grátis para ver",
  "shorts.card.runtime": "{minutes} min",
  "shorts.card.ccBadge": "CC",
  "shorts.card.adBadge": "AD",
  "shorts.card.saveAriaLabel": "Guardar na lista para ver",
  "shorts.card.watches_one": "{count} visualização",
  "shorts.card.watches_other": "{count} visualizações",
  "shorts.card.contentNoteLabel": "nota de conteúdo",
  "shorts.card.contentNoteHeading": "Nota de conteúdo",
  "shorts.card.noContentNotes": "sem notas de conteúdo",
  "shorts.watchParties.title": "Ver <em>em conjunto</em>",
  "shorts.watchParties.sub":
    "Salas ao vivo onde o conjunto todo passa de uma vez, quem fez os filmes está no chat",
  "shorts.watchParties.hostCta": "Organizar uma",
  "shorts.watchParties.nextBadge": "A seguir",
  "shorts.watchParties.goingCount_one": "{count} confirmada",
  "shorts.watchParties.goingCount_other": "{count} confirmadas",
  "shorts.watchParties.goingCta": "Confirmado",
  "shorts.watchParties.rsvpFreeCta": "Confirmar presença · grátis",
  "shorts.watchParties.rsvpToast": "Vais participar · {title}",
  "shorts.vote.title": "Programa o <em>próximo conjunto</em>",
  "shorts.vote.window":
    "As pessoas escolhem o tema de agosto · a votação fecha a 20 de julho",
  "shorts.vote.yourPickLabel": "A tua escolha",
  "shorts.vote.voteCta": "Votar",
  "shorts.vote.countedToast": "Voto contabilizado. Obrigade",
  "shorts.transparency.heading": "Para onde foi o dinheiro · junho",
  "shorts.transparency.ledgerCta": "Ver o registo aberto",
  "shorts.submitCta.eyebrow": "O teu filme podia estar aqui",
  "shorts.submitCta.title": "Fizeste alguma coisa? <em>Submete-a.</em>",
  "shorts.submitCta.body":
    "Qualquer pessoa da QueerPulse pode submeter ao Feito aqui. Grátis para listar, grátis para ver. Ficas com os teus direitos. As gorjetas vão 100% para ti. Há também uma encomenda de {amount} que fecha a 21 de junho.",
  "shorts.submitCta.cta": "Submeter o teu filme",
  "shorts.submitCta.seeGrantsCta": "Ver bolsas abertas",
  "shorts.curatorNote.eyebrow": "Da programação · semana {week}",
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
    "O QueerPulse Cinema é uma sala: programada por pessoas queer, <em>paga a pessoas queer</em>, governada por quem faz os filmes e por quem a sustenta.",
  "about.deed.label": "A <em>escritura</em> · em linguagem simples",
  "about.deed.p1":
    "O QueerPulse Cinema existe porque as plataformas de streaming não foram feitas para nós. Ficam com 70%. Mostram os nossos filmes entre coisas que nunca escolheríamos. Enterram as nossas comunidades em etiquetas de identidade única e armadilhas algorítmicas.",
  "about.deed.p2":
    "Por isso construímos algo diferente. <strong>80% de cada aluguer ou compra</strong> vai para quem fez o filme, pago na segunda-feira seguinte. 100% de cada gorjeta vai diretamente para essa pessoa. A divisão é igual para todas as pessoas cineastas, sem exceções, nunca.",
  "about.deed.p3":
    "O contrato não é exclusivo. <em>Ficas com o teu filme.</em> Podes mostrá-lo em qualquer outro lugar. Não impomos exclusividade, nem território exclusivo, nem direito de preferência. Apenas o estamos a exibir.",
  "about.deed.p4":
    "O conselho de curadoria (seis pessoas, com rotação anual) programa o catálogo. Recebem um estipêndio votado por sustentadores do escalão patrono. O registo é público. O fundo de encomendas é público. O cálculo da divisão é público.",
  "about.deed.p5": "<em>É este o acordo, por inteiro.</em>",
  "about.principles.title": "Seis <em>princípios</em>",
  "about.principles.p1.title": "Quem faz o filme <em>vem primeiro</em>",
  "about.principles.p1.body":
    "80% de cada transação, pago semanalmente. 100% das gorjetas. A divisão é igual para todas as pessoas. Sem exceções. Sem renegociação. <em>Está na escritura.</em>",
  "about.principles.p2.title": "Programar é <em>autoria</em>",
  "about.principles.p2.body":
    "A curadoria é autora: escreve introduções, constrói argumentos, programa sequências. Os nomes de quem cura estão em tudo o que escolhem.",
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
    "Numa compra direta de {buyPrice}, aplica-se a mesma divisão 80/20: <em>{buyFilmmakerShare} para quem fez o filme.</em> Nas gorjetas, 100% vai para essa pessoa. Não retemos nada de uma gorjeta.",
  "about.split.body3":
    "O fundo da biblioteca de sustentadores é distribuído mensalmente com base nos minutos vistos, com 80% a ir para quem faz os filmes a partir da receita das subscrições, depois dos custos da plataforma.",
  "about.split.viewAccountsCta": "Ver as contas públicas completas",
  "about.split.exampleHeading": "Exemplo: aluguer de {price}",
  "about.split.divideLabel": "Como se divide {price}",
  "about.split.legend.filmmaker": "Quem fez o filme (80%)",
  "about.split.legend.paymentFees": "Taxas de pagamento (12%)",
  "about.split.legend.hosting": "Alojamento (8%)",
  "about.split.tipsNote":
    "As gorjetas são 100% para quem fez o filme. Sem dedução.",
  "about.council.title": "O conselho de <em>curadoria</em>",
  "about.council.sub":
    "Seis pessoas que programam o cinema. Alternam todos os anos, nomeadas pela comunidade, confirmadas por voto de sustentadores. Cada uma traz uma geografia, um foco e um olhar diferentes.",
  "about.gov.ledgerTitle": "Registo <em>público</em> · {month}",
  "about.gov.ledger.sustainers": "Sustentadores",
  "about.gov.ledger.paidToFilmmakers": "Pago a cineastas este mês",
  "about.gov.ledger.filmsStreamed": "Filmes em streaming este mês",
  "about.gov.ledger.averageShare": "Percentagem média para cineastas",
  "about.gov.ledger.commissioningPool":
    "Fundo de encomendas (temporada {season})",
  "about.gov.ledger.filmsInCatalogue": "Filmes no catálogo",
  "about.gov.fullAccountsCta": "Contas completas",
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
  "about.gov.rightsCta": "Direitos de cineastas",
  "about.outro.title": "Contribui para <em>a sala</em>.",
  "about.outro.sub":
    "{price}/mês. Cancela quando quiseres. Cada sustentador mantém a porta aberta.",
  "about.outro.cta": "Torna-te sustentador",

  // ── Direitos (CinemaRightsPage.tsx, RightsHero/SideNav/ContractCard.tsx) —
  // só o chrome (hero, tabela-resumo, navegação lateral, rótulos de secção,
  // cartão do contrato). As perguntas/respostas da FAQ (RightsFaqParts.tsx) e
  // o título/corpo do bloco de contacto citam cláusulas contratuais precisas
  // e ficam deliberadamente em inglês — ver o relatório do sweep de i18n.  ──
  "rights.hero.eyebrow": "Para cineastas · os teus direitos",
  "rights.hero.title": "O teu filme <em>continua teu</em>.",
  "rights.hero.sub":
    "Tudo sobre como a cooperativa trata o teu trabalho: a divisão, o contrato, o que podemos e não podemos fazer, como sais se quiseres. <em>Linguagem simples, sem asteriscos.</em>",
  "rights.hero.shortVersionHeading": "A versão resumida",
  "rights.shortVersion.revenueSplit.label": "Divisão de receita",
  "rights.shortVersion.revenueSplit.value": "<em>80</em>% para ti",
  "rights.shortVersion.tips.label": "Gorjetas",
  "rights.shortVersion.tips.value": "<em>100</em>% para ti",
  "rights.shortVersion.contractType.label": "Tipo de contrato",
  "rights.shortVersion.contractType.value": "Não-<em>exclusivo</em>",
  "rights.shortVersion.territory.label": "Território",
  "rights.shortVersion.territory.value": "Tu <em>escolhes</em>",
  "rights.shortVersion.exitNotice.label": "Aviso de saída",
  "rights.shortVersion.exitNotice.value": "<em>30</em> dias",
  "rights.shortVersion.rightsRetained.label": "Direitos que mantêns",
  "rights.shortVersion.rightsRetained.value": "<em>Todos</em>",
  "rights.sideNav.ariaLabel": "Nesta página",
  "rights.section.contract.label": "O contrato",
  "rights.section.contract.title": "O <em>contrato</em>",
  "rights.section.revenue.label": "Receita e pagamento",
  "rights.section.revenue.title": "Receita <em>e pagamento</em>",
  "rights.section.territory.label": "Território e exclusividade",
  "rights.section.territory.title": "Território <em>e exclusividade</em>",
  "rights.section.content.label": "O teu conteúdo",
  "rights.section.content.title": "O teu <em>conteúdo</em>",
  "rights.section.exit.label": "Rescisão e saída",
  "rights.section.exit.title": "Rescisão <em>e saída</em>",
  "rights.section.access.label": "Acessibilidade",
  "rights.section.access.title": "<em>Acessibilidade</em>",
  "rights.contractCard.eyebrow": "O contrato, em linguagem simples",
  "rights.contractCard.title":
    "Aquilo a que te comprometes, e aquilo a que <em>nós</em> nos comprometemos.",
  "rights.contractCard.point.pay": "Pagamos-te 80% de cada transação",
  "rights.contractCard.point.tips": "100% das gorjetas vão para ti, sem taxas",
  "rights.contractCard.point.nonExclusive":
    "Não-exclusivo: mostra-o noutros sítios também",
  "rights.contractCard.point.territory":
    "Escolhes os territórios onde servimos o filme",
  "rights.contractCard.point.consent":
    "Nunca alteramos o teu filme sem consentimento por escrito",
  "rights.contractCard.point.withdraw":
    "Podes sair com um aviso escrito de 30 dias",
  "rights.contractCard.downloadToast":
    "O contrato completo em PDF está a chegar em breve.",
  "rights.contractCard.downloadCta": "Descarregar o contrato completo (PDF)",
  "rights.contact.contactTeamCta": "Contactar a equipa de direitos",
  "rights.contact.submitCta": "Submeter um filme",

  // ── Chamadas abertas (CinemaOpenCallsPage.tsx + Hero/HowItWorks/Body.tsx) —
  // só o chrome. O corpo, os detalhes, os montantes, os prazos e o número de
  // candidaturas de cada encomenda/residência são conteúdo dessa chamada e
  // ficam em inglês, tal como o precedente dos dados fictícios no resto deste
  // ficheiro. ─────────────────────────────────────────────────────────────
  "openCalls.hero.sub":
    "Encomendas, residências e mentorias: financiadas por sustentadores, pagas pela cooperativa, distribuídas através do Cinema. <em>Só para cineastas queer. Qualquer pessoa pode candidatar-se.</em>",
  "openCalls.hero.seasonLabel": "Temporada 3 · primavera/verão 2026",
  "openCalls.hero.sidebarNote":
    "Financiado pelas subscrições de sustentadores. O fundo cresce todos os meses. Cada novo sustentador acrescenta ~{amount} ao fundo da próxima temporada.",
  "openCalls.hero.stat.totalAvailable": "Total disponível",
  "openCalls.hero.stat.activeCalls": "Chamadas ativas",
  "openCalls.hero.stat.applicationsSoFar": "Candidaturas até agora",
  "openCalls.hero.stat.filmsFunded": "Filmes financiados até à data",
  "openCalls.how.title": "Como funciona o <em>fundo</em>",
  "openCalls.how.step1.title": "Sustentadores <em>financiam-no</em>",
  "openCalls.how.step1.body":
    "Cada sustentador, com {price}/mês, contribui com ~{poolShare} por mês para o fundo de encomendas. O total do fundo é público.",
  "openCalls.how.step2.title": "A curadoria <em>define as chamadas</em>",
  "openCalls.how.step2.body":
    "Em cada temporada, o conselho de curadoria escreve os termos: abertos, específicos, enraizados nos filmes que querem ver existir.",
  "openCalls.how.step3.title": "Cineastas <em>candidatam-se</em>",
  "openCalls.how.step3.body":
    "As candidaturas são avaliadas pelo conselho de curadoria. Decisões em 14 dias. Feedback por escrito, aceite ou não.",
  "openCalls.how.step4.title": "Os filmes <em>estreiam aqui</em>",
  "openCalls.how.step4.body":
    "O trabalho encomendado estreia primeiro no QueerPulse Cinema, sendo depois distribuído livremente ou com uma divisão de receita à escolha de quem fez o filme.",
  "openCalls.body.commissionsTitle": "Encomendas <em>e bolsas</em>",
  "openCalls.body.openCount": "{count} em aberto",
  "openCalls.body.residenciesTitle": "Residências <em>e mentorias</em>",
  "openCalls.body.gotMadeTitle": "O que <em>se fez</em>",
  "openCalls.body.allFundedCta": "Todos os filmes financiados",
  "openCalls.card.deadlineLabel": "Prazo",
  "openCalls.card.applyNowCta": "Candidatar-te agora",
  "openCalls.card.downloadBriefCta": "Descarregar termos (PDF)",
  "openCalls.card.downloadToast":
    "Os termos em PDF estão a ser descarregados. Verifica os teus ficheiros.",
  "openCalls.card.applyCta": "Candidatar-te",
  "openCalls.outro.title": "Financia a <em>próxima</em> chamada.",
  "openCalls.outro.sub":
    "Os sustentadores financiam as encomendas. Cada novo sustentador faz crescer o fundo da próxima temporada.",
  "openCalls.outro.cta": "Torna-te sustentador por {price}/mês",

  // ── Adesão (CinemaMembershipPage.tsx + Pays.tsx) — página de preços/planos.
  // Nomes de escalão, descrições e pontos de funcionalidades são copy de
  // marketing da própria plataforma (nunca vinda da API), por isso, ao
  // contrário da maior parte deste ficheiro, tudo aqui é traduzido. ────────
  "membership.hero.eyebrow": "QueerPulse Cinema · adesão de sustentador",
  "membership.hero.title":
    "A sala <em>continua aberta</em> porque tu estás nela.",
  "membership.hero.sub":
    "Os sustentadores financiam os filmes, as encomendas, as legendas e a curadoria. Em troca: tudo. Sem algoritmo, sem aprisionamento, sem padrões enganosos. Cancela quando quiseres.",
  "membership.tier.free.tag": "Grátis · sempre",
  "membership.tier.free.name": "A <em>porta</em>",
  "membership.tier.free.desc":
    "A porta está aberta. Filmes da comunidade, curtas do Feito aqui, e filmes selecionados no escalão gratuito. Sem conta necessária. Sem limite de tempo.",
  "membership.tier.free.feature1":
    "Todos os filmes do escalão gratuito (40+ no catálogo)",
  "membership.tier.free.feature2": "Todas as curtas do Feito aqui",
  "membership.tier.free.feature3": "Eventos ao vivo e Q&As gratuitos",
  "membership.tier.free.feature4": "Legendas e audiodescrição",
  "membership.tier.free.feature5": "Biblioteca de sustentadores (100+ filmes)",
  "membership.tier.free.feature6": "Downloads offline",
  "membership.tier.free.feature7": "Votos nas chamadas abertas",
  "membership.tier.free.cta": "Explorar filmes gratuitos",
  "membership.tier.sustainer.tag": "Sustentador · mensal",
  "membership.tier.sustainer.name": "A <em>sala</em>",
  "membership.tier.sustainer.desc":
    "Tudo no Cinema, e ainda os teus {price} financiam diretamente o fundo de encomendas, o fundo de legendagem e o estipêndio da curadoria. O número é transparente.",
  "membership.tier.sustainer.feature1": "Tudo no escalão Grátis",
  "membership.tier.sustainer.feature2":
    "Biblioteca completa de sustentadores, 142 filmes",
  "membership.tier.sustainer.feature3":
    "Downloads offline (títulos de sustentador)",
  "membership.tier.sustainer.feature4":
    "Sessões em grupo com outros sustentadores",
  "membership.tier.sustainer.feature5":
    "Vota nas chamadas abertas e encomendas",
  "membership.tier.sustainer.feature6":
    "Bloco de notas da curadoria, ensaios completos",
  "membership.tier.sustainer.feature7":
    "Acesso a cópias de festival (screeners)",
  "membership.tier.sustainer.cta": "Torna-te sustentador · {price}/mês",
  "membership.tier.sustainer.note":
    "Cancela quando quiseres. Sem aprisionamento. Sem padrões enganosos.",
  "membership.tier.sustainer.badge": "A escolha da maioria dos sustentadores",
  "membership.tier.patron.tag": "Patrono · mensal",
  "membership.tier.patron.name": "O <em>patrono</em>",
  "membership.tier.patron.desc":
    "Tudo no escalão Sustentador, e ainda o teu nome no mural público de patronos e uma contribuição maior para o fundo de encomendas (~{poolShare}/mês após custos).",
  "membership.tier.patron.feature1": "Tudo no escalão Sustentador",
  "membership.tier.patron.feature2": "Nome no mural de patronos (opcional)",
  "membership.tier.patron.feature3":
    "Contributo direto nas próximas chamadas abertas",
  "membership.tier.patron.feature4":
    "Convite para a assembleia anual da cooperativa",
  "membership.tier.patron.feature5":
    "~{poolShare}/mês para o fundo de encomendas",
  "membership.tier.patron.feature6":
    "Cópias antecipadas antes do público em geral",
  "membership.tier.patron.feature7": "Dois convites de convidado por ano",
  "membership.tier.patron.cta": "Torna-te patrono · {price}/mês",
  "membership.tier.patron.note": "Cancela quando quiseres.",
  "membership.pays.title": "Para onde o dinheiro <em>vai mesmo</em>",
  "membership.pays.sub":
    "Publicamos o detalhe completo trimestralmente. Aqui está a versão resumida, números honestos, atualizados mensalmente.",
  "membership.pays.filmmakers.title": "Pago a <em>cineastas</em>",
  "membership.pays.filmmakers.body":
    "80% de cada aluguer ou compra vai diretamente para quem fez o filme. As gorjetas são 100% deles. O fundo de sustentadores é distribuído mensalmente por minuto visto.",
  "membership.pays.filmmakers.numSub": "Este mês · para cineastas",
  "membership.pays.commissioning.title": "Fundo de <em>encomendas</em>",
  "membership.pays.commissioning.body":
    "~20% das subscrições de sustentadores entra no fundo de encomendas: chamadas abertas, residências e apoio à legendagem para cineastas da comunidade.",
  "membership.pays.commissioning.numSub": "Disponível esta temporada",
  "membership.pays.curators.title": "Curadoria e <em>legendas</em>",
  "membership.pays.curators.body":
    "O conselho de curadoria recebe um estipêndio trimestral votado pelos patronos. Um fundo de legendagem separado apoia cineastas que não podem pagar a legendagem.",
  "membership.pays.curators.numSub": "Pessoas na curadoria",
  "membership.ledger.label": "Registo público · {month} · atualizado à segunda",
  "membership.ledger.sustainers.label": "Sustentadores",
  "membership.ledger.sustainers.note": "Mais 38 este mês",
  "membership.ledger.paidToFilmmakers.note": "Este mês, todas as transações",
  "membership.ledger.filmsInCatalogue.note": "9 novos este mês",
  "membership.ledger.commissionPool.label": "Fundo de encomendas",
  "membership.ledger.commissionPool.note": "Temporada 3 · 4 chamadas abertas",
  "membership.ledger.fullAccountsCta": "Contas públicas completas",

  // ── Wizard de submissão (CinemaSubmitPage.tsx, CinemaSubmitStepper.tsx,
  // CinemaSubmitAside.tsx) — cabeçalho, stepper, navegação, validação, painel
  // de sucesso e barra lateral de reforço — mais (abaixo, "submit.form.*"/
  // "submit.option.*"/"submit.widgets.*"/"submit.review.*") os campos do
  // formulário (Step1/Steps234/Review — rótulos, placeholders, listas de
  // opções), agora varridos. As duas caixas de consentimento legal ("I hold
  // the rights…" no Passo 3, "I agree to the co-op distribution terms…" na
  // Revisão) ficam deliberadamente em inglês, fixas no código — NÃO passam
  // pelo catálogo — porque uma tradução ligeiramente incorreta mudaria o que
  // a pessoa cineasta está a declarar/aceitar; ver o relatório do sweep. O
  // bloco de chamada aberta na barra lateral é conteúdo dessa chamada e fica
  // em inglês. ─────────────────────────────────────────────────────────────
  "submit.header.eyebrow": "Para cineastas · submissão aberta",
  "submit.header.title": "Submete <em>o teu</em> filme.",
  "submit.header.sub":
    "O Cinema está aberto a qualquer cineasta queer, pessoa da comunidade ou não. Cinco passos, 20 minutos. Escolhes o teu modelo de receita. A divisão é igual para todos: 80% de cada aluguer ou compra vem para ti.",
  "submit.promise.heading": "A promessa, em números",
  "submit.promise.note":
    "Não-exclusivo significa que podes continuar a mostrar noutros sítios: festivais, o teu próprio site, outras plataformas. Não impomos aprisionamento.",
  "submit.promise.row.yourShareRent": "A tua parte de cada aluguer",
  "submit.promise.row.yourShareBuy": "A tua parte de cada compra",
  "submit.promise.row.yourShareTip": "A tua parte de cada gorjeta",
  "submit.promise.row.paidToYou": "Pago a ti",
  "submit.promise.row.contractType": "Tipo de contrato",
  "submit.promise.value.weekly": "<em>Semanal</em>",
  "submit.promise.value.nonExclusive": "Não-<em>exclusivo</em>",
  "submit.stepper.ariaLabel": "Passos da submissão",
  "submit.step.theFilm.label": "O filme",
  "submit.step.theFilm.sub": "Informação básica",
  "submit.step.accessibility.label": "Acessibilidade",
  "submit.step.accessibility.sub": "Legendas e AD",
  "submit.step.rights.label": "Direitos",
  "submit.step.rights.sub": "Território e prazo",
  "submit.step.revenue.label": "Receita",
  "submit.step.revenue.sub": "Como queres vender",
  "submit.step.review.label": "Rever",
  "submit.step.review.sub": "e submeter",
  "submit.nav.next.accessibility": "Seguinte: Acessibilidade",
  "submit.nav.next.rights": "Seguinte: Direitos",
  "submit.nav.next.revenue": "Seguinte: Receita",
  "submit.nav.next.review": "Rever o teu filme",
  "submit.nav.next.submit": "Submeter o teu filme",
  "submit.nav.saveDraft": "Guardar rascunho",
  "submit.nav.back": "Voltar",
  "submit.nav.hint":
    "Passo {step} de {total} · O progresso é guardado automaticamente",
  "submit.blocker.title": "Adiciona primeiro o título do teu filme.",
  "submit.blocker.synopsis": "Uma sinopse curta, nas tuas próprias palavras.",
  "submit.blocker.screener":
    "Cola um link de visionamento para podermos ver o filme.",
  "submit.blocker.rights": "Confirma que detens os direitos, por favor.",
  "submit.blocker.agree":
    "Aceita os termos da cooperativa para submeteres o filme.",
  "submit.toast.draftSaved": "Rascunho guardado neste dispositivo",
  "submit.sending.text": "A enviar o teu filme para a equipa de programação…",
  "submit.toast.submitted": "O teu filme está com a equipa de programação",
  "submit.success.title": "O teu filme está",
  "submit.success.em": "na fila.",
  "submit.success.closeLabel": "Voltar ao Cinema",
  "submit.success.step1":
    "Uma pessoa vê-o em 10–14 dias, todas as submissões, sem exceções.",
  "submit.success.step2":
    "Respondemos sempre, com notas específicas se for uma recusa.",
  "submit.success.step3":
    "Se for um sim, és pago em 7 dias de cada aluguer, compra e gorjeta.",
  "submit.success.body":
    "Obrigade por nos confiares o teu filme. Não-exclusivo significa que nada muda para ti noutros sítios. Continua a mostrá-lo onde quiseres enquanto o vemos.",
  "submit.success.anotherCta": "Submeter outro filme",
  "submit.comingSoon.title": "As submissões ainda",
  "submit.comingSoon.em": "não estão abertas.",
  "submit.comingSoon.body":
    "O Made Here ainda não recebe filmes, por isso nada do que escreveres aqui é enviado ou guardado. Estamos a construir o processo de submissão. Volta em breve e, entretanto, vê o que a cooperativa já está a exibir.",
  "submit.comingSoon.closeLabel": "Ver o cinema",
  "submit.aside.nextHeading": "O que acontece a seguir",
  "submit.aside.openCallHeading": "Chamada aberta ativa",
  "submit.aside.applyCta": "Candidatar-te à encomenda",
  "submit.aside.next.point1.strong": "Vemo-lo.",
  "submit.aside.next.point1.rest":
    "Todas as submissões são vistas por uma pessoa, em 10–14 dias.",
  "submit.aside.next.point2.strong": "Respondemos sempre.",
  "submit.aside.next.point2.rest":
    "Se não aceitarmos, dizemos porquê especificamente, com palavras nossas.",
  "submit.aside.next.point3.strong": "Contrato não-exclusivo.",
  "submit.aside.next.point3.rest":
    "Mantens todos os teus outros direitos. Podes continuar a mostrar o filme noutros sítios.",
  "submit.aside.next.point4.strong": "Pago em 7 dias",
  "submit.aside.next.point4.rest":
    "de cada transação, para o teu IBAN ou conta Stripe.",

  // ── Formulário do wizard de submissão (CinemaSubmitStep1.tsx,
  // CinemaSubmitSteps234.tsx, CinemaSubmitReview.tsx, CinemaSubmitParts.tsx,
  // CinemaSubmitWidgets.tsx). "submit.form.*" — cabeçalhos/rótulos/
  // placeholders/texto de ajuda de cada passo.
  "submit.form.step1.heading": "Conta-nos sobre <em>o teu filme</em>",
  "submit.form.step1.sub":
    "Informação básica, visível na página pública do filme",
  "submit.form.step1.title.label": "Título do filme",
  "submit.form.step1.title.placeholder": "ex.: A luz entre os quartos",
  "submit.form.step1.originalTitle.label": "Título original",
  "submit.form.step1.originalTitle.opt": "(se for diferente)",
  "submit.form.step1.originalTitle.placeholder": "Título na língua original",
  "submit.form.step1.year.label": "Ano de produção",
  "submit.form.step1.runtime.label": "Duração (minutos)",
  "submit.form.step1.country.label": "País de origem",
  "submit.form.step1.language.label": "Língua original",
  "submit.form.step1.format.label": "Formato",
  "submit.form.step1.format.ariaLabel": "Formato",
  "submit.form.step1.synopsis.label": "Sinopse",
  "submit.form.step1.synopsis.why":
    "Escrita por ti, com a tua própria voz. 80–200 palavras. Não é um pitch. Descreve o filme como se estivesses a escrever a alguém que ainda não o viu.",
  "submit.form.step1.synopsis.placeholder":
    "Um filme paciente e generoso sobre pessoas queer idosas da classe trabalhadora de Lisboa, feito ao longo de três anos nas cozinhas que as criaram…",
  "submit.form.step1.statement.label": "Nota de realização",
  "submit.form.step1.statement.opt":
    "(opcional, mas aparece na página do filme)",
  "submit.form.step1.statement.why":
    "Porque o fizeste, e o que queres que as pessoas tragam a ele. 60–120 palavras.",
  "submit.form.step1.statement.placeholder":
    "Faço filmes sobre pessoas a quem nunca perguntaram se queriam ser documentadas…",
  "submit.form.step1.identityTags.label":
    "Etiquetas de identidade para ti como cineasta",
  "submit.form.step1.identityTags.why":
    "Só de autoidentificação. Ajudam quem vê a encontrar mais trabalho das tuas comunidades. Nunca obrigatório. Marca o que quiseres mostrar.",
  "submit.form.step1.contentNotes.label": "Notas de conteúdo",
  "submit.form.step1.contentNotes.why":
    "Mostramo-las em destaque, com códigos de tempo se conseguires indicá-los. Pensa nelas como informação: ajudam quem vê a decidir se esta é a noite certa para o teu filme.",
  "submit.form.step1.poster.label": "Carregar cartaz / imagem principal",
  "submit.form.step1.poster.why":
    "Proporção 3:4 preferida. Mínimo 1800px de altura. Usado na página do teu filme e na grelha do catálogo.",
  "submit.form.step1.screener.label": "Link do screener",
  "submit.form.step1.screener.why":
    "Aceitamos links protegidos por palavra-passe do Vimeo, Frame.io ou WeTransfer. Vemos todos os filmes antes de aceitar. Prazo de resposta: 10–14 dias.",
  "submit.form.step1.screener.placeholder":
    "https://vimeo.com/… ou cola um link do WeTransfer",

  "submit.form.step2.heading": "Materiais de <em>acessibilidade</em>",
  "submit.form.step2.sub":
    "Legendas, audiodescrição, línguas gestuais. Ajudamos se estiveres com dificuldades. Ninguém fica de fora por causa do custo.",
  "submit.form.step2.captions.label": "Já tens legendas?",
  "submit.form.step2.captions.why":
    "Legendamos todos os filmes antes de ficarem disponíveis. Se não tiveres legendas, o nosso fundo de acessibilidade pode fazê-las por ti.",
  "submit.form.step2.captions.ariaLabel": "Legendas",
  "submit.form.step2.captionLangs.label":
    "Línguas de legendagem que consegues fornecer",
  "submit.form.step2.ad.label": "Audiodescrição",
  "submit.form.step2.ad.why":
    "Uma faixa descrita ou um guião que possamos narrar. Opcional, mas abre o teu filme a pessoas cegas ou com baixa visão.",
  "submit.form.step2.ad.ariaLabel": "Audiodescrição",
  "submit.form.step2.signTracks.label": "Faixas em língua gestual disponíveis",
  "submit.form.step2.notes.label": "Mais alguma coisa que devamos saber",
  "submit.form.step2.notes.opt": "(opcional)",
  "submit.form.step2.notes.placeholder":
    "Códigos de tempo de imagens com luzes intermitentes, notas sensoriais, ou necessidades de acesso tuas que devamos ter em conta…",

  "submit.form.step3.heading": "Os direitos que estás a conceder",
  "submit.form.step3.sub":
    "Sempre não-exclusivo. Manténs todos os outros direitos e podes mostrar o filme onde e quando quiseres.",
  "submit.form.step3.territory.label": "Território",
  "submit.form.step3.territory.why":
    "Onde podemos transmiti-lo. Mundial alcança mais pessoas, mas uma estreia só local é perfeitamente válida.",
  "submit.form.step3.territory.ariaLabel": "Território",
  "submit.form.step3.term.label": "Prazo",
  "submit.form.step3.term.why":
    "Quanto tempo o filme fica no catálogo. Podes retirá-lo mais cedo a qualquer momento, sem penalização.",
  "submit.form.step3.term.ariaLabel": "Prazo",

  "submit.form.step4.heading": "Como queres <em>vender</em>",
  "submit.form.step4.sub":
    "Tu escolhes. Podes alterar isto depois de submeteres, uma vez por ano.",
  "submit.form.step4.rentPrice.label": "Preço de aluguer (2–8 €)",
  "submit.form.step4.buyPrice.label": "Preço de compra (mín. 2× o aluguer)",

  "submit.form.review.heading": "Rever e submeter",
  "submit.form.review.sub":
    "Uma última vista de olhos. Podes editar qualquer resposta, ou enviar já à equipa.",

  // "submit.option.*" — as próprias listas de opções (Pattern A: `value`
  // canónico em cinemaSubmit.data.ts, `labelKey`/`subKey` resolvidos aqui).
  "submit.option.format.documentary.label": "Documentário",
  "submit.option.format.documentary.sub": "Não-ficção",
  "submit.option.format.narrative.label": "Longa-metragem de ficção",
  "submit.option.format.narrative.sub": "Ficção",
  "submit.option.format.short.label": "Curta-metragem",
  "submit.option.format.short.sub": "Até 40 min",
  "submit.option.format.series.label": "Série",
  "submit.option.format.series.sub": "Episódica",
  "submit.option.format.experimental.label": "Experimental",
  "submit.option.format.experimental.sub": "Ensaio / híbrido",
  "submit.option.format.animation.label": "Animação",

  "submit.option.country.pt": "Portugal",
  "submit.option.country.br": "Brasil",
  "submit.option.country.fr": "França",
  "submit.option.country.es": "Espanha",
  "submit.option.country.other": "Outro",

  "submit.option.language.pt": "Português",
  "submit.option.language.en": "Inglês",
  "submit.option.language.fr": "Francês",
  "submit.option.language.es": "Espanhol",
  "submit.option.language.other": "Outra",

  // Termos de autoidentificação (etiquetas da própria pessoa cineasta) — ver
  // a tabela de terminologia queer em docs/i18n/glossary-pt.md; sinalizado
  // no relatório do sweep para atenção extra de revisão nativa.
  "submit.option.identity.lesbian": "Lésbica",
  "submit.option.identity.gay": "Gay",
  "submit.option.identity.bi": "Bi",
  "submit.option.identity.transWoman": "Mulher trans",
  "submit.option.identity.transMan": "Homem trans",
  "submit.option.identity.nonBinary": "Não-binárie",
  "submit.option.identity.queer": "Queer",
  "submit.option.identity.intersex": "Intersexo",
  "submit.option.identity.asexual": "Assexual",

  "submit.option.captions.have.label": "Já as tenho",
  "submit.option.captions.have.sub": "SRT / VTT prontos",
  "submit.option.captions.help.label": "Preciso de ajuda",
  "submit.option.captions.help.sub": "Usar o fundo",
  "submit.option.captions.none.label": "Ainda não",
  "submit.option.captions.none.sub": "Vamos conversar",

  // Línguas de legendagem que a pessoa cineasta consegue fornecer, incl.
  // "Português do Brasil" para um ficheiro de legendas pt-BR já existente —
  // distinto do chrome pt-PT-only da própria plataforma; ver o comentário
  // de CAPTION_LANGS em cinemaSubmit.data.ts.
  "submit.option.captionLang.pt": "Português",
  "submit.option.captionLang.en": "Inglês",
  "submit.option.captionLang.es": "Espanhol",
  "submit.option.captionLang.fr": "Francês",
  "submit.option.captionLang.ptBr": "Português do Brasil",

  "submit.option.ad.have.label": "Audiodescrição pronta",
  "submit.option.ad.have.sub": "Faixa ou guião",
  "submit.option.ad.help.label": "Gostava de ajuda a criar uma",
  "submit.option.ad.help.sub": "Fundo de acessibilidade",
  "submit.option.ad.none.label": "Não desta vez",

  "submit.option.signTrack.lgp": "LGP",
  "submit.option.signTrack.asl": "ASL",
  "submit.option.signTrack.bsl": "BSL",
  "submit.option.signTrack.none": "Ainda não",

  "submit.option.territory.worldwide.label": "Mundial",
  "submit.option.territory.worldwide.sub": "Alcança mais pessoas",
  "submit.option.territory.europe.label": "Só Europa",
  "submit.option.territory.europe.sub": "UE + Reino Unido",
  "submit.option.territory.portugal.label": "Só Portugal",
  "submit.option.territory.portugal.sub": "Estreia local",

  "submit.option.term.oneYear.label": "Um ano",
  "submit.option.term.oneYear.sub":
    "Renova automaticamente, cancela quando quiseres",
  "submit.option.term.twoYear.label": "Dois anos",
  "submit.option.term.twoYear.sub": "Um pouco mais de estabilidade",
  "submit.option.term.rolling.label": "Contínuo",
  "submit.option.term.rolling.sub": "Até o retirares",

  "submit.option.revenue.free.label": "Grátis para ver",
  "submit.option.revenue.free.tag": "Grátis",
  "submit.option.revenue.free.desc":
    "Qualquer pessoa pode ver. Ganhas uma parte por visualização do fundo comunitário, financiado pelos sustentadores. Bom para curtas e trabalho ativista.",
  "submit.option.revenue.free.split": "~0,03–0,12 € por visualização",
  "submit.option.revenue.sustainer.label": "Biblioteca de sustentadores",
  "submit.option.revenue.sustainer.tag": "Sustentador",
  "submit.option.revenue.sustainer.desc":
    "Incluído no acesso de sustentador. Ganhas uma parte por minuto visto. Previsível, cresce mais devagar.",
  "submit.option.revenue.sustainer.split": "~0,008 €/min visto · 80% para ti",
  "submit.option.revenue.rent.label": "Aluguer · tu defines o preço",
  "submit.option.revenue.rent.tag": "€",
  "submit.option.revenue.rent.desc":
    "Defines o preço de aluguer (mín. 2 €, máx. 8 €). 80% é para ti. Janela de aluguer de 48 horas.",
  "submit.option.revenue.rent.split": "80% para ti · pago semanalmente",
  "submit.option.revenue.rentbuy.label": "Aluguer + Compra",
  "submit.option.revenue.rentbuy.tag": "€€",
  "submit.option.revenue.rentbuy.desc":
    "Define um preço de aluguer e um preço de compra (mín. 2× o aluguer). 80% de ambos é para ti. As gorjetas são sempre 100%.",
  "submit.option.revenue.rentbuy.split": "80% aluguer + compra · 100% gorjeta",

  // "submit.widgets.*" — ContentNotesBuilder + PosterUpload (CinemaSubmitWidgets.tsx).
  "submit.widgets.contentNotes.head":
    "Adiciona uma linha por tema, com o máximo de detalhe possível",
  "submit.widgets.contentNotes.topicPlaceholder": "ex.: Luto",
  "submit.widgets.contentNotes.detailPlaceholder":
    "ex.: Discussão sobre luto e a morte de uma pessoa querida",
  "submit.widgets.contentNotes.timecodePlaceholder": "Código de tempo (opc.)",
  "submit.widgets.contentNotes.topicAriaLabel":
    "Tema da nota de conteúdo {index}",
  "submit.widgets.contentNotes.detailAriaLabel":
    "Detalhe da nota de conteúdo {index}",
  "submit.widgets.contentNotes.timecodeAriaLabel":
    "Código de tempo da nota de conteúdo {index}",
  "submit.widgets.contentNotes.removeAriaLabel":
    "Remover nota de conteúdo {index}",
  "submit.widgets.contentNotes.addCta": "Adicionar outra nota de conteúdo",
  "submit.widgets.poster.attached": "{filename} anexado",
  "submit.widgets.poster.dropTitle": "Larga o teu cartaz aqui",
  "submit.widgets.poster.replaceHint": "Clica para substituir",
  "submit.widgets.poster.browseHint":
    "Ou clica para procurar · JPG, PNG, TIFF · Máx. 50 MB",
  "submit.widgets.poster.note":
    "Não vamos cortar nem aplicar filtros ao teu cartaz sem perguntar primeiro.",

  // "submit.review.*" — linhas de leitura de CinemaSubmitReview.tsx.
  "submit.review.editCta": "Editar",
  "submit.review.value.notAddedYet": "Ainda não adicionado",
  "submit.review.value.runtimeMinutes": "{minutes} min",
  "submit.review.value.notesAdded_one": "{count} adicionada",
  "submit.review.value.notesAdded_other": "{count} adicionadas",
  "submit.review.value.yes": "Sim",
  "submit.review.field.title": "Título",
  "submit.review.field.yearRuntime": "Ano · duração",
  "submit.review.field.format": "Formato",
  "submit.review.field.origin": "Origem",
  "submit.review.field.contentNotes": "Notas de conteúdo",
  "submit.review.field.poster": "Cartaz",
  "submit.review.field.screener": "Screener",
  "submit.review.field.captions": "Legendas",
  "submit.review.field.rightsConfirmed": "Direitos confirmados",
  "submit.review.field.revenueModel": "Modelo de receita",

  // ── Reprodutor (WatchPage.tsx, WatchPageSections.tsx) — só o chrome do
  // leitor. O título/meta/citação da curadoria do filme, as suas notas de
  // conteúdo e o chat da Lobby/Live Q&A são conteúdo desse filme e ficam em
  // inglês. A armadilha de valor guardado do `WatchTab` já está corrigida —
  // o estado/comparação da faixa de separadores usa os ids canónicos em
  // watchPage.data.ts (`"film-info" | "lobby" | "live-qna"`); "watch.tab.*"
  // abaixo são só os rótulos visíveis. ──────────────────────────────────────
  "watch.nav.backToFilm": "Informação do filme",
  "watch.nav.cinemaHome": "Página inicial do Cinema",
  "watch.nav.watchingAs": "A ver como <strong>{name}</strong>",
  "watch.nav.signInCta": "Inicia sessão para guardar o progresso",
  "watch.overlay.ariaLabel": "Notas de conteúdo antes de veres",
  "watch.overlay.heading": "Antes de <em>veres</em>",
  "watch.overlay.sub_one":
    "Este filme tem {count} nota de conteúdo. Faz uma pausa, depois decide quando estiveres pronto.",
  "watch.overlay.sub_other":
    "Este filme tem {count} notas de conteúdo. Faz uma pausa, depois decide quando estiveres pronto.",
  "watch.overlay.readyCta": "Estou pronto · reproduzir o filme",
  "watch.overlay.backCta": "Voltar à página do filme",
  "watch.tab.filmInfo": "Informação do filme",
  "watch.tab.lobby": "Lobby",
  "watch.tab.liveQna": "Q&A ao vivo",
  "watch.facts.director": "Realização",
  "watch.facts.runtime": "Duração",
  "watch.facts.year": "Ano",
  "watch.controls.subtitleLang.pt": "Legendas PT",
  "watch.controls.subtitleLang.en": "Legendas EN",
  "watch.controls.subtitleLang.es": "Legendas ES",
  "watch.controls.subtitleLang.none": "Sem legendas",
  "watch.controls.ccAria": "Legendas em inglês",
  "watch.controls.adAria": "Audiodescrição",
  "watch.controls.ccToggleLabel": "CC EN",
  "watch.controls.adToggleLabel": "AD",
  "watch.controls.pausedStatus": "Em pausa aos {time} · faltam {remaining} min",
  "watch.sidePanel.lobbyPlaceholder": "Diz algo à lobby…",
  "watch.sidePanel.qnaPlaceholder": "Faz uma pergunta a {name}…",
  "watch.sidePanel.sendCta": "Enviar",
  "watch.below.nextUpTitle": "A <em>seguir</em>",
  "watch.below.splitHeading": "A tua visualização · para onde vai o dinheiro",
  "watch.below.splitLegend.filmmaker": "Quem fez o filme",
  "watch.below.splitLegend.payments": "Pagamentos",
  "watch.below.splitLegend.hosting": "Alojamento",

  // ── Live mode (catálogo real + leitor) ─────────────────────────────────────
  "live.catalog.title": "O programa, a passar agora",
  "live.catalog.lead":
    "Todos os filmes abaixo estão disponíveis para membros com sessão iniciada.",
  "live.viewCount": "{count} visualizações",
  "live.finished": "Visto",
  "live.resumeAt": "{percent}% visto",
  "live.signIn.title": "Inicia sessão para ver",
  "live.signIn.description":
    "O cinema está aberto a membros com sessão iniciada. Inicia sessão para ver o programa.",
  "live.signIn.cta": "Iniciar sessão",
  "live.empty.title": "O programa está calmo neste momento",
  "live.empty.description":
    "Ainda não há filmes a passar. Volta em breve. Há títulos novos todas as semanas.",
  "live.error.title": "O programa não carregou",
  "live.error.description":
    "Algo correu mal ao carregar o catálogo. Tenta novamente daqui a pouco.",
  "live.error.retry": "Tentar novamente",
  "live.pick.title": "Escolhe um filme para ver",
  "live.pick.description": "Escolhe um título do programa para começar a ver.",
  "live.pick.cta": "Explorar o programa",
  "live.notFound.title": "Este filme não está disponível",
  "live.notFound.description":
    "Pode ter sido despublicado, ou a ligação está desatualizada.",
  "live.notFound.cta": "Explorar o programa",
  "live.playCta": "Reproduzir filme",
  "live.resumeCta": "Continuar a ver",
  "live.playbackError": "Não foi possível iniciar este filme. Tenta novamente.",
  "live.unsupported.title":
    "Este navegador ainda não consegue reproduzir os nossos filmes",
  "live.unsupported.description":
    "Por agora, o nosso formato de streaming precisa do Safari num Mac, iPhone ou iPad. Abre esta página aí e o filme começa. O suporte para Chrome e Firefox está a ser construído.",
  "live.unsupported.cta": "Explorar o programa",

  // ── Página "ainda não lançado" em modo live (CinemaComingSoon, CON-03) ─────
  // Aparece em TODAS as rotas /cinema/* quando o modo demo está desligado. O
  // cinema tem `launchedFeatures.cinema.launched = false`, por isso nada é
  // transmitido nem vendido — esta página nunca pode repetir a oferta.
  "comingSoon.metaTitle": "Cinema QueerPulse: em breve",
  "comingSoon.title": "O cinema ainda não abriu",
  "comingSoon.description":
    "O nosso cinema em cooperativa ainda está a ser construído: a programação, as subscrições e a partilha de receita com quem realiza chegam tudo ao mesmo tempo. Não há nada à venda nem nenhum filme disponível. Anunciamos aqui quando as portas abrirem.",
  "comingSoon.magazineCta": "Ler a revista",
  "comingSoon.backHome": "Voltar ao início",
};
