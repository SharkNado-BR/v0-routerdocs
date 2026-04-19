"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Manual } from "@/lib/types"

type Props = {
  manual: Manual | null
  onOpenChange: (open: boolean) => void
}

export function PdfViewer({ manual, onOpenChange }: Props) {
  return (
    <Dialog open={!!manual} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-5xl flex-col gap-3 p-4 sm:p-5">
        <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <DialogTitle className="truncate pr-8">
            {manual ? `${manual.brand} ${manual.model}` : "Manual"}
          </DialogTitle>
        </DialogHeader>
        <div className="h-full w-full overflow-hidden rounded-md border border-border bg-muted">
          {manual ? (
            <iframe
              src={manual.pdfUrl}
              title={`Manual ${manual.brand} ${manual.model}`}
              className="h-full w-full"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
