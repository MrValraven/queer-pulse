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

  // ── Etiquetas partilhadas nos cartões de faixas/lançamentos ───────────────
  "tag.free": "Grátis",
  "tag.sustainer": "Sustentador",
  "tag.replay": "Reposição",

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

  // ── Sobre a cooperativa (StudioAboutPage + StudioAboutSections) ──────────
  "about.hero.eyebrow": "Sobre · escrito para quem duvida",
  "about.hero.title":
    "Uma cooperativa de streaming que <em>paga</em> a quem fez a música.",
  "about.hero.lede":
    "Já ouviste «pagamento justo para artistas» da parte de todas as plataformas que os pagam mal. Por isso, aqui tens a aritmética, a governação e o teto honesto — <em>sem slogans que não se consigam verificar.</em>",

  "about.sec.whatItIs.num": "01 — o que é",
  "about.sec.whatItIs.heading": "Uma plataforma de audição, gerida como <em>cooperativa</em>.",
  "about.sec.whatItIs.p1":
    "A QueerPulse Studio pertence a quem a usa — quem ouve e quem faz música, juntos — não a acionistas nem a uma editora discográfica. <strong>Oitenta cêntimos de cada euro gerado por uma audição vão para o artista.</strong> Cada cêntimo de cada gorjeta, também. A divisão é pública, o catálogo é curado por um conselho eleito de seis pessoas, e os masters nunca saem das mãos de quem os fez.",
  "about.sec.whatItIs.p2":
    "É a terceira sala da cooperativa QueerPulse, depois da Magazine e do Cinema. Uma só assinatura cobre tudo. Podes ser pessoa da comunidade só pela escrita e nunca abrir a Studio; podes estar aqui só pela música e nunca ler uma palavra.",
  "about.sec.whatItIs.pull":
    "Não estamos a tentar ser um Spotify mais pequeno. Estamos a tentar ser uma <em>sala diferente</em>.",

  "about.sec.rate.num": "02 — a taxa",
  "about.sec.rate.heading":
    "€0,05 por reprodução. Um <em>piso</em>, não um número de marketing.",
  "about.sec.rate.p1":
    "Comprometemo-nos a <strong>€0,05 por reprodução válida</strong> — cerca de quinze vezes o que o Spotify paga. Uma reprodução válida tem pelo menos 30 segundos, com um limite de um pagamento por pessoa a ouvir, por dia, para que ninguém possa fazer batota. O piso pode subir por maioria simples na assembleia; só pode <em>descer</em> com maioria de dois terços. Na prática, isso significa que não desce.",
  "about.sec.rate.footnote":
    "Para comparação: a €0,003 por reprodução, uma música precisa de cerca de 330 000 reproduções para ganhar o que aqui ganha em 20 000. Não estamos a fingir que é uma diferença pequena.",

  "about.rate.cell.floor.value": "€<em>0,05</em>",
  "about.rate.cell.floor.label": "por reprodução válida · o piso",
  "about.rate.cell.share.value": "<em>80</em>%",
  "about.rate.cell.share.label": "da receita de subscrições para artistas, por reprodução",
  "about.rate.cell.tip.value": "<em>100</em>%",
  "about.rate.cell.tip.label": "de cada gorjeta — sem corte da plataforma, nunca",

  "about.sec.ceiling.num": "03 — o que um artista pode realmente ganhar",
  "about.sec.ceiling.heading": "Honestos quanto ao <em>teto</em>.",
  "about.sec.ceiling.p1":
    "A maioria das páginas sobre a «economia de criadores» mostra-te o top 0,1% e deixa-te presumir que és tu. Aqui está o que a taxa realmente produz em quatro níveis reais de audição — e onde para.",

  "about.tier.casual.label": "Ocasional",
  "about.tier.casual.value": "74",
  "about.tier.casual.body":
    "1480 reproduções válidas — cerca de <em>75 pessoas a ouvir</em> uma faixa três vezes por semana. Dinheiro para um café, pago todos os meses.",
  "about.tier.building.label": "Em crescimento",
  "about.tier.building.value": "340",
  "about.tier.building.body":
    "6800 reproduções, duas gorjetas, uma compra de álbum. Um rendimento extra a sério — <em>quase dá para a renda</em> em Lisboa.",
  "about.tier.sustaining.label": "Consolidado",
  "about.tier.sustaining.value": "1820",
  "about.tier.sustaining.body":
    "36 000 reproduções, uma bolsa de gorjetas regular, uma sala ao vivo por mês. Abaixo do salário mediano português — e <em>12× o que o Spotify paga</em> pela mesma audição.",
  "about.tier.touring.label": "Artista em digressão",
  "about.tier.touring.body":
    "A Studio <em>não</em> vai substituir um rendimento de digressão, e não vamos fingir que consegue. Pode, plausivelmente, pagar a renda enquanto fazes a próxima coisa.",
  "about.tierFoot":
    "Isto não são projeções de um pitch deck — são a taxa real por reprodução do livro-razão ao vivo, multiplicada por contagens de reproduções honestas. <em>Os números reais são públicos, todas as segundas-feiras ao meio-dia.</em>",

  "about.sec.governance.num": "04 — quem decide",
  "about.sec.governance.heading":
    "Um <em>conselho</em> eleito, com mandato limitado, registado publicamente.",
  "about.sec.governance.p1":
    "Seis pessoas programam o set semanal, tratam da triagem de submissões e escrevem um parágrafo a justificar cada escolha. São eleitas por toda a cooperativa na assembleia anual, recebem uma ajuda de custo fixa de €400/mês que aparece no livro-razão público, e têm mandatos limitados a dois anos com rotação obrigatória. <strong>Nenhum algoritmo decide quem é ouvido.</strong> É uma pessoa que decide, e assina o nome por baixo.",
  "about.sec.governance.p2":
    "O piso por audição e as percentagens da divisão são definidos anualmente por votação conjunta de sustentadores e artistas, com quórum de 20%. Se achas que a taxa está errada, não escreves ao apoio ao cliente — <em>votas, ou candidatas-te.</em>",

  "about.sec.hardQuestions.num": "05 — as perguntas difíceis",
  "about.sec.hardQuestions.heading": "As que estás <em>mesmo</em> a fazer.",

  "about.skeptic.broke.q":
    "Isto soa lindo e condenado ao fracasso. Como é que isto não vai à falência?",
  "about.skeptic.broke.a":
    "Sendo honestos, em baixa escala, o piso por audição é caro e uma faixa que rebente pode custar mais em largura de banda do que aquilo que gera. A nossa mitigação é aborrecida e pública: quem ouve de forma ocasional fica por defeito em AAC, fazemos cache de forma agressiva, e o livro-razão é reconciliado <em>diariamente</em>, para vermos o vermelho antes de ser uma crise, não depois.",
  "about.skeptic.clique.q": "Curadoria feita por seis pessoas soa a panelinha.",
  "about.skeptic.clique.a":
    "Pode tornar-se numa — esse é o risco real. As salvaguardas são mandatos de dois anos, rotação obrigatória, e o facto de cada escolha ser publicada com um nome e uma razão. <em>Uma panelinha que tem de se justificar por escrito todas as semanas é uma panelinha mais fraca.</em>",
  "about.skeptic.clone.q": "Isto não é só um clone do Spotify com copy mais bonita?",
  "about.skeptic.clone.a":
    "Se a página principal fosse filas de capas de álbum quadradas, seria. O produto é editorial de propósito: um set semanal programado, salas de audição ao vivo, pagamentos visíveis em cada faixa. <em>Se algum dia parecermos um Spotify mais pequeno, cobra-nos este parágrafo.</em>",
  "about.skeptic.leave.q": "O que acontece à minha música se eu sair?",
  "about.skeptic.leave.a":
    "Ficas com os teus masters e com tudo o que ganhaste. A remoção é um processo de uma página, com 14 dias, sem ciclo de retenção. As reproduções passadas continuam pagas. Sair é tão fácil como entrar — achamos que é a única forma honesta de te pedir para ficares.",

  "about.cta.title": "A sala é pequena, e <em>paga</em>.",
  "about.cta.body":
    "Ouve um set grátis, sem conta. Se for para ti, sustenta-a pelo preço de dois cafés.",
  "about.cta.join": "Juntar-te à sala",
  "about.cta.ledger": "Ler o livro-razão público →",

  // ── Acessibilidade (StudioAccessibilityPage) ──────────────────────────────
  "accessibility.hero.eyebrow": "Acessibilidade · a lista em construção",
  "accessibility.hero.title": "A música é para toda a gente, ou não é <em>música</em>.",
  "accessibility.hero.lede":
    "Isto é, ao mesmo tempo, uma declaração de intenção e uma lista de verificação viva do que já funciona mesmo hoje. Onde algo <em>ainda não</em> está feito, dizemo-lo — preferimos ser honestos a parecer aspiracionais.",
  "accessibility.statement.p1":
    "A QueerPulse Studio compromete-se a cumprir a <em>WCAG 2.2 AA</em> em todas as superfícies, e a tratar a acessibilidade como um requisito de produto, não um pormenor de conformidade. Pessoas surdas e com dificuldades auditivas devem poder usar uma plataforma de música. O mesmo vale para pessoas cegas e com baixa visão, pessoas que navegam pelo teclado, e pessoas que precisam de palavras na sua própria língua.",
  "accessibility.statement.p2":
    "Testamos com leitores de ecrã reais e pessoas reais — pagas, da nossa própria comunidade — em cada lançamento. <em>Se algo aqui não funcionar para ti, isso é um erro, e queremos o teu relatório.</em>",

  "accessibility.group.deaf.heading": "Para pessoas surdas e com <em>dificuldades auditivas</em>",
  "accessibility.group.deaf.dek":
    "Uma plataforma de música não pode fingir que toda a gente ouve da mesma forma. Por isso legendamos a conversa e mostramos as palavras.",
  "accessibility.item.captions.heading": "Salas <em>ao vivo</em> legendadas",
  "accessibility.item.captions.body":
    "Cada transmissão é legendada automaticamente em tempo real; as transmissões do conselho recebem uma <em>revisão humana</em>. A conversa entre músicas, as dedicatórias, os comentários do artista — tudo transcrito e com tamanho ajustável.",
  "accessibility.item.lyrics.heading": "Letras <em>sincronizadas</em>",
  "accessibility.item.lyrics.body":
    "Quando o artista as disponibiliza, as letras avançam ao ritmo da reprodução, com a linha atual destacada. Também podes lê-las como uma folha estática, em qualquer faixa.",
  "accessibility.item.waveforms.heading": "<em>Formas de onda</em> visuais",
  "accessibility.item.waveforms.body":
    "As salas ao vivo e as faixas mostram uma forma de onda em tempo real ligada ao áudio real, para que o ritmo e a dinâmica sejam visíveis, não só audíveis.",
  "accessibility.item.signed.heading": "Transmissões <em>com intérprete</em>",
  "accessibility.item.signed.body":
    "As transmissões principais do conselho incluem uma janela de interpretação em Língua Gestual Portuguesa (LGP). A expandir para as salas semanais no próximo trimestre.",

  "accessibility.group.language.heading": "Para quem ouve em <em>qualquer língua</em>",
  "accessibility.group.language.dek":
    "O catálogo está sobretudo em português, com músicas numa dezena de outras línguas. As palavras não deviam ser uma barreira.",
  "accessibility.item.translation.heading": "<em>Tradução</em> de letras",
  "accessibility.item.translation.body":
    "As traduções feitas pela comunidade aparecem ao lado do original. Mostra uma, ou as duas ao mesmo tempo. Quem traduz é creditado e <em>pago pelo fundo de solidariedade</em> — traduzir é trabalho.",
  "accessibility.item.interfaceLang.heading": "Interface na <em>tua língua</em>",
  "accessibility.item.interfaceLang.body":
    "A interface da Studio está disponível em português, inglês, espanhol e francês, com mais línguas à medida que a comunidade as traduz. Define-a em Definições → Legendas e letras.",

  "accessibility.group.lowVision.heading": "Para navegação por <em>baixa visão</em> e teclado",
  "accessibility.group.lowVision.dek":
    "Todo o leitor é operável sem rato, e o tema escuro foi construído para ter contraste claro — não só para parecer com atmosfera.",
  "accessibility.item.contrast.heading": "Contraste que <em>passa</em>",
  "accessibility.item.contrast.body":
    "O texto principal está a 4,5:1 ou melhor contra o roxo; os elementos interativos a um mínimo de 3:1, com um modo de alto contraste que reforça tudo ainda mais. Os anéis de foco estão sempre visíveis.",
  "accessibility.item.screenReader.heading": "Notas para leitor de ecrã no <em>leitor</em>",
  "accessibility.item.screenReader.body":
    "O leitor persistente anuncia a faixa, o artista, o tempo decorrido, e <em>quanto esta audição paga ao artista</em>. Dar gorjeta e guardar são botões com etiqueta; a lista de gorjetas ao vivo é uma região viva ARIA educada, nunca uma rajada.",
  "accessibility.item.reducedMotion.heading": "Respeita o <em>movimento reduzido</em>",
  "accessibility.item.reducedMotion.body":
    "Toda a animação decorativa — o ponto pulsante, as formas de onda, as barras do equalizador — imobiliza-se quando o teu sistema pede movimento reduzido. Nada essencial se move.",

  "accessibility.status.live": "Disponível",
  "accessibility.status.inProgress": "Em curso",

  "accessibility.shortcuts.title": "Atalhos de <em>teclado</em> do leitor",
  "accessibility.shortcuts.dek":
    "Foca em qualquer parte fora de um campo de texto. Funcionam da mesma forma em toda a Studio, já que o leitor está sempre montado.",
  "accessibility.shortcut.playPause": "Reproduzir / <em>pausar</em>",
  "accessibility.shortcut.prevNext": "Faixa anterior / <em>seguinte</em>",
  "accessibility.shortcut.volume": "Volume <em>acima / abaixo</em>",
  "accessibility.shortcut.tip": "Dar gorjeta ao artista atual",
  "accessibility.shortcut.save": "Guardar na biblioteca",
  "accessibility.shortcut.captions": "Alternar <em>legendas / letras</em>",
  "accessibility.shortcut.search": "Abrir pesquisa",
  "accessibility.key.space": "Espaço",

  "accessibility.contact.title": "Encontraste uma <em>barreira</em>?",
  "accessibility.contact.body":
    "Conta-nos e vamos tratá-la como um erro, não como um pedido de funcionalidade. Relatórios de pessoas que usam tecnologia de apoio passam à frente na fila — <em>access@queerpulse.org</em>, ou assinala a partir do rodapé de qualquer página. Respondemos em dois dias úteis, com uma correção ou um prazo honesto.",
  "accessibility.contact.reportCta": "Reportar uma barreira de acesso",
  "accessibility.contact.reportToast": "Recebido — vamos tratar isto como um erro",
  "accessibility.contact.meta":
    "Última auditoria: 2 jun. 2026 · WCAG 2.2 AA · NVDA, VoiceOver, TalkBack · próxima auditoria: set. 2026",

  // ── Ajuda e perguntas frequentes (StudioHelpPage + StudioHelpFaq) ─────────
  "help.hero.eyebrow": "Ajuda · pessoas reais, respostas reais",
  "help.hero.title": "Como podemos <em>ajudar</em>?",
  "help.hero.dek":
    "A maioria das respostas está abaixo. Se não estiver, uma pessoa lê cada mensagem — não temos um labirinto de bots, nem existe um nível de apoio que tenhas de pagar.",
  "help.searchPlaceholder": "Pesquisar ajuda — gorjetas, pagamentos, qualidade de áudio…",
  "help.searchAria": "Pesquisar ajuda",
  "help.searchCta": "Pesquisar",
  "help.searchingToast": "A pesquisar no centro de ajuda…",

  "help.cat.listening.heading": "Audição e <em>gorjetas</em>",
  "help.cat.listening.blurb": "Reprodução, gorjetas, contribuir, biblioteca",
  "help.cat.account.heading": "Conta e <em>faturação</em>",
  "help.cat.account.blurb": "Assinatura, níveis, privacidade, cancelamento",
  "help.cat.artists.heading": "Para <em>artistas</em>",
  "help.cat.artists.blurb": "Envios, pagamentos, direitos, a taxa",

  "help.faq.moneyGo.q": "Para onde vai realmente o meu dinheiro?",
  "help.faq.moneyGo.a":
    "Da tua assinatura, <strong>80% chega a artistas</strong> por reprodução, com um piso de €0,05 cada. <em>Cada cêntimo de cada gorjeta</em> vai para o artista sem corte da plataforma. O resto financia ajudas de custo de curadoria, infraestrutura e o fundo de solidariedade. Podes ver a divisão exata no <a>livro-razão público</a>, atualizado toda a segunda-feira ao meio-dia.",
  "help.faq.tipNoAccount.q": "Posso dar gorjeta sem ter conta?",
  "help.faq.tipNoAccount.a":
    "Podes <em>ouvir</em> um set de demonstração grátis, mas dar gorjeta exige uma conta, para que o dinheiro possa chegar ao artista e te seja emitido um recibo. O registo demora menos de um minuto e o primeiro mês é por nossa conta.",
  "help.faq.tipNotesPrivate.q": "As minhas notas de gorjeta são privadas?",
  "help.faq.tipNotesPrivate.a":
    "<strong>Sim, por defeito.</strong> Uma nota que escreves com uma gorjeta só é vista por ti e pelo artista. Podes optar por tornar as notas semipúblicas ou públicas em <a>Definições</a>, e mudar qualquer nota depois.",
  "help.faq.listeningHistory.q": "Guardam o meu histórico de audição?",
  "help.faq.listeningHistory.a":
    "Só se o ativares. Por defeito, <em>nada do que ouves sai do teu navegador</em>. Se ativares o histórico, é um registo privado que só tu vês, apagável num toque, sem modal de confirmação.",

  "help.faq.priceDiff.q": "Qual é a diferença entre €7 e €11?",
  "help.faq.priceDiff.a":
    "<strong>€7/mês</strong> é só a Studio. <strong>€11/mês</strong> é toda a cooperativa QueerPulse — Studio mais Cinema, Magazine, Encontros, grupos de leitura e um voto na assembleia anual. Uma só assinatura, todos os espaços. Muda de nível em qualquer mês.",
  "help.faq.cancel.q": "Como cancelo?",
  "help.faq.cancel.a":
    "Um clique em <a>Definições → Apagar e sair</a>. Sem chamada de retenção, sem ciclo de \"tens a certeza\", sem emails a insistir. Achamos que sair devia ser tão fácil como entrar — é a única forma honesta de te pedir para ficares.",
  "help.faq.dataSold.q": "Os meus dados são vendidos ou usados para treinar alguma coisa?",
  "help.faq.dataSold.a":
    "<strong>Nunca.</strong> Não vendemos, partilhamos, nem treinamos nada com o que ouves. As contagens agregadas de reproduções alimentam o livro-razão público, mas nada que te identifique. Todos os detalhes na página <a>confiança e termos</a>.",

  "help.faq.getPaid.q": "Quando e como sou pago?",
  "help.faq.getPaid.a":
    "Mensalmente, no dia 5, com um piso de €5. SEPA ou Stripe Connect. Vês a taxa por reprodução desse mês, os números de cada entrada no livro-razão e a divisão por lançamento. Quem colabora é pago <em>diretamente</em> — não há uma carteira do \"artista principal\". Consulta <a>Pagamentos</a>.",
  "help.faq.keepMasters.q": "Fico com os meus masters?",
  "help.faq.keepMasters.a":
    "<strong>Sempre.</strong> Ficas com os teus masters e com os teus direitos. Podes remover qualquer lançamento num processo de uma página, com 14 dias, sem ciclo de retenção — e as reproduções passadas continuam pagas. Consulta <a>Direitos e remoção</a>.",
  "help.faq.realisticEarn.q": "O que posso realisticamente ganhar?",
  "help.faq.realisticEarn.a":
    "Somos honestos quanto ao teto: cerca de €74/mês ocasional, €340/mês em crescimento, €1820/mês consolidado. A Studio não vai substituir um rendimento de digressão — mas pode substituir a renda. A explicação completa está em <a>Sobre a Studio</a>.",

  "help.stillStuck.title": "Ainda com <em>dúvidas</em>?",
  "help.statusOperational": "Todos os sistemas operacionais ·",

  "help.contact.email.title": "<em>Email</em> a uma pessoa",
  "help.contact.email.replyLine": "resposta dentro de um dia",
  "help.contact.email.action": "Enviar mensagem",
  "help.contact.email.toast": "A abrir o teu cliente de email…",
  "help.contact.forum.title": "Fórum da <em>comunidade</em>",
  "help.contact.forum.body": "Quem está na comunidade a ajudar quem está na comunidade <em>· sempre aberto</em>",
  "help.contact.forum.action": "Visitar o fórum",
  "help.contact.forum.toast": "A abrir o fórum…",
  "help.contact.access.title": "Reportar uma <em>barreira de acesso</em>",
  "help.contact.access.body": "Relatórios de tecnologia de apoio <em>passam à frente na fila</em>",
  "help.contact.access.action": "Acessibilidade →",

  // ── Kit de imprensa do artista (StudioPressPage + StudioPressBar) ─────────
  // Só chrome — a biografia, as citações e a ficha técnica são material de
  // imprensa da própria artista e ficam em inglês nos dois modos (§1).
  "press.copiedToast": "Copiado",
  "press.copyFailToast": "Não foi possível copiar",
  "press.downloadingPhotosToast": "A transferir fotos de imprensa · alta resolução",
  "press.downloadingPhotoToast": "A transferir foto · alta resolução",
  "press.accessRequestedToast": "Acesso de imprensa pedido — vamos verificar-te uma vez",
  "press.eyebrow": "Kit de imprensa gerado automaticamente · sempre atual",
  "press.fact.from": "De",
  "press.fact.pronouns": "Pronomes",
  "press.fact.since": "Desde",
  "press.fact.plays": "Reproduções",
  "press.fact.forFansOf": "Para quem gosta de",
  "press.section.preview": "Pré-visualização <em>reproduzível</em>",
  "press.fullPromoRequestedToast": "Promo completo pedido",
  "press.requestFullPromoCta": "Pedir o promo completo →",
  "press.playAria": "Reproduzir pré-visualização",
  "press.pauseAria": "Pausar pré-visualização",
  "press.watermarkedBadge": "Com marca de água",
  "press.previewNote":
    "Esta pré-visualização tem uma <em>marca de água inaudível</em> e uma identificação falada da QueerPulse no final. Para um master limpo para transmissão, pede o promo completo — verificamos a tua imprensa uma vez, e depois ficas autorizado para tudo.",
  "press.section.bio": "<em>Biografia</em>",
  "press.copyBothCta": "Copiar as duas →",
  "press.bio.shortLabel": "Curta · 40 palavras",
  "press.bio.longLabel": "Longa · 120 palavras",
  "press.section.photos": "Fotos de <em>imprensa</em>",
  "press.downloadAllCta": "Transferir tudo · alta resolução →",
  "press.downloadOneHint": "Transferir em alta resolução →",
  "press.section.release": "Último <em>lançamento</em>",
  "press.outNowBadge": "Já disponível",
  "press.section.press": "Imprensa <em>selecionada</em>",
  "press.section.boilerplate": "Factos e <em>ficha técnica</em>",
  "press.copyCta": "Copiar",
  "press.boilerplate.fullName": "Nome completo",
  "press.boilerplate.genre": "Género",
  "press.boilerplate.label": "Editora",
  "press.boilerplate.booking": "Contactos",
  "press.boilerplate.pronounce": "Pronúncia",
  "press.section.contactHeading": "Imprensa e <em>contactos</em>",
  "press.viewArtistCta": "Ver página do artista →",
  "press.requestAccessCta": "Pedir acesso de imprensa",
  "press.generatedFooter":
    "Gerado pela QueerPulse Studio · atualizado pela última vez a 10 jun. 2026 · esta página atualiza-se sozinha quando {name} lança algo novo",
  "press.bar.crumb": "Kit de imprensa · <em>{name}</em>",
  "press.bar.copyLinkCta": "Copiar link de imprensa",
  "press.bar.downloadAssetsCta": "Transferir recursos",
  "press.bar.copyLinkFailToast": "Não foi possível copiar o link",
  "press.bar.preparingToast": "A preparar os teus recursos de imprensa",

  // ── Confiança e termos (StudioTermsPage) ──────────────────────────────────
  "terms.eyebrow": "As letras miúdas, em português claro",
  "terms.hero.eyebrow": "Confiança e termos",
  "terms.hero.title": "O acordo, escrito para <em>conseguires mesmo lê-lo</em>.",
  "terms.hero.lede":
    "Os termos legais completos existem e foram escritos por um advogado. Mas aqui tens tudo em linguagem simples primeiro — <em>porque uma cooperativa que não consegues entender não é mesmo tua</em>.",

  "terms.deal.artists.title": "Os artistas ficam com <em>80%</em> e com os seus masters",
  "terms.deal.artists.body":
    "A divisão está no estatuto, não numa página de definições. <em>O piso pode subir, nunca descer</em> sem uma votação de dois terços.",
  "terms.deal.tips.title": "As gorjetas são <em>100%</em>, sempre",
  "terms.deal.tips.body":
    "Sem corte da plataforma nas gorjetas, nunca. Isto não está sujeito a votação — é uma cláusula fundadora.",
  "terms.deal.data.title": "Os teus dados <em>nunca</em> são vendidos",
  "terms.deal.data.body":
    "Não são vendidos, não são partilhados, não são usados para treinar nada. O histórico está desligado por defeito e é apagável num toque.",
  "terms.deal.leaving.title": "Sair é <em>uma página</em>",
  "terms.deal.leaving.body":
    "A remoção do teu trabalho demora 14 dias, e fechas a conta com um clique. As reproduções passadas continuam pagas de qualquer forma.",

  "terms.sec.deed.num": "01 — o estatuto da cooperativa",
  "terms.sec.deed.heading": "O que significa isto ser <em>teu</em>.",
  "terms.sec.deed.p1":
    "A QueerPulse Studio é uma cooperativa registada. As pessoas — quem ouve e quem faz música — são as proprietárias, não as clientes. Isto não é uma imagem de marca: é uma estrutura legal com um estatuto que podes ler, e que vincula quem a gere.",
  "terms.sec.deed.p2":
    "O estatuto fixa três coisas que quem está no comando <strong>não pode mudar em segredo</strong>: o piso de 80% para artistas, a passagem de 100% das gorjetas, e o livro-razão público. Baixar o piso exige uma maioria de dois terços de toda a cooperativa. O conselho é <em>eleito, com mandato limitado, e pago no livro-razão</em>. Não há ações de fundador nem veto de investidores.",
  "terms.sec.deed.pull":
    "Se alguma vez começarmos a agir como uma empresa que por acaso tem bons valores, o estatuto é aquilo a que nos podes obrigar.",
  "terms.sec.deed.footnote":
    "O estatuto completo e as contas anuais da cooperativa são publicados todos os anos junto com o <a>relatório de transparência</a>.",

  "terms.sec.licences.num": "02 — licenças",
  "terms.sec.licences.heading": "O que podes <em>fazer</em> com a música.",
  "terms.sec.licences.p1":
    "Cada lançamento indica a sua licença, escolhida pelo artista. Aqui está o que cada uma significa para ti como ouvinte — e para quem quiser reutilizar o trabalho num set, num filme, ou numa remistura.",
  "terms.sec.licences.footnote":
    "Os sets de DJ são especiais: um set pode incluir faixas com licenças diferentes, e o nosso sistema encaminha o pagamento de cada faixa para o seu próprio artista. <em>Covers são permitidos</em>; os direitos mecânicos são geridos através de um parceiro de cobrança português, e não pagamos sincronização — por isso, autorizar um cover para uso em filme é contigo.",

  "terms.licence.arr.title": "Todos os direitos <em>reservados</em>",
  "terms.licence.arr.row1": "Reproduzir e guardar",
  "terms.licence.arr.row2": "Comprar uma cópia para ficares com ela",
  "terms.licence.arr.row3": "Sem reutilização sem autorização",
  "terms.licence.ccByNc.title": "Crédito, <em>não comercial</em>",
  "terms.licence.ccByNc.row1": "Reutilizar em trabalho <em>não pago</em>",
  "terms.licence.ccByNc.row2": "Remisturar, com crédito",
  "terms.licence.ccByNc.row3": "Não para uso comercial",
  "terms.licence.ccBySa.title": "Crédito, <em>partilha-igual</em>",
  "terms.licence.ccBySa.row1": "Reutilizar em qualquer lugar, com crédito",
  "terms.licence.ccBySa.row2": "Uso comercial permitido",
  "terms.licence.ccBySa.row3": "Partilhar remisturas com a <em>mesma licença</em>",

  "terms.sec.privacy.num": "03 — privacidade, em resumo",
  "terms.sec.privacy.heading": "O que <em>guardamos</em>, e o que não guardamos.",
  "terms.sec.privacy.p1":
    "Guardamos a tua conta, as tuas gravações, os teus recibos, e o que ativares explicitamente. <strong>Não</strong> guardamos um perfil do teu gosto para vender, um histórico que não pediste que guardássemos, nem nada que déssemos a um anunciante — porque não temos anunciantes.",
  "terms.sec.privacy.footnote":
    "Contagens de reproduções agregadas e anónimas alimentam o livro-razão público, para que os artistas sejam pagos e os números sejam auditáveis. Podes exportar tudo o que guardamos, ou apagá-lo, em <a>Definições → Apagar e sair</a> — instantaneamente, sem modal, sem necessidade de desfazer porque falamos a sério.",

  "terms.longVersions.title": "As versões completas",
  "terms.longVersions.meta":
    "termos v3.2 · privacidade v2.1 · estatuto da cooperativa 2024 · última atualização a 2 jun. 2026",
  "terms.readFullTermsCta": "Ler os termos completos",
  "terms.readFullTermsToast": "A abrir os termos legais completos…",
  "terms.readDeedCta": "Ler o estatuto",
  "terms.readDeedToast": "A abrir o estatuto da cooperativa…",

  // ── Direitos e remoção (StudioRightsPage) ─────────────────────────────────
  // Só chrome — os títulos/metadados dos lançamentos abaixo são do próprio
  // artista e ficam em inglês nos dois modos (§1).
  "rights.promise.window.title": "Remoção em 14 dias",
  "rights.promise.window.body":
    "Confirma uma remoção e o lançamento deixa de estar disponível dentro de 14 dias — normalmente na mesma noite. As caches limpam-se, os links dão erro 404 para uma página cuidada.",
  "rights.promise.paid.title": "As reproduções passadas continuam pagas",
  "rights.promise.paid.body":
    "Cada audição até à remoção é paga no ciclo seguinte. Remover um trabalho nunca recupera dinheiro já ganho.",
  "rights.promise.banking.title": "A parte bancária não é afetada",
  "rights.promise.banking.body":
    "Uma remoção não é um encerramento de conta. Os teus dados SEPA, o teu calendário de pagamentos, as divisões com colaboradores — tudo continua ativo.",

  "rights.hero.eyebrow": "O teu trabalho · a tua decisão",
  "rights.hero.title": "Direitos e <em>remoção</em>.",
  "rights.hero.dek":
    "Uma só página. Os teus masters são teus — podes remover qualquer lançamento da Studio a qualquer momento, por qualquer razão ou nenhuma. Sem equipa de retenção, sem inquérito de saída, sem ciclo de \"tens a certeza\" pensado para te desgastar.",

  "rights.releases.heading": "Os teus <em>lançamentos</em>",
  "rights.releases.liveCount_one": "{count} ativo",
  "rights.releases.liveCount_other": "{count} ativos",
  "rights.releases.removingCount_one": "{count} em janela de remoção",
  "rights.releases.removingCount_other": "{count} em janela de remoção",

  "rights.removingStatus_one": "Em remoção · falta {count} dia",
  "rights.removingStatus_other": "Em remoção · faltam {count} dias",
  "rights.cancelRemovalCta": "Cancelar remoção",
  "rights.takeDownCta": "Remover",

  "rights.leavingCoop.title": "A sair da cooperativa <em>por completo</em>?",
  "rights.leavingCoop.body":
    "Esta página só remove lançamentos individuais. Para encerrar a tua conta de artista, terminar a tua contribuição de sustentador e pedir uma exportação completa dos teus dados, isso está em <a>Definições → Apagar e sair</a>. <em>Mesmo assim, os pagamentos passados ficam contigo</em> e vamos continuar a pagar quaisquer reproduções que já tenham acontecido.",

  "rights.takedownStartedToast": "«{title}» entra na janela de remoção de 14 dias",
  "rights.removalCancelledToast": "Remoção cancelada — o lançamento continua disponível",

  // ── Modal de confirmação de remoção (StudioTakedownModal) ─────────────────
  "rights.modal.confirmAria": "Confirmar remoção de {title}",
  "rights.modal.eyebrow": "Confirmar remoção",
  "rights.modal.title": "Remover <em>{title}</em>?",
  "rights.modal.body":
    "Vai deixar de estar disponível dentro de 14 dias. Os links existentes vão passar a mostrar uma pequena página «este trabalho foi retirado pelo artista». <em>Podes republicá-lo quando quiseres</em> — os teus masters nunca saem das tuas mãos.",
  "rights.modal.keepEarned":
    "<em>Ficas com tudo o que já ganhaste.</em> Este lançamento continua pago por cada reprodução até à remoção, no ciclo seguinte.",
  "rights.modal.confirmCta": "Remover →",
  "rights.modal.cancelCta": "Manter disponível",

  // ── Faixa "mais deste artista" no álbum (StudioAlbumMore) ─────────────────
  "album.more.heading": "Mais de <em>{artist}</em>",
  "album.more.artistPageCta": "Página do artista",

  // ── Prateleiras fora de antena (StudioOffAirShelves) ──────────────────────
  "offAir.carryOn.heading": "Continua onde <em>paraste</em>",
  "offAir.carryOn.sub": "Da tua biblioteca · continua a tocar, em transmissão ou não",
  "offAir.libraryCta": "Biblioteca",
  "offAir.perPlay": "por reprodução",
  "offAir.quietHours.heading": "Para as <em>horas mais calmas</em>",
  "offAir.quietHours.sub": "Coleções do conselho que não precisam de luzes acesas",
  "offAir.allCta": "Todas",

  // ── Página de lançamento removido (StudioWithdrawnPage) ───────────────────
  "withdrawn.hero.eyebrow": "Removido pelo artista",
  "withdrawn.hero.title": "Este trabalho foi <em>removido</em>.",
  "withdrawn.hero.sub":
    "O artista removeu-o da Studio — o direito é dele, a decisão é dele. <em>Não deve nenhuma explicação</em>, e não pedimos uma.",
  "withdrawn.card.title": "O que isto <em>significa</em>",
  "withdrawn.card.body":
    "Uma remoção não é uma eliminação do trabalho em si — os masters ficam com o artista, que pode republicá-lo quando quiser. Só significa que deixou de estar disponível aqui. Se o tivesses comprado ou guardado, continua na tua biblioteca como registo, marcado como removido.",
  "withdrawn.card.jadeLine":
    "Se deste uma gorjeta ou compraste isto, <em>cada cêntimo já chegou ao artista</em> e fica com ele. Nada é recuperado.",
  "withdrawn.visitArtistCta": "Ver a página do artista",
  "withdrawn.backToPlayerCta": "Voltar ao leitor",
  "withdrawn.still.heading": "Ainda <em>disponível</em> deste artista",
  "withdrawn.still.sub": "O que continua disponível, e o que o conselho programou em vez disso",

  // ── Cartão final para partilha social (StudioEndCardPage) ─────────────────
  "endCard.eyebrow": "Uma cooperativa de streaming",
  "endCard.tagline": "a música, <em>paga em frente.</em>",
  "endCard.paidThisMonth": "€11 940 pagos a artistas este mês",
  "endCard.perPlayLabel": "por reprodução",
  "endCard.perTipLabel": "de cada gorjeta",
  "endCard.listenCta": "ouve com orgulho",

  // ── Conselho de curadoria (StudioCouncilPage) ─────────────────────────────
  // Só chrome — os lugares/biografias/cadernos/seleções abaixo são o registo
  // de cada pessoa do conselho e ficam em inglês nos dois modos (§1).
  "council.hero.eyebrow": "Governação · o conselho",
  "council.hero.title": "Seis pessoas decidem o que a sala <em>ouve</em>.",
  "council.hero.dek":
    "Eleitas todos os anos pela assembleia, recebem uma ajuda de custo fixa registada no livro-razão público, com mandatos limitados a dois anos. Programam o set semanal, tratam da triagem e escrevem as notas. <em>Tudo o que escolhem leva o nome delas.</em>",
  "council.intro.lede":
    "O conselho não é um painel de bom-gosto atrás de vidro. Ouvem em público, <em>justificam cada escolha num parágrafo</em>, e respondem pela taxa. Podes ler os cadernos, ver as seleções, e votar para as substituir.",

  "council.fact.seats.value": "<em>6</em> lugares",
  "council.fact.seats.label": "mandatos de 2 anos · escalonados",
  "council.fact.stipend.value": "€<em>400</em>",
  "council.fact.stipend.label": "ajuda de custo mensal · no livro-razão",
  "council.fact.slates.value": "<em>52</em>",
  "council.fact.slates.label": "seleções programadas este ano",
  "council.fact.election.value": "<em>9 jun.</em>",
  "council.fact.election.label": "próxima eleição · assembleia",

  "council.notebookLabel": "Do caderno",
  "council.recentSlatesLabel": "Seleções recentes",
  "council.theirSlateCta": "Ver seleção",
};
