"use client"

import { useState } from "react"
import { Download, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Manual } from "@/lib/types"

type Props = {
  manual: Manual
  onView: (manual: Manual) => void
  onDeleted: () => void
}

export function RouterCard({ manual, onView, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/manuals/${manual.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao remover")
      toast.success("Manual removido.")
      onDeleted()
    } catch (err) {
      console.error("[v0] delete manual error:", err)
      toast.error("Falha ao remover manual.")
    } finally {
      setDeleting(false)
    }
  }

  async function handleDownload() {
    try {
      const res = await fetch(manual.pdfUrl)
      if (!res.ok) throw new Error("Falha no download")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const safeName =
        manual.pdfFilename ||
        `${manual.brand}-${manual.model}.pdf`.replace(/\s+/g, "-").toLowerCase()
      a.download = safeName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error("[v0] download error:", err)
      toast.error("Não foi possível baixar o PDF.")
    }
  }

  return (
    <Card className="group flex flex-col overflow-hidden border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={manual.imageUrl || "/placeholder.svg"}
          alt={`Foto do roteador ${manual.brand} ${manual.model}`}
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
              aria-label="Remover manual"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover este manual?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O arquivo PDF e a imagem do roteador{" "}
                <span className="font-medium text-foreground">
                  {manual.brand} {manual.model}
                </span>{" "}
                serão apagados para todos os usuários.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {manual.brand}
          </span>
          <h3 className="text-base font-semibold text-balance text-foreground">
            {manual.model}
          </h3>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onView(manual)}
            className="w-full"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            Visualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  )
}
