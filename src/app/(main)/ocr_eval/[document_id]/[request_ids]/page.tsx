"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  useGetTesseractStatusQuery,
  useGetMarkerStatusQuery,
  useGetOlmStatusQuery,
  useGetSmolDoclingStatusQuery,
  useGetTesseractResultQuery,
  useGetMarkerResultQuery,
  useGetOlmResultQuery,
  useGetSmolDoclingResultQuery,
  useSubmitOcrEvaluationMutation
} from "@/state-management/ocr/api";
import { useGetDocumentByIdQuery } from "@/state-management/documents/api";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { OcrJobBase, OcrModel, OcrEvaluationSubmission } from "@/types/ocr.types";

// Initialize Supabase client for realtime subscriptions
const supabase = createClient();

export default function OcrEvalPage({ 
  params 
}: { 
  params: { document_id: string; request_ids: string } 
}) {
  const documentId = params.document_id;
  const requestIdsString = params.request_ids;
  const requestIds = requestIdsString.split(',').map(id => parseInt(id, 10));
  
  const router = useRouter();
  
  // Document data
  const { data: document, isLoading: isLoadingDocument } = useGetDocumentByIdQuery(documentId);
  
  // State for image carousel
  const [currentPage, setCurrentPage] = useState(1);
  const [pageRange, setPageRange] = useState<[number, number]>([1, 1]);
  
  // State for evaluation forms
  const [evaluations, setEvaluations] = useState<Record<string, Record<number, Partial<OcrEvaluationSubmission>>>>({
    tesseract: {},
    marker: {},
    olmocr: {},
    smoldocling: {}
  });
  
  // RTK Query for OCR statuses
  const { data: tesseractStatus, isLoading: isLoadingTesseractStatus } = 
    useGetTesseractStatusQuery(requestIds[0], { pollingInterval: 3000 });
  const { data: markerStatus, isLoading: isLoadingMarkerStatus } = 
    useGetMarkerStatusQuery(requestIds[1], { pollingInterval: 3000 });
  const { data: olmStatus, isLoading: isLoadingOlmStatus } = 
    useGetOlmStatusQuery(requestIds[2], { pollingInterval: 3000 });
  const { data: smolDoclingStatus, isLoading: isLoadingSmolDoclingStatus } = 
    useGetSmolDoclingStatusQuery(requestIds[3], { pollingInterval: 3000 });
  
  // RTK Query for OCR results
  const { data: tesseractResult } = 
    useGetTesseractResultQuery(requestIds[0], { skip: tesseractStatus?.status !== 'completed' });
  const { data: markerResult } = 
    useGetMarkerResultQuery(requestIds[1], { skip: markerStatus?.status !== 'completed' });
  const { data: olmResult } = 
    useGetOlmResultQuery(requestIds[2], { skip: olmStatus?.status !== 'completed' });
  const { data: smolDoclingResult } = 
    useGetSmolDoclingResultQuery(requestIds[3], { skip: smolDoclingStatus?.status !== 'completed' });
  
  // RTK Query for evaluation submission
  const [submitEvaluation, { isLoading: isSubmittingEvaluation }] = useSubmitOcrEvaluationMutation();

  // Set up realtime subscriptions for OCR jobs
  useEffect(() => {
    const channel = supabase
      .channel('ocr-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ocr_jobs',
          filter: `document_id=eq.${documentId}`
        },
        (payload) => {
          console.log('Change received!', payload);
          // We'll let RTK Query handle the refetching with polling
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  // Extract page range from the first completed OCR status
  useEffect(() => {
    const firstCompletedStatus = [tesseractStatus, markerStatus, olmStatus, smolDoclingStatus]
      .find(status => status && status.page_range);
    
    if (firstCompletedStatus && firstCompletedStatus.page_range) {
      const [first, last] = firstCompletedStatus.page_range.split('-').map(n => parseInt(n, 10));
      setPageRange([first, last]);
      setCurrentPage(first);
    }
  }, [tesseractStatus, markerStatus, olmStatus, smolDoclingStatus]);

  // Extract OCR results for the current page
  const getCurrentPageOcrResults = () => {
    return {
      tesseract: tesseractResult?.find(r => r.page_number === currentPage)?.text || "",
      marker: markerResult?.find(r => r.page_number === currentPage)?.text || "",
      olmocr: olmResult?.find(r => r.page_number === currentPage)?.text || "",
      smoldocling: smolDoclingResult?.find(r => r.page_number === currentPage)?.text || ""
    };
  };

  // Extract job IDs for the current page
  const getCurrentPageJobIds = () => {
    return {
      tesseract: tesseractStatus?.jobs.find(j => j.page_number === currentPage)?.id,
      marker: markerStatus?.jobs.find(j => j.page_number === currentPage)?.id,
      olmocr: olmStatus?.jobs.find(j => j.page_number === currentPage)?.id,
      smoldocling: smolDoclingStatus?.jobs.find(j => j.page_number === currentPage)?.id
    };
  };

  // Find submitted evaluations
  const getSubmittedEvaluations = (jobIds: Record<OcrModel, number | undefined>) => {
    return {
      tesseract: !!jobIds.tesseract && evaluations.tesseract[jobIds.tesseract]?.evaluation_submitted,
      marker: !!jobIds.marker && evaluations.marker[jobIds.marker]?.evaluation_submitted,
      olmocr: !!jobIds.olmocr && evaluations.olmocr[jobIds.olmocr]?.evaluation_submitted,
      smoldocling: !!jobIds.smoldocling && evaluations.smoldocling[jobIds.smoldocling]?.evaluation_submitted
    };
  };

  // Handle evaluation input changes
  const handleEvaluationChange = (
    model: OcrModel, 
    jobId: number | undefined, 
    field: keyof OcrEvaluationSubmission, 
    value: any
  ) => {
    if (!jobId) return;
    
    setEvaluations(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        [jobId]: {
          ...prev[model][jobId],
          [field]: value,
          ocr_job_id: jobId
        }
      }
    }));
  };

  // Handle evaluation form submission
  const handleSubmitEvaluation = async (model: OcrModel, jobId: number | undefined) => {
    if (!jobId) {
      toast.error("Cannot submit evaluation: Job ID is missing");
      return;
    }
    
    const evaluation = evaluations[model][jobId];
    
    // Check if all required fields are filled
    const requiredFields: (keyof OcrEvaluationSubmission)[] = [
      'format_quality',
      'format_quality_comment',
      'output_vs_ground_truth',
      'output_vs_ground_truth_comment',
      'table_parsing_capabilities',
      'table_parsing_capabilities_comment',
      'hallucination',
      'hallucination_comment',
      'evaluators_overall_comment'
    ];
    
    const missingFields = requiredFields.filter(field => !evaluation[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      await submitEvaluation({
        ...evaluation,
        evaluation_submitted: true,
        ocr_job_id: jobId,
        format_quality: evaluation.format_quality as number,
        format_quality_comment: evaluation.format_quality_comment as string,
        output_vs_ground_truth: evaluation.output_vs_ground_truth as number,
        output_vs_ground_truth_comment: evaluation.output_vs_ground_truth_comment as string,
        table_parsing_capabilities: evaluation.table_parsing_capabilities as number,
        table_parsing_capabilities_comment: evaluation.table_parsing_capabilities_comment as string,
        hallucination: evaluation.hallucination as number,
        hallucination_comment: evaluation.hallucination_comment as string,
        evaluators_overall_comment: evaluation.evaluators_overall_comment as string
      } as OcrEvaluationSubmission).unwrap();
      
      toast.error(`Evaluation for ${model.toUpperCase()} submitted successfully`);
      
      // Mark as submitted in local state too
      setEvaluations(prev => ({
        ...prev,
        [model]: {
          ...prev[model],
          [jobId]: {
            ...prev[model][jobId],
            evaluation_submitted: true
          }
        }
      }));
      
    } catch (error) {
      console.error(`Error submitting evaluation for ${model}:`, error);
      toast.error(`Failed to submit evaluation for ${model.toUpperCase()}`);
    }
  };

  // Check if all OCR processes are complete
  const isAllOcrCompleted = (
    tesseractStatus?.status === 'completed' &&
    markerStatus?.status === 'completed' &&
    olmStatus?.status === 'completed' &&
    smolDoclingStatus?.status === 'completed'
  );

  // Check if any OCR process is still running
  const isAnyOcrProcessing = (
    tesseractStatus?.status === 'processing' ||
    markerStatus?.status === 'processing' ||
    olmStatus?.status === 'processing' ||
    smolDoclingStatus?.status === 'processing'
  );

  // Check if all evaluations for current page are submitted
  const areAllEvaluationsSubmitted = () => {
    const jobIds = getCurrentPageJobIds();
    const submitted = getSubmittedEvaluations(jobIds);
    return (
      submitted.tesseract &&
      submitted.marker &&
      submitted.olmocr &&
      submitted.smoldocling
    );
  };

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

  const ocrResults = getCurrentPageOcrResults();
  const jobIds = getCurrentPageJobIds();
  const submitted = getSubmittedEvaluations(jobIds);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">OCR Evaluation</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{document.title}</CardTitle>
          <CardDescription>
            <span className="block">Barcode: {document.barcode}</span>
            <span className="block">Page Range: {pageRange[0]}-{pageRange[1]}</span>
            <span className="block">Current Page: {currentPage}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatusCard 
              title="Tesseract" 
              status={tesseractStatus?.status} 
              completedPages={tesseractStatus?.completed_pages}
              totalPages={(pageRange[1] - pageRange[0] + 1) || 0}
              requestId={requestIds[0]}
            />
            <StatusCard 
              title="Marker" 
              status={markerStatus?.status} 
              completedPages={markerStatus?.completed_pages}
              totalPages={(pageRange[1] - pageRange[0] + 1) || 0}
              requestId={requestIds[1]}
            />
            <StatusCard 
              title="OLM OCR" 
              status={olmStatus?.status} 
              completedPages={olmStatus?.completed_pages}
              totalPages={(pageRange[1] - pageRange[0] + 1) || 0}
              requestId={requestIds[2]}
            />
            <StatusCard 
              title="SmolDocling" 
              status={smolDoclingStatus?.status} 
              completedPages={smolDoclingStatus?.completed_pages}
              totalPages={(pageRange[1] - pageRange[0] + 1) || 0}
              requestId={requestIds[3]}
            />
          </div>

          {/* Image carousel */}
          <div className="mb-8">
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {Array.from({ length: pageRange[1] - pageRange[0] + 1 }).map((_, index) => (
                  <CarouselItem key={index} onClick={() => setCurrentPage(pageRange[0] + index)}>
                    <div className="p-1">
                      <div className={`bg-gray-100 rounded-md overflow-hidden ${currentPage === pageRange[0] + index ? 'ring-2 ring-blue-500' : ''}`}>
                        <Image 
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ia_bucket/${document.id}/${pageRange[0] + index}.png`}
                          alt={`Page ${pageRange[0] + index} of ${document.title}`}
                          width={800}
                          height={1200}
                          className="mx-auto object-contain cursor-pointer"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <div className="text-center mt-4">
              <span className="font-medium">Page {currentPage} of {pageRange[1]}</span>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  const newPage = Math.max(pageRange[0], currentPage - 1);
                  setCurrentPage(newPage);
                }}
                disabled={currentPage === pageRange[0]}
                size="sm"
              >
                Previous Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const newPage = Math.min(pageRange[1], currentPage + 1);
                  setCurrentPage(newPage);
                }}
                disabled={currentPage === pageRange[1]}
                size="sm"
              >
                Next Page
              </Button>
            </div>
          </div>

          {isAnyOcrProcessing && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-8 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-yellow-500" />
              <p>OCR processing in progress. Results will appear here as they are completed.</p>
            </div>
          )}

          {/* OCR Results and Evaluation Forms */}
          <Tabs defaultValue="tesseract" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="tesseract" disabled={!tesseractResult}>Tesseract</TabsTrigger>
              <TabsTrigger value="marker" disabled={!markerResult}>Marker</TabsTrigger>
              <TabsTrigger value="olm" disabled={!olmResult}>OLM OCR</TabsTrigger>
              <TabsTrigger value="smoldocling" disabled={!smolDoclingResult}>SmolDocling</TabsTrigger>
            </TabsList>

            {/* Tesseract Results */}
            <TabsContent value="tesseract">
              <OcrResultAndEvaluationForm
                title="Tesseract OCR Results"
                modelName="tesseract"
                jobId={jobIds.tesseract}
                ocrText={ocrResults.tesseract}
                evaluation={jobIds.tesseract ? evaluations.tesseract[jobIds.tesseract] || {} : {}}
                isSubmitted={submitted.tesseract!}
                isOcrCompleted={tesseractStatus?.status === 'completed'}
                onChange={(field, value) => handleEvaluationChange('tesseract', jobIds.tesseract, field, value)}
                onSubmit={() => handleSubmitEvaluation('tesseract', jobIds.tesseract)}
                isSubmitting={isSubmittingEvaluation}
              />
            </TabsContent>

            {/* Marker Results */}
            <TabsContent value="marker">
              <OcrResultAndEvaluationForm
                title="Marker OCR Results"
                modelName="marker"
                jobId={jobIds.marker}
                ocrText={ocrResults.marker}
                evaluation={jobIds.marker ? evaluations.marker[jobIds.marker] || {} : {}}
                isSubmitted={submitted.marker!}
                isOcrCompleted={markerStatus?.status === 'completed'}
                onChange={(field, value) => handleEvaluationChange('marker', jobIds.marker, field, value)}
                onSubmit={() => handleSubmitEvaluation('marker', jobIds.marker)}
                isSubmitting={isSubmittingEvaluation}
              />
            </TabsContent>

            {/* OLM Results */}
            <TabsContent value="olm">
              <OcrResultAndEvaluationForm
                title="OLM OCR Results"
                modelName="olmocr"
                jobId={jobIds.olmocr}
                ocrText={ocrResults.olmocr}
                evaluation={jobIds.olmocr ? evaluations.olmocr[jobIds.olmocr] || {} : {}}
                isSubmitted={submitted.olmocr!}
                isOcrCompleted={olmStatus?.status === 'completed'}
                onChange={(field, value) => handleEvaluationChange('olmocr', jobIds.olmocr, field, value)}
                onSubmit={() => handleSubmitEvaluation('olmocr', jobIds.olmocr)}
                isSubmitting={isSubmittingEvaluation}
              />
            </TabsContent>

            {/* SmolDocling Results */}
            <TabsContent value="smoldocling">
              <OcrResultAndEvaluationForm
                title="SmolDocling OCR Results"
                modelName="smoldocling"
                jobId={jobIds.smoldocling}
                ocrText={ocrResults.smoldocling}
                evaluation={jobIds.smoldocling ? evaluations.smoldocling[jobIds.smoldocling] || {} : {}}
                isSubmitted={submitted.smoldocling!}
                isOcrCompleted={smolDoclingStatus?.status === 'completed'}
                onChange={(field, value) => handleEvaluationChange('smoldocling', jobIds.smoldocling, field, value)}
                onSubmit={() => handleSubmitEvaluation('smoldocling', jobIds.smoldocling)}
                isSubmitting={isSubmittingEvaluation}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              const newPage = Math.max(pageRange[0], currentPage - 1);
              setCurrentPage(newPage);
            }}
            disabled={currentPage === pageRange[0]}
          >
            Previous Page
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const newPage = Math.min(pageRange[1], currentPage + 1);
              setCurrentPage(newPage);
            }}
            disabled={currentPage === pageRange[1]}
          >
            Next Page
          </Button>
        </CardFooter>
      </Card>

      {/* Navigation buttons at the bottom */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/new_ocr_job/${documentId}`}>
            Start New OCR Job
          </Link>
        </Button>
        <Button asChild>
          <Link href="/ocr_jobs">
            View All OCR Jobs
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Status Card Component
interface StatusCardProps {
  title: string;
  status?: 'processing' | 'completed' | 'error';
  completedPages?: number;
  totalPages: number;
  requestId: number;
}

function StatusCard({ title, status, completedPages, totalPages, requestId }: StatusCardProps) {
  let statusColor = "bg-gray-100";
  let statusText = "Not Started";
  let progress = 0;

  if (status === 'processing') {
    statusColor = "bg-yellow-100";
    statusText = "Processing";
    progress = completedPages ? (completedPages / totalPages) * 100 : 0;
  } else if (status === 'completed') {
    statusColor = "bg-green-100";
    statusText = "Completed";
    progress = 100;
  } else if (status === 'error') {
    statusColor = "bg-red-100";
    statusText = "Error";
  }

  return (
    <div className={`p-4 rounded-md ${statusColor}`}>
      <h3 className="font-medium">{title}</h3>
      <div className="flex justify-between mt-1">
        <span className="text-sm">{statusText}</span>
        <span className="text-sm">ID: {requestId}</span>
      </div>
      {status === 'processing' && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-yellow-400 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

// OCR Result and Evaluation Form Component
interface OcrResultAndEvaluationFormProps {
  title: string;
  modelName: OcrModel;
  jobId?: number;
  ocrText: string;
  evaluation: Partial<OcrEvaluationSubmission>;
  isSubmitted: boolean;
  isOcrCompleted: boolean;
  onChange: (field: keyof OcrEvaluationSubmission, value: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function OcrResultAndEvaluationForm({
  title,
  modelName,
  jobId,
  ocrText,
  evaluation,
  isSubmitted,
  isOcrCompleted,
  onChange,
  onSubmit,
  isSubmitting
}: OcrResultAndEvaluationFormProps) {
  if (!isOcrCompleted) {
    return (
      <div className="p-6 bg-gray-50 rounded-md flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <p>Waiting for OCR results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <div className="bg-gray-50 p-4 rounded-md border max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm">{ocrText || "No OCR text available"}</pre>
        </div>
      </div>

      {jobId && (
        <div className={`rounded-md p-6 ${isSubmitted ? 'bg-green-50' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-medium mb-4">
            {isSubmitted ? "Evaluation Submitted" : "Evaluate OCR Quality"}
          </h3>

          <fieldset disabled={isSubmitted} className="space-y-6">
            {/* Format Quality */}
            <div className="space-y-2">
              <Label className="font-medium">Format Quality (1-5)</Label>
              <p className="text-sm text-gray-600 mb-2">
                How well did the OCR model preserve the original document's formatting?
              </p>
              <RadioGroup 
                value={evaluation.format_quality?.toString()} 
                onValueChange={(value) => onChange('format_quality', parseInt(value))}
                className="flex space-x-4"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex items-center space-x-1">
                    <RadioGroupItem value={value.toString()} id={`format-quality-${value}`} />
                    <Label htmlFor={`format-quality-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Textarea 
                value={evaluation.format_quality_comment || ''} 
                onChange={(e) => onChange('format_quality_comment', e.target.value)}
                placeholder="Comment on format quality..."
                className="mt-2"
              />
            </div>

            {/* Output vs Ground Truth */}
            <div className="space-y-2">
              <Label className="font-medium">Output vs Ground Truth (1-5)</Label>
              <p className="text-sm text-gray-600 mb-2">
                How accurately does the OCR output match the visible text in the document?
              </p>
              <RadioGroup 
                value={evaluation.output_vs_ground_truth?.toString()}
                onValueChange={(value) => onChange('output_vs_ground_truth', parseInt(value))}
                className="flex space-x-4"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex items-center space-x-1">
                    <RadioGroupItem value={value.toString()} id={`output-truth-${value}`} />
                    <Label htmlFor={`output-truth-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Textarea 
                value={evaluation.output_vs_ground_truth_comment || ''} 
                onChange={(e) => onChange('output_vs_ground_truth_comment', e.target.value)}
                placeholder="Comment on accuracy..."
                className="mt-2"
              />
            </div>

            {/* Table Parsing */}
            <div className="space-y-2">
              <Label className="font-medium">Table Parsing Capabilities (1-5)</Label>
              <p className="text-sm text-gray-600 mb-2">
                How well did the OCR model handle tables and structured content?
              </p>
              <RadioGroup 
                value={evaluation.table_parsing_capabilities?.toString()}
                onValueChange={(value) => onChange('table_parsing_capabilities', parseInt(value))}
                className="flex space-x-4"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex items-center space-x-1">
                    <RadioGroupItem value={value.toString()} id={`table-parsing-${value}`} />
                    <Label htmlFor={`table-parsing-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Textarea 
                value={evaluation.table_parsing_capabilities_comment || ''} 
                onChange={(e) => onChange('table_parsing_capabilities_comment', e.target.value)}
                placeholder="Comment on table parsing..."
                className="mt-2"
              />
            </div>

            {/* Hallucination */}
            <div className="space-y-2">
              <Label className="font-medium">Hallucination (1-5)</Label>
              <p className="text-sm text-gray-600 mb-2">
                Did the model add content that wasn't in the original document?
                (1 = many hallucinations, 5 = no hallucinations)
              </p>
              <RadioGroup 
                value={evaluation.hallucination?.toString()}
                onValueChange={(value) => onChange('hallucination', parseInt(value))}
                className="flex space-x-4"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex items-center space-x-1">
                    <RadioGroupItem value={value.toString()} id={`hallucination-${value}`} />
                    <Label htmlFor={`hallucination-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Textarea 
                value={evaluation.hallucination_comment || ''} 
                onChange={(e) => onChange('hallucination_comment', e.target.value)}
                placeholder="Comment on hallucinations..."
                className="mt-2"
              />
            </div>

            {/* Overall Comments */}
            <div className="space-y-2">
              <Label className="font-medium">Overall Evaluation</Label>
              <Textarea 
                value={evaluation.evaluators_overall_comment || ''} 
                onChange={(e) => onChange('evaluators_overall_comment', e.target.value)}
                placeholder="Provide your overall assessment of this OCR model's performance..."
                className="mt-2"
                rows={4}
              />
            </div>

            {!isSubmitted && (
              <Button 
                type="button" 
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Evaluation...
                  </>
                ) : (
                  "Submit Evaluation"
                )}
              </Button>
            )}
          </fieldset>

          {isSubmitted && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <p className="text-green-800">
                Evaluation for {modelName.toUpperCase()} has been submitted successfully.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}