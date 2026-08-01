export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          color: string
          created_at: string
          description: string
          id: string
          name: string
          position: number
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          position?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          position?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          area_id: string | null
          created_at: string
          ends_at: string | null
          energy_cost: number
          id: string
          notes: string
          starts_at: string
          status: Database["public"]["Enums"]["commitment_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          ends_at?: string | null
          energy_cost?: number
          id?: string
          notes?: string
          starts_at: string
          status?: Database["public"]["Enums"]["commitment_status"]
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          ends_at?: string | null
          energy_cost?: number
          id?: string
          notes?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["commitment_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitments_area_id_user_id_fkey"
            columns: ["area_id", "user_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "commitments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_plan_items: {
        Row: {
          created_at: string
          daily_plan_id: string
          id: string
          item_type: string
          position: number
          priority_id: string | null
          routine_occurrence_id: string | null
          status: Database["public"]["Enums"]["occurrence_status"]
          task_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_plan_id: string
          id?: string
          item_type: string
          position?: number
          priority_id?: string | null
          routine_occurrence_id?: string | null
          status?: Database["public"]["Enums"]["occurrence_status"]
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          daily_plan_id?: string
          id?: string
          item_type?: string
          position?: number
          priority_id?: string | null
          routine_occurrence_id?: string | null
          status?: Database["public"]["Enums"]["occurrence_status"]
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_plan_items_daily_plan_id_user_id_fkey"
            columns: ["daily_plan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "daily_plans"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "daily_plan_items_priority_id_user_id_fkey"
            columns: ["priority_id", "user_id"]
            isOneToOne: false
            referencedRelation: "priorities"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "daily_plan_items_routine_occurrence_id_user_id_fkey"
            columns: ["routine_occurrence_id", "user_id"]
            isOneToOne: false
            referencedRelation: "routine_occurrences"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "daily_plan_items_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "daily_plan_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_plans: {
        Row: {
          capacity_minutes: number
          created_at: string
          id: string
          intention: string
          plan_date: string
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity_minutes?: number
          created_at?: string
          id?: string
          intention?: string
          plan_date: string
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          capacity_minutes?: number
          created_at?: string
          id?: string
          intention?: string
          plan_date?: string
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_checkins: {
        Row: {
          capacity_level: number
          created_at: string
          energy_level: number
          id: string
          impact_note: string
          period: Database["public"]["Enums"]["day_period"]
          recorded_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity_level: number
          created_at?: string
          energy_level: number
          id?: string
          impact_note?: string
          period?: Database["public"]["Enums"]["day_period"]
          recorded_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          capacity_level?: number
          created_at?: string
          energy_level?: number
          id?: string
          impact_note?: string
          period?: Database["public"]["Enums"]["day_period"]
          recorded_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          area_id: string | null
          completed_at: string | null
          created_at: string
          desired_outcome: string
          id: string
          progress: number
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          desired_outcome?: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          desired_outcome?: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_area_id_user_id_fkey"
            columns: ["area_id", "user_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      priorities: {
        Row: {
          area_id: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          effort: number
          goal_id: string | null
          id: string
          impact: number
          position: number
          project_id: string | null
          rationale: string
          status: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at: string
          urgency: number
          user_id: string
        }
        Insert: {
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          effort?: number
          goal_id?: string | null
          id?: string
          impact?: number
          position?: number
          project_id?: string | null
          rationale?: string
          status?: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at?: string
          urgency?: number
          user_id?: string
        }
        Update: {
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          effort?: number
          goal_id?: string | null
          id?: string
          impact?: number
          position?: number
          project_id?: string | null
          rationale?: string
          status?: Database["public"]["Enums"]["record_status"]
          title?: string
          updated_at?: string
          urgency?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "priorities_area_id_user_id_fkey"
            columns: ["area_id", "user_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "priorities_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "priorities_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "priorities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          default_daily_capacity_minutes: number
          display_name: string
          id: string
          onboarding_completed: boolean
          timezone: string
          updated_at: string
          week_starts_on: number
        }
        Insert: {
          created_at?: string
          default_daily_capacity_minutes?: number
          display_name?: string
          id: string
          onboarding_completed?: boolean
          timezone?: string
          updated_at?: string
          week_starts_on?: number
        }
        Update: {
          created_at?: string
          default_daily_capacity_minutes?: number
          display_name?: string
          id?: string
          onboarding_completed?: boolean
          timezone?: string
          updated_at?: string
          week_starts_on?: number
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          created_at: string
          goal_id: string | null
          id: string
          note: string
          progress_delta: number
          project_id: string | null
          recorded_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id?: string | null
          id?: string
          note: string
          progress_delta?: number
          project_id?: string | null
          recorded_on?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          goal_id?: string | null
          id?: string
          note?: string
          progress_delta?: number
          project_id?: string | null
          recorded_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "progress_entries_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "progress_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          area_id: string | null
          created_at: string
          goal_id: string | null
          id: string
          name: string
          outcome: string
          start_date: string | null
          status: Database["public"]["Enums"]["record_status"]
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          goal_id?: string | null
          id?: string
          name: string
          outcome?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          goal_id?: string | null
          id?: string
          name?: string
          outcome?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_area_id_user_id_fkey"
            columns: ["area_id", "user_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "projects_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          adjustments: string
          blockers: string
          completed_at: string | null
          completed_summary: string
          created_at: string
          energy_drains: string
          id: string
          next_priorities: string
          period_end: string
          period_start: string
          review_type: Database["public"]["Enums"]["review_type"]
          stalled_summary: string
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          adjustments?: string
          blockers?: string
          completed_at?: string | null
          completed_summary?: string
          created_at?: string
          energy_drains?: string
          id?: string
          next_priorities?: string
          period_end: string
          period_start: string
          review_type: Database["public"]["Enums"]["review_type"]
          stalled_summary?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          adjustments?: string
          blockers?: string
          completed_at?: string | null
          completed_summary?: string
          created_at?: string
          energy_drains?: string
          id?: string
          next_priorities?: string
          period_end?: string
          period_start?: string
          review_type?: Database["public"]["Enums"]["review_type"]
          stalled_summary?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_occurrences: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string
          occurrence_date: string
          routine_id: string
          status: Database["public"]["Enums"]["occurrence_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string
          occurrence_date: string
          routine_id: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string
          occurrence_date?: string
          routine_id?: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_occurrences_routine_id_user_id_fkey"
            columns: ["routine_id", "user_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "routine_occurrences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          area_id: string | null
          created_at: string
          days_of_week: number[]
          description: string
          estimated_minutes: number
          frequency_type: string
          id: string
          period: Database["public"]["Enums"]["day_period"]
          scheduled_time: string | null
          status: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          days_of_week?: number[]
          description?: string
          estimated_minutes?: number
          frequency_type?: string
          id?: string
          period?: Database["public"]["Enums"]["day_period"]
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          days_of_week?: number[]
          description?: string
          estimated_minutes?: number
          frequency_type?: string
          id?: string
          period?: Database["public"]["Enums"]["day_period"]
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_area_id_user_id_fkey"
            columns: ["area_id", "user_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_events: {
        Row: {
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["task_status"] | null
          id: string
          note: string
          task_id: string
          to_status: Database["public"]["Enums"]["task_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: string
          note?: string
          task_id: string
          to_status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: string
          note?: string
          task_id?: string
          to_status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_events_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "task_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          area_id: string | null
          blocked_reason: string
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          due_date: string | null
          estimated_minutes: number | null
          goal_id: string | null
          id: string
          notes: string
          priority_id: string | null
          project_id: string | null
          recurrence_rule: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          blocked_reason?: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string
          priority_id?: string | null
          project_id?: string | null
          recurrence_rule?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          area_id?: string | null
          blocked_reason?: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string
          priority_id?: string | null
          project_id?: string | null
          recurrence_rule?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_area_id_user_id_fkey"
            columns: ["area_id", "user_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_priority_id_user_id_fkey"
            columns: ["priority_id", "user_id"]
            isOneToOne: false
            referencedRelation: "priorities"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      commitment_status: "scheduled" | "completed" | "cancelled"
      day_period: "morning" | "afternoon" | "evening" | "flexible"
      goal_status: "planned" | "active" | "paused" | "completed" | "cancelled"
      occurrence_status: "pending" | "completed" | "skipped"
      record_status: "active" | "paused" | "completed" | "cancelled"
      review_status: "draft" | "completed"
      review_type: "daily" | "weekly" | "monthly"
      task_status:
        | "inbox"
        | "planned"
        | "in_progress"
        | "blocked"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      commitment_status: ["scheduled", "completed", "cancelled"],
      day_period: ["morning", "afternoon", "evening", "flexible"],
      goal_status: ["planned", "active", "paused", "completed", "cancelled"],
      occurrence_status: ["pending", "completed", "skipped"],
      record_status: ["active", "paused", "completed", "cancelled"],
      review_status: ["draft", "completed"],
      review_type: ["daily", "weekly", "monthly"],
      task_status: [
        "inbox",
        "planned",
        "in_progress",
        "blocked",
        "completed",
        "cancelled",
      ],
    },
  },
} as const

