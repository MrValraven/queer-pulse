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
  "rail.contribute.openCalls": "Concursos abertos",
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

  "rail.foot.sustainedSince": "<em>Sustentas</em> o Studio desde {date}.",
  "rail.foot.paid_one":
    "Já pagaste <b>{amount}</b> a {count} artista este ano.",
  "rail.foot.paid_other":
    "Já pagaste <b>{amount}</b> a {count} artistas este ano.",

  // ── Etiquetas partilhadas nos cartões de faixas/lançamentos ───────────────
  "tag.free": "Grátis",
  "tag.sustainer": "Apoiante",
  "tag.replay": "Reposição",

  // ── Controlos do leitor (StudioPlayer + reutilizados noutros pontos) ─────
  "player.prev": "Anterior",
  "player.play": "Reproduzir",
  "player.next": "Seguinte",
  "player.tipCta": "Dar {amount}",
  "player.payingLine": "<b>a pagar</b> {amount} a {artist}",

  // ── Hero da sala "Esta semana" (StudioPageSections → StudioHero) ─────────
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
    "Programado por {curator} · em simultâneo · {count} a ouvir",
  "room.set.readPlanCta": "Ler o plano",
  "room.set.sideHeading": "A ouvir contigo",
  "room.set.sideSub":
    "{sustainers} apoiantes · {casual} ocasionais · {cities} cidades",
  "room.set.ledgerHead": "Livro-razão · este mês",
  "room.set.ledgerPaidArtists": "Pago a artistas",
  "room.set.ledgerPlays": "Reproduções",
  "room.set.ledgerArtistShare": "Parte da pessoa artista",
  "room.set.ledgerPerPlay": "Por reprodução",

  // ── Páginas de erro (Studio404Page, Studio500Page) ────────────────────────
  "error.brandAria": "Página inicial do QueerPulse Studio",
  "error404.eyebrow": "Faixa não encontrada",
  "error404.title": "Esta música <em>não existe.</em>",
  "error404.body":
    "A faixa, o set ou a página que procuravas nunca foi gravada, foi retirada por quem a fez, ou está atrás de um início de sessão. Sem drama. O catálogo é grande e há muito mais para ouvir.",
  "error404.backCta": "Voltar ao leitor",
  "error404.goBackCta": "Voltar atrás",
  "error404.tryInsteadTitle": "Experimenta uma destas",
  "error404.link.set.label": "O <em>set</em> desta semana",
  "error404.link.set.sub": "Ao vivo, programado às segundas-feiras",
  "error404.link.search.label": "<em>Pesquisar</em> no catálogo",
  "error404.link.search.sub": "Faixas, artistas, partituras",
  "error404.link.library.label": "A tua <em>biblioteca</em>",
  "error404.link.library.sub": "Guardadas, a sustentar, com gorjeta",

  "error500.eyebrow": "Algo falhou",
  "error500.title": "Perdemos a <em>gravação.</em>",
  "error500.body":
    "Um servidor do nosso lado falhou a meio da gravação. A tua conta, as tuas gravações e o pagamento a cada artista estão seguros. Isto é só a parte que vês. Espera um segundo e tenta outra vez.",
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
    "Uma rede profissional queer com raízes em Lisboa. O Studio vive ao lado do Cinema, da Magazine e dos Eventos.",
  "landing.footer.col.studio": "Studio",
  "landing.footer.col.studio.thisWeek": "Esta semana",
  "landing.footer.col.studio.djSets": "Sets de DJ",
  "landing.footer.col.studio.liveBroadcast": "Transmissão ao vivo",
  "landing.footer.col.artists": "Artistas",
  "landing.footer.col.artists.submitMusic": "Submeter música",
  "landing.footer.col.artists.dashboard": "Painel de artista",
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
    "Uma plataforma de streaming cooperativa. <em>{sharePercent}</em> de cada audição vai para quem fez a música. <em>{tipPercent}</em> de cada gorjeta. O livro-razão é público. Quem cura tem nome. <em>Nenhum algoritmo alguma vez pôs aqui os pés.</em>",
  "landing.hero.demoCta": "Ouvir um set de demonstração · grátis",

  "landing.demo.eyebrow": "O set de quarta-feira · pré-visualização grátis",
  "landing.demo.meta":
    "programado por {curator} · {duration} · {trackCount} faixas · {listening} a ouvir",
  "landing.demo.pauseAria": "Pausar pré-visualização",
  "landing.demo.playAria": "Reproduzir pré-visualização",
  "landing.demo.trackPrefix": "Faixa {n} ·",
  "landing.demo.byLine": "{artist} · de {album}",
  "landing.demo.payNote":
    "Esta audição paga a {artist} <em>{amount}</em> quando és apoiante. Neste momento, o Studio está aberto como demonstração.",
  "landing.demo.quote":
    "«Fica até ao segundo verso da faixa seis. <em>O piano deixa-te ali de propósito.</em>» {attribution}, responsável pela programação",

  // ── As quatro promessas (StudioLandingPromises) ───────────────────────────
  "landing.promises.eyebrow": "O contrato · por escrito",
  "landing.promises.title":
    "Quatro <em>promessas</em> que fazemos, a artistas e a quem ouve.",
  "landing.promises.share.title": "Uma parte justa e <em>visível</em>.",
  "landing.promises.share.body":
    "80% de cada audição vai para quem fez a música. 100% de cada gorjeta. Os outros 20% cobrem pagamentos, alojamento, legendas, edição de partituras e ajudas de custo do conselho. A divisão está em cada página de artista, cada recibo, cada álbum.",
  "landing.promises.humans.title": "Música <em>programada</em> por pessoas.",
  "landing.promises.humans.body":
    'Cada faixa na página principal tem o nome de quem a curou e uma nota de um parágrafo. Sem "popular perto de ti", sem "feito para ti", sem scroll infinito. A semana é pequena, feita à mão e datada.',
  "landing.promises.coOwned.title": "Co-propriedade de quem <em>ouve</em>.",
  "landing.promises.coOwned.body":
    "As pessoas apoiantes ({price}/mês) passam a ter voto na cooperativa ao fim de doze meses. Elegem o conselho, aprovam a tabela de valores e veem cada euro no livro-razão. A plataforma presta contas a quem a apoia.",
  "landing.promises.privacy.title": "Privacidade como <em>padrão</em>.",
  "landing.promises.privacy.body":
    "Nenhum dado de audição é vendido, distribuído ou usado para recomendar. O histórico pessoal de reprodução é privado e apagável num clique. Existem reproduções agregadas para o livro-razão; mais nada sai daqui.",

  // ── Contador do livro-razão público (StudioLandingCounter) ────────────────
  "landing.counter.liveEyebrow": "Ao vivo, atualizado em tempo real",
  "landing.counter.title":
    "Desde que a beta abriu, o <em>QueerPulse Studio</em> já pagou:",
  "landing.counter.sub": "a {count} artistas, em {cycles} ciclos mensais.",
  "landing.counter.seeLedgerCta": "Ver o livro-razão",
  "landing.counter.stat.perPlay": "por reprodução válida · 15× o Spotify",
  "landing.counter.stat.artistShare": "parte para artistas, no agregado",
  "landing.counter.stat.sustainers": "apoiantes na cooperativa",
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
    "Sem anúncios · sem acionistas · financiado por apoiantes. Definido anualmente por votação.",

  // ── Faixa final de chamada à ação (StudioLandingCta) ──────────────────────
  "landing.cta.title": "Puxa uma <em>cadeira</em>.",
  "landing.cta.body":
    "{price} por mês. Cancela quando quiseres. <em>A primeira audição</em> diz-te se o Studio é para ti.",
  "landing.cta.readPlanCta": "Ler o plano primeiro",
  "landing.cta.secondary":
    "Já és pessoa da QueerPulse? O Studio custa <em>mais {addOnPrice}/mês</em>.",
  "landing.cta.secondaryLink": "Entra para a adicionar",

  // ── Entrar / Junta-te (StudioSignInPage) ─────────────────────────────────
  "signin.tabs.signIn": "Entrar",
  "signin.tabs.join": "Junta-te",
  "signin.aside.onAirNow": "No ar agora · {count} a ouvir",
  "signin.aside.title":
    "Uma cooperativa de streaming que <em>paga</em> a quem fez a música.",
  "signin.aside.body":
    "Oitenta cêntimos de cada euro chegam a quem fez a música. As gorjetas passam a <em>{tipPercent}</em>. O livro-razão é público, atualizado toda a segunda-feira ao meio-dia.",
  "signin.aside.paidThisMonth":
    "Pago a artistas este mês: <em>{amount}</em> · e a subir.",

  "signin.in.title": "Bem-vinde de <em>volta.</em>",
  "signin.in.lede":
    "O Studio é um separador na tua conta QueerPulse. Entra com a conta que já tens.",
  "signin.emailLabel": "Email",
  "signin.emailPlaceholder": "tu@exemplo.com",
  "signin.in.submitCta": "Entrar",
  "signin.orDivider": "ou",
  "signin.googleContinue": "Continuar com o Google",
  "signin.googleLoading": "A entrar…",
  "signin.in.newHere": "Ainda não tens conta?",
  "signin.in.joinCta": "Junta-te ao Studio",
  "signin.in.freePrompt": "Só queres ouvir?",
  "signin.in.freeCta": "Ouve um set grátis, sem conta",
  "signin.in.signedInToast": "Sessão iniciada, bem-vinde de volta",
  "signin.in.signedInGoogleToast":
    "Sessão iniciada com o Google, bem-vinde de volta",

  "signin.join.title": "Junta-te ao <em>Studio.</em>",
  "signin.join.lede":
    "Escolhe quanto da cooperativa queres. Podes mudar de nível ou cancelar em qualquer mês: sem fidelização, sem emails a insistir.",
  "signin.join.chooseTier": "Escolhe o teu nível",
  "signin.join.tier.studio.title": "Só <em>Studio</em>",
  "signin.join.tier.studio.body":
    "Tudo no Studio: o set semanal do conselho, salas ao vivo, o catálogo completo, áudio sem perdas, subscrições diretas a artistas.",
  "signin.join.tier.studio.incl":
    "{sharePercent} da tua quota chega a artistas por reprodução",
  "signin.join.tier.coop.badge": "Melhor valor",
  "signin.join.tier.coop.title": "Toda a <em>cooperativa</em>",
  "signin.join.tier.coop.body":
    "Studio <em>mais</em> Cinema, Magazine, Eventos, grupos de leitura e um voto na assembleia anual. Uma só assinatura, toda a QueerPulse.",
  "signin.join.tier.coop.incl": "Uma conta em todos os espaços",
  "signin.join.submitCta": "Continuar para o pagamento",
  "signin.join.alreadyMember": "Já és pessoa da comunidade?",
  "signin.join.notReady": "Ainda não tens a certeza?",
  "signin.join.freeCta": "Ouve primeiro um set grátis",
  "signin.perMonth": "/mês",

  // ── Assistente de boas-vindas (StudioWelcomePage) ─────────────────────────
  "welcome.eyebrow": "Já entraste · vamos preparar o Studio para ti",
  "welcome.title": "Bem-vinde ao <em>Studio</em>, {name}.",
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
    "Um toque no leitor envia isto diretamente à pessoa artista: <em>100%, sem corte</em>. Muda quando quiseres.",
  "welcome.skipCta": "Saltar",
  "welcome.tip.nod": "um aceno",
  "welcome.tip.coffee": "um café",
  "welcome.tip.round": "uma rodada",
  "welcome.tip.record": "um disco",
  "welcome.step3.title": "Quanta <em>privacidade</em> queres?",
  "welcome.step3.dek":
    "As nossas predefinições são as mais cuidadosas. <em>Nada aqui está ativo a menos que o ligues.</em>",
  "welcome.step3.history.title": "Guardar o meu histórico de audição",
  "welcome.step3.history.body":
    "Um registo privado e apagável que só tu vês. Desligado por omissão: nada sai do teu navegador.",
  "welcome.step3.tipNotes.title": "Tornar públicas as minhas notas de gorjeta",
  "welcome.step3.tipNotes.body":
    "Desligado mantém cada nota entre ti e a pessoa artista. Podes mudar qualquer nota depois.",
  "welcome.step3.librarySync.title":
    "Sincronizar a minha biblioteca entre dispositivos",
  "welcome.step3.librarySync.body":
    "As gravações e os seguimentos acompanham-te. Ligado por omissão. Desliga para manter só neste dispositivo.",
  "welcome.enterRoomCta": "Abrir o Studio",
  "welcome.readyToast": "O Studio está pronto para ti",

  // ── Sobre a cooperativa (StudioAboutPage + StudioAboutSections) ──────────

  "about.sec.rate.num": "02: a taxa",
  "about.sec.rate.heading":
    "0,05 € por reprodução. Um <em>piso</em> a que estamos mesmo obrigados.",
  "about.sec.rate.p1":
    "Comprometemo-nos a <strong>0,05 € por reprodução válida</strong>: cerca de quinze vezes o que o Spotify paga. Uma reprodução válida tem pelo menos 30 segundos, com um limite de um pagamento por pessoa a ouvir, por dia, para que ninguém possa fazer batota. O piso pode subir por maioria simples na assembleia; só pode <em>descer</em> com maioria de dois terços. Na prática, isso significa que não desce.",
  "about.sec.rate.footnote":
    "Para comparação: a 0,003 € por reprodução, uma música precisa de cerca de 330 000 reproduções para ganhar o que aqui ganha em 20 000. Não estamos a fingir que é uma diferença pequena.",

  "about.rate.cell.floor.value": "<em>0,05 €</em>",
  "about.rate.cell.floor.label": "por reprodução válida · o piso",
  "about.rate.cell.share.value": "<em>80</em>%",
  "about.rate.cell.share.label":
    "da receita de subscrições para artistas, por reprodução",
  "about.rate.cell.tip.value": "<em>100</em>%",
  "about.rate.cell.tip.label":
    "de cada gorjeta, sem corte da plataforma, nunca",

  "about.sec.ceiling.num": "03: o que uma pessoa artista pode realmente ganhar",
  "about.sec.ceiling.heading": "Honestos quanto ao <em>teto</em>.",
  "about.sec.ceiling.p1":
    "A maioria das páginas sobre a «economia de quem cria» mostra-te o top 0,1% e deixa-te presumir que és tu. Aqui está o que a taxa realmente produz em quatro níveis reais de audição, e onde para.",

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
    "O Studio <em>não</em> vai substituir um rendimento de digressão, e não vamos fingir que consegue. Pode, plausivelmente, pagar a renda enquanto fazes a próxima coisa.",
  "about.tierFoot":
    "Isto não são projeções de um pitch deck. São a taxa real por reprodução do livro-razão ao vivo, multiplicada por contagens de reproduções honestas. <em>Os números reais são públicos, todas as segundas-feiras ao meio-dia.</em>",

  "about.sec.governance.num": "04: quem decide",
  "about.sec.governance.heading":
    "Um <em>conselho</em> eleito, com mandato limitado, registado publicamente.",
  "about.sec.governance.p1":
    "Seis pessoas programam o set semanal, tratam da triagem de submissões e escrevem um parágrafo a justificar cada escolha. São eleitas por toda a cooperativa na assembleia anual, recebem uma ajuda de custo fixa de 400 €/mês que aparece no livro-razão público, e têm mandatos limitados a dois anos com rotação obrigatória. <strong>Nenhum algoritmo decide quem é ouvido.</strong> É uma pessoa que decide, e assina o nome por baixo.",
  "about.sec.governance.p2":
    "O piso por audição e as percentagens da divisão são definidos anualmente por votação conjunta de apoiantes e artistas, com quórum de 20%. Se achas que a taxa está errada, não escreves ao apoio ao cliente. <em>Votas, ou candidatas-te.</em>",

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

  "about.cta.join": "Junta-te ao Studio",
  "about.cta.ledger": "Ler o livro-razão público",

  // ── Acessibilidade (StudioAccessibilityPage) ──────────────────────────────
  "accessibility.statement.p1":
    "O QueerPulse Studio compromete-se a cumprir a <em>WCAG 2.2 AA</em> em todas as superfícies, e a tratar a acessibilidade como um requisito de produto central, integrado desde o início. Pessoas surdas e com dificuldades auditivas devem poder usar uma plataforma de música. O mesmo vale para pessoas cegas e com baixa visão, pessoas que navegam pelo teclado, e pessoas que precisam de palavras na sua própria língua.",
  "accessibility.statement.p2":
    "Testamos com leitores de ecrã reais e pessoas reais (pagas, da nossa própria comunidade) em cada lançamento. <em>Se algo aqui não funcionar para ti, isso é um erro, e queremos o teu relatório.</em>",

  "accessibility.group.deaf.heading":
    "Para pessoas surdas e com <em>dificuldades auditivas</em>",
  "accessibility.group.deaf.dek":
    "Uma plataforma de música não pode fingir que toda a gente ouve da mesma forma. Por isso legendamos a conversa e mostramos as palavras.",
  "accessibility.item.captions.heading": "Salas <em>ao vivo</em> legendadas",
  "accessibility.item.captions.body":
    "Cada transmissão é legendada automaticamente em tempo real; as transmissões do conselho recebem uma <em>revisão humana</em>. A conversa entre músicas, as dedicatórias, os comentários da pessoa artista: tudo transcrito e com tamanho ajustável.",
  "accessibility.item.lyrics.heading": "Letras <em>sincronizadas</em>",
  "accessibility.item.lyrics.body":
    "Quando a pessoa artista as disponibiliza, as letras avançam ao ritmo da reprodução, com a linha atual destacada. Também podes lê-las como uma folha estática, em qualquer faixa.",
  "accessibility.item.waveforms.heading": "<em>Formas de onda</em> visuais",
  "accessibility.item.waveforms.body":
    "As salas ao vivo e as faixas mostram uma forma de onda em tempo real ligada ao áudio real, para que o ritmo e a dinâmica sejam visíveis além de audíveis.",
  "accessibility.item.signed.heading": "Transmissões <em>com intérprete</em>",
  "accessibility.item.signed.body":
    "As transmissões principais do conselho incluem uma janela de interpretação em Língua Gestual Portuguesa (LGP). A expandir para as salas ao vivo semanais no próximo trimestre.",

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
    "A interface do Studio está disponível em português, inglês, espanhol e francês, com mais línguas à medida que a comunidade as traduz. Define-a em Definições, depois Legendas e letras.",

  "accessibility.group.lowVision.heading":
    "Para navegação por <em>baixa visão</em> e teclado",
  "accessibility.group.lowVision.dek":
    "Todo o leitor é operável sem rato, e os temas claro e escuro foram construídos para ter contraste além de atmosfera.",
  "accessibility.item.contrast.heading": "Contraste que <em>passa</em>",
  "accessibility.item.contrast.body":
    "O texto principal está a 4,5:1 ou melhor nos dois temas; os elementos interativos a um mínimo de 3:1, com um modo de alto contraste que reforça tudo ainda mais. Os anéis de foco estão sempre visíveis.",
  "accessibility.item.screenReader.heading":
    "Notas para leitor de ecrã no <em>leitor</em>",
  "accessibility.item.screenReader.body":
    "O leitor persistente anuncia a faixa, a pessoa artista, o tempo decorrido, e <em>quanto esta audição paga à pessoa artista</em>. Dar gorjeta e guardar são botões com etiqueta; a lista de gorjetas ao vivo é uma região viva ARIA educada, de ritmo suave.",
  "accessibility.item.reducedMotion.heading":
    "Respeita o <em>movimento reduzido</em>",
  "accessibility.item.reducedMotion.body":
    "Toda a animação decorativa (o ponto pulsante, as formas de onda, as barras do equalizador) imobiliza-se quando o teu sistema pede movimento reduzido. Nada essencial se move.",

  "accessibility.status.inProgress": "Em curso",

  "accessibility.shortcuts.title": "Atalhos de <em>teclado</em> do leitor",
  "accessibility.shortcuts.dek":
    "Funcionam em qualquer página do Studio enquanto houver música na fila, exceto quando estás a escrever num campo",

  "accessibility.contact.meta":
    "Última auditoria: 2 jun. 2026 · WCAG 2.2 AA · NVDA, VoiceOver, TalkBack · próxima auditoria: set. 2026",

  // ── Ajuda e perguntas frequentes (StudioHelpPage + StudioHelpFaq) ─────────

  "help.faq.moneyGo.q": "Para onde vai realmente o meu dinheiro?",
  "help.faq.moneyGo.a":
    "Da tua assinatura, <strong>80% chega a artistas</strong> por reprodução, com um piso de 0,05 € cada. <em>Cada cêntimo de cada gorjeta</em> vai para a pessoa artista sem corte da plataforma. O resto financia ajudas de custo de curadoria, infraestrutura e o fundo de solidariedade. Podes ver a divisão exata no <a>livro-razão público</a>, atualizado toda a segunda-feira ao meio-dia.",
  "help.faq.tipNoAccount.q": "Posso dar gorjeta sem ter conta?",
  "help.faq.tipNoAccount.a":
    "Podes <em>ouvir</em> um set de demonstração grátis, mas dar gorjeta exige uma conta, para que o dinheiro possa chegar à pessoa artista e te seja emitido um recibo. O registo demora menos de um minuto e o primeiro mês é por nossa conta.",
  "help.faq.tipNotesPrivate.q": "As minhas notas de gorjeta são privadas?",
  "help.faq.tipNotesPrivate.a":
    "<strong>Sim, por defeito.</strong> Uma nota que escreves com uma gorjeta só é vista por ti e pela pessoa artista. Podes optar por tornar as notas semipúblicas ou públicas em <a>Definições</a>, e mudar qualquer nota depois.",

  "help.faq.priceDiff.q": "Qual é a diferença entre 7 € e 11 €?",
  "help.faq.priceDiff.a":
    "<strong>7 €/mês</strong> é só o Studio. <strong>11 €/mês</strong> é toda a cooperativa QueerPulse: Studio mais Cinema, Magazine, Eventos, grupos de leitura e um voto na assembleia anual. Uma só assinatura, todos os espaços. Muda de nível em qualquer mês.",
  "help.faq.cancel.q": "Como cancelo?",
  "help.faq.cancel.a":
    'Um clique em <a>Definições, depois Apagar e sair</a>. Sem chamada de retenção, sem ciclo de "tens a certeza", sem emails a insistir. Achamos que sair devia ser tão fácil como entrar. É a única forma honesta de te pedir para ficares.',

  "help.faq.getPaid.q": "Quando e como sou pago?",
  "help.faq.getPaid.a":
    'Mensalmente, no dia 5, com um piso de 5 €. SEPA ou Stripe Connect. Vês a taxa por reprodução desse mês, os números de cada entrada no livro-razão e a divisão por lançamento. Quem colabora é pago <em>diretamente</em>. Não há uma carteira de "artista principal". Consulta <a>Pagamentos</a>.',
  "help.faq.realisticEarn.q": "O que posso realisticamente ganhar?",
  "help.faq.realisticEarn.a":
    "Somos honestos quanto ao teto: cerca de 74 €/mês ocasional, 340 €/mês em crescimento, 1820 €/mês consolidado. O Studio não vai substituir um rendimento de digressão, mas pode substituir a renda. A explicação completa está em <a>Sobre o Studio</a>.",

  "help.statusOperational": "Todos os sistemas operacionais ·",

  // ── Kit de imprensa do artista (StudioPressPage + StudioPressBar) ─────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "press.copiedToast": "Copiado",
  "press.copyFailToast": "Não foi possível copiar",
  "press.downloadingPhotosToast":
    "A transferir fotos de imprensa · alta resolução",
  "press.downloadingPhotoToast": "A transferir foto · alta resolução",
  "press.accessRequestedToast":
    "Acesso de imprensa pedido. Vamos verificar-te uma vez",
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
  "press.section.photos": "Fotos de <em>imprensa</em>",
  "press.downloadAllCta": "Transferir tudo · alta resolução",
  "press.downloadOneHint": "Transferir em alta resolução",
  "press.section.press": "Imprensa <em>selecionada</em>",
  "press.section.boilerplate": "Factos e <em>ficha técnica</em>",
  "press.copyCta": "Copiar",
  "press.boilerplate.fullName": "Nome completo",
  "press.boilerplate.genre": "Género",
  "press.boilerplate.label": "Editora",
  "press.boilerplate.booking": "Contactos",
  "press.boilerplate.pronounce": "Pronúncia",
  "press.requestAccessCta": "Pedir acesso de imprensa",
  "press.bar.crumb": "Kit de imprensa · <em>{name}</em>",
  "press.bar.copyLinkCta": "Copiar link de imprensa",
  "press.bar.downloadAssetsCta": "Transferir recursos",
  "press.bar.copyLinkFailToast": "Não foi possível copiar o link",
  "press.bar.preparingToast": "A preparar os teus recursos de imprensa",

  // ── Confiança e termos (StudioTermsPage) ──────────────────────────────────

  "terms.deal.artists.title":
    "As pessoas artistas ficam com <em>80%</em> e com os seus masters",
  "terms.deal.artists.body":
    "A divisão vive no estatuto da cooperativa, vinculada por lei. <em>O piso sobe livremente e só pode descer com uma votação de dois terços.</em>",
  "terms.deal.tips.title": "As gorjetas são <em>100%</em>, sempre",
  "terms.deal.tips.body":
    "Sem corte da plataforma nas gorjetas, nunca. Isto não está sujeito a votação. É uma cláusula fundadora.",
  "terms.deal.data.title": "Os teus dados <em>nunca</em> são vendidos",
  "terms.deal.data.body":
    "Ficam dentro da cooperativa e servem exatamente uma coisa: pagar a quem faz música. O histórico está desligado por defeito e é apagável num toque.",
  "terms.deal.leaving.title": "Sair é <em>uma página</em>",
  "terms.deal.leaving.body":
    "A remoção do teu trabalho demora 14 dias, e fechas a conta com um clique. As reproduções passadas continuam pagas de qualquer forma.",

  "terms.sec.deed.num": "01: o estatuto da cooperativa",
  "terms.sec.deed.heading": "O que significa isto ser <em>teu</em>.",
  "terms.sec.deed.p1":
    "O QueerPulse Studio é uma cooperativa registada. As pessoas, quem ouve e quem faz música, são as suas proprietárias. Isto não é uma imagem de marca: é uma estrutura legal com um estatuto que podes ler, e que vincula quem a gere.",
  "terms.sec.deed.p2":
    "O estatuto fixa três coisas que quem está no comando <strong>não pode mudar em segredo</strong>: o piso de 80% para artistas, a passagem de 100% das gorjetas, e o livro-razão público. Baixar o piso exige uma maioria de dois terços de toda a cooperativa. O conselho é <em>eleito, com mandato limitado, e pago no livro-razão</em>. Não há ações de fundador nem veto de investidores.",
  "terms.sec.deed.pull":
    "Se alguma vez começarmos a agir como uma empresa que por acaso tem bons valores, o estatuto é aquilo a que nos podes obrigar.",
  "terms.sec.deed.footnote":
    "O estatuto completo e as contas anuais da cooperativa são publicados todos os anos junto com o <a>relatório de transparência</a>.",

  "terms.sec.licences.num": "02: licenças",
  "terms.sec.licences.heading": "O que podes <em>fazer</em> com a música.",
  "terms.sec.licences.p1":
    "Cada lançamento indica a sua licença, escolhida pela pessoa artista. Aqui está o que cada uma significa para ti como ouvinte, e para quem quiser reutilizar o trabalho num set, num filme, ou numa remistura.",
  "terms.sec.licences.footnote":
    "Os sets de DJ são especiais: um set pode incluir faixas com licenças diferentes, e o nosso sistema encaminha o pagamento de cada faixa para quem a fez. <em>Covers são permitidos</em>; os direitos mecânicos são geridos através de um parceiro de cobrança português, e não pagamos sincronização, por isso autorizar um cover para uso em filme é contigo.",

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
    "Contagens de reproduções agregadas e anónimas alimentam o livro-razão público, para que as pessoas artistas sejam pagas e os números sejam auditáveis. Podes exportar tudo o que guardamos, ou apagá-lo, em <a>Definições, depois Apagar e sair</a>: instantaneamente, sem modal, sem necessidade de desfazer porque falamos a sério.",

  "terms.longVersions.meta":
    "termos v3.2 · privacidade v2.1 · estatuto da cooperativa 2024 · última atualização a 2 jun. 2026",
  "terms.readDeedCta": "Ler o estatuto",
  "terms.readDeedToast": "A abrir o estatuto da cooperativa…",

  // ── Direitos e remoção (StudioRightsPage) ─────────────────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "rights.promise.window.title": "Remoção em 14 dias",
  "rights.promise.window.body":
    "Confirma uma remoção e o lançamento deixa de estar disponível dentro de 14 dias, normalmente na mesma noite. As caches limpam-se, os links dão erro 404 para uma página cuidada.",
  "rights.promise.paid.title": "As reproduções passadas continuam pagas",
  "rights.promise.paid.body":
    "Cada audição até à remoção é paga no ciclo seguinte. Remover um trabalho nunca recupera dinheiro já ganho.",
  "rights.promise.banking.title": "A parte bancária não é afetada",
  "rights.promise.banking.body":
    "Uma remoção não é um encerramento de conta. Os teus dados SEPA, o teu calendário de pagamentos, as divisões com colaboradores: tudo continua ativo.",

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
    "Esta página só remove lançamentos individuais. Para encerrar a tua conta de artista, terminar a tua contribuição de apoiante e pedir uma exportação completa dos teus dados, isso está em <a>Definições, depois Apagar e sair</a>. <em>Mesmo assim, os pagamentos passados ficam contigo</em> e vamos continuar a pagar quaisquer reproduções que já tenham acontecido.",

  "rights.takedownStartedToast":
    "«{title}» entra na janela de remoção de 14 dias",
  "rights.removalCancelledToast":
    "Remoção cancelada. O lançamento continua disponível",

  // ── Modal de confirmação de remoção (StudioTakedownModal) ─────────────────
  "rights.modal.confirmAria": "Confirmar remoção de {title}",
  "rights.modal.eyebrow": "Confirmar remoção",
  "rights.modal.title": "Remover <em>{title}</em>?",
  "rights.modal.body":
    "Vai deixar de estar disponível dentro de 14 dias. Os links existentes vão passar a mostrar uma pequena página «este trabalho foi retirado pela pessoa artista». <em>Podes republicá-lo quando quiseres</em>. Os teus masters nunca saem das tuas mãos.",
  "rights.modal.keepEarned":
    "<em>Ficas com tudo o que já ganhaste.</em> Este lançamento continua pago por cada reprodução até à remoção, no ciclo seguinte.",
  "rights.modal.confirmCta": "Remover",
  "rights.modal.cancelCta": "Manter disponível",

  // ── Faixa "mais deste artista" no álbum (StudioAlbumMore) ─────────────────
  "album.more.heading": "Mais de <em>{artist}</em>",
  "album.more.artistPageCta": "Página de artista",

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
  "track.hero.eyebrow": "Faixa {current} de {total}",
  "track.hero.payMonth": "<em>{amount}</em> para {artist} este mês",
  "track.inSet.status":
    "Estás a ouvir com <b>{count}</b> pessoas no <em>set de quarta-feira</em>, programado por {curator}. A faixa {next} começa dentro de <b>{countdown}</b>.",
  "track.inSet.joinCta": "Entrar no set",
  "track.more.fullAlbumCta": "Álbum completo",
  "track.sidebar.curatorNoteLabel": "Nota de curadoria",
  "track.sidebar.splitHeading": "Para onde vai 1 € quando ouves isto",
  "track.sidebar.creditsHeading": "Créditos",
  "track.sidebar.leadSheetLabel": "Partitura",
  "track.sidebar.downloadCta": "Transferir",
  "track.lyrics.heading": "Letra & <em>tradução</em>",
  "track.lyrics.leadSheetChordsCta": "Partitura & acordes",

  // ── Página do álbum (StudioAlbumPage + Hero + Main + Sidebar) ─────────────
  "album.tabs.tracklist": "Faixas",
  "album.tabs.linerNotes": "Notas de encarte",
  "album.main.perPlaySuffix": "{amount} / reprodução",
  "album.sidebar.buyEyebrow": "O Studio está aberto para ti",
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

  // ── Página do set ao vivo (StudioSetPage) ─────────────────────────────────
  "set.page.playAria": "Reproduzir o set",
  "set.page.joinLiveRoomCta": "Entrar na sala ao vivo",
  "set.page.tracklistHeading": "A <em>lista de faixas</em>",
  "set.page.everyPlayPaysNote": "Cada reprodução paga à pessoa artista",
  "set.page.payingNowLabel": "a pagar agora",

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
  "withdrawn.hero.eyebrow": "Removido pela pessoa artista",
  "withdrawn.hero.title": "Este trabalho foi <em>removido</em>.",
  "withdrawn.hero.sub":
    "A pessoa artista removeu-o do Studio: o direito é dela, a decisão é dela. <em>Não deve nenhuma explicação</em>, e não pedimos uma.",
  "withdrawn.card.title": "O que isto <em>significa</em>",
  "withdrawn.card.body":
    "Uma remoção não é uma eliminação do trabalho em si. Os masters ficam com a pessoa artista, que pode republicá-lo quando quiser. Só significa que deixou de estar disponível aqui. Se o tivesses comprado ou guardado, continua na tua biblioteca como registo, marcado como removido.",
  "withdrawn.card.jadeLine":
    "Se deste uma gorjeta ou compraste isto, <em>cada cêntimo já chegou à pessoa artista</em> e fica com ela. Nada é recuperado.",
  "withdrawn.visitArtistCta": "Ver a página de artista",
  "withdrawn.backToPlayerCta": "Voltar ao leitor",
  "withdrawn.still.heading": "Ainda <em>disponível</em> desta pessoa artista",
  "withdrawn.still.sub":
    "O que continua disponível, e o que o conselho programou em vez disso",

  // ── Cartão final para partilha social (StudioEndCardPage) ─────────────────
  "endCard.eyebrow": "Uma cooperativa de streaming",
  "endCard.tagline": "a música, <em>paga em frente.</em>",
  "endCard.paidThisMonth": "11 940 € pagos a artistas este mês",
  "endCard.perPlayLabel": "por reprodução",
  "endCard.perTipLabel": "de cada gorjeta",
  "endCard.listenCta": "ouve com orgulho",

  // ── Conselho de curadoria (StudioCouncilPage) ─────────────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "council.hero.eyebrow": "Governação · o conselho",
  "council.hero.title":
    "Seis pessoas escolhem o que toda a gente <em>ouve</em>.",
  "council.hero.dek":
    "Eleitas todos os anos pela assembleia, recebem uma ajuda de custo fixa registada no livro-razão público, com mandatos limitados a dois anos. Programam o set semanal, tratam da triagem e escrevem as notas. <em>Tudo o que escolhem leva o nome delas.</em>",
  "council.intro.lede":
    "O conselho não é um painel de bom-gosto atrás de vidro. Ouvem em público, <em>justificam cada escolha num parágrafo</em>, e respondem pela taxa. Podes ler os cadernos, ver as seleções, e votar para as substituir.",

  "council.fact.seats.value": "<em>6</em> lugares",
  "council.fact.seats.label": "mandatos de 2 anos · escalonados",
  "council.fact.stipend.value": "<em>400 €</em>",
  "council.fact.stipend.label": "ajuda de custo mensal · no livro-razão",
  "council.fact.slates.value": "<em>52</em>",
  "council.fact.slates.label": "seleções programadas este ano",
  "council.fact.election.value": "<em>9 jun.</em>",
  "council.fact.election.label": "próxima eleição · assembleia",

  "council.notebookLabel": "Do caderno",
  "council.recentSlatesLabel": "Seleções recentes",
  "council.theirSlateCta": "Ver seleção",

  // ── Definições (StudioSettingsPage + Controls + Sections) ─────────────────

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
    "O que guardamos quando gravas uma faixa offline (só apoiantes).",
  "settings.audio.normalise.heading": "Normalizar o volume",
  "settings.audio.normalise.body":
    "Equilibra o volume entre faixas e sets. <em>Desliga</em> se quiseres a dinâmica original da pessoa artista.",

  "settings.privacy.label": "Privacidade",
  "settings.privacy.title": "O que o Studio <em>guarda</em>",
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
    "A nota que escreves ao dar uma gorjeta. <em>Privado é a predefinição</em>: só tu e a pessoa artista a leem.",
  "settings.privacy.tipNotes.private.label": "Privado",
  "settings.privacy.tipNotes.private.badge": "predefinição",
  "settings.privacy.tipNotes.private.sub":
    "Só tu e a pessoa artista. Nunca aparece na página dela nem no teu recibo público.",
  "settings.privacy.tipNotes.semi.label": "Semipúblico",
  "settings.privacy.tipNotes.semi.sub":
    "Visível para quem também apoia a mesma pessoa artista, com o teu nome de utilizador.",
  "settings.privacy.tipNotes.public.label": "Público",
  "settings.privacy.tipNotes.public.sub":
    "Qualquer pessoa pode ler na página da pessoa artista. Ainda podes ocultar qualquer nota depois.",
  "settings.privacy.tipReceipts.heading": "Recibos de gorjeta públicos",
  "settings.privacy.tipReceipts.body":
    'Cada gorjeta gera um recibo com a divisão, sem dados pessoais. Ligado, pode ser partilhado como um cartão "olha o que pagámos a quem fez esta música".',

  "settings.captions.label": "Legendas e letras",
  "settings.captions.title": "Palavras no <em>ecrã</em>",
  "settings.captions.dek":
    "As salas ao vivo têm legendas (automáticas, com revisão humana nas transmissões do conselho). As letras avançam ao ritmo da faixa quando a pessoa artista as fornece.",
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
    "O que o botão de gorjeta rápida envia. 100% chega à pessoa artista. Nunca há corte da plataforma nas gorjetas.",
  "settings.tipping.defaultAmount.heading": "Valor por defeito",
  "settings.tipping.defaultAmount.body":
    "Podes sempre escolher outro valor no momento de dar a gorjeta.",
  "settings.tipping.roundUp.heading":
    "Arredondar compras de álbuns para uma gorjeta",
  "settings.tipping.roundUp.body":
    "Um álbum de {albumPrice} passa a {roundedPrice}, e os {tipAmount} vão para a pessoa artista como gorjeta.",

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
    "Termina a tua contribuição de apoiante, remove a tua biblioteca. As gorjetas passadas continuam pagas a artistas. <em>A parte bancária, se também és artista, não é afetada.</em>",
  "settings.erase.closeAccount.cta": "Encerrar conta",
  "settings.erase.closeAccount.toast":
    "O encerramento da conta abre num fluxo à parte.",

  // ── Notificações (StudioNotificationsPage) ────────────────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "notifications.eyebrow":
    "O teu Studio · o que aconteceu enquanto estiveste fora",
  "notifications.title": "Houve <em>movimento</em> por aqui.",
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
  "notifications.action.joinRoom": "Juntar-te ao set",
  "notifications.action.rsvp": "Confirmar presença",

  // ── Modal de gorjeta (StudioTipModal — reutilizado em várias páginas) ─────
  "tipModal.dialogAria": "Dar uma gorjeta a {recipient}",
  "tipModal.closeAria": "Fechar",
  "tipModal.eyebrow": "Gorjeta · 100% para a pessoa artista",
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
    "Ainda nada em <em>{category}</em>. Explora o Studio, e tudo o que guardares aparece aqui, para voltares quando quiseres.",
  "library.empty.browseCta": "Explorar o Studio",
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
    "Ficar ao vivo: abrir uma sala ao vivo",
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
  "upload.side.files.list.loudnessTarget.value":
    "−14 LUFS, medido durante o envio",
  "upload.side.files.list.isrc.label": "Atribuição de ISRC",
  "upload.side.files.list.isrc.value": "automática",

  "upload.side.lyrics.eyebrow": "Letras e traduções",
  "upload.side.lyrics.title": "Letras <em>obrigatórias</em>, traduções pagas.",
  "upload.side.lyrics.body":
    "Carrega as letras em qualquer idioma. Para uma tradução linha a linha, o fundo de solidariedade paga <em>40 € por música</em> a quem traduz na comunidade. Mantêm a assinatura; tu aprovas antes de publicar.",
  "upload.side.lyrics.list.autoTranscribe.label": "Transcrição automática",
  "upload.side.lyrics.list.autoTranscribe.value": "grátis · ~94%",
  "upload.side.lyrics.list.communityTranslation.label":
    "Tradução da comunidade",
  "upload.side.lyrics.list.communityTranslation.value": "40 € para quem traduz",
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
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "payouts.hero.eyebrow": "Pagamentos e dados bancários",
  "payouts.hero.title": "<em>{amount}</em> chegam no dia {day}.",
  "payouts.hero.sub":
    "Pago mensalmente por transferência SEPA, com o teu recibo verde emitido automaticamente. Sem mínimos que não escolheste.",
  "payouts.hero.breakdownEyebrow": "Pagamento de {month} · discriminação",

  "payouts.summary.fromStreaming": "De reproduções",
  "payouts.summary.fromTips": "De gorjetas",
  "payouts.summary.fromAlbumBuys": "De compras de álbuns",
  "payouts.summary.directSubs": "Subscrições diretas de 3 €/mês",
  "payouts.summary.splitsRouted": "Divisões encaminhadas para outros",
  "payouts.summary.toYourIban": "Para o teu IBAN",

  "payouts.list.heading": "Pagamentos <em>recentes</em>",
  "payouts.list.exportCsv": "Exportar CSV",
  "payouts.list.status.pending": "Pendente",
  "payouts.list.status.paid": "Pago",

  "payouts.breakdown.heading": "Este mês, <em>faixa a faixa</em>",
  "payouts.breakdown.rateNote":
    "0,05 € por reprodução válida (≥30s, limitado a 1/ouvinte/faixa/dia). Atualizado todas as noites às 02:00 de Lisboa.",
  "payouts.breakdown.subtotalLabel":
    "Subtotal de reproduções · antes de divisões, gorjetas e compras",

  "payouts.sidebar.methodEyebrow": "Método de pagamento · ativo",
  "payouts.sidebar.methodHeading": "A enviar para <em>SEPA</em>",
  "payouts.sidebar.method.sepa.label": "SEPA: IBAN",
  "payouts.sidebar.method.sepa.badge": "Ativo",
  "payouts.sidebar.method.stripe.label": "Stripe Connect",
  "payouts.sidebar.method.stripe.hint": "ligado · via de reserva",
  "payouts.sidebar.method.stripe.switchCta": "Mudar",
  "payouts.sidebar.method.coopCredit.label": "Crédito da cooperativa",
  "payouts.sidebar.method.coopCredit.hint":
    "gasta na Casa do Comum, salas de ensaio · sem taxas",
  "payouts.sidebar.method.coopCredit.addCta": "Adicionar",

  "payouts.preferences.heading": "Preferências de <em>pagamento</em>",
  "payouts.preferences.threshold.label": "Limiar mínimo",
  "payouts.preferences.threshold.opt5":
    "5 € (por defeito · sai todos os meses)",
  "payouts.preferences.threshold.opt20": "20 € (trimestral · poupa nas taxas)",
  "payouts.preferences.threshold.opt100": "100 € (retido, libertado a pedido)",
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
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "program.header.eyebrow":
    "A programar a semana · segunda-feira de manhã · arrasta o que quiseres abaixo",
  "program.header.title": "Semana <em>{weekNumber}</em> · {dateRange}",
  "program.header.sub":
    "Constrói a seleção da semana: <em>uma capa, 12 a 16 faixas, 2 a 3 coleções, transmissões</em>. Publica ao meio-dia e a página inicial roda.",
  "program.header.autosave": "Guardado automaticamente · {time}, a cada tecla",
  "program.header.previewRoomCta": "Pré-visualizar o programa da semana",

  "program.publishBar.status":
    "A seleção está <em>{percent}% completa</em> · publica {publishDate} · a página inicial roda automaticamente",
  "program.publishBar.previewHomepageCta": "Pré-visualizar a página inicial",
  "program.publishBar.saveDraftCta": "Guardar rascunho",
  "program.publishBar.publishCta": "Publicar ao meio-dia",

  "program.toast.addedToSlate": "Adicionado à seleção desta semana",
  "program.toast.passed": "Recusado. Quem submeteu pode voltar a tentar depois",
  "program.toast.playingPreview": "A reproduzir pré-visualização…",
  "program.toast.openingRoomPreview": "A abrir a pré-visualização do programa…",
  "program.toast.chooseNewCover": "Escolhe uma nova pessoa artista de capa…",
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
  "program.slate.cover.count": "1 de 1 · o destaque da semana",
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
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  // Os `id` dos separadores abaixo são valores de filtro estáveis, separados das etiquetas traduzidas (§5.1).
  "triage.header.eyebrow":
    "Triagem de submissões · o conselho responde a cada submissão em 14 dias",
  "triage.header.title":
    "Caixa de entrada · <em>{count}</em> novas esta semana.",
  "triage.header.sub":
    "Cada submissão é lida ou ouvida. <em>Recusar</em> exige uma frase: essa frase torna-se a resposta à pessoa artista. Tempo médio de resposta esta época: {days} dias.",

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
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  // O `verb` guardado ao resolver é um id estável, mostrado através de RESOLUTION_LABELS (§5.1).
  "flagReview.header.eyebrow": "Conselho · revisão de sinalizações",
  "flagReview.header.title": "Quando alguém <em>sinaliza</em> algo.",
  "flagReview.header.dek":
    "Quem ouve pode sinalizar um lançamento por amostras não autorizadas, créditos em falta ou atribuição incorreta. Uma pessoa da curadoria reclama cada caso, a pessoa artista identificada pode responder, e <em>cada decisão fica registada com um motivo</em>. Nada é removido em silêncio.",

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
  "flagReview.toast.correctionRequested": "Correção pedida à pessoa artista",
  "flagReview.toast.heldUntilCorrected": "Retido até corrigir",

  // ── Sala ao vivo (StudioLivePage + LiveNow + LiveChat) ────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  // Os `id` dos separadores do chat são valores estáveis, separados das etiquetas traduzidas (§5.1).
  "live.ribbon.onAirNow": "No ar agora",

  "liveNow.saveTrackCta": "Guardar faixa",
  "liveNow.savedCta": "Guardada",
  "liveNow.savedToast": "Faixa guardada na tua biblioteca",
  "liveNow.removedToast": "Removida da tua biblioteca",
  "liveNow.lyricsNotesCta": "Letra e notas",
  "liveNow.listenersLabel":
    "a ouvir contigo · {sustainers} apoiantes, {casual} ocasionais",
  "liveNow.tippedLabel": "em gorjetas durante este set · 100% para artistas",
  "liveNow.perPlayLabel": "por reprodução válida · paga a {artist} agora mesmo",
  "liveNow.setBuilding.heading": "O set · <em>a construir-se ao vivo</em>",
  "liveNow.trackPosition": "Faixa {current} de {total} · saltou da fila",
  "liveNow.tipArtistCta": "Dar {amount} a {artist}",

  "liveChat.tabs.chat.label": "Chat",
  "liveChat.tabs.tips.label": "Gorjetas",
  "liveChat.tabs.listeners.label": "Ouvintes",
  "liveChat.inputPlaceholder": "diz algo a quem está a ouvir…",
  "liveChat.sendAria": "Enviar",
  "liveChat.tipPresetCta": "Dar {amount}",
  "liveChat.tipCustomCta": "Dar __ €",

  // ── Consola de transmissão ao vivo (StudioBroadcastPage + Console) ───────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "broadcast.status.onAir": "Estás <em>no ar</em>",
  "broadcast.status.livePill": "ao vivo",
  "broadcast.status.meta":
    "<em>{count}</em> a ouvir · {sustainers} apoiantes · {cities} cidades",
  "broadcast.status.pauseMicCta": "Pausar microfone",
  "broadcast.status.endBroadcastCta": "Terminar transmissão",
  "broadcast.status.toast.micPaused":
    "Microfone em pausa. O público ouve silêncio",
  "broadcast.status.toast.ending":
    "A transmissão termina em 5… a arquivar como reposição",

  "broadcast.audioIn.panelLabel": "Entrada de áudio",
  "broadcast.audioIn.singleCamVideo": "Vídeo de uma câmara",
  "broadcast.audioIn.cameraNote":
    "Só áudio é a predefinição para salas ao vivo. A câmara chega na Fase 5, por agora está desativada.",

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
    "Faixas correspondidas pagam a artistas automaticamente a partir do pagamento deste set. <em>Faixas retidas esperam</em> até o sistema de correspondência do conselho as validar. Ninguém perde um cêntimo entretanto.",

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
  "sheet.preview.lockedPages":
    "As páginas {from} a {to} desbloqueiam na compra",
  "sheet.preview.transcribedBy": "Transcrito por <em>{name}</em>",
  "sheet.preview.transcriberRole": "Transcrição da comunidade",
  "sheet.preview.transcriberNote":
    "<em>a tua compra paga diretamente a quem transcreve</em>",

  "sheet.checkout.title": "A tua <em>descarga</em>",
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
    "taxa mais baixa, liquidação em 1 a 2 dias",
  "sheet.checkout.paidLabel": "Pago",
  "sheet.checkout.downloadingLabel": "a descarregar o PDF…",
  "sheet.checkout.payCta": "Pagar {amount} & descarregar",
  "sheet.checkout.note":
    "Descarga imediata · descarrega outra vez quando quiseres a partir da tua biblioteca · <em>quem fez isto é pago esta noite</em>.",
  "sheet.checkout.downloadedToast":
    "Descarregado: {amount} pagos a {names} esta noite",

  "sheet.also.heading": "Da mesma <em>transcrição</em>",
  "sheet.also.subtitle_one":
    "{name} · {count} partitura · {amount} chega a quem transcreve por descarga",
  "sheet.also.subtitle_other":
    "{name} · {count} partituras · {amount} chega a quem transcreve por descarga",
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
  "receipt.split.platformName": "Plataforma · Studio",
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
    "1200 € sem restrições para pessoas membros estreantes na leva da primavera.",
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
  "fund.apply.seeGrantsCta": "Ver bolsas & concursos abertos",

  // ── Concursos abertos & encomendas (StudioOpenCallsPage + Card + Skeleton) ──
  "calls.hero.eyebrow": "Da parte do conselho",
  "calls.hero.title": "Concursos <em>abertos</em> & encomendas.",
  "calls.hero.dek":
    "Propostas financiadas pelo conselho e pela cooperativa. Candidata-te diretamente: anexa <em>uma única faixa ou edição</em> do teu catálogo. Sem cartas de apresentação, sem portefólios; o trabalho fala por si.",

  "calls.filter.all": "Tudo aberto",
  "calls.filter.commissions": "Encomendas",
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
  "setSubmission.matcher.runCta": "Correr o comparador",
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
  "offAir.hero.roomDark": "em silêncio esta noite",
  "offAir.hero.title": "O Studio está <em>fora do ar</em> esta noite.",
  "offAir.hero.untilDoors": "até abrir",
  "offAir.hero.nextBroadcastLabel": "Próxima transmissão · {time} Lisboa",
  "offAir.hero.nightcapEyebrow": "O acalanto de ontem à noite",
  "offAir.hero.replayAria": "Repetir o acalanto",
  "offAir.hero.replayingToast": "A repetir {title}",
  "offAir.hero.paidOutSuffix": "{amount} pagos · repete quando quiseres",

  // ── Teaser em modo live (StudioComingSoonPage e as suas quatro cenas) ─────
  // Aparece em todas as rotas /studio/* quando o modo demo está desligado. O
  // Studio ainda não tem backend e não pode mostrar valores inventados. Nenhuma
  // destas linhas fala de preços, divisões ou planos de subscrição.
  "comingSoon.metaTitle": "Studio QueerPulse: em breve",
  "comingSoon.description":
    "A nossa plataforma de música em cooperativa para artistas queer perto de ti ainda está a ser construída. Nada está a tocar e nada está à venda. Anunciamos aqui quando entrarmos no ar.",
  "comingSoon.hero.eyebrow": "Studio QueerPulse",
  "comingSoon.hero.onAir": "No ar",
  "comingSoon.hero.title": "Os microfones estão <em>a aquecer</em>.",
  "comingSoon.hero.lede":
    "Estamos a construir uma casa para a música queer feita perto de nós: artistas com páginas próprias, sets ao vivo de palcos locais e uma plataforma gerida em conjunto por quem a usa.",
  "comingSoon.hero.status":
    "Ainda não abriu. Nada está a tocar e nada está à venda.",
  "comingSoon.preview.eyebrow": "Uma primeira audição",
  "comingSoon.preview.title": "Como <em>vai soar</em>",
  "comingSoon.preview.sideLabel": "Lado A",
  "comingSoon.preview.trackLabel": "Faixa A{number}",
  "comingSoon.preview.artists.title": "Artistas à frente",
  "comingSoon.preview.artists.body":
    "Cada artista tem uma página própria para os seus discos, a sua história e os seus concertos. O plano é que quem faz a música mantenha os seus masters e possa lançar noutros sítios também.",
  "comingSoon.preview.live.title": "Ao vivo, aqui perto",
  "comingSoon.preview.live.body":
    "Sets gravados em noites locais, open mics e palcos pequenos, para ouvires a cena à tua volta, incluindo as noites que perdeste.",
  "comingSoon.preview.together.title": "De quem toca e de quem ouve",
  "comingSoon.preview.together.body":
    "O plano é uma cooperativa, com artistas e ouvintes a decidir em conjunto o que toca e para onde vai o dinheiro. Legendas e transcrições dos sets ao vivo fazem parte disto desde o início.",
  "comingSoon.why.eyebrow": "Porque importa",
  "comingSoon.why.quote":
    "Uma cena soa a si própria quando <em>somos nós a gravar</em>.",
  "comingSoon.why.p1":
    "A música queer feita por pessoas queer traz o que um ouvido de fora não apanha: as noites de clube, os coros, as demos gravadas no quarto, as canções que ajudaram tanta gente a aguentar. Para muita gente, foi o primeiro sítio onde se ouviu.",
  "comingSoon.why.p2":
    "A maioria de quem faz música em pequena escala toca meia dúzia de concertos, publica numa plataforma feita para outra gente e perde-se no algoritmo. Muito pouco do que faz lhe volta às mãos.",
  "comingSoon.why.p3":
    "Ouvir artistas locais, partilhar as suas faixas e aparecer nos seus concertos é o que lhes permite fazer o próximo disco. É para isso que este Studio existe.",
  "comingSoon.closing.title": "Entramos no ar <em>quando estiver pronto</em>.",
  "comingSoon.closing.body":
    "Vamos anunciar a primeira emissão aqui mesmo. Até lá, a revista é o melhor sítio para acompanhar o que andamos a fazer.",
  "comingSoon.magazineCta": "Ler a revista",
  "comingSoon.backHome": "Voltar ao início",

  // ── sweep no-literal-string: legendas reutilizáveis do ImageSlot ─────────
  "media.coverLabel": "capa",
  "media.scoreLabel": "partitura",
  "media.setArtLabel": "arte do set",
  "media.portraitLabel": "retrato",
  "media.trackLabel": "faixa",

  // ── sweep no-literal-string: linhas "de <artista> · <factos>" ────────────
  "albumHero.byLine": "de <strong>{artist}</strong> · {year} · {location}",
  "artist.sidebar.perMonthSuffix": "/mês",
  "liveNow.onAirTag": "no ar",
  "liveNow.byFromLine":
    "de <strong>{artist}</strong> · do álbum <em>{album}</em>",
  "liveNow.setBuilding.activityLine":
    "{curator} escreveu a próxima faixa <em>{elapsed}</em>",
  "live.ribbon.showLine": '"{title}" · programado e apresentado por {host}',
  "track.hero.byFromLine":
    "de <strong>{artist}</strong> · do álbum <em>{album}</em> · {year}",
  "track.page.crumbLabel": "faixa {number}",

  // ── sweep no-literal-string: eyebrows/etiquetas diversas ──────────────────
  "album.sidebar.splitHint":
    "Se comprares por {price}: <em>{artistShare} para {artist}</em>, {solidarityShare} para o fundo de solidariedade, {platformShare} para a plataforma, processamento absorvido.",
  "flagReview.reviewedByLine": "Revisto por <em>{reviewer}</em>",
  "set.page.programmedByEyebrow": "Set · com curadoria de {curator}",
  "sheet.checkout.leadSheetLabel": "Partitura principal: {title}",
  // ── Studio v1 (2026-10-08) ─────────────────────────────────────────────────
  "gate.loadingLabel": "A carregar o Studio",
  "kind.musician": "Música",
  "kind.dj": "DJ",
  "releaseType.album": "Álbum",
  "releaseType.ep": "EP",
  "releaseType.single": "Single",
  "releaseType.mix": "Mix",
  "releaseStatus.draft": "Rascunho",
  "releaseStatus.published": "Publicado",
  "releaseStatus.taken_down": "Retirado",
  "genre.pop": "Pop",
  "genre.hipHop": "Hip-hop",
  "genre.rAndB": "R&B",
  "genre.rock": "Rock",
  "genre.jazz": "Jazz",
  "genre.classical": "Clássica",
  "genre.ambient": "Ambient",
  "genre.other": "Outro",
  "facts.trackCount_one": "{count} faixa",
  "facts.trackCount_other": "{count} faixas",
  "facts.minutes_one": "{count} min",
  "facts.minutes_other": "{count} min",
  "card.playRelease": "Ouvir {title}",
  "card.pauseRelease": "Pausar {title}",
  "states.notFoundTitle": "Não encontramos isso no Studio",
  "states.notFoundBody":
    "Pode ter sido removido, ou o link pode estar desatualizado",
  "states.backHomeCta": "Voltar ao início do Studio",
  "states.loadingLabel": "A carregar",
  "save.saveCta": "Guardar",
  "save.saveReleaseCta": "Guardar {title}",
  "save.removeSavedCta": "Tirar {title} dos guardados",
  "save.savedLabel": "Guardado",
  "save.savedToast": "Guardado",
  "save.removedToast": "Removido dos guardados",

  // ── Liked songs (StudioLikeButton, StudioLikedPage) ─────────────────────
  "like.cta": "Gosto",
  "like.trackAria": "Gosto de {title}",
  "like.addedToast": "Adicionada a Músicas de que gostas",
  "like.removedToast": "Removida de Músicas de que gostas",
  "liked.title": "Músicas de que gostas",
  "liked.page.privateNote": "Só tu vês aqui as músicas de que gostas",
  "liked.page.emptyTitle": "As músicas de que gostas vão aparecer aqui",
  "liked.page.emptyBody":
    "Toca no coração de qualquer faixa para a guardares em Músicas de que gostas",
  "liked.page.showMore": "Mostrar mais músicas",
  "liked.page.loadingMore": "A carregar mais músicas",
  "liked.page.loadMoreError":
    "Não conseguimos carregar mais músicas de que gostas",
  "errors.generic": "Algo correu mal. Tenta de novo",
  "errors.accessRequired": "O teu acesso ao Studio terminou",
  "errors.notPersonaOwner":
    "Só quem gere a persona pode alterar os lançamentos dela",
  "errors.personaKindNotAllowed":
    "Só personas de música, podcast, spoken word ou performance podem lançar no Studio",
  "errors.releaseNotDraft": "Este lançamento já não é um rascunho",
  "errors.releaseTypeMismatch":
    "Esse tipo de lançamento não serve para esta persona",
  "errors.trackOrderMismatch":
    "A lista de faixas mudou. Recarrega a página e tenta de novo",
  "errors.trackLimit": "Um lançamento leva até 50 faixas",
  "errors.audioUnreadable":
    "Não conseguimos ler este ficheiro. Experimenta outro MP3 ou M4A",
  "errors.audioWrongOwner": "Esse ficheiro pertence a outra persona",
  "shell.searchLabel": "Pesquisar no Studio",
  "shell.searchPlaceholderLive": "pesquisar artistas, lançamentos, faixas…",
  "shell.accountLabel": "A tua conta, {name}",
  "shell.menu.library": "A tua biblioteca",
  "shell.menu.artistPages": "As tuas páginas de artista",
  "shell.menu.dashboard": "Painel de artista",
  "shell.menu.settings": "Definições",
  "shell.menu.backToQueerPulse": "Voltar ao QueerPulse",
  "shell.tabs.label": "Secções do Studio",
  "shell.sheet.label": "Menu do Studio",
  "shell.sheet.close": "Fechar menu",
  "shell.sheet.more": "Mais no Studio",
  "shell.uploadShort": "Carregar",
  "shell.sustainShort": "Contribuir",
  "shell.tabs.openCalls": "Concursos",
  "shell.uploadCta": "Carregar um lançamento",
  "creator.avatarLabel": "A carregar como {name}",
  "rail.v1.navLabel": "Studio",
  "rail.v1.search": "Pesquisar",
  "rail.v1.yourMusic": "A tua música",
  "rail.v1.upload": "Carregar um lançamento",
  "rail.v1.yourReleases": "Os teus lançamentos · {name}",
  "home.hero.eyebrow": "Lançamento mais recente",
  "home.hero.byLine": "de <strong>{artist}</strong> · {facts}",
  "home.empty.title": "Ainda não há lançamentos",
  "home.empty.body": "Quando artistas e DJs publicarem música, aparece aqui",
  "home.empty.uploadCta": "Carrega o teu primeiro lançamento",
  "home.newReleases.title": "Novos <em>lançamentos</em>",
  "home.newReleases.showMore": "Mostrar mais lançamentos",
  "home.newReleases.loadingMore": "A carregar mais lançamentos",
  "home.newReleases.loadMoreError": "Não conseguimos carregar mais lançamentos",
  "home.artists.title": "<em>Artistas</em>",
  "artistPage.tabsLabel": "Secções de {name}",
  "artistPage.releaseCount_one": "{count} lançamento",
  "artistPage.releaseCount_other": "{count} lançamentos",
  "artistPage.playAll": "Ouvir todos os lançamentos de {name}",
  "artistPage.viewProfile": "Ver perfil",
  "artistPage.noBio": "Ainda sem biografia",
  "artistPage.noReleases": "Ainda não há lançamentos",
  "artistPage.section.playlists": "Playlists <em>públicas</em>",
  "owner.heading": "Os teus lançamentos",
  "owner.edit": "Editar",
  "owner.editAria": "Editar {title}",
  "owner.publish": "Publicar",
  "owner.publishAria": "Publicar {title}",
  "owner.unpublish": "Despublicar",
  "owner.unpublishAria": "Despublicar {title}",
  "owner.delete": "Apagar",
  "owner.deleteAria": "Apagar {title}",
  "owner.deleteTitle": "Apagar {title}?",
  "owner.deleteBody": "O rascunho e o áudio carregado são apagados de vez",
  "owner.deleteConfirm": "Apagar rascunho",
  "owner.unpublishTitle": "Despublicar {title}?",
  "owner.unpublishBody":
    "Volta a rascunho e sai do Studio até o publicares de novo",
  "owner.unpublishConfirm": "Despublicar lançamento",
  "owner.takedownReason": "Retirado pela nossa equipa: {reason}",
  "release.by": "de",
  "release.tabsLabel": "Secções de {title}",
  "release.tracklistLabel": "Alinhamento de {title}",
  "release.playTrack": "Ouvir {title}",
  "release.pauseTrack": "Pausar {title}",
  "release.nowPlaying": "A tocar agora",
  "release.processing": "A processar",
  "release.explicit": "Explícito",
  "release.explicitShort": "E",
  "release.moreActions": "Mais ações",
  "release.report": "Denunciar lançamento",
  "trackPage.byLine":
    "de <strong>{artist}</strong> · do lançamento <em>{release}</em>",
  "trackPage.crumbLabel": "Caminho",
  "trackPage.lyricsHeading": "Letra",
  "trackPage.noLyrics": "Esta faixa não tem letra",
  "trackPage.noCredits": "Ainda sem créditos",
  "trackPage.fullReleaseCta": "Abrir o lançamento completo",
  "searchPage.filter.releases": "Lançamentos",
  "searchPage.filter.tracks": "Faixas",
  "searchPage.filtersLabel": "Filtrar resultados",
  "searchPage.inputLabel": "Pesquisar lançamentos, faixas e artistas",
  "searchPage.resultCount_one": "{count} resultado",
  "searchPage.resultCount_other": "{count} resultados",
  "searchPage.section.releases": "<em>Lançamentos</em>",
  "searchPage.section.tracks": "<em>Faixas</em>",
  "searchPage.section.artists": "<em>Artistas</em>",
  "searchPage.clearCta": "Limpar pesquisa",
  "playerBar.regionLabel": "Leitor do Studio",
  "playerBar.play": "Reproduzir",
  "playerBar.pause": "Pausar",
  "playerBar.previous": "Faixa anterior",
  "playerBar.next": "Faixa seguinte",
  "playerBar.seekLabel": "Posição na faixa",
  "playerBar.seekValue": "{elapsed} de {total}",
  "playerBar.cantPlay": "Esta faixa não pode tocar agora",
  "playerBar.retry": "Tentar a faixa de novo",
  "playerBar.close": "Fechar leitor",
  "uploadFlow.hero.title": "Põe a tua música <em>cá fora.</em>",
  "uploadFlow.hero.sub":
    "Três passos: o lançamento, as faixas e a publicação. MP3 ou M4A, até 50 MB por faixa",
  "uploadFlow.steps.label": "Passos do carregamento",
  "uploadFlow.steps.release.nm": "Lançamento",
  "uploadFlow.steps.release.sub": "· título · capa · detalhes",
  "uploadFlow.steps.tracks.nm": "Faixas",
  "uploadFlow.steps.tracks.sub": "· áudio · créditos · letras",
  "uploadFlow.steps.publish.nm": "Publicar",
  "uploadFlow.steps.publish.sub": "· verificações · direitos",
  "uploadFlow.release.heading": "O <em>lançamento</em>",
  "uploadFlow.release.sub":
    "Fica guardado como rascunho enquanto escreves. Nada fica público até publicares",
  "uploadFlow.release.personaLabel": "Lançar como",
  "uploadFlow.release.typeLabel": "Tipo",
  "uploadFlow.release.genreNone": "Sem género",
  "uploadFlow.release.dateLabel": "Data de lançamento",
  "uploadFlow.release.dateHint": "Deixa vazio para usar o dia em que publicas",
  "uploadFlow.release.descriptionLabel": "Notas do lançamento",
  "uploadFlow.release.descriptionCount": "{count} de {max}",
  "uploadFlow.release.titleRequired": "Dá um título ao lançamento",
  "uploadFlow.release.titleTooLong": "O título pode ter até 120 caracteres",
  "uploadFlow.release.descriptionTooLong":
    "As notas podem ter até 2000 caracteres",
  "uploadFlow.release.continueCta": "Guardar e passar às faixas",
  "uploadFlow.release.saveChangesCta": "Guardar alterações",
  "uploadFlow.release.changesSaved": "Alterações guardadas",
  "uploadFlow.saving": "A guardar",
  "uploadFlow.saved": "Rascunho guardado",
  "uploadFlow.cover.heading": "<em>Capa</em>",
  "uploadFlow.cover.placeholder": "Adicionar capa",
  "uploadFlow.cover.hint":
    "Uma imagem quadrada fica melhor. Podes recortá-la depois de a escolheres",
  "uploadFlow.backToRelease": "Voltar ao lançamento",
  "uploadFlow.continueToPublish": "Continuar para publicar",
  "uploadFlow.backToTracks": "Voltar às faixas",
  "uploadFlow.files.dropTitle": "Larga aqui ficheiros <em>MP3 ou M4A</em>",
  "uploadFlow.files.accepts":
    "aceita · <em>MP3 · M4A</em> · até 50 MB por faixa · até 50 faixas",
  "uploadFlow.files.chooseCta": "Escolher ficheiros de áudio",
  "uploadFlow.files.empty":
    "Ainda não há faixas. Adiciona ficheiros de áudio para começar",
  "uploadFlow.files.listLabel": "Faixas deste lançamento",
  "uploadFlow.files.rejectType": "{fileName} não é um ficheiro MP3 ou M4A",
  "uploadFlow.files.rejectSize": "{fileName} tem mais de 50 MB",
  "uploadFlow.files.rejectLimit":
    "{fileName} não entrou: um lançamento leva até 50 faixas",
  "uploadFlow.files.errorUpload":
    "O carregamento parou. Tenta de novo quando quiseres",
  "uploadFlow.files.errorTooLarge": "Este ficheiro tem mais de 50 MB",
  "uploadFlow.files.errorRemove": "Não conseguimos remover esta faixa",
  "uploadFlow.files.stage.queued": "Em espera",
  "uploadFlow.files.stage.creating": "A preparar",
  "uploadFlow.files.stage.uploading": "A carregar",
  "uploadFlow.files.stage.confirming": "A verificar o ficheiro",
  "uploadFlow.files.stage.ready": "Pronta",
  "uploadFlow.files.stage.failed": "Não carregou",
  "uploadFlow.files.stage.noAudio": "Ainda sem áudio",
  "uploadFlow.files.progressLabel":
    "Progresso do carregamento da faixa {position}, {title}",
  "uploadFlow.files.moveUp": "Subir a faixa {position}, {title}",
  "uploadFlow.files.moveDown": "Descer a faixa {position}, {title}",
  "uploadFlow.files.retry": "Tentar de novo a faixa {position}, {title}",
  "uploadFlow.files.remove": "Remover a faixa {position}, {title}",
  "uploadFlow.files.editDetails": "Editar detalhes",
  "uploadFlow.files.editDetailsFor": "Editar os detalhes de {title}",
  "uploadFlow.files.loadingDetails": "A carregar os detalhes da faixa",
  "uploadFlow.files.titleLabel": "Título da faixa",
  "uploadFlow.files.creditsLabel": "Créditos",
  "uploadFlow.files.creditName": "Nome do crédito {number}",
  "uploadFlow.files.creditRole": "Função do crédito {number}",
  "uploadFlow.files.removeCredit": "Remover o crédito {number}",
  "uploadFlow.files.addCredit": "Adicionar crédito",
  "uploadFlow.files.lyricsLabel": "Letra",
  "uploadFlow.files.explicitLabel": "Esta faixa tem letra explícita",
  "uploadFlow.files.cancelDetails": "Cancelar",
  "uploadFlow.files.saveDetails": "Guardar detalhes da faixa",
  "uploadFlow.publish.heading": "Tudo pronto para <em>publicar?</em>",
  "uploadFlow.publish.sub":
    "O teu lançamento fica disponível no Studio para todas as pessoas com acesso ao Studio",
  "uploadFlow.publish.missingLead": "Antes de publicares:",
  "uploadFlow.publish.gap.title": "Dá um título ao lançamento",
  "uploadFlow.publish.gap.cover": "Adiciona uma capa",
  "uploadFlow.publish.gap.tracks": "Adiciona pelo menos uma faixa com áudio",
  "uploadFlow.publish.gap.pending":
    "Espera que todas as faixas acabem de carregar",
  "uploadFlow.publish.gap.rights": "Confirma que tens os direitos",
  "uploadFlow.publish.ready": "Está tudo pronto",
  "uploadFlow.publish.rightsLabel":
    "Detenho ou controlo os direitos desta gravação e da capa, e aceito que quem é membro do QueerPulse a ouça em streaming.",
  "uploadFlow.publish.publishCta": "Publicar lançamento",
  "uploadFlow.publish.publishing": "A publicar",
  "uploadFlow.published.title": "<em>{title}</em> já está no ar",
  "uploadFlow.published.body":
    "Quem tem acesso ao Studio já o pode ouvir. Podes passá-lo a rascunho quando quiseres, na tua página de artista",
  "uploadFlow.published.openCta": "Abrir o lançamento",
  "uploadFlow.published.anotherCta": "Carregar outro lançamento",
  "uploadFlow.noPersona.title": "Precisas de uma persona de artista do Studio",
  "uploadFlow.noPersona.body":
    "Para carregar, precisas de uma persona publicada e aberta a todas as pessoas, de um destes tipos: música, DJ, podcast, produção de podcast, poesia, spoken word, arte drag, performance, dança, ballroom e vogue ou burlesco. Prepara uma e volta",
  "uploadFlow.noPersona.cta": "Ir para as tuas personas",
  "uploadFlow.side.eyebrow": "O que acontece aos teus ficheiros",
  "uploadFlow.side.title": "Os teus ficheiros, <em>tal como estão</em>",
  "uploadFlow.side.body":
    "Guardamos o teu áudio tal como o carregas e só o transmitimos a quem tem acesso ao Studio. Ninguém o pode descarregar",
  "uploadFlow.side.formats.label": "Formatos",
  "uploadFlow.side.formats.value": "MP3 · M4A",
  "uploadFlow.side.size.label": "Por faixa",
  "uploadFlow.side.size.value": "até 50 MB",
  "uploadFlow.side.listeners.label": "Quem pode ouvir",
  "uploadFlow.side.listeners.value": "quem tem acesso ao Studio",
  "uploadFlow.locked.takenDownTitle": "Este lançamento foi retirado",
  "uploadFlow.locked.takenDownBody":
    "Retirado pela nossa equipa: {reason}. Não pode ser editado enquanto estiver retirado",
  "uploadFlow.locked.backCta": "Voltar aos teus lançamentos",
  // ── Studio v2 (2026-10-13) ──────────────────────────────────────────────────
  "artistPage.followerCount_one": "{count} pessoa segue",
  "artistPage.followerCount_other": "{count} pessoas seguem",
  "errors.playlistLimit":
    "Podes ter até 100 playlists. Apaga uma para criares outra",
  "errors.playlistTrackLimit": "Uma playlist leva até 500 faixas",
  "errors.playlistOrderMismatch":
    "A playlist mudou. Recarrega a página e tenta outra vez",
  "errors.playlistCreditNotAllowed":
    "Essa persona não pode ser creditada agora. Mostra-a como tu, ou escolhe outra persona",
  "errors.playlistTrackUnavailable": "Essa faixa não pode ser adicionada agora",
  "playlist.visibility.public": "Pública",
  "playlist.visibility.connections": "Só ligações",
  "playlist.visibility.private": "Privada",
  "playlist.visibility.publicHint":
    "Qualquer pessoa com acesso ao Studio a pode encontrar",
  "playlist.visibility.connectionsHint":
    "Só as tuas ligações com acesso ao Studio a podem abrir",
  "playlist.visibility.privateHint": "Só tu",
  "playlist.dialog.createTitle": "Nova playlist",
  "playlist.dialog.editTitle": "Editar detalhes",
  "playlist.dialog.visibilityTitle": "Mudar a visibilidade",
  "playlist.dialog.nameLabel": "Nome",
  "playlist.dialog.namePlaceholder": "Canções para o caminho de casa",
  "playlist.dialog.nameRequired": "Dá um nome à tua playlist",
  "playlist.dialog.descriptionLabel": "Descrição",
  "playlist.dialog.descriptionHelper": "Opcional. Até 500 caracteres",
  "playlist.dialog.visibilityLegend": "Quem a pode abrir",
  "playlist.dialog.creditLegend": "Mostrar como",
  "playlist.dialog.creditYou": "Tu",
  "playlist.dialog.creditYouHint": "Mostra o teu nome e a tua foto",
  "playlist.dialog.creditPersonaHint":
    "Aparece na página Studio de {name} enquanto for pública",
  "playlist.dialog.linkOnlyNote":
    "As tuas ligações podem abri-la pelo link. Fica fora da página de {name}, para ninguém ficar a saber quem gere {name}",
  "playlist.dialog.createCta": "Criar playlist",
  "playlist.dialog.saveDetailsCta": "Guardar detalhes",
  "playlist.dialog.saveVisibilityCta": "Guardar visibilidade",
  "playlist.dialog.cancelCta": "Cancelar",
  "playlist.dialog.createdToast": "Playlist criada",
  "playlist.dialog.savedToast": "Alterações guardadas",
  "playlist.delete.title": "Apagar {name}?",
  "playlist.delete.body":
    "A playlist e a ordem das faixas desaparecem de vez. A música continua no Studio",
  "playlist.delete.confirmCta": "Apagar playlist",
  "playlist.delete.deletedToast": "Playlist apagada",
  "playlist.add.trackCta": "Adicionar a uma playlist",
  "playlist.add.trackAria": "Adicionar {title} a uma playlist",
  "playlist.add.releaseCta": "Adicionar à playlist",
  "playlist.add.pickerTitle": "Adicionar a uma playlist",
  "playlist.add.newPlaylistCta": "Criar playlist",
  "playlist.add.listLabel": "As tuas playlists",
  "playlist.add.addToAria": "Adicionar a {name}",
  "playlist.shareCta": "Partilhar playlist",
  "playlist.add.addedToast": "Adicionaste a {name}",
  "playlist.add.alreadyThereToast": "Já está em {name}",
  "playlist.add.empty": "Ainda não tens playlists. Cria uma para começar",
  "playlist.add.loadError": "Não conseguimos carregar as tuas playlists",
  "playlist.add.showMore": "Mostrar mais playlists",
  "playlist.add.loadingMore": "A carregar mais playlists",
  "playlist.add.loadMoreError": "Não conseguimos carregar mais playlists",
  "playlist.add.nothingToAdd": "Todas as faixas já estão em {name}",
  "playlist.page.eyebrow": "Playlist",
  "playlist.page.byline": "De <strong>{name}</strong>",
  "playlist.page.playAria": "Ouvir {name}",
  "playlist.page.pauseAria": "Pausar {name}",
  "playlist.page.shuffleCta": "Ouvir a playlist por ordem aleatória",
  "playlist.page.actionsLabel": "Ações da playlist",
  "playlist.page.editDetails": "Editar detalhes",
  "playlist.page.changeVisibility": "Mudar a visibilidade",
  "playlist.page.deletePlaylist": "Apagar playlist",
  "playlist.page.tracklistLabel": "Faixas em {name}",
  "playlist.page.emptyOwnerTitle": "Ainda não há nada nesta playlist",
  "playlist.page.emptyOwnerBody":
    "Adiciona faixas a partir de um lançamento, de uma faixa ou do leitor",
  "playlist.page.emptyViewerTitle": "Não há aqui nada que possas ouvir agora",
  "playlist.page.findMusicCta": "Procurar música",
  "playlist.row.unavailable": "Já não está disponível",
  "playlist.row.remove": "Tirar {title} da playlist",
  "playlist.row.removeUnavailable": "Tirar a entrada {position} da playlist",
  "playlist.row.moveUp": "Subir {title}",
  "playlist.row.moveDown": "Descer {title}",
  "playlist.row.movedStatus": "{title} está agora na posição {position}",
  "playlist.row.removedToast": "Saiu da playlist",
  "playlist.row.orderError":
    "Não conseguimos guardar a nova ordem. Tenta outra vez",
  "playlist.row.removeError": "Não conseguimos tirar isso. Tenta outra vez",
  "playlist.card.coverLabel": "Capa da playlist",
  "playlist.inThese.heading": "Nestas <em>playlists</em>",
  "searchPage.filter.playlists": "Playlists",
  "searchPage.section.playlists": "<em>Playlists</em>",
  "searchPage.genreLabel": "Género",
  "searchPage.genreAny": "Qualquer género",
  "home.genres.heading": "Explorar por <em>género</em>",
  "home.genres.listLabel": "Géneros",
  "browse.eyebrow": "Explorar",
  "browse.title": "Lançamentos de <em>{genre}</em>",
  "browse.titleNone": "Explorar por <em>género</em> ou <em>ambiente</em>",
  "browse.pickPrompt":
    "Escolhe um género ou um ambiente para veres os lançamentos",
  "browse.noGenres":
    "Os géneros aparecem aqui quando houver lançamentos publicados",
  "browse.gridLabel": "Lançamentos de {genre}",
  "browse.empty.title": "Ainda não há lançamentos de {genre}",
  "browse.empty.body": "A música nova aparece aqui à medida que é publicada",
  "libraryLive.dek":
    "As tuas playlists, as Músicas de que gostas, os lançamentos guardados e os artistas que segues",
  "libraryLive.tablistLabel": "A tua biblioteca",
  "libraryLive.tabs.playlists": "Playlists",
  "libraryLive.tabs.releases": "Lançamentos",
  "libraryLive.tabs.artists": "Artistas",
  "libraryLive.yourPlaylists": "As tuas <em>playlists</em>",
  "libraryLive.savedPlaylists": "<em>Playlists</em> guardadas",
  "libraryLive.newPlaylistCta": "Criar playlist",
  "libraryLive.empty.ownPlaylistsTitle": "Ainda não tens playlists tuas",
  "libraryLive.empty.playlistsBody":
    "Cria uma para um estado de espírito, uma noite ou uma pessoa, e junta faixas de qualquer parte do Studio",
  "libraryLive.empty.releasesTitle": "Ainda não guardaste lançamentos",
  "libraryLive.empty.releasesBody":
    "Guarda um lançamento na página dele e fica aqui à tua espera",
  "libraryLive.empty.artistsTitle": "Ainda não segues artistas",
  "libraryLive.empty.artistsBody":
    "Segue artistas a partir da página Studio de cada persona para as teres por perto",
  "libraryLive.showMoreArtists": "Mostrar mais artistas",
  "libraryLive.loadingMoreArtists": "A carregar mais artistas",
  "libraryLive.loadMoreArtistsError": "Não conseguimos carregar mais artistas",
  "numbers.eyebrow": "Os teus números",
  "numbers.title": "Como <em>{name}</em> chega às pessoas",
  "numbers.dek":
    "Totais de hoje. O Studio nunca conta audições, e qualquer número de 1 a 4 aparece como Menos de 5, para ninguém ficar identificável",
  "numbers.personaLabel": "Persona",
  "numbers.followers": "Pessoas que seguem",
  "numbers.tableCaption":
    "Guardados e presenças em playlists públicas de cada lançamento de {name}",
  "numbers.column.release": "Lançamento",
  "numbers.column.saves": "Guardados",
  "numbers.column.inPublicPlaylists": "Em playlists públicas",
  "numbers.fewerThanFive": "Menos de 5",
  "numbers.showTracks": "Mostrar as faixas de {title}",
  "numbers.hideTracks": "Esconder as faixas de {title}",
  "numbers.empty.title": "Ainda não há lançamentos",
  "numbers.empty.body": "Publica um lançamento e os números dele aparecem aqui",
  "callsLive.eyebrow": "De Financiamento e Apoios",
  "callsLive.title": "Concursos abertos para <em>música</em>",
  "callsLive.dek":
    "Quem financia e organiza publica os concursos em Financiamento e Apoios. Estes são os abertos com a etiqueta música",
  "callsLive.postCta": "Publicar um concurso",
  "callsLive.allCallsCta": "Ver todos os concursos abertos",
  "callsLive.musicCallsCta":
    "Ver concursos de música em Financiamento e Apoios",
  "callsLive.listLabel": "Concursos abertos para música",
  "callsLive.empty.title": "Não há concursos abertos para música agora",
  "callsLive.empty.body":
    "Os concursos novos com a etiqueta música aparecem aqui assim que forem publicados",
  "callsLive.loadErrorTitle": "Não conseguimos carregar os concursos abertos",
  "callsLive.showMore": "Mostrar mais concursos",
  "callsLive.loadingMore": "A carregar mais concursos",
  "callsLive.loadMoreError": "Não conseguimos carregar mais concursos",
  "callsLive.card.amount": "Montante",
  "callsLive.card.deadline": "Prazo",
  "callsLive.card.eligibility": "Quem pode concorrer",
  "callsLive.card.scope": "Âmbito",
  "callsLive.card.notStated": "Por indicar",
  "fundLive.eyebrow": "Solidariedade",
  "fundLive.title": "Pessoas a ajudar <em>pessoas</em>",
  "fundLive.body":
    "A QueerPulse nunca mexe em dinheiro. Quando alguém da música precisa de ajuda, a comunidade angaria-a em Financiamento e Apoios, e a moderação verifica cada angariação antes de ser publicada",
  "fundLive.safety":
    "Contribui só pelo link da própria angariação. Se alguém te pedir dinheiro numa mensagem, denuncia",
  "fundLive.fundraisersCta": "Ver angariações de música",
  "fundLive.startCta": "Começar uma angariação",
  "fundLive.callsCta": "Ver concursos abertos para música",
  "rail.v2.library": "Biblioteca",
  "rail.v2.openCalls": "Concursos abertos",
  "rail.v2.yourNumbers": "Os teus números",
  "creator.nav.yourNumbers": "Os teus números",
  "demo.dashboard.trend.plays":
    "<up>{delta}</up> face ao mês passado · {active} de {total} faixas ativas",
  "demo.dashboard.trend.earnings":
    "<up>{delta}</up> face ao mês passado · {rate} por audição válida",
  "demo.dashboard.trend.tips":
    "{tippers} gorjetas, {notes} com mensagem · <up>{recent} desde que abriste esta página</up>",
  "demo.dashboard.trend.payout":
    "SEPA · IBAN LU · fica disponível na manhã do dia 5",
  "demo.dashboard.curator.what.wednesdaySet":
    "<em>{title}</em> entrou na faixa 6 do set de quarta",
  "demo.dashboard.curator.what.collection":
    "<em>{title}</em> entrou em “Canções para pôr a tocar à tua mãe”",
  "demo.dashboard.curator.what.mix":
    "<em>{title}</em> entrou em Trans composers vol. iv",
  "demo.dashboard.curator.what.warmup":
    "<em>{title}</em> escolhida para o aquecimento de segunda",
  "demo.dashboard.curator.who.wednesdaySet":
    "Sara Marques · Vespertina vol. iv · “fica até ao segundo verso”",
  "demo.dashboard.curator.who.collection":
    "Sara Marques · coleção · entrou na rotação desta semana",
  "demo.dashboard.curator.who.mix":
    "D. Okoye · mix · um parágrafo nas notas sobre a letra",
  "demo.dashboard.curator.who.warmup":
    "João Ribeiro · uma faixa · “para a cozinha, às 20h”",
  "demo.dashboard.curator.today": "hoje",
  "demo.dashboard.otherCities": "{count} outras cidades",
  "demo.dashboard.peakSummary":
    "Pico: <em>hoje</em> · {plays} audições · a Sara escolheu-te na segunda",
  "demo.dashboard.topTrackShare": "<em>{title}</em> é {percent}% disto",
  "demo.dashboard.goLivePlan": "Plano: {date} · estreia de {title}",
  "demo.dashboard.nextPayout": "Próximo: {amount} a {date} · SEPA",
  "demo.calls.seat": "Conselho · lugar {seat}",
  "demo.calls.tag.commission": "Encomenda",
  "demo.calls.tag.grant": "Bolsa",
  "demo.calls.tag.residency": "Residência",
  "demo.calls.tag.closesInDays_one": "Fecha daqui a {count} dia",
  "demo.calls.tag.closesInDays_other": "Fecha daqui a {count} dias",
  "demo.calls.tag.applied": "Candidatura enviada · {date}",
  "demo.calls.meta.deadline": "Prazo {date}",
  "demo.calls.meta.oneTrack": "1 faixa",
  "demo.calls.meta.slotsFilled": "{filled} de {total} vagas preenchidas",
  "demo.calls.meta.releaseAsEvidence": "1 lançamento como amostra",
  "demo.calls.meta.grantCount": "{count} bolsas",
  "demo.calls.meta.trackAndNote": "1 faixa e uma nota",
  "demo.calls.meta.oneResidency": "1 residência",
  "demo.calls.track.unreleased": "inédita",
  "demo.calls.marsha.title":
    "Uma canção para a noite <em>Marsha P. Johnson</em>",
  "demo.calls.marsha.brief":
    "Estamos a preparar a música da emissão de 28 de junho, uma sala ao vivo de 90 minutos a assinalar o aniversário. Queremos <em>uma faixa original</em>, de 3 a 6 minutos, para levar a emissão entre intervenções. Fica tua para guardares e voltares a lançar",
  "demo.calls.marsha.amountLabel": "valor fixo · pago na aceitação",
  "demo.calls.marsha.placeholder":
    "Uma frase sobre porquê esta (opcional). O conselho ouve primeiro o trabalho",
  "demo.calls.spring.title":
    "Bolsa de primavera: linha para <em>pessoas compositoras trans</em>",
  "demo.calls.spring.brief":
    "Bolsas de 1200 € sem condições para pessoas compositoras trans e não binárias, em qualquer forma: partitura, ambiente, coral, clube. Financiamos a <em>prática</em> em si, sem nada para entregar. Doze bolsas nesta ronda",
  "demo.calls.spring.amountLabel": "sem condições",
  "demo.calls.spring.placeholder":
    "O que é que a bolsa te deixaria criar? (opcional)",
  "demo.calls.residency.title": "Casa do Comum: residência de <em>agosto</em>",
  "demo.calls.residency.brief":
    "Duas semanas no espaço de Lisboa com chaves, PA e material de gravação, a fechar com uma emissão ao vivo a partir de lá. Viagem e uma ajuda de 600 € incluídas. Procuramos alguém que <em>use o espaço com volume</em>",
  "demo.calls.residency.amountLabel": "mais espaço e viagem",
  "demo.calls.residency.placeholder":
    "Como usarias as duas semanas? (opcional)",
  "demo.calls.applied.title": "Tema de fecho da <em>assembleia do Orgulho</em>",
  "demo.calls.applied.brief":
    "Juntaste <em>{track}</em> e uma nota. A Sara ficou com ela a {claimedOn} e decide até {decisionBy}. Recebes a resposta aqui, com uma frase, seja qual for",
  "demo.calls.applied.statusNote": "em análise com a Sara",
  "demo.fund.balanceNote":
    "Saudável: cerca de quatro meses dos pagamentos atuais. O que passar de seis meses de margem vai para a ronda trimestral de bolsas seguinte, por votação do conselho",
  "demo.fund.flowsDek":
    "Nenhuma taxa nova paga isto. É o excedente de um sistema feito para transbordar para as pessoas, e deixa intactos <em>os 80% de quem cria e as tuas gorjetas</em>",
  "demo.fund.applyBody":
    "Se és membro e estás num mês difícil, a linha de emergência é um formulário curto e um sim rápido: <em>sem portefólio, sem prova de rendimentos, sem vergonha</em>. Quem transcreve e traduz recebe por peça aceite, e as bolsas abrem a cada trimestre",
  "demo.fund.name.withheld": "Omitido a <em>pedido</em>",
  "demo.fund.name.helenaAndOthers": "Helena <em>Pinto</em> e mais 6 pessoas",
  "demo.fund.name.lgpInterpreter": "Interpretação em <em>LGP</em>",
  "demo.fund.name.communityPool": "<em>Fundo</em> comunitário · 9 pessoas",
  "demo.fund.name.instrument": "<em>Substituição</em> de instrumento",
  "demo.fund.name.captioning": "<em>Legendagem</em> · 6 emissões",
  "demo.fund.name.springStrand": "Linha de primavera · <em>4 artistas</em>",
  "demo.fund.note.teresa": "14 partituras aceites no arquivo nesta quinzena",
  "demo.fund.note.rent":
    "Um mês de renda para uma pessoa entre digressões, confidencial",
  "demo.fund.note.springGrants":
    "Linha de primavera para primeiros lançamentos · 1200 € sem condições cada",
  "demo.fund.note.marshaSigning":
    "Interpretou a emissão Marsha P. Johnson · 90 minutos",
  "demo.fund.note.lyricTranslations":
    "Traduções de letras de PT para EN, de PT para ES e de FR para PT em 22 faixas",
  "demo.fund.note.accordion":
    "Um acordeão roubado, substituído numa semana, sem formulário",
  "demo.fund.note.mateus":
    "Bolsa de primeiro lançamento · masterização e arte do EP de estreia",
  "demo.fund.note.captions":
    "Legendas ao vivo na temporada de emissões de maio",
  "demo.fund.note.pedro": "Tradução de letras de PT para EN em 8 faixas",
  "demo.fund.note.medical": "Despesas médicas de uma pessoa, confidencial",
  "demo.fund.note.sofia": "9 partituras aceites no arquivo",
  "demo.fund.note.springArtists":
    "Bolsas de primeiro lançamento · 1200 € sem condições cada",

  // ── Studio, páginas abertas (2026-10-13): Ajuda, Sobre, Termos,
  // Acessibilidade e Direitos em produção, a vista de lançamento retirado,
  // contestações, definições do leitor, revisão de denúncias e o grupo de
  // utilidades do menu lateral. As chaves de demonstração acima ficam.
  "errors.releaseWithdrawn": "Este lançamento foi retirado",
  "errors.releaseNotTakenDown": "Este lançamento já não está retirado",
  "errors.disputeAlreadyOpen": "Já há uma contestação à espera da nossa equipa",
  "errors.disputeLimitReached": "Este lançamento já usou as três contestações",
  "errors.disputeNotOpen": "Esta contestação já tem decisão",
  "errors.releaseHasOpenDispute":
    "Este lançamento tem uma contestação à espera. Repõe-o a partir de Contestações",
  "errors.takedownReportMismatch": "Essa denúncia não é sobre este lançamento",
  "errors.takedownReportNotOpen": "Essa denúncia já foi tratada",

  "helpLive.hero.eyebrow": "Ajuda do Studio",
  "helpLive.hero.title": "Como te podemos <em>ajudar</em>?",
  "helpLive.hero.dek":
    "Respostas sobre ouvir, partilhar a tua música e estar em segurança no Studio. Se faltar alguma coisa, a nossa equipa lê todas as mensagens.",
  "helpLive.search.label": "Pesquisar na ajuda do Studio",
  "helpLive.search.placeholder": "Experimenta guardar, playlists ou contestar",
  "helpLive.search.clearCta": "Limpar a pesquisa",
  "helpLive.search.resultCount_one": "{count} resposta corresponde",
  "helpLive.search.resultCount_other": "{count} respostas correspondem",
  "helpLive.search.emptyTitle": 'Nada corresponde a "{query}"',
  "helpLive.search.emptyBody":
    "Experimenta outra palavra ou pergunta à nossa equipa aqui em baixo.",
  "helpLive.cat.listening.heading": "<em>Ouvir</em>",
  "helpLive.cat.listening.blurb": "Reprodução, guardados, playlists e seguir",
  "helpLive.cat.sharing.heading": "Partilhar a tua <em>música</em>",
  "helpLive.cat.sharing.blurb":
    "Carregamentos, personas, a caixa de direitos e as tuas estatísticas",
  "helpLive.cat.safety.heading": "Segurança e <em>direitos</em>",
  "helpLive.cat.safety.blurb": "Denúncias, retiradas e contestações",
  "helpLive.cat.money.heading": "Dinheiro e <em>gorjetas</em>",
  "helpLive.faq.whatIsStudio.q": "O que é o Studio e quem o pode usar?",
  "helpLive.faq.whatIsStudio.a":
    "O Studio é o sítio do QueerPulse onde artistas queer partilham a sua música com membros. É gratuito, só para ouvir, e está aberto a membros a quem a nossa equipa deu acesso ao Studio.",
  "helpLive.faq.tracking.q": "O Studio guarda o que eu oiço?",
  "helpLive.faq.tracking.a":
    "Não. O Studio não guarda contagens de audições, histórico nem recomendações feitas a partir do que ouves. O que está a tocar e a tua fila ficam só neste separador do navegador e desaparecem quando o fechas.",
  "helpLive.faq.saving.q":
    "Como funcionam os guardados, as playlists e seguir artistas?",
  "helpLive.faq.saving.a":
    "Guarda qualquer lançamento e fica à tua espera na tua <a>biblioteca</a>. Toca no coração de uma faixa e ela vai para as Músicas de que gostas, que só tu vês. Uma playlist pode ser Pública, Só ligações ou Privada, e podes mudar isso quando quiseres. Segue artistas a partir da página de cada artista para saberes quando lançam algo novo.",
  "helpLive.faq.playerSettings.q":
    "Posso mudar a forma como o leitor funciona?",
  "helpLive.faq.playerSettings.a":
    "Sim. Nas <a>Definições</a> podes desligar a Reprodução automática, esconder faixas marcadas como explícitas e, na maioria dos navegadores, definir uma transição entre faixas. As tuas escolhas acompanham-te em todos os dispositivos.",
  "helpLive.faq.uploading.q": "Como carrego um lançamento?",
  "helpLive.faq.uploading.a":
    "Começa em <a>Carregar um lançamento</a>, escolhe uma das tuas personas de música ou DJ, junta as faixas, a capa e os detalhes, marca a caixa de direitos e publica. O lançamento aparece com o nome da persona.",
  "helpLive.faq.rightsCheckbox.q": "O que significa a caixa de direitos?",
  "helpLive.faq.rightsCheckbox.a":
    "Ao marcá-la confirmas que és titular ou controlas os direitos de todas as gravações e composições do lançamento, e que os créditos estão certos. Se isso mudar, despublica o lançamento na tua página de artista.",
  "helpLive.faq.stats.q": "O que mostram as minhas estatísticas?",
  "helpLive.faq.stats.a":
    "<a>Os teus números</a> mostram seguidores, guardados e quantas playlists públicas incluem a tua música. Qualquer número de 1 a 4 aparece como Menos de 5, para ninguém conseguir perceber quem guardou o quê. O Studio não conta audições.",
  "helpLive.faq.reporting.q": "Como denuncio um lançamento?",
  "helpLive.faq.reporting.a":
    "Abre o lançamento, depois Mais ações e Denunciar lançamento. A nossa equipa analisa todas as denúncias e, se um lançamento violar as regras, retira-o e quem o publicou vê porquê.",
  "helpLive.faq.takedown.q": "O que acontece quando um lançamento é retirado?",
  "helpLive.faq.takedown.a":
    "Deixa de estar disponível para quem ouve de imediato. Quem o guardou mantém-no na biblioteca, marcado como retirado. Quem o publicou lê o motivo da nossa equipa na página do lançamento e pode contestá-lo aí.",
  "helpLive.faq.dispute.q": "Como contesto uma retirada?",
  "helpLive.faq.dispute.a":
    "Abre o teu lançamento. Por baixo do motivo da retirada, escreve uma nota para a nossa equipa e envia-a. A resposta aparece no mesmo sítio e, se a equipa concordar, o lançamento volta. Cada lançamento pode ser contestado até três vezes, uma de cada vez. Mais em <a>Direitos e retiradas</a>.",
  "helpLive.contact.heading": "Ainda com <em>dúvidas</em>?",
  "helpLive.contact.team.title": "Fala com a <em>nossa equipa</em>",
  "helpLive.contact.team.body":
    "Envia uma mensagem pelo formulário de contacto e a nossa equipa trata dela a partir daí.",
  "helpLive.contact.team.action": "Contactar a nossa equipa",
  "helpLive.contact.email.title": "Escreve-nos por <em>email</em>",
  "helpLive.contact.email.body":
    "Escreve para hello@queerpulse.com a partir da tua app de email.",
  "helpLive.contact.email.action": "Escrever à nossa equipa",
  "helpLive.contact.platform.title": "Ajuda do <em>QueerPulse</em>",
  "helpLive.contact.platform.body":
    "Perguntas sobre a tua conta e sobre segurança em todo o QueerPulse.",
  "helpLive.contact.platform.action": "Abrir a ajuda do QueerPulse",

  "aboutLive.hero.eyebrow": "Sobre o Studio",
  "aboutLive.hero.title":
    "Música de artistas queer, para <em>quem é membro</em>.",
  "aboutLive.hero.lede":
    "O Studio é um sítio do QueerPulse onde artistas queer partilham a sua música com membros. É gratuito, só para ouvir, e o que ouves fica em privado.",
  "aboutLive.sec.today.num": "01: o que é hoje",
  "aboutLive.sec.today.heading": "O que o Studio <em>faz</em>",
  "aboutLive.sec.today.p1":
    "Artistas carregam lançamentos com uma persona de música ou DJ e publicam-nos para membros com acesso ao Studio. Quem ouve pode tocar, guardar, fazer playlists e seguir artistas de que gosta.",
  "aboutLive.sec.today.p2":
    "Hoje não há dinheiro no Studio: ouvir é gratuito e carregar música também.",
  "aboutLive.sec.privacy.num": "02: o que não regista",
  "aboutLive.sec.privacy.heading": "O que ouves fica <em>contigo</em>",
  "aboutLive.sec.privacy.p1":
    "O Studio não guarda contagens de audições, histórico nem recomendações feitas a partir do que ouves. A tua fila vive no separador do navegador e vai-se embora com ele.",
  "aboutLive.sec.privacy.p2":
    "Artistas veem seguidores, guardados e inclusões em playlists públicas, e qualquer número de 1 a 4 aparece como Menos de 5.",
  "aboutLive.sec.control.num": "03: como artistas mantêm o controlo",
  "aboutLive.sec.control.heading": "A tua música, <em>a tua decisão</em>",
  "aboutLive.sec.control.p1":
    "Despublica qualquer lançamento na tua página de artista quando quiseres. As denúncias de membros vão para a nossa equipa e, se a equipa retirar um lançamento, lês o motivo na página do lançamento e podes contestá-lo aí.",
  "aboutLive.sec.personas.num": "04: personas e privacidade",
  "aboutLive.sec.personas.heading": "Lança com o teu <em>nome artístico</em>",
  "aboutLive.sec.personas.p1":
    "Os teus lançamentos, as playlists que creditas a uma persona e as tuas estatísticas ficam todos com o nome da persona. Membros com acesso ao Studio veem os teus lançamentos, as tuas faixas, o teu nome artístico e as tuas playlists públicas.",
  "aboutLive.sec.next.num": "05: para onde vai",
  "aboutLive.sec.next.heading": "Crescer com <em>quem o usa</em>",
  "aboutLive.sec.next.p1":
    "Queremos que um dia o Studio pague a artistas e dê voz a membros sobre o seu funcionamento. Vamos construir isso às claras com a nossa comunidade e diremos aqui quando algo for real.",
  "aboutLive.showcase.heading": "A visão <em>cooperativa</em>",
  "aboutLive.showcase.dek":
    "Como poderia ser um Studio cooperativo, mostrado nesta demonstração.",
  "aboutLive.cta.title": "Vem <em>ouvir</em>.",
  "aboutLive.cta.body":
    "Começa no início do Studio ou lê primeiro os termos curtos do Studio.",
  "aboutLive.cta.open": "Abrir o Studio",
  "aboutLive.cta.terms": "Ler os termos do Studio",

  "termsLive.eyebrow": "Termos do Studio",
  "termsLive.title": "O <em>aditamento</em> curto do Studio",
  "termsLive.lede":
    "Juntam-se aos termos e à política de privacidade do QueerPulse, que se aplicam ao Studio na íntegra. Tratam do que é próprio do Studio.",
  "termsLive.sec.rights.num": "01: a caixa de direitos",
  "termsLive.sec.rights.heading": "Quando <em>publicas</em>",
  "termsLive.sec.rights.p1":
    "Antes de publicar, confirmas que és titular ou controlas os direitos de todas as gravações e composições do lançamento, e que os créditos estão certos. Os direitos continuam a ser teus. Enquanto o lançamento estiver publicado, membros com acesso ao Studio podem ouvi-lo no QueerPulse.",
  "termsLive.sec.visible.num": "02: o que os membros veem",
  "termsLive.sec.visible.heading": "O que fica <em>visível</em>",
  "termsLive.sec.visible.p1":
    "Membros com acesso ao Studio veem os teus lançamentos e faixas, o teu nome artístico e as tuas playlists públicas. Uma playlist definida como Só ligações ou Privada fica com as pessoas que essa opção permite.",
  "termsLive.sec.stored.num": "03: o que o Studio guarda",
  "termsLive.sec.stored.heading": "O que <em>guardamos</em>",
  "termsLive.sec.stored.p1":
    "O Studio guarda os teus lançamentos com o áudio e as capas, os teus guardados, playlists e artistas que segues, as definições do leitor, e as contestações que envias com a resposta da nossa equipa. Não guarda nenhum registo do que ouves: nem contagens de audições, nem histórico.",
  "termsLive.sec.stored.p2":
    "Tudo o que o Studio guarda sobre ti está coberto pela <a>política de privacidade</a> do QueerPulse.",
  "termsLive.sec.takedown.num": "04: retiradas e contestações",
  "termsLive.sec.takedown.heading": "Se algo <em>correr mal</em>",
  "termsLive.sec.takedown.p1":
    "Podes despublicar o teu lançamento quando quiseres. Se um membro denunciar um lançamento, a nossa equipa analisa-o e pode retirá-lo. Vês o motivo na página do lançamento e podes contestá-lo aí, uma contestação de cada vez e até três por lançamento. A nossa equipa responde no lançamento e, se concordar, ele volta.",
  "termsLive.questions":
    "Dúvidas sobre estes termos? Escreve para <a>hello@queerpulse.com</a> ou <link>fala com a nossa equipa</link>.",
  "termsLive.full.title": "Os termos completos",
  "termsLive.full.body":
    "Os termos e a política de privacidade do QueerPulse também se aplicam ao Studio.",
  "termsLive.full.termsCta": "Ler os termos completos",
  "termsLive.full.privacyCta": "Ler a política de privacidade",

  "accessibilityLive.eyebrow": "Acessibilidade no Studio",
  "accessibilityLive.title": "O que funciona <em>hoje</em>",
  "accessibilityLive.lede":
    "Esta lista cobre só o que o Studio faz agora. Quando algo ainda não existe, dizemo-lo.",
  "accessibilityLive.status.live": "Disponível",
  "accessibilityLive.status.notYet": "Ainda não",
  "accessibilityLive.group.player.heading": "O <em>leitor</em>",
  "accessibilityLive.group.player.dek":
    "Feito para funcionar com teclado, leitor de ecrã e os controlos multimédia do teu dispositivo.",
  "accessibilityLive.item.mediaKeys.heading":
    "Teclas multimédia e <em>ecrã bloqueado</em>",
  "accessibilityLive.item.mediaKeys.body":
    "Tocar, pausar, seguinte e anterior funcionam com as teclas multimédia do teclado, com os auscultadores e no ecrã bloqueado do telemóvel.",
  "accessibilityLive.item.seek.heading":
    "Barra de progresso por <em>teclado</em>",
  "accessibilityLive.item.seek.body":
    "A barra de progresso é um controlo deslizante. As teclas de seta avançam e recuam na faixa, e Home e End saltam para o início e para o fim.",
  "accessibilityLive.item.labels.heading": "Controlos com <em>nome</em>",
  "accessibilityLive.item.labels.body":
    "Cada botão do leitor tem um nome que o teu leitor de ecrã lê, e os problemas de reprodução são anunciados numa região dinâmica.",
  "accessibilityLive.group.display.heading": "Ecrã e <em>idioma</em>",
  "accessibilityLive.group.display.dek":
    "O Studio segue as escolhas que fizeste no QueerPulse.",
  "accessibilityLive.item.motion.heading":
    "Respeita a <em>redução de movimento</em>",
  "accessibilityLive.item.motion.body":
    "Quando o teu dispositivo ou o QueerPulse pedem menos movimento, painéis e listas aparecem sem deslizar nem esbater.",
  "accessibilityLive.item.themes.heading": "Temas <em>claro</em> e escuro",
  "accessibilityLive.item.themes.body":
    "O Studio segue o tema do QueerPulse. Muda-o no menu da conta ou nas definições do Studio.",
  "accessibilityLive.item.languages.heading": "Inglês e <em>português</em>",
  "accessibilityLive.item.languages.body":
    "As palavras do próprio Studio existem em inglês e em português. Títulos e letras ficam como quem os escreveu.",
  "accessibilityLive.group.words.heading": "Palavras e <em>legendas</em>",
  "accessibilityLive.group.words.dek": "O que podes ler enquanto ouves.",
  "accessibilityLive.item.lyrics.heading": "Letras em <em>texto</em>",
  "accessibilityLive.item.lyrics.body":
    "Quando quem publica junta a letra, a página da faixa mostra-a em texto para leres ao teu ritmo.",
  "accessibilityLive.item.captions.heading": "<em>Legendas</em>",
  "accessibilityLive.item.captions.body":
    "O Studio ainda não tem conteúdo falado para legendar, por isso hoje não há legendas.",
  "accessibilityLive.contact.title": "Encontraste uma <em>barreira</em>?",
  "accessibilityLive.contact.body":
    "Conta à nossa equipa o que te bloqueou e onde. Tratamos isso como um erro a corrigir.",
  "accessibilityLive.contact.cta": "Reportar um problema de acessibilidade",

  "rightsLive.eyebrow": "Direitos e retiradas",
  "rightsLive.title": "Como funcionam os <em>direitos</em> no Studio",
  "rightsLive.dek":
    "O que confirmas quando publicas, o que acontece depois de uma denúncia e como contestar uma retirada.",
  "rightsLive.sec.checkbox.heading": "A caixa de <em>direitos</em>",
  "rightsLive.sec.checkbox.body":
    "Antes de publicar, confirmas que és titular ou controlas os direitos de todas as gravações e composições do lançamento, e que os créditos estão certos.",
  "rightsLive.sec.report.heading": "Depois de uma <em>denúncia</em>",
  "rightsLive.sec.report.body":
    "A nossa equipa analisa todas as denúncias. Se um lançamento violar as regras, a equipa retira-o e escreve um motivo que lês na página do lançamento. O lançamento deixa de estar disponível para quem ouve, e quem o guardou mantém-no na biblioteca, marcado como retirado.",
  "rightsLive.sec.dispute.heading": "Como <em>contestar</em>",
  "rightsLive.sec.dispute.body":
    "Abre o teu lançamento. Por baixo do motivo da retirada, escreve uma nota para a nossa equipa e envia-a. A resposta aparece no lançamento e, se a equipa concordar, o lançamento volta. Podes contestar cada lançamento até três vezes, uma de cada vez.",
  "rightsLive.sec.unpublish.heading": "Despublica <em>quando quiseres</em>",
  "rightsLive.sec.unpublish.body":
    "Podes despublicar o teu lançamento na tua página de artista sempre que quiseres. Volta a ser um rascunho que só tu e quem partilha a persona contigo conseguem ver.",
  "rightsLive.cta": "Abrir os teus lançamentos",

  "withdrawnLive.eyebrow": "Studio",
  "withdrawnLive.title": "Este lançamento foi <em>retirado</em>",
  "withdrawnLive.body":
    "A nossa equipa retirou-o depois de uma denúncia. Se o guardaste, continua na tua biblioteca, marcado como retirado.",
  "withdrawnLive.homeCta": "Voltar ao início do Studio",
  "withdrawnLive.rightsCta": "Como funcionam as retiradas",
  "withdrawnLive.rowLabel": "Retirado",

  "dispute.heading": "Contestar esta retirada",
  "dispute.yourDisputeHeading": "A tua contestação",
  "dispute.intro":
    "Se achas que a nossa equipa se enganou, explica porquê. A equipa lê todas as contestações e responde aqui.",
  "dispute.openFormCta": "Escrever uma contestação",
  "dispute.againCta": "Escrever outra contestação",
  "dispute.closeFormCta": "Fechar o formulário de contestação",
  "dispute.noteLabel": "A tua nota para a nossa equipa",
  "dispute.noteHint":
    "Até 1000 caracteres. Partilha o que ajudar, como quem detém os direitos.",
  "dispute.noteRequired": "Escreve uma nota antes de a enviares",
  "dispute.sendCta": "Enviar contestação",
  "dispute.sendingCta": "A enviar a contestação",
  "dispute.sentToast": "Contestação enviada à nossa equipa",
  "dispute.openStatus": "Contestação enviada, a nossa equipa responde aqui",
  "dispute.sentOn": "Enviada a {date}",
  "dispute.yourNoteLabel": "A tua nota",
  "dispute.upheldTitle": "A nossa equipa repôs este lançamento",
  "dispute.rejectedTitle": "A nossa equipa manteve este lançamento retirado",
  "dispute.replyLabel": "A resposta da equipa",
  "dispute.decidedOn": "Decidida a {date}",
  "dispute.limitReached": "Este lançamento já usou as três contestações.",

  "settingsLive.eyebrow": "As tuas definições do Studio",
  "settingsLive.title": "Como o Studio <em>toca</em> para ti",
  "settingsLive.dek":
    "As definições de reprodução e de conteúdo acompanham-te em todos os dispositivos onde usas o Studio.",
  "settingsLive.playback.label": "Reprodução",
  "settingsLive.playback.title": "O que toca a <em>seguir</em>",
  "settingsLive.autoplay.heading": "Reprodução automática",
  "settingsLive.autoplay.body":
    "Quando uma faixa acaba, começa a seguinte da tua fila. Desliga para parar depois de cada faixa.",
  "settingsLive.crossfade.heading": "Transição entre faixas",
  "settingsLive.crossfade.body":
    "Mistura o fim de uma faixa com o início da seguinte enquanto a reprodução automática está ligada.",
  "settingsLive.crossfade.sliderLabel": "Duração da transição",
  "settingsLive.crossfade.off": "Desligada",
  "settingsLive.crossfade.seconds": "{count} s",
  "settingsLive.crossfade.valueText_one": "{count} segundo",
  "settingsLive.crossfade.valueText_other": "{count} segundos",
  "settingsLive.content.label": "Conteúdo",
  "settingsLive.content.title": "O que <em>ouves</em>",
  "settingsLive.hideExplicit.heading": "Esconder faixas explícitas",
  "settingsLive.hideExplicit.body":
    "As faixas marcadas como explícitas saem da tua fila e aparecem esbatidas nas listas. Desliga para as veres de novo de imediato.",
  "settingsLive.theme.label": "Tema",
  "settingsLive.theme.title": "O aspeto do <em>Studio</em>",
  "settingsLive.theme.dark.heading": "Modo escuro",
  "settingsLive.theme.dark.body":
    "O Studio segue o tema do QueerPulse, por isso uma mudança aqui aplica-se a todo o QueerPulse neste dispositivo.",
  "settingsLive.saveError":
    "Não conseguimos guardar essa definição. Tenta outra vez",

  "hiddenTrack.label": "Escondida pelas tuas definições",

  "flagReviewLive.eyebrow": "Equipa · revisão do Studio",
  "flagReviewLive.title": "<em>Denúncias</em> e contestações do Studio",
  "flagReviewLive.dek":
    "Denúncias de membros, contestações de artistas e todos os lançamentos retirados. Quem publicou lê o motivo ou a resposta que escreves aqui.",
  "flagReviewLive.tablistLabel": "Filas de revisão do Studio",
  "flagReviewLive.tabs.reports": "Denúncias",
  "flagReviewLive.tabs.disputes": "Contestações",
  "flagReviewLive.tabs.withdrawn": "Retirados",
  "flagReviewLive.card.byArtist": "de {artist}",
  "flagReviewLive.card.unknownRelease": "Um lançamento do Studio",
  "flagReviewLive.card.filedOn": "Denunciado a {date}",
  "flagReviewLive.card.takedownReason": "Motivo da retirada",
  "flagReviewLive.card.artistNote": "A nota de quem publicou",
  "flagReviewLive.card.disputedOn": "Contestado a {date}",
  "flagReviewLive.card.takenDownOn": "Retirado a {date}",
  "flagReviewLive.card.openDispute": "Contestação à espera",
  "flagReviewLive.action.takeDown": "Retirar lançamento",
  "flagReviewLive.action.dismiss": "Arquivar denúncia",
  "flagReviewLive.action.openModeration": "Abrir na moderação",
  "flagReviewLive.action.restore": "Repor lançamento",
  "flagReviewLive.action.keepDown": "Manter lançamento retirado",
  "flagReviewLive.dialog.takeDownTitle": "Retirar {title}?",
  "flagReviewLive.dialog.takeDownBody":
    "Deixa de estar disponível para quem ouve de imediato, e todas as denúncias abertas sobre ele ficam resolvidas.",
  "flagReviewLive.dialog.reasonLabel": "Motivo que quem publicou vai ver",
  "flagReviewLive.dialog.dismissTitle": "Arquivar esta denúncia sobre {title}?",
  "flagReviewLive.dialog.dismissBody":
    "O lançamento continua disponível e a denúncia fica resolvida.",
  "flagReviewLive.dialog.restoreTitle": "Repor {title}?",
  "flagReviewLive.dialog.restoreDisputeBody":
    "Volta para quem ouve e quem publicou lê a tua resposta no lançamento.",
  "flagReviewLive.dialog.restoreWithdrawnBody": "Volta para quem ouve.",
  "flagReviewLive.dialog.keepDownTitle": "Manter {title} retirado?",
  "flagReviewLive.dialog.keepDownBody":
    "Continua indisponível e quem publicou lê a tua resposta no lançamento.",
  "flagReviewLive.dialog.replyLabel": "Resposta que quem publicou vai ler",
  "flagReviewLive.toast.takenDown":
    "{title} foi retirado e as denúncias sobre ele estão resolvidas",
  "flagReviewLive.toast.dismissed": "Denúncia arquivada",
  "flagReviewLive.toast.restored": "{title} voltou a estar disponível",
  "flagReviewLive.toast.keptDown":
    "{title} continua retirado e quem publicou já tem a tua resposta",
  "flagReviewLive.toast.actionError": "Isso não ficou feito. Tenta outra vez",
  "flagReviewLive.empty.reportsTitle": "Sem denúncias abertas",
  "flagReviewLive.empty.reportsBody":
    "As denúncias novas sobre lançamentos do Studio aparecem aqui.",
  "flagReviewLive.empty.disputesTitle": "Sem contestações abertas",
  "flagReviewLive.empty.disputesBody":
    "As contestações de artistas aparecem aqui.",
  "flagReviewLive.empty.withdrawnTitle": "Nada está retirado",
  "flagReviewLive.empty.withdrawnBody":
    "Os lançamentos que a nossa equipa retira aparecem aqui.",
  "flagReviewLive.loadError": "Não conseguimos carregar esta lista",
  "flagReviewLive.loadMore": "Mostrar mais",
  "flagReviewLive.loadingMore": "A carregar mais",
  "flagReviewLive.loadMoreError":
    "Não conseguimos carregar mais. Tenta outra vez",

  "rail.live.utilityLabel": "Ajuda e informação",
  "rail.live.help": "Ajuda",
  "rail.live.about": "Sobre o Studio",
  "rail.live.rights": "Direitos e retiradas",
  "rail.live.terms": "Termos do Studio",
  "rail.live.accessibility": "Acessibilidade",
  "rail.live.flagReview": "Revisão de denúncias",
  // ── Descoberta no Studio (QUEERPULSE-STUDIO-DISCOVERY-DESIGN-2026-10-13.md) ──
  "mood.lateNight": "Madrugada",
  "mood.euphoric": "Euforia",
  "mood.tender": "Ternura",
  "mood.melancholy": "Melancolia",
  "mood.defiant": "Desafio",
  "mood.dreamy": "Sonho",
  "mood.slowBurn": "Lume brando",
  "mood.sweaty": "Suor",
  "mood.calm": "Calma",
  "mood.playful": "Brincadeira",
  "home.moods.heading": "Explorar por <em>ambiente</em>",
  "home.moods.listLabel": "Ambientes",
  "home.hero.featuredEyebrow": "Em destaque",
  "home.staffPicks.title": "Escolhas da <em>equipa</em>",
  "home.newThisWeek.title": "Novidades da <em>semana</em>",
  "home.scenes.title": "Cenas <em>locais</em>",
  "home.scenes.listLabel": "Cenas",
  "curation.noteLabel": "Nota da equipa do Studio:",
  "browse.titleMood": "Ambiente: <em>{mood}</em>",
  "browse.titleBoth": "{genre} com ambiente <em>{mood}</em>",
  "browse.gridLabelMood": "Lançamentos com ambiente {mood}",
  "browse.gridLabelBoth": "Lançamentos de {genre} com ambiente {mood}",
  "browse.empty.titleMood": "Ainda não há nada com o ambiente {mood}",
  "browse.empty.titleBoth":
    "Ainda não há nada de {genre} com o ambiente {mood}",
  "browse.anyGenre": "Qualquer género",
  "browse.anyMood": "Qualquer ambiente",
  "radio.playCta": "Ouvir a rádio {name}",
  "radio.error": "Não foi possível ligar a rádio. Tenta outra vez",
  "radio.empty": "Esta rádio ainda não tem nada para tocar",
  "radio.playerLabel": "Rádio · {name}",
  "scene.eyebrow": "Cena · {city}",
  "scene.playCta": "Ouvir a cena",
  "scene.releases.title": "<em>Lançamentos</em>",
  "scene.releases.gridLabel": "Lançamentos de {name}",
  "scene.empty.title": "Ainda não há lançamentos nesta cena",
  "scene.empty.body":
    "Quem cria junta um lançamento a uma cena quando o carrega",
  "scene.artists.title": "<em>Artistas</em> desta cena",
  "scene.events.title": "Próximos <em>eventos</em>",
  "scene.events.online": "Online",
  "scene.notFound.title": "Não encontramos essa cena",
  "scene.notFound.body":
    "Pode ter sido arquivada, ou o link pode estar desatualizado",
  "searchPage.moodLabel": "Ambiente",
  "searchPage.moodAny": "Qualquer ambiente",
  "credits.nav": "Créditos",
  "credits.badge_one": "{count} pedido de crédito à espera",
  "credits.badge_other": "{count} pedidos de crédito à espera",
  "credits.role.featured": "Participação",
  "credits.role.producer": "Produção",
  "credits.role.coWriter": "Coautoria",
  "credits.role.mixing": "Mistura",
  "credits.role.mastering": "Masterização",
  "credits.role.remix": "Remistura",
  "credits.role.coverArt": "Capa",
  "credits.role.other": "Outro papel",
  "credits.status.pending": "Pendente",
  "credits.status.accepted": "Aceite",
  "credits.status.declined": "Recusado",
  "credits.removeCta": "Remover crédito",
  "credits.editor.heading": "Creditar uma persona",
  "credits.editor.hint":
    "Escreve o nome de utilizador exato de uma persona pública. Nada aparece na faixa até ela aceitar",
  "credits.editor.handleLabel": "Nome de utilizador da persona",
  "credits.editor.findCta": "Procurar persona",
  "credits.editor.finding": "À procura dessa persona",
  "credits.editor.notFound":
    "Nenhuma persona pública tem esse nome de utilizador",
  "credits.editor.roleLabel": "Papel",
  "credits.editor.addCta": "Creditar {name}",
  "credits.editor.clearCta": "Limpar persona",
  "credits.editor.listLabel": "Personas creditadas nesta faixa",
  "credits.editor.removeAria": "Remover crédito de {name} ({role})",
  "credits.editor.notPublic":
    "Esta persona deixou de ser pública, por isso o crédito fica escondido",
  "credits.editor.limit": "Uma faixa leva até {limit} personas creditadas",
  "credits.editor.added": "Crédito enviado a {name}",
  "credits.editor.removed": "Crédito removido",
  "credits.editor.handleLine": "@{handle}",
  "credits.page.eyebrow": "Créditos",
  "credits.page.title": "Os teus <em>créditos</em>",
  "credits.page.sub":
    "As tuas personas, creditadas em faixas de outras pessoas. Um crédito só fica público depois de o aceitares",
  "credits.inbox.requests.title": "<em>Pedidos</em>",
  "credits.inbox.accepted.title": "<em>Aceites</em>",
  "credits.inbox.requestLine":
    "{requester} creditou {persona} em {track} ({role})",
  "credits.inbox.acceptedLine":
    "{requester} credita {persona} em {track} ({role})",
  "credits.inbox.releaseLine": "De {release}",
  "credits.inbox.acceptCta": "Aceitar crédito",
  "credits.inbox.declineCta": "Recusar crédito",
  "credits.inbox.acceptAria": "Aceitar crédito de {persona} em {track}",
  "credits.inbox.declineAria": "Recusar crédito de {persona} em {track}",
  "credits.inbox.removeAria": "Remover crédito de {persona} em {track}",
  "credits.inbox.confirmRemove.title": "Remover este crédito?",
  "credits.inbox.confirmRemove.body": "{persona} deixa de aparecer em {track}",
  "credits.inbox.empty.title": "Não há pedidos de crédito por agora",
  "credits.inbox.empty.body":
    "Quando alguém credita uma das tuas personas numa faixa, o pedido aparece aqui",
  "credits.inbox.toast.accepted": "Crédito aceite",
  "credits.inbox.toast.declined": "Crédito recusado",
  "credits.inbox.toast.removed": "Crédito removido",
  "credits.inbox.gone": "Esse pedido de crédito já não está aberto",
  "credits.inbox.removeGone": "Esse crédito já tinha sido removido",
  "credits.public.listLabel": "Personas creditadas",
  "credits.album.title": "<em>Créditos</em>",
  "artist.appearsOn.title": "Também <em>em</em>",
  "artist.related.title": "Artistas <em>afins</em>",
  "uploadFlow.release.moodLabel": "Ambiente",
  "uploadFlow.release.moodNone": "Sem ambiente",
  "uploadFlow.release.sceneLabel": "Cena",
  "uploadFlow.release.sceneNone": "Sem cena",
  "uploadFlow.release.sceneHint": "Junta este lançamento à página de uma cena",
  "uploadFlow.release.sceneOption": "{name}, {city}",
  "uploadFlow.release.sceneArchived": "Cena atual, agora arquivada",
  "uploadFlow.release.sceneLoading": "A carregar as cenas",
  "uploadFlow.release.sceneUnavailable": "As cenas não carregaram",
  "errors.radioFilterRequired": "Escolhe um género ou um ambiente para a rádio",
  "errors.sceneNotFound": "Essa cena não está no Studio",
  "errors.creditNotFound": "Esse crédito já não existe",
  "errors.curationShelfFull":
    "Esta prateleira leva 12 escolhas. Remove uma primeiro",
  "errors.curationAlreadyOnShelf": "Esse lançamento já está nesta prateleira",
  "errors.curationOrderMismatch":
    "A prateleira mudou enquanto mudavas a ordem. Recarrega e tenta outra vez",
  "errors.sceneSlugTaken": "Outra cena já usa esse endereço",
  "errors.sceneOrderMismatch":
    "As cenas mudaram enquanto mudavas a ordem. Recarrega e tenta outra vez",
  "errors.creditAlreadyRequested":
    "Esta persona já tem esse crédito nesta faixa",
  "errors.creditNotAccepted": "Aqui só podes remover um crédito aceite",
  "errors.sceneNotAvailable": "Essa cena não pode ser escolhida agora",
  "errors.curationReleaseNotPublished":
    "Só um lançamento publicado pode ir para uma prateleira",
  "errors.sceneEventNotPinnable":
    "Só se pode fixar um evento futuro aberto a membros",
  "errors.creditPersonaNotCreditable": "Essa persona não pode ser creditada",
  "errors.creditSelfPersona": "Essa é a persona deste lançamento",
  // ── Studio v3 artist tools (2026-10-13) ──────────────────────────────────────
  "releaseStatus.scheduled": "Agendado",
  "errors.releaseNotSchedulable":
    "Só um rascunho ou um lançamento agendado pode ser agendado",
  "errors.releaseNeedsPlayableTrack":
    "Um lançamento publicado fica sempre com pelo menos uma faixa com áudio. Junta outra antes de tirares esta",
  "errors.releaseNoChanges":
    "Não há nenhuma mudança nas faixas para anotar desde a última versão",
  "errors.previewNotAvailable":
    "Os links de pré-escuta são para rascunhos e lançamentos agendados",
  "errors.previewNotFound":
    "Não encontramos essa pré-escuta. O link pode ter sido desligado",
  "errors.scheduleOutOfRange":
    "Escolhe uma hora entre daqui a 15 minutos e daqui a 365 dias",
  "errors.pressTrackNotAllowed":
    "Uma dessas faixas não está nos lançamentos desta persona",
  "schedule.choice.legend": "Quando deve ficar disponível?",
  "schedule.choice.now": "Publicar agora",
  "schedule.choice.nowHint":
    "Fica disponível assim que carregares em Publicar lançamento",
  "schedule.choice.schedule": "Agendar lançamento",
  "schedule.choice.scheduleHint":
    "Escolhe a data e a hora, e fica disponível nessa altura",
  "schedule.form.dateLabel": "Data",
  "schedule.form.timeLabel": "Hora",
  "schedule.form.zoneHint": "No teu fuso horário ({zone})",
  "schedule.form.readback": "Fica disponível a {date} às {time}",
  "schedule.form.incomplete": "Escolhe uma data e uma hora",
  "schedule.form.tooSoon": "Escolhe uma hora daqui a pelo menos 15 minutos",
  "schedule.form.tooFar": "Escolhe uma data nos próximos 365 dias",
  "schedule.form.scheduleCta": "Agendar lançamento",
  "schedule.form.saveDateCta": "Guardar a nova data",
  "schedule.form.keepDateCta": "Manter a data atual",
  "schedule.form.scheduling": "A agendar",
  "schedule.panel.heading": "Agendado para <em>{date}</em> às {time}",
  "schedule.panel.body":
    "Fica disponível sozinho nesse dia. Quem carregou em Avisa-me recebe o alerta nessa altura",
  "schedule.panel.changeDateCta": "Mudar a data",
  "schedule.panel.cancelCta": "Cancelar o agendamento",
  "schedule.panel.cancelling": "A cancelar",
  "schedule.panel.dateChanged": "Nova data guardada",
  "upcoming.outOn": "Sai a {date} às {time}",
  "upcoming.tracksOut_one": "{count} faixa, sai a {date}",
  "upcoming.tracksOut_other": "{count} faixas, saem a {date}",
  "upcoming.notifyMe": "Avisa-me",
  "upcoming.notifyMeSet": "Avisamos-te",
  "upcoming.notifyMeAria": "Avisa-me quando {title} sair",
  "upcoming.notifyMeOffStatus": "Lembrete de {title} desligado",
  "upcoming.notifyMeError": "Não conseguimos guardar isso. Tenta outra vez",
  "upcoming.cardHeading": "Em breve",
  "versions.line": "Versão {version} · {date}",
  "versions.earlierCta": "Versões anteriores",
  "versions.blockLabel": "O que mudou neste lançamento",
  "versions.panel.heading": "Mudaste as faixas",
  "versions.panel.body":
    "Junta uma nota de versão para quem ouve saber o que há de novo. Aparece na página do lançamento como versão {version}",
  "versions.panel.noteLabel": "Nota de versão",
  "versions.panel.notePlaceholder": "O que mudou, numa ou duas linhas",
  "versions.panel.noteCount": "{count} de {max}",
  "versions.panel.noteRequired": "Escreve primeiro o que mudou",
  "versions.panel.saveCta": "Guardar nota de versão",
  "versions.panel.saving": "A guardar",
  "versions.panel.savedStatus":
    "Nota de versão guardada. Quem segue não recebe um segundo alerta",
  "previewLink.heading": "Link privado de pré-escuta",
  "previewLink.offBody":
    "Partilha este lançamento antes de sair. Só quem tem acesso ao Studio pode abrir o link",
  "previewLink.onBody":
    "Quem tiver acesso ao Studio e este link pode ouvir até o lançamento sair. Depois disso, o link abre a página do lançamento",
  "previewLink.makeCta": "Criar link de pré-escuta",
  "previewLink.fieldLabel": "Link de pré-escuta",
  "previewLink.copyCta": "Copiar link",
  "previewLink.copied": "Copiado",
  "previewLink.copiedToast": "Link de pré-escuta copiado",
  "previewLink.copyFailedToast":
    "Não conseguimos copiar o link. Seleciona-o e copia-o tu",
  "previewLink.made": "Criado {time}",
  "previewLink.newCta": "Criar um link novo",
  "previewLink.newTitle": "Criar um link de pré-escuta novo?",
  "previewLink.newBody": "O link antigo deixa de funcionar",
  "previewLink.turnOffCta": "Desligar o link",
  "previewLink.madeStatus": "Link de pré-escuta criado",
  "previewLink.replacedStatus":
    "Link novo criado. O antigo deixou de funcionar",
  "previewLink.turnedOffStatus": "Link de pré-escuta desligado",
  "previewLink.dialogTitle": "Link de pré-escuta de {title}",
  "previewPage.banner":
    "Pré-escuta privada de {persona}. Guarda este link só para ti",
  "support.artistHeading": "Apoiar {name}",
  "support.releaseHeading": "Comprar e apoiar {name}",
  "support.listLabel": "Onde apoiar {name}",
  "support.note":
    "Estes links abrem as páginas de {name} e a QueerPulse nunca mexe em dinheiro",
  "support.ownerEmpty":
    "Junta o Bandcamp, o Ko-fi ou o Patreon aos links da tua persona",
  "support.ownerEmptyCta": "Editar os links da persona",
  "support.buyOnBandcamp": "Comprar no Bandcamp",
  "support.buyRelease": "Comprar este lançamento",
  "support.opensInNewTab": "(abre num separador novo)",
  "pressKit.eyebrow": "Kit de imprensa",
  "pressKit.section.bestTracks": "As melhores <em>faixas</em>",
  "pressKit.bestTracksLabel": "As melhores faixas de {name}",
  "pressKit.fallbackNote": "Dos lançamentos mais recentes",
  "pressKit.copyBioCta": "Copiar a biografia",
  "pressKit.bioCopiedToast": "Biografia copiada",
  "pressKit.noBio": "Ainda sem biografia",
  "pressKit.section.releases": "Últimos <em>lançamentos</em>",
  "pressKit.section.links": "Links e <em>apoio</em>",
  "pressKit.linksLabel": "{name} noutros sítios",
  "pressKit.section.contact": "<em>Contacto</em>",
  "pressKit.noContact": "Ainda sem contacto de imprensa",
  "pressKit.editCta": "Editar o kit de imprensa",
  "pressKit.ownerEmptySection":
    "Publica um lançamento para preencher esta secção",
  "pressEdit.eyebrow": "Kit de imprensa",
  "pressEdit.title": "O teu <em>kit de imprensa</em>",
  "pressEdit.dek":
    "O que quem tem acesso ao Studio vê na tua página de imprensa, e o que a folha de apresentação imprime",
  "pressEdit.personaLabel": "Persona",
  "pressEdit.heading": "Kit de imprensa de <em>{name}</em>",
  "pressEdit.sub": "Tudo aqui é opcional. As partes vazias vêm da persona",
  "pressEdit.pitchLabel": "Frase de apresentação",
  "pressEdit.count": "{count} de {max}",
  "pressEdit.pitchTooLong": "Mantém a frase em 140 caracteres",
  "pressEdit.bioLabel": "Biografia para imprensa",
  "pressEdit.bioHint":
    "Aparece no kit de imprensa quando preenchida. Vazia, usa a biografia da persona",
  "pressEdit.bioTooLong": "Mantém a biografia em 1500 caracteres",
  "pressEdit.tracksLegend": "As melhores faixas",
  "pressEdit.tracksHint": "Até {max}, pela ordem que escolheres",
  "pressEdit.tracksFallbackHint":
    "Sem nenhuma escolhida, o kit mostra até 5 faixas dos teus lançamentos mais recentes",
  "pressEdit.trackUnavailable": "Já não está disponível",
  "pressEdit.addTrackLabel": "Juntar uma faixa",
  "pressEdit.addTrackPlaceholder": "Escolhe uma faixa",
  "pressEdit.moveUp": "Subir {title}",
  "pressEdit.moveDown": "Descer {title}",
  "pressEdit.removeTrack": "Tirar {title} das melhores faixas",
  "pressEdit.removeUnavailableTrack": "Remover a faixa indisponível {number}",
  "pressEdit.tracksLoadErrorTitle": "As tuas faixas não carregaram",
  "pressEdit.quotesLegend": "Citações",
  "pressEdit.quoteLabel": "Citação",
  "pressEdit.sourceLabel": "Fonte",
  "pressEdit.addQuoteCta": "Juntar citação",
  "pressEdit.removeQuoteCta": "Tirar a citação {number}",
  "pressEdit.quoteRequired": "Escreve a citação, ou tira esta",
  "pressEdit.quoteTooLong": "Mantém a citação em 300 caracteres",
  "pressEdit.quoteSourceRequired": "Diz de onde é a citação",
  "pressEdit.quoteSourceTooLong": "Mantém a fonte em 80 caracteres",
  "pressEdit.contactLabel": "Contacto",
  "pressEdit.contactHint":
    "Uma página começada por https:// ou um endereço começado por mailto:",
  "pressEdit.contactInvalid":
    "Usa um link começado por https:// ou um endereço começado por mailto:",
  "pressEdit.saveCta": "Guardar o kit de imprensa",
  "pressEdit.saving": "A guardar",
  "pressEdit.savedStatus": "Kit de imprensa guardado",
  "pressEdit.viewCta": "Ver o kit de imprensa",
  "oneSheet.downloadCta": "Descarregar a folha de apresentação",
  "oneSheet.backCta": "Voltar ao kit de imprensa",
  "oneSheet.saveHint": "Na janela de impressão, escolhe Guardar como PDF",
  "oneSheet.fileTitle": "{name}, folha de apresentação",
  "oneSheet.label": "Folha de apresentação de {name}",
  "oneSheet.bio": "Biografia",
  "oneSheet.bestTracks": "As melhores faixas",
  "oneSheet.releases": "Últimos lançamentos",
  "oneSheet.contact": "Contacto",
  "oneSheet.links": "Links",
  "oneSheet.qrLabel": "Código QR da página da persona {name}",
  "owner.v3.previewLink": "Link de pré-escuta",
  "owner.v3.previewLinkAria": "Link de pré-escuta de {title}",
  "owner.v3.toolsHeading": "Kit de imprensa e novidades",
  "owner.v3.pressKit": "Kit de imprensa",
  "owner.v3.editPressKit": "Editar o kit de imprensa",
  "owner.v3.postUpdateHeading": "Publicar uma novidade",
  "uploadFlow.v3.buyUrlLabel": "Link de compra",
  "uploadFlow.v3.buyUrlHint": "Bandcamp ou a tua própria loja. Opcional",
  "uploadFlow.v3.buyUrlHttpsOnly": "Usa um link completo começado por https://",
  "uploadFlow.v3.buyUrlTooLong": "Mantém o link em 1000 caracteres",
  "uploadFlow.v3.removePublishedTitle": "Tirar {title} de {release}?",
  "uploadFlow.v3.removePublishedBody":
    "Quem a guardou vai vê-la como já não disponível e ela sai de todas as playlists onde está",
  "uploadFlow.v3.removePublishedConfirm": "Tirar faixa",
  "numbers.reminders": "À espera: {value}",
  "rail.v3.pressKit": "Kit de imprensa",
  "creator.nav.pressKit": "Kit de imprensa",
  "artistPage.v3.moreAria": "Mais sobre {name}",
  "artistPage.v3.pressKit": "Kit de imprensa",
  // ── Studio Listening (2026-10-13): player, Now playing, queue, track
  // menu, chapters, lyric timing and the upload loudness check. Plan 3
  // Task 0 writes every key; Plan 2's code reads only the shortcuts and
  // chapters.error.outOfRange keys (contract section D). ────────────────
  // Player shortcuts (contract D; st/player/studioShortcuts.data.ts, StudioShortcutsSheet)
  "shortcuts.title": "Atalhos de teclado",
  "shortcuts.dek":
    "Funcionam em qualquer página enquanto houver música na fila, exceto quando estás a escrever num campo",
  "shortcuts.closeCta": "Fechar os atalhos",
  "shortcuts.playPause": "Reproduzir ou pausar",
  "shortcuts.seekBack": "Recuar 5 segundos",
  "shortcuts.seekForward": "Avançar 5 segundos",
  "shortcuts.previousTrack": "Faixa anterior",
  "shortcuts.nextTrack": "Faixa seguinte",
  "shortcuts.volumeUp": "Subir o volume",
  "shortcuts.volumeDown": "Baixar o volume",
  "shortcuts.mute": "Silenciar ou voltar a ouvir",
  "shortcuts.shuffle": "Ligar ou desligar a ordem aleatória",
  "shortcuts.repeat": "Mudar a repetição",
  "shortcuts.lyrics": "Abrir a letra",
  "shortcuts.queue": "Abrir a fila",
  "shortcuts.help": "Mostrar estes atalhos",
  "shortcuts.key.space": "Espaço",
  "shortcuts.key.shift": "Shift",
  "shortcuts.key.left": "Seta para a esquerda",
  "shortcuts.key.right": "Seta para a direita",
  "shortcuts.key.up": "Seta para cima",
  "shortcuts.key.down": "Seta para baixo",
  // Player bar, controls and Now playing extras (player/ui)
  "player.playFrom": "Ouvir a partir de {time}",
  "player.playFromAria": "Ouvir {title} a partir de {time}",
  "player.openNowPlaying": "Abrir A tocar agora, {title} de {artist}",
  "player.chapterAria": "Capítulo {number}: {title}",
  "player.queueShow": "Mostrar a fila",
  "player.queueHide": "Esconder a fila",
  "player.shuffle": "Ordem aleatória",
  "player.repeat.off": "Repetir: desligado",
  "player.repeat.all": "Repetir: tudo",
  "player.repeat.one": "Repetir: esta faixa",
  "player.cast": "Ouvir noutro dispositivo",
  "player.castConnected": "A tocar noutro dispositivo",
  "player.volume": "Volume",
  "player.volumeValue": "{percent}%",
  "player.mute": "Silenciar",
  "player.unmute": "Voltar a ouvir",
  "player.more": "Mais opções do leitor",
  "player.crossfade.label": "Transição",
  "player.crossfade.value_one": "{count} segundo",
  "player.crossfade.value_other": "{count} segundos",
  "player.crossfade.off": "Desligada",
  "player.crossfade.hint":
    "Funde cada faixa com a seguinte. As faixas do mesmo lançamento seguem sem pausa",
  "player.crossfade.unavailable":
    "A transição não está disponível nesta sessão",
  "player.loudness.label": "Equilibrar o volume",
  "player.loudness.hint": "Aproxima todas as faixas do mesmo nível",
  "player.loudness.plainHint":
    "Nesta sessão só consegue baixar as faixas mais altas",
  "player.shortcutsCta": "Atalhos de teclado",
  "player.sleep.heading": "Temporizador",
  "player.sleep.minutes": "{count} minutos",
  "player.sleep.endOfTrack": "Fim da faixa",
  "player.sleep.turnOff": "Desligar o temporizador",
  "player.sleep.chip": "Faltam {remaining}",
  "player.sleep.chipEndOfTrack": "Para depois desta faixa",
  "player.sleep.cancelAria": "Desligar o temporizador, faltam {remaining}",
  "player.sleep.cancelAriaEndOfTrack":
    "Desligar o temporizador marcado para o fim desta faixa",
  "player.sleep.setStatus": "Temporizador definido para {minutes} minutos",
  "player.sleep.endOfTrackStatus": "A reprodução para no fim desta faixa",
  "player.sleep.cancelledStatus": "Temporizador desligado",
  "player.lyrics.listLabel": "Letra, a acompanhar a música",
  "player.lyrics.backToCurrent": "Voltar à linha atual",
  // Now playing (StudioNowPlaying)
  "nowPlaying.dialogLabel": "A tocar agora",
  "nowPlaying.close": "Fechar A tocar agora",
  "nowPlaying.playingFrom": "A tocar de {source}",
  "nowPlaying.playingFromQueue": "A tocar da tua fila",
  "nowPlaying.tabsLabel": "Detalhes do que está a tocar",
  "nowPlaying.tab.lyrics": "Letra",
  "nowPlaying.tab.queue": "Fila",
  "nowPlaying.tab.credits": "Créditos",
  "nowPlaying.tab.chapters": "Capítulos",
  "nowPlaying.noLyrics": "Esta faixa ainda não tem letra",
  "nowPlaying.noCredits": "Esta faixa ainda não tem créditos",
  "nowPlaying.creditsLoading": "A carregar os créditos",
  // Queue (StudioQueueList, StudioQueuePanel)
  "queue.heading": "Fila",
  "queue.close": "Fechar a fila",
  "queue.nowPlaying": "A tocar agora",
  "queue.yours": "A tua fila",
  "queue.clear": "Limpar a fila",
  "queue.clearedStatus": "A tua fila está vazia",
  "queue.nextFrom": "A seguir de {source}",
  "queue.nextUp": "A seguir",
  "queue.emptyHint":
    "Junta faixas com Tocar a seguir ou Adicionar à fila no menu de qualquer faixa",
  "queue.upcomingEmpty": "Não há mais nada depois desta faixa",
  "queue.moveUp": "Subir {title}",
  "queue.moveDown": "Descer {title}",
  "queue.remove": "Tirar {title} da fila",
  "queue.movedStatus": "{title} está agora na posição {position}",
  "queue.removedStatus": "Tiraste {title} da fila",
  "queue.dragHint": "Arrasta para reordenar",
  // Track menu (StudioTrackMenu)
  "trackMenu.trigger": "Mais ações para {title}",
  "trackMenu.playNext": "Tocar a seguir",
  "trackMenu.addToQueue": "Adicionar à fila",
  "trackMenu.copyLink": "Copiar link",
  "trackMenu.copyLinkAt": "Copiar link em {time}",
  "trackMenu.playingNextToast": "Toca a seguir",
  "trackMenu.addedToast": "Adicionaste à tua fila",
  "trackMenu.linkCopiedToast": "Link copiado",
  "trackMenu.queueFailedToast": "Esta faixa não pode entrar na tua fila agora",
  // Chapters: listener lists, errors (contract A.7, D) and the editor
  "chapters.listHeading": "Alinhamento",
  "chapters.listHeadingFor": "Alinhamento de {title}",
  "chapters.listLabel": "Capítulos de {title}",
  "chapters.error.outOfRange":
    "Cada capítulo tem de começar antes de a faixa acabar",
  "chapters.error.time": "Escreve o tempo como m:ss ou h:mm:ss",
  "chapters.error.firstAtZero": "O primeiro capítulo começa em 0:00",
  "chapters.error.order": "Começa depois do capítulo de cima",
  "chapters.error.pastEnd": "Começa antes de a faixa acabar, em {time}",
  "chapters.error.titleRequired": "Dá um título a este capítulo",
  "chapters.error.titleTooLong": "Mantém o título até 120 caracteres",
  "chapters.error.artistTooLong":
    "Mantém o nome da pessoa artista até 120 caracteres",
  "chapters.error.tooMany": "Usa no máximo 100 capítulos",
  "chapters.error.summary":
    "Corrige os capítulos assinalados abaixo para guardar",
  "chapters.editor.heading": "Capítulos",
  "chapters.editor.count_one": "{count} capítulo",
  "chapters.editor.count_other": "{count} capítulos",
  "chapters.editor.hint":
    "Marca onde começa cada parte da faixa. Quem ouve pode saltar diretamente para ela",
  "chapters.editor.needsAudio":
    "Junta capítulos quando o áudio desta faixa estiver pronto",
  "chapters.editor.timeLabel": "Início do capítulo {number}",
  "chapters.editor.titleLabel": "Título do capítulo {number}",
  "chapters.editor.artistLabel": "Artista do capítulo {number}, opcional",
  "chapters.editor.add": "Adicionar um capítulo",
  "chapters.editor.remove": "Tirar o capítulo {number}",
  "chapters.editor.moveUp": "Subir o capítulo {number}",
  "chapters.editor.moveDown": "Descer o capítulo {number}",
  "chapters.editor.pasteToggle": "Colar um alinhamento",
  "chapters.editor.pasteLabel": "Alinhamento, uma linha por capítulo",
  "chapters.editor.pasteHint":
    "Por exemplo 00:00 Artista - Título ou 1:02:30 Título",
  "chapters.editor.pasteApply": "Usar este alinhamento",
  "chapters.editor.pasteReplaceNote": "Isto substitui os capítulos acima",
  "chapters.editor.pasteUnparsed": "Não conseguimos ler estas linhas:",
  "chapters.editor.pasteLine": "Linha {number}: {text}",
  "chapters.editor.pasteEmpty":
    "Cola pelo menos uma linha que comece com um tempo",
  "chapters.editor.pastedStatus_one": "{count} capítulo adicionado",
  "chapters.editor.pastedStatus_other": "{count} capítulos adicionados",
  // Lyric timing tool (upload/lyrics)
  "lyricTiming.addCta": "Adicionar tempos",
  "lyricTiming.editCta": "Editar tempos",
  "lyricTiming.summary_one": "{count} linha com tempo",
  "lyricTiming.summary_other": "{count} linhas com tempo",
  "lyricTiming.clearCta": "Apagar os tempos",
  "lyricTiming.mismatch":
    "A letra mudou desde que marcaste os tempos. Ao guardar, os tempos são apagados",
  "lyricTiming.dialogTitle": "Marcar os tempos da letra",
  "lyricTiming.dialogSub": "Quem ouve vê cada linha acender enquanto toca",
  "lyricTiming.modesLabel": "Como adicionar os tempos",
  "lyricTiming.mode.tap": "Marcar a ouvir",
  "lyricTiming.mode.paste": "Colar LRC",
  "lyricTiming.paste.label": "Letra em LRC",
  "lyricTiming.paste.hint":
    "Uma linha por marca, como [01:23.45] Uma linha da canção. Etiquetas como [ar:] ficam de fora e [offset:] é aplicado",
  "lyricTiming.paste.parsed_one": "{count} linha lida",
  "lyricTiming.paste.parsed_other": "{count} linhas lidas",
  "lyricTiming.paste.unparsedHeading":
    "Estas linhas não têm um tempo que consigamos ler e ficam de fora:",
  "lyricTiming.paste.noStamp": "Linha {number}: {text}",
  "lyricTiming.paste.tooLong": "A linha {number} passa dos 300 caracteres",
  "lyricTiming.paste.overLimit": "Usa no máximo 500 linhas com tempo",
  "lyricTiming.tap.stamp": "Marcar a linha {number}",
  "lyricTiming.tap.stampVisible": "Marcar",
  "lyricTiming.tap.stampHint":
    "Carrega em Espaço ou em Marcar quando cada linha começa",
  "lyricTiming.tap.left_one": "Falta {count} linha",
  "lyricTiming.tap.left_other": "Faltam {count} linhas",
  "lyricTiming.tap.allStamped": "Todas as linhas têm tempo",
  "lyricTiming.tap.earlier": "Linha {number} 0,1 segundos mais cedo",
  "lyricTiming.tap.later": "Linha {number} 0,1 segundos mais tarde",
  "lyricTiming.tap.playFromHere": "Ouvir a partir da linha {number}",
  "lyricTiming.tap.restart": "Recomeçar",
  "lyricTiming.tap.notTimed": "Ainda sem tempo",
  "lyricTiming.tap.silentClock":
    "Esta faixa não tem áudio para tocar aqui, por isso o relógio corre em silêncio",
  "lyricTiming.tap.loading": "A carregar o áudio",
  "lyricTiming.tap.audioError":
    "Não conseguimos tocar o áudio. Colar LRC continua a funcionar",
  "lyricTiming.tap.needsLyrics":
    "Escreve primeiro a letra para marcar a ouvir, ou cola LRC",
  "lyricTiming.preview": "Pré-visualizar",
  "lyricTiming.saveCta": "Usar estes tempos",
  "lyricTiming.cancelCta": "Cancelar",
  "lyricTiming.needAllLines":
    "Marca o tempo de todas as linhas para usar estes tempos",
  "lyricTiming.needLines": "Cola pelo menos uma linha com tempo",
  // Upload loudness: measuring, backfill and the check (spec 8.1 to 8.3)
  "upload.loudness.measuring": "A medir o volume",
  "upload.loudness.backfill_one": "A medir {count} faixa",
  "upload.loudness.backfill_other": "A medir {count} faixas",
  "upload.loudness.heading": "Verificação de volume",
  "upload.loudness.loudNote":
    "A faixa {number} mede {lufs} LUFS. Quem mantém 'Equilibrar o volume' ligado ouve-a um pouco mais baixa",
  "upload.loudness.peakNote":
    "A faixa {number} tem picos de {peak} dB, no topo da escala. O Studio mantém os picos de uma faixa reforçada em −1 dB ou menos, por isso pode tocar um pouco mais baixa",
  "upload.loudness.explainerToggle": "Como o Studio equilibra o volume",
  "upload.loudness.explainer":
    "Guardamos o teu ficheiro <em>tal como o enviaste</em>. Durante o envio, o teu navegador mede o volume. Quando quem ouve tem 'Equilibrar o volume' ligado, o Studio sobe ou baixa cada faixa em direção a −14 LUFS, no máximo 6 dB para cima e 12 dB para baixo, e uma faixa que sobe nunca passa de −1 dB nos picos. Quem o desliga ouve o teu master tal como está. Nada é recodificado",
  "uploadFlow.side.loudness.label": "Volume",
  "uploadFlow.side.loudness.value": "medido durante o envio",
  // ── Studio artist kinds (2026-10-14) ──────────────────────────────────────────
  "format.all": "Tudo",
  "format.music": "Música",
  "format.podcast": "Podcasts",
  "format.spoken_word": "Spoken word",
  "format.performance": "Performance",
  "format.listLabel": "Mostrar um formato",
  "releaseType.podcast": "Podcast",
  "releaseType.edit": "Edit de performance",
  "releaseType.lip_sync": "Lip-sync mix",
  "genre.spokenWord": "Spoken word",
  "home.newEpisodes.title": "Episódios <em>novos</em>",
  "home.spokenWord.title": "Spoken <em>word</em>",
  "home.onStage.title": "Em <em>palco</em>",
  "episodeCard.playAria": "Ouvir {title}",
  "episodeCard.pauseAria": "Pausar {title}",
  "browse.titleFormat": "<em>{format}</em> no Studio",
  "browse.gridLabelFormat": "Tudo em {format}",
  "browse.emptyTitleFormat": "Ainda não há nada em {format}",
  "searchPage.formatLabel": "Formato",
  "searchPage.formatAny": "Qualquer formato",
  "show.kindLine_one": "Podcast · {count} episódio",
  "show.kindLine_other": "Podcast · {count} episódios",
  "show.playLatestCta": "Ouvir o episódio mais recente",
  "show.pauseLatestCta": "Pausar o episódio mais recente",
  "show.aboutHeading": "Sobre o podcast",
  "show.episodesHeading": "Episódios",
  "show.sortLabel": "Ordenar episódios",
  "show.sortNewest": "Mais recentes",
  "show.sortOldest": "Mais antigos",
  "show.noEpisodes": "Ainda não há episódios",
  "show.addEpisodeCta": "Adicionar episódio",
  "show.draftsHeading": "Rascunhos",
  "show.draftChip": "Rascunho",
  "show.editEpisodeCta": "Editar episódio",
  "show.savedMeta": "Podcast · {artist}",
  "show.listLabel": "Episódios de {title}",
  "episode.number": "Episódio {number}",
  "episode.minutesLeft_one": "Falta {count} min",
  "episode.minutesLeft_other": "Faltam {count} min",
  "episode.played": "Ouvido",
  "episode.markPlayed": "Marcar como ouvido",
  "episode.markUnplayed": "Marcar como não ouvido",
  "episode.markedPlayedStatus": "{title} marcado como ouvido",
  "episode.markedUnplayedStatus": "{title} marcado como não ouvido",
  "episode.playAria": "Ouvir {title}",
  "episode.pauseAria": "Pausar {title}",
  "episode.notesHeading": "Notas do episódio",
  "episode.opensInNewTab": "(abre num separador novo)",
  "episode.playFromAria": "Ouvir a partir de {time}",
  "episode.crumbLabel": "Episódio",
  "episode.fromLabel": "De",
  "episode.publishedOn": "Publicado a {date}",
  "trackPage.transcriptHeading": "Transcrição",
  "trackPage.noTranscript": "Este não tem transcrição",
  "sources.heading": "Fontes",
  "sources.line": "{title} de {artist}",
  "sources.listLabel": "Músicas usadas em {title}",
  "sources.editorHint": "Cada música que usaste, com quem a fez",
  "sources.titleLabel": "Título da música {number}",
  "sources.artistLabel": "Artista {number}",
  "sources.addCta": "Adicionar fonte",
  "sources.removeCta": "Remover fonte",
  "sources.removeAria": "Remover fonte {number}",
  "sources.incomplete":
    "Preenche o título e quem fez a música em todas as linhas, ou remove a linha",
  "artist.main.showsHeading": "Podcasts",
  "artist.main.performanceHeading": "Áudio de performance",
  "owner.addEpisodeAria": "Adicionar episódio a {title}",
  "player.skipBack": "Recuar 15 s",
  "player.skipForward": "Avançar 30 s",
  "player.speed.heading": "Velocidade",
  "player.speed.value": "{rate}x",
  "player.speed.hint":
    "A velocidade aplica-se aos episódios de podcast. A música toca a 1x",
  "uploadFlow.release.showNameLabel": "Nome do podcast",
  "uploadFlow.release.showAboutLabel": "Sobre o podcast",
  "uploadFlow.publish.gap.sources": "Credita todas as fontes: {titles}",
  "uploadFlow.publish.rightsLabelSourced":
    "Tenho autorização para partilhar este edit, todas as fontes estão creditadas, e aceito que quem é membro do QueerPulse o ouça em streaming.",
  "uploadFlow.files.transcriptLabel": "Transcrição",
  "uploadFlow.files.lyricsHint": "A letra como é cantada, uma linha por verso",
  "uploadFlow.files.transcriptHint":
    "Tudo o que é dito, para quem quiser ler enquanto ouve",
  "uploadFlow.files.notesLabel": "Notas do episódio",
  "uploadFlow.files.notesHint":
    "Os endereços web passam a links, e tempos como 12:30 passam a botões para ouvir",
  "uploadFlow.files.countLabel": "{count} de {max}",
  "uploadFlow.files.rejectSizePodcast": "{fileName} tem mais de 250 MB",
  "uploadFlow.files.acceptsPodcast":
    "aceita · <em>MP3 · M4A</em> · até 250 MB por episódio",
  "episodeUpload.newTitle": "Episódio <em>novo</em>",
  "episodeUpload.editTitle": "Editar <em>episódio</em>",
  "episodeUpload.forShow": "Para {show}",
  "episodeUpload.audioHeading": "Áudio do episódio",
  "episodeUpload.titleLabel": "Título do episódio",
  "episodeUpload.explicitLabel": "Este episódio tem conteúdo explícito",
  "episodeUpload.uploading": "A carregar {fileName}",
  "episodeUpload.processing": "A ler o áudio",
  "episodeUpload.uploadFailed":
    "O carregamento parou. Escolhe o ficheiro outra vez",
  "episodeUpload.chaptersFromNotesCta": "Ler capítulos das notas",
  "episodeUpload.chaptersReplaceTitle": "Substituir os capítulos?",
  "episodeUpload.chaptersReplaceBody_one":
    "Os tempos das notas substituem o {count} capítulo que tens",
  "episodeUpload.chaptersReplaceBody_other":
    "Os tempos das notas substituem os {count} capítulos que tens",
  "episodeUpload.chaptersReplaceConfirm": "Substituir capítulos",
  "episodeUpload.chaptersNoneFound":
    "Nenhuma linha das notas começa com um tempo como 12:30",
  "episodeUpload.chaptersRead_one": "{count} capítulo lido das notas",
  "episodeUpload.chaptersRead_other": "{count} capítulos lidos das notas",
  "episodeUpload.saveCta": "Guardar episódio",
  "episodeUpload.publishCta": "Publicar episódio",
  "episodeUpload.savedStatus": "Episódio guardado",
  "episodeUpload.needsAudio": "Adiciona o áudio para publicar este episódio",
  "episodeUpload.publishedTitle": "<em>{title}</em> está publicado",
  "episodeUpload.openEpisodeCta": "Abrir o episódio",
  "episodeUpload.anotherCta": "Adicionar outro episódio",
  "episodeUpload.backToShowCta": "Voltar ao podcast",
  "episodeUpload.draftShowTitle": "Este podcast ainda é um rascunho",
  "episodeUpload.draftShowBody":
    "Adiciona os primeiros episódios no passo Faixas e depois publica o podcast",
  "episodeUpload.draftShowCta": "Abrir as faixas do podcast",
  "episodeUpload.oneFileOnly":
    "Um episódio leva um ficheiro, por isso usámos {fileName}",
  "episodeUpload.scheduledShowTitle": "Este podcast sai a {date}",
  "episodeUpload.scheduledShowBody":
    "Os episódios que juntares agora saem com ele",
  "errors.publishMissingSources":
    "Credita todas as fontes nas faixas de edit, lip-sync e mix",
  "errors.episodeShowNotPublished": "Publica o podcast antes dos episódios",
  "errors.episodeAlreadyPublished": "Este episódio já está publicado",
  "errors.episodeOrderLocked":
    "Um podcast publicado ordena os episódios pela data, e essa ordem mantém-se",
  "errors.notAPodcast": "Os episódios pertencem a podcasts",
  "errors.episodeLimit": "Um podcast tem no máximo 500 episódios",
  "uploadFlow.hero.subShow":
    "Três passos: o podcast, os episódios e a publicação. MP3 ou M4A, até 250 MB por episódio",
  "uploadFlow.side.size.valueShow": "até 250 MB por episódio",
  "uploadFlow.release.headingShow": "O <em>podcast</em>",
  "uploadFlow.release.continueCtaShow": "Guardar e seguir para os episódios",
  "facts.episodeCount_one": "{count} episódio",
  "facts.episodeCount_other": "{count} episódios",
  "episodeUpload.eyebrow": "Novo episódio · carregar",
  "episodeUpload.dropTitle": "Larga aqui um ficheiro MP3 ou M4A",
  "episodeUpload.chooseFile": "Escolher um ficheiro de áudio",
  "chapters.editor.hintEpisode": "Marca onde começa cada parte do episódio",
  "chapters.editor.pasteEpisode": "Colar capítulos",
  "searchPage.episodesHeading": "<em>Episódios</em>",
  "artist.showCount_one": "{count} podcast",
  "artist.showCount_other": "{count} podcasts",
  "artist.tabs.podcast": "Podcasts",
  "artist.tabs.spokenWord": "Spoken word",
  "artist.tabs.performance": "Performance",
};
