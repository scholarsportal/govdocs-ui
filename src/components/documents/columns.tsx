"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconEye, IconExternalLink } from "@tabler/icons-react"

import { DocumentActions } from "./document-actions"
import { DocumentViewDialog } from "./document-view-dialog"

export type Document = {
  id: string
  title: string
  ia_link: string
  barcode: number
  created_at: string
}

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: "Document Title",
    cell: ({ row }) => {
      return (
        <div className="flex max-w-[500px] items-center">
          <DocumentViewDialog document={row.original} />
        </div>
      )
    },
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => {
      return <div className="font-mono text-sm">{row.original.barcode}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: "Added",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.created_at), "MMM d, yyyy")}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Link href={`/ocr-evaluation/${row.original.barcode}`} passHref>
            <Button size="sm" variant="outline">
              <IconEye className="h-4 w-4 mr-1" />
              Evaluate
            </Button>
          </Link>
          <a 
            href={row.original.ia_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            <IconExternalLink className="h-4 w-4" />
            <span className="sr-only">View Original</span>
          </a>
          <DocumentActions document={row.original} />
        </div>
      )
    },
  },
]