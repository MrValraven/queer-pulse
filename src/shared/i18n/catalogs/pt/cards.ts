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

  "qrNotice.minting": "A preparar o teu código",
  "qrNotice.offline":
    "Sem ligação à QueerPulse. O teu cartão não consegue provar-se agora.",
  "qrNotice.expired": "Este cartão expirou",
  "qrNotice.suspended": "Este cartão está suspenso",
  "qrNotice.revoked": "Este cartão já não é válido",

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
  "designer.skinLabel": "Estilo do cartão",
  "designer.accentLabel": "Cor de destaque",
  "designer.validityLabel": "Durante quanto tempo o cartão é válido",
  "designer.save": "Guardar e emitir cartões",
  "designer.saved": "Cartão guardado. {count} membros já têm um.",
  "designer.savedPaused":
    "Cartão guardado. Continua pausado, por isso quem é membro só vê a mudança quando o retomares.",

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

  "modTools.title": "Cartão de sócio",
  "modTools.empty":
    "Dá a quem é membro um cartão que prova que pertence aqui. Podem mostrá-lo nos vossos encontros e qualquer pessoa o consegue verificar.",
  "modTools.start": "Criar cartão de sócio",
  "modTools.edit": "Editar cartão",
  "modTools.pause": "Pausar este cartão de sócio",
  "modTools.resume": "Retomar este cartão de sócio",
  "modTools.pausedNotice":
    "Este cartão de sócio está pausado. Quem é membro não pode mostrar nem ler um cartão até o retomares.",
  "modTools.pausedToast": "Cartão de sócio pausado.",
  "modTools.resumedToast": "Cartão de sócio retomado.",
};
