import type { Catalog } from "../../types";

export const cards: Catalog = {
  "page.eyebrow": "Os teus cartões",
  "page.title": "Cartões de sócio",
  "page.dek":
    "Cada comunidade a que pertences pode emitir-te um cartão. Mostra-o para provares que és membro.",

  "empty.title": "Ainda não tens cartões",
  "empty.body":
    "Quando uma comunidade a que pertences criar um cartão, ele aparece aqui.",

  "remove.cta": "Remover este cartão",
  "remove.ctaAria": "Remover o teu cartão de {community}",
  "remove.confirm.title": "Remover o teu cartão de {community}?",
  "remove.confirm.body":
    "Isto apaga o cartão da tua carteira para sempre. Não pode ser desfeito.",
  "remove.confirm.confirmCta": "Remover cartão",
  "remove.toast": "Cartão removido.",

  "photo.consent": "Mostrar a minha fotografia neste cartão",
  "photo.consentAria":
    "Mostrar a minha fotografia no meu cartão de {community}",

  "pronouns.consent": "Mostrar os meus pronomes neste cartão",
  "pronouns.consentAria":
    "Mostrar os meus pronomes no meu cartão de {community}",
  "pronouns.noneSet":
    "O teu cartão de {community} mostra os teus pronomes ao lado do nome. Acrescenta-os ao teu perfil e aparecem aqui.",

  "discreet.title": "Cartão escondido",
  "discreet.body":
    "O teu cartão mostra o nome da comunidade que o emitiu. Fica tapado até o mostrares e volta a esconder-se quando sais deste ecrã.",
  "discreet.show": "Mostrar cartão",
  "discreet.showAria": "Mostrar o teu cartão de sócio",
  "discreet.hideAria": "Esconder o teu cartão de sócio",

  "face.ariaLabel": "Cartão de sócio de {community}",
  "face.loading": "A carregar o teu cartão de sócio",
  "face.qrAriaLabel": "Prova de filiação legível por leitor, de {community}",
  "face.serial": "N.º",
  "face.memberSince": "Desde",
  "face.validUntil": "Válido até",
  "face.neverExpires": "Sem validade",
  "face.role": "Papel",
  "face.backAriaLabel": "Verso do teu cartão de sócio de {community}",
  "face.backAriaLabelIssuer": "Verso deste cartão de sócio de {community}",
  "face.flipToBack": "Virar o cartão para mostrar o código",
  "face.flipToFront": "Virar o cartão para a frente",
  "face.scanToVerify": "Lê o código para verificar em {host}",

  "qrNotice.unavailable":
    "O código deste cartão está indisponível neste momento.",
  "qrNotice.expired": "Este cartão expirou",
  "qrNotice.suspended": "Este cartão está suspenso",
  "qrNotice.revoked": "Este cartão já não é válido",

  "status.expired": "Este cartão expirou. Pede um novo à comunidade.",
  // O mesmo facto, quando o programa deixa a pessoa resolver isto sozinha.
  "status.expiredRenewable":
    "Este cartão expirou. Renová-lo põe-no outra vez válido.",
  "status.suspended":
    "Este cartão está suspenso. A comunidade pode explicar-te.",
  "status.revoked":
    "Este cartão já não é válido. A comunidade pode explicar-te.",
  "status.tag.active": "Ativo",
  "status.tag.expired": "Expirado",
  "status.tag.suspended": "Suspenso",
  "status.tag.revoked": "Revogado",

  // A linha de validade por baixo de cada cartão. Um cartão que funciona
  // comunica um facto; um cartão a acabar pede alguma coisa. Estão redigidos
  // assim de propósito.
  "expiry.never": "Este cartão não caduca.",
  "expiry.inDate": "Válido até {date}.",
  "expiry.soon_one": "Este cartão caduca dentro de {count} dia.",
  "expiry.soon_other": "Este cartão caduca dentro de {count} dias.",
  "expiry.soonRenewable_one":
    "Este cartão caduca dentro de {count} dia. Já o podes renovar.",
  "expiry.soonRenewable_other":
    "Este cartão caduca dentro de {count} dias. Já o podes renovar.",

  "renew.cta": "Renovar cartão",
  "renew.ctaAria": "Renovar o teu cartão de {community}",
  "renew.pending": "A renovar…",
  "renew.toast": "Cartão renovado. É válido até {date}.",
  "renew.error.notAllowed":
    "Esta comunidade trata das renovações. Pede um cartão novo a quem a gere ou modera.",
  "renew.error.withdrawn":
    "Este cartão foi retirado pela comunidade, por isso só ela o pode devolver.",
  "renew.error.notAMember":
    "Já não pertences a esta comunidade, por isso este cartão não pode ser renovado.",
  "renew.error.paused":
    "Este programa de cartões está em pausa. Tenta outra vez quando a comunidade o retomar.",
  "renew.error.noExpiry":
    "Este cartão não caduca, por isso não há nada a renovar.",
  "renew.error.notDue":
    "Este cartão ainda está válido. Podes renová-lo nos últimos 30 dias.",
  "renew.error.generic": "Não foi possível renovar o cartão. Tenta outra vez.",

  "role.owner": "Responsável",
  "role.coOwner": "Cotitular",
  "role.mod": "Moderadore",
  "role.member": "Sócie",

  "verify.metaTitle": "Verificação de cartão · QueerPulse",
  "verify.unverified": "Não foi possível verificar este cartão",
  "verify.status.active": "Cartão de sócio válido",
  "verify.status.expired": "Cartão expirado",
  "verify.status.suspended": "Cartão suspenso",
  "verify.status.revoked": "Cartão já não válido",
  "verify.role": "Papel",
  "verify.serial": "N.º do cartão",
  "verify.memberSince": "Sócie desde",
  "verify.checkPhoto":
    "Confirme a fotografia do cartão com a pessoa que o mostra.",
  "verify.checkNoPhoto":
    "Este cartão não tem fotografia, por isso não confirma quem o tem na mão. Peça o nome ou outra coisa em que confie.",

  "verify.lead.active":
    "A comunidade abaixo emitiu este cartão e ele é válido hoje.",
  "verify.lead.expired":
    "Este cartão foi genuíno e o seu prazo terminou. A comunidade pode renová-lo.",
  "verify.lead.suspended":
    "A comunidade suspendeu este cartão. Trate-o como não válido hoje.",
  "verify.lead.revoked":
    "A comunidade retirou este cartão. Trate-o como não válido.",

  "verify.face.label": "O rosto que consta deste cartão",
  "verify.face.caption":
    "Esta cópia veio dos registos da própria comunidade. Compare-a com a pessoa que lhe mostra o cartão.",

  "verify.stamp": "Verificado às {time}",
  "verify.stampNote":
    "Esta página é feita em direto, por isso uma captura de ecrã dela não prova nada.",

  "verify.unverified.lead":
    "O código que leu não corresponde a um cartão válido hoje.",
  "verify.unverified.whyTitle": "Porque é que isto acontece",
  "verify.unverified.why.replaced":
    "O cartão foi substituído e esta é uma cópia antiga, impressa ou guardada.",
  "verify.unverified.why.screenshot":
    "O código veio de uma captura de ecrã ou de uma fotografia de um cartão em vez do próprio cartão.",
  "verify.unverified.why.partial":
    "O endereço foi copiado ou escrito de forma incompleta.",
  "verify.unverified.why.foreign":
    "Nenhuma comunidade no QueerPulse emitiu alguma vez este código.",
  "verify.unverified.privacy":
    "O QueerPulse responde a tudo isto da mesma maneira de propósito, para que quem ande a ler códigos ao acaso não fique a saber nada sobre quem tem cartão aqui.",
  "verify.unverified.next":
    "Peça à pessoa para abrir o cartão no QueerPulse e leia o código a partir do ecrã dela.",
  "verify.unverified.fair":
    "Isto não diz nada sobre a pessoa à sua frente. Um cartão pode falhar a verificação por motivos completamente fora do controlo dela.",

  "verify.unreachable.title": "Não conseguimos contactar o QueerPulse",
  "verify.unreachable.lead":
    "Nada foi verificado e nada foi decidido sobre este cartão. O seu dispositivo não conseguiu obter resposta.",
  "verify.unreachable.next":
    "Verifique a rede ou o wi-fi e tente de novo. Se a pessoa estiver à espera, peça-lhe para abrir o cartão no QueerPulse na ligação dela.",
  "verify.retry": "Tentar de novo",
  "verify.retrying": "A verificar…",
  "verify.checking": "A verificar este cartão…",

  "designer.ariaLabel": "Desenhar o cartão de sócio da tua comunidade",
  "designer.defaultCardName": "Sócie",
  "designer.cardNameLabel": "Como o cartão trata quem é membro",
  "designer.cardNamePlaceholder": "Sócie, sócio, sócia, companheire",
  "designer.cardNameHelper":
    "A palavra impressa por baixo do nome da comunidade em cada cartão.",
  "designer.backgroundLabel": "De que é feito o cartão",
  "designer.background.colour": "Cor",
  "designer.background.flag": "Bandeira",
  "designer.background.photo": "Fotografia",
  "designer.flagHelper":
    "A bandeira preenche o cartão inteiro. O texto por cima fica sempre legível; escolha como em baixo.",
  "designer.photoHelper":
    "Uma imagem larga, recortada para o cartão. O texto por cima fica sempre legível; escolha como em baixo.",
  "designer.backdropLabel": "Por trás do texto",
  "backdrop.panel": "Painel",
  "backdrop.panelHelper":
    "Um pequeno painel escuro fica por trás do nome da comunidade e do nome da pessoa. Melhor quando a imagem é carregada, porque todo o resto fica destapado.",
  "backdrop.shade": "Sombra",
  "backdrop.shadeHelper":
    "O topo e a base do cartão ficam escurecidos e o meio fica livre. Melhor para bandeiras e para fotografias calmas nas margens.",
  "backdrop.veil": "Véu",
  "backdrop.veilHelper":
    "O cartão inteiro fica escurecido por igual. Melhor quando a imagem tem detalhe em todo o lado e todas as linhas têm de ser legíveis.",
  "flag.rainbow": "Arco-íris",
  "flag.progress": "Progress Pride",
  "flag.transgender": "Transgénero",
  "flag.bisexual": "Bissexual",
  "flag.lesbian": "Lésbica",
  "flag.pansexual": "Pansexual",
  "flag.asexual": "Assexual",
  "flag.aromantic": "Arromântica",
  "flag.nonbinary": "Não binário",
  "flag.genderfluid": "Género fluido",
  "flag.genderqueer": "Genderqueer",
  "flag.agender": "Agénero",
  "flag.intersex": "Intersexo",
  "designer.skinLabel": "Estilo do cartão",
  "designer.accentLabel": "Cor de destaque",
  "designer.accentInvisible":
    "Este destaque tem a mesma cor do cartão, por isso a barra de destaque desaparece.",
  "designer.memberPhotoLabel": "Fotografias de sócies",
  "designer.memberPhotoCheck": "Pôr a fotografia de cada sócie no cartão",
  "designer.memberPhotoHelper":
    "A fotografia vem do perfil da própria pessoa e fica ao lado do nome da comunidade. Qualquer pessoa pode desligar a sua no seu cartão.",
  "designer.photoStyleLabel": "Como as fotografias são impressas",
  "designer.photoStyleHelper":
    "Isto aplica-se à fotografia de todas as pessoas neste cartão, por isso é uma escolha sua sobre as imagens delas.",
  "photoStyle.color": "A cores",
  "photoStyle.mono": "A preto e branco",
  "designer.pronounsLabel": "Pronomes",
  "designer.pronounsCheck": "Mostrar os pronomes de cada sócie ao lado do nome",
  "designer.pronounsHelper":
    "Os pronomes vêm do perfil de cada sócie, por isso o cartão só mostra o que já está definido lá. Qualquer pessoa pode desligar os seus no próprio cartão.",
  "designer.pronounsStandIn": "os teus pronomes",
  "designer.selfRenewLabel": "Renovações",
  "designer.selfRenewCheck":
    "Deixar cada pessoa renovar o próprio cartão perto do fim",
  "designer.selfRenewHelper":
    "Nos últimos 30 dias, cada pessoa pode voltar a pôr o próprio cartão válido sem esperar que emitas cartões para toda a lista. A única condição é estar na tua lista de membros. Um cartão que puseste em pausa ou revogaste fica como está, e só tu o podes devolver.",
  "designer.printLabel": "Cartões impressos",
  "designer.printCheck":
    "Permitir que dones e moderadores imprimam estes cartões",
  "designer.printHelper":
    "Imprima uma folha de cartões físicos para os membros levarem consigo. Um cartão impresso mostra o mesmo código que está no telemóvel, por isso continua a funcionar até o substituir.",
  "designer.crestLabel": "Emblema",
  "designer.crestHelper":
    "Um logótipo quadrado pequeno, mostrado no canto superior do cartão. Opcional.",
  "designer.validityLabel": "Durante quanto tempo o cartão é válido",
  "designer.validityHelper":
    "Um cartão emitido hoje deixa de funcionar a {date}.",
  "designer.validityHelperNever":
    "Os cartões continuam a funcionar até os pausares ou revogares.",
  "designer.previewCaption": "Como quem é membro vê o seu cartão.",
  "designer.previewThemeLabel":
    "Pré-visualizar o cartão em modo claro ou escuro",
  "designer.previewLight": "Claro",
  "designer.previewDark": "Escuro",
  "designer.save": "Guardar e emitir cartões",
  "designer.saveDesign": "Guardar desenho",
  "designer.saved": "Cartão guardado. {count} membros já têm um.",
  "designer.savedDesign":
    "Desenho do cartão guardado. Todos os cartões passam a ficar assim.",
  "designer.savedPaused":
    "Cartão guardado. Continua pausado, por isso quem é membro só vê a mudança quando o retomares.",
  "designer.discard.title": "Descartar este desenho?",
  "designer.discard.body":
    "As tuas alterações ao cartão ainda não foram guardadas. Se fechares agora, perdem-se.",
  "designer.discard.confirm": "Descartar alterações",
  "designer.discard.cancel": "Continuar a editar",

  "skin.plum": "Ameixa",
  "skin.cream": "Creme",
  "skin.jade": "Jade",
  "skin.coral": "Coral",
  "skin.ink": "Tinta",

  "accent.accent": "Coral",
  "accent.plum": "Ameixa",
  "accent.jade": "Jade",
  "accent.ink": "Tinta",

  "validity.never": "Nunca expira",
  "validity.oneYear": "Um ano",
  "validity.twoYears": "Dois anos",

  "holders.title": "Quem tem cartão",
  "holders.searchLabel": "Procurar quem tem cartão",
  "holders.searchPlaceholder": "Nome ou número do cartão",
  "holders.suspend": "Suspender",
  "holders.suspendAria": "Suspender o cartão de {name}",
  "holders.revoke": "Revogar",
  "holders.revokeAria": "Revogar o cartão de {name}",
  "holders.reinstate": "Reativar",
  "holders.reinstateAria": "Reativar o cartão de {name}",
  "holders.selectAria": "Selecionar o cartão de {name} para imprimir",
  "holders.selectAllActive": "Selecionar todos os cartões ativos",
  "holders.clearSelection": "Limpar seleção",
  "holders.printSelected_one": "Imprimir 1 cartão",
  "holders.printSelected_other": "Imprimir {count} cartões",
  "holders.replace": "Substituir",
  "holders.replaceAria": "Substituir o cartão de {name}",
  "holders.replaceModal.title": "Substituir o cartão de {name}?",
  "holders.replaceModal.body":
    "Use isto quando um cartão impresso se perde ou é roubado. Todas as cópias impressas deixam de funcionar de imediato. O cartão no telemóvel continua a funcionar e passa a mostrar um código novo, por isso a pessoa continua a ser membro.",
  "holders.replaceModal.confirm": "Substituir cartão",
  "holders.replaceModal.cancel": "Manter este cartão",
  "holders.replaceToast": "O cartão de {name} tem um código novo.",
  "holders.verifiedNever": "Nunca verificado.",
  "holders.verifiedCount_one": "Verificado uma vez.",
  "holders.verifiedCount_other": "Verificado {count} vezes.",
  "holders.reasonLabel": "Motivo",
  "holders.reasonPlaceholder": "Porque é que este cartão está a mudar?",
  "holders.reasonHint":
    "Só quem modera a comunidade vê isto. Nunca aparece no cartão.",
  "holders.modal.suspended": "Suspender o cartão de {name}?",
  "holders.modal.revoked": "Revogar o cartão de {name}?",
  "holders.modal.active": "Reativar o cartão de {name}?",
  "holders.confirm.suspended": "Suspender cartão",
  "holders.confirm.revoked": "Revogar cartão",
  "holders.confirm.active": "Reativar cartão",
  "holders.toast.suspended": "O cartão de {name} está suspenso.",
  "holders.toast.revoked": "O cartão de {name} está revogado.",
  "holders.toast.active": "O cartão de {name} está ativo outra vez.",
  "holders.viewCardAria": "Abrir o cartão de {name}",
  "holders.card.caption":
    "O cartão tal como quem o tem o vê. Vira-o para veres os detalhes.",
  "holders.card.issued": "Emitido",
  "holders.card.changedOn": "Estado alterado",
  "holders.card.viewProfile": "Ver perfil",
  "holders.card.close": "Fechar",

  "print.metaTitle": "Imprimir cartões de membro · QueerPulse",
  "print.title_one": "Um cartão para imprimir",
  "print.title_other": "{count} cartões para imprimir",
  "print.print": "Imprimir",
  "print.back": "Voltar aos titulares",
  "print.inkNotice":
    "Estes cartões imprimem a cores de ponta a ponta, por isso um lote grande gasta bastante tinta.",
  "print.foldHint":
    "Cada cartão imprime numa tira. Corte pelas marcas dos cantos e dobre para trás na linha tracejada, para a frente e o verso se juntarem.",
  "print.unavailableTitle": "Nada para imprimir",
  "print.emptyBody":
    "Nenhum dos membros selecionados tem um cartão ativo. Emita os cartões primeiro e volte aqui.",
  "print.disabledBody":
    "Os cartões impressos estão desligados neste programa. Um done ou moderador pode ligá-los no editor do cartão.",

  "modTools.title": "Cartão de sócio",
  "modTools.empty":
    "Dá a quem é membro um cartão que prova que pertence aqui. Podem mostrá-lo nos vossos encontros e qualquer pessoa o consegue verificar.",
  "modTools.start": "Criar cartão de sócio",
  "modTools.edit": "Editar cartão",
  "modTools.pause": "Pausar este cartão de sócio",
  "modTools.resume": "Retomar este cartão de sócio",
  "modTools.pausedNotice":
    "Este cartão de sócio está pausado. Quem é membro não pode mostrar nem ler um cartão até o retomares.",
  "modTools.issue": "Emitir cartões",
  "modTools.issueConfirm.title": "Emitir cartões para toda a comunidade?",
  "modTools.issueConfirm.body":
    "Cada membro sem cartão recebe um, e os cartões que expiraram voltam a ficar válidos. Os cartões que pausaste ou revogaste ficam como estão.",
  "modTools.issueConfirm.confirm": "Emitir cartões",
  "modTools.issued.new_one": "Foi emitido um cartão novo.",
  "modTools.issued.new_other": "Foram emitidos {count} cartões novos.",
  "modTools.issued.renewed_one": "Foi renovado um cartão expirado.",
  "modTools.issued.renewed_other": "Foram renovados {count} cartões expirados.",
  "modTools.issued.none": "Toda a gente na comunidade já tem cartão.",
  "modTools.issued.skipped_one":
    "Um cartão pausado ou revogado ficou como estava.",
  "modTools.issued.skipped_other":
    "{count} cartões pausados ou revogados ficaram como estavam.",
  "modTools.pausedToast": "Cartão de sócio pausado.",
  "modTools.resumedToast": "Cartão de sócio retomado.",
  "verifications.title": "Verificações de cartões",
  "verifications.total_one": "{count} verificação",
  "verifications.total_other": "{count} verificações",
  "verifications.recent_one": "{count} nos últimos {days} dias",
  "verifications.recent_other": "{count} nos últimos {days} dias",
  "verifications.last": "Última verificação a {date}.",
  "verifications.empty":
    "Ainda não foi verificado nenhum cartão deste programa.",
  "verifications.note":
    "Uma contagem de quantas vezes estes cartões foram verificados, guardada durante 90 dias e depois apagada. A QueerPulse não guarda registo de quem verificou um cartão, nem de onde.",
};
