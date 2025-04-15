export type OcrModel = 'tesseract' | 'marker' | 'olmocr' | 'smoldocling';

export interface OcrRequestBase {
  message: string;
  request_id: number;
  status: 'processing' | 'completed' | 'error';
  document_id: string;
  page_range: string;
}

export interface OcrJobBase {
  id: number;
  request_id: number;
  document_id: string;
  page_number: number;
  ocr_output: string;
  ocr_model: OcrModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ocr_config: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
}

export interface OcrStatusResponse {
  request_id: number;
  status: 'processing' | 'completed' | 'error';
  document_id: string;
  page_range: string;
  completed_pages: number;
  jobs: OcrJobBase[];
}

export interface OcrResultItem {
  text: string;
  page_number: number;
}

export type OcrResult = OcrResultItem[];

export interface OcrEvaluationMetric {
  ocr_job_id: number;
  format_quality: number | null;
  format_quality_comment: string | null;
  output_vs_ground_truth: number | null;
  output_vs_ground_truth_comment: string | null;
  table_parsing_capabilities: number | null;
  table_parsing_capabilities_comment: string | null;
  hallucination: number | null;
  hallucination_comment: string | null;
  evaluators_overall_comment: string | null;
  evaluation_submitted: boolean;
}

export interface OcrEvaluationSubmission extends OcrEvaluationMetric {
  evaluation_submitted: true;
  format_quality: number;
  format_quality_comment: string;
  output_vs_ground_truth: number;
  output_vs_ground_truth_comment: string;
  table_parsing_capabilities: number;
  table_parsing_capabilities_comment: string;
  hallucination: number;
  hallucination_comment: string;
}

export interface DocumentType {
  id: string;
  title: string;
  ia_link: string;
  barcode: number;
  ocr_evaluation_done: boolean;
  created_at: string;
}

export interface DocumentProcessingStatus {
  id: number;
  document_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  pages_processed: number;
  total_pages: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}