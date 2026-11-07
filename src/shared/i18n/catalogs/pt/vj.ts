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
  "libraryView.show": "Cenas e alinhamentos",

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
    "A cena sai da biblioteca e de {count} lugar num alinhamento",
  "libraryScenes.deleteBodySetlists_other":
    "A cena sai da biblioteca e de {count} lugares em alinhamentos",
  "libraryScenes.deleteConfirm": "Apagar cena",
  "libraryScenes.deleted": "{name} apagada",

  // ── Library set lists ──
  "librarySetlists.heading": "Alinhamentos",
  "librarySetlists.count": "{count} de {max}",
  "librarySetlists.intro":
    "Um alinhamento passa cenas por ordem. Avança por ele no comando",
  "librarySetlists.listLabel": "Alinhamentos por ordem",
  "librarySetlists.emptyTitle": "Ainda não há alinhamentos",
  "librarySetlists.emptyBody":
    "Cria um e junta cenas pela ordem em que as queres passar",
  "librarySetlists.loadErrorTitle": "Não conseguimos carregar os alinhamentos",
  "librarySetlists.retry": "Carregar os alinhamentos outra vez",
  "librarySetlists.create.open": "Novo alinhamento",
  "librarySetlists.create.label": "Nome do alinhamento",
  "librarySetlists.create.submit": "Criar alinhamento",
  "librarySetlists.created": "{name} criado",
  "librarySetlists.sceneCount_one": "{count} cena",
  "librarySetlists.sceneCount_other": "{count} cenas",
  "librarySetlists.moveUp": "Subir {name}",
  "librarySetlists.moveDown": "Descer {name}",
  "librarySetlists.movedStatus": "{name} é agora o alinhamento {position}",
  "librarySetlists.editScenes": "Editar cenas",
  "librarySetlists.editScenesAria": "Editar as cenas de {name}",
  "librarySetlists.renameAria": "Mudar o nome de {name}",
  "librarySetlists.renameSubmit": "Guardar nome",
  "librarySetlists.renamed": "Alinhamento com o novo nome {name}",
  "librarySetlists.deleteAria": "Apagar {name}",
  "librarySetlists.deleteTitle": "Apagar {name}",
  "librarySetlists.deleteBody": "As cenas dele ficam na biblioteca",
  "librarySetlists.deleteConfirm": "Apagar alinhamento",
  "librarySetlists.deleted": "{name} apagado",
  "setlistItems.listLabel": "Cenas de {name}",
  "setlistItems.count": "{count} de {max} cenas",
  "setlistItems.empty":
    "Este alinhamento ainda não tem cenas. Junta a primeira aqui em baixo",
  "setlistItems.noScenes":
    "Guarda primeiro cenas no comando e depois junta-as aqui",
  "setlistItems.sceneGone": "Uma cena apagada",
  "setlistItems.moveUp": "Subir {scene} no alinhamento",
  "setlistItems.moveDown": "Descer {scene} no alinhamento",
  "setlistItems.movedStatus": "{scene} é agora o número {position}",
  "setlistItems.remove": "Tirar {scene} de {setlist}",
  "setlistItems.removeTooltip": "Tirar do alinhamento",
  "setlistItems.removed": "{scene} saiu de {setlist}",
  "setlistItems.addLabel": "Juntar uma cena",
  "setlistItems.addPlaceholder": "Escolhe uma cena",
  "setlistItems.addSearch": "Procurar cenas",
  "setlistItems.addEmpty": "Nenhuma cena corresponde",
  "setlistItems.addSubmit": "Juntar cena",
  "setlistItems.added": "{scene} entrou como número {position}",
  "setlistItems.full":
    "Este alinhamento está cheio. Tira uma cena para juntar outra",

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
  "error.setlistNotFound": "Este alinhamento já não existe",
  "error.setlistNameRequired": "Dá um nome ao alinhamento",
  "error.setlistNameTooLong":
    "Os nomes dos alinhamentos têm no máximo {max} caracteres",
  "error.setlistNameTaken": "Já há outro alinhamento com este nome",
  "error.setlistLimitReached": "A biblioteca tem no máximo {max} alinhamentos",
  "error.setlistReorderMismatch":
    "A nova ordem tem de incluir cada alinhamento uma vez",
  "error.setlistItemsInvalid": "Não conseguimos ler as cenas do alinhamento",
  "error.setlistFull": "Um alinhamento tem no máximo {max} cenas",
  "error.previewUnsupported":
    "Este browser não consegue criar pré-visualizações. Experimenta o Chrome ou o Edge",
  "error.previewFailed": "Não conseguimos criar a pré-visualização deste clip",
  "error.uploadPreviewTooLarge":
    "A pré-visualização animada deste clip ficou acima de {max}. Cria a pré-visualização de novo",

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
  "error.socket.setlistNotFound": "Este alinhamento foi apagado",
  "error.socket.setlistNone": "Escolhe primeiro um alinhamento",
  "error.socket.setlistEmpty":
    "Este alinhamento ainda está vazio. Junta-lhe cenas primeiro",
  "error.socket.setlistIndexInvalid": "Essa cena já saiu do alinhamento",
  "error.socket.setlistStart": "Estás no início do alinhamento",
  "error.socket.setlistEnd": "Essa foi a última cena do alinhamento",
  "error.socket.staleSetlist":
    "Outro comando mudou o alinhamento primeiro. O comando mostra agora onde está",
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
  "connection.refused.clientOutdated":
    "Esta página está desatualizada. Recarrega-a para continuares a tocar",

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
  "screen.renderer.dom": "Renderizador simples: {reason}",
  "screen.renderer.reason.webgl2Missing":
    "este browser não tem WebGL2, por isso só correm os efeitos simples",
  "screen.renderer.reason.softwareRenderer":
    "este portátil desenha os gráficos sem a placa gráfica, por isso só correm os efeitos simples",
  "screen.renderer.reason.contextCreationFailed":
    "a placa gráfica recusou arrancar o motor de efeitos",
  "screen.renderer.reason.programFailed":
    "a placa gráfica não conseguiu montar o motor de efeitos",
  "screen.renderer.reason.contextLost":
    "a placa gráfica reiniciou duas vezes durante o espetáculo",
  "screen.renderer.reason.forced": "o link do ecrã pede o renderizador simples",
  "screen.renderer.restoring":
    "A placa gráfica reiniciou; o renderizador simples segura o espetáculo enquanto recupera",
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
    "O download foi interrompido. Volta a tentar quando a ligação voltar",
  "preload.failure.storage_full":
    "Este portátil ficou sem espaço para clips. Liberta espaço e recarrega o ecrã",
  "preload.failure.decode_failed":
    "O browser do ecrã não consegue reproduzir este clip",
  "preload.failure.not_found": "Este clip já não está no pack",
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
  "mirror.skip": "Saltar para o próximo clip",
  "mirror.nextShuffle": "Aleatório: {title}",
  "mirror.nextSetlist": "Cena {position} de {total}: {name}",
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
  "strip.setlistNext": "Próxima cena",
  "strip.setlistPrevious": "Cena anterior",
  "strip.setlistPosition": "{position} de {total}",
  "strip.switchAria": "Mostrar cenas ou clips recentes",
  "strip.openScenes": "Abrir cenas e alinhamentos",

  // ── Remote clip grid ──
  "grid.label": "Clips",
  "grid.favorite": "Adicionar {title} aos favoritos",
  "grid.unfavorite": "Tirar {title} dos favoritos",
  "grid.cueAria": "Preparar {title}",
  "grid.cued": "Preparado",
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
  "scenes.title": "Cenas e alinhamentos",
  "scenes.defaultName": "Cena {number}",
  "scenes.recall": "Recuperar cena",
  "scenes.rename": "Mudar o nome da cena",
  "scenes.nameLabel": "Nome da cena",
  "scenes.saveName": "Guardar nome",
  "scenes.nameRequired": "Dá um nome à cena",
  "scenes.delete": "Apagar cena",
  "scenes.deleteTitle": "Apagar {name}?",
  "scenes.thisPack": "Este pack",
  "scenes.anyPack": "Qualquer pack",
  "scenes.setlists": "Alinhamentos",
  "scenes.startSetlist": "Começar alinhamento",
  "scenes.stopSetlist": "Parar alinhamento",
  "scenes.makeSetlist": "Criar um alinhamento com estas cenas",
  "scenes.setlistDefaultName": "Alinhamento {number}",
  "scenes.setlistEmpty": "Ainda não há alinhamentos",
  "scenes.setlistCount_one": "{count} cena",
  "scenes.setlistCount_other": "{count} cenas",
  "scenes.close": "Fechar cenas",

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
    "Renderizador simples, alguns efeitos estão desligados",
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
};
