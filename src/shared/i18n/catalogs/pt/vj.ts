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
    "Só admins podem carregar clips de VJ, e esta conta não é admin",
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

  // ── Reason codes, socket ──
  "error.socket.notAdmin":
    "O VJ só está aberto a admins, e esta conta já não é admin",
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
    "O clip mudou antes de a mistura avançar. A mistura continua a partir do clip novo",
  "error.socket.notLead": "Outro ecrã comanda a mistura, por isso este segue-o",
  "error.socket.shuffleOff":
    "A mistura está desligada, por isso o ecrã fica neste clip",
  "error.socket.noActivePack":
    "Escolhe primeiro um pack. A mistura passa os clips do pack ativo",
  "error.socket.packNotFound": "Esse pack foi apagado, talvez noutro separador",
  "error.socket.clipNotFound": "Esse clip foi apagado, talvez noutro separador",
  "error.socket.clipNotInPack": "Esse clip já não está no pack ativo",
  "error.socket.patchEmpty":
    "O comando enviou uma alteração vazia. Recarrega o comando",
  "error.socket.transitionModeInvalid": "Escolhe Fundir ou Corte",
  "error.socket.fadeOutOfRange": "As fusões vão de 0 a 4 segundos",
  "error.socket.overlayTextInvalid":
    "O texto no ecrã cabe numa linha, sem quebras de linha nem caracteres escondidos",
  "error.socket.overlayTextTooLong":
    "O texto no ecrã tem no máximo {max} caracteres",
  "error.socket.overlayTextBlank":
    "Escreve algum texto antes de o mostrares no ecrã",
  "error.socket.overlayStyleInvalid": "Escolhe Grande ou Rodapé",
  "error.socket.speedInvalid": "Escolhe uma velocidade de 0,5x, 1x, 1,5x ou 2x",
  "error.socket.effectFlagInvalid":
    "O comando enviou um efeito que o servidor não conseguiu ler. Recarrega o comando",
  "error.socket.shuffleIntervalInvalid":
    "Mistura a cada 2 a 60 segundos, ou a cada 4, 8, 16 ou 32 batidas",
  "error.socket.bpmOutOfRange": "O andamento vai de 60 a 200 BPM",
  "error.socket.serverError":
    "O servidor teve um problema com esse comando. A falha é nossa, tenta de novo",

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
  "failure.forbidden": "O VJ só está aberto a admins, e esta conta não é admin",
  "failure.notFound":
    "Este servidor ainda não tem VJ. Recarrega a página e avisa a nossa equipa se continuar",
  "failure.restricted":
    "Não podes fazer alterações enquanto houver uma restrição de moderação na tua conta",
  "failure.unknown":
    "Isto não seguiu e o servidor não indicou o motivo. Tenta de novo",

  // ── Connection refusals ──
  "connection.refused.notAdmin":
    "O VJ só está aberto a admins, e esta conta já não é admin",
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
  // ── Preload failures (shown on the setup card and the remote grid) ──
  "preload.failure.url_expired":
    "O link de download expirou duas vezes. Recarrega o ecrã para tentar outra vez",
  "preload.failure.network":
    "O download foi interrompido. Volta a tentar quando a ligação voltar",
  "preload.failure.storage_full":
    "Este portátil ficou sem espaço para clips. Liberta espaço e recarrega o ecrã",
  "preload.failure.decode_failed":
    "O browser do ecrã não consegue reproduzir este clip",
  "preload.failure.not_found": "Este clip já não está no pack",
  // ── Remote ──
  "remote.metaTitle": "Comando de VJ",
  "remote.backToLibrary": "Voltar à biblioteca de VJ",
  "remote.liveLabel": "No ecrã agora",
  "remote.nothingLive": "O ecrã está a preto",
  "remote.clearScreen": "Limpar o ecrã",
  "remote.screens.none": "Nenhum ecrã aberto",
  "remote.screens.live_one": "{count} ecrã ligado",
  "remote.screens.live_other": "{count} ecrãs ligados",
  "remote.screens.partial": "{live} de {total} ecrãs ligados",
  "remote.screens.offline_one": "Ecrã desligado",
  "remote.screens.offline_other": "Ecrãs desligados",
  "remote.screens.unknown": "Ecrãs por confirmar até o comando voltar a ligar",
  "remote.packLabel": "Pack",
  "remote.packPlaceholder": "Escolhe um pack",
  "remote.packEmpty":
    "Este pack ainda não tem clips. Junta alguns na biblioteca de VJ",
  "remote.noPacks": "Ainda não há packs. Cria um na biblioteca de VJ",
  "remote.pickPackHint": "Escolhe um pack acima para veres os clips",
  "remote.clipLive": "No ar",
  "remote.clipAria": "Mostrar {title} no ecrã",
  "remote.clipLoading": "A carregar no ecrã, {percent}%",
  "remote.clipQueued": "À espera de carregar no ecrã",
  "remote.clipFailed": "Não carregou no ecrã",
  "remote.transition": "Transição",
  "remote.fade": "Fade",
  "remote.cut": "Corte",
  "remote.fadeLength": "Duração do fade",
  "remote.fadeSeconds": "{seconds} s",
  "remote.blackout": "Blackout",
  "remote.effects": "Efeitos",
  "remote.text": "Texto",
  "remote.shuffle": "Aleatório",
  "remote.offline.network":
    "Não conseguimos chegar ao servidor. Verifica a tua ligação",
  "remote.offline.reconnecting": "A voltar a ligar ao servidor",
  // ── Effects sheet ──
  "effects.title": "Efeitos",
  "effects.speed": "Velocidade",
  "effects.speedValue": "{speed}x",
  "effects.gifSpeedNote":
    "O clip no ar é um GIF, por isso toca à sua própria velocidade",
  "effects.monochrome": "Preto e branco",
  "effects.mirror": "Espelho",
  "effects.hueCycle": "Ciclo de cor",
  "effects.strobe": "Estroboscópio",
  "effects.strobeHint":
    "Flashes brancos ao ritmo, até 3 por segundo. Desliga-se sozinho ao fim de 10 segundos",
  "effects.strobeWarning":
    "Luz a piscar pode provocar convulsões em pessoas com epilepsia fotossensível. Vê bem o espaço antes de o ligares",
  "effects.strobeStart": "Ligar estroboscópio",
  "effects.strobeConfirm": "Ligar estroboscópio agora",
  "effects.strobeStop": "Desligar estroboscópio",
  "effects.strobeRemaining": "Faltam {seconds} s",
  "effects.close": "Fechar efeitos",
  // ── Text sheet ──
  "text.title": "Texto no ecrã",
  "text.label": "Texto",
  "text.charactersLeft": "Faltam {count} caracteres",
  "text.style": "Estilo",
  "text.styleBig": "Grande",
  "text.styleTicker": "Rodapé",
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
  "shuffle.tempo": "Ritmo",
  "shuffle.bpmLabel": "BPM",
  "shuffle.bpmOutOfRange": "Escolhe um ritmo entre 60 e 200 BPM",
  "shuffle.tapTempo": "Marcar ritmo",
  "shuffle.tapHint": "Toca ao ritmo da música, quatro toques ou mais",
  "shuffle.close": "Fechar aleatório",
};
