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
  "about.split.tipsNote": "As gorjetas são 100% para quem fez o filme. Sem dedução.",
  "about.council.title": "O conselho de <em>curadoria</em>",
  "about.council.sub":
    "Seis pessoas que programam o cinema. Alternam todos os anos — nomeadas pela comunidade, confirmadas por voto de sustentadores. Cada uma traz uma geografia, um foco e um olhar diferentes.",
  "about.gov.ledgerTitle": "Registo <em>público</em> · {month}",
  "about.gov.ledger.sustainers": "Sustentadores",
  "about.gov.ledger.paidToFilmmakers": "Pago a cineastas este mês",
  "about.gov.ledger.filmsStreamed": "Filmes em streaming este mês",
  "about.gov.ledger.averageShare": "Percentagem média para cineastas",
  "about.gov.ledger.commissioningPool": "Fundo de encomendas (temporada {season})",
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
