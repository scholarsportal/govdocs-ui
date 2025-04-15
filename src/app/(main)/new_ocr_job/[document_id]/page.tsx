"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDocumentByIdQuery, useGetDocumentImageUrlQuery } from "@/state-management/documents/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useStartTesseractOcrMutation, 
  useStartMarkerOcrMutation,
  useStartOlmOcrMutation,
  useStartSmolDoclingOcrMutation
} from "@/state-management/ocr/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function NewOcrJobPage() {
  const params = useParams();
  const documentId = params.document_id as string;
  const { data: document, isLoading: isLoadingDocument } = useGetDocumentByIdQuery(documentId);
  
  const router = useRouter();
  

  const [formData, setFormData] = useState({
    firstPage: 1,
    lastPage: 5,
    // Tesseract options
    dpi: 256,
    contrast: 1,
    // Marker options
    languages: "eng",
    forceOcr: true,
    paginateOutput: true,
    outputFormat: "text",
    // OLM options
    temperature: 0.1,
    olmDpi: 256,
    maxNewTokens: 1024,
    numReturnSequences: 1,
    // SmolDocling options
    maxPages: 10,
    targetImageDim: 1280,
    smolMaxNewTokens: 2048
  });

  // RTK Query mutations
  const [startTesseractOcr, { isLoading: isLoadingTesseract }] = useStartTesseractOcrMutation();
  const [startMarkerOcr, { isLoading: isLoadingMarker }] = useStartMarkerOcrMutation();
  const [startOlmOcr, { isLoading: isLoadingOlm }] = useStartOlmOcrMutation();
  const [startSmolDoclingOcr, { isLoading: isLoadingSmolDocling }] = useStartSmolDoclingOcrMutation();
  const { data: ImageUrl } = useGetDocumentImageUrlQuery({
    barcode: document?.barcode.toString() || '', 
    pageNumber: 1
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document) {
      toast.error("Document data is not available.");
      return;
    }

    // const requests = [];
    // const requestIds = [];
    
    try {
      // Submit all OCR requests in parallel
      const [tesseractResponse, markerResponse, olmResponse, smolDoclingResponse] = await Promise.all([
        startTesseractOcr({
          barcode: document.barcode.toString(),
          first_page: formData.firstPage,
          last_page: formData.lastPage,
          dpi: formData.dpi,
          contrast: formData.contrast
        }).unwrap(),
        
        startMarkerOcr({
          barcode: document.barcode.toString(),
          first_page: formData.firstPage,
          last_page: formData.lastPage,
          languages: formData.languages,
          force_ocr: formData.forceOcr,
          paginate_output: formData.paginateOutput,
          output_format: formData.outputFormat
        }).unwrap(),
        
        startOlmOcr({
          barcode: document.barcode.toString(),
          first_page: formData.firstPage,
          last_page: formData.lastPage,
          temperature: formData.temperature,
          dpi: formData.olmDpi,
          max_new_tokens: formData.maxNewTokens,
          num_return_sequences: formData.numReturnSequences
        }).unwrap(),
        
        startSmolDoclingOcr({
          barcode: document.barcode.toString(),
          first_page: formData.firstPage,
          last_page: formData.lastPage,
          max_pages: formData.maxPages,
          target_image_dim: formData.targetImageDim,
          max_new_tokens: formData.smolMaxNewTokens
        }).unwrap()
      ]);
      
      // Collect all request IDs
      const requestIdsArray = [
        tesseractResponse.request_id,
        markerResponse.request_id,
        olmResponse.request_id,
        smolDoclingResponse.request_id
      ];
      
      toast.success("OCR requests submitted successfully.");
      
      // Navigate to eval page with all request IDs
      router.push(`/ocr_eval/${documentId}/${requestIdsArray.join(',')}`);
      
    } catch (error) {
      console.error("Error submitting OCR requests: ", error);
      toast("Failed to submit OCR requests. Please try again.");
    }
  };

  const isLoading = isLoadingTesseract || isLoadingMarker || isLoadingOlm || isLoadingSmolDocling;

  if (isLoadingDocument) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Document not found.</p>
          <Link href="/documents" className="text-red-700 underline mt-2 block">
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New OCR Job</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{document.title}</CardTitle>
          <div className="text-sm text-gray-500">
            Barcode: {document.barcode}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="mb-4">
                <a 
                  href={document.ia_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Internet Archive
                </a>
              </p>
              
                <div className="space-y-4">
                <h3 className="text-lg font-medium">Document Preview</h3>
                
                {document && (
                  <Carousel className="w-full max-w-md mx-auto">
                  <CarouselContent>
                  <CarouselItem >
                          <div className="p-1">
                            <AspectRatio ratio={1/1}>
                              <div className="relative w-full h-full">
                                {document && <Image 
                                  src={ImageUrl || ''}
                                  alt={`Page # 1 of ${document.title}`}
                                  fill
                                  className="rounded-lg object-cover"
                                />}
                            </div>
                            </AspectRatio>
                          </div>
                          <p className="text-center text-sm text-gray-500 mt-2">Page 1</p>
                        </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                  </Carousel>
                )}
                </div>
            </div>
            
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Page Range Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstPage">First Page</Label>
                      <Input
                        id="firstPage"
                        name="firstPage"
                        type="number"
                        min="1"
                        value={formData.firstPage}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastPage">Last Page</Label>
                      <Input
                        id="lastPage"
                        name="lastPage"
                        type="number"
                        min={formData.firstPage}
                        value={formData.lastPage}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="tesseract">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="tesseract">Tesseract</TabsTrigger>
                    <TabsTrigger value="marker">Marker</TabsTrigger>
                    <TabsTrigger value="olm">OLM OCR</TabsTrigger>
                    <TabsTrigger value="smoldocling">SmolDocling</TabsTrigger>
                  </TabsList>

                  {/* Tesseract Options */}
                  <TabsContent value="tesseract" className="space-y-4">
                    <h4 className="font-medium">Tesseract OCR Options</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dpi">DPI</Label>
                        <Input
                          id="dpi"
                          name="dpi"
                          type="number"
                          min="72"
                          value={formData.dpi}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contrast">Contrast</Label>
                        <Input
                          id="contrast"
                          name="contrast"
                          type="number"
                          min="0"
                          max="3"
                          step="0.1"
                          value={formData.contrast}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Marker Options */}
                  <TabsContent value="marker" className="space-y-4">
                    <h4 className="font-medium">Marker OCR Options</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="languages">Languages</Label>
                        <Input
                          id="languages"
                          name="languages"
                          value={formData.languages}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="outputFormat">Output Format</Label>
                        <Input
                          id="outputFormat"
                          name="outputFormat"
                          value={formData.outputFormat}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="forceOcr" 
                          checked={formData.forceOcr}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(checked as boolean, 'forceOcr')
                          }
                        />
                        <Label htmlFor="forceOcr">Force OCR</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="paginateOutput" 
                          checked={formData.paginateOutput}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(checked as boolean, 'paginateOutput')
                          }
                        />
                        <Label htmlFor="paginateOutput">Paginate Output</Label>
                      </div>
                    </div>
                  </TabsContent>

                  {/* OLM OCR Options */}
                  <TabsContent value="olm" className="space-y-4">
                    <h4 className="font-medium">OLM OCR Options</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature</Label>
                        <Input
                          id="temperature"
                          name="temperature"
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={formData.temperature}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="olmDpi">DPI</Label>
                        <Input
                          id="olmDpi"
                          name="olmDpi"
                          type="number"
                          min="72"
                          value={formData.olmDpi}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxNewTokens">Max New Tokens</Label>
                        <Input
                          id="maxNewTokens"
                          name="maxNewTokens"
                          type="number"
                          min="1"
                          value={formData.maxNewTokens}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numReturnSequences">Return Sequences</Label>
                        <Input
                          id="numReturnSequences"
                          name="numReturnSequences"
                          type="number"
                          min="1"
                          value={formData.numReturnSequences}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* SmolDocling Options */}
                  <TabsContent value="smoldocling" className="space-y-4">
                    <h4 className="font-medium">SmolDocling OCR Options</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxPages">Max Pages</Label>
                        <Input
                          id="maxPages"
                          name="maxPages"
                          type="number"
                          min="1"
                          value={formData.maxPages}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetImageDim">Target Image Dimension</Label>
                        <Input
                          id="targetImageDim"
                          name="targetImageDim"
                          type="number"
                          min="256"
                          value={formData.targetImageDim}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smolMaxNewTokens">Max New Tokens</Label>
                        <Input
                          id="smolMaxNewTokens"
                          name="smolMaxNewTokens"
                          type="number"
                          min="1"
                          value={formData.smolMaxNewTokens}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting OCR Requests...
                    </>
                  ) : (
                    "Run All OCR Models"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}