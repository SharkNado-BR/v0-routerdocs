import { put, del } from "@vercel/blob"
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

export async function POST(request: NextRequest) {
  const uploadedPathnames: string[] = []

  try {
    const formData = await request.formData()
    const brand = String(formData.get("brand") ?? "").trim()
    const model = String(formData.get("model") ?? "").trim()
    const image = formData.get("image") as File | null
    const pdf = formData.get("pdf") as File | null

    if (!brand || !model) {
      return NextResponse.json(
        { error: "Brand and model are required" },
        { status: 400 },
      )
    }
    if (!image || !(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }
    if (!pdf || !(pdf instanceof File) || pdf.size === 0) {
      return NextResponse.json({ error: "PDF is required" }, { status: 400 })
    }

    const safeBrand = brand.replace(/[^\w-]+/g, "_").toLowerCase()
    const safeModel = model.replace(/[^\w-]+/g, "_").toLowerCase()
    const stamp = Date.now()

    const imageExt = (image.name.split(".").pop() ?? "jpg").toLowerCase()
    const imageBlob = await put(
      `manuals/${safeBrand}/${safeModel}/${stamp}-image.${imageExt}`,
      image,
      { access: "public", contentType: image.type || "image/jpeg" },
    )
    uploadedPathnames.push(imageBlob.pathname)

    const pdfBlob = await put(
      `manuals/${safeBrand}/${safeModel}/${stamp}-${pdf.name.replace(/[^\w.-]+/g, "_")}`,
      pdf,
      { access: "public", contentType: "application/pdf" },
    )
    uploadedPathnames.push(pdfBlob.pathname)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("manuals")
      .insert({
        brand,
        model,
        image_url: imageBlob.url,
        image_pathname: imageBlob.pathname,
        pdf_url: pdfBlob.url,
        pdf_pathname: pdfBlob.pathname,
        pdf_filename: pdf.name,
        pdf_size: pdf.size,
      })
      .select("*")
      .single()

    if (error || !data) {
      throw error ?? new Error("Failed to insert manual row")
    }

    return NextResponse.json({ manual: rowToManual(data as ManualRow) })
  } catch (error) {
    console.error("[v0] Failed to create manual:", error)
    // Cleanup any blobs uploaded before the error
    await Promise.all(
      uploadedPathnames.map((p) =>
        del(p).catch((err) => console.error("[v0] Cleanup failed:", err)),
      ),
    )
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    )
  }
}
