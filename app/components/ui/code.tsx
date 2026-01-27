import { memo, useEffect, useMemo, useState } from 'react'
import type { BundledLanguage } from 'shiki/bundle/web'
import { CopyButton } from '~/components/ui/copy-button'
import { cn } from '~/lib/utils'

export type Lang = 'typescript' | 'bash' | 'json'

const langMap: Record<Lang, BundledLanguage> = {
  typescript: 'ts',
  bash: 'bash',
  json: 'json',
}

export const Code = memo(function Code({
  children,
  language,
  className,
  hideCopyButton,
  showLineNumbers = false,
  wrapLongLines = false,
  wrapLines = false,
}: {
  children?: string
  language: Lang
  className?: string
  hideCopyButton?: boolean
  showLineNumbers?: boolean
  wrapLongLines?: boolean
  wrapLines?: boolean
}) {
  const code = children || ''
  const shikiLang = useMemo(() => langMap[language], [language])
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const { codeToHtml } = await import('shiki/bundle/web')
        const out = await codeToHtml(code, {
          lang: shikiLang,
          theme: 'github-dark',
        })

        if (!cancelled) setHtml(out)
      } catch {
        if (!cancelled) setHtml(null)
      }
    }

    // SSR renders plaintext; hydrate upgrades to highlighted HTML.
    void run()

    return () => {
      cancelled = true
    }
  }, [code, shikiLang])

  return (
    <div className={cn('relative border rounded-md p-1 text-xs', className)}>
      {!hideCopyButton ? <CopyButton className="absolute right-0 top-0.5" content={code} /> : null}

      {html ? (
        <div
          className={cn(
            '[&_.shiki]:bg-transparent [&_.shiki]:p-5 [&_.shiki]:rounded-sm [&_.shiki]:m-0 [&_.shiki]:overflow-x-auto',
            wrapLongLines && '[&_.shiki]:whitespace-pre-wrap [&_.shiki]:break-words',
            wrapLines && '[&_.shiki]:whitespace-pre-wrap',
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className={cn(
            'm-0 overflow-x-auto p-2',
            wrapLongLines && 'whitespace-pre-wrap break-words',
            wrapLines && 'whitespace-pre-wrap',
          )}
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
})
