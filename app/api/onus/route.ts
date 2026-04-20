import { del } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rowToOnu, type OnuWithImagesRow } from "@/lib/types"

export const runtime = "nodejs"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("onus")
    .select("*, onu_images(id, image_url, image_pathname, sort_order)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Failed to list onus:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    onus: (data as OnuWithImagesRow[]).map(rowToOnu),
  })
}

type ImageUpload = {
  imageUrl: string
  imagePathname: string
}

type CreateOnuBody = {
  brand?: string
  model?: string
  images?: ImageUpload[]
}

export async function POST(request: NextRequest) {
  let body: CreateOnuBody
  try {
    body = (await request.json()) as CreateOnuBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { brand, model, images } = body

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

  const supabase = await createClient()

  // Insert the ONU row
  const { data: onuData, error: onuError } = await supabase
    .from("onus")
    .insert({
      brand: brand.trim(),
      model: model.trim(),
    })
    .select("*")
    .single()

  if (onuError || !onuData) {
    console.error("[v0] Failed to insert ONU row:", onuError)
    // Best-effort cleanup of the uploaded blobs.
    await Promise.all(
      images.map((img) =>
        del(img.imagePathname).catch((err) =>
          console.error("[v0] Cleanup failed:", err),
        ),
      ),
    )
    return NextResponse.json(
      { error: onuError?.message ?? "Falha ao salvar a ONU." },
      { status: 500 },
    )
  }

  // Insert all images into onu_images table
  const imageRows = images.map((img, idx) => ({
    onu_id: onuData.id,
    image_url: img.imageUrl,
    image_pathname: img.imagePathname,
    sort_order: idx,
  }))

  const { error: imagesError } = await supabase
    .from("onu_images")
    .insert(imageRows)

  if (imagesError) {
    console.error("[v0] Failed to insert ONU images:", imagesError)
    // Delete the ONU row (cascade will clean up images table)
    await supabase.from("onus").delete().eq("id", onuData.id)
    // Cleanup blobs
    await Promise.all(
      images.map((img) =>
        del(img.imagePathname).catch((err) =>
          console.error("[v0] Cleanup failed:", err),
        ),
      ),
    )
    return NextResponse.json(
      { error: "Falha ao salvar as imagens." },
      { status: 500 },
    )
  }

  // Fetch the complete ONU with images
  const { data: completeOnu } = await supabase
    .from("onus")
    .select("*, onu_images(id, image_url, image_pathname, sort_order)")
    .eq("id", onuData.id)
    .single()

  return NextResponse.json({
    onu: rowToOnu(completeOnu as OnuWithImagesRow),
  })
}
