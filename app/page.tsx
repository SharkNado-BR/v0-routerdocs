"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { FileText, Loader2, Router, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { PdfViewer } from "@/components/pdf-viewer"
import { RouterCard } from "@/components/router-card"
import { RouterForm } from "@/components/router-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { getAllManuals, type RouterManual } from "@/lib/router-storage"

export default function HomePage() {
  const [manuals, setManuals] = useState<RouterManual[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [viewing, setViewing] = useState<RouterManual | null>(null)

  const loadManuals = useCallback(async () => {
    try {
      const all = await getAllManuals()
      setManuals(all)
    } catch (err) {
      console.error("[v0] getAllManuals error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadManuals()
  }, [loadManuals])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return manuals
    return manuals.filter((m) => {
      const haystack = `${m.brand} ${m.model}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [manuals, query])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Router className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight">
                RouterDocs Central
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Manuais de roteadores organizados em um só lugar
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Toolbar */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Seus manuais
            </h1>
            <p className="text-sm text-muted-foreground">
              {manuals.length > 0
                ? `${manuals.length} ${manuals.length === 1 ? "manual cadastrado" : "manuais cadastrados"}`
                : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar por marca ou modelo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                aria-label="Pesquisar manuais"
              />
            </div>
            <RouterForm onCreated={loadManuals} />
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Carregando manuais...
          </div>
        ) : manuals.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <NoResults query={query} />
        ) : (
          <section
            aria-label="Lista de manuais"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((manual) => (
              <RouterCard
                key={manual.id}
                manual={manual}
                onView={setViewing}
                onDeleted={loadManuals}
              />
            ))}
          </section>
        )}
      </main>

      <PdfViewer
        manual={viewing}
        onOpenChange={(open) => {
          if (!open) setViewing(null)
        }}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <FileText className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold">Nenhum manual cadastrado</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Clique em <span className="font-medium text-foreground">Novo Manual</span>{" "}
        para adicionar o primeiro modelo com sua imagem e o PDF.
      </p>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/40 p-10 text-center">
      <Search className="h-6 w-6 text-muted-foreground" />
      <h2 className="text-base font-semibold">Nenhum resultado</h2>
      <p className="text-sm text-muted-foreground">
        Nada encontrado para{" "}
        <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>.
      </p>
    </div>
  )
}
