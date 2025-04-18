export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_users: {
        Row: {
          avatar_id: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          position_title: string | null
          updated_at: string
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          position_title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          position_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_processing: {
        Row: {
          created_at: string
          document_id: string
          error_message: string | null
          id: number
          pages_processed: number
          status: string
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          error_message?: string | null
          id?: number
          pages_processed?: number
          status: string
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          error_message?: string | null
          id?: number
          pages_processed?: number
          status?: string
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          barcode: number
          created_at: string
          ia_link: string
          id: string
          ocr_evaluation_done: boolean
          title: string
        }
        Insert: {
          barcode: number
          created_at?: string
          ia_link: string
          id?: string
          ocr_evaluation_done?: boolean
          title: string
        }
        Update: {
          barcode?: number
          created_at?: string
          ia_link?: string
          id?: string
          ocr_evaluation_done?: boolean
          title?: string
        }
        Relationships: []
      }
      ocr_evaluation_metrics: {
        Row: {
          created_at: string
          evaluation_submitted: boolean
          evaluation_submitted_by: string
          evaluators_overall_comment: string | null
          format_quality: number | null
          format_quality_comment: string | null
          hallucination: number | null
          hallucination_comment: string | null
          id: number
          ocr_job_id: number
          output_vs_ground_truth: number | null
          output_vs_ground_truth_comment: string | null
          table_parsing_capabilities: number | null
          table_parsing_capabilities_comment: string | null
        }
        Insert: {
          created_at?: string
          evaluation_submitted?: boolean
          evaluation_submitted_by: string
          evaluators_overall_comment?: string | null
          format_quality?: number | null
          format_quality_comment?: string | null
          hallucination?: number | null
          hallucination_comment?: string | null
          id?: number
          ocr_job_id: number
          output_vs_ground_truth?: number | null
          output_vs_ground_truth_comment?: string | null
          table_parsing_capabilities?: number | null
          table_parsing_capabilities_comment?: string | null
        }
        Update: {
          created_at?: string
          evaluation_submitted?: boolean
          evaluation_submitted_by?: string
          evaluators_overall_comment?: string | null
          format_quality?: number | null
          format_quality_comment?: string | null
          hallucination?: number | null
          hallucination_comment?: string | null
          id?: number
          ocr_job_id?: number
          output_vs_ground_truth?: number | null
          output_vs_ground_truth_comment?: string | null
          table_parsing_capabilities?: number | null
          table_parsing_capabilities_comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_evaluation_metrics_ocr_job_id_fkey"
            columns: ["ocr_job_id"]
            isOneToOne: false
            referencedRelation: "ocr_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_jobs: {
        Row: {
          created_at: string
          document_id: string
          id: number
          ocr_config: Json
          ocr_model: Database["public"]["Enums"]["ocr_model"]
          ocr_output: string
          page_number: number
          request_id: number
          status: Database["public"]["Enums"]["ocr_status"]
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: number
          ocr_config: Json
          ocr_model: Database["public"]["Enums"]["ocr_model"]
          ocr_output: string
          page_number: number
          request_id: number
          status: Database["public"]["Enums"]["ocr_status"]
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: number
          ocr_config?: Json
          ocr_model?: Database["public"]["Enums"]["ocr_model"]
          ocr_output?: string
          page_number?: number
          request_id?: number
          status?: Database["public"]["Enums"]["ocr_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ocr_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_jobs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ocr_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_requests: {
        Row: {
          created_at: string
          document_id: string
          id: number
          ocr_config: Json
          ocr_model: Database["public"]["Enums"]["ocr_model"]
          page_range: string
          status: Database["public"]["Enums"]["ocr_api_request_status"]
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: number
          ocr_config: Json
          ocr_model: Database["public"]["Enums"]["ocr_model"]
          page_range: string
          status: Database["public"]["Enums"]["ocr_api_request_status"]
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: number
          ocr_config?: Json
          ocr_model?: Database["public"]["Enums"]["ocr_model"]
          page_range?: string
          status?: Database["public"]["Enums"]["ocr_api_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ocr_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_profiles: {
        Row: {
          avatar_name: string | null
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          position_title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ocr_api_request_status: "processing" | "completed" | "error"
      ocr_model: "tesseract" | "marker" | "olmocr" | "smoldocling"
      ocr_status: "pending" | "processing" | "completed" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ocr_api_request_status: ["processing", "completed", "error"],
      ocr_model: ["tesseract", "marker", "olmocr", "smoldocling"],
      ocr_status: ["pending", "processing", "completed", "error"],
    },
  },
} as const
