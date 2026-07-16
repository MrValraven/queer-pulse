import type { Catalog } from "../../types";

/**
 * Studio — pt-PT inclusivo. Mesmas chaves que `en/studio.ts`.
 *
 * Notas de tradução:
 * - "Studio" e "Cinema" são nomes de marca/produto e nunca são traduzidos
 *   (ver `docs/i18n/glossary-pt.md`).
 * - "Members" → *pessoas*, nunca *Membros*.
 * - Registo `tu`, caloroso, nunca `você`.
 * - Nomes de artistas, faixas, álbuns, listas de reprodução e letras ficam em
 *   inglês — em modo live vêm da API como texto de quem os escreveu/gravou.
 */
export const studio: Catalog = {
  // ── Barra superior da shell (StudioShell) ─────────────────────────────────
  "shell.back": "Voltar",
  "shell.forward": "Avançar",
  "shell.searchPlaceholder": "pesquisar artistas, faixas, partituras…",
  "shell.forArtistsCta": "Para artistas",
  "shell.sustainCta": "Contribuir · {price}/mês",

  // ── Marca (repetida na shell/rail/páginas de erro/entrar) ─────────────────
  "brand.lockup": "Queer<em>Pulse</em>",
  "brand.studioLabel": "Studio",

  // ── Menu lateral (StudioRail) ──────────────────────────────────────────────
  "rail.section.contribute": "Contribuir",
  "rail.section.governance": "Governação",
  "rail.section.coop": "A cooperativa",
  "rail.section.library": "Na tua biblioteca",

  "rail.main.home": "Início",
  "rail.main.wednesdaySet": "O set de quarta-feira",
  "rail.main.browse": "Explorar",
  "rail.main.sheetMusic": "Partituras",
  "rail.main.liveBroadcasts": "Transmissões ao vivo",
  "rail.main.notifications": "Notificações",

  "rail.contribute.submitSet": "Submeter um set",
  "rail.contribute.goLive": "Transmitir ao vivo",
  "rail.contribute.openCalls": "Chamadas abertas",
  "rail.contribute.rightsTakedown": "Direitos e remoção",
  "rail.contribute.solidarityFund": "Fundo de solidariedade",

  "rail.governance.programWeek": "Programar a semana",
  "rail.governance.curationCouncil": "Conselho de curadoria",
  "rail.governance.submissionInbox": "Caixa de submissões",
  "rail.governance.flaggedTracks": "Faixas assinaladas",

  "rail.utility.about": "Sobre a cooperativa",
  "rail.utility.help": "Ajuda e perguntas frequentes",
  "rail.utility.accessibility": "Acessibilidade",
  "rail.utility.trustTerms": "Confiança e termos",

  "rail.foot.sustainedSince": "<em>Sustentas</em> a Studio desde {date}.",
  "rail.foot.paid_one":
    "Já pagaste <b>{amount}</b> a {count} artista este ano.",
  "rail.foot.paid_other":
    "Já pagaste <b>{amount}</b> a {count} artistas este ano.",

  // ── Controlos do leitor (StudioPlayer + reutilizados noutros pontos) ─────
  "player.prev": "Anterior",
  "player.play": "Reproduzir",
  "player.next": "Seguinte",
  "player.tipCta": "Dar {amount}",
  "player.payingLine": "<b>a pagar</b> {amount} a {artist}",

  // ── Hero da sala "Esta semana" (StudioPageSections → StudioHero) ─────────
  "room.hero.onAirEyebrow": "Faixa {track} · no ar agora",
  "room.hero.trackPosition": "Faixa {current} de {total} · {duration}",
  "room.hero.listening_one": "{count} pessoa a ouvir",
  "room.hero.listening_other": "{count} pessoas a ouvir",
  "room.hero.addedToast": "Adicionada à tua biblioteca",
  "room.hero.removedToast": "Removida da tua biblioteca",
  "room.hero.inLibrary": "Na biblioteca",
  "room.hero.addLibrary": "Biblioteca",
  "room.hero.payNote": "Esta audição paga a {artist} <em>{amount}</em>.",
  "room.hero.tipOnTop": "Queres dar mais? 100% para ela.",

  // ── Secção do set "Esta semana" ────────────────────────────────────────────
  "room.set.title": "O set de quarta-feira, <em>ao vivo</em>",
  "room.set.subtitle":
    "Programado por {curator} · em simultâneo · {count} na sala",
  "room.set.readPlanCta": "Ler o plano",
  "room.set.sideHeading": "Na sala contigo",
  "room.set.sideSub":
    "{sustainers} sustentadores · {casual} ocasionais · {cities} cidades",
  "room.set.ledgerHead": "Livro-razão · este mês",
  "room.set.ledgerPaidArtists": "Pago a artistas",
  "room.set.ledgerPlays": "Reproduções",
  "room.set.ledgerArtistShare": "Parte do artista",
  "room.set.ledgerPerPlay": "Por reprodução",

  // ── Secção "Esta semana, programado" ──────────────────────────────────────
  "room.tracks.title": "Esta semana, <em>programado</em>",
  "room.tracks.subtitle":
    "Oito faixas, cada uma com o nome de quem a programou. Muda à segunda-feira.",
  "room.tracks.allCta": "Todas",
  "room.tracks.perPlay": "por reprodução",

  // ── Páginas de erro (Studio404Page, Studio500Page) ────────────────────────
  "error.brandAria": "Página inicial da QueerPulse Studio",
  "error404.eyebrow": "Faixa não encontrada",
  "error404.title": "Esta música <em>não existe.</em>",
  "error404.body":
    "A faixa, o set ou a página que procuravas nunca foi gravada, foi removida pelo artista, ou está atrás de um início de sessão. Sem drama — o catálogo é grande e a sala está quente.",
  "error404.backCta": "Voltar ao leitor",
  "error404.goBackCta": "Voltar atrás",
  "error404.tryInsteadTitle": "Experimenta uma destas",
  "error404.link.set.label": "O <em>set</em> desta semana",
  "error404.link.set.sub": "Ao vivo, programado às segundas-feiras",
  "error404.link.search.label": "<em>Pesquisar</em> no catálogo",
  "error404.link.search.sub": "Faixas, artistas, partituras",
  "error404.link.library.label": "A tua <em>sala</em>",
  "error404.link.library.sub": "Guardadas, a sustentar, com gorjeta",

  "error500.eyebrow": "Algo falhou",
  "error500.title": "Perdemos a <em>gravação.</em>",
  "error500.body":
    "Um servidor do nosso lado falhou a meio da gravação. A tua conta, as tuas gravações e o pagamento a cada artista estão seguros — isto é só o front of house. Espera um segundo e tenta outra vez.",
  "error500.tryAgainCta": "Tentar outra vez",
  "error500.backCta": "Voltar ao leitor",
  "error500.statusPrefix": "Todos os pagamentos e a parte bancária não foram afetados ·",
  "error500.refLine": "ref: {ref} · {timestamp} · o conselho já foi avisado",

  // ── Shell da página de marketing (StudioLandingShell) ─────────────────────
  "landing.nav.aboutCoop": "Sobre a cooperativa",
  "landing.nav.publicLedger": "Livro-razão público",
  "landing.nav.howItWorks": "Como funciona",
  "landing.nav.forArtists": "Para artistas",
  "landing.footer.tagline":
    "Uma rede profissional queer com raízes em Lisboa. A Studio é uma das suas salas — a par de Cinema, Magazine e Encontros.",
  "landing.footer.col.studio": "Studio",
  "landing.footer.col.studio.thisWeek": "Esta semana",
  "landing.footer.col.studio.djSets": "Sets de DJ",
  "landing.footer.col.studio.liveBroadcast": "Transmissão ao vivo",
  "landing.footer.col.artists": "Artistas",
  "landing.footer.col.artists.submitMusic": "Submeter música",
  "landing.footer.col.artists.dashboard": "Painel do artista",
  "landing.footer.col.artists.revenueSplit": "Divisão de receita",
  "landing.footer.col.council": "Conselho",
  "landing.footer.col.council.programming": "Programação",
  "landing.footer.col.council.submissions": "Submissões",
  "landing.footer.col.council.curatorCouncil": "Conselho de curadoria",
  "landing.footer.col.coop.strategyPlan": "O plano estratégico",
  "landing.footer.copyright": "© {year} QueerPulse Studio Co-op CRL — Lisboa",
  "landing.footer.languages": "EN · PT",

  // ── Hero de marketing (StudioLandingHero) ─────────────────────────────────
  "landing.hero.onAirNow": "No ar agora",
  "landing.hero.clock": "{weekday} · {time} Lisboa",
  "landing.hero.title": "Música, <em>programada</em> por ouvidos queer.",
  "landing.hero.dek":
    "Uma sala de streaming cooperativa. <em>{sharePercent}</em> de cada audição vai para o artista. <em>{tipPercent}</em> de cada gorjeta. O livro-razão é público. Quem cura tem nome. <em>Nenhum algoritmo alguma vez pôs aqui os pés.</em>",
  "landing.hero.sustainCta": "Sustentar a sala · {price}/mês",
  "landing.hero.demoCta": "Ouvir um set de demonstração · grátis",

  "landing.demo.eyebrow": "O set de quarta-feira · pré-visualização grátis",
  "landing.demo.meta":
    "programado por {curator} · {duration} · {trackCount} faixas · {listening} a ouvir",
  "landing.demo.pauseAria": "Pausar pré-visualização",
  "landing.demo.playAria": "Reproduzir pré-visualização",
  "landing.demo.trackPrefix": "Faixa {n} ·",
  "landing.demo.byLine": "{artist} · de {album}",
  "landing.demo.payNote":
    "Esta audição paga a {artist} <em>{amount}</em> quando és sustentador. Neste momento, a sala está aberta como demonstração.",
  "landing.demo.quote":
    "«Fica até ao segundo verso da faixa seis. <em>O piano deixa-te ali de propósito.</em>» — {attribution}, responsável pela programação",

  // ── As quatro promessas (StudioLandingPromises) ───────────────────────────
  "landing.promises.eyebrow": "O contrato · não o marketing",
  "landing.promises.title":
    "Quatro <em>promessas</em> que fazemos, a artistas e a quem ouve.",
  "landing.promises.share.title": "Uma parte justa e <em>visível</em>.",
  "landing.promises.share.body":
    "80% de cada audição vai para o artista. 100% de cada gorjeta. Os outros 20% cobrem pagamentos, alojamento, legendas, edição de partituras e ajudas de custo do conselho. A divisão está em cada página de artista, cada recibo, cada álbum.",
  "landing.promises.humans.title": "Uma sala <em>programada</em> por pessoas.",
  "landing.promises.humans.body":
    "Cada faixa na página principal tem o nome de quem a curou e uma nota de um parágrafo. Sem \"popular perto de ti\", sem \"feito para ti\", sem scroll infinito. A semana é pequena, feita à mão e datada.",
  "landing.promises.coOwned.title": "Co-propriedade de quem <em>ouve</em>.",
  "landing.promises.coOwned.body":
    "Sustentadores ({price}/mês) tornam-se sócios com voto na cooperativa ao fim de doze meses. Elegem o conselho, aprovam a tabela de valores e veem cada euro no livro-razão. A plataforma presta contas à sala.",
  "landing.promises.privacy.title": "Privacidade como <em>padrão</em>.",
  "landing.promises.privacy.body":
    "Nenhum dado de audição é vendido, distribuído ou usado para recomendar. O histórico pessoal de reprodução é privado e apagável num clique. Existem reproduções agregadas para o livro-razão; mais nada sai daqui.",

  // ── Contador do livro-razão público (StudioLandingCounter) ────────────────
  "landing.counter.liveEyebrow": "Ao vivo — atualizado em tempo real",
  "landing.counter.title":
    "Desde que a beta abriu, a <em>QueerPulse Studio</em> já pagou:",
  "landing.counter.sub": "a {count} artistas, em {cycles} ciclos mensais.",
  "landing.counter.seeLedgerCta": "Ver o livro-razão",
  "landing.counter.stat.perPlay": "por reprodução válida · 15× o Spotify",
  "landing.counter.stat.artistShare": "parte para artistas, no agregado",
  "landing.counter.stat.sustainers": "sustentadores na cooperativa",
  "landing.counter.stat.councilAnswerTime":
    "tempo mediano de resposta do conselho",
  "landing.counter.unit.days": "dias",

  // ── Faixa de comparação por audição (StudioLandingComparison) ─────────────
  "landing.compare.title": "A <em>taxa por audição</em>, em comparação.",
  "landing.compare.spotify.label": "Spotify · média",
  "landing.compare.spotify.ctx":
    "Pro-rata · misturado com anúncios · cerca de 3 cêntimos por 10 reproduções",
  "landing.compare.apple.label": "Apple Music",
  "landing.compare.apple.ctx": "Ligeiramente melhor, ainda maioritariamente nominal",
  "landing.compare.tidal.label": "Tidal HiFi",
  "landing.compare.tidal.ctx": "Centrado na pessoa · só no plano hi-fi",
  "landing.compare.us.label": "QP Studio · piso mínimo garantido",
  "landing.compare.us.ctx":
    "Sem anúncios · sem acionistas · financiado por sustentadores. Definido anualmente por votação.",

  // ── Faixa final de chamada à ação (StudioLandingCta) ──────────────────────
  "landing.cta.title": "Reserva o teu <em>lugar</em> na sala.",
  "landing.cta.body":
    "{price} por mês. Cancela quando quiseres. <em>A primeira audição</em> diz-te se a sala é para ti.",
  "landing.cta.readPlanCta": "Ler o plano primeiro",
  "landing.cta.secondary":
    "Já és pessoa da QueerPulse? A Studio custa <em>mais {addOnPrice}/mês</em>.",
  "landing.cta.secondaryLink": "Entra para a adicionar",

  // ── Entrar / Juntar-te (StudioSignInPage) ─────────────────────────────────
  "signin.tabs.signIn": "Entrar",
  "signin.tabs.join": "Juntar-te",
  "signin.aside.onAirNow": "No ar agora · {count} na sala",
  "signin.aside.title": "Uma cooperativa de streaming que <em>paga</em> a quem fez a música.",
  "signin.aside.body":
    "Oitenta cêntimos de cada euro chegam ao artista. As gorjetas passam a <em>{tipPercent}</em>. O livro-razão é público, atualizado toda a segunda-feira ao meio-dia.",
  "signin.aside.paidThisMonth": "Pago a artistas este mês: <em>{amount}</em> · e a subir.",

  "signin.in.title": "Bem-vinde de <em>volta.</em>",
  "signin.in.lede":
    "A Studio é um separador na tua conta QueerPulse, não um novo início de sessão. Entra com a conta que já tens.",
  "signin.emailLabel": "Email",
  "signin.emailPlaceholder": "tu@exemplo.com",
  "signin.in.submitCta": "Entrar",
  "signin.orDivider": "ou",
  "signin.googleContinue": "Continuar com o Google",
  "signin.googleLoading": "A entrar…",
  "signin.in.newHere": "Ainda não tens conta?",
  "signin.in.joinCta": "Juntar-te à sala",
  "signin.in.freePrompt": "Só queres ouvir?",
  "signin.in.freeCta": "Ouve um set grátis, sem conta",
  "signin.in.signedInToast": "Sessão iniciada — bem-vinde de volta",
  "signin.in.signedInGoogleToast": "Sessão iniciada com o Google — bem-vinde de volta",

  "signin.join.title": "Junta-te à <em>sala.</em>",
  "signin.join.lede":
    "Escolhe quanto da cooperativa queres. Podes mudar de nível ou cancelar em qualquer mês — sem fidelização, sem emails a insistir.",
  "signin.join.chooseTier": "Escolhe o teu nível",
  "signin.join.tier.studio.title": "Só <em>Studio</em>",
  "signin.join.tier.studio.body":
    "Tudo na Studio — o set semanal do conselho, salas ao vivo, o catálogo completo, áudio sem perdas, subscrições diretas a artistas.",
  "signin.join.tier.studio.incl": "{sharePercent} da tua quota chega a artistas por reprodução",
  "signin.join.tier.coop.badge": "Melhor valor",
  "signin.join.tier.coop.title": "Toda a <em>cooperativa</em>",
  "signin.join.tier.coop.body":
    "Studio <em>mais</em> Cinema, Magazine, Encontros, grupos de leitura e um voto na assembleia anual. Uma só assinatura, toda a QueerPulse.",
  "signin.join.tier.coop.incl": "Uma conta em todos os espaços",
  "signin.join.submitCta": "Continuar para o pagamento",
  "signin.join.alreadyMember": "Já és pessoa da comunidade?",
  "signin.join.notReady": "Ainda não tens a certeza?",
  "signin.join.freeCta": "Ouve primeiro um set grátis",
  "signin.perMonth": "/mês",

  // ── Assistente de boas-vindas (StudioWelcomePage) ─────────────────────────
  "welcome.eyebrow": "Já entraste · vamos configurar a tua sala",
  "welcome.title": "Bem-vinde à <em>sala</em>, {name}.",
  "welcome.sub":
    "Três coisas rápidas e o primeiro set é teu. <em>Podes saltar qualquer uma</em> — nada disto fica fixo.",
  "welcome.step1.title": "Segue alguns <em>artistas</em>",
  "welcome.step1.dek":
    "Vamos mostrar-te primeiro os lançamentos deles. Escolhe três ou mais — <em>o conselho escolhe o resto</em>.",
  "welcome.step1.followedCount_one": "{count} a seguir",
  "welcome.step1.followedCount_other": "{count} a seguir",
  "welcome.nextCta": "Seguinte",
  "welcome.step2.title": "Define a tua <em>gorjeta</em> por omissão",
  "welcome.step2.dek":
    "Um toque no leitor envia isto diretamente ao artista — <em>100%, sem corte</em>. Muda quando quiseres.",
  "welcome.skipCta": "Saltar",
  "welcome.tip.nod": "um aceno",
  "welcome.tip.coffee": "um café",
  "welcome.tip.round": "uma rodada",
  "welcome.tip.record": "um disco",
  "welcome.step3.title": "Quanta privacidade queres para a <em>sala</em>?",
  "welcome.step3.dek":
    "As nossas predefinições são as mais cuidadosas. <em>Nada aqui está ativo a menos que o ligues.</em>",
  "welcome.step3.history.title": "Guardar o meu histórico de audição",
  "welcome.step3.history.body":
    "Um registo privado e apagável que só tu vês. Desligado por omissão — nada sai do teu navegador.",
  "welcome.step3.tipNotes.title": "Tornar públicas as minhas notas de gorjeta",
  "welcome.step3.tipNotes.body":
    "Desligado mantém cada nota entre ti e o artista. Podes mudar qualquer nota depois.",
  "welcome.step3.librarySync.title": "Sincronizar a minha biblioteca entre dispositivos",
  "welcome.step3.librarySync.body":
    "As gravações e os seguimentos acompanham-te. Ligado por omissão — desliga para manter só neste dispositivo.",
  "welcome.enterRoomCta": "Entrar na sala",
  "welcome.readyToast": "A tua sala está pronta",
};
