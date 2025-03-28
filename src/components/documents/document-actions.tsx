"use client"

import { IconDotsVertical } from "@tabler/icons-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Document } from "./columns"
import { toast } from "sonner"

export function DocumentActions({ document }: { document: Document }) {
  const handleDelete = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)), 
      {
        loading: 'Deleting document...',
        success: 'Document deleted successfully',
        error: 'Failed to delete document',
      }
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconDotsVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(document.id)}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(document.barcode.toString())}>
          Copy Barcode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}