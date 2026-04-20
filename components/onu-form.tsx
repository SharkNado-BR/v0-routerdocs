"use client"

import type React from "react"
import { useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { ImageIcon, Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type ImagePreview = {
  file: File
  preview: string
}

type Props = {
  onCreated: () => void
}

export function OnuForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [images, setImages] = useState<ImagePreview[]>([])
  const [submitting, setSubmitting] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setBrand("")
    setModel("")
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
    setSubmitting(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const validFiles = files.filter((file) => file.type.startsWith("image/"))

    if (validFiles.length !== files.length) {
      toast.error("Alguns arquivos não são imagens válidas.")
    }

    const newImages: ImagePreview[] = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setImages((prev) => [...prev, ...newImages])

    // Reset input so the same file can be selected again
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brand.trim() || !model.trim()) {
      toast.error("Informe a marca e o modelo da ONU.")
      return
    }
    if (images.length === 0) {
      toast.error("Envie pelo menos uma imagem do produto.")
      return
    }

    setSubmitting(true)
    try {
      const safeBrand = brand.trim().replace(/[^\w-]+/g, "_").toLowerCase()
      const safeModel = model.trim().replace(/[^\w-]+/g, "_").toLowerCase()
      const stamp = Date.now()

      // Upload all images
      const uploadedImages = await Promise.all(
        images.map(async (img, idx) => {
          const ext = (img.file.name.split(".").pop() ?? "jpg").toLowerCase()
          const blob = await upload(
            `onus/${safeBrand}/${safeModel}/${stamp}-${idx}.${ext}`,
            img.file,
            {
              access: "public",
              handleUploadUrl: "/api/blob/upload",
              contentType: img.file.type || "image/jpeg",
            },
          )
          return {
            imageUrl: blob.url,
            imagePathname: blob.pathname,
          }
        }),
      )

      // Send to API
      const res = await fetch("/api/onus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          images: uploadedImages,
        }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error ?? "Falha ao salvar a ONU.")
      }

      toast.success("ONU adicionada com sucesso.")
      onCreated()
      resetForm()
      setOpen(false)
    } catch (err) {
      console.error("[v0] create onu error:", err)
      toast.error(
        err instanceof Error ? err.message : "Não foi possível salvar a ONU.",
      )
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova ONU
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar nova ONU</DialogTitle>
          <DialogDescription>
            Cadastre uma ONU com suas fotos para referência.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="onu-brand">Marca</Label>
              <Input
                id="onu-brand"
                placeholder="Huawei"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="onu-model">Modelo</Label>
              <Input
                id="onu-model"
                placeholder="HG8145V5"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Multiple image uploader */}
          <div className="flex flex-col gap-2">
            <Label>Fotos do produto</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.preview}
                    alt={`Pré-visualização ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-5 w-5"
                    onClick={() => removeImage(idx)}
                    aria-label={`Remover imagem ${idx + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-accent/40 hover:text-foreground",
                )}
              >
                <ImageIcon className="h-5 w-5" />
                <span>Adicionar</span>
              </button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Você pode adicionar várias fotos da ONU.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando
                </>
              ) : (
                "Salvar ONU"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
