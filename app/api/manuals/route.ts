import { del } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rowToManual, type ManualRow } from "@/lib/types"

export const runtime = "nodejs"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("manuals")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Failed to list manuals:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    manuals: (data as ManualRow[]).map(rowToManual),
  })
}

type CreateManualBody = {
  brand?: string
  model?: string
  imageUrl?: string
  imagePathname?: string
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

  const {
    brand,
    model,
    imageUrl,
    imagePathname,
    pdfUrl,
    pdfPathname,
    pdfFilename,
    pdfSize,
  } = body

  if (!brand?.trim() || !model?.trim()) {
    return NextResponse.json(
      { error: "Marca e modelo são obrigatórios." },
      { status: 400 },
    )
  }
  if (!imageUrl || !imagePathname) {
    return NextResponse.json(
      { error: "Imagem do produto é obrigatória." },
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
  const { data, error } = await supabase
    .from("manuals")
    .insert({
      brand: brand.trim(),
      model: model.trim(),
      image_url: imageUrl,
      image_pathname: imagePathname,
      pdf_url: pdfUrl,
      pdf_pathname: pdfPathname,
      pdf_filename: pdfFilename,
      pdf_size: pdfSize,
    })
    .select("*")
    .single()

  if (error || !data) {
    console.error("[v0] Failed to insert manual row:", error)
    // Best-effort cleanup of the uploaded blobs.
    await Promise.all(
      [imagePathname, pdfPathname].map((p) =>
        del(p).catch((err) => console.error("[v0] Cleanup failed:", err)),
      ),
    )
    return NextResponse.json(
      { error: error?.message ?? "Falha ao salvar o manual." },
      { status: 500 },
    )
  }

  return NextResponse.json({ manual: rowToManual(data as ManualRow) })
}
