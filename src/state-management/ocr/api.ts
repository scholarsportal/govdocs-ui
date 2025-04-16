import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  OcrRequestBase, 
  OcrStatusResponse, 
  OcrResult, 
  OcrEvaluationSubmission,
  DocumentType
} from '@/types/ocr.types';

// Base API for OCR endpoints
export const ocrApi = createApi({
  reducerPath: 'ocrApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000' }),
  tagTypes: ['OcrRequest', 'OcrJob', 'Document', 'OcrEvaluation'],
  endpoints: (builder) => ({
    // Document endpoints
    getDocuments: builder.query<DocumentType[], void>({
      query: () => '/documents',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Document' as const, id })),
              { type: 'Document', id: 'LIST' }
            ]
          : [{ type: 'Document', id: 'LIST' }]
    }),
    
    getDocumentById: builder.query<DocumentType, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Document', id }]
    }),
    
    // Tesseract OCR endpoints
    startTesseractOcr: builder.mutation<OcrRequestBase, {
      barcode: string;
      first_page: number;
      last_page: number;
      dpi?: number;
      contrast?: number;
    }>({
      query: (params) => ({
        url: '/tesseract',
        method: 'GET',
        params
      }),
      invalidatesTags: [{ type: 'OcrRequest', id: 'LIST' }]
    }),
    
    getTesseractStatus: builder.query<OcrStatusResponse, number>({
      query: (requestId) => `/tesseract/status/${requestId}`,
      providesTags: (result, error, requestId) => [
        { type: 'OcrRequest', id: requestId },
        ...(result?.jobs || []).map(job => ({ 
          type: 'OcrJob' as const, 
          id: job.id 
        }))
      ]
    }),
    
    getTesseractResult: builder.query<OcrResult, number>({
      query: (requestId) => `/tesseract/result/${requestId}`
    }),
    
    // Marker OCR endpoints
    startMarkerOcr: builder.mutation<OcrRequestBase, {
      barcode: string;
      first_page: number;
      last_page: number;
      languages?: string;
      force_ocr?: boolean;
      paginate_output?: boolean;
      output_format?: string;
    }>({
      query: (params) => ({
        url: '/marker',
        method: 'GET',
        params
      }),
      invalidatesTags: [{ type: 'OcrRequest', id: 'LIST' }]
    }),
    
    getMarkerStatus: builder.query<OcrStatusResponse, number>({
      query: (requestId) => `/marker/status/${requestId}`,
      providesTags: (result, error, requestId) => [
        { type: 'OcrRequest', id: requestId },
        ...(result?.jobs || []).map(job => ({ 
          type: 'OcrJob' as const, 
          id: job.id 
        }))
      ]
    }),
    
    getMarkerResult: builder.query<OcrResult, number>({
      query: (requestId) => `/marker/result/${requestId}`
    }),
    
    // OLM OCR endpoints
    startOlmOcr: builder.mutation<OcrRequestBase, {
      barcode: string;
      first_page: number;
      last_page: number;
      temperature?: number;
      dpi?: number;
      max_new_tokens?: number;
      num_return_sequences?: number;
    }>({
      query: (params) => ({
        url: '/olmocr',
        method: 'GET',
        params
      }),
      invalidatesTags: [{ type: 'OcrRequest', id: 'LIST' }]
    }),
    
    getOlmStatus: builder.query<OcrStatusResponse, number>({
      query: (requestId) => `/olmocr/status/${requestId}`,
      providesTags: (result, error, requestId) => [
        { type: 'OcrRequest', id: requestId },
        ...(result?.jobs || []).map(job => ({ 
          type: 'OcrJob' as const, 
          id: job.id 
        }))
      ]
    }),
    
    getOlmResult: builder.query<OcrResult, number>({
      query: (requestId) => `/olmocr/result/${requestId}`
    }),
    
    // SmolDocling OCR endpoints
    startSmolDoclingOcr: builder.mutation<OcrRequestBase, {
      barcode: string;
      first_page: number;
      last_page: number;
      max_pages?: number;
      target_image_dim?: number;
      max_new_tokens?: number;
    }>({
      query: (params) => ({
        url: '/smoldocling',
        method: 'GET',
        params
      }),
      invalidatesTags: [{ type: 'OcrRequest', id: 'LIST' }]
    }),
    
    getSmolDoclingStatus: builder.query<OcrStatusResponse, number>({
      query: (requestId) => `/smoldocling/status/${requestId}`,
      providesTags: (result, error, requestId) => [
        { type: 'OcrRequest', id: requestId },
        ...(result?.jobs || []).map(job => ({ 
          type: 'OcrJob' as const, 
          id: job.id 
        }))
      ]
    }),
    
    getSmolDoclingResult: builder.query<OcrResult, number>({
      query: (requestId) => `/smoldocling/result/${requestId}`
    }),
    
    // OCR Evaluation endpoints
    submitOcrEvaluation: builder.mutation<void, OcrEvaluationSubmission>({
      query: (evaluation) => ({
        url: '/ocr_evaluation',
        method: 'POST',
        body: evaluation
      }),
      invalidatesTags: (result, error, { ocr_job_id }) => [
        { type: 'OcrJob', id: ocr_job_id },
        { type: 'OcrEvaluation', id: ocr_job_id }
      ]
    }),
    
    // OCR Jobs endpoint to get all jobs for a document
    getOcrJobsByDocumentId: builder.query<OcrStatusResponse[], string>({
      query: (documentId) => `/ocr_jobs/document/${documentId}`,
      providesTags: (result) => 
        result 
          ? [
              ...result.flatMap(status => 
                status.jobs.map(job => ({ 
                  type: 'OcrJob' as const, 
                  id: job.id 
                }))
              ),
              { type: 'OcrJob', id: 'LIST' }
            ]
          : [{ type: 'OcrJob', id: 'LIST' }]
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // // Document hooks
  // useGetDocumentsQuery,
  // useGetDocumentByIdQuery,
  
  // Tesseract hooks
  useStartTesseractOcrMutation,
  useGetTesseractStatusQuery,
  useGetTesseractResultQuery,
  
  // Marker hooks
  useStartMarkerOcrMutation,
  useGetMarkerStatusQuery,
  useGetMarkerResultQuery,
  
  // OLM hooks
  useStartOlmOcrMutation,
  useGetOlmStatusQuery,
  useGetOlmResultQuery,
  
  // SmolDocling hooks
  useStartSmolDoclingOcrMutation,
  useGetSmolDoclingStatusQuery,
  useGetSmolDoclingResultQuery,
  
  // Evaluation hooks
  useSubmitOcrEvaluationMutation,
  
  // OCR Jobs hooks
  useGetOcrJobsByDocumentIdQuery,
} = ocrApi;