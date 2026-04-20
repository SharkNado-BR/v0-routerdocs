import { del } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rowToManual, type ManualWithImagesRow } from "@/lib/types"

export const runtime = "nodejs"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("manuals")
    .select("*, manual_images(id, image_url, image_pathname, sort_order)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Failed to list manuals:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    manuals: (data as ManualWithImagesRow[]).map(rowToManual),
  })
}

type ImageUpload = {
  imageUrl: string
  imagePathname: string
}

type CreateManualBody = {
  brand?: string
  model?: string
  images?: ImageUpload[]
  pdfUrl?: string
  pdfPathname?: string
  pdfFilename?: string
  pdfSize?: number
}

export async function POST(request: NextRequest) {
  let body: CreateManualBody
  try {
    body = (await request.json()) as CreateManualBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { brand, model, images, pdfUrl, pdfPathname, pdfFilename, pdfSize } =
    body

  if (!brand?.trim() || !model?.trim()) {
    return NextResponse.json(
      { error: "Marca e modelo são obrigatórios." },
      { status: 400 },
    )
  }
  if (!images || images.length === 0) {
    return NextResponse.json(
      { error: "Pelo menos uma imagem do produto é obrigatória." },
      { status: 400 },
    )
  }
  if (!pdfUrl || !pdfPathname || !pdfFilename || typeof pdfSize !== "number") {
    return NextResponse.json(
      { error: "Manual em PDF é obrigatório." },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  // Insert the manual row (we keep image_url for backwards compat / thumbnail)
  const { data: manualData, error: manualError } = await supabase
    .from("manuals")
    .insert({
      brand: brand.trim(),
      model: model.trim(),
      image_url: images[0].imageUrl,
      image_pathname: images[0].imagePathname,
      pdf_url: pdfUrl,
      pdf_pathname: pdfPathname,
      pdf_filename: pdfFilename,
      pdf_size: pdfSize,
    })
    .select("*")
    .single()

  if (manualError || !manualData) {
    console.error("[v0] Failed to insert manual row:", manualError)
    // Best-effort cleanup of the uploaded blobs.
    const pathnames = [
      ...images.map((i) => i.imagePathname),
      pdfPathname,
    ]
    await Promise.all(
      pathnames.map((p) =>
        del(p).catch((err) => console.error("[v0] Cleanup failed:", err)),
      ),
    )
    return NextResponse.json(
      { error: manualError?.message ?? "Falha ao salvar o manual." },
      { status: 500 },
    )
  }

  // Insert all images into manual_images table
  const imageRows = images.map((img, idx) => ({
    manual_id: manualData.id,
    image_url: img.imageUrl,
    image_pathname: img.imagePathname,
    sort_order: idx,
  }))

  const { error: imagesError } = await supabase
    .from("manual_images")
    .insert(imageRows)

  if (imagesError) {
    console.error("[v0] Failed to insert manual images:", imagesError)
    // Delete the manual row (cascade will clean up images table)
    await supabase.from("manuals").delete().eq("id", manualData.id)
    // Cleanup blobs
    const pathnames = [...images.map((i) => i.imagePathname), pdfPathname]
    await Promise.all(
      pathnames.map((p) =>
        del(p).catch((err) => console.error("[v0] Cleanup failed:", err)),
      ),
    )
    return NextResponse.json(
      { error: "Falha ao salvar as imagens." },
      { status: 500 },
    )
  }

  // Fetch the complete manual with images
  const { data: completeManual } = await supabase
    .from("manuals")
    .select("*, manual_images(id, image_url, image_pathname, sort_order)")
    .eq("id", manualData.id)
    .single()

  return NextResponse.json({
    manual: rowToManual(completeManual as ManualWithImagesRow),
  })
}
