import type { Catalog } from "../../types";

/**
 * VJ (code id `vj`): the admin VJ library, uploads, and the live screen and remote copy.
 */
export const vj: Catalog = {
  // ── Page ──
  "page.title": "VJ",
  "page.intro":
    "Carrega loops de vídeo e GIFs em packs, depois passa-os num projetor e troca-os ao vivo a partir do telemóvel",
  "page.openScreen": "Abrir ecrã",
  "page.openScreenAria": "Abrir ecrã num novo separador",
  "page.openRemote": "Abrir comando",
  "page.openRemoteAria": "Abrir comando num novo separador",
  "page.loadErrorTitle": "Não conseguimos carregar a biblioteca de VJ",
  "page.retryCta": "Carregar a biblioteca de novo",
  "page.leaveWhileUploading.body":
    "Os teus clips ainda estão a carregar. Se saíres agora, os carregamentos param e vais ter de adicionar esses ficheiros outra vez",
  "page.leaveWhileMakingPreviews.body":
    "Ainda estamos a criar pré-visualizações. Se saíres desta página, param",
  "library.sub": "Todos os clips que carregaste, os mais recentes primeiro",
  "pack.sub": "O comando mostra os clips deste pack por esta ordem",

  // ── Packs ──
  "packs.heading": "Packs",
  "packs.allClips": "Todos os clips",
  "packs.clipCount_one": "{count} clip",
  "packs.clipCount_other": "{count} clips",
  "packs.rowMeta_one": "{count} clip, {size}",
  "packs.rowMeta_other": "{count} clips, {size}",
  "packs.showAria": "Mostrar {name}",
  "packs.pickerLabel": "Pack",
  "packs.pickerOption": "{name} ({count})",
  "packs.manage": "Gerir packs",
  "packs.empty": "Ainda não há packs. Cria um para cada parte da noite",
  "packs.create.open": "Novo pack",
  "packs.create.label": "Nome do pack",
  "packs.create.placeholder": "Aquecimento",
  "packs.create.submit": "Criar pack",
  "packs.moveUp": "Subir {name}",
  "packs.moveDown": "Descer {name}",
  "packs.movedStatus": "{name} está agora na posição {position}",
  "packs.rename.open": "Mudar o nome do pack",
  "packs.rename.submit": "Guardar nome",
  "packs.delete.open": "Apagar pack",
  "packs.delete.title": "Apagar {name}",
  "packs.delete.body_one":
    "O pack desaparece e o {count} clip fica na biblioteca",
  "packs.delete.body_other":
    "O pack desaparece e os {count} clips ficam na biblioteca",
  "packs.delete.bodyEmpty":
    "Este pack não tem clips, por isso apagá-lo não muda mais nada",
  "packs.delete.confirm": "Apagar pack",
  "packs.toast.created": "{name} está pronto para receber clips",
  "packs.toast.renamed": "O pack chama-se agora {name}",
  "packs.toast.deleted": "{name} foi apagado. Os clips continuam na biblioteca",

  // ── Clips and the Edit clip dialog ──
  "clips.empty.packTitle": "Ainda não há clips neste pack",
  "clips.empty.packBody":
    "Carrega clips aqui ou adiciona clips a este pack a partir de Todos os clips",
  "clips.empty.libraryTitle": "Ainda não há clips",
  "clips.empty.libraryBody":
    "Carrega loops em MP4, WebM ou GIF para começar a biblioteca",
  "clips.gridLabel": "Clips em {name}",
  "clip.editAria": "Editar {title}",
  "clip.metaVideo": "Vídeo, {duration}, {size}",
  "clip.metaGif": "GIF, {size}",
  "clip.packCount_one": "Em {count} pack",
  "clip.packCount_other": "Em {count} packs",
  "clip.packCountNone": "Em nenhum pack",
  "clip.moveEarlier": "Passar {title} para antes",
  "clip.moveLater": "Passar {title} para depois",
  "clip.movedStatus": "{title} está agora na posição {position}",
  "clipDialog.title": "Editar clip",
  "clipDialog.playPreview": "Ver pré-visualização",
  "clipDialog.previewLabel": "Pré-visualização de {title}",
  "clipDialog.titleLabel": "Título",
  "clipDialog.saveTitle": "Guardar título",
  "clipDialog.titleSaved": "Título guardado",
  "clipDialog.fitLabel": "No ecrã",
  "clipDialog.fit.fill": "Preencher",
  "clipDialog.fit.fit": "Ajustar",
  "clipDialog.fitHint.fill": "Preenche o ecrã todo e corta as margens",
  "clipDialog.fitHint.fit": "Mostra o clip inteiro sobre uma cópia desfocada",
  "clipDialog.details": "{width} por {height} píxeis, {size}",
  "clipDialog.addedBy": "Adicionado por {name} a {date}",
  "clipDialog.addedOn": "Adicionado a {date}",
  "clipDialog.packsNone":
    "Ainda não há packs. Cria primeiro um na lista de packs",
  "clipDialog.addToPack": "Adicionar a {pack}",
  "clipDialog.removeFromPack": "Remover de {pack}",
  "clipDialog.moveLabel": "Mover para outro pack",
  "clipDialog.movePlaceholder": "Escolhe um pack",
  "clipDialog.moveSubmit": "Mover clip",
  "clipDialog.toast.added": "{title} está agora em {pack}",
  "clipDialog.toast.removed": "{title} saiu de {pack} e continua na biblioteca",
  "clipDialog.toast.moved": "{title} passou para {pack}",
  "clipDialog.deleteOpen": "Apagar clip",
  "clipDelete.title": "Apagar {title}",
  "clipDelete.body_one":
    "O clip e os ficheiros são apagados de vez, e ele sai do {count} pack onde está",
  "clipDelete.body_other":
    "O clip e os ficheiros são apagados de vez, e ele sai dos {count} packs onde está",
  "clipDelete.bodyNone":
    "O clip e os ficheiros são apagados de vez. Não está em nenhum pack",
  "clipDelete.setlistNote_one": "Também sai de {count} passo numa sequência",
  "clipDelete.setlistNote_other": "Também sai de {count} passos em sequências",
  "clipDelete.setlistNoteNamed_one": "Também sai de {names} ({count} passo)",
  "clipDelete.setlistNoteNamed_other": "Também sai de {names} ({count} passos)",
  "clipDelete.confirm": "Apagar clip",
  "clipDelete.toast": "{title} foi apagado",

  // ── Uploads ──
  "upload.cta": "Carregar clips",
  "upload.dropTitle": "Larga os clips aqui",
  "upload.accepts": "MP4 (H.264), WebM ou GIF, até {max} cada",
  "upload.destinationPack": "Os clips novos entram em {pack}",
  "upload.destinationLibrary":
    "Os clips novos entram na biblioteca, fora dos packs",
  "upload.rowsLabel": "Carregamentos",
  "upload.untitledTitle": "Clip sem título",
  "upload.status.queued": "À espera para carregar",
  "upload.status.checking": "A verificar o ficheiro",
  "upload.status.uploading": "A carregar, {percent}%",
  "upload.status.uploadingAnnounced": "A carregar",
  "upload.status.waiting":
    "Muitos carregamentos de uma vez. Tentamos de novo daqui a pouco",
  "upload.status.saving": "A adicionar à biblioteca",
  "upload.status.doneLibrary": "Adicionado à biblioteca",
  "upload.status.donePack": "Adicionado a {pack}",
  "upload.status.cancelled": "Carregamento cancelado",
  "upload.progressLabel": "Progresso do carregamento de {name}",
  "upload.cancel": "Cancelar carregamento",
  "upload.retry": "Tentar carregar de novo",
  "upload.removeRow": "Tirar da lista",
  "upload.removeRowAria": "Tirar {name} da lista",
  "upload.clearFinished": "Limpar carregamentos terminados",
  "upload.status.previewing": "A criar a pré-visualização",
  "upload.skipPreview": "Saltar pré-visualização",
  "upload.previewRetryHint":
    "Criar pré-visualizações, na biblioteca, tenta este clip outra vez",
  // ── Library sections ──
  "libraryView.label": "Secções da biblioteca",
  "libraryView.clips": "Clips",
  "libraryView.show": "Cenas e sequências",

  // ── Favorites ──
  "favorite.add": "Adicionar {title} aos favoritos",
  "favorite.remove": "Tirar {title} dos favoritos",
  "favorite.tooltipAdd": "Adicionar aos favoritos",
  "favorite.tooltipRemove": "Tirar dos favoritos",

  // ── Playback (Edit clip dialog) ──
  "playback.heading": "Reprodução",
  "playback.loopPointValue": "{seconds} segundos",
  "playback.speedLabel": "Velocidade",
  "playback.speedValue": "{speed}x",
  "playback.speedHint":
    "O projetor passa este clip a esta velocidade vezes a velocidade escolhida no comando",
  "playback.loopModeLabel": "Modo de repetição",
  "playback.loopMode.loop": "Loop",
  "playback.loopMode.pingPong": "Vaivém",
  "playback.loopModeHint.loop": "Passa até ao fim e volta ao início",
  "playback.loopModeHint.pingPong":
    "Passa para a frente, depois para trás, e repete",
  "playback.loopLabel": "Pontos de loop",
  "playback.loopHint":
    "Arrasta as pegas para escolher a parte do clip que repete",
  "playback.loopStart": "Início do loop",
  "playback.loopEnd": "Fim do loop",
  "playback.loopLength": "Loop de {length}",
  "playback.saveLoop": "Guardar loop",
  "playback.wholeClip": "Usar o clip inteiro",
  "playback.loopSaved": "Loop guardado",
  "playback.wholeClipSaved": "Agora repete o clip inteiro",
  "playback.gifLoopNote":
    "Os GIFs repetem sempre inteiros. A velocidade e o modo de repetição continuam a aplicar-se",

  // ── Pack event link ──
  "packEvent.none": "Sem evento associado",
  "packEvent.linked": "Evento: {title}, {date}",
  // A VJ operator's pack whose event members can no longer see: the server
  // withholds the title and the date, and the reason line below names why.
  "packEvent.withheld": "Evento: já não está visível para membros",
  "packEvent.link": "Associar evento",
  "packEvent.change": "Mudar evento",
  "packEvent.unlink": "Desassociar evento",
  "packEvent.pickerLabel": "Próximo evento",
  "packEvent.pickerPlaceholder": "Escolhe um evento",
  "packEvent.pickerSearch": "Procurar eventos",
  "packEvent.pickerEmpty":
    "Não há eventos próximos. Publica primeiro um evento público ou para membros",
  "packEvent.pickerHint":
    "O projetor pode mostrar a data deste evento e um código QR para a página dele",
  "packEvent.qrNote":
    "Ao ler o código QR abre-se a página do evento, que é só para membros. Quem não tiver sessão iniciada tem de entrar primeiro",
  "packEvent.submit": "Associar evento",
  "packEvent.cancel": "Cancelar",
  "packEvent.reload": "Carregar os eventos outra vez",
  "packEvent.online": "Online",
  "packEvent.optionLine": "{date}, {area}",
  "packEvent.toast.linked": "{pack} está agora associado a {event}",
  "packEvent.toast.unlinked": "{pack} já não tem evento associado",
  "packEvent.unavailable.cancelled":
    "Este evento foi cancelado, por isso o projetor esconde o cartão",
  "packEvent.unavailable.not_listed":
    "Este evento já não está publicado para o público ou para membros, por isso o projetor esconde o cartão",

  // ── Animated previews ──
  "previews.missing_one":
    "{count} clip da tua biblioteca ainda não tem pré-visualização animada",
  "previews.missing_other":
    "{count} clips da tua biblioteca ainda não têm pré-visualização animada",
  "previews.doneTitle": "Criaste",
  "previews.doneTitleEm_one": "{count} pré-visualização",
  "previews.doneTitleEm_other": "{count} pré-visualizações",
  "previews.doneBody":
    "Cada clip mostra agora a sua pré-visualização animada na biblioteca e no comando",
  "previews.hint":
    "As pré-visualizações aparecem quando carregas sem soltar num clip no comando. Mantém este separador aberto enquanto são criadas",
  "previews.start": "Criar pré-visualizações",
  "previews.stop": "Parar de criar pré-visualizações",
  "previews.progress": "A criar a pré-visualização {current} de {total}",
  "previews.progressLabel": "Pré-visualizações criadas",
  "previews.rowsLabel": "Pré-visualizações",
  "previews.clipGone": "Um clip que saiu da biblioteca",
  "previews.stage.waiting": "À espera",
  "previews.stage.reading": "A ler o clip",
  "previews.stage.recording": "A gravar a pré-visualização",
  "previews.stage.uploading": "A enviar a pré-visualização",
  "previews.stage.saving": "A guardar",
  "previews.stage.done": "Pré-visualização pronta",
  "previews.stage.failed": "Não foi possível criar",
  "previews.stage.stopped": "Parado",
  "previews.summaryMade_one": "Criaste {count} pré-visualização",
  "previews.summaryMade_other": "Criaste {count} pré-visualizações",
  "previews.summaryFailed_one": "{count} falhou",
  "previews.summaryFailed_other": "{count} falharam",
  "previews.retryFailed": "Criar outra vez as que falharam",
  "previews.close": "Fechar",

  // ── Library scenes ──
  "libraryScenes.heading": "Cenas",
  "libraryScenes.count": "{count} de {max}",
  "libraryScenes.intro":
    "Guarda um visual como cena no comando. Aqui podes mudar o nome, ordenar e apagar cenas",
  "libraryScenes.listLabel": "Cenas por ordem",
  "libraryScenes.emptyTitle": "Ainda não há cenas",
  "libraryScenes.emptyBody":
    "Abre o comando, monta um visual e guarda-o como cena",
  "libraryScenes.loadErrorTitle": "Não conseguimos carregar as cenas",
  "libraryScenes.retry": "Carregar as cenas outra vez",
  "libraryScenes.sourceClip": "Clip: {title}",
  "libraryScenes.sourceClipGone": "Clip: apagado",
  "libraryScenes.sourceGenerator": "Gerador: {name}",
  "libraryScenes.sourceKeepsLive": "Mantém o que está a passar",
  "libraryScenes.effectsNone": "Sem efeitos",
  "libraryScenes.withText": "Com texto",
  "libraryScenes.withMix": "Com camada de mistura",
  "libraryScenes.packNone": "Sem pack",
  "libraryScenes.moveUp": "Subir {name}",
  "libraryScenes.moveDown": "Descer {name}",
  "libraryScenes.movedStatus": "{name} é agora a cena {position}",
  "libraryScenes.editAria": "Editar {name}",
  "libraryScenes.nameLabel": "Nome da cena",
  "libraryScenes.packLabel": "Pack",
  "libraryScenes.save": "Guardar cena",
  "libraryScenes.cancel": "Cancelar",
  "libraryScenes.saved": "Cena guardada",
  "libraryScenes.deleteAria": "Apagar {name}",
  "libraryScenes.deleteTitle": "Apagar {name}",
  "libraryScenes.deleteBody": "A cena sai da biblioteca",
  "libraryScenes.deleteBodySetlists_one":
    "A cena sai da biblioteca e de {count} passo numa sequência",
  "libraryScenes.deleteBodySetlists_other":
    "A cena sai da biblioteca e de {count} passos em sequências",
  "libraryScenes.deleteConfirm": "Apagar cena",
  "libraryScenes.deleted": "{name} apagada",

  // ── Library set lists ──
  "librarySetlists.heading": "Sequências",
  "librarySetlists.count": "{count} de {max}",
  "librarySetlists.intro":
    "Uma sequência passa clips e cenas por ordem, cada um durante o seu tempo. Põe-na a tocar no comando e ela avança sozinha",
  "librarySetlists.listLabel": "Sequências por ordem",
  "librarySetlists.emptyTitle": "Ainda não há sequências",
  "librarySetlists.emptyBody":
    "Cria uma e junta clips e cenas pela ordem em que os queres passar",
  "librarySetlists.loadErrorTitle": "Não conseguimos carregar as sequências",
  "librarySetlists.retry": "Carregar as sequências outra vez",
  "librarySetlists.create.open": "Nova sequência",
  "librarySetlists.create.label": "Nome da sequência",
  "librarySetlists.create.submit": "Criar sequência",
  "librarySetlists.created": "{name} criada",
  "librarySetlists.stepCount_one": "{count} passo",
  "librarySetlists.stepCount_other": "{count} passos",
  "librarySetlists.moveUp": "Subir {name}",
  "librarySetlists.moveDown": "Descer {name}",
  "librarySetlists.movedStatus": "{name} é agora a sequência {position}",
  "librarySetlists.editSteps": "Editar passos",
  "librarySetlists.editStepsAria": "Editar os passos de {name}",
  "librarySetlists.renameAria": "Mudar o nome de {name}",
  "librarySetlists.renameSubmit": "Guardar nome",
  "librarySetlists.renamed": "Sequência com o novo nome {name}",
  "librarySetlists.deleteAria": "Apagar {name}",
  "librarySetlists.deleteTitle": "Apagar {name}",
  "librarySetlists.deleteBody": "Os clips e as cenas dela ficam na biblioteca",
  "librarySetlists.deleteConfirm": "Apagar sequência",
  "librarySetlists.deleted": "{name} apagada",
  "librarySetlists.settingsLabelNamed": "Definições de {name}",
  "librarySetlists.defaultLength": "Duração predefinida dos passos",
  "librarySetlists.loop": "Repetir",
  "librarySetlists.loopHint": "Volta ao passo 1 depois do último passo",
  "librarySetlists.saved": "Definições da sequência guardadas",
  "librarySetlists.runTime": "Dura {minutes} min {seconds} s",
  "librarySetlists.runTimeAbout": "Cerca de {minutes} min a {bpm} BPM",
  "setlistItems.listLabel": "Passos de {name}",
  "setlistItems.count": "{count} de {max} passos",
  "setlistItems.empty":
    "Esta sequência ainda não tem passos. Junta um clip ou uma cena aqui em baixo",
  "setlistItems.noScenes":
    "Guarda primeiro cenas no comando e depois junta-as aqui",
  "setlistItems.sceneGone": "Uma cena apagada",
  "setlistItems.clipGone": "Um clip apagado",
  "setlistItems.moveUp": "Subir {step} na sequência",
  "setlistItems.moveDown": "Descer {step} na sequência",
  "setlistItems.movedStatus": "{step} é agora o passo {position}",
  "setlistItems.remove": "Tirar {step} de {setlist}",
  "setlistItems.removeTooltip": "Tirar da sequência",
  "setlistItems.removed": "{step} saiu de {setlist}",
  "setlistItems.addLabel": "Juntar uma cena",
  "setlistItems.addPlaceholder": "Escolhe uma cena",
  "setlistItems.addSearch": "Procurar cenas",
  "setlistItems.addEmpty": "Nenhuma cena corresponde",
  "setlistItems.addSubmit": "Juntar cena",
  "setlistItems.addSceneHint": "Escolhe uma cena primeiro",
  "setlistItems.added": "{step} entrou como passo {position}",
  "setlistItems.full":
    "Esta sequência está cheia. Tira um passo para juntar outro",
  "setlistItems.addClipLabel": "Juntar um clip",
  "setlistItems.addClipPlaceholder": "Escolhe um clip",
  "setlistItems.addClipSearch": "Procurar clips",
  "setlistItems.addClipEmpty": "Nenhum clip pronto corresponde",
  "setlistItems.addClipSubmit": "Juntar clip",
  "setlistItems.addClipHint": "Escolhe um clip primeiro",
  "setlistItems.noClips": "Carrega primeiro clips e depois junta-os aqui",
  "setlistItems.kindClip": "Clip",
  "setlistItems.kindScene": "Cena",
  "setlistItems.lengthLabel": "Duração de {step}",
  "setlistItems.lengthDefault": "Predefinida ({length})",
  "setlistItems.lengthCustom": "Duração própria",
  "setlistItems.lengthSaved": "{step} passa a durar {length}",
  "setlistItems.runTimeSeconds": "Dura {seconds} s",

  // ── Step length ──
  "duration.kindLabel": "Duração em",
  "duration.kindSeconds": "Segundos",
  "duration.kindBeats": "Batidas",
  "duration.valueLabel": "Duração",
  "duration.secondsValue": "{count} s",
  "duration.beatsValue": "{count} batidas",
  "duration.beatCount_one": "{count} batida",
  "duration.beatCount_other": "{count} batidas",
  "duration.secondsRange": "De {min} a {max} segundos",

  // ── Live connections (library) and the stopped screen ──
  "live.title": "Ligações ativas",
  "live.summary.both": "{screens} e {remotes} ligados",
  "live.summary.one": "Ligados: {devices}",
  "live.summary.none": "Nada está ligado neste momento",
  "live.summary.loading": "A ver o que está ligado",
  "live.summary.unread": "Não deu para ler as ligações",
  "live.screenCount_one": "{count} ecrã",
  "live.screenCount_other": "{count} ecrãs",
  "live.remoteCount_one": "{count} comando",
  "live.remoteCount_other": "{count} comandos",
  "live.idle_one": "Ainda há um espetáculo guardado em memória sem nada ligado",
  "live.idle_other":
    "Ainda há {count} espetáculos guardados em memória sem nada ligado",
  "live.showConnections": "Mostrar ligações",
  "live.hideConnections": "Esconder ligações",
  "live.stopEverything": "Parar tudo",
  "live.yourShow": "O teu espetáculo",
  "live.operatorShow": "Espetáculo de {name}",
  "live.otherOperatorShow": "Espetáculo de outra pessoa operadora",
  "live.screenName": "Ecrã {number}",
  "live.remoteName": "Comando",
  "live.lead": "Principal",
  "live.connectedSince": "Ligado {time}",
  "live.justNow": "agora mesmo",
  "live.timeUnknown": "a uma hora desconhecida",
  "live.rendererWebgl": "Motor de efeitos",
  "live.rendererDom": "Renderizador de reserva",
  "live.rendererSimple": "Renderizador simples, só fades",
  "live.fullscreen": "Ecrã inteiro",
  "live.windowed": "Numa janela",
  "live.disconnectScreen": "Desligar ecrã",
  "live.disconnectRemote": "Desligar comando",
  "live.stopDialog.title": "Parar todos os ecrãs e comandos?",
  "live.stopDialog.body":
    "Os ecrãs saem do espetáculo e ficam escuros. Cada ecrã e comando precisa de recarregar a página para voltar a ligar",
  "live.stopDialog.bodyAdmin":
    "Isto para o espetáculo de todas as pessoas operadoras, incluindo o teu. Os ecrãs saem do espetáculo e ficam escuros, e cada ecrã e comando precisa de recarregar a página para voltar a ligar",
  "live.stopped.both": "Parados: {screens} e {remotes}",
  "live.stopped.one": "Parados: {devices}",
  "live.stopped.none":
    "Nada estava ligado, e o espetáculo guardado em memória foi limpo",
  "screen.stoppedTitle": "Este ecrã parou",
  "screen.connectAgain": "Ligar de novo",
  "live.stopped.nothingRunning":
    "Não estava nada a correr, por isso não havia nada para parar",
  "live.screenNameUnknown": "Ecrã",
  "live.quietLine": "Nenhum ecrã ou comando está ligado neste momento",
  "screen.stoppedHint": "Alguém parou este ecrã na biblioteca de VJ",

  // ── Reason codes, REST and upload ──
  "error.packNotFound": "Este pack foi apagado, talvez noutro separador",
  "error.packNameRequired": "Dá um nome ao pack",
  "error.packNameTooLong": "Os nomes dos packs têm no máximo {max} caracteres",
  "error.packNameTaken": "Já há outro pack com este nome",
  "error.packLimitReached":
    "A biblioteca tem no máximo {max} packs. Apaga um para criares outro",
  "error.packReorderMismatch":
    "Os packs mudaram enquanto os movias. A lista mostra agora a ordem atual",
  "error.packFull":
    "Um pack tem no máximo {max} clips. Remove um para adicionares outro",
  "error.packClipsReorderMismatch":
    "Os clips deste pack mudaram enquanto os movias. A grelha mostra agora a ordem atual",
  "error.clipNotFound": "Este clip foi apagado, talvez noutro separador",
  "error.clipAlreadyInPack": "Este clip já está nesse pack",
  "error.clipNotInPack": "Este clip já tinha saído desse pack",
  "error.clipTitleRequired": "Dá um título ao clip",
  "error.clipTitleTooLong":
    "Os títulos dos clips têm no máximo {max} caracteres",
  "error.clipFitModeInvalid": "Escolhe Preencher ou Ajustar",
  "error.clipDimensionsInvalid":
    "Não conseguimos ler o tamanho deste clip em píxeis, ou um dos lados passa de 16384 píxeis. Exporta-o de novo e carrega o ficheiro novo",
  "error.clipDurationInvalid":
    "Não conseguimos ler a duração deste clip, ou passa de uma hora. Os clips têm no máximo uma hora",
  "error.clipKeyInvalid":
    "O carregamento não terminou bem. Carrega o ficheiro de novo",
  "error.clipKeyInUse":
    "Este carregamento já é um clip na biblioteca. Carrega o ficheiro de novo para o adicionares outra vez",
  "error.clipIdsInvalid":
    "O ecrã pediu clips de uma forma que o servidor não aceitou. Recarrega o ecrã",
  "error.libraryFull":
    "A biblioteca tem no máximo {max} clips. Apaga alguns para carregares mais",
  "error.uploadNotAdmin":
    "Carregar clips de VJ está aberto a admins e à função Operação VJ, e esta conta não tem nenhuma das duas",
  "error.uploadTypeUnsupported":
    "Este ficheiro não é MP4, WebM nem GIF. Exporta-o num destes formatos e carrega-o de novo",
  "error.uploadTooLarge":
    "Este ficheiro tem {sizeLabel}. Os clips têm no máximo {max}",
  "error.uploadThumbnailTooLarge":
    "A imagem de pré-visualização deste clip ficou acima de {max}. Carrega o clip de novo",
  "error.uploadFormatMov":
    "Este ficheiro é MOV. Exporta-o como MP4 ou WebM e carrega-o de novo",
  "error.uploadContentMismatch":
    "O ficheiro carregado não corresponde ao formato, por isso pode estar danificado. Exporta-o de novo e carrega o ficheiro novo",
  "error.uploadMissing":
    "O carregamento parou antes de o ficheiro chegar ao servidor. Carrega-o de novo",
  "error.uploadHevc":
    "Este MP4 usa HEVC, que os browsers não conseguem reproduzir. Exporta-o como H.264",
  "error.uploadUnplayable":
    "O teu browser não consegue reproduzir este vídeo. Exporta-o como MP4 (H.264) ou WebM",
  "error.uploadGifDamaged":
    "Este GIF está danificado ou incompleto. Exporta-o de novo e carrega o ficheiro novo",
  "error.uploadThumbnailFailed":
    "Este browser não conseguiu criar a imagem de pré-visualização deste clip. Carrega-o a partir do Chrome ou do Edge",
  "error.clipFavoriteInvalid": "O favorito tem de estar ligado ou desligado",
  "error.clipSpeedInvalid": "Escolhe uma velocidade entre 0,25x e 4x",
  "error.clipLoopModeInvalid": "Escolhe Loop ou Vaivém",
  "error.clipLoopInvalid":
    "Os pontos de loop têm de ficar dentro do clip, com pelo menos {min} ms entre eles",
  "error.eventNotFound": "Este evento já não existe",
  "error.eventNotLinkable":
    "Só eventos publicados, públicos ou para membros, podem aparecer no projetor",
  "error.sceneNotFound": "Esta cena já não existe",
  "error.sceneNameRequired": "Dá um nome à cena",
  "error.sceneNameTooLong": "Os nomes das cenas têm no máximo {max} caracteres",
  "error.sceneLimitReached":
    "A biblioteca tem no máximo {max} cenas. Apaga uma para guardares outra",
  "error.sceneLookInvalid":
    "Este visual tem uma definição que o projetor não consegue usar",
  "error.sceneClipNotFound": "Um clip deste visual foi apagado",
  "error.sceneReorderMismatch": "A nova ordem tem de incluir cada cena uma vez",
  "error.setlistNotFound": "Esta sequência já não existe",
  "error.setlistNameRequired": "Dá um nome à sequência",
  "error.setlistNameTooLong":
    "Os nomes das sequências têm no máximo {max} caracteres",
  "error.setlistNameTaken": "Já há outra sequência com este nome",
  "error.setlistLimitReached": "A biblioteca tem no máximo {max} sequências",
  "error.setlistReorderMismatch":
    "A nova ordem tem de incluir cada sequência uma vez",
  "error.setlistItemsInvalid": "Não conseguimos ler os passos da sequência",
  "error.setlistFull": "Uma sequência tem no máximo {max} passos",
  "error.setlistStepInvalid": "Cada passo precisa de um clip ou de uma cena",
  "error.setlistStepDurationInvalid":
    "A duração de um passo vai de {min} a {max} segundos, ou 4, 8, 16, 32 ou 64 batidas",
  "error.setlistItemNotFound":
    "Um passo foi tirado noutro lado. Carrega a sequência outra vez",
  "error.setlistLoopInvalid": "Repetir tem de estar ligado ou desligado",
  "error.setlistPatchEmpty": "Não há nada para guardar nesta sequência",
  "error.previewUnsupported":
    "Este browser não consegue criar pré-visualizações. Experimenta o Chrome ou o Edge",
  "error.previewFailed": "Não conseguimos criar a pré-visualização deste clip",
  "error.uploadPreviewTooLarge":
    "A pré-visualização animada deste clip ficou acima de {max}. Cria a pré-visualização de novo",

  "error.connectionNotFound": "Esse dispositivo já se desligou",
  "error.connectionNotYours":
    "Esse dispositivo pertence ao espetáculo de outra pessoa operadora",
  // ── Reason codes, socket ──
  "error.socket.notAdmin":
    "O VJ está aberto a admins e à função Operação VJ, e esta conta já não tem nenhuma das duas",
  "error.socket.notAttached":
    "A ligação ao palco ainda não estava pronta. Tenta de novo",
  "error.socket.alreadyAttached":
    "Esta página já está ligada ao palco. Recarrega-a para voltar a ligar",
  "error.socket.wrongRole":
    "Esta página não pode enviar esse comando. Usa o comando para mudar o que passa",
  "error.socket.screenIdInvalid":
    "Este separador do ecrã não se conseguiu identificar. Recarrega o ecrã",
  "error.socket.clientIdInvalid":
    "Este comando não se conseguiu identificar. Recarrega o comando",
  "error.socket.rateLimited":
    "Foram muitos toques de uma vez. Espera um segundo e toca de novo",
  "error.socket.staleCommand":
    "Outro comando mudou isto primeiro. O comando mostra agora o que está a passar",
  "error.socket.staleClipSequence":
    "O clip mudou antes de o aleatório avançar. O aleatório continua a partir do clip novo",
  "error.socket.notLead":
    "Outro ecrã comanda o aleatório, por isso este segue-o",
  "error.socket.shuffleOff":
    "O aleatório está desligado, por isso o ecrã fica neste clip",
  "error.socket.noActivePack":
    "Escolhe primeiro um pack. O aleatório passa os clips do pack ativo",
  "error.socket.packNotFound": "Esse pack foi apagado, talvez noutro separador",
  "error.socket.clipNotFound": "Esse clip foi apagado, talvez noutro separador",
  "error.socket.clipNotInPack": "Esse clip já não está no pack ativo",
  "error.socket.patchEmpty":
    "O comando enviou uma alteração vazia. Recarrega o comando",
  "error.socket.transitionModeInvalid": "Escolhe uma transição da lista",
  "error.socket.fadeOutOfRange": "As transições vão de 0 a 4 segundos",
  "error.socket.overlayTextInvalid":
    "O texto no ecrã cabe numa linha, sem quebras de linha nem caracteres escondidos",
  "error.socket.overlayTextTooLong":
    "O texto no ecrã tem no máximo {max} caracteres",
  "error.socket.overlayTextBlank":
    "Escreve algum texto antes de o mostrares no ecrã",
  "error.socket.overlayStyleInvalid": "Escolhe um estilo de texto da lista",
  "error.socket.speedInvalid": "Escolhe uma velocidade entre 0,25x e 4x",
  "error.socket.effectFlagInvalid":
    "O comando enviou um efeito que o servidor não conseguiu ler. Recarrega o comando",
  "error.socket.shuffleIntervalInvalid":
    "O aleatório muda a cada 2 a 60 segundos, ou a cada 4, 8, 16 ou 32 batidas",
  "error.socket.bpmOutOfRange": "O ritmo vai de 60 a 200 BPM",
  "error.socket.clientOutdated":
    "Esta página está desatualizada. Recarrega-a para continuares a tocar",
  "error.socket.immediateNotAllowed":
    "Só o apagão, repor o visual e parar o estroboscópio saltam a batida",
  "error.socket.transitionLengthInvalid":
    "Escolhe uma duração de 1, 2, 4, 8 ou 16 batidas",
  "error.socket.overlayPositionInvalid":
    "Escolhe em cima, ao meio ou em baixo para o texto",
  "error.socket.overlaySizeInvalid": "Escolhe um tamanho de texto entre S e XL",
  "error.socket.colorTokenInvalid": "Escolhe uma cor da paleta",
  "error.socket.overlayHideOutOfRange":
    "O esconder automático vai de 1 segundo a 10 minutos",
  "error.socket.effectUnknown": "O projetor não conhece este efeito",
  "error.socket.effectAmountInvalid":
    "A intensidade dos efeitos vai de 0 a 100%",
  "error.socket.effectVariantInvalid": "Este efeito não tem essa opção",
  "error.socket.effectExclusiveConflict":
    "Congelar, Ao contrário e Vaivém tocam um de cada vez",
  "error.socket.effectsTooMany":
    "Podem correr até {max} efeitos ao mesmo tempo. Desliga um primeiro",
  "error.socket.generatorInvalid": "O projetor não conhece este gerador",
  "error.socket.generatorVariantInvalid": "Este gerador não tem essa opção",
  "error.socket.downbeatOutOfRange":
    "O relógio deste dispositivo está demasiado desacertado para marcar a batida. Recarrega a página",
  "error.socket.quantizeInvalid": "Escolhe Desligado, Batida ou Compasso",
  "error.socket.tempoSourceInvalid": "Escolhe Manual, Marcar ou Microfone",
  "error.socket.tempoSourceConflict":
    "O ritmo do microfone define o BPM sozinho",
  "error.socket.micUnavailable": "Liga primeiro o microfone no ecrã principal",
  "error.socket.mixAmountInvalid": "O crossfader vai de 0 a 100%",
  "error.socket.blendModeInvalid": "Escolhe um modo de sobreposição da lista",
  "error.socket.mixEmpty": "Carrega um clip na camada de mistura para trocares",
  "error.socket.shuffleSourceInvalid":
    "O aleatório escolhe do pack ou dos favoritos dele",
  "error.socket.excludedClipsInvalid":
    "Não conseguimos ler a lista de clips deixados de fora",
  "error.socket.clipExcluded":
    "Esse clip ficou de fora do aleatório, por isso o ecrã segue em frente",
  "error.socket.clipNotFavorite":
    "O aleatório passa agora só favoritos, por isso o ecrã segue em frente",
  "error.socket.screenNotAttached": "Esse ecrã está offline",
  "error.socket.overrideInvalid": "Um ecrã segue um clip ou um gerador",
  "error.socket.overridesTooMany":
    "Até {max} ecrãs podem ter um visual próprio",
  "error.socket.sceneNotFound": "Esta cena foi apagada",
  "error.socket.setlistNotFound": "Esta sequência foi apagada",
  "error.socket.setlistNone": "Escolhe primeiro uma sequência",
  "error.socket.setlistEmpty":
    "Esta sequência ainda está vazia. Junta-lhe passos primeiro",
  "error.socket.setlistIndexInvalid": "Esse passo já saiu da sequência",
  "error.socket.setlistStart": "Estás no primeiro passo da sequência",
  "error.socket.setlistEnd":
    "Esse foi o último passo. Liga Repetir para voltar ao início",
  "error.socket.staleSetlist":
    "Outro comando mudou a sequência primeiro. O comando mostra agora onde está",
  "error.socket.setlistFlashUnconfirmed":
    "O próximo passo pisca. Confirma o aviso de luz a piscar para o tocar",
  "error.socket.countdownTargetConflict":
    "Define a contagem decrescente pela hora de fim ou pela duração",
  "error.socket.countdownOutOfRange":
    "As contagens decrescentes vão de 1 segundo a 24 horas",
  "error.socket.countdownTargetMissing":
    "Define primeiro quando acaba a contagem decrescente",
  "error.socket.countdownLabelInvalid":
    "A legenda da contagem decrescente cabe numa linha, sem quebras de linha nem caracteres escondidos",
  "error.socket.countdownLabelTooLong":
    "As legendas da contagem decrescente têm no máximo {max} caracteres",
  "error.socket.logoCornerInvalid": "Escolhe um canto para o logótipo",
  "error.socket.eventCardKindInvalid": "Escolhe Código QR ou Próximo evento",
  "error.socket.eventCardNoEvent":
    "Liga primeiro este pack a um evento na biblioteca",
  "error.socket.serverError":
    "O servidor teve um problema com esse comando. A falha é nossa, tenta de novo",

  "error.socket.stopped": "Esta ligação foi parada na biblioteca de VJ",
  "error.socket.renderModeInvalid":
    "Este comando pediu um renderizador que os ecrãs não têm. Recarrega o comando",
  "error.socket.noScreensConnected": "Não há ecrãs ligados neste momento",
  // ── Failures without a VJ code ──
  "failure.offline":
    "Estás offline, por isso isto não chegou ao QueerPulse. Verifica a ligação e tenta de novo",
  "failure.timeout":
    "O QueerPulse demorou demasiado a responder. Tenta de novo",
  "failure.rateLimited":
    "Fizeste muitas alterações em pouco tempo. Espera um minuto e tenta de novo",
  "failure.server":
    "O nosso servidor teve um problema. A falha é nossa, tenta de novo daqui a pouco",
  "failure.unreachable":
    "Não conseguimos chegar ao QueerPulse. Verifica a ligação ou tenta de novo daqui a pouco",
  "failure.forbidden":
    "O VJ está aberto a admins e à função Operação VJ, e esta conta não tem nenhuma das duas",
  "failure.notFound":
    "Este servidor ainda não tem VJ. Recarrega a página e avisa a nossa equipa se continuar",
  "failure.restricted":
    "Não podes fazer alterações enquanto houver uma restrição de moderação na tua conta",
  "failure.unknown":
    "Isto não seguiu e o servidor não indicou o motivo. Tenta de novo",

  // ── Connection refusals ──
  "connection.refused.notAdmin":
    "O VJ está aberto a admins e à função Operação VJ, e esta conta já não tem nenhuma das duas",
  "connection.refused.screenReplaced":
    "Este ecrã abriu noutro separador, por isso este parou. Usa o separador mais recente ou recarrega este para ficares com o ecrã",
  "connection.refused.sessionRevoked":
    "Saíste desta conta. Inicia sessão de novo para continuares com o VJ",
  "connection.refused.unauthorized":
    "A tua sessão expirou. Inicia sessão de novo para voltares a ligar",
  "connection.refused.platformLocked":
    "O QueerPulse está em pausa para manutenção, por isso o VJ não consegue ligar agora",
  "connection.refused.serverError":
    "A ligação do VJ não arrancou. Recarrega a página e avisa a nossa equipa se continuar",
  "connection.refused.clientOutdated":
    "Esta página está desatualizada. Recarrega-a para continuares a tocar",

  "connection.refused.stopped":
    "Alguém parou esta ligação na biblioteca de VJ. Recarrega a página para voltares a ligar",
  // ── Screen (projector) ──
  "screen.metaTitle": "Ecrã de VJ",
  "screen.setupTitle": "Ecrã de VJ",
  "screen.setupHint":
    "Liga este portátil ao projetor e põe em ecrã inteiro. A partir daí o ecrã mostra só os visuais",
  "screen.packName": "Pack: {pack}",
  "screen.noPack": "Ainda não escolheste um pack. Escolhe um no comando",
  "screen.preloadProgress": "{ready} de {total} clips prontos",
  "screen.preloadDone": "Os {total} clips estão prontos",
  "screen.offlineCached_one":
    "Sem internet. {count} clip guardado neste portátil está pronto a tocar",
  "screen.offlineCached_other":
    "Sem internet. {count} clips guardados neste portátil estão prontos a tocar",
  "screen.preloadFailed_one": "{count} clip não carregou",
  "screen.preloadFailed_other": "{count} clips não carregaram",
  "screen.goFullscreen": "Pôr em ecrã inteiro",
  "screen.fullscreenUnsupported":
    "Este browser não consegue pôr em ecrã inteiro. Abre o ecrã no Chrome ou no Edge",
  "screen.renderer.webgl2": "Motor de efeitos pronto",
  "screen.renderer.dom": "Renderizador de reserva: {reason}",
  "screen.renderer.reason.webgl2Missing":
    "este browser não tem WebGL2, por isso só correm os efeitos mais leves",
  "screen.renderer.reason.softwareRenderer":
    "este portátil desenha os gráficos sem a placa gráfica, por isso só correm os efeitos mais leves",
  "screen.renderer.reason.contextCreationFailed":
    "a placa gráfica recusou arrancar o motor de efeitos",
  "screen.renderer.reason.programFailed":
    "a placa gráfica não conseguiu montar o motor de efeitos",
  "screen.renderer.reason.contextLost":
    "a placa gráfica reiniciou duas vezes durante o espetáculo",
  "screen.renderer.reason.forced":
    "o link do ecrã pede o renderizador de reserva",
  "screen.renderer.restoring":
    "A placa gráfica reiniciou; o renderizador de reserva segura o espetáculo enquanto recupera",
  "screen.renderer.simple": "Renderizador simples, escolhido no comando",
  "screen.health.line_one":
    "{fps} fps, {count} fotograma perdido nos últimos 5 s",
  "screen.health.line_other":
    "{fps} fps, {count} fotogramas perdidos nos últimos 5 s",
  "screen.health.effectLoad":
    "Os efeitos estão pesados para este portátil, por isso o motor baixou a resolução",
  "screen.identifyEyebrow": "Ecrã",
  "screen.mic.starting": "À espera do microfone. Se o browser pedir, permite-o",
  "screen.mic.title": "Ritmo pelo microfone",
  "screen.mic.hint":
    "Só ouve neste portátil. O som fica aqui e nunca é gravado; só o ritmo e um número de nível são usados",
  "screen.mic.start": "Ouvir o ritmo",
  "screen.mic.stop": "Parar de ouvir",
  "screen.mic.searching": "À procura de uma batida regular",
  "screen.mic.listening": "{bpm} BPM, {confidence}% de certeza",
  "screen.mic.level": "Nível do microfone",
  "screen.mic.pickOnRemote":
    "Para o seguir, escolhe Microfone como fonte do ritmo no comando",
  "screen.mic.followerOnly": "Só o microfone do ecrã principal define o tempo",
  "screen.mic.failure.insecure":
    "O microfone precisa de uma ligação segura (https)",
  "screen.mic.failure.notSupported":
    "Este browser não consegue analisar o som do microfone",
  "screen.mic.failure.denied":
    "O browser bloqueou o microfone. Permite-o nas definições do site e tenta outra vez",
  "screen.mic.failure.noDevice":
    "Não encontrei nenhum microfone neste portátil",
  "screen.mic.failure.inUse": "Outra app está a usar o microfone",
  "screen.mic.failure.workletFailed":
    "O analisador de ritmo não arrancou neste browser",
  "screen.mic.failure.interrupted":
    "O microfone parou. Volta a ligá-lo e carrega em Ouvir o ritmo",
  "screen.eventCard.scan": "Lê o código para ver o evento",
  "screen.eventCard.nextEvent": "Próximo evento",
  "screen.eventCard.online": "Online",
  "screen.eventCard.qrLabel": "Código QR para {title}",
  "screen.eventCard.linked": "Cartão do evento: {title}",
  "screen.eventCard.unlinked":
    "Este pack não tem nenhum evento ligado, por isso o cartão do evento fica escondido",
  "screen.eventCard.unavailable.cancelled":
    "O evento ligado foi cancelado, por isso o cartão do evento fica escondido",
  "screen.eventCard.unavailable.not_listed":
    "O evento ligado não é público, por isso o cartão do evento fica escondido",
  // ── Preload failures (shown on the setup card and the remote grid) ──
  "preload.failure.url_expired":
    "O link de download expirou duas vezes. Recarrega o ecrã para tentar outra vez",
  "preload.failure.network":
    "O download foi interrompido. O ecrã tenta outra vez quando a ligação voltar",
  "preload.failure.storage_full":
    "O computador do ecrã ficou sem espaço para clips. Liberta espaço nele e recarrega o ecrã",
  "preload.failure.decode_failed":
    "O browser do ecrã não consegue reproduzir este ficheiro. Envia-o outra vez para a biblioteca de VJ em MP4 (H.264)",
  "preload.failure.not_found":
    "Este clip já não está no pack. Recarrega o ecrã para carregar o pack como está agora",
  // ── Remote ──
  "remote.metaTitle": "Comando de VJ",
  "remote.backToLibrary": "Voltar à biblioteca de VJ",
  "remote.nothingLive": "O ecrã está a preto",
  "remote.clearScreen": "Limpar o ecrã",
  "remote.screens.none": "Nenhum ecrã aberto",
  "remote.screens.live_one": "{count} ecrã ligado",
  "remote.screens.live_other": "{count} ecrãs ligados",
  "remote.screens.partial": "{live} de {total} ecrãs ligados",
  "remote.screens.offline_one": "Ecrã desligado",
  "remote.screens.offline_other": "Ecrãs desligados",
  "remote.screens.unknown": "Ecrãs por confirmar até o comando voltar a ligar",
  "remote.packEmpty":
    "Este pack ainda não tem clips. Junta alguns na biblioteca de VJ",
  "remote.noPacks": "Ainda não há packs. Cria um na biblioteca de VJ",
  "remote.pickPackHint": "Escolhe um pack acima para veres os clips",
  "remote.clipLive": "No ar",
  "remote.clipAria": "Mostrar {title} no ecrã",
  "remote.clipLoading": "A carregar no ecrã, {percent}%",
  "remote.clipQueued": "À espera de carregar no ecrã",
  "remote.clipFailed": "Não carregou no ecrã",
  "remote.failures.summary_one": "{count} clip não carregou no ecrã",
  "remote.failures.summary_other": "{count} clips não carregaram no ecrã",
  "remote.failures.seeWhy": "Ver porquê",
  "remote.failures.title": "Clips que não carregaram",
  "remote.failures.intro":
    "Cada clip diz o que o travou no ecrã e como resolver",
  "remote.failures.unknownReason":
    "O ecrã não disse porquê. Recarrega o ecrã para tentar outra vez",
  "remote.failures.empty": "Todos os clips deste pack já carregam no ecrã",
  "remote.failures.close": "Fechar a lista",
  "remote.fadeSeconds": "{seconds} s",
  "remote.blackout": "Blackout",
  "remote.offline.network":
    "Não conseguimos chegar ao servidor. Verifica a tua ligação",
  "remote.offline.reconnecting": "A voltar a ligar ao servidor",
  // ── Effects sheet ──
  "effects.speed": "Velocidade",
  "effects.speedValue": "{speed}x",
  "effects.gifSpeedNote":
    "O clip no ar é um GIF, por isso toca à sua própria velocidade",
  "effects.strobe": "Estroboscópio",
  "effects.strobeWarning":
    "Luz a piscar pode provocar convulsões em pessoas com epilepsia fotossensível. Vê bem o espaço antes de o ligares",
  "effects.strobeRemaining": "Faltam {seconds} s",
  "effects.close": "Fechar efeitos",
  // ── Text sheet ──
  "text.title": "Texto no ecrã",
  "text.label": "Texto",
  "text.charactersLeft": "Faltam {count} caracteres",
  "text.style": "Estilo",
  "text.show": "Mostrar texto",
  "text.update": "Atualizar texto",
  "text.hide": "Esconder texto",
  "text.recent": "Frases recentes",
  "text.recentAria": "Mostrar {text} no ecrã",
  "text.clearRecent": "Apagar frases recentes",
  "text.close": "Fechar texto",
  // ── Shuffle sheet ──
  "shuffle.title": "Aleatório",
  "shuffle.start": "Ligar aleatório",
  "shuffle.stop": "Desligar aleatório",
  "shuffle.isOn": "O aleatório está ligado",
  "shuffle.every": "Mudar de clip a cada",
  "shuffle.seconds": "Segundos",
  "shuffle.beats": "Batidas",
  "shuffle.secondsValue": "{count} segundos",
  "shuffle.beatsValue": "{count} batidas",
  "shuffle.beatsInSeconds": "{beats} batidas a {bpm} BPM são {seconds} s",
  "shuffle.bpmLabel": "BPM",
  "shuffle.bpmOutOfRange": "Escolhe um ritmo entre 60 e 200 BPM",
  "shuffle.close": "Fechar aleatório",
  "shuffle.source": "Tocar de",
  "shuffle.sourcePack": "Este pack",
  "shuffle.sourceFavorites": "Favoritos deste pack",
  "shuffle.noFavorites":
    "Ainda não há favoritos neste pack. Marca alguns clips com a estrela primeiro",
  "shuffle.exclude": "Deixar de fora",
  "shuffle.excludeAria": "Deixar {title} fora do aleatório",
  "shuffle.excludedCount_one": "{count} clip deixado de fora",
  "shuffle.excludedCount_other": "{count} clips deixados de fora",
  "shuffle.tempoFromDock": "As batidas seguem o ritmo do dock, agora {bpm} BPM",
  // ── Remote top bar ──
  "top.packsAria": "Packs",
  "top.packReady": "{ready} de {total} prontos",
  "top.packNotLoaded": "Não carregado nos ecrãs",
  "top.favoritesOnly": "Mostrar só favoritos",
  "top.generators": "Geradores",
  "top.search": "Procurar clips",
  "top.closeSearch": "Fechar pesquisa",
  "top.screensAria": "Abrir ecrãs, {summary}",
  "top.switchTitle": "Mudar para {pack}?",
  "top.switchPartial":
    "Os ecrãs têm {ready} de {total} clips deste pack prontos. Os outros aparecem quando acabarem de carregar",
  "top.switchNotLoaded":
    "Os ecrãs ainda não carregaram este pack. Os clips aparecem quando acabarem de carregar",
  "top.switchConfirm": "Mudar de pack",
  "top.switchCancel": "Ficar com {pack}",

  // ── Remote preview mirror ──
  "mirror.expand": "Aumentar a pré-visualização",
  "mirror.collapse": "Diminuir a pré-visualização",
  "mirror.live": "No ar",
  "mirror.next": "A seguir",
  "mirror.nextNone": "Nada preparado",
  "mirror.onNextBeat": "Na próxima batida",
  "mirror.onNextBar": "No próximo compasso",
  "mirror.effectsOn_one": "{count} efeito ligado",
  "mirror.effectsOn_other": "{count} efeitos ligados",
  "mirror.ringShuffle": "Próxima troca aleatória daqui a {seconds} s",
  "mirror.ringApply": "Muda daqui a {seconds} s",
  "mirror.ringSetlist": "Próximo passo daqui a {seconds} s",
  "mirror.ringSetlistPaused": "Em pausa, faltam {seconds} s",
  "mirror.sequencePaused": "Sequência em pausa",
  "mirror.sequenceTakenOver": "Em pausa, toca para ver",
  "mirror.sequenceWaitingFlash": "À espera: {step} pisca",
  "mirror.sequenceFinished": "Sequência terminada",
  "mirror.skip": "Saltar para o próximo clip",
  "mirror.nextShuffle": "Aleatório: {title}",
  "mirror.nextSetlist": "Passo {position} de {total}: {name}",
  "mirror.nextSetlistLast": "Último passo",
  "mirror.nextCue": "Preparado: {title}",
  "mirror.generatorLive": "Gerador: {name}",
  "mirror.projectorOnly_one": "{count} efeito só aparece no projetor",
  "mirror.projectorOnly_other": "{count} efeitos só aparecem no projetor",

  // ── Remote scenes and recent strip ──
  "strip.scenes": "Cenas",
  "strip.recent": "Recentes",
  "strip.saveScene": "Guardar cena",
  "strip.recallAria": "Recuperar a cena {name}",
  "strip.noScenes": "Ainda não há cenas. Guarda o visual atual",
  "strip.previous": "Anterior",
  "strip.previousAria": "Voltar a {title}",
  "strip.recentAria": "Mostrar {title} outra vez",
  "strip.noRecent": "Os clips que tocas aparecem aqui",
  "strip.setlistNext": "Próximo passo",
  "strip.setlistPrevious": "Passo anterior",
  "strip.setlistPosition": "{position} de {total}",
  "strip.setlistPlay": "Tocar sequência",
  "strip.setlistPause": "Pausar sequência",
  "strip.setlistResume": "Retomar sequência",
  "strip.switchAria": "Mostrar cenas ou clips recentes",
  "strip.openScenes": "Abrir cenas e sequências",

  // ── Remote clip grid ──
  "grid.label": "Clips",
  "grid.favorite": "Adicionar {title} aos favoritos",
  "grid.unfavorite": "Tirar {title} dos favoritos",
  "grid.cueAria": "Preparar {title}",
  "grid.cued": "Preparado",
  "grid.failureAria": "Ver porque é que {title} não carregou",
  "grid.pendingBeat": "Próxima batida",
  "grid.pendingBar": "Próximo compasso",
  "grid.searchLabel": "Procurar neste pack",
  "grid.searchEmpty": 'Nenhum clip deste pack corresponde a "{query}"',
  "grid.favoritesEmpty":
    "Ainda não há favoritos neste pack. Toca na estrela de um clip",
  "grid.previewAria": "Pré-visualização de {title}",
  "grid.previewMissing":
    "Ainda sem pré-visualização animada. Cria-as na biblioteca de VJ",
  "grid.generatorAria": "Mostrar o gerador {name} no ecrã",

  // ── Generators ──
  "generator.name.gradientField": "Campo de gradiente",
  "generator.name.plasma": "Plasma",
  "generator.name.starfield": "Campo de estrelas",
  "generator.name.prideFlagWave": "Bandeira do orgulho a ondular",
  "generator.name.tunnel": "Túnel",

  // ── Tempo ──
  "tempo.label": "Ritmo",
  "tempo.bpmValue": "{bpm} BPM",
  "tempo.bpmEdit": "Mudar o ritmo, agora {bpm} BPM",
  "tempo.tap": "Marcar",
  "tempo.tapAria": "Marcar o ritmo",
  "tempo.downbeat": "1",
  "tempo.downbeatAria": "Marcar agora o primeiro tempo do compasso",
  "tempo.downbeatCaption": "1.º tempo",
  "tempo.quantize": "Quantizar",
  "tempo.quantizeOff": "Desligado",
  "tempo.quantizeBeat": "Batida",
  "tempo.quantizeBar": "Compasso",
  "tempo.quantizeAria": "Quantizar: {mode}. Toca para mudar",
  "tempo.sourceMic": "Do microfone do ecrã",
  "tempo.syncing": "A sincronizar o relógio com os ecrãs",
  "tempo.decrease": "Mais lento 1 BPM",
  "tempo.increase": "Mais rápido 1 BPM",
  "tempo.half": "Metade do ritmo",
  "tempo.double": "Dobro do ritmo",
  "tempo.setBpm": "Definir ritmo",
  "tempo.followMic": "Seguir o microfone do ecrã principal",

  // ── Transitions ──
  "transition.title": "Transição",
  "transition.modeCaption": "Modo",
  "transition.unitAria": "Contar a duração em",
  "transition.mode.fade": "Fade",
  "transition.mode.cut": "Corte",
  "transition.mode.dipBlack": "Passar por preto",
  "transition.mode.dipWhite": "Passar por branco",
  "transition.mode.wipeLeft": "Varrer para a esquerda",
  "transition.mode.wipeRight": "Varrer para a direita",
  "transition.mode.wipeRadial": "Varrimento circular",
  "transition.mode.iris": "Íris",
  "transition.mode.zoomBlur": "Zoom desfocado",
  "transition.mode.glitch": "Glitch",
  "transition.mode.lumaFade": "Fade por luz",
  "transition.pickAria": "Transição: {mode}. Mudar",
  "transition.lengthBeats_one": "{count} batida",
  "transition.lengthBeats_other": "{count} batidas",
  "transition.unitBeats": "Batidas",
  "transition.unitSeconds": "Segundos",
  "transition.lengthAria": "Duração da transição, {value}",
  "transition.flashNote":
    "Pisca a branco. Conta para o limite de 3 flashes por segundo",
  "transition.speedAria": "Velocidade do clip, {speed}x. Mudar",

  // ── Effect pads ──
  "pads.label": "Pads de efeitos",
  "pads.allEffects": "Todos os efeitos",
  "pads.padAria":
    "{effect}. Toca para o manter ligado, mantém premido para o usar enquanto carregas",
  "pads.tuneTitle": "Definições de {effect}",
  "pads.amount": "Intensidade",
  "pads.amountValue": "{percent}%",
  "pads.variant": "Variante",
  "pads.turnOff": "Desligar {effect}",
  "pads.turnOn": "Ligar {effect}",
  "pads.flashMarker": "Pisca",
  "pads.beatMarker": "Segue a batida",
  "pads.closeTune": "Fechar definições de {effect}",
  "pads.playheadNote": "Congelar, Ao contrário e Vaivém tocam um de cada vez",
  // Short pad faces (the full effect name stays the accessible name)
  "pads.allEffectsShort": "Efeitos",
  "effects.padLabel.strobe": "Estrobo",
  "effects.padLabel.monochrome": "Preto e branco",
  "effects.padLabel.invert": "Inverter",
  "effects.padLabel.saturate": "Saturar",
  "effects.padLabel.contrast": "Con\u00ADtraste",
  "effects.padLabel.tint": "Tingir",
  "effects.padLabel.duotone": "Duas cores",
  "effects.padLabel.prideGrade": "Cores do orgulho",
  "effects.padLabel.thermal": "Térmico",
  "effects.padLabel.hueCycle": "Ciclo de cor",
  "effects.padLabel.hueShift": "Mudar tom",
  "effects.padLabel.vhs": "VHS",
  "effects.padLabel.filmGrain": "Grão de filme",
  "effects.padLabel.scanlines": "Linhas",
  "effects.padLabel.crt": "CRT",
  "effects.padLabel.rgbSplit": "Separar RGB",
  "effects.padLabel.pixelate": "Pixelizar",
  "effects.padLabel.halftone": "Meio-tom",
  "effects.padLabel.glitch": "Glitch",
  "effects.padLabel.dream": "Sonho",
  "effects.padLabel.vignette": "Vinheta",
  "effects.padLabel.lightLeaks": "Fugas de luz",
  "effects.padLabel.mirror": "Espelho",
  "effects.padLabel.kaleidoscope": "Caleido",
  "effects.padLabel.tile": "Mosaico",
  "effects.padLabel.kenBurns": "Ken Burns",
  "effects.padLabel.rotate": "Rodar",
  "effects.padLabel.zoomPulse": "Zoom na batida",
  "effects.padLabel.mask": "Máscara",
  "effects.padLabel.freeze": "Congelar",
  "effects.padLabel.reverse": "Para trás",
  "effects.padLabel.pingPong": "Vaivém",
  "effects.padLabel.stutter": "Tremido",
  "effects.padLabel.echo": "Rastos",
  "effects.padLabel.beatPulse": "Pulso na batida",
  "flash.warningTitle": "Luz a piscar",
  "flash.confirm": "Ligar {effect} agora",
  "flash.sequenceConfirm": "Tocar {name} com os passos que piscam",
  "flash.sequenceCancel": "Não tocar {name}",
  "flash.cancel": "Manter desligado",

  // ── Live dock ──
  "dock.label": "Controlos ao vivo",
  "dock.resetLook": "Repor visual",
  "dock.resetDone": "Visual reposto. Efeitos, texto e mistura desligados",
  "dock.cue": "Preparar",
  "dock.cueAria": "Ligar o modo de preparação",
  "dock.go": "Lançar",
  "dock.goEmpty": "Toca num clip para o preparar",
  "dock.more": "Mais",
  "dock.moreAria": "Mais controlos",
  "dock.sectionMix": "Mistura",
  "dock.sectionEffects": "Efeitos",

  // ── Mix sheet ──
  "mix.title": "Mistura",
  "mix.crossfader": "Crossfader",
  "mix.crossfaderValue": "{percent}% do clip de mistura",
  "mix.liveSide": "No ar",
  "mix.mixSide": "Mistura",
  "mix.pickClip": "Clip de mistura",
  "mix.pickClipAria": "Usar {title} como clip de mistura",
  "mix.noClip": "Escolhe um clip para misturar",
  "mix.pickEmpty":
    "O clip no ar é o único deste pack. Adiciona outro na biblioteca de VJ",
  "mix.blend": "Modo de sobreposição",
  "mix.blend.normal": "Normal",
  "mix.blend.screen": "Ecrã",
  "mix.blend.multiply": "Multiplicar",
  "mix.blend.difference": "Diferença",
  "mix.blend.add": "Somar",
  "mix.blend.lighten": "Clarear",
  "mix.swap": "Trocar mistura e no ar",
  "mix.clear": "Limpar a mistura",
  "mix.close": "Fechar mistura",

  // ── Scenes sheet ──
  "scenes.title": "Cenas e sequências",
  "scenes.defaultName": "Cena {number}",
  "scenes.noneForPack":
    "Ainda não há cenas para este pack. Guarda o visual atual",
  "scenes.recall": "Recuperar cena",
  "scenes.rename": "Mudar o nome da cena",
  "scenes.nameLabel": "Nome da cena",
  "scenes.saveName": "Guardar nome",
  "scenes.nameRequired": "Dá um nome à cena",
  "scenes.delete": "Apagar cena",
  "scenes.deleteTitle": "Apagar {name}?",
  "scenes.thisPack": "Este pack",
  "scenes.anyPack": "Qualquer pack",
  "scenes.setlists": "Sequências",
  "scenes.startSetlist": "Passo a passo",
  "scenes.stopSetlist": "Parar sequência",
  "scenes.makeSetlist": "Criar uma sequência com estas cenas",
  "scenes.setlistDefaultName": "Sequência {number}",
  "scenes.setlistEmpty": "Ainda não há sequências",
  "scenes.setlistCount_one": "{count} passo",
  "scenes.setlistCount_other": "{count} passos",
  "scenes.playSetlist": "Tocar sequência",
  "scenes.setlistEmptyReason": "Junta passos para tocar esta sequência",
  "scenes.pauseSetlist": "Pausar sequência",
  "scenes.resumeSetlist": "Retomar sequência",
  "scenes.playAgain": "Tocar outra vez",
  "scenes.loop": "Repetir",
  "scenes.stepPosition": "Passo {position} de {total}",
  "scenes.stepArmed": "Pronta no passo 1",
  "scenes.takenOverPick": "Em pausa, escolheste um clip",
  "scenes.takenOverShuffle": "Em pausa, ligaste o aleatório",
  "scenes.takenOverPickNext":
    "Em pausa, escolheste um clip. Retomar toca o passo {position}: {step}",
  "scenes.takenOverShuffleNext":
    "Em pausa, ligaste o aleatório. Retomar toca o passo {position}: {step}",
  "scenes.finished": "Sequência terminada",
  "scenes.pausedLine": "Em pausa, faltam {seconds} s neste passo",
  "scenes.flashWaiting": "Em pausa antes de {step}, que pisca",
  "scenes.playFlashing": "Tocar o passo que pisca",
  "scenes.skipFlashing": "Saltar o passo que pisca",
  "scenes.editSteps": "Editar passos",
  "scenes.stepsTitle": "Passos de {name}",
  "scenes.closeSteps": "Fechar passos",
  "scenes.addLiveClip": "Juntar o clip no ar",
  "scenes.addLiveLook": "Juntar o visual no ar",
  "scenes.addLiveClipNone": "Põe primeiro um clip no ar para o juntar",
  "scenes.liveLookStepName": "{name} passo {number}",
  "scenes.liveLookSavedNotAdded":
    "{name} ficou guardada como cena e não entrou na sequência",
  "scenes.close": "Fechar cenas e sequências",

  // ── Screens sheet ──
  "screensSheet.title": "Ecrãs",
  "screensSheet.number": "Ecrã {number}",
  "screensSheet.lead": "Comanda o aleatório",
  "screensSheet.connected": "Ligado",
  "screensSheet.disconnected": "Desligado desde as {time}",
  "screensSheet.fullscreen": "Ecrã inteiro",
  "screensSheet.windowed": "Numa janela",
  "screensSheet.rendererWebgl": "Motor de efeitos",
  "screensSheet.rendererDom":
    "Renderizador de reserva, alguns efeitos estão desligados",
  "screensSheet.rendererSimple": "Renderizador simples, só fades",
  "screensSheet.fps": "{fps} fotogramas por segundo",
  "screensSheet.dropped_one": "{count} fotograma perdido",
  "screensSheet.dropped_other": "{count} fotogramas perdidos",
  "screensSheet.cache": "{size} em cache",
  "screensSheet.loadWarning":
    "Este ecrã está com dificuldade com os efeitos. Desliga alguns",
  "screensSheet.healthUnknown": "Este ecrã ainda não enviou o estado",
  "screensSheet.micOn": "Microfone ligado, nível {percent}%",
  "screensSheet.identifyAll": "Mostrar o número de todos os ecrãs",
  "screensSheet.identify": "Mostrar o número no ecrã {number}",
  "screensSheet.renderMode.label": "Renderizador simples em todos os ecrãs",
  "screensSheet.renderMode.hint":
    "Só faz fades entre clips. Efeitos, geradores e estroboscópio ficam desligados",
  "screensSheet.renderMode.pendingSimple":
    "A passar todos os ecrãs para o renderizador simples",
  "screensSheet.renderMode.pendingEffects":
    "A passar todos os ecrãs de volta para o motor de efeitos",
  "screensSheet.switchToSimple": "Mudar para o renderizador simples",
  "screensSheet.override": "O que este ecrã mostra",
  "screensSheet.followMain": "Seguir o visual principal",
  "screensSheet.overrideClip": "Clip: {title}",
  "screensSheet.overrideGenerator": "Gerador: {name}",
  "screensSheet.empty":
    "Nenhum ecrã aberto. Abre o ecrã no portátil do projetor",
  "screensSheet.close": "Fechar ecrãs",

  // ── Event card sheet ──
  "eventCard.title": "Cartão do evento",
  "eventCard.linked": "Evento ligado",
  "eventCard.noPack": "Escolhe um pack para veres o evento",
  "eventCard.none":
    "Este pack não tem evento ligado. Liga um na biblioteca de VJ",
  "eventCard.unavailable.cancelled":
    "O evento ligado foi cancelado. Liga outro na biblioteca de VJ",
  "eventCard.unavailable.notListed":
    "O evento ligado já não está listado. Liga outro na biblioteca de VJ",
  "eventCard.openLibrary": "Abrir a biblioteca de VJ",
  "eventCard.showQr": "Mostrar o código QR do evento",
  "eventCard.showNext": "Mostrar o cartão do próximo evento",
  "eventCard.hide": "Esconder cartão do evento",
  "eventCard.close": "Fechar cartão do evento",
  "eventCard.qrHint":
    "O código QR abre a página do evento, que é só para membros. Quem o lê entra na conta primeiro",
  "eventCard.noQrLink":
    "Este servidor não tem o endereço da app definido, por isso o cartão aparece sem código QR",
  "eventCard.status.qr": "No ecrã: o código QR do evento",
  "eventCard.status.nextEvent": "No ecrã: o cartão do próximo evento",
  "eventCard.status.hidden": "O cartão do evento está escondido",

  // ── MIDI sheet ──
  "midi.title": "Controlador MIDI",
  "midi.unavailableNoWebMidi":
    "Este browser não tem Web MIDI, por isso não consegue ler um controlador. Os browsers do iPhone e do iPad não o oferecem. Usa o Chrome ou o Edge num portátil",
  "midi.turnOn": "Ligar MIDI",
  "midi.requesting": "À espera que o browser autorize o MIDI",
  "midi.denied":
    "O browser bloqueou o MIDI neste site. Autoriza nas definições do site e tenta outra vez",
  "midi.failed":
    "O browser não conseguiu abrir o MIDI. Volta a ligar o controlador e tenta outra vez",
  "midi.noDevices": "Nenhum controlador encontrado. Liga um",
  "midi.devices": "Controladores",
  "midi.map": "Mapear um controlo",
  "midi.learnPick": "Toca num clip, pad ou controlo para mapear",
  "midi.learnMove": "Agora carrega numa tecla ou roda um botão no controlador",
  "midi.learnCcOnly":
    "Este controlo precisa de um botão rotativo ou de um fader",
  "midi.learnDone": "Mapeado para {target}",
  "midi.learnCancel": "Cancelar mapeamento",
  "midi.mappings": "Mapeamentos",
  "midi.mappingsEmpty": "Ainda sem mapeamentos",
  "midi.removeMapping": "Remover o mapeamento de {target}",
  "midi.removeAll": "Remover todos os mapeamentos",
  "midi.removeAllTitle": "Remover todos os mapeamentos deste dispositivo?",
  "midi.savedOnDevice": "Os mapeamentos ficam guardados neste dispositivo",
  "midi.target.clipSlot": "Clip {number}",
  "midi.target.pad": "Pad: {effect}",
  "midi.target.crossfader": "Crossfader",
  "midi.target.transitionLength": "Duração da transição",
  "midi.target.tapTempo": "Marcar o ritmo",
  "midi.target.go": "Lançar",
  "midi.target.blackout": "Blackout",
  "midi.control.note": "Nota {note}, canal {channel}",
  "midi.control.cc": "Botão {controller}, canal {channel}",
  "midi.close": "Fechar MIDI",

  // ── Keyboard shortcuts ──
  "keys.title": "Atalhos de teclado",
  "keys.clips1to9": "Mostrar os clips 1 a 9",
  "keys.clips10to18": "Mostrar os clips 10 a 18",
  "keys.go": "Lançar em modo de preparação",
  "keys.blackout": "Blackout",
  "keys.resetLook": "Repor visual",
  "keys.tapTempo": "Marcar o ritmo",
  "keys.quantize": "Mudar a quantização",
  "keys.arrows": "Andar entre clips",
  "keys.holdPad": "Usar um pad do dock enquanto carregas nas teclas",
  "keys.openShortcuts": "Mostrar esta lista",
  "keys.shift": "Shift",
  "keys.space": "Espaço",
  "keys.arrowKeys": "Setas",
  "keys.close": "Fechar atalhos",

  // ── More controls sheet ──
  "more.title": "Mais controlos",
  "more.cueOn": "Ligar o modo de preparação",
  "more.cueOff": "Desligar o modo de preparação",
  "more.close": "Fechar mais controlos",

  // ── Text sheet, v2 styling ──
  "overlay.position": "Posição",
  "overlay.position.top": "Em cima",
  "overlay.position.center": "Ao meio",
  "overlay.position.bottom": "Em baixo",
  "overlay.size": "Tamanho",
  "overlay.size.s": "Pequeno",
  "overlay.size.m": "Médio",
  "overlay.size.l": "Grande",
  "overlay.size.xl": "Muito grande",
  "overlay.style.big": "Grande",
  "overlay.style.ticker": "Rodapé",
  "overlay.style.neon": "Néon",
  "overlay.style.outline": "Contorno",
  "overlay.style.typewriter": "Máquina de escrever",
  "overlay.style.glitch": "Glitch",
  "overlay.style.stacked": "Empilhado",
  "overlay.style.slanted": "Inclinado",
  "overlay.color": "Cor",
  "color.cream": "Creme",
  "color.coral": "Coral",
  "color.jade": "Jade",
  "color.amber": "Âmbar",
  "color.violet": "Violeta",
  "color.sky": "Céu",
  "color.rose": "Rosa",
  "color.plum": "Ameixa",
  "overlay.autoHide": "Esconder ao fim de",
  "overlay.autoHideNever": "Manter visível",
  "overlay.autoHideSeconds": "{count} s",
  "overlay.autoHideMinutes_one": "{count} min",
  "overlay.autoHideMinutes_other": "{count} min",
  "overlay.hidesIn": "Esconde-se daqui a {seconds} s",

  // ── Countdown sheet ──
  "countdown.title": "Contagem decrescente",
  "countdown.label": "Legenda",
  "countdown.labelPlaceholder": "As portas fecham daqui a",
  "countdown.minutes_one": "{count} minuto",
  "countdown.minutes_other": "{count} minutos",
  "countdown.timeLabel": "Hora de fim",
  "countdown.pastTime": "Escolhe uma hora mais logo",
  "countdown.show": "Mostrar contagem",
  "countdown.update": "Atualizar contagem",
  "countdown.hide": "Esconder contagem",

  // ── Logo sheet ──
  "logo.title": "Logótipo",
  "logo.corner": "Canto",
  "logo.corner.topLeft": "Em cima à esquerda",
  "logo.corner.topRight": "Em cima à direita",
  "logo.corner.bottomLeft": "Em baixo à esquerda",
  "logo.corner.bottomRight": "Em baixo à direita",
  "logo.show": "Mostrar logótipo",
  "logo.hide": "Esconder logótipo",

  // ── Effects library ──
  "effect.libraryTitle": "Todos os efeitos",
  "effect.group.color": "Cor",
  "effect.group.texture": "Textura",
  "effect.group.geometry": "Geometria",
  "effect.group.time": "Tempo",
  "effect.group.beat": "Batida",
  "effect.addToDock": "Juntar {effect} ao dock",
  "effect.removeFromDock": "Tirar {effect} do dock",
  "effect.moveLeft": "Mover {effect} para a esquerda",
  "effect.moveRight": "Mover {effect} para a direita",
  "effect.dockFull": "O dock leva {count} pads. Tira um primeiro",
  "effect.onCount": "{count} de {max} efeitos ligados",
  "effect.name.monochrome": "Preto e branco",
  "effect.name.invert": "Inverter",
  "effect.name.saturate": "Saturar",
  "effect.name.contrast": "Contraste",
  "effect.name.tint": "Tingir",
  "effect.name.duotone": "Duas cores",
  "effect.name.prideGrade": "Cores do orgulho",
  "effect.name.thermal": "Térmico",
  "effect.name.hueCycle": "Ciclo de cor",
  "effect.name.hueShift": "Mudar tom",
  "effect.name.vhs": "VHS",
  "effect.name.filmGrain": "Grão de filme",
  "effect.name.scanlines": "Linhas de varrimento",
  "effect.name.crt": "CRT",
  "effect.name.rgbSplit": "Separar RGB",
  "effect.name.pixelate": "Pixelizar",
  "effect.name.halftone": "Meio-tom",
  "effect.name.glitch": "Glitch",
  "effect.name.dream": "Sonho",
  "effect.name.vignette": "Vinheta",
  "effect.name.lightLeaks": "Fugas de luz",
  "effect.name.mirror": "Espelho",
  "effect.name.kaleidoscope": "Caleidoscópio",
  "effect.name.tile": "Mosaico",
  "effect.name.kenBurns": "Ken Burns",
  "effect.name.rotate": "Rodar",
  "effect.name.zoomPulse": "Zoom na batida",
  "effect.name.mask": "Máscara",
  "effect.name.freeze": "Congelar",
  "effect.name.reverse": "Ao contrário",
  "effect.name.pingPong": "Vaivém",
  "effect.name.stutter": "Tremido",
  "effect.name.echo": "Rastos",
  "effect.name.beatPulse": "Pulso na batida",
  "effect.variant.horizontal": "Horizontal",
  "effect.variant.vertical": "Vertical",
  "effect.variant.quad": "Quatro lados",
  "effect.variant.steady": "Contínuo",
  "effect.variant.beat": "Na batida",
  "effect.variant.grid": "{count} por {count}",
  "effect.variant.duotonePair": "{shadow} e {highlight}",
  "effect.variant.segments": "{count} segmentos",
  "effect.variant.circle": "Círculo",
  "effect.variant.heart": "Coração",
  "effect.variant.star": "Estrela",
  "effect.variant.rainbow": "Arco-íris",
  "effect.variant.trans": "Trans",
  "effect.variant.bi": "Bi",
  "effect.variant.lesbian": "Lésbica",
  "effect.variant.nonbinary": "Não binário",
  "effect.variant.progress": "Progresso",

  // ── Descriptions and the effects on strip ──
  "effect.desc.monochrome": "Passa a imagem a preto e branco",
  "effect.desc.invert": "Troca cada cor pela oposta, ou pisca assim na batida",
  "effect.desc.saturate": "Deixa as cores mais fortes e vivas",
  "effect.desc.contrast": "Escurece os escuros e clareia os claros",
  "effect.desc.tint": "Banha a imagem numa cor da paleta",
  "effect.desc.duotone":
    "Redesenha a imagem em duas cores, uma escura e uma clara",
  "effect.desc.prideGrade":
    "Pinta as luzes e as sombras com as riscas de uma bandeira do orgulho",
  "effect.desc.thermal":
    "Cores de câmara térmica, do preto ao vermelho e ao branco",
  "effect.desc.hueCycle":
    "Roda as cores pelo círculo cromático ao ritmo da batida",
  "effect.desc.hueShift": "Muda todas as cores para outro tom e mantém-nas aí",
  "effect.desc.vhs":
    "Linhas tremidas, cor esborratada e uma faixa a rolar, como cassete antiga",
  "effect.desc.filmGrain": "Junta grão a tremeluzir, como em filme antigo",
  "effect.desc.scanlines":
    "Desenha linhas escuras finas na imagem, como numa televisão antiga",
  "effect.desc.crt":
    "Curva a imagem como numa televisão de tubo, com máscara de píxeis",
  "effect.desc.rgbSplit":
    "Afasta o vermelho do azul, ou fá-los pulsar com a batida",
  "effect.desc.pixelate": "Parte a imagem em grandes blocos quadrados",
  "effect.desc.halftone": "Redesenha a imagem com pontos de impressão",
  "effect.desc.glitch":
    "Desloca linhas aos solavancos na batida, com flashes breves",
  "effect.desc.dream": "Suaviza a imagem e faz brilhar as partes claras",
  "effect.desc.vignette": "Escurece as margens e os cantos",
  "effect.desc.lightLeaks":
    "Faz passar brilhos quentes âmbar e rosa pela imagem",
  "effect.desc.mirror": "Reflete uma metade na outra, ou para os quatro lados",
  "effect.desc.kaleidoscope":
    "Dobra a imagem em fatias espelhadas que rodam com a batida",
  "effect.desc.tile": "Repete a imagem numa grelha de 2 por 2 ou 3 por 3",
  "effect.desc.kenBurns":
    "Aproxima e desliza devagar pela imagem, depois volta a afastar",
  "effect.desc.rotate": "Faz a imagem girar ao ritmo da batida",
  "effect.desc.zoomPulse":
    "Dá um zoom em cada batida, ou segue o nível do microfone",
  "effect.desc.mask":
    "Mostra a imagem dentro de um círculo, coração ou estrela, sobre preto",
  "effect.desc.freeze": "Mantém a imagem parada no fotograma atual",
  "effect.desc.reverse": "Passa o clip ao contrário",
  "effect.desc.pingPong":
    "Passa o clip para a frente, depois para trás, e repete",
  "effect.desc.stutter": "Repete pedaços curtos do clip ao ritmo da batida",
  "effect.desc.echo": "Deixa rastos luminosos atrás de tudo o que mexe",
  "effect.desc.beatPulse": "Faz a imagem piscar mais clara em cada batida",
  "effect.desc.strobe":
    "Pisca os ecrãs a branco na batida e para ao fim de 10 s",
  "transition.modeDesc.fade": "Funde suavemente um clip no seguinte",
  "transition.modeDesc.cut": "Muda logo, sem mistura",
  "transition.modeDesc.dipBlack":
    "Escurece até ao preto e depois abre no clip seguinte",
  "transition.modeDesc.dipWhite":
    "Pisca até ao branco e depois funde no clip seguinte",
  "transition.modeDesc.wipeLeft":
    "Uma linha varre da direita para a esquerda e revela o clip seguinte",
  "transition.modeDesc.wipeRight":
    "Uma linha varre da esquerda para a direita e revela o clip seguinte",
  "transition.modeDesc.wipeRadial":
    "Varre em círculo como um ponteiro, a partir das 12 horas",
  "transition.modeDesc.iris":
    "O clip seguinte abre num círculo que cresce a partir do centro",
  "transition.modeDesc.zoomBlur":
    "Passa de um clip para o seguinte com zoom e desfocagem",
  "transition.modeDesc.glitch":
    "Parte-se em blocos que se mexem, com um flash a meio",
  "transition.modeDesc.lumaFade":
    "O clip seguinte aparece primeiro nas partes mais escuras",
  "mix.blendDesc.normal":
    "Passa diretamente do clip no ar para o clip de mistura",
  "mix.blendDesc.screen": "Clareia, e as partes claras dos dois clips passam",
  "mix.blendDesc.multiply": "Escurece, e ficam as sombras dos dois clips",
  "mix.blendDesc.difference":
    "Subtrai um clip ao outro e dá cores invertidas e vivas",
  "mix.blendDesc.add":
    "Soma a luz dos dois clips, e as partes claras ficam brancas",
  "mix.blendDesc.lighten": "Fica com o mais claro dos dois clips em cada ponto",
  "tempo.quantizeDesc.off": "Os clips e o texto mudam assim que tocas",
  "tempo.quantizeDesc.beat": "Os clips e o texto esperam pela próxima batida",
  "tempo.quantizeDesc.bar":
    "Os clips e o texto esperam pelo 1.º tempo do próximo compasso",
  "help.toggleShow": "Mostrar descrições",
  "help.toggleHide": "Esconder descrições",
  "help.crossfader":
    "Desliza para trazer o clip de mistura por cima do clip no ar",
  "help.bpm": "Toca para mudar o ritmo ou seguir o microfone do ecrã",
  "help.tap":
    "Toca ao ritmo da música quatro vezes ou mais para marcar o ritmo",
  "help.beatDots": "Acende cada batida do compasso em sincronia com os ecrãs",
  "help.downbeat":
    "Toca no primeiro tempo para alinhar o compasso com a música",
  "help.quantize":
    "Escolhe quando os clips mudam: já, na batida ou no compasso",
  "help.transitionMode":
    "Como os ecrãs passam para o clip seguinte. Toca para escolher",
  "help.transitionLength":
    "Quanto dura a passagem para o clip seguinte, em batidas ou segundos",
  "help.speed": "Define a velocidade dos clips, de 0,25x a 4x",
  "help.effectPad":
    "Toca para manter ligado, ou mantém premido para o usar só enquanto o seguras",
  "help.effectsLibrary":
    "Abre todos os efeitos para ligar, afinar ou juntar ao dock",
  "help.effectsOn": "Todos os efeitos ligados. Toca num para o desligar",
  "help.resetLook":
    "Desliga efeitos, texto, logótipo e mistura. O clip continua a tocar",
  "help.cue":
    "Liga o modo de preparação: o clip em que tocas espera pelo Lançar",
  "help.go": "Manda o clip preparado para os ecrãs",
  "help.more": "Abre texto, aleatório, mistura, cenas, ecrãs e mais",
  "help.blackout": "Põe todos os ecrãs a preto. Toca outra vez para voltar",
  "help.back": "Volta à biblioteca de VJ",
  "help.favoritesOnly":
    "Mostra só os clips deste pack que marcaste com estrela",
  "help.packTab": "Muda para este pack e conta os clips prontos nos ecrãs",
  "help.generators": "Mostra visuais que os ecrãs desenham sem clip",
  "help.generatorTile": "Toca para mostrar este gerador nos ecrãs",
  "help.search": "Procura clips deste pack pelo nome",
  "help.screensStatus":
    "Mostra se os ecrãs estão ligados. Toca para ver cada um",
  "help.miniMirror": "O que os ecrãs mostram agora. Toca para aumentar",
  "help.nowPlaying": "O clip ou gerador que está nos ecrãs agora",
  "help.nextUp":
    "O que vem a seguir: o clip preparado, o próximo passo ou o aleatório",
  "help.shuffleTimer":
    "Conta o tempo até ao próximo passo, clip aleatório ou mudança à espera",
  "help.skip": "Passa já para o próximo clip do aleatório",
  "help.scenesTab": "Mostra as tuas cenas guardadas nesta linha",
  "help.recentTab": "Mostra os últimos clips que tocaste nesta linha",
  "help.sceneChip": "Repõe este visual guardado nos ecrãs",
  "help.setlistStep": "Passa para o passo anterior ou seguinte da sequência",
  "help.setlistPlay":
    "Toca ou pausa a sequência. Continua com o telemóvel bloqueado",
  "help.saveScene":
    "Guarda o clip, os efeitos, a transição, o texto e a mistura atuais",
  "help.sceneList":
    "Abre todas as cenas e sequências para mudar o nome, apagar, tocar ou avançar passo a passo",
  "help.previousClip": "Volta ao clip que tocou antes deste",
  "help.recentClip": "Volta a pôr este clip recente no ar",
  "help.clipTile":
    "Toca para pôr no ar ou preparar. Mantém premido para pré-visualizar",
  "help.favoriteClip":
    "Marca o clip com estrela para o filtro de favoritos e o aleatório",
  "help.clipFailures":
    "Lista os clips que não carregaram e como resolver cada um",
  "more.desc.text":
    "Põe texto, uma contagem decrescente ou o logótipo nos ecrãs",
  "more.desc.shuffle": "Muda de clip sozinho a cada tantos segundos ou batidas",
  "more.desc.mix":
    "Põe um segundo clip por cima do clip no ar e mistura os dois",
  "more.desc.scenes":
    "Recupera visuais guardados e toca clips e cenas por ordem em sequências",
  "more.desc.screens":
    "Verifica cada ecrã, mostra o número dele ou dá-lhe um clip só seu",
  "more.desc.eventCard":
    "Mostra nos ecrãs o código QR do evento ou o cartão do próximo evento",
  "more.desc.midi":
    "Deixa as teclas e os botões de um controlador MIDI controlar o comando",
  "more.desc.effects":
    "Lista todos os efeitos com as definições e a ordem do dock",
  "more.desc.shortcuts":
    "Lista as teclas para clips, Lançar, blackout, marcar o ritmo e mais",
  "more.desc.cueMode":
    "Os clips em que tocas ficam preparados até carregares em Lançar",
  "more.desc.clearScreen": "Tira o clip do ar e deixa os ecrãs a preto",
  "more.intro": "Painéis de preparação e ações do espetáculo fora do dock",
  "text.intro":
    "Põe palavras, uma contagem decrescente ou o teu logótipo sobre os visuais",
  "shuffle.intro": "Deixa os ecrãs escolher o próximo clip ao fim de um tempo",
  "mix.intro":
    "Põe um segundo clip por cima do clip no ar e passa de um para o outro",
  "scenes.intro": "Repõe visuais guardados com um toque, ou toca-os por ordem",
  "screensSheet.intro":
    "Todos os ecrãs abertos, como estão a correr e o que mostram",
  "eventCard.intro":
    "Mostra o evento ligado nos ecrãs como código QR ou como cartão",
  "midi.intro": "Liga as teclas e os botões de um controlador ao comando",
  "effect.intro": "Liga efeitos, afina-os e escolhe quais ficam no dock",
  "keys.intro": "Comanda o espetáculo a partir do teclado com estas teclas",
  "effectsOn.title": "Ligados agora",
  "effectsOn.count_one": "{count} efeito ligado",
  "effectsOn.count_other": "{count} efeitos ligados",
  "effectsOn.allOff": "Desligar todos",
  "effectsOn.turnOffAria": "Desligar {effect}",

  // ── Dock help legend ──
  "help.term.beatDots": "Batidas",
  "help.term.length": "Duração",
  "tempo.followMicDesc": "O ecrã principal ouve a música e acompanha o ritmo",

  // ── Effects on strip, empty and legend ──
  "effectsOn.none": "Nenhum efeito ligado",
  "effectsOn.term": "Efeitos ligados",
};
