"use client"

import type React from "react"
import { useRef, useState } from "react"
import { FileText, ImageIcon, Loader2, Plus, Upload, X } from "lucide-react"
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
import { addManual, type RouterManual } from "@/lib/router-storage"
import { cn } from "@/lib/utils"

type Props = {
  onCreated: () => void
}

export function RouterForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setBrand("")
    setModel("")
    setImageFile(null)
    setPdfFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setSubmitting(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.")
      return
    }
    setImageFile(file)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
  }

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Selecione um arquivo PDF válido.")
      return
    }
    setPdfFile(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brand.trim() || !model.trim()) {
      toast.error("Informe a marca e o modelo do roteador.")
      return
    }
    if (!imageFile) {
      toast.error("Envie uma imagem do produto.")
      return
    }
    if (!pdfFile) {
      toast.error("Envie o manual em PDF.")
      return
    }

    setSubmitting(true)
    try {
      const manual: RouterManual = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        brand: brand.trim(),
        model: model.trim(),
        createdAt: Date.now(),
        imageBlob: imageFile,
        imageType: imageFile.type || "image/jpeg",
        pdfBlob: pdfFile,
        pdfType: pdfFile.type || "application/pdf",
        pdfName: pdfFile.name,
      }
      await addManual(manual)
      toast.success("Manual adicionado com sucesso.")
      onCreated()
      resetForm()
      setOpen(false)
    } catch (err) {
      console.error("[v0] addManual error:", err)
      toast.error("Não foi possível salvar o manual.")
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
          Novo Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar novo manual</DialogTitle>
          <DialogDescription>
            Cadastre um roteador com sua imagem e o PDF do manual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                placeholder="TP-Link"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                placeholder="Archer C60"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Image uploader */}
          <div className="flex flex-col gap-2">
            <Label>Foto do produto</Label>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className={cn(
                "group relative flex min-h-36 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm transition-colors hover:border-primary hover:bg-accent/40",
                imagePreview && "p-0",
              )}
            >
              {imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Pré-visualização da imagem do roteador"
                    className="h-40 w-full object-contain"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Trocar imagem
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <span>Clique para selecionar uma imagem</span>
                </div>
              )}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* PDF uploader */}
          <div className="flex flex-col gap-2">
            <Label>Manual (PDF)</Label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="flex min-h-20 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent/40 hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
                {pdfFile ? "Trocar arquivo PDF" : "Selecionar arquivo PDF"}
              </button>
              {pdfFile ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{pdfFile.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPdfFile(null)}
                    aria-label="Remover PDF"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handlePdfChange}
              className="hidden"
            />
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
                  Salvando
                </>
              ) : (
                "Salvar manual"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
