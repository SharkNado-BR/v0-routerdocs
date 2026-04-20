"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageCarouselProps = {
  images: { id: string; imageUrl: string }[]
  alt: string
  onImageClick?: (index: number) => void
  className?: string
}

export function ImageCarousel({
  images,
  alt,
  onImageClick,
  className,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
      >
        Sem imagens
      </div>
    )
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleImageClick = () => {
    onImageClick?.(currentIndex)
  }

  return (
    <div className={cn("relative group", className)}>
      {/* Main image */}
      <button
        type="button"
        onClick={handleImageClick}
        className="w-full h-full cursor-pointer focus:outline-none"
        aria-label={`Ver ${alt} em tela cheia`}
      >
        <img
          src={images[currentIndex].imageUrl}
          alt={`${alt} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Navigation arrows (only show if more than 1 image) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Image indicator dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75",
                )}
                aria-label={`Ir para imagem ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
