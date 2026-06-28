import { useCallback, useMemo, useState } from 'react'
import { FiDownload, FiCopy } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { ToolPage } from './tools/ToolPage'
import { usePrintDocument } from './tools/usePrintDocument'
import { useIssuer } from './tools/useIssuer'
import { ContractForm } from './ContractForm'
import { ContractPreview, contractToText } from './ContractPreview'
import { CLAUSES, DEFAULT_CTX, type ContractCtx, type Lang } from './contract.data'

/**
 * Client-side service-contract generator. Form on the left, live printable
 * contract on the right. Exports via the browser's print-to-PDF and copies the
 * full text to the clipboard. All client-side — no backend, no PDF library.
 */
export function ContractGeneratorPage() {
  const { showToast } = useToast()
  const print = usePrintDocument()
  const [issuer, setIssuer] = useIssuer()

  // Non-provider fields live in local state; provider fields mirror the issuer.
  const [local, setLocal] = useState<ContractCtx>(DEFAULT_CTX)
  const [lang, setLang] = useState<Lang>('en')
  const [selected, setSelected] = useState<string[]>(
    CLAUSES.filter((c) => c.defaultOn).map((c) => c.id),
  )

  const ctx: ContractCtx = useMemo(
    () => ({ ...local, providerName: issuer.name, providerNif: issuer.nif }),
    [local, issuer.name, issuer.nif],
  )

  const handleChange = useCallback(
    (patch: Partial<ContractCtx>) => {
      const issuerPatch: Partial<typeof issuer> = {}
      if ('providerName' in patch) issuerPatch.name = patch.providerName
      if ('providerNif' in patch) issuerPatch.nif = patch.providerNif
      if (Object.keys(issuerPatch).length) setIssuer(issuerPatch)
      setLocal((prev) => ({ ...prev, ...patch }))
    },
    [setIssuer],
  )

  const toggleClause = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const copyText = useCallback(() => {
    navigator.clipboard?.writeText(contractToText(ctx, selected, lang))
    showToast('Copied to clipboard', 'success')
  }, [ctx, selected, lang, showToast])

  return (
    <ToolPage
      eyebrow="Freelance tools"
      title={
        <>
          Build a <em>contract.</em>
        </>
      }
      sub="A clear service agreement, ready in minutes. Fill in the work, pick the clauses that protect you, and export a real PDF — all in your browser."
      form={
        <ContractForm
          ctx={ctx}
          onChange={handleChange}
          selected={selected}
          onToggleClause={toggleClause}
          lang={lang}
          onLangChange={setLang}
        />
      }
      preview={<ContractPreview ctx={ctx} selected={selected} lang={lang} />}
      actions={
        <>
          <Button
            variant="primary"
            size="lg"
            onClick={() => print(`contract-${ctx.project.trim() || 'draft'}`)}
          >
            <FiDownload aria-hidden style={{ marginRight: 7, verticalAlign: '-2px' }} />
            Download PDF
          </Button>
          <Button variant="ghost" size="lg" onClick={copyText}>
            <FiCopy aria-hidden style={{ marginRight: 7, verticalAlign: '-2px' }} />
            Copy text
          </Button>
        </>
      }
    />
  )
}
