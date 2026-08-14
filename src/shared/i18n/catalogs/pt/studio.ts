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
  "room.hero.tipOnTop": "Queres dar mais? 100% para quem faz.",

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
    "A faixa, o set ou a página que procuravas nunca foi gravada, foi removida pelo artista, ou está atrás de um início de sessão. Sem drama. O catálogo é grande e a sala está quente.",
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
    "Um servidor do nosso lado falhou a meio da gravação. A tua conta, as tuas gravações e o pagamento a cada artista estão seguros. Isto é só o front of house. Espera um segundo e tenta outra vez.",
  "error500.tryAgainCta": "Tentar outra vez",
  "error500.backCta": "Voltar ao leitor",
  "error500.statusPrefix":
    "Todos os pagamentos e a parte bancária não foram afetados ·",
  "error500.refLine": "ref: {ref} · {timestamp} · o conselho já foi avisado",

  // ── Shell da página de marketing (StudioLandingShell) ─────────────────────
  "landing.nav.aboutCoop": "Sobre a cooperativa",
  "landing.nav.publicLedger": "Livro-razão público",
  "landing.nav.howItWorks": "Como funciona",
  "landing.nav.forArtists": "Para artistas",
  "landing.footer.tagline":
    "Uma rede profissional queer com raízes em Lisboa. A Studio é uma das suas salas, a par de Cinema, Magazine e Convívios.",
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
  "landing.footer.copyright": "© {year} QueerPulse Studio Co-op CRL, Lisboa",
  "landing.footer.languages": "EN · PT",

  // ── Hero de marketing (StudioLandingHero) ─────────────────────────────────
  "landing.hero.onAirNow": "No ar agora",
  "landing.hero.clock": "{weekday} · {time} Lisboa",
  "landing.hero.title": "Música, <em>programada</em> por ouvidos queer.",
  "landing.hero.dek":
    "Uma sala de streaming cooperativa. <em>{sharePercent}</em> de cada audição vai para o artista. <em>{tipPercent}</em> de cada gorjeta. O livro-razão é público. Quem cura tem nome. <em>Nenhum algoritmo alguma vez pôs aqui os pés.</em>",
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
    "«Fica até ao segundo verso da faixa seis. <em>O piano deixa-te ali de propósito.</em>» {attribution}, responsável pela programação",

  // ── As quatro promessas (StudioLandingPromises) ───────────────────────────
  "landing.promises.eyebrow": "O contrato · não o marketing",
  "landing.promises.title":
    "Quatro <em>promessas</em> que fazemos, a artistas e a quem ouve.",
  "landing.promises.share.title": "Uma parte justa e <em>visível</em>.",
  "landing.promises.share.body":
    "80% de cada audição vai para o artista. 100% de cada gorjeta. Os outros 20% cobrem pagamentos, alojamento, legendas, edição de partituras e ajudas de custo do conselho. A divisão está em cada página de artista, cada recibo, cada álbum.",
  "landing.promises.humans.title": "Uma sala <em>programada</em> por pessoas.",
  "landing.promises.humans.body":
    'Cada faixa na página principal tem o nome de quem a curou e uma nota de um parágrafo. Sem "popular perto de ti", sem "feito para ti", sem scroll infinito. A semana é pequena, feita à mão e datada.',
  "landing.promises.coOwned.title": "Co-propriedade de quem <em>ouve</em>.",
  "landing.promises.coOwned.body":
    "Sustentadores ({price}/mês) tornam-se sócios com voto na cooperativa ao fim de doze meses. Elegem o conselho, aprovam a tabela de valores e veem cada euro no livro-razão. A plataforma presta contas à sala.",
  "landing.promises.privacy.title": "Privacidade como <em>padrão</em>.",
  "landing.promises.privacy.body":
    "Nenhum dado de audição é vendido, distribuído ou usado para recomendar. O histórico pessoal de reprodução é privado e apagável num clique. Existem reproduções agregadas para o livro-razão; mais nada sai daqui.",

  // ── Contador do livro-razão público (StudioLandingCounter) ────────────────
  "landing.counter.liveEyebrow": "Ao vivo, atualizado em tempo real",
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
  "landing.compare.apple.ctx":
    "Ligeiramente melhor, ainda maioritariamente nominal",
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

  // ── Entrar / Junta-te (StudioSignInPage) ─────────────────────────────────
  "signin.tabs.signIn": "Entrar",
  "signin.tabs.join": "Junta-te",
  "signin.aside.onAirNow": "No ar agora · {count} na sala",
  "signin.aside.title":
    "Uma cooperativa de streaming que <em>paga</em> a quem fez a música.",
  "signin.aside.body":
    "Oitenta cêntimos de cada euro chegam ao artista. As gorjetas passam a <em>{tipPercent}</em>. O livro-razão é público, atualizado toda a segunda-feira ao meio-dia.",
  "signin.aside.paidThisMonth":
    "Pago a artistas este mês: <em>{amount}</em> · e a subir.",

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
  "signin.in.joinCta": "Junta-te à sala",
  "signin.in.freePrompt": "Só queres ouvir?",
  "signin.in.freeCta": "Ouve um set grátis, sem conta",
  "signin.in.signedInToast": "Sessão iniciada, bem-vinde de volta",
  "signin.in.signedInGoogleToast":
    "Sessão iniciada com o Google, bem-vinde de volta",

  "signin.join.title": "Junta-te à <em>sala.</em>",
  "signin.join.lede":
    "Escolhe quanto da cooperativa queres. Podes mudar de nível ou cancelar em qualquer mês: sem fidelização, sem emails a insistir.",
  "signin.join.chooseTier": "Escolhe o teu nível",
  "signin.join.tier.studio.title": "Só <em>Studio</em>",
  "signin.join.tier.studio.body":
    "Tudo na Studio: o set semanal do conselho, salas ao vivo, o catálogo completo, áudio sem perdas, subscrições diretas a artistas.",
  "signin.join.tier.studio.incl":
    "{sharePercent} da tua quota chega a artistas por reprodução",
  "signin.join.tier.coop.badge": "Melhor valor",
  "signin.join.tier.coop.title": "Toda a <em>cooperativa</em>",
  "signin.join.tier.coop.body":
    "Studio <em>mais</em> Cinema, Magazine, Convívios, grupos de leitura e um voto na assembleia anual. Uma só assinatura, toda a QueerPulse.",
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
    "Três coisas rápidas e o primeiro set é teu. <em>Podes saltar qualquer uma</em>. Nada disto fica fixo.",
  "welcome.step1.title": "Segue alguns <em>artistas</em>",
  "welcome.step1.dek":
    "Vamos mostrar-te primeiro os lançamentos deles. Escolhe três ou mais: <em>o conselho escolhe o resto</em>.",
  "welcome.step1.followedCount_one": "{count} a seguir",
  "welcome.step1.followedCount_other": "{count} a seguir",
  "welcome.nextCta": "Seguinte",
  "welcome.step2.title": "Define a tua <em>gorjeta</em> por omissão",
  "welcome.step2.dek":
    "Um toque no leitor envia isto diretamente ao artista: <em>100%, sem corte</em>. Muda quando quiseres.",
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
    "Um registo privado e apagável que só tu vês. Desligado por omissão: nada sai do teu navegador.",
  "welcome.step3.tipNotes.title": "Tornar públicas as minhas notas de gorjeta",
  "welcome.step3.tipNotes.body":
    "Desligado mantém cada nota entre ti e o artista. Podes mudar qualquer nota depois.",
  "welcome.step3.librarySync.title":
    "Sincronizar a minha biblioteca entre dispositivos",
  "welcome.step3.librarySync.body":
    "As gravações e os seguimentos acompanham-te. Ligado por omissão. Desliga para manter só neste dispositivo.",
  "welcome.enterRoomCta": "Entrar na sala",
  "welcome.readyToast": "A tua sala está pronta",

  // ── Sobre a cooperativa (StudioAboutPage + StudioAboutSections) ──────────
  "about.hero.eyebrow": "Sobre · escrito para quem duvida",
  "about.hero.title":
    "Uma cooperativa de streaming que <em>paga</em> a quem fez a música.",
  "about.hero.lede":
    "Já ouviste «pagamento justo para artistas» da parte de todas as plataformas que os pagam mal. Por isso, aqui tens a aritmética, a governação e o teto honesto: <em>sem slogans que não se consigam verificar.</em>",

  "about.sec.whatItIs.num": "01: o que é",
  "about.sec.whatItIs.heading":
    "Uma plataforma de audição, gerida como <em>cooperativa</em>.",
  "about.sec.whatItIs.p1":
    "A QueerPulse Studio pertence a quem a usa, quem ouve e quem faz música, juntos, não a acionistas nem a uma editora discográfica. <strong>Oitenta cêntimos de cada euro gerado por uma audição vão para o artista.</strong> Cada cêntimo de cada gorjeta, também. A divisão é pública, o catálogo é curado por um conselho eleito de seis pessoas, e os masters nunca saem das mãos de quem os fez.",
  "about.sec.whatItIs.p2":
    "É a terceira sala da cooperativa QueerPulse, depois da Magazine e do Cinema. Uma só assinatura cobre tudo. Podes ser pessoa da comunidade só pela escrita e nunca abrir a Studio; podes estar aqui só pela música e nunca ler uma palavra.",
  "about.sec.whatItIs.pull":
    "Não estamos a tentar ser um Spotify mais pequeno. Estamos a tentar ser uma <em>sala diferente</em>.",

  "about.sec.rate.num": "02: a taxa",
  "about.sec.rate.heading":
    "€0,05 por reprodução. Um <em>piso</em> a que estamos mesmo obrigados.",
  "about.sec.rate.p1":
    "Comprometemo-nos a <strong>€0,05 por reprodução válida</strong>: cerca de quinze vezes o que o Spotify paga. Uma reprodução válida tem pelo menos 30 segundos, com um limite de um pagamento por pessoa a ouvir, por dia, para que ninguém possa fazer batota. O piso pode subir por maioria simples na assembleia; só pode <em>descer</em> com maioria de dois terços. Na prática, isso significa que não desce.",
  "about.sec.rate.footnote":
    "Para comparação: a €0,003 por reprodução, uma música precisa de cerca de 330 000 reproduções para ganhar o que aqui ganha em 20 000. Não estamos a fingir que é uma diferença pequena.",

  "about.rate.cell.floor.value": "€<em>0,05</em>",
  "about.rate.cell.floor.label": "por reprodução válida · o piso",
  "about.rate.cell.share.value": "<em>80</em>%",
  "about.rate.cell.share.label":
    "da receita de subscrições para artistas, por reprodução",
  "about.rate.cell.tip.value": "<em>100</em>%",
  "about.rate.cell.tip.label":
    "de cada gorjeta, sem corte da plataforma, nunca",

  "about.sec.ceiling.num": "03: o que um artista pode realmente ganhar",
  "about.sec.ceiling.heading": "Honestos quanto ao <em>teto</em>.",
  "about.sec.ceiling.p1":
    "A maioria das páginas sobre a «economia de criadores» mostra-te o top 0,1% e deixa-te presumir que és tu. Aqui está o que a taxa realmente produz em quatro níveis reais de audição, e onde para.",

  "about.tier.casual.label": "Ocasional",
  "about.tier.casual.value": "74",
  "about.tier.casual.body":
    "1480 reproduções válidas: cerca de <em>75 pessoas a ouvir</em> uma faixa três vezes por semana. Dinheiro para um café, pago todos os meses.",
  "about.tier.building.label": "Em crescimento",
  "about.tier.building.value": "340",
  "about.tier.building.body":
    "6800 reproduções, duas gorjetas, uma compra de álbum. Um rendimento extra a sério, <em>quase dá para a renda</em> em Lisboa.",
  "about.tier.sustaining.label": "Consolidado",
  "about.tier.sustaining.value": "1820",
  "about.tier.sustaining.body":
    "36 000 reproduções, uma bolsa de gorjetas regular, uma sala ao vivo por mês. Abaixo do salário mediano português, e <em>12× o que o Spotify paga</em> pela mesma audição.",
  "about.tier.touring.label": "Artista em digressão",
  "about.tier.touring.body":
    "A Studio <em>não</em> vai substituir um rendimento de digressão, e não vamos fingir que consegue. Pode, plausivelmente, pagar a renda enquanto fazes a próxima coisa.",
  "about.tierFoot":
    "Isto não são projeções de um pitch deck. São a taxa real por reprodução do livro-razão ao vivo, multiplicada por contagens de reproduções honestas. <em>Os números reais são públicos, todas as segundas-feiras ao meio-dia.</em>",

  "about.sec.governance.num": "04: quem decide",
  "about.sec.governance.heading":
    "Um <em>conselho</em> eleito, com mandato limitado, registado publicamente.",
  "about.sec.governance.p1":
    "Seis pessoas programam o set semanal, tratam da triagem de submissões e escrevem um parágrafo a justificar cada escolha. São eleitas por toda a cooperativa na assembleia anual, recebem uma ajuda de custo fixa de €400/mês que aparece no livro-razão público, e têm mandatos limitados a dois anos com rotação obrigatória. <strong>Nenhum algoritmo decide quem é ouvido.</strong> É uma pessoa que decide, e assina o nome por baixo.",
  "about.sec.governance.p2":
    "O piso por audição e as percentagens da divisão são definidos anualmente por votação conjunta de sustentadores e artistas, com quórum de 20%. Se achas que a taxa está errada, não escreves ao apoio ao cliente. <em>Votas, ou candidatas-te.</em>",

  "about.sec.hardQuestions.num": "05: as perguntas difíceis",
  "about.sec.hardQuestions.heading": "As que estás <em>mesmo</em> a fazer.",

  "about.skeptic.broke.q":
    "Isto soa lindo e condenado ao fracasso. Como é que isto não vai à falência?",
  "about.skeptic.broke.a":
    "Sendo honestos, em baixa escala, o piso por audição é caro e uma faixa que rebente pode custar mais em largura de banda do que aquilo que gera. A nossa mitigação é aborrecida e pública: quem ouve de forma ocasional fica por defeito em AAC, fazemos cache de forma agressiva, e o livro-razão é reconciliado <em>diariamente</em>, para vermos o vermelho antes de ser uma crise.",
  "about.skeptic.clique.q": "Curadoria feita por seis pessoas soa a panelinha.",
  "about.skeptic.clique.a":
    "Pode tornar-se numa. Esse é o risco real. As salvaguardas são mandatos de dois anos, rotação obrigatória, e o facto de cada escolha ser publicada com um nome e uma razão. <em>Uma panelinha que tem de se justificar por escrito todas as semanas é uma panelinha mais fraca.</em>",
  "about.skeptic.clone.q":
    "Isto não é só um clone do Spotify com copy mais bonita?",
  "about.skeptic.clone.a":
    "Se a página principal fosse filas de capas de álbum quadradas, seria. O produto é editorial de propósito: um set semanal programado, salas de audição ao vivo, pagamentos visíveis em cada faixa. <em>Se algum dia parecermos um Spotify mais pequeno, cobra-nos este parágrafo.</em>",
  "about.skeptic.leave.q": "O que acontece à minha música se eu sair?",
  "about.skeptic.leave.a":
    "Ficas com os teus masters e com tudo o que ganhaste. A remoção é um processo de uma página, com 14 dias, sem ciclo de retenção. As reproduções passadas continuam pagas. Sair é tão fácil como entrar. Achamos que é a única forma honesta de te pedir para ficares.",

  "about.cta.title": "A sala é pequena, e <em>paga</em>.",
  "about.cta.body":
    "Ouve um set grátis, sem conta. Se for para ti, sustenta-a pelo preço de dois cafés.",
  "about.cta.join": "Junta-te à sala",
  "about.cta.ledger": "Ler o livro-razão público",

  // ── Acessibilidade (StudioAccessibilityPage) ──────────────────────────────
  "accessibility.hero.eyebrow": "Acessibilidade · a lista em construção",
  "accessibility.hero.title":
    "A música é para toda a gente, ou não é <em>música</em>.",
  "accessibility.hero.lede":
    "Isto é, ao mesmo tempo, uma declaração de intenção e uma lista de verificação viva do que já funciona mesmo hoje. Onde algo <em>ainda não</em> está feito, dizemo-lo. Preferimos ser honestos a parecer aspiracionais.",
  "accessibility.statement.p1":
    "A QueerPulse Studio compromete-se a cumprir a <em>WCAG 2.2 AA</em> em todas as superfícies, e a tratar a acessibilidade como um requisito de produto central, integrado desde o início. Pessoas surdas e com dificuldades auditivas devem poder usar uma plataforma de música. O mesmo vale para pessoas cegas e com baixa visão, pessoas que navegam pelo teclado, e pessoas que precisam de palavras na sua própria língua.",
  "accessibility.statement.p2":
    "Testamos com leitores de ecrã reais e pessoas reais (pagas, da nossa própria comunidade) em cada lançamento. <em>Se algo aqui não funcionar para ti, isso é um erro, e queremos o teu relatório.</em>",

  "accessibility.group.deaf.heading":
    "Para pessoas surdas e com <em>dificuldades auditivas</em>",
  "accessibility.group.deaf.dek":
    "Uma plataforma de música não pode fingir que toda a gente ouve da mesma forma. Por isso legendamos a conversa e mostramos as palavras.",
  "accessibility.item.captions.heading": "Salas <em>ao vivo</em> legendadas",
  "accessibility.item.captions.body":
    "Cada transmissão é legendada automaticamente em tempo real; as transmissões do conselho recebem uma <em>revisão humana</em>. A conversa entre músicas, as dedicatórias, os comentários do artista: tudo transcrito e com tamanho ajustável.",
  "accessibility.item.lyrics.heading": "Letras <em>sincronizadas</em>",
  "accessibility.item.lyrics.body":
    "Quando o artista as disponibiliza, as letras avançam ao ritmo da reprodução, com a linha atual destacada. Também podes lê-las como uma folha estática, em qualquer faixa.",
  "accessibility.item.waveforms.heading": "<em>Formas de onda</em> visuais",
  "accessibility.item.waveforms.body":
    "As salas ao vivo e as faixas mostram uma forma de onda em tempo real ligada ao áudio real, para que o ritmo e a dinâmica sejam visíveis além de audíveis.",
  "accessibility.item.signed.heading": "Transmissões <em>com intérprete</em>",
  "accessibility.item.signed.body":
    "As transmissões principais do conselho incluem uma janela de interpretação em Língua Gestual Portuguesa (LGP). A expandir para as salas semanais no próximo trimestre.",

  "accessibility.group.language.heading":
    "Para quem ouve em <em>qualquer língua</em>",
  "accessibility.group.language.dek":
    "O catálogo está sobretudo em português, com músicas numa dezena de outras línguas. As palavras não deviam ser uma barreira.",
  "accessibility.item.translation.heading": "<em>Tradução</em> de letras",
  "accessibility.item.translation.body":
    "As traduções feitas pela comunidade aparecem ao lado do original. Mostra uma, ou as duas ao mesmo tempo. Quem traduz é creditado e <em>pago pelo fundo de solidariedade</em>. Traduzir é trabalho.",
  "accessibility.item.interfaceLang.heading":
    "Interface na <em>tua língua</em>",
  "accessibility.item.interfaceLang.body":
    "A interface da Studio está disponível em português, inglês, espanhol e francês, com mais línguas à medida que a comunidade as traduz. Define-a em Definições → Legendas e letras.",

  "accessibility.group.lowVision.heading":
    "Para navegação por <em>baixa visão</em> e teclado",
  "accessibility.group.lowVision.dek":
    "Todo o leitor é operável sem rato, e o tema escuro foi construído para ter contraste claro além de atmosfera.",
  "accessibility.item.contrast.heading": "Contraste que <em>passa</em>",
  "accessibility.item.contrast.body":
    "O texto principal está a 4,5:1 ou melhor contra o roxo; os elementos interativos a um mínimo de 3:1, com um modo de alto contraste que reforça tudo ainda mais. Os anéis de foco estão sempre visíveis.",
  "accessibility.item.screenReader.heading":
    "Notas para leitor de ecrã no <em>leitor</em>",
  "accessibility.item.screenReader.body":
    "O leitor persistente anuncia a faixa, o artista, o tempo decorrido, e <em>quanto esta audição paga ao artista</em>. Dar gorjeta e guardar são botões com etiqueta; a lista de gorjetas ao vivo é uma região viva ARIA educada, de ritmo suave.",
  "accessibility.item.reducedMotion.heading":
    "Respeita o <em>movimento reduzido</em>",
  "accessibility.item.reducedMotion.body":
    "Toda a animação decorativa (o ponto pulsante, as formas de onda, as barras do equalizador) imobiliza-se quando o teu sistema pede movimento reduzido. Nada essencial se move.",

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
    "Conta-nos e vamos tratá-la como um erro a corrigir. Relatórios de pessoas que usam tecnologia de apoio passam à frente na fila: <em>hello@queerpulse.com</em>, ou assinala a partir do rodapé de qualquer página. Respondemos em dois dias úteis, com uma correção ou um prazo honesto.",
  "accessibility.contact.reportCta": "Reportar uma barreira de acesso",
  "accessibility.contact.reportToast":
    "Recebido. Vamos tratar isto como um erro",
  "accessibility.contact.meta":
    "Última auditoria: 2 jun. 2026 · WCAG 2.2 AA · NVDA, VoiceOver, TalkBack · próxima auditoria: set. 2026",

  // ── Ajuda e perguntas frequentes (StudioHelpPage + StudioHelpFaq) ─────────
  "help.hero.eyebrow": "Ajuda · pessoas reais, respostas reais",
  "help.hero.title": "Como podemos <em>ajudar</em>?",
  "help.hero.dek":
    "A maioria das respostas está abaixo. Se não estiver, uma pessoa lê cada mensagem. Não temos um labirinto de bots, nem existe um nível de apoio que tenhas de pagar.",
  "help.searchPlaceholder":
    "Pesquisar ajuda: gorjetas, pagamentos, qualidade de áudio…",
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
    "<strong>€7/mês</strong> é só a Studio. <strong>€11/mês</strong> é toda a cooperativa QueerPulse: Studio mais Cinema, Magazine, Convívios, grupos de leitura e um voto na assembleia anual. Uma só assinatura, todos os espaços. Muda de nível em qualquer mês.",
  "help.faq.cancel.q": "Como cancelo?",
  "help.faq.cancel.a":
    'Um clique em <a>Definições → Apagar e sair</a>. Sem chamada de retenção, sem ciclo de "tens a certeza", sem emails a insistir. Achamos que sair devia ser tão fácil como entrar. É a única forma honesta de te pedir para ficares.',
  "help.faq.dataSold.q":
    "Os meus dados são vendidos ou usados para treinar alguma coisa?",
  "help.faq.dataSold.a":
    "<strong>Nunca.</strong> Não vendemos, partilhamos, nem treinamos nada com o que ouves. As contagens agregadas de reproduções alimentam o livro-razão público, mas nada que te identifique. Todos os detalhes na página <a>confiança e termos</a>.",

  "help.faq.getPaid.q": "Quando e como sou pago?",
  "help.faq.getPaid.a":
    'Mensalmente, no dia 5, com um piso de €5. SEPA ou Stripe Connect. Vês a taxa por reprodução desse mês, os números de cada entrada no livro-razão e a divisão por lançamento. Quem colabora é pago <em>diretamente</em>. Não há uma carteira do "artista principal". Consulta <a>Pagamentos</a>.',
  "help.faq.keepMasters.q": "Fico com os meus masters?",
  "help.faq.keepMasters.a":
    "<strong>Sempre.</strong> Ficas com os teus masters e com os teus direitos. Podes remover qualquer lançamento num processo de uma página, com 14 dias, sem ciclo de retenção, e as reproduções passadas continuam pagas. Consulta <a>Direitos e remoção</a>.",
  "help.faq.realisticEarn.q": "O que posso realisticamente ganhar?",
  "help.faq.realisticEarn.a":
    "Somos honestos quanto ao teto: cerca de €74/mês ocasional, €340/mês em crescimento, €1820/mês consolidado. A Studio não vai substituir um rendimento de digressão, mas pode substituir a renda. A explicação completa está em <a>Sobre a Studio</a>.",

  "help.stillStuck.title": "Ainda com <em>dúvidas</em>?",
  "help.statusOperational": "Todos os sistemas operacionais ·",

  "help.contact.email.title": "<em>Email</em> a uma pessoa",
  "help.contact.email.replyLine": "resposta dentro de um dia",
  "help.contact.email.action": "Enviar mensagem",
  "help.contact.email.toast": "A abrir o teu cliente de email…",
  "help.contact.forum.title": "Fórum da <em>comunidade</em>",
  "help.contact.forum.body":
    "Quem está na comunidade a ajudar quem está na comunidade <em>· sempre aberto</em>",
  "help.contact.forum.action": "Visitar o fórum",
  "help.contact.forum.toast": "A abrir o fórum…",
  "help.contact.access.title": "Reportar uma <em>barreira de acesso</em>",
  "help.contact.access.body":
    "Relatórios de tecnologia de apoio <em>passam à frente na fila</em>",
  "help.contact.access.action": "Acessibilidade",

  // ── Kit de imprensa do artista (StudioPressPage + StudioPressBar) ─────────
  // Só chrome — a biografia, as citações e a ficha técnica são material de
  // imprensa da própria artista e ficam em inglês nos dois modos (§1).
  "press.copiedToast": "Copiado",
  "press.copyFailToast": "Não foi possível copiar",
  "press.downloadingPhotosToast":
    "A transferir fotos de imprensa · alta resolução",
  "press.downloadingPhotoToast": "A transferir foto · alta resolução",
  "press.accessRequestedToast":
    "Acesso de imprensa pedido. Vamos verificar-te uma vez",
  "press.eyebrow": "Kit de imprensa gerado automaticamente · sempre atual",
  "press.fact.from": "De",
  "press.fact.pronouns": "Pronomes",
  "press.fact.since": "Desde",
  "press.fact.plays": "Reproduções",
  "press.fact.forFansOf": "Para quem gosta de",
  "press.section.preview": "Pré-visualização <em>reproduzível</em>",
  "press.fullPromoRequestedToast": "Promo completo pedido",
  "press.requestFullPromoCta": "Pedir o promo completo",
  "press.playAria": "Reproduzir pré-visualização",
  "press.pauseAria": "Pausar pré-visualização",
  "press.watermarkedBadge": "Com marca de água",
  "press.previewNote":
    "Esta pré-visualização tem uma <em>marca de água inaudível</em> e uma identificação falada da QueerPulse no final. Para um master limpo para transmissão, pede o promo completo. Verificamos a tua imprensa uma vez, e depois ficas autorizado para tudo.",
  "press.section.bio": "<em>Biografia</em>",
  "press.copyBothCta": "Copiar as duas",
  "press.bio.shortLabel": "Curta · 40 palavras",
  "press.bio.longLabel": "Longa · 120 palavras",
  "press.section.photos": "Fotos de <em>imprensa</em>",
  "press.downloadAllCta": "Transferir tudo · alta resolução",
  "press.downloadOneHint": "Transferir em alta resolução",
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
  "press.viewArtistCta": "Ver página do artista",
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
  "terms.hero.title":
    "O acordo, escrito para <em>conseguires mesmo lê-lo</em>.",
  "terms.hero.lede":
    "Os termos legais completos existem e foram escritos por um advogado. Mas aqui tens tudo em linguagem simples primeiro: <em>porque uma cooperativa que não consegues entender não é mesmo tua</em>.",

  "terms.deal.artists.title":
    "Os artistas ficam com <em>80%</em> e com os seus masters",
  "terms.deal.artists.body":
    "A divisão vive no estatuto da cooperativa, vinculada por lei. <em>O piso sobe livremente e só pode descer com uma votação de dois terços.</em>",
  "terms.deal.tips.title": "As gorjetas são <em>100%</em>, sempre",
  "terms.deal.tips.body":
    "Sem corte da plataforma nas gorjetas, nunca. Isto não está sujeito a votação. É uma cláusula fundadora.",
  "terms.deal.data.title": "Os teus dados <em>nunca</em> são vendidos",
  "terms.deal.data.body":
    "Não são vendidos, não são partilhados, não são usados para treinar nada. O histórico está desligado por defeito e é apagável num toque.",
  "terms.deal.leaving.title": "Sair é <em>uma página</em>",
  "terms.deal.leaving.body":
    "A remoção do teu trabalho demora 14 dias, e fechas a conta com um clique. As reproduções passadas continuam pagas de qualquer forma.",

  "terms.sec.deed.num": "01: o estatuto da cooperativa",
  "terms.sec.deed.heading": "O que significa isto ser <em>teu</em>.",
  "terms.sec.deed.p1":
    "A QueerPulse Studio é uma cooperativa registada. As pessoas, quem ouve e quem faz música, são as suas proprietárias. Isto não é uma imagem de marca: é uma estrutura legal com um estatuto que podes ler, e que vincula quem a gere.",
  "terms.sec.deed.p2":
    "O estatuto fixa três coisas que quem está no comando <strong>não pode mudar em segredo</strong>: o piso de 80% para artistas, a passagem de 100% das gorjetas, e o livro-razão público. Baixar o piso exige uma maioria de dois terços de toda a cooperativa. O conselho é <em>eleito, com mandato limitado, e pago no livro-razão</em>. Não há ações de fundador nem veto de investidores.",
  "terms.sec.deed.pull":
    "Se alguma vez começarmos a agir como uma empresa que por acaso tem bons valores, o estatuto é aquilo a que nos podes obrigar.",
  "terms.sec.deed.footnote":
    "O estatuto completo e as contas anuais da cooperativa são publicados todos os anos junto com o <a>relatório de transparência</a>.",

  "terms.sec.licences.num": "02: licenças",
  "terms.sec.licences.heading": "O que podes <em>fazer</em> com a música.",
  "terms.sec.licences.p1":
    "Cada lançamento indica a sua licença, escolhida pelo artista. Aqui está o que cada uma significa para ti como ouvinte, e para quem quiser reutilizar o trabalho num set, num filme, ou numa remistura.",
  "terms.sec.licences.footnote":
    "Os sets de DJ são especiais: um set pode incluir faixas com licenças diferentes, e o nosso sistema encaminha o pagamento de cada faixa para o seu próprio artista. <em>Covers são permitidos</em>; os direitos mecânicos são geridos através de um parceiro de cobrança português, e não pagamos sincronização, por isso autorizar um cover para uso em filme é contigo.",

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
  "terms.licence.ccBySa.row3":
    "Partilhar remisturas com a <em>mesma licença</em>",

  "terms.sec.privacy.num": "03: privacidade, em resumo",
  "terms.sec.privacy.heading":
    "O que <em>guardamos</em>, e o que não guardamos.",
  "terms.sec.privacy.p1":
    "Guardamos a tua conta, as tuas gravações, os teus recibos, e o que ativares explicitamente. <strong>Não</strong> guardamos um perfil do teu gosto para vender, um histórico que não pediste que guardássemos, nem nada que déssemos a um anunciante, porque não temos anunciantes.",
  "terms.sec.privacy.footnote":
    "Contagens de reproduções agregadas e anónimas alimentam o livro-razão público, para que os artistas sejam pagos e os números sejam auditáveis. Podes exportar tudo o que guardamos, ou apagá-lo, em <a>Definições → Apagar e sair</a>: instantaneamente, sem modal, sem necessidade de desfazer porque falamos a sério.",

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
    "Confirma uma remoção e o lançamento deixa de estar disponível dentro de 14 dias, normalmente na mesma noite. As caches limpam-se, os links dão erro 404 para uma página cuidada.",
  "rights.promise.paid.title": "As reproduções passadas continuam pagas",
  "rights.promise.paid.body":
    "Cada audição até à remoção é paga no ciclo seguinte. Remover um trabalho nunca recupera dinheiro já ganho.",
  "rights.promise.banking.title": "A parte bancária não é afetada",
  "rights.promise.banking.body":
    "Uma remoção não é um encerramento de conta. Os teus dados SEPA, o teu calendário de pagamentos, as divisões com colaboradores: tudo continua ativo.",

  "rights.hero.eyebrow": "O teu trabalho · a tua decisão",
  "rights.hero.title": "Direitos e <em>remoção</em>.",
  "rights.hero.dek":
    'Uma só página. Os teus masters são teus. Podes remover qualquer lançamento da Studio a qualquer momento, por qualquer razão ou nenhuma. Sem equipa de retenção, sem inquérito de saída, sem ciclo de "tens a certeza" pensado para te desgastar.',

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

  "rights.takedownStartedToast":
    "«{title}» entra na janela de remoção de 14 dias",
  "rights.removalCancelledToast":
    "Remoção cancelada. O lançamento continua disponível",

  // ── Modal de confirmação de remoção (StudioTakedownModal) ─────────────────
  "rights.modal.confirmAria": "Confirmar remoção de {title}",
  "rights.modal.eyebrow": "Confirmar remoção",
  "rights.modal.title": "Remover <em>{title}</em>?",
  "rights.modal.body":
    "Vai deixar de estar disponível dentro de 14 dias. Os links existentes vão passar a mostrar uma pequena página «este trabalho foi retirado pelo artista». <em>Podes republicá-lo quando quiseres</em>. Os teus masters nunca saem das tuas mãos.",
  "rights.modal.keepEarned":
    "<em>Ficas com tudo o que já ganhaste.</em> Este lançamento continua pago por cada reprodução até à remoção, no ciclo seguinte.",
  "rights.modal.confirmCta": "Remover",
  "rights.modal.cancelCta": "Manter disponível",

  // ── Faixa "mais deste artista" no álbum (StudioAlbumMore) ─────────────────
  "album.more.heading": "Mais de <em>{artist}</em>",
  "album.more.artistPageCta": "Página do artista",

  // ── Chrome partilhado de hero/livro-razão (Álbum/Set — nomes masculinos em
  //    pt-PT; Faixa/Coleção reutilizam o room.hero.addedToast / removedToast
  //    feminino acima, por concordância de género) ───────────────────────────
  "detail.shareCta": "Partilhar",
  "detail.linkCopiedToast": "Link copiado para a área de transferência",
  "detail.copyFailedToast": "Não foi possível copiar o link",
  "detail.tipArtistCta": "Dar gorjeta a {artist}",
  "detail.fullLedgerCta": "Livro-razão completo",
  "detail.addedToast": "Adicionado à tua biblioteca",
  "detail.removedToast": "Removido da tua biblioteca",

  // ── Página da faixa (StudioTrackPage + Hero + Sidebar + Lyrics) ───────────
  "track.hero.eyebrow": "Faixa {current} de {total} · a tocar agora no set",
  "track.hero.payMonth": "<em>{amount}</em> para {artist} este mês",
  "track.inSet.status":
    "Estás a ouvir com <b>{count}</b> pessoas no <em>set de quarta-feira</em>, programado por {curator}. A faixa {next} começa dentro de <b>{countdown}</b>.",
  "track.inSet.joinCta": "Entrar na sala",
  "track.more.fullAlbumCta": "Álbum completo",
  "track.sidebar.curatorNoteLabel": "Nota de curadoria",
  "track.sidebar.splitHeading": "Para onde vai 1 € quando ouves isto",
  "track.sidebar.creditsHeading": "Créditos · divisão por faixa",
  "track.sidebar.leadSheetLabel": "Partitura",
  "track.sidebar.downloadCta": "Transferir",
  "track.lyrics.heading": "Letra & <em>tradução</em>",
  "track.lyrics.leadSheetChordsCta": "Partitura & acordes",

  // ── Página do álbum (StudioAlbumPage + Hero + Main + Sidebar) ─────────────
  "album.tabs.tracklist": "Faixas",
  "album.tabs.linerNotes": "Notas de encarte",
  "album.tabs.credits": "Créditos",
  "album.main.perPlaySuffix": "{amount} / reprodução",
  "album.sidebar.buyEyebrow": "A sala está aberta para ti",
  "album.sidebar.buySub": "Compra o álbum · guarda-o offline · FLAC + AAC.",
  "album.sidebar.buyCta": "Comprar · {amount}",
  "album.sidebar.payWhatYouCanCta": "Paga o que puderes · mínimo {amount}",
  "album.sidebar.streamingIncludedCta": "Streaming incluído se contribuíres",
  "album.sidebar.ledgerHeading":
    "Livro-razão público para <em>este lançamento</em>",
  "album.sidebar.paidToArtistLifetime": "Pago a {artist}, no total",
  "album.sidebar.paidToCollaborators": "Pago a colaboradores",
  "album.sidebar.playsThisMonth": "Reproduções este mês",

  // ── Perfil do artista (StudioArtistPage + Hero + Main + Sidebar) ──────────
  "artist.tabs.music": "Música",
  "artist.tabs.featuredIn": "Participações",
  "artist.tabs.sheetMusic": "Partituras",
  "artist.tabs.about": "Sobre",
  "artist.hero.followCta": "Seguir",
  "artist.hero.followingCta": "A seguir",
  "artist.hero.followedToast": "A seguir {artist}",
  "artist.hero.unfollowedToast": "Deixaste de seguir {artist}",
  "artist.hero.subscribeNote":
    "Subscreve por <em>{amount}/mês</em>, diretamente a {artist}, sem corte da plataforma.",
  "artist.hero.tipOnTopNote": "Ou dá uma gorjeta além do streaming.",
  "artist.main.releasesHeading": "Lançamentos",
  "artist.main.singlesHeading": "Singles & <em>avulsos</em>",
  "artist.sidebar.sustainEyebrow": "Contribui diretamente para {artist}",
  "artist.sidebar.sustainSub":
    "Diretamente para {artist}. Sem corte da plataforma. Quem subscreve tem acesso antecipado a faixas, a nota semanal e lugar em todas as transmissões ao vivo.",
  "artist.sidebar.subscribeCta": "Subscrever · {amount}/mês",
  "artist.sidebar.oneOffTipCta": "Gorjeta pontual",
  "artist.sidebar.thisMonthHeading": "{artist} · este mês",
  "artist.sidebar.plays": "Reproduções",
  "artist.sidebar.earningsStreaming": "Receita (streaming)",
  "artist.sidebar.tipsReceived": "Gorjetas recebidas",
  "artist.sidebar.directSubscribers": "Subscrições diretas",
  "artist.sidebar.upcomingHeading": "Em breve",
  "artist.sidebar.premiereLabel": "Estreia",
  "artist.sidebar.rsvpCta": "Confirmar presença",

  // ── Página do set ao vivo (StudioSetPage) ─────────────────────────────────
  "set.page.playAria": "Reproduzir o set",
  "set.page.joinLiveRoomCta": "Entrar na sala ao vivo",
  "set.page.tracklistHeading": "A <em>lista de faixas</em>",
  "set.page.everyPlayPaysNote": "Cada reprodução paga o artista",
  "set.page.payingNowLabel": "a pagar agora",

  // ── Página da coleção (StudioCollectionPage) ──────────────────────────────
  "collection.page.playAria": "Reproduzir a coleção",
  "collection.page.shuffleCta": "Aleatório",
  "collection.page.shufflingToast": "A reproduzir a coleção em modo aleatório",
  "collection.page.allPlaysPaidNote": "pago aos artistas em cada audição",
  "collection.page.inThisCollectionHeading": "Nesta <em>coleção</em>",
  "collection.page.findMoreCta": "Encontrar mais",
  "collection.page.relatedHeading": "Coleções <em>relacionadas</em>",

  // ── Prateleiras fora de antena (StudioOffAirShelves) ──────────────────────
  "offAir.carryOn.heading": "Continua onde <em>paraste</em>",
  "offAir.carryOn.sub":
    "Da tua biblioteca · continua a tocar, em transmissão ou não",
  "offAir.libraryCta": "Biblioteca",
  "offAir.perPlay": "por reprodução",
  "offAir.quietHours.heading": "Para as <em>horas mais calmas</em>",
  "offAir.quietHours.sub":
    "Coleções do conselho que não precisam de luzes acesas",
  "offAir.allCta": "Todas",

  // ── Página de lançamento removido (StudioWithdrawnPage) ───────────────────
  "withdrawn.hero.eyebrow": "Removido pelo artista",
  "withdrawn.hero.title": "Este trabalho foi <em>removido</em>.",
  "withdrawn.hero.sub":
    "O artista removeu-o da Studio: o direito é dele, a decisão é dele. <em>Não deve nenhuma explicação</em>, e não pedimos uma.",
  "withdrawn.card.title": "O que isto <em>significa</em>",
  "withdrawn.card.body":
    "Uma remoção não é uma eliminação do trabalho em si. Os masters ficam com o artista, que pode republicá-lo quando quiser. Só significa que deixou de estar disponível aqui. Se o tivesses comprado ou guardado, continua na tua biblioteca como registo, marcado como removido.",
  "withdrawn.card.jadeLine":
    "Se deste uma gorjeta ou compraste isto, <em>cada cêntimo já chegou ao artista</em> e fica com ele. Nada é recuperado.",
  "withdrawn.visitArtistCta": "Ver a página do artista",
  "withdrawn.backToPlayerCta": "Voltar ao leitor",
  "withdrawn.still.heading": "Ainda <em>disponível</em> deste artista",
  "withdrawn.still.sub":
    "O que continua disponível, e o que o conselho programou em vez disso",

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

  // ── Definições (StudioSettingsPage + Controls + Sections) ─────────────────
  "settings.eyebrow": "A tua sala · definições",
  "settings.title": "Como a sala te <em>trata</em>.",
  "settings.dek":
    "Áudio, privacidade, legendas, gorjetas. Nada aqui está ativo a menos que o ligues, e o que ligares, podes apagar com <em>um toque, sem modal de confirmação</em>.",

  "settings.audio.label": "Áudio",
  "settings.audio.title": "Qualidade de <em>som</em>",
  "settings.audio.dek":
    "FLAC é sem perdas e maior; AAC pesa menos dados. Reprodução e transferências podem diferir. Escolhe por contexto.",
  "settings.audio.streamQuality.heading": "Qualidade de reprodução por defeito",
  "settings.audio.streamQuality.body":
    "Numa boa ligação, vamos tão alto quanto permitires. Nunca subimos a qualidade em dados móveis sem perguntar.",
  "settings.audio.streamQuality.flac.label": "FLAC · 24/48",
  "settings.audio.streamQuality.flac.badge": "sem perdas",
  "settings.audio.streamQuality.flac.sub":
    "O master, sem alterações. ~25 MB / faixa.",
  "settings.audio.streamQuality.aac.label": "AAC · 256kbps",
  "settings.audio.streamQuality.aac.sub":
    "Transparente para a maioria dos ouvidos. ~7 MB / faixa.",
  "settings.audio.downloadQuality.heading": "Qualidade de transferência",
  "settings.audio.downloadQuality.body":
    "O que guardamos quando gravas uma faixa offline (só sustentadores).",
  "settings.audio.normalise.heading": "Normalizar o volume",
  "settings.audio.normalise.body":
    "Equilibra o volume entre faixas e sets. <em>Desliga</em> se quiseres a dinâmica original do artista.",
  "settings.audio.crossfade.heading": "Fundido entre faixas num set",
  "settings.audio.crossfade.body":
    "Só se aplica dentro de sets de DJ e salas ao vivo, nunca na reprodução de álbuns.",

  "settings.privacy.label": "Privacidade",
  "settings.privacy.title": "O que a sala <em>guarda</em>",
  "settings.privacy.dek":
    "Em resumo: quase nada, por defeito. Nunca vendemos, partilhamos ou treinamos com o que ouves. As reproduções agregadas alimentam o livro-razão público, nada que te identifique.",
  "settings.privacy.history.heading": "Histórico de audição",
  "settings.privacy.history.body":
    "Desligado por defeito: nada do que ouves sai do teu navegador. Liga para um registo privado e apagável que só tu vês.",
  "settings.privacy.cloudSync.heading": "Sincronizar a biblioteca na nuvem",
  "settings.privacy.cloudSync.body":
    "As gravações e os seguimentos passam entre dispositivos. Sem isto, ficam só neste dispositivo.",
  "settings.privacy.tipNotes.heading": "Notas de gorjeta: quem as vê",
  "settings.privacy.tipNotes.body":
    "A nota que escreves ao dar uma gorjeta. <em>Privado é a predefinição</em>: só tu e o artista a leem.",
  "settings.privacy.tipNotes.private.label": "Privado",
  "settings.privacy.tipNotes.private.badge": "predefinição",
  "settings.privacy.tipNotes.private.sub":
    "Só tu e o artista. Nunca aparece na página dele nem no teu recibo público.",
  "settings.privacy.tipNotes.semi.label": "Semipúblico",
  "settings.privacy.tipNotes.semi.sub":
    "Visível para outros sustentadores desse artista, atribuído ao teu nome de utilizador.",
  "settings.privacy.tipNotes.public.label": "Público",
  "settings.privacy.tipNotes.public.sub":
    "Qualquer pessoa pode ler na página do artista. Ainda podes ocultar qualquer nota depois.",
  "settings.privacy.tipReceipts.heading": "Recibos de gorjeta públicos",
  "settings.privacy.tipReceipts.body":
    'Cada gorjeta gera um recibo com a divisão, sem dados pessoais. Ligado, pode ser partilhado como um cartão "olha o que a sala pagou a este artista".',

  "settings.captions.label": "Legendas e letras",
  "settings.captions.title": "Palavras no <em>ecrã</em>",
  "settings.captions.dek":
    "As salas ao vivo têm legendas (automáticas, com revisão humana nas transmissões do conselho). As letras avançam ao ritmo da faixa quando o artista as fornece.",
  "settings.captions.showCaptions.heading":
    "Mostrar legendas nas salas ao vivo",
  "settings.captions.showCaptions.body":
    "A conversa entre músicas, transcrita. <em>Ligado</em> por defeito em todas as transmissões.",
  "settings.captions.captionSize.heading": "Tamanho das legendas",
  "settings.captions.captionSize.body":
    "Que tamanho têm as legendas e a linha de letra em avanço.",
  "settings.captions.lyricLanguage.heading": "Idioma da letra",
  "settings.captions.lyricLanguage.body":
    "Mostra as letras no original, ou numa tradução da comunidade quando existir.",
  "settings.captions.lyricLanguage.opt.original": "Original (como gravado)",
  "settings.captions.lyricLanguage.opt.english": "Tradução em inglês",
  "settings.captions.lyricLanguage.opt.portuguese": "Português",
  "settings.captions.lyricLanguage.opt.spanish": "Español",
  "settings.captions.lyricLanguage.opt.french": "Français",
  "settings.captions.showBoth.heading": "Mostrar original e tradução",
  "settings.captions.showBoth.body":
    "Duas linhas ao mesmo tempo, o original por cima da tradução.",

  "settings.tipping.label": "Gorjetas",
  "settings.tipping.title": "A tua <em>gorjeta</em> por defeito",
  "settings.tipping.dek":
    "O que o botão de gorjeta rápida envia. 100% chega ao artista. Nunca há corte da plataforma nas gorjetas.",
  "settings.tipping.defaultAmount.heading": "Valor por defeito",
  "settings.tipping.defaultAmount.body":
    "Podes sempre escolher outro valor no momento de dar a gorjeta.",
  "settings.tipping.roundUp.heading":
    "Arredondar compras de álbuns para uma gorjeta",
  "settings.tipping.roundUp.body":
    "Um álbum de {albumPrice} passa a {roundedPrice}, e os {tipAmount} vão para o artista como gorjeta.",

  "settings.erase.label": "Apagar e sair",
  "settings.erase.title": "Um toque, <em>sem perguntas</em>",
  "settings.erase.dek":
    "Isto não pergunta duas vezes nem mostra um modal. Falamos a sério: sair devia ser tão fácil como entrar.",
  "settings.erase.history.heading": "Apagar o meu histórico de audição",
  "settings.erase.history.note":
    "Apaga o registo privado deste dispositivo e da nuvem. <em>Feito na hora. Sem desfazer.</em>",
  "settings.erase.history.cta": "Apagar histórico",
  "settings.erase.history.toast":
    "Histórico apagado. Já não está neste dispositivo nem na nuvem.",
  "settings.erase.export.heading": "Transferir tudo o que guardamos sobre ti",
  "settings.erase.export.note":
    "Um ficheiro JSON com as tuas gravações, gorjetas, recibos e definições, enviado por email dentro de uma hora.",
  "settings.erase.export.cta": "Pedir exportação",
  "settings.erase.export.toast":
    "Vamos enviar-te a exportação dos teus dados dentro de uma hora.",
  "settings.erase.closeAccount.heading": "Encerrar a minha conta Studio",
  "settings.erase.closeAccount.note":
    "Termina a tua contribuição de sustentador, remove a tua biblioteca. As gorjetas passadas continuam pagas aos artistas. <em>A parte bancária, se também és artista, não é afetada.</em>",
  "settings.erase.closeAccount.cta": "Encerrar conta",
  "settings.erase.closeAccount.toast":
    "O encerramento da conta abre num fluxo à parte.",

  // ── Notificações (StudioNotificationsPage) ────────────────────────────────
  // Só chrome — os nomes/faixas/citações de cada notificação abaixo são
  // conteúdo, vindo da API em modo real, e ficam em inglês nos dois modos (§1).
  "notifications.eyebrow":
    "A tua sala · o que aconteceu enquanto estiveste fora",
  "notifications.title": "A sala esteve <em>ocupada</em>.",
  "notifications.dek":
    "Respostas a gorjetas de artistas, novos lançamentos de quem segues, salas ao vivo prestes a abrir. <em>Só as coisas que pediste para ouvir</em>. Ajusta isso nas Definições.",
  "notifications.filter.all": "Tudo",
  "notifications.filter.reply": "Respostas",
  "notifications.filter.release": "Lançamentos",
  "notifications.filter.live": "Ao vivo",
  "notifications.markAllReadCta": "Marcar tudo como lido",
  "notifications.markAllReadToast": "Tudo em dia",
  "notifications.empty":
    "Nada <em>desse género</em> por agora. Quando acontecer, aparece aqui. O silêncio é permitido.",
  "notifications.day.today": "Hoje",
  "notifications.day.week": "Esta semana",
  "notifications.action.joinRoom": "Juntar-te à sala",
  "notifications.action.rsvp": "Confirmar presença",

  // ── Modal de gorjeta (StudioTipModal — reutilizado em várias páginas) ─────
  "tipModal.dialogAria": "Dar uma gorjeta a {recipient}",
  "tipModal.closeAria": "Fechar",
  "tipModal.eyebrow": "Gorjeta · 100% para o artista",
  "tipModal.title": "Dar uma gorjeta a <em>{recipient}</em>",
  "tipModal.sub":
    "As gorjetas passam sem retenções: cada cêntimo chega a {recipient}.",
  "tipModal.customPlaceholder": "Outro valor",
  "tipModal.sendingCta": "A enviar…",
  "tipModal.sendCta": "Dar {amount}",
  "tipModal.note":
    "Paga a {recipient} para além da reprodução · <em>nada é retido</em>",
  "tipModal.success.title":
    "Obrigade. Foram <em>{amount}</em> para {recipient}.",
  "tipModal.success.body":
    "100% da tua gorjeta chega a {recipient} diretamente. Sem corte da plataforma, sem processamento retido.",
  "tipModal.success.backCta": "Voltar à música",

  // ── Navegação do back-office de criação (StudioCreatorShell) ──────────────
  "creator.nav.dashboard": "Painel",
  "creator.nav.newRelease": "Novo lançamento",
  "creator.nav.payouts": "Pagamentos",
  "creator.product": "Criação",
  "creator.viewPublicPageCta": "Ver página pública",

  // ── A tua biblioteca (StudioLibraryPage) ──────────────────────────────────
  // Só chrome — os títulos de álbuns/sets/faixas/coleções e nomes de artistas
  // na biblioteca fictícia abaixo são conteúdo e ficam em inglês nos dois
  // modos (§1).
  "library.eyebrow": "A tua biblioteca",
  "library.title": "Tudo o que <em>guardaste.</em>",
  "library.dek":
    "Álbuns, sets e faixas guardados, além dos <em>{amount}</em> que já pagaste a {artistCount} artistas este ano só por ouvires aqui.",
  "library.tabs.albums": "Álbuns",
  "library.tabs.sets": "Sets",
  "library.tabs.collections": "Coleções",
  "library.tabs.tracks": "Faixas",
  "library.category.albums": "álbuns",
  "library.category.sets": "sets",
  "library.category.collections": "coleções",
  "library.category.tracks": "faixas",
  "library.empty.title": "A tua biblioteca está vazia aqui",
  "library.empty.description":
    "Ainda nada em <em>{category}</em>. Explora a Studio, e tudo o que guardares aparece aqui, para voltares quando quiseres.",
  "library.empty.browseCta": "Explorar a Studio",
  "library.empty.searchCta": "Pesquisar o catálogo",

  // ── Pesquisa (StudioSearchPage) ────────────────────────────────────────────
  // Só chrome — os títulos de resultados/nomes de artistas/termos de pesquisa
  // recente abaixo são conteúdo (ou, no caso das pesquisas recentes, o
  // histórico da própria pessoa em modo real) e ficam em inglês nos dois
  // modos (§1).
  "search.eyebrow": "Pesquisar o catálogo",
  "search.title": "Encontra o <em>som.</em>",
  "search.inputPlaceholder": "Artistas, álbuns, sets, partituras…",
  "search.filter.everything": "Tudo",
  "search.filter.artists": "Artistas",
  "search.filter.albums": "Álbuns",
  "search.filter.sets": "Sets",
  "search.filter.collections": "Coleções",
  "search.filter.sheetMusic": "Partituras",
  "search.results.forQuery": "Resultados para <em>{query}</em>",
  "search.results.featuredNow": "Em destaque <em>agora</em>",
  "search.empty.title": "Nada correspondeu a isso",
  "search.empty.description":
    "Não encontrámos nada para <em>{term}</em>. Tenta outra palavra, ou alarga o filtro. O catálogo é maior do que parece.",
  "search.empty.clearCta": "Limpar pesquisa",

  // ── Painel de criação (StudioDashboardPage + Charts + Side) ───────────────
  // Só chrome — o nome do artista, títulos de faixas, números por artista
  // (STATS/CURATORS/CITIES/BARS em studioDashboard.data) e os planos
  // concretos de sala ao vivo/pagamento abaixo são dados deste artista,
  // vindos da API em modo real, e ficam em inglês nos dois modos (§1).
  "dashboard.hero.eyebrow": "Studio · este mês",
  "dashboard.hero.title": "Boa semana, <em>{name}</em>.",
  "dashboard.hero.sub":
    "<em>{trackTitle}</em> já tem dois meses e continua a subir. Os curadores mantiveram-na na rotação.",

  "dashboard.stats.playsThisMonth": "Reproduções · este mês",
  "dashboard.stats.streamingEarnings": "Receita de reprodução",
  "dashboard.stats.tipsReceived": "Gorjetas recebidas",
  "dashboard.stats.nextPayout": "Próximo pagamento · {date}",

  "dashboard.charts.dailyPlays.heading":
    "Reproduções diárias · <em>últimos 14 dias</em>",
  "dashboard.charts.curators.heading":
    "Curadoria e <em>seleções</em> · o que deu visibilidade ao teu trabalho esta semana",
  "dashboard.charts.geography.heading": "De onde <em>ouvem</em>",
  "dashboard.charts.geography.hint":
    "Só ao nível da cidade · nunca vemos a rua nem nada mais fino. <em>É o máximo que alguma vez te diremos sobre quem ouve.</em>",

  "dashboard.side.quickActions.heading": "O que podes <em>fazer</em> daqui",
  "dashboard.side.quickActions.upload.label": "Carregar um novo lançamento",
  "dashboard.side.quickActions.upload.hint":
    "WAV / FLAC · 3 passos · 8 minutos",
  "dashboard.side.quickActions.goLive.label":
    "Ficar ao vivo: organizar uma sala de audição",
  "dashboard.side.quickActions.payouts.label":
    "Ver pagamentos e dados bancários",
  "dashboard.side.deal.eyebrow": "O acordo, sempre",
  "dashboard.side.deal.heading": "80% para <em>ti.</em>",
  "dashboard.side.deal.body":
    "Cada reprodução, cada gorjeta, cada compra. A divisão é igual para um primeiro lançamento ou para quem vence um festival, e está impressa no livro-razão público.",
  "dashboard.side.deal.perPlay.label": "Por reprodução",
  "dashboard.side.deal.yourShare.label": "A tua parte",
  "dashboard.side.deal.tips.label": "Gorjetas",
  "dashboard.side.deal.tips.value": "100% para ti",

  // ── Assistente de carregamento (StudioUploadPage + Sections) ──────────────
  // Só chrome — os nomes dos ficheiros carregados, os detalhes de validação
  // da imagem, o título/género deste lançamento e os nomes/funções dos
  // colaboradores abaixo são dados deste lançamento do artista, vindos da
  // API em modo real, e ficam em inglês nos dois modos (§1).
  "upload.hero.eyebrow": "Novo lançamento · carregar",
  "upload.hero.title": "Traz isto para <em>casa.</em>",
  "upload.hero.sub":
    "Larga os masters. Nós convertemos, tu ficas com os originais. Três passos, cerca de oito minutos.",

  "upload.steps.files.nm": "Ficheiros",
  "upload.steps.files.sub": "· WAV / FLAC · capa · letras",
  "upload.steps.metadata.nm": "Metadados e créditos",
  "upload.steps.metadata.sub": "· título · ano · divisões por faixa",
  "upload.steps.licence.nm": "Licença e lançamento",
  "upload.steps.licence.sub": "· CC / ARR · preço · data de publicação",

  "upload.dropzone.title":
    "Larga uma pasta de <em>WAVs</em>, ou clica para procurar.",
  "upload.dropzone.body":
    "Um EP, um álbum, um single: o mesmo fluxo. Descobrimos a ordem das faixas a partir dos nomes dos ficheiros.",
  "upload.dropzone.accepts":
    "aceita · <em>WAV · FLAC · AIFF</em> · máx. 96 kHz / 24 bit · até 24 faixas",

  "upload.files.heading":
    "Carregados <em>{readyCount} de {totalCount} prontos</em>",
  "upload.files.okReady": "OK · pronto",
  "upload.files.loudnessCheck": "Verificação de volume",
  "upload.files.loudWarning.title": "A faixa {trackNumber} está alta.",
  "upload.files.loudWarning.body":
    "O master vem a {measuredLoudness}. O nosso limiar por defeito é {targetLoudness}. <em>Isto não é fatal:</em> podemos normalizar em tempo real por ouvinte. Se pretendias este pico, deixa como está.",
  "upload.files.loudToggle.show": "O que fazemos com masters altos",
  "upload.files.loudToggle.hide": "O que fazemos com masters altos",
  "upload.files.loudExplainer":
    "Guardamos o teu master <em>exatamente como foi entregue</em> e sem alterações. Na reprodução, aplicamos normalização de volume por ouvinte a cerca de −14 LUFS, para que a tua faixa fique num nível confortável ao lado de tudo o resto num set, <em>sem recodificar nem cortar o teu ficheiro</em>. Quem desliga a normalização nas definições ouve o teu pico original. Nada fica fixo; podes mudar o alvo ou desativar por lançamento a qualquer momento.",

  "upload.coverArt.heading":
    "Capa <em>{readyCount} de {totalCount} · validada</em>",

  "upload.splits.heading":
    "Divisões <em>por faixa</em> · 100% para ti por defeito",
  "upload.splits.sub":
    "Adiciona colaboradores e encaminhamos cada cêntimo diretamente para o banco deles.",
  "upload.splits.table.collaborator": "Colaborador",
  "upload.splits.table.roleTracks": "Função · faixas",
  "upload.splits.table.share": "Parte",
  "upload.splits.footer":
    "A divisão por defeito soma {total} · ajustes por faixa sobrepõem-se",
  "upload.splits.addCollaboratorCta": "Adicionar colaborador",
  "upload.splits.handlePlaceholder": "Utilizador QP ou email",
  "upload.splits.inviteCta": "Convidar",
  "upload.splits.invitedToast": "{handle} convidade para as divisões",
  "upload.splits.invitedSubLabel": "convidade · IBAN pendente",
  "upload.splits.invitedRole": "colaborador · todas as faixas",

  "upload.side.files.eyebrow": "O que fazemos com os teus ficheiros",
  "upload.side.files.title": "Teus, <em>na mesma</em>.",
  "upload.side.files.body":
    "Tu largas os masters; nós convertemos e transmitimos. O teu WAV / FLAC original continua a ser teu. Guardamos uma cópia <em>só</em> para entrega. A remoção apaga a cópia de reprodução em 14 dias. Não exclusivo, sempre.",
  "upload.side.files.list.sourceKept.label": "Fonte guardada",
  "upload.side.files.list.sourceKept.value": "o teu ficheiro, sem alterações",
  "upload.side.files.list.listenerDelivery.label": "Entrega ao ouvinte",
  "upload.side.files.list.listenerDelivery.value": "FLAC + AAC 256",
  "upload.side.files.list.loudnessTarget.label": "Alvo de volume",
  "upload.side.files.list.loudnessTarget.value": "−14 LUFS",
  "upload.side.files.list.isrc.label": "Atribuição de ISRC",
  "upload.side.files.list.isrc.value": "automática",

  "upload.side.lyrics.eyebrow": "Letras e traduções",
  "upload.side.lyrics.title": "Letras <em>obrigatórias</em>, traduções pagas.",
  "upload.side.lyrics.body":
    "Carrega as letras em qualquer idioma. Para uma tradução linha a linha, o fundo de solidariedade paga <em>€40 por música</em> a quem traduz na comunidade. Mantêm a assinatura; tu aprovas antes de publicar.",
  "upload.side.lyrics.list.autoTranscribe.label": "Transcrição automática",
  "upload.side.lyrics.list.autoTranscribe.value": "grátis · ~94%",
  "upload.side.lyrics.list.communityTranslation.label":
    "Tradução da comunidade",
  "upload.side.lyrics.list.communityTranslation.value": "€40 → tradutor(a)",
  "upload.side.lyrics.list.approval.label": "A tua aprovação",
  "upload.side.lyrics.list.approval.value": "antes de publicar",

  "upload.metadata.heading": "Metadados e <em>créditos</em>",
  "upload.metadata.sub":
    "Mais alguns detalhes e o teu lançamento segue para a fila de revisão do conselho.",
  "upload.metadata.field.title": "Título do lançamento",
  "upload.metadata.field.year": "Ano de lançamento",
  "upload.metadata.field.genre": "Género principal",
  "upload.metadata.genre.fado": "Fado / contemporâneo",
  "upload.metadata.genre.electronic": "Eletrónica",
  "upload.metadata.genre.folk": "Folk",
  "upload.metadata.genre.experimental": "Experimental",
  "upload.metadata.backCta": "Voltar aos ficheiros",
  "upload.metadata.submitCta": "Submeter para revisão",

  "upload.submitted.title": "Submetido para <em>revisão.</em>",
  "upload.submitted.body":
    "O teu lançamento está na fila do conselho. Uma pessoa curadora vai verificar os ficheiros, divisões e créditos, normalmente dentro de um ou dois dias, e vais receber um aviso assim que estiver disponível. Nada é publicado sem a tua confirmação final.",
  "upload.submitted.viewPayoutsCta": "Ver os teus pagamentos",
  "upload.submitted.toast": "Lançamento submetido para revisão",

  "upload.continueToMetadataCta": "Continuar para metadados",

  // ── Pagamentos (StudioPayoutsPage + Sections + Skeletons) ─────────────────
  // Só chrome — os valores reais de pagamento deste artista, os dados de
  // IBAN/fiscais/contacto e a discriminação por faixa abaixo são os dados
  // financeiros dela, vindos da API em modo real, e ficam em inglês nos
  // dois modos (§1).
  "payouts.hero.eyebrow": "Pagamentos e dados bancários",
  "payouts.hero.title": "<em>{amount}</em> chegam no dia {day}.",
  "payouts.hero.sub":
    "Pago mensalmente por transferência SEPA, com o teu recibo verde emitido automaticamente. Sem mínimos que não escolheste.",
  "payouts.hero.breakdownEyebrow": "Pagamento de {month} · discriminação",

  "payouts.summary.fromStreaming": "De reproduções",
  "payouts.summary.fromTips": "De gorjetas",
  "payouts.summary.fromAlbumBuys": "De compras de álbuns",
  "payouts.summary.directSubs": "Subscrições diretas de €3/mês",
  "payouts.summary.splitsRouted": "Divisões encaminhadas para outros",
  "payouts.summary.toYourIban": "→ para o teu IBAN",

  "payouts.list.heading": "Pagamentos <em>recentes</em>",
  "payouts.list.exportCsv": "Exportar CSV",
  "payouts.list.status.pending": "Pendente",
  "payouts.list.status.paid": "Pago",

  "payouts.breakdown.heading": "Este mês, <em>faixa a faixa</em>",
  "payouts.breakdown.rateNote":
    "€0,05 por reprodução válida (≥30s, limitado a 1/ouvinte/faixa/dia). Atualizado todas as noites às 02:00 de Lisboa.",
  "payouts.breakdown.subtotalLabel":
    "Subtotal de reproduções · antes de divisões, gorjetas e compras",

  "payouts.sidebar.methodEyebrow": "Método de pagamento · ativo",
  "payouts.sidebar.methodHeading": "A enviar para <em>SEPA</em>",
  "payouts.sidebar.method.sepa.label": "SEPA: IBAN",
  "payouts.sidebar.method.sepa.badge": "Ativo",
  "payouts.sidebar.method.stripe.label": "Stripe Connect",
  "payouts.sidebar.method.stripe.hint": "ligado · reserva, não principal",
  "payouts.sidebar.method.stripe.switchCta": "Mudar",
  "payouts.sidebar.method.coopCredit.label": "Crédito da cooperativa",
  "payouts.sidebar.method.coopCredit.hint":
    "gasta na Casa do Comum, salas de ensaio · sem taxas",
  "payouts.sidebar.method.coopCredit.addCta": "Adicionar",

  "payouts.preferences.heading": "Preferências de <em>pagamento</em>",
  "payouts.preferences.threshold.label": "Limiar mínimo",
  "payouts.preferences.threshold.opt5": "€5 (por defeito · sai todos os meses)",
  "payouts.preferences.threshold.opt20": "€20 (trimestral · poupa nas taxas)",
  "payouts.preferences.threshold.opt100": "€100 (retido, libertado a pedido)",
  "payouts.preferences.threshold.hint":
    "Abaixo do limiar, transita para o mês seguinte.",
  "payouts.preferences.taxResidency.label": "Residência fiscal",
  "payouts.preferences.taxResidency.hint":
    "Emitimos automaticamente o teu recibo verde de IRS para cada pagamento.",
  "payouts.preferences.notificationEmail.label": "Email de notificação",

  "payouts.export.headers.period": "Período",
  "payouts.export.headers.date": "Data",
  "payouts.export.headers.detail": "Detalhe",
  "payouts.export.headers.amount": "Valor (EUR)",
  "payouts.export.headers.status": "Estado",
  "payouts.export.toast": "Histórico de pagamentos exportado como CSV",

  // ── Programar a semana (StudioProgramPage + Inbox + Slate) ────────────────
  // Só chrome — os títulos de submissões/faixas/coleções/transmissões,
  // citações e notas da curadoria abaixo são conteúdo (a submissão de cada
  // artista ou a nota desta pessoa curadora), vindo da API em modo real, e
  // ficam em inglês nos dois modos (§1).
  "program.header.eyebrow":
    "A programar a sala · segunda-feira de manhã · arrasta o que quiseres abaixo",
  "program.header.title": "Semana <em>{weekNumber}</em> · {dateRange}",
  "program.header.sub":
    "Constrói a seleção da semana: <em>uma capa, 12 a 16 faixas, 2 a 3 coleções, transmissões</em>. Publica ao meio-dia e a página inicial roda.",
  "program.header.autosave": "Guardado automaticamente · {time}, a cada tecla",
  "program.header.previewRoomCta": "Pré-visualizar a sala",

  "program.publishBar.status":
    "A seleção está <em>{percent}% completa</em> · publica {publishDate} · a página inicial roda automaticamente",
  "program.publishBar.previewHomepageCta": "Pré-visualizar a página inicial",
  "program.publishBar.saveDraftCta": "Guardar rascunho",
  "program.publishBar.publishCta": "Publicar ao meio-dia",

  "program.toast.addedToSlate": "Adicionado à seleção desta semana",
  "program.toast.passed":
    "Recusado. Quem submeteu pode voltar a tentar depois",
  "program.toast.playingPreview": "A reproduzir pré-visualização…",
  "program.toast.openingRoomPreview": "A abrir a pré-visualização da sala…",
  "program.toast.chooseNewCover": "Escolhe um novo artista de capa…",
  "program.toast.editingCoverNote": "A editar a nota de capa…",
  "program.toast.openingHomepagePreview":
    "A abrir a pré-visualização da página inicial…",
  "program.toast.draftSaved": "Rascunho guardado",
  "program.toast.published":
    "Seleção publicada. A página inicial roda ao meio-dia",

  "program.inbox.heading": "Submissões · <em>{count} novas</em>",
  "program.inbox.triageCta": "Triagem",
  "program.inbox.tip":
    "Arrasta qualquer submissão para a esquerda, para um espaço. <em>O fluxo de recusa com motivo está na triagem.</em>",
  "program.inbox.listenCta": "Ouvir",
  "program.inbox.slateCta": "+ Selecionar",
  "program.inbox.passCta": "Recusar",

  "program.slate.cover.heading": "Artista de capa da semana",
  "program.slate.cover.count": "1 de 1 · o destaque da sala",
  "program.slate.cover.swapCta": "Trocar",
  "program.slate.cover.editNoteCta": "Editar nota",
  "program.slate.singles.heading": "Singles desta semana",
  "program.slate.singles.count":
    "{placed} de {total} colocados · {open} espaços em aberto",
  "program.slate.singles.notePlaceholder":
    "Escreve uma nota de uma linha · porquê isto, porquê agora",
  "program.slate.singles.noteAria": "Nota para {title}",
  "program.slate.singles.removeAria": "Remover {title}",
  "program.slate.singles.addSlotCta":
    "＋ arrasta uma faixa das submissões, ou clica para adicionar do catálogo",
  "program.slate.collections.heading": "Rotação de coleções",
  "program.slate.collections.count": "{placed} de {total}",
  "program.slate.broadcasts.heading": "Transmissões ao vivo esta semana",
  "program.slate.broadcasts.count":
    "{scheduled} agendadas · espaço {slotNumber} em aberto",
  "program.slate.broadcasts.addSlotCta":
    "＋ agendar uma terceira transmissão para sábado à noite",

  // ── Triagem de submissões (StudioTriagePage + List + Detail) ──────────────
  // Só chrome — os nomes/citações/faixas/etiquetas de quem submete e o
  // ficheiro/forma de onda/notas da curadoria desta submissão específica
  // abaixo são conteúdo, vindo da API em modo real, e ficam em inglês nos
  // dois modos (§1). Os `id` dos separadores abaixo são valores de filtro
  // estáveis — nunca usar a etiqueta traduzida como chave guardada (§5.1).
  "triage.header.eyebrow":
    "Triagem de submissões · o conselho responde a cada submissão em 14 dias",
  "triage.header.title":
    "Caixa de entrada · <em>{count}</em> novas esta semana.",
  "triage.header.sub":
    "Cada submissão é lida ou ouvida. <em>Recusar</em> exige uma frase: essa frase torna-se a resposta ao artista. Tempo médio de resposta esta época: {count} dias.",

  "triage.kpi.newThisWeek": "novas esta semana",
  "triage.kpi.youClaimed": "reclamaste",
  "triage.kpi.medianReply": "resposta média",
  "triage.kpi.atDeadline": "no prazo limite",

  "triage.tabs.new.label": "Novas",
  "triage.tabs.new.queue": "novas",
  "triage.tabs.yours.label": "Tuas",
  "triage.tabs.yours.queue": "tuas",
  "triage.tabs.atDeadline.label": "No prazo",
  "triage.tabs.atDeadline.queue": "no prazo",
  "triage.tabs.shortlisted.label": "Pré-selecionadas",
  "triage.tabs.shortlisted.queue": "pré-selecionadas",
  "triage.tabs.answered.label": "Respondidas",
  "triage.tabs.answered.queue": "respondidas",

  "triage.list.empty.title": "Nada nesta fila",
  "triage.list.empty.description":
    "Não há submissões <em>{queue}</em> neste momento. Quando algo chegar, vais encontrá-lo aqui à espera.",
  "triage.list.backToNewCta": "Voltar às novas",
  "triage.list.dayOfTotal": "de 14 para responder",

  "triage.detail.playAria": "Reproduzir",
  "triage.detail.fileHeading": "O ficheiro",
  "triage.detail.file.format": "Formato",
  "triage.detail.file.loudness": "Volume",
  "triage.detail.file.duration": "Duração",
  "triage.detail.file.lyrics": "Letra",
  "triage.detail.file.splits": "Divisões",
  "triage.detail.flaggedHeading":
    "O que outras pessoas da curadoria assinalaram ({count})",
  "triage.detail.answerHeading": "A tua <em>resposta</em>",
  "triage.detail.decision.heading":
    "Se recusares, escreve uma frase. Isto vai para {artistName} como resposta.",
  "triage.detail.decision.placeholder":
    "Uma pequena frase que explique o não. Nunca enviamos uma carta-tipo.",
  "triage.detail.decision.hint":
    "Obrigatório para recusar. <em>Não obrigatório</em> para selecionar.",
  "triage.detail.holdCta": "Reter e ouvir de novo",
  "triage.detail.passCta": "Recusar · com a frase",
  "triage.detail.addToSlateCta": "＋ Adicionar à próxima seleção",
  "triage.detail.toast.held": "Retido para uma segunda audição",
  "triage.detail.toast.passed":
    "Recusado com a tua frase, enviado a {artistName}",
  "triage.detail.toast.addedToSlate": "Adicionado à próxima seleção",

  // ── Revisão de sinalizações (StudioFlagReviewPage + Card) ─────────────────
  // Só chrome — os títulos dos lançamentos sinalizados, as citações de quem
  // denuncia e os detalhes de reclamação/autoria abaixo são conteúdo, vindo
  // da API em modo real, e ficam em inglês nos dois modos (§1). O `verb`
  // guardado ao resolver é um id estável, não a etiqueta em português —
  // resolve através de RESOLUTION_LABELS, nunca o mostres em bruto (§5.1).
  "flagReview.header.eyebrow": "Conselho · revisão de sinalizações",
  "flagReview.header.title": "Quando a sala <em>sinaliza</em> algo.",
  "flagReview.header.dek":
    "Quem ouve pode sinalizar um lançamento por amostras não autorizadas, créditos em falta ou atribuição incorreta. Uma pessoa da curadoria reclama cada caso, o artista identificado pode responder, e <em>cada decisão fica registada com um motivo</em>. Nada é removido em silêncio.",

  "flagReview.resolvedTag": "Resolvido · {verb}",
  "flagReview.dismissedClearedTag": "Recusado · esclarecido",
  "flagReview.playAria": "Reproduzir",
  "flagReview.claimReviewCta": "Reclamar e rever",
  "flagReview.dismissCta": "Recusar",
  "flagReview.correctLineupCta": "Corrigir a formação",
  "flagReview.requestFixCta": "Pedir correção",
  "flagReview.holdUntilFixedCta": "Reter até corrigir",

  "flagReview.resolution.dismissed": "recusado",
  "flagReview.resolution.corrected": "corrigido",
  "flagReview.resolution.held": "retido",

  "flagReview.toast.claimed": "Reclamado. É teu para rever",
  "flagReview.toast.lineupConfirmed": "Formação confirmada como exata",
  "flagReview.toast.lineupCorrected": "Formação corrigida",
  "flagReview.toast.dismissedCreditsConfirmed":
    "Sinalização recusada. Créditos confirmados como corretos",
  "flagReview.toast.correctionRequested": "Correção pedida ao artista",
  "flagReview.toast.heldUntilCorrected": "Retido até corrigir",

  // ── Sala ao vivo (StudioLivePage + LiveNow + LiveChat) ────────────────────
  // Só chrome — o nome do programa/faixa/artista ao vivo, a transcrição do
  // chat e as estatísticas por audição abaixo são conteúdo (o estado real da
  // sala e o registo do chat), vindo da API em modo real, e ficam em inglês
  // nos dois modos (§1). Os `id` dos separadores do chat são valores
  // estáveis — nunca a etiqueta traduzida (§5.1).
  "live.ribbon.onAirNow": "No ar agora",

  "liveNow.saveTrackCta": "Guardar faixa",
  "liveNow.savedCta": "Guardada",
  "liveNow.savedToast": "Faixa guardada na tua biblioteca",
  "liveNow.removedToast": "Removida da tua biblioteca",
  "liveNow.lyricsNotesCta": "Letra e notas",
  "liveNow.listenersLabel":
    "na sala contigo · {sustainers} sustentadores, {casual} ocasionais",
  "liveNow.tippedLabel": "em gorjetas durante este set · 100% para os artistas",
  "liveNow.perPlayLabel": "por reprodução válida · paga a {artist} agora mesmo",
  "liveNow.setBuilding.heading": "O set · <em>a construir-se ao vivo</em>",
  "liveNow.trackPosition": "Faixa {current} de {total} · saltou da fila",
  "liveNow.tipArtistCta": "Dar {amount} a {artist}",

  "liveChat.tabs.chat.label": "Chat",
  "liveChat.tabs.tips.label": "Gorjetas",
  "liveChat.tabs.listeners.label": "Ouvintes",
  "liveChat.inputPlaceholder": "diz algo à sala…",
  "liveChat.sendAria": "Enviar",
  "liveChat.tipPresetCta": "Dar {amount}",
  "liveChat.tipCustomCta": "Dar €__",

  // ── Consola de transmissão ao vivo (StudioBroadcastPage + Console) ───────
  // Só chrome — nomes de dispositivos, títulos de faixas na folha de cue,
  // mensagens de gorjeta e o chat de apoio (talkback) abaixo são conteúdo,
  // vindo da API em modo real, e ficam em inglês nos dois modos (§1).
  "broadcast.status.onAir": "Estás <em>no ar</em>",
  "broadcast.status.livePill": "ao vivo",
  "broadcast.status.meta":
    "<em>{count}</em> na sala · {sustainers} sustentadores · {cities} cidades",
  "broadcast.status.pauseMicCta": "Pausar microfone",
  "broadcast.status.endBroadcastCta": "Terminar transmissão",
  "broadcast.status.toast.micPaused":
    "Microfone em pausa. A sala ouve silêncio",
  "broadcast.status.toast.ending":
    "A transmissão termina em 5… a arquivar como reposição",

  "broadcast.audioIn.panelLabel": "Entrada de áudio",
  "broadcast.audioIn.singleCamVideo": "Vídeo de uma câmara",
  "broadcast.audioIn.cameraNote":
    "Só áudio é a predefinição para salas de audição. A câmara chega na Fase 5, por agora está desativada.",

  "broadcast.nowPlaying.onAirNow": "No ar agora",
  "broadcast.nowPlaying.setListLabel":
    "Lista do set · <em>escreve à medida que tocas</em>: torna-se a folha de cue no arquivo",
  "broadcast.nowPlaying.inputPlaceholder":
    "O que acabaste de tocar? Artista · título…",
  "broadcast.nowPlaying.inputAria": "Adicionar uma faixa à lista do set",
  "broadcast.nowPlaying.addCta": "Adicionar",
  "broadcast.nowPlaying.justAdded": "Acabado de adicionar",
  "broadcast.nowPlaying.liveYourOwn": "ao vivo, teu",
  "broadcast.nowPlaying.badge.onAir": "No ar",
  "broadcast.nowPlaying.badge.matched": "€ correspondido",
  "broadcast.nowPlaying.badge.hold": "Em espera",
  "broadcast.nowPlaying.footer":
    "Faixas correspondidas pagam os artistas automaticamente a partir do pagamento deste set. <em>Faixas retidas esperam</em> até o sistema de correspondência do conselho as validar. Ninguém perde um cêntimo entretanto.",

  "broadcast.aside.tipsTab": "Gorjetas ao vivo <em>{amount}</em>",
  "broadcast.aside.talkbackTab": "Apoio <em>{count}</em>",
  "broadcast.aside.tipsTotalLabel":
    "Esta noite, até agora · <em>100% para ti</em>",
  "broadcast.aside.talkback.placeholder":
    "Fala com a tua moderação (quem ouve não vê isto)…",
  "broadcast.aside.talkback.aria": "Falar com a tua moderação",
  "broadcast.aside.talkback.sendCta": "Enviar",
  "broadcast.aside.talkback.sentToast": "Enviado à tua moderação",

  // ── Loja de partituras (StudioSheetStorePage + Preview + Checkout + Also) ──
  "sheet.store.eyebrow": "Arquivo de partituras e letras",
  "sheet.store.title": "Compra a <em>partitura</em>, paga a quem a fez.",
  "sheet.store.dek":
    "Um micropagamento de {amount} desbloqueia um PDF limpo e imprimível, e reparte <em>{splitRatio}</em> por quem compôs e transcreveu. Ler é grátis; descarregar paga.",

  "sheet.preview.eyebrow": "Partitura · transcrição",
  "sheet.preview.byLine":
    "música & letra de <strong>{composer}</strong> · de <em>{album}</em>",
  "sheet.preview.freePreview":
    "Pré-visualização gratuita · <em>página {page} de {total}</em>",
  "sheet.preview.watermark": "QUEERPULSE · PRÉVIA",
  "sheet.preview.lockedPages": "As páginas {from}–{to} desbloqueiam na compra",
  "sheet.preview.transcribedBy": "Transcrito por <em>{name}</em>",
  "sheet.preview.transcriberRole": "Transcrição da comunidade",
  "sheet.preview.transcriberNote":
    "<em>pago pela tua compra, não pelo fundo, quando compras</em>",

  "sheet.checkout.title": "O teu <em>download</em>",
  "sheet.checkout.subtitle":
    "Uma partitura · PDF limpo · tua para guardar & imprimir",
  "sheet.checkout.processingLabel": "Processamento",
  "sheet.checkout.processingSub": "taxa SEPA da cooperativa",
  "sheet.checkout.totalLabel": "Total",
  "sheet.checkout.splitHeading":
    "Para onde vão os teus {amount} · {splitRatio}",
  "sheet.checkout.role.transcriber": "transcrição",
  "sheet.checkout.role.composer": "composição",
  "sheet.checkout.role.coop": "A cooperativa · alojamento & infraestrutura",
  "sheet.checkout.splitFoot":
    "As partituras pagam <em>90%</em> a quem as fez, mais generoso do que os 80% do streaming, porque o trabalho é único e alojar um PDF custa quase nada. <em>Aprovado na assembleia de 9 de junho.</em>",
  "sheet.checkout.payMethod.card.label": "Cartão guardado",
  "sheet.checkout.payMethod.card.sub": "um toque, sem reintroduzir dados",
  "sheet.checkout.payMethod.sepa.label": "SEPA direto",
  "sheet.checkout.payMethod.sepa.sub":
    "taxa mais baixa, liquidação em 1–2 dias",
  "sheet.checkout.paidLabel": "Pago",
  "sheet.checkout.downloadingLabel": "a descarregar o PDF…",
  "sheet.checkout.payCta": "Pagar {amount} & descarregar",
  "sheet.checkout.note":
    "Download instantâneo · descarrega outra vez quando quiseres a partir da tua biblioteca · <em>quem fez isto é pago esta noite</em>.",
  "sheet.checkout.downloadedToast":
    "Descarregado: {amount} pagos a {names} esta noite",

  "sheet.also.heading": "Da mesma <em>transcrição</em>",
  "sheet.also.subtitle_one":
    "{name} · {count} partitura · {amount} chega a quem transcreve por download",
  "sheet.also.subtitle_other":
    "{name} · {count} partituras · {amount} chega a quem transcreve por download",
  "sheet.also.freeReadTag": "Leitura gratuita",

  // ── Recibo de gorjeta (StudioReceiptPage) ──────────────────────────────────
  "receipt.tipEyebrow": "Gorjeta · enquanto ouvias",
  "receipt.byPrefix": "de",
  "receipt.fromAlbum": "de <em>{album}</em>",
  "receipt.thanksTitle": "{artist} recebeu <em>{amount}</em>.",
  "receipt.thanksSub":
    "Cada cêntimo. Sem corte da plataforma. <em>Foste tu que fizeste isso.</em>",
  "receipt.splitHeading": "Para onde foi o <em>dinheiro</em>",
  "receipt.splitNote": "100% direto, sem exceções, nas gorjetas.",
  "receipt.split.artistSub_one": "Direto, SEPA · liquida em {count} dia",
  "receipt.split.artistSub_other": "Direto, SEPA · liquida em {count} dias",
  "receipt.split.platformName": "Plataforma · a sala",
  "receipt.split.platformSub":
    "Taxa de processamento da Stripe absorvida pela cooperativa nas gorjetas.",
  "receipt.split.artistPct": "100%",
  "receipt.split.platformPct": "0%",
  "receipt.detail.receiptNo": "N.º do recibo",
  "receipt.detail.dateTime": "Data & hora",
  "receipt.detail.from": "De",
  "receipt.detail.method": "Método",
  "receipt.detail.postedToLedger": "Registado no livro-razão",
  "receipt.detail.visibility": "Visibilidade",
  "receipt.detail.sustainerSince": "a apoiar desde {date}",
  "receipt.detail.chosenByDefault": "<em>escolhido por predefinição</em>",
  "receipt.detail.visibilityValue":
    "Pública · com o teu nome · <em>muda para anónimo</em>",
  "receipt.note.label": "A tua nota para {artist}",
  "receipt.note.repliedSuffix": "<em>respondeu</em>",
  "receipt.note.replyWhen": "{relativeTime} · ainda no ar, duas faixas depois",
  "receipt.footer.auditablePrefix": "Auditável no",
  "receipt.footer.publicLedgerLink": "livro-razão público",
  "receipt.footer.rowLabel": "linha {code}",
  "receipt.footer.exportCta": "Exportar PDF",
  "receipt.actions.share": "Partilhar cartão pago",
  "receipt.actions.tipAgain": "Dar gorjeta outra vez",
  "receipt.actions.openArtistPage": "Abrir a página de {artist}",
  "receipt.actions.emailCopy": "Enviar-me uma cópia por email",
  "receipt.toast.shareCopied": "Cartão pago copiado. Partilha onde quiseres.",
  "receipt.toast.tipAgain": "Gorjeta para {artist} outra vez, a mesma faixa.",
  "receipt.toast.emailCopy":
    "Uma cópia está a caminho da tua caixa de entrada.",
  "receipt.privacyNote":
    "Por predefinição, as gorjetas são <em>públicas, com o teu nome</em>. Podes tornar esta anónima, ou definir todas as gorjetas futuras como anónimas, nas definições. <em>Não partilhamos dados de gorjetas com ninguém.</em> <a>Compromissos de privacidade</a>",

  // ── Checkout da contribuição (StudioCheckoutPage) ──────────────────────────
  "checkout.doneToast": "Já estás a contribuir para o studio. Bem-vinde.",
  "checkout.doneTitle": "Já estás a <em>contribuir</em> para isto.",
  "checkout.doneBody":
    "Bem-vinde. Cada faixa que ouvires aqui paga a quem a fez. O teu primeiro pagamento de {amount} está feito. O resto é só ouvir.",
  "checkout.startListeningCta": "Começar a ouvir",
  "checkout.goToLibraryCta": "Ir para a tua biblioteca",
  "checkout.eyebrow": "Checkout",
  "checkout.title": "Contribui para o <em>studio.</em>",
  "checkout.dek":
    "Sete euros por mês mantêm viva uma plataforma de música com pagamento justo, e pagam às pessoas artistas que realmente ouves, em cada reprodução.",
  "checkout.nameLabel": "Nome no cartão",
  "checkout.namePlaceholder": "O teu nome",
  "checkout.cardLabel": "Número do cartão",
  "checkout.cardPlaceholder": "1234 5678 9012 3456",
  "checkout.expiryLabel": "Validade",
  "checkout.expiryPlaceholder": "MM / AA",
  "checkout.cvcLabel": "CVC",
  "checkout.payCta": "Pagar {amount}{cadence}",
  "checkout.cadenceMonthly": "/ mês",
  "checkout.prototypeNote":
    "Isto é um protótipo. Nenhum cartão é cobrado e nada é guardado.",
  "checkout.planName": "Contribuir",
  "checkout.membershipLabel": "Adesão <em>{name}</em>",
  "checkout.dueTodayLabel": "A pagar hoje",
  "checkout.lines.unlimitedListening": "Audição ilimitada",
  "checkout.lines.losslessAudio": "Áudio sem perdas · FLAC",
  "checkout.lines.liveRooms": "Salas de transmissão ao vivo",
  "checkout.lines.artistShare": "Vai para artistas",
  "checkout.lines.platformShare": "Plataforma & alojamento",
  "checkout.lines.included": "incluído",
  "checkout.reassure.cancel":
    "Cancela quando quiseres: um clique, sem email, sem chamada de retenção.",
  "checkout.reassure.share":
    "{percent}% de cada euro é pago diretamente às pessoas artistas que ouves.",
  "checkout.reassure.noAds":
    "Sem anúncios, nunca. Os teus dados de audição nunca são vendidos.",

  // ── Fundo de solidariedade (StudioSolidarityFundPage + Balance + Flows + Log) ──
  "fund.hero.liveLabel": "Público · atualizado às segundas ao meio-dia",
  "fund.hero.title": "O fundo de <em>solidariedade</em>.",
  "fund.hero.dek":
    "Uma pequena reserva partilhada que paga a quem a taxa por reprodução não consegue alcançar: <em>quem transcreve, quem traduz, quem está a começar, e artistas num mês difícil</em>. De onde vem e para onde vai, por inteiro.",

  "fund.balance.label": "Saldo do fundo · hoje",
  "fund.balance.paidThisQuarterLabel": "pago este trimestre",
  "fund.balance.peoplePaidLabel_one": "pessoa paga por ele este ano",
  "fund.balance.peoplePaidLabel_other": "pessoas pagas por ele este ano",

  "fund.flows.heading": "De onde <em>vem</em>, para onde <em>vai</em>",
  "fund.flows.inHeading": "Entradas · este trimestre",
  "fund.flows.outHeading": "Saídas · este trimestre",

  "fund.flows.in.surplus.label": "Excedente de <em>subscrições</em>",
  "fund.flows.in.surplus.desc":
    "Quando a receita de quem sustenta supera o livro-razão de pagamentos, a diferença acumula-se aqui.",
  "fund.flows.in.roundups.label": "Arredondamentos de <em>gorjetas</em>",
  "fund.flows.in.roundups.desc":
    "Os 5% opcionais que algumas pessoas acrescentam a uma gorjeta.",
  "fund.flows.in.holds.label": "<em>Retenções</em> resolvidas",
  "fund.flows.in.holds.desc":
    "Pagamentos de sets não correspondidos que ficam por reclamar após um ano.",
  "fund.flows.in.gifts.label": "<em>Doações</em> diretas",
  "fund.flows.in.gifts.desc":
    "Doações pontuais de pessoas membros e de uma fundação de Lisboa.",

  "fund.flows.out.transcribers.label": "Transcrição & <em>tradução</em>",
  "fund.flows.out.transcribers.desc":
    "Partituras, traduções de letras, pagas por peça aceite.",
  "fund.flows.out.grants.label": "Bolsas de <em>primeira edição</em>",
  "fund.flows.out.grants.desc":
    "1 200 € sem restrições para pessoas membros estreantes na leva da primavera.",
  "fund.flows.out.emergency.label": "Apoio de <em>emergência</em> a artistas",
  "fund.flows.out.emergency.desc":
    "Apoio sem perguntas para quem está num mês difícil.",
  "fund.flows.out.access.label": "Trabalho de <em>acessibilidade</em>",
  "fund.flows.out.access.desc":
    "Intérpretes de LGP, passagens de legendagem, a auditoria de leitores de ecrã.",

  "fund.log.heading": "<em>Desembolsos</em> recentes",
  "fund.log.dek":
    "Cada pagamento do fundo fica aqui registado com um nome (quando há consentimento) e um motivo. <em>Sem caixa negra.</em>",
  "fund.log.showingOf": "A mostrar {shown} de {total} este ano",
  "fund.log.showLess": "mostrar menos",
  "fund.log.fullLog": "registo completo",
  "fund.log.exportCsv": "exportar CSV",
  "fund.log.exportToast": "Registo de desembolsos exportado como CSV",
  "fund.log.tag.transcriber": "Transcrição",
  "fund.log.tag.emergency": "Emergência",
  "fund.log.tag.grant": "Bolsa",
  "fund.log.tag.access": "Acessibilidade",
  "fund.log.tag.translator": "Tradução",
  "fund.log.csv.date": "Data",
  "fund.log.csv.category": "Categoria",
  "fund.log.csv.recipient": "Quem recebeu",
  "fund.log.csv.note": "Nota",
  "fund.log.csv.amount": "Montante (EUR)",

  "fund.apply.heading": "Precisas? <em>Pede.</em>",
  "fund.apply.requestCta": "Pedir apoio de emergência",
  "fund.apply.requestToast":
    "O formulário de apoio de emergência abre num fluxo privado",
  "fund.apply.seeGrantsCta": "Ver bolsas & chamadas abertas",

  // ── Chamadas abertas & comissões (StudioOpenCallsPage + Card + Skeleton) ──
  "calls.hero.eyebrow": "Da parte do conselho",
  "calls.hero.title": "Chamadas <em>abertas</em> & comissões.",
  "calls.hero.dek":
    "Propostas financiadas pelo conselho e pela cooperativa. Candidata-te diretamente: anexa <em>uma única faixa ou edição</em> do teu catálogo. Sem cartas de apresentação, sem portefólios; o trabalho fala por si.",

  "calls.filter.all": "Tudo aberto",
  "calls.filter.commissions": "Comissões",
  "calls.filter.grants": "Bolsas",
  "calls.filter.residencies": "Residências",
  "calls.filter.closingSoon": "A fechar em breve",
  "calls.filter.openCount":
    "<em>{count}</em> abertas · já te candidataste a {applied}",

  "calls.card.saveCta": "Guardar",
  "calls.card.applyCta": "Candidatar",
  "calls.card.saveToast": "Proposta guardada no teu painel",
  "calls.card.attachLabel": "Anexa uma faixa do teu catálogo",
  "calls.card.submitCta": "Submeter candidatura",
  "calls.card.cancelCta": "Cancelar",
  "calls.card.singleTrackNote":
    "<em>Só uma faixa</em>: o conselho quer a tua melhor faixa, uma só.",
  "calls.card.submittedToast":
    "Candidatura submetida. O conselho analisa na triagem de segunda-feira",

  "calls.applied.statusPrefix": "Estado ·",
  "calls.applied.decisionBy": "decisão até {date}",
  "calls.applied.withdrawCta": "Retirar",
  "calls.applied.withdrawnToast": "Candidatura retirada",
  "calls.applied.flatLabel": "fixo",

  // ── Submissão de set (StudioSetSubmissionPage + Matcher + Sidebar) ────────
  "setSubmission.hero.eyebrow": "Nova submissão · set ou mix de DJ",
  "setSubmission.hero.title": "Submete um <em>set</em>.",
  "setSubmission.hero.dek":
    "Carrega o ficheiro completo, cola a tua tracklist com marcas de tempo, e o nosso comparador encontra as fontes originais para que <em>cada faixa do set pague a quem a fez</em>. As faixas não correspondidas retêm o pagamento em segurança até serem confirmadas. Ninguém perde um cêntimo.",

  "setSubmission.steps.file": "Ficheiro",
  "setSubmission.steps.tracklist": "Tracklist & comparador",
  "setSubmission.steps.notes": "Notas & publicação",

  "setSubmission.matcher.uploadedBadge": "Carregado",
  "setSubmission.matcher.tracklistLabel":
    "Cola a tua tracklist · marca de tempo · artista · título",
  "setSubmission.matcher.pasteHint":
    "Uma linha por faixa. Aceitamos a maioria dos formatos. <em>Volta a correr o comparador</em> sempre que editares.",
  "setSubmission.matcher.runCta": "▸ Correr o comparador",
  "setSubmission.matcher.matchingCta": "A comparar…",
  "setSubmission.matcher.resultsLabel":
    "Resultados do comparador · <em>resolvidos face ao catálogo + base de dados PRO</em>",
  "setSubmission.matcher.payLine":
    "{who} · <em>{amount}/reprodução para {firstName}</em>",
  "setSubmission.matcher.noSourceFound":
    "fonte não encontrada · pagamento retido",
  "setSubmission.matcher.matchedBadge": "Correspondida",
  "setSubmission.matcher.identifyCta": "Identificar",
  "setSubmission.matcher.identifyToast":
    "Pesquisa aberta para identificar esta faixa",
  "setSubmission.matcher.matchedResultToast":
    "{matched} de {total} correspondidas · {held} retidas para confirmação",

  "setSubmission.sidebar.detailsHeading": "<em>Detalhes</em> do set",
  "setSubmission.sidebar.titleLabel": "Título do set",
  "setSubmission.sidebar.typeLabel": "Tipo",
  "setSubmission.sidebar.type.liveDjSet": "Set de DJ ao vivo",
  "setSubmission.sidebar.type.studioMix": "Mix de estúdio",
  "setSubmission.sidebar.type.recordedBroadcast": "Transmissão gravada",
  "setSubmission.sidebar.payoutPreviewHeading":
    "Pré-visualização do <em>pagamento</em>",
  "setSubmission.sidebar.tracksInSet": "Faixas no set",
  "setSubmission.sidebar.matchedPaying": "Correspondidas & a pagar",
  "setSubmission.sidebar.tracksCount_one": "{count} faixa",
  "setSubmission.sidebar.tracksCount_other": "{count} faixas",
  "setSubmission.sidebar.onHold": "Em espera (não correspondidas)",
  "setSubmission.sidebar.payoutPool": "Bolsa de pagamento do set",
  "setSubmission.sidebar.holdNote":
    "As faixas não correspondidas <em>retêm a sua parte</em> até o comparador do conselho as confirmar. O set fica disponível já; o dinheiro retido é libertado assim que a fonte for confirmada.",
  "setSubmission.sidebar.submitCta": "Submeter set",
  "setSubmission.sidebar.submittedToast":
    "Set submetido. Disponível já, partes retidas pendentes de confirmação",

  // ── Fora do ar (StudioOffAirPage + Hero) ───────────────────────────────────
  "offAir.page.browseNote":
    "As portas estão fechadas, mas as prateleiras estão abertas. <em>Explora o que quiseres aqui em baixo</em>. Continua tudo a tocar.",
  "offAir.hero.statusLine": "Fora do ar · {time} em Lisboa",
  "offAir.hero.roomDark": "a sala está às escuras",
  "offAir.hero.title": "A sala está <em>fechada</em> por esta noite.",
  "offAir.hero.untilDoors": "até abrir",
  "offAir.hero.nextBroadcastLabel": "Próxima transmissão · {time} Lisboa",
  "offAir.hero.nightcapEyebrow": "O acalanto de ontem à noite",
  "offAir.hero.replayAria": "Repetir o acalanto",
  "offAir.hero.replayingToast": "A repetir {title}",
  "offAir.hero.paidOutSuffix": "{amount} pagos · repete quando quiseres",

  // ── Marcador de posição em modo live (StudioComingSoonPage) ────────────────
  // Aparece em todas as rotas /studio/* quando o modo demo está desligado —
  // o Studio ainda não tem backend e não pode mostrar valores inventados.
  "comingSoon.title": "O Studio ainda está a <em>afinar</em>",
  "comingSoon.description":
    "A nossa plataforma de música em cooperativa (páginas de artistas, sessões ao vivo, pagamentos e o fundo de solidariedade) ainda não abriu ao público. Estamos a construí-la à vista de todes e chega aqui em breve.",
  "comingSoon.exploreCulture": "Explorar a Cultura",
  "comingSoon.backHome": "Voltar ao início",
};
