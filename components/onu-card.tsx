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
import { ImageFullscreen } from "@/components/image-fullscreen"
import type { Onu } from "@/lib/types"

type Props = {
  onu: Onu
  onDeleted: () => void
}

export function OnuCard({ onu, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/onus/${onu.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao remover")
      toast.success("ONU removida.")
      onDeleted()
    } catch (err) {
      console.error("[v0] delete ONU error:", err)
      toast.error("Falha ao remover ONU.")
    } finally {
      setDeleting(false)
    }
  }

  function handleImageClick(index: number) {
    setFullscreenIndex(index)
    setFullscreenOpen(true)
  }

  return (
    <>
      <Card className="group flex flex-col overflow-hidden border-border bg-card transition-colors hover:border-primary/50">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <ImageCarousel
            images={onu.images}
            alt={`${onu.brand} ${onu.model}`}
            onImageClick={handleImageClick}
            className="h-full w-full"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 z-10 opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
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

          <p className="text-xs text-muted-foreground">
            {onu.images.length} {onu.images.length === 1 ? "imagem" : "imagens"}
          </p>
        </div>
      </Card>

      {/* Fullscreen image viewer */}
      {fullscreenOpen && (
        <ImageFullscreen
          images={onu.images}
          alt={`${onu.brand} ${onu.model}`}
          currentIndex={fullscreenIndex}
          onIndexChange={setFullscreenIndex}
          onClose={() => setFullscreenOpen(false)}
        />
      )}
    </>
  )
}
