import type { Catalog } from "../../types";

/**
 * Studio showcase: pt-PT inclusivo, tu. Mesmas chaves que
 * `en/studioShowcase.ts`. O conteúdo fictício das páginas de demonstração do
 * Studio (conselho, emissão ao vivo, triagem, sinalizações, programa,
 * notificações, imprensa, pagamentos, recibo, fora do ar, partituras, sets,
 * direitos, retirada). Nomes próprios (artistas, pessoas, salas de concerto,
 * cidades, faixas, álbuns, sets) e números ficam nos ficheiros de dados como
 * foram escritos e chegam por {tokens}.
 */
export const studioShowcase: Catalog = {
  // ── Council: member card chrome (StudioCouncilPage) ──
  "council.member.seat.plain": "Lugar {seat}",
  "council.member.seat.chair": "Lugar {seat} · preside este trimestre",
  "council.member.seat.newest": "Lugar {seat} · a chegada mais recente",
  "council.member.since": "desde {year}",
  "council.member.slatesThisYear": "{total} este ano",
  "council.member.slate.meta_one": "{date} · {count} faixa",
  "council.member.slate.meta_other": "{date} · {count} faixas",
  "council.member.slate.payout.out": "<em>{amount}</em> pagos",
  "council.member.slate.payout.paid_one": "pago a <em>{count}</em> artista",
  "council.member.slate.payout.paid_other": "pago a <em>{count}</em> artistas",
  "council.member.slate.payout.grant": "<em>{amount}</em> em bolsa",
  "council.member.stat":
    "<em>{tracks}</em> faixas programadas · pago a <em>{artists}</em> artistas",

  // ── Council: member roles (StudioCouncilPage) ──
  "council.member.role.djProgrammer": "DJ e programação",
  "council.member.role.composerArchivist": "composição e arquivo",
  "council.member.role.soundArchivist": "arquivo sonoro",
  "council.member.role.producer": "produção",
  "council.member.role.artistCurator": "artista e curadoria",
  "council.member.role.choirDirector": "direção de coro",

  // ── Council: member bios and notebook lines (StudioCouncilPage) ──
  "council.member.saraMarques.bio":
    "Organizou as noites de quarta-feira da Casa do Comum durante uma década, antes de a cooperativa existir. Programa para <em>a hora entre o pôr do sol e a segunda garrafa</em>.",
  "council.member.saraMarques.note":
    "«Volto sempre à <em>Carta</em> da Mariana. É um hino que recusa a igreja. Abrimos a semana com ela porque quem ouve precisa de licença para a ternura numa quarta-feira»",
  "council.member.dOkoye.bio":
    "Monta os mixes longos para os quais mais ninguém tem tempo: <em>pessoas compositoras trans, de 1972 até hoje</em>. Acredita que uma playlist é um argumento e uma citação é uma gentileza.",
  "council.member.dOkoye.note":
    "«Metade da leva de bolsas desta semana foi para gente de quem os algoritmos já tinham desistido. <em>O trabalho é mesmo isto.</em> Encontrar quem as métricas enterraram e pagar-lhes primeiro»",
  "council.member.yaraReis.bio":
    "Guarda o arquivo <em>Lisbon dyke-bar standards</em>: gravações de campo, bootlegs, as canções que só existiram numa sala, numa noite.",
  "council.member.yaraReis.note":
    "«Uma gravação retida para validar direitos é uma gravação <em>à espera de pagar à pessoa certa</em>, e volta para ti assim que isso acontece»",
  "council.member.joaoRibeiro.bio":
    "Programa os aquecimentos e as descidas. Gere a leva <em>made here</em>, dedicada a primeiros lançamentos de pessoas da cooperativa.",
  "council.member.joaoRibeiro.note":
    "«Esta semana dei a bolsa da primavera a sete pessoas estreantes. Ninguém ali tem manager. <em>Ótimo.</em> A ideia sempre foi preparar as pessoas»",
  "council.member.akinDiallo.bio":
    "A única pessoa no conselho que ainda anda em digressão como artista. Programa a partir da estrada. Abstém-se de qualquer votação sobre os seus próprios lançamentos.",
  "council.member.akinDiallo.note":
    "«Programei esta noite a partir de um camarim em Marseille. O conselho devia ter sempre alguém com <em>o mesmo cansaço de quem anda na estrada a tocar</em>»",
  "council.member.helenaPinto.bio":
    "Vem dos coros comunitários e trouxe-os todos consigo. Programa o coral e o congregacional. Entrou no conselho por eleição na última assembleia.",
  "council.member.helenaPinto.note":
    "«Primeiro mês no conselho. Continuo a querer pedir desculpa por escolher tanta música coral. Depois lembro-me: <em>mais ninguém o vai fazer</em>, e os coros também precisam de ser pagos»",

  // ── Live: ribbon (StudioLivePage) ──
  "live.ribbon.duration": "programa de {length}, vamos em {elapsed}",

  // ── Live: now playing card (StudioLiveNow) ──
  "live.now.savedMeta": "{artist} · set ao vivo",
  "live.now.setBuilding.elapsed": "há {seconds} s",

  // ── Live: set list rows (StudioLiveNow) ──
  "live.set.who.played": "{artist} · tocou {start} → {end}",
  "live.set.who.playingNow": "{artist} · a tocar agora · {elapsed} / {length}",
  "live.set.who.upNext": "{artist} · a seguir · começa daqui a {countdown}",
  "live.set.who.planned": "{artist} · planeada, pode ser trocada",
  "live.set.pay.toArtist": "0,05 € para {artist}",
  "live.set.pay.perPlay": "0,05 € / reprodução",
  "live.set.pay.payingNow": "a pagar agora",
  "live.set.pay.queuedBy": "{curator} pôs na fila",

  // ── Home: Wednesday set rows (StudioPageSections) ──
  "room.set.payNote.paid": "pago",
  "room.set.payNote.paying": "a pagar",
  "room.set.upNext": "a seguir",

  // ── Live: chat (StudioLiveChat) ──
  "live.chat.system.opened": "{time} · {host} abriu a sala ao vivo",
  "live.chat.system.listening":
    "{time} · {listeners} a ouvir · {cities} cidades",
  "live.chat.system.nowPlaying": "{time} · a tocar agora: {title}, {artist}",
  "live.chat.role.curator": "Pessoa curadora",
  "live.chat.role.sustainer": "Apoiante",
  "live.chat.role.artist": "Artista",
  "live.chat.pinnedAt": "{time} · afixada",
  "live.chat.anonymous": "Pessoa anónima",
  "live.chat.you": "Tu",
  "live.chat.justNow": "agora",
  "live.chat.msg.welcome":
    "entrem à vontade. hoje: doze faixas, quase tudo piano, algum coro. não ponham em aleatório. <em>eu vou saber</em>",
  "live.chat.msg.first": "primeira mensagem {icon}",
  "live.chat.msg.cascaisOpener": "abrir com cascais, jogada clássica",
  "live.chat.msg.akinDouble":
    "a dobradinha do akin é tão boa. como é que encadeaste isso {icon}",
  "live.chat.msg.byAccident":
    "sinceramente? <em>por acaso.</em> tinha a paris no lugar 4 na semana passada e não resultou. passei-a para mais cedo e a salt water veio logo atrás",
  "live.chat.msg.saltWaterTip":
    '<b>deu {amount} de gorjeta a {artist}</b> · "a salt water é o disco todo"',
  "live.chat.msg.secondVerse":
    "o segundo verso acabou comigo. <em>outra vez</em>",
  "live.chat.msg.pinnedInNotes": "@yara está afixado nas notas da faixa {icon}",
  "live.chat.msg.earnItTip":
    '<b>deu {amount} de gorjeta a {artist}</b> · "faz por merecer, mariana"',
  "live.chat.msg.pianoWait":
    "o piano deixa-te aqui de propósito. <em>espera</em>",
  "live.chat.msg.tipNoNote": "<b>deu {amount} de gorjeta a {artist}</b>",

  // ── Broadcast: audio devices (StudioBroadcastConsole) ──
  "broadcast.devices.interface.name": "{device} · entradas 1 e 2",
  "broadcast.devices.interface.sub": "Interface USB · {spec}",
  "broadcast.devices.laptopMic.name": "Microfone do {device}",
  "broadcast.devices.laptopMic.sub": "Integrado · mono",
  "broadcast.devices.loopback.name": "Áudio do sistema (loopback)",
  "broadcast.devices.loopback.sub": "Para decks e software de DJ",

  // ── Broadcast: cue sheet (StudioBroadcastConsole) ──
  "broadcast.cues.unknownTitle": "Um edit pirata <em>(desconhecido)</em>",
  "broadcast.cues.unmatched": "Sem correspondência",
  "broadcast.cues.meta.matchedInCatalogue": "correspondida no catálogo",
  "broadcast.cues.meta.payoutHeld": "pagamento retido até ser validado",
  "broadcast.cues.meta.matched": "correspondida",

  // ── Broadcast: live tips (StudioBroadcastConsole) ──
  "broadcast.tips.note.privateNote": "Nota privada · só para ti",
  "broadcast.tips.note.quietTip": "Gorjeta discreta · sem nota",
  "broadcast.tips.note.earnItForMyMae":
    "faz por merecer, mariana. esta é pela minha mãe",
  "broadcast.tips.note.liveVersion":
    "a versão ao vivo dá cabo de mim todas as vezes",
  "broadcast.tips.note.thisIsTheOne": "é esta",
  "broadcast.tips.note.withLove": "bicha, com amor",

  // ── Broadcast: talkback (StudioBroadcastConsole) ──
  "broadcast.talkback.you": "Tu",
  "broadcast.talkback.role.mod": "moderação",
  "broadcast.talkback.role.council": "conselho",
  "broadcast.talkback.msg.chatLovely":
    "o chat está um amor esta noite, zero sinalizações. quando quiseres avançar para a cover, faz-me sinal e eu afixo a letra",
  "broadcast.talkback.msg.intoTheCover":
    "sinal dado, entro na cover depois desta. consegues afixar a tradução também?",
  "broadcast.talkback.msg.bothPinned":
    "já está. PT + EN afixadas. 418 a ouvir, tudo estável",
  "broadcast.talkback.msg.featureReplay":
    "só de passagem, este set está lindo. vou pôr a reposição em destaque na seleção de segunda",

  // ── Triage: submission rows (StudioTriageList) ──
  "triage.sub.day": "Dia {day}",
  "triage.sub.badge.firstSubmission": "Primeira submissão",
  "triage.sub.badge.trackCount_one": "{count} faixa",
  "triage.sub.badge.trackCount_other": "{count} faixas",
  "triage.sub.badge.leadSheetAttached": "Partitura com cifras anexada",
  "triage.sub.badge.lyricsInLanguage": "Letra em {language}",
  "triage.sub.badge.claimedByYou": "Reclamada · por ti",
  "triage.sub.badge.satbScores": "Partituras SATB",
  "triage.sub.badge.mixLength": "Mix · {minutes} min",
  "triage.sub.badge.cueSheetAttached": "Alinhamento anexado",
  "triage.sub.meta.submittedOn": "Enviada <em>{date}</em>",
  "triage.sub.meta.loudnessReady": "{loudness} · pronto",
  "triage.sub.meta.lyricTranslationRequested":
    "Tradução da letra pedida · {language}",
  "triage.sub.meta.translationsAttached": "Traduções anexadas: {languages}",
  "triage.sub.meta.clearedSourceArtists_one":
    "Licença de {count} artista de origem confirmada",
  "triage.sub.meta.clearedSourceArtists_other":
    "Licenças de {count} artistas de origem confirmadas",
  "triage.sub.meta.cueSheetTrackCount_one": "Alinhamento: {count} faixa",
  "triage.sub.meta.cueSheetTrackCount_other": "Alinhamento: {count} faixas",
  "triage.sub.meta.noteFromVoucher": "Nota de {name}: dá um voto de confiança",
  "triage.sub.piano.whoTag": "primeira submissão",
  "triage.sub.piano.note":
    "tenho 56 anos e passei a vida a trabalhar nas docas. comprei um piano aos 49 e ando a escrever as canções que devia ter escrito aos 24. esta é a primeira que teria orgulho em mandar. quatro minutos e quarenta segundos. piano e uma voz, sem mais nada",
  "triage.sub.coro.who":
    "Oito vozes · {city} · artistas de covers do coletivo coral",
  "triage.sub.coro.note":
    "somos a versão do porto do coro de outubro. quatro canções nossas, todas em mirandês, com o PT lado a lado. gravámos na casa do povo de miranda do douro, um microfone, dois takes cada",
  "triage.sub.tomboy.who": "DJ de {city} · segunda submissão",
  "triage.sub.tomboy.note":
    "mix sapatão-sci-fi, 38 minutos, tudo ouvido debaixo da pista. a última submissão levou uma recusa bem pensada. esta começa de outra maneira",
  "triage.sub.ainda.whoTag": "primeiro single, e é também quem nos traduz",
  "triage.sub.ainda.note":
    "dois minutos e quarenta e seis segundos. um piano e uma pequena fogueira. conheces-me como quem traduziu o disco da Mariana e queria experimentar o outro lado, só desta vez",

  // ── Triage: detail panel (StudioTriageDetail) ──
  "triage.detail.claim.headline": "Reclamada por {name}",
  "triage.detail.claim.note": "És tu quem responde a esta.",
  "triage.detail.claim.secondReader": "Segunda audição de {name} agendada.",
  "triage.detail.flagged.bridge": "a ponte aos 2:14 é que é",
  "triage.detail.flagged.regional": "o português soa regional, muito Porto",
  "triage.detail.flagged.standards":
    "daqui a um ano punha isto na coleção de standards, fácil",
  "triage.detail.file.withinBounds": "dentro dos limites",
  "triage.detail.file.translationRequested":
    "{original} · tradução para {target} pedida",
  "triage.detail.file.soleSplit": "100% {name} · sem colaborações",

  // ── Program: header and publish bar (StudioProgramPage) ──
  "program.header.dateRange": "15 a 21 de junho",
  "program.publishBar.publishDate": "seg., 15 de junho, 12:00 (hora de Lisboa)",

  // ── Program: cover artist (StudioProgramSlate) ──
  "program.cover.by_one":
    "{artist} · {city} · álbum de estreia · {count} faixa · estreia qua., 10 de junho",
  "program.cover.by_other":
    "{artist} · {city} · álbum de estreia · {count} faixas · estreia qua., 10 de junho",
  "program.cover.note":
    "<em>Fica até ao segundo verso da faixa seis.</em> Uma cantautora de Beja, finalmente nos seus próprios termos. Onze faixas de fado-pop, dirigidas sem rodeios a uma santa que não está a ouvir. O set de quarta-feira vai fechar com a última faixa do álbum.",

  // ── Program: singles credit line (StudioProgramSlate) ──
  "program.singles.who.lisbon": "{artist} · Lisboa",

  // ── Program: singles curator notes (StudioProgramSlate) ──
  "program.singles.note.kitchenInApril":
    "Uma balada de piano, paciente, sobre voltar a casa e encontrar a mãe com o rádio ligado.",
  "program.singles.note.bichaWithLove":
    "Seis vozes, uma palavra brasileira, agora uma edição para a pista a 120 bpm. A remistura que o original sempre quis.",
  "program.singles.note.cantigaParaAVizinha":
    "Quinze vozes trans, gravadas ao vivo numa cozinha. Sem reverb. Sem edições.",
  "program.singles.note.pedroOnThe25":
    "Um elétrico, um saxofone e a única canção honesta sobre engate na Praça do Comércio que ouvi este ano.",
  "program.singles.note.saltWaterSlowly":
    "Uma elegia em wolof para um irmão que não chegou a entrar no barco. Despida, feita de maré, de cortar a respiração.",
  "program.singles.note.ifYouHaveToAsk":
    "Oitenta segundos de voz sem acompanhamento. Um clássico dos bares lésbicos dos anos 70, cantado de cor.",
  "program.singles.note.carnationStill":
    "Cinquenta anos depois, uma canção nova para a revolução. Uma valsa, em 5/4.",

  // ── Program: collection rotation (StudioProgramSlate) ──
  "program.collections.meta.curatedBy_one":
    "com curadoria de {curator} · {count} faixa",
  "program.collections.meta.curatedBy_other":
    "com curadoria de {curator} · {count} faixas",
  "program.collections.meta.by_one": "de {curator} · {count} faixa",
  "program.collections.meta.by_other": "de {curator} · {count} faixas",
  "program.collections.meta.byWithNew_one":
    "de {curator} · {count} faixa · novidades de {source}: {newCount}",
  "program.collections.meta.byWithNew_other":
    "de {curator} · {count} faixas · novidades de {source}: {newCount}",
  "program.collections.badge.inOut": "entradas {added} / saídas {removed}",
  "program.collections.badge.noChange": "sem alterações",
  "program.collections.badge.in": "entradas {added}",

  // ── Program: live broadcasts (StudioProgramSlate) ──
  "program.broadcasts.weekday.wed": "qua.",
  "program.broadcasts.weekday.thu": "qui.",
  "program.broadcasts.premiereLead": "Estreia",
  "program.broadcasts.meta.wednesdaySet":
    "{host} · {duration} · o set de quarta-feira · forma de onda ao vivo + chat",
  "program.broadcasts.meta.premiere_one":
    "{host} · sala ao vivo · {count} faixa · legendas em EN + PT",
  "program.broadcasts.meta.premiere_other":
    "{host} · sala ao vivo · as {count} faixas · legendas em EN + PT",

  // ── Program: submissions inbox (StudioProgramInbox) ──
  "program.inbox.who.firstSubmission": "{name} · {city} · primeira submissão",
  "program.inbox.who.choir": "oito vozes · {city}",
  "program.inbox.who.djSecondSubmission": "DJ de {city} · segunda submissão",
  "program.inbox.who.firstSingle": "{name} · {city} · primeiro single",
  "program.inbox.who.trackOfAlbum":
    "{name} · {city} · {position} de {total} faixas",
  "program.inbox.quote.pianoIWaitedFor":
    "tenho 56 anos e trabalhei nas docas. comprei um piano aos 49 e ando a escrever as canções que devia ter escrito aos 24",
  "program.inbox.quote.coroDePorto":
    "somos o primo do porto do coro de outubro. quatro canções nossas, todas em mirandês",
  "program.inbox.quote.tomboyOutubro":
    "mix sapatão-sci-fi, 38 minutos, tudo ouvido lá de baixo da pista",
  "program.inbox.quote.ainda":
    "dois minutos e quarenta e seis segundos. um piano e uma fogueira pequenina",
  "program.inbox.quote.houseForTheStill":
    "house lento para quem já não bebe. gravado num só take",
  "program.inbox.quote.tiaObrigada":
    "um álbum em língua de mãe, quase todo. uma canção por cada tia da minha vida",

  // ── Notifications: timestamps (StudioNotificationsPage) ──
  "notifications.time.minutes": "{minutes} min",
  "notifications.time.hours": "{hours} h",
  "notifications.time.now": "agora",
  "notifications.time.weekday.mon": "seg.",
  "notifications.time.weekday.tue": "ter.",
  "notifications.time.weekday.sun": "dom.",

  // ── Notifications: rows (StudioNotificationsPage) ──
  "notifications.items.tipReply.title":
    "<strong>{name}</strong> respondeu à tua <em>gorjeta de {amount}</em>",
  "notifications.items.onTrack": "em “{track}”",
  "notifications.items.onTrackDaysAgo_one": "em “{track}” · há {count} dia",
  "notifications.items.onTrackDaysAgo_other": "em “{track}” · há {count} dias",
  "notifications.items.marianaReply.reply":
    '"rita adoro-te, esta era mesmo para as mães. vemo-nos na quarta"',
  "notifications.items.pedroReply.reply":
    '"esta canção vive na tua cabeça sem pagar renda? na minha também. obrigado"',
  "notifications.items.wednesdaySetLive.title":
    "O <strong>set de quarta-feira</strong> está <em>ao vivo agora</em>, com programação de {curator}",
  "notifications.items.wednesdaySetLive.meta_one":
    "{listeners} a ouvir · inclui {count} artista que segues",
  "notifications.items.wednesdaySetLive.meta_other":
    "{listeners} a ouvir · inclui {count} artistas que segues",
  "notifications.items.newSingle.title":
    "<strong>{name}</strong> lançou um single novo, <em>{track}</em>",
  "notifications.items.newSingle.meta":
    "De alguém que sustentas com {amount}/mês · grátis para quem sustenta",
  "notifications.items.collectionAdd.title":
    "<strong>{name}</strong> pôs numa coleção uma faixa a que deste gorjeta: <em>{collection}</em>",
  "notifications.items.collectionAdd.meta_one":
    "“{track}” aparece agora em {count} coleção do conselho",
  "notifications.items.collectionAdd.meta_other":
    "“{track}” aparece agora em {count} coleções do conselho",
  "notifications.items.monthlyRecap.title_one":
    "Chegou o teu resumo mensal: pagaste <strong>{amount}</strong> a <em>{count} artista</em> em maio",
  "notifications.items.monthlyRecap.title_other":
    "Chegou o teu resumo mensal: pagaste <strong>{amount}</strong> a <em>{count} artistas</em> em maio",
  "notifications.items.monthlyRecap.meta":
    "{sustainer} de contribuição como apoiante · {direct} em subscrições diretas · ver a divisão",
  "notifications.items.premiereSet.title_one":
    "<strong>{name}</strong> marcou uma estreia: <em>{album}</em>, {count} faixa",
  "notifications.items.premiereSet.title_other":
    "<strong>{name}</strong> marcou uma estreia: <em>{album}</em>, as {count} faixas",
  "notifications.items.premiereSet.meta":
    "10 de junho · 21:00, hora de Lisboa · sala ao vivo · vamos lembrar-te",
  "notifications.items.solidarityFund.title":
    "Os teus <em>arredondamentos de gorjetas</em> ajudaram o fundo de solidariedade a substituir um acordeão roubado",
  "notifications.items.solidarityFund.meta":
    "{amount} dos teus arredondamentos foram para apoio de emergência este trimestre",

  // ── Press: hero (StudioPressPage) ──
  "press.facts.pronounsValue": "ela / dela",
  "press.facts.playsValue": "<em>{plays}</em> no Studio",

  // ── Press: photos (StudioPressPage) ──
  "press.photos.liveGarage": "Ao vivo · garagem convertida",
  "press.photos.portraitSintra": "Retrato · colinas de Sintra",
  "press.photos.studioSession": "Estúdio · Cidade dos santos",
  "press.photos.portraitMono": "Retrato · preto e branco",

  // ── Press: facts and boilerplate (StudioPressPage) ──
  "press.boilerplate.fullNameValue": "Mariana Sol (n. 1996, Sintra)",
  "press.boilerplate.genreValue": "Fado · música devocional · canção erudita",
  "press.boilerplate.labelValue":
    "<em>Edição de autor</em> · masters próprios · via cooperativa QueerPulse Studio",
  "press.boilerplate.bookingValue": "Direto · sem agente · {email}",

  // ── Press: contact (StudioPressPage) ──
  "press.contact.body":
    "A Mariana trata da própria imprensa. Sem intermediários. <em>{email}</em> · costuma responder no prazo de um dia.",

  // ── Payouts: hero (StudioPayoutsSections) ──
  "payouts.hero.breakdownMonth": "julho",

  // ── Payouts: months and periods (StudioPayoutsSections, StudioPayoutsPage) ──
  "payouts.month.jul": "jul",
  "payouts.month.jun": "jun",
  "payouts.month.may": "mai",
  "payouts.month.apr": "abr",
  "payouts.month.mar": "mar",
  "payouts.period.july2026": "julho de 2026",
  "payouts.period.june2026": "junho de 2026",
  "payouts.period.may2026": "maio de 2026",
  "payouts.period.april2026": "abril de 2026",
  "payouts.period.march2026": "março de 2026",

  // ── Payouts: recent payout rows (StudioPayoutsSections, StudioPayoutsPage) ──
  "payouts.row.title": "Pagamento de {period}",
  "payouts.row.titleWithNote": "Pagamento de {period} · <em>{note}</em>",
  "payouts.row.note.pending": "pendente",
  "payouts.row.note.firstMonthOfCds": "primeiro mês de CDS",
  "payouts.row.note.firstOnStudio": "o primeiro no Studio",
  "payouts.plays": "{plays} reproduções",
  "payouts.meta.tips_one": "{count} gorjeta",
  "payouts.meta.tips_other": "{count} gorjetas",
  "payouts.meta.albumBuys_one": "{count} compra de álbum",
  "payouts.meta.albumBuys_other": "{count} compras de álbuns",
  "payouts.meta.directSubs_one": "{count} subscrição direta",
  "payouts.meta.directSubs_other": "{count} subscrições diretas",
  "payouts.meta.splits_one": "partilhado com {count} pessoa colaboradora",
  "payouts.meta.splits_other": "partilhado com {count} pessoas colaboradoras",

  // ── Payouts: track breakdown (StudioPayoutsSections) ──
  "payouts.breakdown.otherTracks": "Outras sete faixas <em>· somadas</em>",

  // ── Payouts: preferences (StudioPayoutsSections) ──
  "payouts.preferences.taxResidencyValue": "Portugal · NIF registado",

  // ── Receipt: card and note (StudioReceiptPage) ──
  "receipt.coverAlt": "Capa de {title}",
  "receipt.detail.cardSummary": "Cartão guardado · termina em {last4} ·",
  "receipt.note.quote": "faz por merecer, mariana",
  "receipt.note.replyBody":
    "rita adoro-te e estou a fazer por merecer, prometo",

  // ── Off air: hero (StudioOffAirHero) ──
  "offAir.hero.signoff.quote":
    "«Tocámos catorze músicas e pagámos a catorze pessoas por isso vai dormir, o catálogo fica aberto e voltamos quando a chaleira estiver ao lume»",
  "offAir.hero.signoff.attribution":
    "{name}, a fechar o set de quarta-feira às {time}",
  "offAir.hero.nextShow.title": "{show} com <em>{host}</em>",
  "offAir.hero.nextShow.description":
    "Ambient e composição trans · 90 minutos · legendas ao vivo",

  // ── Off air: card meta line (StudioOffAirShelves, StudioOffAirHero) ──
  "offAir.meta.kind.album": "Álbum",
  "offAir.meta.kind.djSet": "Set de DJ",
  "offAir.meta.kind.collection": "Coleção",
  "offAir.meta.kind.soundtrack": "BSO",
  "offAir.meta.kind.mix": "Mix",
  "offAir.meta.kind.ep": "EP",
  "offAir.meta.kind.live": "Ao vivo",
  "offAir.meta.trackCount_one": "{count} faixa",
  "offAir.meta.trackCount_other": "{count} faixas",

  // ── Sheet store: preview (StudioSheetPreview) ──
  "sheetStore.spec.scoring": "Voz + piano",
  "sheetStore.spec.key": "Tom · ré menor",
  "sheetStore.spec.lyrics": "Letra em português",
  "sheetStore.spec.pages_one": "{count} página",
  "sheetStore.spec.pages_other": "{count} páginas",
  "sheetStore.spec.format": "PDF · A4",
  "sheetStore.preview.pdfSub": "{composer} · voz e piano · ré menor",

  // ── Sheet store: checkout (StudioSheetCheckout) ──
  "sheetStore.checkout.spec_one": "voz + piano · {count} página",
  "sheetStore.checkout.spec_other": "voz + piano · {count} páginas",

  // ── Sheet store: more from the transcriber (StudioSheetAlso) ──
  "sheetStore.also.format.piano": "piano",
  "sheetStore.also.format.satb": "SATB",
  "sheetStore.also.format.leadSheet": "partitura principal",
  "sheetStore.also.format.guitarTab": "tablatura de guitarra",

  // ── Set: hero (StudioSetPage) ──
  "set.hero.recorded": "Gravado ao vivo · {venue} · {date}",
  "set.hero.length_one": "{count} faixa · {minutes} min",
  "set.hero.length_other": "{count} faixas · {minutes} min",
  "set.hero.blurb":
    "A hora entre o pôr do sol e a segunda garrafa. O quarto set Vespertina de {name}, gravado de uma só vez diante de quarenta pessoas, e que agora paga a cada artista do alinhamento em cada audição.",

  // ── Set: saved item (StudioSetPage) ──
  "set.saved.title": "Set do Studio",
  "set.saved.meta": "Set",
  "set.saved.description":
    "Um set ao vivo, noite dentro, gravado de uma só vez e sem cortes.",

  // ── Set submission: uploaded file (StudioSetMatcher) ──
  "setSubmission.file.loudness": "sonoridade {value}",

  // ── Set submission: unidentified tracks (StudioSetMatcher) ──
  "setSubmission.tracks.unknownBootleg": "edit pirata desconhecido",
  "setSubmission.tracks.whiteLabel": "white label: ID / ID",

  // ── Rights: release meta (StudioRightsPage) ──
  "rights.release.format.album": "Álbum",
  "rights.release.format.ep": "EP",
  "rights.release.format.single": "Single",
  "rights.release.format.liveRecording": "Gravação ao vivo",
  "rights.release.trackCount_one": "{count} faixa",
  "rights.release.trackCount_other": "{count} faixas",
  "rights.release.plays": "{plays} reproduções",
  "rights.release.paid": "{amount} pagos",
  "rights.release.clearanceDispute_one": "disputa de direitos em {count} faixa",
  "rights.release.clearanceDispute_other":
    "disputa de direitos em {count} faixas",

  // ── Rights: licence badge (StudioRightsPage) ──
  "rights.licence.sub": "licença",
  "rights.licence.allRights.top": "Todos os direitos",
  "rights.licence.allRights.sub": "reservados",

  // ── Withdrawn: still available cards (StudioWithdrawnPage) ──
  "withdrawn.still.allReleases": "Todos os lançamentos",
  "withdrawn.still.meta.artistTracks_one": "{artist} · {count} faixa",
  "withdrawn.still.meta.artistTracks_other": "{artist} · {count} faixas",
  "withdrawn.still.meta.artistEp": "{artist} · EP",
  "withdrawn.still.meta.artistSingle": "{artist} · single",
  "withdrawn.still.meta.collectionTracks_one": "Coleção · {count} faixa",
  "withdrawn.still.meta.collectionTracks_other": "Coleção · {count} faixas",
  "withdrawn.still.meta.artistCity": "Artista · {city}",

  // ── Rail: library shelf (StudioRail) ──
  "rail.library.meta.album": "Álbum · {artist}",
  "rail.library.meta.set": "Set · {artist}",
  "rail.library.meta.collectionTracks_one": "Coleção · {count} faixa",
  "rail.library.meta.collectionTracks_other": "Coleção · {count} faixas",
  "rail.library.meta.mix": "Mix · {artist}",
  "rail.library.meta.live": "Ao vivo · {venue}",
};
