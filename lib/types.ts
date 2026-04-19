export type Manual = {
  id: string
  brand: string
  model: string
  imageUrl: string
  imagePathname: string
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

export function rowToManual(row: ManualRow): Manual {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    imageUrl: row.image_url,
    imagePathname: row.image_pathname,
    pdfUrl: row.pdf_url,
    pdfPathname: row.pdf_pathname,
    pdfFilename: row.pdf_filename,
    pdfSize: Number(row.pdf_size),
    createdAt: row.created_at,
  }
}
