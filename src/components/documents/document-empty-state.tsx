import { IconFileOff } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function DocumentsEmptyState({ error }: { error?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <IconFileOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
      <p className="mt-2 text-center text-muted-foreground">
        {error 
          ? "There was an error loading documents. Please try again." 
          : "Get started by adding your first document for OCR evaluation."}
      </p>
      <Button className="mt-4">
        Add your first document
      </Button>
    </div>
  )
}