/*
This page will display all the ocr requests submitted. Clicking on the ocr request will direct to the /ocr_eval/{document_id}/{request_ids} page for evaluation submission
*/

"use client";

import { useState } from "react";
import { useGetAllDocumentsQuery } from "@/state-management/documents/api";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useGetAllOcrJobsQuery } from "@/state-management/ocr_jobs/ocr";
import { format } from "date-fns";
import { Search, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";


export default function OcrJobsPage() {
  const { data: ocrJobs, isLoading, error } = useGetAllOcrJobsQuery();
  const { data: documents } = useGetAllDocumentsQuery();
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState<string | null>(null);

  // Group OCR jobs by request ID
  const groupedJobs = ocrJobs?.reduce<Record<number, typeof ocrJobs>>((acc, job) => {
    if (!acc[job.request_id]) {
      acc[job.request_id] = [];
    }
    acc[job.request_id].push(job);
    return acc;
  }, {}) || {};

  // Get unique request IDs
  const requestIds = Object.keys(groupedJobs).map(id => parseInt(id, 10));

  // Extract documents mapping
  const documentsMap = documents?.reduce<Record<string, typeof documents[0]>>((acc, doc) => {
    acc[doc.id] = doc;
    return acc;
  }, {}) || {};

  // Apply filters
  const filteredRequestIds = requestIds.filter(requestId => {
    const jobs = groupedJobs[requestId];
    if (!jobs?.length) return false;
    
    // Search query filter
    if (searchQuery) {
      const documentId = jobs[0].document_id;
      const document = documentsMap[documentId];
      
      const searchLower = searchQuery.toLowerCase();
      if (document && (
        document.title.toLowerCase().includes(searchLower) ||
        document.barcode.toString().includes(searchLower)
      )) {
        return true;
      }
      
      if (requestId.toString().includes(searchLower)) {
        return true;
      }
      
      if (jobs.some(job => 
        job.page_number.toString().includes(searchLower) ||
        job.ocr_output.toLowerCase().includes(searchLower)
      )) {
        return true;
      }
      
      return false;
    }
    
    // Status filter
    if (statusFilter) {
      const allJobsHaveStatus = jobs.every(job => job.status === statusFilter);
      if (!allJobsHaveStatus) return false;
    }
    
    // Model filter
    if (modelFilter) {
      const hasJobWithModel = jobs.some(job => job.ocr_model === modelFilter);
      if (!hasJobWithModel) return false;
    }
    
    return true;
  });

  // Helper to determine overall status
  const getRequestStatus = (jobs: typeof ocrJobs) => {
    if (!jobs?.length) return 'unknown';
    
    if (jobs.some(job => job.status === 'error')) return 'error';
    if (jobs.some(job => job.status === 'processing')) return 'processing';
    if (jobs.some(job => job.status === 'pending')) return 'pending';
    return 'completed';
  };

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      // to-do: errors should be logged at least
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">OCR Jobs</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">OCR Jobs</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Failed to load OCR jobs. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">OCR Jobs</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter!} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={modelFilter!} onValueChange={(value) => setModelFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="OCR Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Models</SelectItem>
                  <SelectItem value="tesseract">Tesseract</SelectItem>
                  <SelectItem value="marker">Marker</SelectItem>
                  <SelectItem value="olmocr">OLM OCR</SelectItem>
                  <SelectItem value="smoldocling">SmolDocling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setStatusFilter(null);
                setModelFilter(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {filteredRequestIds.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-gray-500">No OCR jobs found that match your filters.</p>
              <Button asChild className="mt-4">
                <Link href="/documents">Start New OCR Job</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>OCR Requests</CardTitle>
            <CardDescription>
              {filteredRequestIds.length} request{filteredRequestIds.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Models</TableHead>
                  <TableHead>Page Range</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequestIds.map((requestId) => {
                  const jobs = groupedJobs[requestId];
                  const firstJob = jobs[0];
                  const document = documentsMap[firstJob.document_id];
                  const status = getRequestStatus(jobs);
                  const models = Array.from(new Set(jobs.map(job => job.ocr_model)));
                  
                  // Extract page range
                  const pageNumbers = jobs.map(job => job.page_number);
                  const minPage = Math.min(...pageNumbers);
                  const maxPage = Math.max(...pageNumbers);
                  const pageRange = minPage === maxPage 
                    ? `Page ${minPage}` 
                    : `Pages ${minPage}-${maxPage}`;
                  
                  return (
                    <TableRow key={requestId}>
                      <TableCell className="font-medium">{requestId}</TableCell>
                      <TableCell>
                        {document ? (
                          <Link 
                            href={`/documents/${document.id}`}
                            className="text-blue-500 hover:underline"
                          >
                            {document.title}
                          </Link>
                        ) : (
                          `Document ${firstJob.document_id}`
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {models.map(model => (
                            <Badge key={model} variant="outline">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{pageRange}</TableCell>
                      <TableCell>{formatDate(firstJob.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm">
                          <Link href={`/ocr_eval/${firstJob.document_id}/${requestId}`}>
                            {status === 'completed' ? 'Evaluate' : 'View Status'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/documents">
                Back to Documents
              </Link>
            </Button>
            <p className="text-sm text-gray-500">
              Showing {filteredRequestIds.length} of {requestIds.length} OCR requests
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}