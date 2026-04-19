import { del } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: manual, error: fetchError } = await supabase
    .from("manuals")
    .select("image_url, pdf_url")
    .eq("id", id)
    .single()

  if (fetchError || !manual) {
    return NextResponse.json({ error: "Manual not found" }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from("manuals")
    .delete()
    .eq("id", id)

  if (deleteError) {
    console.error("[v0] Failed to delete manual row:", deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Best-effort blob cleanup; don't fail the request if blobs were already gone.
  await Promise.all(
    [manual.image_url, manual.pdf_url].map((url) =>
      del(url).catch((err) => console.error("[v0] Blob cleanup failed:", err)),
    ),
  )

  return NextResponse.json({ success: true })
}
