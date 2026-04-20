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

  // Fetch ONU and all its images
  const { data: onu, error: fetchError } = await supabase
    .from("onus")
    .select("id, onu_images(image_url)")
    .eq("id", id)
    .single()

  if (fetchError || !onu) {
    return NextResponse.json({ error: "ONU not found" }, { status: 404 })
  }

  // Delete the ONU (cascade will delete onu_images rows)
  const { error: deleteError } = await supabase
    .from("onus")
    .delete()
    .eq("id", id)

  if (deleteError) {
    console.error("[v0] Failed to delete ONU row:", deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Best-effort blob cleanup
  const blobUrls = ((onu.onu_images as { image_url: string }[]) || []).map(
    (img) => img.image_url,
  )
  await Promise.all(
    blobUrls.map((url) =>
      del(url).catch((err) => console.error("[v0] Blob cleanup failed:", err)),
    ),
  )

  return NextResponse.json({ success: true })
}
