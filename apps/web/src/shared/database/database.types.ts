
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "public": {
          Tables: {
            "analysis_runs": {
                  Row: {
                    "created_at": string,"feature_schema_version": string,"id": string,"method": string,"model_version_id": string | null,"owner_id": string,"quality_warnings": NonNullable<Json>,"recording_id": string,"solve_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"feature_schema_version": string,"id"?: string,"method": string,"model_version_id"?: string | null,"owner_id": string,"quality_warnings"?: NonNullable<Json>,"recording_id": string,"solve_id": string
                  }
                  Update: {
                    "created_at"?: string,"feature_schema_version"?: string,"id"?: string,"method"?: string,"model_version_id"?: string | null,"owner_id"?: string,"quality_warnings"?: NonNullable<Json>,"recording_id"?: string,"solve_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "analysis_runs_model_owner_feature_fk"
      columns: ["owner_id","model_version_id","feature_schema_version"]
isOneToOne: false
      referencedRelation: "model_versions"
      referencedColumns: ["owner_id","id","feature_schema_version"]
    },{
      foreignKeyName: "analysis_runs_recording_solve_owner_fk"
      columns: ["owner_id","recording_id","solve_id"]
isOneToOne: false
      referencedRelation: "recordings"
      referencedColumns: ["owner_id","id","solve_id"]
    }
                  ]
                },"analysis_segments": {
                  Row: {
                    "analysis_run_id": string,"confidence": number | null,"created_at": string,"end_ms": number,"id": string,"label": string,"owner_id": string,"recording_id": string,"start_ms": number
                  }
                  ComputedFields: never
                  Insert: {
                    "analysis_run_id": string,"confidence"?: number | null,"created_at"?: string,"end_ms": number,"id"?: string,"label": string,"owner_id": string,"recording_id": string,"start_ms": number
                  }
                  Update: {
                    "analysis_run_id"?: string,"confidence"?: number | null,"created_at"?: string,"end_ms"?: number,"id"?: string,"label"?: string,"owner_id"?: string,"recording_id"?: string,"start_ms"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "analysis_segments_run_recording_owner_fk"
      columns: ["owner_id","analysis_run_id","recording_id"]
isOneToOne: false
      referencedRelation: "analysis_runs"
      referencedColumns: ["owner_id","id","recording_id"]
    }
                  ]
                },"annotations": {
                  Row: {
                    "created_at": string,"dataset_id": string | null,"end_ms": number,"id": string,"label": string,"owner_id": string,"recording_id": string,"start_ms": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"dataset_id"?: string | null,"end_ms": number,"id"?: string,"label": string,"owner_id": string,"recording_id": string,"start_ms": number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"dataset_id"?: string | null,"end_ms"?: number,"id"?: string,"label"?: string,"owner_id"?: string,"recording_id"?: string,"start_ms"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "annotations_dataset_owner_fk"
      columns: ["owner_id","dataset_id"]
isOneToOne: false
      referencedRelation: "dataset_metadata"
      referencedColumns: ["owner_id","id"]
    },{
      foreignKeyName: "annotations_recording_owner_fk"
      columns: ["owner_id","recording_id"]
isOneToOne: false
      referencedRelation: "recordings"
      referencedColumns: ["owner_id","id"]
    }
                  ]
                },"dataset_metadata": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"name": string,"owner_id": string,"schema_version": number,"version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name": string,"owner_id": string,"schema_version": number,"version": string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name"?: string,"owner_id"?: string,"schema_version"?: number,"version"?: string
                  }
                  Relationships: [

                  ]
                },"experiment_runs": {
                  Row: {
                    "code_version": string,"config_json": NonNullable<Json>,"config_schema_version": number,"created_at": string,"dataset_id": string,"id": string,"method": string,"metrics_json": NonNullable<Json>,"metrics_schema_version": number,"model_version_id": string | null,"owner_id": string,"random_seed": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code_version": string,"config_json": NonNullable<Json>,"config_schema_version": number,"created_at"?: string,"dataset_id": string,"id"?: string,"method": string,"metrics_json": NonNullable<Json>,"metrics_schema_version": number,"model_version_id"?: string | null,"owner_id": string,"random_seed"?: number | null
                  }
                  Update: {
                    "code_version"?: string,"config_json"?: NonNullable<Json>,"config_schema_version"?: number,"created_at"?: string,"dataset_id"?: string,"id"?: string,"method"?: string,"metrics_json"?: NonNullable<Json>,"metrics_schema_version"?: number,"model_version_id"?: string | null,"owner_id"?: string,"random_seed"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "experiment_runs_dataset_owner_fk"
      columns: ["owner_id","dataset_id"]
isOneToOne: false
      referencedRelation: "dataset_metadata"
      referencedColumns: ["owner_id","id"]
    },{
      foreignKeyName: "experiment_runs_model_owner_fk"
      columns: ["owner_id","model_version_id"]
isOneToOne: false
      referencedRelation: "model_versions"
      referencedColumns: ["owner_id","id"]
    }
                  ]
                },"model_versions": {
                  Row: {
                    "created_at": string,"feature_schema_version": string,"id": string,"manifest_json": NonNullable<Json>,"manifest_sha256": string,"name": string,"owner_id": string,"version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"feature_schema_version": string,"id"?: string,"manifest_json": NonNullable<Json>,"manifest_sha256": string,"name": string,"owner_id": string,"version": string
                  }
                  Update: {
                    "created_at"?: string,"feature_schema_version"?: string,"id"?: string,"manifest_json"?: NonNullable<Json>,"manifest_sha256"?: string,"name"?: string,"owner_id"?: string,"version"?: string
                  }
                  Relationships: [

                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"display_name": string | null,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name"?: string | null,"id": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string | null,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"recordings": {
                  Row: {
                    "consented_at": string | null,"created_at": string,"deleted_at": string | null,"duration_ms": number,"height": number | null,"id": string,"mime_type": string,"owner_id": string,"size_bytes": number | null,"solve_id": string | null,"storage_path": string | null,"timer_start_offset_ms": number,"updated_at": string,"uploaded_at": string | null,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "consented_at"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"duration_ms": number,"height"?: number | null,"id"?: string,"mime_type": string,"owner_id": string,"size_bytes"?: number | null,"solve_id"?: string | null,"storage_path"?: string | null,"timer_start_offset_ms"?: number,"updated_at"?: string,"uploaded_at"?: string | null,"width"?: number | null
                  }
                  Update: {
                    "consented_at"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"duration_ms"?: number,"height"?: number | null,"id"?: string,"mime_type"?: string,"owner_id"?: string,"size_bytes"?: number | null,"solve_id"?: string | null,"storage_path"?: string | null,"timer_start_offset_ms"?: number,"updated_at"?: string,"uploaded_at"?: string | null,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "recordings_solve_owner_fk"
      columns: ["owner_id","solve_id"]
isOneToOne: false
      referencedRelation: "solves"
      referencedColumns: ["owner_id","id"]
    }
                  ]
                },"scrambles": {
                  Row: {
                    "created_at": string,"generation_method": string | null,"generator_provider": string | null,"generator_version": string,"id": string,"notation": string,"owner_id": string,"puzzle": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"generation_method"?: string | null,"generator_provider"?: string | null,"generator_version": string,"id"?: string,"notation": string,"owner_id": string,"puzzle": string
                  }
                  Update: {
                    "created_at"?: string,"generation_method"?: string | null,"generator_provider"?: string | null,"generator_version"?: string,"id"?: string,"notation"?: string,"owner_id"?: string,"puzzle"?: string
                  }
                  Relationships: [

                  ]
                },"sessions": {
                  Row: {
                    "created_at": string,"id": string,"is_archived": boolean,"name": string,"owner_id": string,"puzzle": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_archived"?: boolean,"name": string,"owner_id": string,"puzzle": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_archived"?: boolean,"name"?: string,"owner_id"?: string,"puzzle"?: string,"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"solves": {
                  Row: {
                    "completed_at": string,"created_at": string,"id": string,"inspection_ms": number | null,"notes": string | null,"owner_id": string,"penalty": string,"puzzle": string,"raw_time_ms": number,"scramble_id": string,"session_id": string,"started_at": string,"timing_source": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at": string,"created_at"?: string,"id"?: string,"inspection_ms"?: number | null,"notes"?: string | null,"owner_id": string,"penalty"?: string,"puzzle": string,"raw_time_ms": number,"scramble_id": string,"session_id": string,"started_at": string,"timing_source": string,"updated_at"?: string
                  }
                  Update: {
                    "completed_at"?: string,"created_at"?: string,"id"?: string,"inspection_ms"?: number | null,"notes"?: string | null,"owner_id"?: string,"penalty"?: string,"puzzle"?: string,"raw_time_ms"?: number,"scramble_id"?: string,"session_id"?: string,"started_at"?: string,"timing_source"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "solves_scramble_owner_puzzle_fk"
      columns: ["owner_id","scramble_id","puzzle"]
isOneToOne: false
      referencedRelation: "scrambles"
      referencedColumns: ["owner_id","id","puzzle"]
    },{
      foreignKeyName: "solves_session_owner_puzzle_fk"
      columns: ["owner_id","session_id","puzzle"]
isOneToOne: false
      referencedRelation: "sessions"
      referencedColumns: ["owner_id","id","puzzle"]
    }
                  ]
                },"user_settings": {
                  Row: {
                    "created_at": string,"settings_json": NonNullable<Json>,"settings_version": number,"theme": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"settings_json"?: NonNullable<Json>,"settings_version"?: number,"theme"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"settings_json"?: NonNullable<Json>,"settings_version"?: number,"theme"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [

                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {

          }
        }
} as const
