"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
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
import { ImageCarousel } from "@/components/image-carousel"
import type { Onu } from "@/lib/types"

type Props = {
  onu: Onu
  onDeleted: () => void
}

export function OnuCard({ onu, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/onus/${onu.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao remover")
      toast.success("ONU removida.")
      onDeleted()
    } catch (err) {
      console.error("[v0] delete onu error:", err)
      toast.error("Falha ao remover ONU.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="group flex flex-col overflow-hidden border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <ImageCarousel
          images={onu.images}
          alt={`Foto da ONU ${onu.brand} ${onu.model}`}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 h-8 w-8 opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
              aria-label="Remover ONU"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover esta ONU?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. As imagens da ONU{" "}
                <span className="font-medium text-foreground">
                  {onu.brand} {onu.model}
                </span>{" "}
                serão apagadas para todos os usuários.
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
            {onu.brand}
          </span>
          <h3 className="text-base font-semibold text-balance text-foreground">
            {onu.model}
          </h3>
        </div>
        <div className="mt-auto text-xs text-muted-foreground">
          {onu.images.length} {onu.images.length === 1 ? "foto" : "fotos"}
        </div>
      </div>
    </Card>
  )
}
