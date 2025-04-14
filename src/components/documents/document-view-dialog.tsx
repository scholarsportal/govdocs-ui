"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { IconExternalLink, IconFileText } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Document } from "./columns"
import { format } from "date-fns"
import { createClient } from "@/utils/supabase/client"
import { AspectRatio } from "../ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel"

export function DocumentViewDialog({ document }: { document: Document }) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const supabase = createClient()

  const handleOpenChange = async (open: boolean) => {
    if (open && imageUrls.length === 0) {
      // Fetch the first few images for this document
      const { data, error } = await supabase
        .storage
        .from('ia_bucket')
        .list(`${document.barcode}`, {
          limit: 5,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (data && !error) {
        const urls = await Promise.all(data.map(async (file) => {
          const { data: url } = supabase
            .storage
            .from('ia_bucket')
            .getPublicUrl(`${document.barcode}/${file.name}`)
          return url.publicUrl
        }))
        setImageUrls(urls)
      }
    }
    
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-left pl-0">
          <IconFileText className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{document.title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{document.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-subgrid gap-6 col-span-2 mt-4">
        <div>
              <p className="font-semibold">Barcode</p>
              <p className="font-mono">{document.barcode}</p>
            </div>
            <div>
              <p className="font-semibold">Added</p>
              <p>{format(new Date(document.created_at), "MMMM d, yyyy")}</p>
            </div>
            <div className="col-span-2">
              <p className="font-semibold">Internet Archive Link</p>
              <a 
                href={document.ia_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                {document.ia_link}
                <IconExternalLink className="h-4 w-4" />
              </a>
            </div>

          <h3 className="text-lg font-semibold">Document Preview</h3>
          
        </div>
        <div className="flex flex-col gap-2 justify-center">
        {imageUrls.length > 0 ? (
          <Carousel >
            <CarouselContent >
              {imageUrls.map((url, index) => (
                <CarouselItem key={index} >
                  <div className="p-1">
                    <AspectRatio ratio={1/1}>
                      <Image 
                        src={url} 
                        alt={`Page ${index + 1} of document ${document.title}`}
                        fill
                        className="rounded-lg object-cover shadow-md hover:shadow-lg transition-shadow"
                        style={{ viewTransitionName: `document-image-${document.id}-${index}` }}
                      />
                    </AspectRatio>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        ) : (
          <div className="flex items-center justify-center h-40 border rounded-md bg-muted">
            Loading document previews...
          </div>
        )}
       

        <DialogFooter className="mt-6">
          <Link href={`/new_ocr_job/${document.id}`} passHref>
            <Button>Evaluate OCR Models</Button>
          </Link>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}