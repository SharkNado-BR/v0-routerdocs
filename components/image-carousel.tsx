"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageLightbox } from "@/components/image-lightbox"
import type { ImageItem } from "@/lib/types"

type Props = {
  images: ImageItem[]
  alt: string
}

export function ImageCarousel({ images, alt }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const hasMultiple = images.length > 1
  const currentImage = images[currentIndex]

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleImageClick = () => {
    setLightboxOpen(true)
  }

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        Sem imagem
      </div>
    )
  }

  return (
    <>
      <div className="relative h-full w-full">
        {/* Image */}
        <button
          type="button"
          className="h-full w-full cursor-pointer focus:outline-none"
          onClick={handleImageClick}
          aria-label="Abrir imagem em tela cheia"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage?.imageUrl || "/placeholder.svg"}
            alt={alt}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </button>

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                onClick={handlePrevious}
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {currentIndex < images.length - 1 && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                onClick={handleNext}
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {/* Image indicators */}
        {hasMultiple && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === currentIndex
                    ? "bg-primary"
                    : "bg-primary/30 hover:bg-primary/50"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                aria-label={`Ir para imagem ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentIndex}
          title={alt}
        />
      )}
    </>
  )
}
