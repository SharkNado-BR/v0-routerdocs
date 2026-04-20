"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { FileText, Loader2, Radio, Router, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OnuCard } from "@/components/onu-card"
import { OnuForm } from "@/components/onu-form"
import { PdfViewer } from "@/components/pdf-viewer"
import { RouterCard } from "@/components/router-card"
import { RouterForm } from "@/components/router-form"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Manual, Onu } from "@/lib/types"

const manualsFetcher = async (url: string): Promise<{ manuals: Manual[] }> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load manuals")
  return res.json()
}

const onusFetcher = async (url: string): Promise<{ onus: Onu[] }> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load ONUs")
  return res.json()
}

export default function HomePage() {
  const {
    data: manualsData,
    isLoading: loadingManuals,
    mutate: mutateManuals,
  } = useSWR("/api/manuals", manualsFetcher, { revalidateOnFocus: false })
  const manuals = manualsData?.manuals ?? []

  const {
    data: onusData,
    isLoading: loadingOnus,
    mutate: mutateOnus,
  } = useSWR("/api/onus", onusFetcher, { revalidateOnFocus: false })
  const onus = onusData?.onus ?? []

  const [tab, setTab] = useState<string>("routers")
  const [query, setQuery] = useState("")
  const [viewing, setViewing] = useState<Manual | null>(null)

  const filteredManuals = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return manuals
    return manuals.filter((m) => {
      const haystack = `${m.brand} ${m.model}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [manuals, query])

  const filteredOnus = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return onus
    return onus.filter((o) => {
      const haystack = `${o.brand} ${o.model}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [onus, query])

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
                Manuais de roteadores e ONUs organizados em um só lugar
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="h-auto p-1">
              <TabsTrigger value="routers" className="gap-2 px-4 py-2">
                <Router className="h-4 w-4" />
                Roteadores
              </TabsTrigger>
              <TabsTrigger value="onus" className="gap-2 px-4 py-2">
                <Radio className="h-4 w-4" />
                ONUs
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar por marca ou modelo..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Pesquisar"
                />
              </div>
              {tab === "routers" ? (
                <RouterForm onCreated={() => mutateManuals()} />
              ) : (
                <OnuForm onCreated={() => mutateOnus()} />
              )}
            </div>
          </div>

          {/* Routers Tab */}
          <TabsContent value="routers" className="mt-0">
            <section className="mb-4 flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Manuais de Roteadores
              </h1>
              <p className="text-sm text-muted-foreground">
                {manuals.length > 0
                  ? `${manuals.length} ${manuals.length === 1 ? "manual cadastrado" : "manuais cadastrados"}`
                  : ""}
              </p>
            </section>

            {loadingManuals ? (
              <LoadingState message="Carregando manuais..." />
            ) : manuals.length === 0 ? (
              <EmptyState type="routers" />
            ) : filteredManuals.length === 0 ? (
              <NoResults query={query} />
            ) : (
              <section
                aria-label="Lista de manuais"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filteredManuals.map((manual) => (
                  <RouterCard
                    key={manual.id}
                    manual={manual}
                    onView={setViewing}
                    onDeleted={() => mutateManuals()}
                  />
                ))}
              </section>
            )}
          </TabsContent>

          {/* ONUs Tab */}
          <TabsContent value="onus" className="mt-0">
            <section className="mb-4 flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Fotos de ONUs
              </h1>
              <p className="text-sm text-muted-foreground">
                {onus.length > 0
                  ? `${onus.length} ${onus.length === 1 ? "ONU cadastrada" : "ONUs cadastradas"}`
                  : ""}
              </p>
            </section>

            {loadingOnus ? (
              <LoadingState message="Carregando ONUs..." />
            ) : onus.length === 0 ? (
              <EmptyState type="onus" />
            ) : filteredOnus.length === 0 ? (
              <NoResults query={query} />
            ) : (
              <section
                aria-label="Lista de ONUs"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filteredOnus.map((onu) => (
                  <OnuCard
                    key={onu.id}
                    onu={onu}
                    onDeleted={() => mutateOnus()}
                  />
                ))}
              </section>
            )}
          </TabsContent>
        </Tabs>
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

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {message}
    </div>
  )
}

function EmptyState({ type }: { type: "routers" | "onus" }) {
  const isRouters = type === "routers"
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        {isRouters ? <FileText className="h-6 w-6" /> : <Radio className="h-6 w-6" />}
      </div>
      <h2 className="text-lg font-semibold">
        {isRouters ? "Nenhum manual cadastrado" : "Nenhuma ONU cadastrada"}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Clique em{" "}
        <span className="font-medium text-foreground">
          {isRouters ? "Novo Manual" : "Nova ONU"}
        </span>{" "}
        para adicionar {isRouters ? "o primeiro modelo com imagens e PDF" : "a primeira ONU com suas fotos"}.
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
