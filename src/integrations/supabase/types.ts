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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      body_metrics: {
        Row: {
          arm: number | null
          body_fat_percentage: number | null
          chest: number | null
          created_at: string
          customer_id: string
          hips: number | null
          id: string
          measurement_date: string
          muscle_mass: number | null
          notes: string | null
          thigh: number | null
          waist: number | null
          weight: number | null
        }
        Insert: {
          arm?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          created_at?: string
          customer_id: string
          hips?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          notes?: string | null
          thigh?: number | null
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arm?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          created_at?: string
          customer_id?: string
          hips?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          notes?: string | null
          thigh?: number | null
          waist?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_metrics_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
        }
        Insert: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          amount: number
          category: string
          cost_date: string
          created_at: string
          description: string | null
          id: string
          notes: string | null
          personnel_id: string | null
        }
        Insert: {
          amount: number
          category: string
          cost_date?: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          personnel_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          cost_date?: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          personnel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "costs_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          first_name: string
          gender: string | null
          group_number: number | null
          id: string
          is_active: boolean
          last_name: string
          membership_end_date: string | null
          membership_package_id: string | null
          membership_start_date: string | null
          notes: string | null
          phone: string | null
          time_slot: string | null
          total_debt: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          gender?: string | null
          group_number?: number | null
          id?: string
          is_active?: boolean
          last_name: string
          membership_end_date?: string | null
          membership_package_id?: string | null
          membership_start_date?: string | null
          notes?: string | null
          phone?: string | null
          time_slot?: string | null
          total_debt?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          gender?: string | null
          group_number?: number | null
          id?: string
          is_active?: boolean
          last_name?: string
          membership_end_date?: string | null
          membership_package_id?: string | null
          membership_start_date?: string | null
          notes?: string | null
          phone?: string | null
          time_slot?: string | null
          total_debt?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_membership_package_id_fkey"
            columns: ["membership_package_id"]
            isOneToOne: false
            referencedRelation: "membership_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      group_schedules: {
        Row: {
          created_at: string
          customer_id: string
          customer_name: string
          group_type: string
          id: string
          is_active: boolean
          start_date: string
          time_slot: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_name: string
          group_type: string
          id?: string
          is_active?: boolean
          start_date?: string
          time_slot: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_name?: string
          group_type?: string
          id?: string
          is_active?: boolean
          start_date?: string
          time_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_packages: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          is_paid: boolean
          notes: string | null
          payment_date: string
          payment_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          payment_date?: string
          payment_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          payment_date?: string
          payment_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel: {
        Row: {
          commission_rate: number | null
          created_at: string
          email: string | null
          first_name: string
          hire_date: string | null
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          role: string | null
          salary: number | null
          updated_at: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          role?: string | null
          salary?: number | null
          updated_at?: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          role?: string | null
          salary?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          min_stock_level: number | null
          name: string
          purchase_price: number
          sale_price: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock_level?: number | null
          name: string
          purchase_price: number
          sale_price: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock_level?: number | null
          name?: string
          purchase_price?: number
          sale_price?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          personnel_id: string | null
          product_id: string | null
          quantity: number
          sale_date: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          personnel_id?: string | null
          product_id?: string | null
          quantity?: number
          sale_date?: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          personnel_id?: string | null
          product_id?: string | null
          quantity?: number
          sale_date?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      service_sales: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          personnel_id: string | null
          price: number
          sale_date: string
          service_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          personnel_id?: string | null
          price: number
          sale_date?: string
          service_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          personnel_id?: string | null
          price?: number
          sale_date?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_sales_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_sales_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
