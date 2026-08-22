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
  "photo.consentAria": "Mostrar a minha fotografia no meu cartão de {community}",

  "discreet.title": "Cartão escondido",
  "discreet.body":
    "O teu cartão mostra o nome da comunidade que o emitiu. Fica tapado até o mostrares e volta a esconder-se quando sais deste ecrã.",
  "discreet.show": "Mostrar cartão",
  "discreet.showAria": "Mostrar o teu cartão de sócio",
  "discreet.hide": "Esconder",
  "discreet.hideAria": "Esconder o teu cartão de sócio",

  "face.ariaLabel": "Cartão de sócio de {community}",
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

  "qrNotice.minting": "A preparar o teu código",
  "qrNotice.offline":
    "Sem ligação à QueerPulse. O teu cartão não consegue provar-se agora.",
  "qrNotice.expired": "Este cartão expirou",
  "qrNotice.suspended": "Este cartão está suspenso",
  "qrNotice.revoked": "Este cartão já não é válido",
  "qrNotice.holderOnly": "Só quem tem o cartão consegue mostrar o código",

  "status.expired": "Este cartão expirou. Pede um novo à comunidade.",
  "status.suspended": "Este cartão está suspenso. A comunidade pode explicar-te.",
  "status.revoked": "Este cartão já não é válido. A comunidade pode explicar-te.",
  "status.tag.active": "Ativo",
  "status.tag.expired": "Expirado",
  "status.tag.suspended": "Suspenso",
  "status.tag.revoked": "Revogado",

  "role.owner": "Responsável",
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
    "A bandeira preenche o cartão inteiro. O texto por cima continua legível automaticamente.",
  "designer.photoHelper":
    "Uma imagem larga, recortada para o cartão. O texto por cima continua legível automaticamente.",
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
  "designer.crestLabel": "Emblema",
  "designer.crestHelper":
    "Um logótipo quadrado pequeno, mostrado no canto superior do cartão. Opcional.",
  "designer.validityLabel": "Durante quanto tempo o cartão é válido",
  "designer.validityHelper":
    "Um cartão emitido hoje deixa de funcionar a {date}.",
  "designer.validityHelperNever":
    "Os cartões continuam a funcionar até os pausares ou revogares.",
  "designer.previewCaption": "Como quem é membro vê o seu cartão.",
  "designer.previewThemeLabel": "Pré-visualizar o cartão em modo claro ou escuro",
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
};
