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
  previewUrl: string
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
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setImages([])
    setSubmitting(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: ImagePreview[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" não é uma imagem válida.`)
        continue
      }
      newImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages])
    }

    // Reset input so same file can be selected again
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brand.trim() || !model.trim()) {
      toast.error("Informe a marca e o modelo da ONU.")
      return
    }
    if (images.length === 0) {
      toast.error("Envie pelo menos uma imagem da ONU.")
      return
    }

    setSubmitting(true)
    try {
      const safeBrand = brand.trim().replace(/[^\w-]+/g, "_").toLowerCase()
      const safeModel = model.trim().replace(/[^\w-]+/g, "_").toLowerCase()
      const stamp = Date.now()

      // Upload all images to Vercel Blob
      const uploadedImages: { imageUrl: string; imagePathname: string }[] = []
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const imageExt = (img.file.name.split(".").pop() ?? "jpg").toLowerCase()
        const imageBlob = await upload(
          `onus/${safeBrand}/${safeModel}/${stamp}-image-${i}.${imageExt}`,
          img.file,
          {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            contentType: img.file.type || "image/jpeg",
          },
        )
        uploadedImages.push({
          imageUrl: imageBlob.url,
          imagePathname: imageBlob.pathname,
        })
      }

      // Send metadata to the API
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
      console.error("[v0] create ONU error:", err)
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar nova ONU</DialogTitle>
          <DialogDescription>
            Cadastre uma ONU com suas imagens para referência.
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
                placeholder="HG8245H"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Multiple image uploader */}
          <div className="flex flex-col gap-2">
            <Label>Fotos da ONU</Label>

            {/* Image grid preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-md overflow-hidden border border-border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={`Imagem ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      aria-label={`Remover imagem ${idx + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className={cn(
                "flex min-h-24 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <ImageIcon className="h-5 w-5" />
              <span>
                {images.length > 0
                  ? "Adicionar mais imagens"
                  : "Clique para selecionar imagens"}
              </span>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {images.length} {images.length === 1 ? "imagem selecionada" : "imagens selecionadas"}
              </p>
            )}
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
