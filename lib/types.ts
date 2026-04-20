// Image type used for both manuals and ONUs
export type ImageItem = {
  id: string
  imageUrl: string
  imagePathname: string
  sortOrder: number
}

export type ImageRow = {
  id: string
  image_url: string
  image_pathname: string
  sort_order: number
}

export function rowToImage(row: ImageRow): ImageItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    imagePathname: row.image_pathname,
    sortOrder: row.sort_order,
  }
}

// Manual types
export type Manual = {
  id: string
  brand: string
  model: string
  images: ImageItem[]
  pdfUrl: string
  pdfPathname: string
  pdfFilename: string
  pdfSize: number
  createdAt: string
}

export type ManualRow = {
  id: string
  brand: string
  model: string
  image_url: string
  image_pathname: string
  pdf_url: string
  pdf_pathname: string
  pdf_filename: string
  pdf_size: number
  created_at: string
}

export type ManualWithImagesRow = ManualRow & {
  manual_images: ImageRow[]
}

export function rowToManual(row: ManualWithImagesRow): Manual {
  // Fallback: if no images in manual_images table, use the legacy image_url from manuals table
  let images: ImageItem[] = (row.manual_images || []).map(rowToImage)
  if (images.length === 0 && row.image_url && row.image_pathname) {
    images = [
      {
        id: `legacy-${row.id}`,
        imageUrl: row.image_url,
        imagePathname: row.image_pathname,
        sortOrder: 0,
      },
    ]
  }

  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    images,
    pdfUrl: row.pdf_url,
    pdfPathname: row.pdf_pathname,
    pdfFilename: row.pdf_filename,
    pdfSize: Number(row.pdf_size),
    createdAt: row.created_at,
  }
}

// ONU types
export type Onu = {
  id: string
  brand: string
  model: string
  images: ImageItem[]
  createdAt: string
}

export type OnuRow = {
  id: string
  brand: string
  model: string
  created_at: string
}

export type OnuWithImagesRow = OnuRow & {
  onu_images: ImageRow[]
}

export function rowToOnu(row: OnuWithImagesRow): Onu {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    images: (row.onu_images || []).map(rowToImage),
    createdAt: row.created_at,
  }
}
