"use client"

import { useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageItem } from "@/lib/types"

type Props = {
  images: ImageItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  title?: string
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
  title,
}: Props) {
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1)
    }
  }, [currentIndex, onNavigate])

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1)
    }
  }, [currentIndex, images.length, onNavigate])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        handleNext()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    // Prevent body scroll
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose, handlePrevious, handleNext])

  const currentImage = images[currentIndex]

  if (!currentImage) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Visualizar imagem"}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 h-10 w-10 text-white hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Fechar"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Previous button */}
      {images.length > 1 && currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            handlePrevious()
          }}
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* Image */}
      <div
        className="flex h-full w-full items-center justify-center p-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage.imageUrl}
          alt={title || `Imagem ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Next button */}
      {images.length > 1 && currentIndex < images.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          aria-label="Próxima imagem"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Title */}
      {title && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-6 py-3 text-white">
          <p className="text-center font-medium">{title}</p>
        </div>
      )}
    </div>
  )
}
